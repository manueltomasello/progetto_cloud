import { Request, Response } from 'express';
import { connection, RowDataPacket } from '../utils/db';

export async function delayOperazioni(req: Request, res: Response) {
    const conn = await connection.promise().getConnection();
    try {
        const [results] = await conn.query(`
            SELECT
                ROUND((SUM(CASE WHEN DataIntEff > DataIntPrev THEN 1 ELSE 0 END) * 100.0) /
                      COUNT(*), 2) AS percentualeRitardo,
                ROUND(100.0 - (SUM(CASE WHEN DataIntEff > DataIntPrev THEN 1 ELSE 0 END) * 100.0) /
                      COUNT(*), 2) AS PercentualePuntualita
              FROM interventi
             WHERE DataIntEff IS NOT NULL AND DataIntPrev IS NOT NULL;
        `);
        res.json(results);
    } catch (err: any) {
        console.error("ERRORE QUERY:", err);
        res.status(500).json({
            message: 'Errore interno nel recupero dati',
            error: err.message,
        });
    } finally {
        if (conn) conn.release();
    }
}

export async function ConsCostoRisorsa(req: Request, res: Response) {
    const conn = await connection.promise().getConnection();
    try {
        const [results] = await conn.query(`
            WITH FatturePerIntervento AS (
                SELECT IntId, SUM(ImpFatt) AS TotaleFatture
                  FROM fatture
                 GROUP BY IntId
            ),
            SommaCostoOrarioOperatori AS (
                SELECT id.IntId, SUM(o.CostoOrario) AS TotaleCostoOrarioOperatori
                  FROM interventi_dipendenti id
                  JOIN operatore o ON id.IdDip = o.IdDip
                 GROUP BY id.IntId
            )
            SELECT
                r.NomeRisorsa AS NomeRisorsa,
                r.ModMacc     AS ModMacc,
                SUM(
                    CASE
                        WHEN ie.IntId IS NOT NULL THEN COALESCE(fpi.TotaleFatture, 0)
                        ELSE COALESCE(
                                 sco.TotaleCostoOrarioOperatori *
                                 (CASE WHEN i.ManId = 0 THEN i.TmpInt ELSE m.DurataSTAT END),
                                 0
                             )
                    END
                ) AS CostoTotale
            FROM interventi i
            LEFT JOIN interventi_esterni ie ON i.IntId = ie.IntId
            LEFT JOIN manutenzioni m        ON m.ManId = i.ManId
            LEFT JOIN risorsa r ON r.NomeRisorsa =
                        CASE WHEN i.ManId = 0 THEN i.NomeRisorsaInt
                             ELSE m.MaccIdMan
                        END
            LEFT JOIN FatturePerIntervento     fpi ON i.IntId = fpi.IntId
            LEFT JOIN SommaCostoOrarioOperatori sco ON i.IntId = sco.IntId
            GROUP BY r.NomeRisorsa, r.ModMacc
            ORDER BY CostoTotale DESC;
        `);

        res.json(results);
    } catch (err: any) {
        console.error("ERRORE QUERY Costo Risorsa:", err);
        res.status(500).json({
            message: 'Errore interno nel recupero dati, contattare Amministratore di Sistema',
            error: err.message,
        });
    } finally {
        if (conn) conn.release();
    }
}

export async function ConsStoricoRicambi(req: Request, res: Response) {
    const conn = await connection.promise().getConnection();
    try {
        const [results] = await conn.query(`
            SELECT
                i.IntId          AS InterventoID,
                ac.NomeArt       AS Articolo,
                ac.DescArtBreve  AS DescrizioneArticolo,
                ia.qta           AS Quantita,
                ac.Udm           AS Unita,
                ia.ArtId         AS ArticoloID
              FROM interventi_articoli ia
              JOIN interventi i              ON ia.IntId = i.IntId
              JOIN articoli_consumabili ac   ON ia.ArtId = ac.Articolo
             ORDER BY i.DataIntEff DESC
        `);

        res.json(results);
    } catch (err: any) {
        res.status(500).json({ message: 'Errore nel recupero dati', error: err.message });
    } finally {
        if (conn) conn.release();
    }
}

export async function ConsStoricoInterventi(req: Request, res: Response) {
    const conn = await connection.promise().getConnection();
    try {
        // SQL Server: STRING_AGG al posto di GROUP_CONCAT(... SEPARATOR ', ')
        const [results] = await conn.query(`
            WITH AggregatedOperatori AS (
                SELECT
                    id.IntId,
                    STRING_AGG(o.NomeDip + N' ' + o.CognDip, N', ') AS OperatoriCoinvolti
                  FROM interventi_dipendenti id
                  JOIN operatore o ON id.IdDip = o.IdDip
                 GROUP BY id.IntId
            )
            SELECT i.IntId AS InterventoID,
                CASE WHEN i.ManId > 0 THEN r_man.NomeRisorsa ELSE i.NomeRisorsaInt END AS Risorsa,
                CASE WHEN i.ManId > 0 THEN r_man.ModMacc     ELSE r_num.ModMacc    END AS Modello,
                COALESCE(i.DataIntPrev, NULL) AS DataPianificata,
                COALESCE(i.TmpInt, NULL)      AS TempoEseguito,
                ao.OperatoriCoinvolti         AS OperatoreCoinvolto,
                fe.RagSoc                     AS AziendaCoinvolta,
                i.EsitoMan                    AS EsitoManutenzione,
                COALESCE(c.Descrizione, N'Nessun Guasto') AS TipoGuasto,
                COALESCE(i.TipoGuastoId, 0)               AS TipoGuastoId,
                COALESCE(f.ImpFatt, 0)                    AS importo
            FROM interventi i
            LEFT JOIN fatture f      ON i.IntId    = f.IntId
            LEFT JOIN manutenzioni m ON m.ManId    = i.ManId AND i.ManId > 0
            LEFT JOIN risorsa r_man  ON m.MaccIdMan        = r_man.NomeRisorsa
            LEFT JOIN risorsa r_num  ON i.NomeRisorsaInt   = r_num.NomeRisorsa AND i.ManId = 0
            LEFT JOIN AggregatedOperatori ao ON i.IntId    = ao.IntId
            LEFT JOIN interventi_esterni ie  ON i.IntId    = ie.IntId
            LEFT JOIN fornitore fe           ON ie.IdFornitore = fe.IdFornitore
            LEFT JOIN cause_guasto c         ON i.TipoGuastoId  = c.IdGuasto
            ORDER BY i.IntId DESC
        `);

        res.json(results);
    } catch (err: any) {
        console.error("ERRORE QUERY ConsStoricoInterventi:", err);
        res.status(500).json({ message: 'Errore interno nel recupero dati', error: err.message });
    } finally {
        if (conn) conn.release();
    }
}

export async function ConsumoComponenti(req: Request, res: Response) {
    const conn = await connection.promise().getConnection();
    try {
        const [results] = await conn.query(`
            SELECT
                SUM(ia.qta)       AS quantitaConsumata,
                ac.NomeArt        AS NomeArt,
                ac.DescArtBreve   AS descArtBreve
              FROM interventi_articoli ia
              LEFT JOIN articoli_consumabili ac ON ia.ArtId = ac.Articolo
              LEFT JOIN interventi i             ON i.IntId  = ia.IntId
             GROUP BY ac.Articolo, ac.NomeArt, ac.DescArtBreve
             ORDER BY quantitaConsumata DESC
        `);

        res.json(results);
    } catch (err: any) {
        res.status(500).json({ message: 'Errore nel recupero dei dati', error: err.message });
    } finally {
        if (conn) conn.release();
    }
}

export async function OrelavoratePerDip(req: Request, res: Response) {
    const conn = await connection.promise().getConnection();
    try {
        const [results] = await conn.query(`
            SELECT
                o.IdDip,
                o.Matricola,
                o.NomeDip,
                o.CognDip,
                SUM(COALESCE(i.TmpInt, 0) + COALESCE(m.DurataSTAT, 0)) AS OreLavorate
              FROM operatore o
              JOIN interventi_dipendenti id ON o.IdDip = id.IdDip
              JOIN interventi i             ON id.IntId = i.IntId
              LEFT JOIN manutenzioni m      ON i.ManId  = m.ManId
             WHERE i.EsitoMan = 1
             GROUP BY o.IdDip, o.Matricola, o.NomeDip, o.CognDip
             ORDER BY OreLavorate DESC
        `);

        res.json(results);
    } catch (err: any) {
        res.status(500).json({ message: 'Errore nel recupero dei dati', error: err.message });
    } finally {
        if (conn) conn.release();
    }
}

export async function OrelavoratePerRis(req: Request, res: Response) {
    const conn = await connection.promise().getConnection();
    try {
        const [results] = await conn.query(`
            SELECT
                CASE WHEN i.ManId > 0 THEN r_man.NomeRisorsa ELSE i.NomeRisorsaInt END AS Risorsa,
                CASE WHEN i.ManId > 0 THEN r_man.ModMacc     ELSE r_num.ModMacc    END AS Modello,
                SUM(COALESCE(i.TmpInt, 0) + COALESCE(m.DurataSTAT, 0)) AS OreLavorate
              FROM interventi i
              LEFT JOIN manutenzioni m ON i.ManId         = m.ManId
              LEFT JOIN risorsa r_man  ON m.MaccIdMan     = r_man.NomeRisorsa
              LEFT JOIN risorsa r_num  ON i.NomeRisorsaInt = r_num.NomeRisorsa AND i.ManId = 0
             WHERE i.EsitoMan = 1
             GROUP BY
                CASE WHEN i.ManId > 0 THEN r_man.NomeRisorsa ELSE i.NomeRisorsaInt END,
                CASE WHEN i.ManId > 0 THEN r_man.ModMacc     ELSE r_num.ModMacc    END
             ORDER BY OreLavorate DESC
        `);

        res.json(results);
    } catch (err: any) {
        res.status(500).json({ message: 'Errore nel recupero dei dati', error: err.message });
    } finally {
        if (conn) conn.release();
    }
}

export async function ConsInterventiRitardo(req: Request, res: Response) {
    const conn = await connection.promise().getConnection();
    try {
        const [results] = await conn.query<RowDataPacket[]>(
            `SELECT i.IntId, i.DataIntPrev
               FROM interventi i
              WHERE i.ValidataMan = 0
                AND i.DataIntPrev < CAST(GETDATE() AS DATE)
                AND i.DataIntEff > i.DataIntPrev
              ORDER BY DataIntPrev ASC`
        );
        res.json(results);
    } catch (error) {
        console.error("Errore nel recupero degli interventi scaduti non validati:", error);
        res.status(500).json({ message: 'Errore nel recupero degli interventi scaduti non validati', error });
    } finally {
        conn.release();
    }
}

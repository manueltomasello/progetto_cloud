import { Request, Response } from 'express';
import { connection } from '../utils/db';

/**
 * Recupera tutti gli interventi e aggrega in JSON i dipendenti, i fornitori
 * esterni e gli articoli usati.
 *
 * MariaDB usava JSON_ARRAYAGG / JSON_OBJECT. In SQL Server usiamo:
 *  - STRING_AGG per gli array di scalari (IdDip, IdFornitore)
 *  - FOR JSON PATH per gli array di oggetti (ArtId/qta)
 */
export async function getInterventi(req: Request, res: Response) {
    const conn = await connection.promise().getConnection();
    try {
        const query = `
            SELECT
                i.*,
                (SELECT STRING_AGG(CAST(d.IdDip AS NVARCHAR(20)), ',')
                   FROM interventi_dipendenti d
                  WHERE d.IntId = i.IntId)                                                         AS DipendentiCsv,
                (SELECT STRING_AGG(e.IdFornitore, ',')
                   FROM interventi_esterni e
                  WHERE e.IntId = i.IntId)                                                         AS FornitoriCsv,
                (SELECT a.ArtId, a.qta
                   FROM interventi_articoli a
                  WHERE a.IntId = i.IntId
                  FOR JSON PATH)                                                                   AS ArticoliUsatiJson
            FROM interventi i
            ORDER BY i.IntId DESC;
        `;

        const [results] = await conn.query<any[]>(query);

        const finalResults = results.map((row: any) => {
            const dipendenti = row.DipendentiCsv
                ? row.DipendentiCsv.split(',').filter(Boolean).map((s: string) => Number(s))
                : [];
            const fornitori = row.FornitoriCsv
                ? row.FornitoriCsv.split(',').filter(Boolean)
                : [];
            const articoli = row.ArticoliUsatiJson ? JSON.parse(row.ArticoliUsatiJson) : [];

            delete row.DipendentiCsv;
            delete row.FornitoriCsv;
            delete row.ArticoliUsatiJson;

            return {
                ...row,
                Dipendenti: dipendenti,
                FornitoriEsterni: fornitori,
                ArticoliUsati: articoli,
            };
        });

        res.json(finalResults);

    } catch (err: any) {
        console.error("Errore nel recupero degli interventi con JSON:", err);
        res.status(500).json({
            message: 'Errore nel recupero degli interventi',
            error: err.message
        });
    } finally {
        conn.release();
    }
}

export async function getInterventiEsterni(req: Request, res: Response) {
    const conn = await connection.promise().getConnection();
    try {
        const [results] = await conn.query(
            `SELECT i.IntId
             FROM interventi i
             LEFT JOIN interventi_esterni ie ON i.IntId = ie.IntId
             WHERE ie.IdFornitore IS NOT NULL
             ORDER BY i.IntId DESC`
        );
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Errore', error: err });
    } finally {
        conn.release();
    }
}

export async function createIntervento(req: Request, res: Response) {
    const {
        ManId, NomeRisorsaInt, DataIntPrev, DataIntEff, TmpInt, EsitoMan, noteIntervento, TipoGuastoId,
        Dipendenti, FornitoriEsterni, ArticoliUsati,
    } = req.body;
    const conn = await connection.promise().getConnection();

    try {
        const year = new Date().getFullYear().toString().slice(-2);

        // SQL Server: TOP 1 al posto di LIMIT 1
        const [lastIdResult] = await conn.query(
            'SELECT TOP 1 IntId FROM interventi WHERE IntId LIKE ? ORDER BY IntId DESC',
            [`INT-${year}-%`]
        );

        let newProgressivo = '00001';
        if ((lastIdResult as any[]).length > 0) {
            const lastId = (lastIdResult as any)[0].IntId;
            const lastNumber = parseInt(lastId.split('-')[2], 10);
            newProgressivo = (lastNumber + 1).toString().padStart(5, '0');
        }

        const newIntId = `INT-${year}-${newProgressivo}`;

        await conn.execute(
            `INSERT INTO interventi (
                IntId, ManId, NomeRisorsaInt, DataIntPrev, DataIntEff, OraInizio, OraFine, TmpInt,
                EsitoMan, noteIntervento, TipoGuastoId, OriginInt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newIntId,
                ManId,
                NomeRisorsaInt,
                DataIntPrev,
                DataIntEff || null,
                '08:00:00',
                '12:00:00',
                TmpInt || null,
                EsitoMan ? 1 : 0,
                noteIntervento || null,
                TipoGuastoId || null,
                0
            ]
        );

        if (Dipendenti?.length > 0) {
            const dipendentiValues = Dipendenti.map((dipId: number) => [newIntId, dipId]);
            await conn.query(
                'INSERT INTO interventi_dipendenti (IntId, IdDip) VALUES ?',
                [dipendentiValues]
            );
        }

        if (FornitoriEsterni?.length > 0) {
            const fornitoriValues = FornitoriEsterni.map((fornId: string) => [newIntId, fornId]);
            await conn.query(
                'INSERT INTO interventi_esterni (IntId, IdFornitore) VALUES ?',
                [fornitoriValues]
            );
        }

        if (ArticoliUsati?.length > 0) {
            const articoliValues = ArticoliUsati.map(
                (articolo: { ArtId: number, qta: number }) => [newIntId, articolo.ArtId, articolo.qta]
            );
            await conn.query(
                'INSERT INTO interventi_articoli (IntId, ArtId, qta) VALUES ?',
                [articoliValues]
            );
        }

        res.status(201).json({
            message: 'Intervento creato con successo',
            IntId: newIntId,
        });

    } catch (error: any) {
        console.error('Errore durante la creazione intervento:', error);
        res.status(500).json({
            message: 'Errore nel processo di creazione',
            error: error.message,
            details: error.originalError?.info?.message ?? error.message,
        });
    } finally {
        conn.release();
    }
}

export async function updateIntervento(req: Request, res: Response) {
    const { id } = req.params;
    const {
        ManId,
        NomeRisorsaInt,
        DataIntPrev,
        DataIntEff,
        TmpInt,
        EsitoMan,
        noteIntervento,
        TipoGuastoId,
        Dipendenti,
        FornitoriEsterni,
        ArticoliUsati,
    } = req.body;
    const conn = await connection.promise().getConnection();

    try {
        await conn.beginTransaction();

        await conn.query(
            `UPDATE interventi SET
                ManId          = COALESCE(?, ManId),
                NomeRisorsaInt = COALESCE(?, NomeRisorsaInt),
                DataIntPrev    = COALESCE(?, DataIntPrev),
                DataIntEff     = COALESCE(?, DataIntEff),
                TmpInt         = COALESCE(?, TmpInt),
                EsitoMan       = COALESCE(?, EsitoMan),
                noteIntervento = COALESCE(?, noteIntervento),
                TipoGuastoId   = COALESCE(?, TipoGuastoId)
            WHERE IntId = ?`,
            [
                ManId ?? null,
                NomeRisorsaInt ?? null,
                DataIntPrev ?? null,
                DataIntEff || null,
                TmpInt || null,
                EsitoMan !== undefined ? (EsitoMan ? 1 : 0) : null,
                noteIntervento ?? null,
                TipoGuastoId ?? null,
                id
            ]
        );

        if (Dipendenti !== undefined) {
            await conn.query('DELETE FROM interventi_dipendenti WHERE IntId = ?', [id]);
            if (Array.isArray(Dipendenti) && Dipendenti.length > 0) {
                const dipendentiValues = Dipendenti
                    .filter((dipId: any) => dipId != null && Number(dipId) > 0)
                    .map((dipId: any) => [id, Number(dipId)]);
                if (dipendentiValues.length > 0) {
                    await conn.query('INSERT INTO interventi_dipendenti (IntId, IdDip) VALUES ?', [dipendentiValues]);
                }
            }
        }

        if (ArticoliUsati !== undefined) {
            await conn.query('DELETE FROM interventi_articoli WHERE IntId = ?', [id]);
            if (Array.isArray(ArticoliUsati) && ArticoliUsati.length > 0) {
                const articoliValues = ArticoliUsati
                    .filter((a: any) => a != null && a.ArtId != null && Number(a.ArtId) > 0 && a.qta != null && Number(a.qta) > 0)
                    .map((a: any) => [id, Number(a.ArtId), Number(a.qta)]);
                if (articoliValues.length > 0) {
                    await conn.query('INSERT INTO interventi_articoli (IntId, ArtId, qta) VALUES ?', [articoliValues]);
                }
            }
        }

        if (FornitoriEsterni !== undefined) {
            await conn.query('DELETE FROM interventi_esterni WHERE IntId = ?', [id]);
            if (Array.isArray(FornitoriEsterni) && FornitoriEsterni.length > 0) {
                const fornitoriValues = FornitoriEsterni
                    .filter((fornId: any) => fornId != null && String(fornId).trim() !== '')
                    .map((fornId: any) => [id, String(fornId).trim()]);
                if (fornitoriValues.length > 0) {
                    await conn.query('INSERT INTO interventi_esterni (IntId, IdFornitore) VALUES ?', [fornitoriValues]);
                }
            }
        }

        await conn.commit();
        res.status(200).json({ message: 'Intervento aggiornato con successo' });

    } catch (error: any) {
        await conn.rollback();
        console.error("Errore durante l'aggiornamento dell'intervento:", error);
        res.status(500).json({
            message: "Errore durante l'aggiornamento dell'intervento.",
        });
    } finally {
        conn.release();
    }
}

export async function deleteIntervento(req: Request, res: Response) {
    const { id } = req.params;
    const conn = await connection.promise().getConnection();

    try {
        const [checkResult]: any = await conn.query(
            'SELECT IntId FROM interventi WHERE IntId = ?',
            [id]
        );

        if (checkResult.length === 0) {
            res.status(404).json({ message: 'Intervento non trovato' });
            conn.release();
            return;
        }

        await conn.beginTransaction();

        await conn.execute('DELETE FROM interventi_dipendenti WHERE IntId = ?', [id]);
        await conn.execute('DELETE FROM interventi_esterni    WHERE IntId = ?', [id]);
        await conn.execute('DELETE FROM interventi_articoli   WHERE IntId = ?', [id]);
        await conn.execute('DELETE FROM fatture                WHERE IntId = ?', [id]);

        const [deleteResult]: any = await conn.execute(
            'DELETE FROM interventi WHERE IntId = ?',
            [id]
        );

        if (deleteResult.affectedRows === 0) {
            await conn.rollback();
            res.status(404).json({ message: 'Intervento non trovato' });
            conn.release();
            return;
        }

        await conn.commit();
        res.json({ message: 'Intervento eliminato con successo' });

    } catch (error: any) {
        try {
            await conn.rollback();
        } catch (rollbackError) {
            console.error('Rollback fallito:', rollbackError);
        }
        res.status(500).json({ message: "Errore nell'eliminazione", error: error.message });
    } finally {
        conn.release();
    }
}

export async function getInterventoById(req: Request, res: Response) {
    const interventoId = req.params.id as string;

    if (!interventoId) {
        return res.status(400).json({ message: 'ID intervento mancante.' });
    }

    const conn = await connection.promise().getConnection();
    try {
        const query = `
            SELECT
                i.*,
                (SELECT STRING_AGG(CAST(d.IdDip AS NVARCHAR(20)), ',')
                   FROM interventi_dipendenti d
                  WHERE d.IntId = i.IntId)                                                         AS DipendentiCsv,
                (SELECT STRING_AGG(e.IdFornitore, ',')
                   FROM interventi_esterni e
                  WHERE e.IntId = i.IntId)                                                         AS FornitoriCsv,
                (SELECT a.ArtId, a.qta
                   FROM interventi_articoli a
                  WHERE a.IntId = i.IntId
                  FOR JSON PATH)                                                                   AS ArticoliUsatiJson
            FROM interventi i
            WHERE i.IntId = ?;
        `;

        const [results] = await conn.query<any[]>(query, [interventoId]);

        if (results.length === 0) {
            return res.status(404).json({ message: `Intervento con ID ${interventoId} non trovato.` });
        }

        const rawIntervento: any = results[0];
        const dipendenti = rawIntervento.DipendentiCsv
            ? rawIntervento.DipendentiCsv.split(',').filter(Boolean).map((s: string) => Number(s))
            : [];
        const fornitori = rawIntervento.FornitoriCsv
            ? rawIntervento.FornitoriCsv.split(',').filter(Boolean)
            : [];
        const articoli = rawIntervento.ArticoliUsatiJson ? JSON.parse(rawIntervento.ArticoliUsatiJson) : [];

        const finalIntervento: any = {
            ...rawIntervento,
            Dipendenti: dipendenti,
            FornitoriEsterni: fornitori,
            ArticoliUsati: articoli,
        };

        delete finalIntervento.DipendentiCsv;
        delete finalIntervento.FornitoriCsv;
        delete finalIntervento.ArticoliUsatiJson;
        res.json(finalIntervento);

    } catch (err: any) {
        console.error(`Errore nel recupero dell'intervento ${interventoId}:`, err);
        res.status(500).json({
            message: "Errore durante il recupero dell'intervento",
            error: err.message
        });
    } finally {
        conn.release();
    }
}

import { Request, Response } from "express";
import { connection, RowDataPacket } from "../utils/db";


// Equivalente di mysql2: middleware non riusabile, replicato qui per il job di scheduling.
export async function creaInterventoGenerato(ManId: string, DataIntPrev: string): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2);
  const conn = await connection.promise().getConnection();

  try {
    // SQL Server: TOP 1 al posto di LIMIT 1
    const [ultimo] = await conn.query<RowDataPacket[]>(
      `SELECT TOP 1 IntId FROM interventi
        WHERE IntId LIKE ?
        ORDER BY IntId DESC`,
      [`INT-${year}-%`]
    );

    let newProgressivo = '00001';
    if (ultimo.length > 0) {
      const lastId = ultimo[0].IntId;
      const lastNumber = parseInt(lastId.split('-')[2], 10);
      newProgressivo = (lastNumber + 1).toString().padStart(5, '0');
    }

    const newIntId = `INT-${year}-${newProgressivo}`;

    await conn.execute(
      `INSERT INTO interventi (
        IntId, ManId, DataIntPrev, DataIntEff,
        OraInizio, OraFine, EsitoMan, ValidataMan,
        noteIntervento, TipoGuastoId, OriginInt, NomeRisorsaInt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newIntId, ManId, DataIntPrev, null, '08:00:00', '12:00:00', 0, 0, "intervento generato dal sistema", null, 1, 0]
    );

    return newIntId;
  } catch (error) {
    console.error("Errore nella creazione dell'intervento:", error);
    throw error;
  } finally {
    conn.release();
  }
}

export async function generaInterventiProgrammabili(): Promise<any[]> {
  const interventiCreati = [];

  try {
    const [manutenzioni] = await connection.promise().query<RowDataPacket[]>(
      `SELECT ManId, FreqGiorni, DataInserimento
         FROM manutenzioni
        WHERE FreqGiorni > 0`
    );

    for (const man of manutenzioni) {
      const { ManId, FreqGiorni, DataInserimento } = man;

      const [interventiEffettuati] = await connection.promise().query<RowDataPacket[]>(
        `SELECT TOP 1 DataIntEff FROM interventi
          WHERE ManId = ?
            AND DataIntEff IS NOT NULL
          ORDER BY DataIntEff DESC`,
        [ManId]
      );

      let baseDate: Date;
      if (interventiEffettuati.length > 0) {
        baseDate = new Date(interventiEffettuati[0].DataIntEff);
      } else if (DataInserimento) {
        baseDate = new Date(DataInserimento);
      } else {
        continue;
      }

      const prossimaData = new Date(baseDate);
      prossimaData.setDate(prossimaData.getDate() + FreqGiorni);
      const prossimaDataStr = prossimaData.toISOString().split('T')[0];

      const [esistenti] = await connection.promise().query<RowDataPacket[]>(
        `SELECT IntId FROM interventi
          WHERE ManId = ?
            AND DataIntPrev = ?
            AND DataIntEff IS NULL`,
        [ManId, prossimaDataStr]
      );

      if (esistenti.length > 0) continue;

      const newIntId = await creaInterventoGenerato(ManId, prossimaDataStr);
      interventiCreati.push({ ManId, newIntId, prossimaDataStr });
    }

    return interventiCreati;
  } catch (error: any) {
    console.error(" Errore durante la generazione:", error.message);
    throw error;
  }
}

export async function getInterventiCalendario(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    const [results] = await conn.query<RowDataPacket[]>(
      `SELECT
          i.IntId,
          i.ManId,
          i.NomeRisorsaInt,
          i.DataIntPrev,
          i.OraInizio,
          i.OraFine,
          CASE WHEN i.ManId <> 0 THEN m.DescMan         ELSE i.noteIntervento END AS DescMan,
          CASE WHEN i.ManId <> 0 THEN r1.ModMacc        ELSE r2.ModMacc       END AS ModMacc
       FROM interventi i
       LEFT JOIN manutenzioni m ON i.ManId = m.ManId
       LEFT JOIN risorsa r1     ON m.MaccIdMan       = r1.NomeRisorsa
       LEFT JOIN risorsa r2     ON i.NomeRisorsaInt  = r2.NomeRisorsa`
    );
    res.json(results);
  } catch (error) {
    console.error("Errore nel recupero degli interventi del calendario:", error);
    res.status(500).json({ message: 'Errore', error });
  } finally {
    conn.release();
  }
}

export async function getInterventiNonValidate(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    const [results] = await conn.query<RowDataPacket[]>(
      `SELECT i.IntId, f.RagSoc
         FROM interventi i
    LEFT JOIN interventi_esterni ie ON i.IntId = ie.IntId
    LEFT JOIN fornitore           f ON ie.IdFornitore = f.IdFornitore
        WHERE ie.IdFornitore IS NOT NULL AND ValidataMan = 0
        ORDER BY i.IntId DESC`
    );
    res.json(results);
  } catch (error) {
    console.error("Errore nel recupero degli interventi non validati:", error);
    res.status(500).json({ message: 'Errore', error });
  } finally {
    conn.release();
  }
}

export async function getInterventiRitardo(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    // SQL Server: CAST(GETDATE() AS DATE) al posto di CURDATE()
    const [results] = await conn.query<RowDataPacket[]>(
      `SELECT
          i.IntId,
          i.DataIntPrev,
          CASE WHEN i.ManId = 0 THEN i.NomeRisorsaInt ELSE r.NomeRisorsa  END AS risorsa,
          CASE WHEN i.ManId = 0 THEN i.noteIntervento ELSE m.DescMan      END AS noteIntervento
       FROM interventi i
       LEFT JOIN manutenzioni m ON i.ManId        = m.ManId
       LEFT JOIN risorsa      r ON m.MaccIdMan    = r.NomeRisorsa
      WHERE i.ValidataMan = 0
        AND i.DataIntPrev < CAST(GETDATE() AS DATE)
        AND i.DataIntEff IS NULL
      ORDER BY i.DataIntPrev ASC`
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero degli interventi scaduti non validati', error });
  } finally {
    conn.release();
  }
}

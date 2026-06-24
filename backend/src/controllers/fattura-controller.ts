import { Request, Response } from 'express';
import { connection } from '../utils/db';

export async function getFatture(req: Request, res: Response) {
    const conn = await connection.promise().getConnection();
    try {
      const [results] = await conn.query(
        ` SELECT 
          f.NFatt AS NFatt,
          fo.IdFornitore AS IdFornitore,
          fo.RagSoc AS RagSoc,
          f.IntId AS IntId,
          f.ImpFatt AS ImpFatt,
          f.NoteFatt AS NoteFatt
        FROM fatture f
        left join interventi i on f.IntId =i.IntId
        left join interventi_esterni ie on i.IntId = ie.IntId
        left join fornitore fo on ie.IdFornitore = fo.IdFornitore`
      );
      res.json(results);
    } catch (err) {
      res.status(500).json({ message: 'Errore nel recupero dati', error: err });
    } finally {
      conn.release();
    }
  }
export async function createFattura(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();  
    try {
      await conn.beginTransaction();
  
      // Inserimento della fattura
      await conn.query(
        `INSERT INTO fatture (NFatt, IntId, ImpFatt, NoteFatt)
         VALUES (?, ?, ?, ?)`,
        [req.body.NFatt, req.body.IntId, req.body.ImpFatt, req.body.NoteFatt || null]
      );
  
      // Meccanismo Validazione 1 = fattura presente 0 = fattura mancante in Interventi
      await conn.query(
        `UPDATE interventi SET ValidataMan = 1 WHERE IntId = ?`,
        [req.body.IntId]
      );
  
      await conn.commit();
      res.status(201).json({
        message: 'Fattura creata con successo',
        validataMan: 1
      });
  
    } catch (error) {
      console.error("Errore durante la creazione della fattura:", error);
      await conn.rollback();
      res.status(500).json({ error: "Errore durante la creazione della fattura", details: error });
    } finally {
      conn.release(); 
    }
} 
export async function deleteFattura(req: Request, res: Response) {
    const conn = await connection.promise().getConnection();
    try {
      const [fatturaRows] = await conn.query(
        `SELECT IntId FROM fatture WHERE NFatt = ?`,
        [req.params.id]
      );
  
      if (!Array.isArray(fatturaRows) || fatturaRows.length === 0) {
        return res.status(404).json({ message: "Fattura non trovata" });
      }
  
      const intId = (fatturaRows[0] as any).IntId;
      await conn.query(`DELETE FROM fatture WHERE NFatt = ?`, [req.params.id]);
  
      // SQL Server: TOP 1 al posto di LIMIT 1
      const [esterni] = await conn.query(
        `SELECT TOP 1 1 AS Trovato FROM interventi_esterni WHERE IntId = ?`,
        [intId]
      );
  
      if ((esterni as any[]).length > 0) {
        await conn.query(
          `UPDATE interventi SET ValidataMan = 0 WHERE IntId = ?`,
          [intId]
        );
      }
  
      res.status(200).json({ message: "Fattura eliminata e ValidataMan aggiornato (se necessario)" });
    } catch (err) {
      res.status(500).json({ error: "Errore durante l'eliminazione o aggiornamento", details: err });
    } finally {
      conn.release();
    }
}
export async function updateFattura(req: Request, res: Response) {
    const conn = await connection.promise().getConnection();
    try {
      const { IntId, ImpFatt, NoteFatt } = req.body;
      const { id } = req.params;
  
      await conn.query(
        `UPDATE fatture SET
          IntId = COALESCE(?, IntId),
          ImpFatt = COALESCE(?, ImpFatt),
          NoteFatt = COALESCE(?, NoteFatt)
        WHERE NFatt = ?`,
        [IntId, ImpFatt, NoteFatt ?? null, id]
      );
  
      res.json({
        message: "Fattura aggiornata con successo",
        NFatt: id
      });
    } catch (err) {
      res.status(500).json({
        message: "Errore nell'aggiornamento",
        error: err
      });
    } finally {
      conn.release();
    }
}


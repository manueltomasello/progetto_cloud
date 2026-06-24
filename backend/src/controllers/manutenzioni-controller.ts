import { Request, Response } from "express"
import { connection } from "../utils/db"

export async function getManutezioni(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    const [results] = await conn.query(
      `SELECT * FROM manutenzioni WHERE ManId <> 0`
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Errore durante il recupero', error: err });
  } finally {
    conn.release();
  }
}
export async function createManutenzione(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    await conn.execute(
      'INSERT INTO manutenzioni (MaccIdMan, Tipo, FreqGiorni, DescMan, noteMan, DurataSTAT) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.body.MaccIdMan,
        req.body.Tipo,
        req.body.FreqGiorni || null,
        req.body.DescMan || null,
        req.body.noteMan || null,
        req.body.DurataSTAT
      ]
    );
    res.status(201).json({ message: 'Manutenzione inserita con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore durante l’inserimento', error: err });
  } finally {
    conn.release();
  }
}
export async function updateManutenzione(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    await conn.execute(
      'UPDATE manutenzioni SET MaccIdMan = ?, Tipo = ?, FreqGiorni = ?, DescMan = ?, noteMan = ?, DurataSTAT = ? WHERE ManId = ?',
      [
        req.body.MaccIdMan,
        req.body.Tipo,
        req.body.FreqGiorni || null,
        req.body.DescMan || null,
        req.body.noteMan || null,
        req.body.DurataSTAT,
        req.params.id
      ]
    );
    res.status(200).json({ message: 'Manutenzione aggiornata con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore durante l’aggiornamento', error: err });
  } finally {
    conn.release();
  }
}
export async function deleteManutenzione(req: Request, res: Response) {
  const { id } = req.params;
  const conn = await connection.promise().getConnection();
  try {
    // check esistenza manutenzione
    const [check]: any = await conn.query(
      'SELECT ManId FROM manutenzioni WHERE ManId = ?',
      [id]
    );

    if (check.length === 0) {
      res.status(404).json({ message: 'Manutenzione non trovata' });
      conn.release();
      return;
    }

    await conn.beginTransaction();

    const [result]: any = await conn.execute(
      'DELETE FROM manutenzioni WHERE ManId = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      res.status(404).json({ message: 'Nessuna manutenzione eliminata' });
      conn.release();
      return;
    }

    await conn.commit();
    res.status(200).json({ message: 'Manutenzione eliminata con successo' });

  } catch (err: any) {
    try {
      await conn.rollback();
    } catch (rollbackError) {
      console.error('Rollback fallito:', rollbackError);
    }

    // Controllo referenze SQL Server: errore 547 = FK constraint violata
    const sqlNumber = err.number ?? err.originalError?.info?.number;
    if (sqlNumber === 547) {
      res.status(409).json({
        message: 'Impossibile eliminare: manutenzione collegata ad altri record',
        suggestion: 'Eliminare prima i record collegati'
      });
    } else {
      console.error('Errore eliminazione:', err);
      res.status(500).json({
        message: 'Errore durante l\'eliminazione',
        error: err.message
      });
    }
  } finally {
    conn.release();
  }
}
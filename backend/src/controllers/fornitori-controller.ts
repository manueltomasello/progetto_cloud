import { Request, Response } from 'express';
import { connection } from '../utils/db';


export async function getFornitori(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    const [results] = await conn.query(`SELECT * FROM fornitore`);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Errore, Contattare amministratore di rete', error: err });
  } finally {
    conn.release();
  }
}
export async function createFornitore(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    await conn.query(
      `INSERT INTO fornitore (IdFornitore, RagSoc) VALUES (?, ?)`,
      [req.body.IdFornitore, req.body.RagSoc]
    );
    res.status(201).json({ message: 'Fornitore creato con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore nella creazione', error: err });
  } finally {
    conn.release();
  }
}
export async function updateFornitore(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    await conn.query(
      `UPDATE fornitore SET IdFornitore = ?, RagSoc = ? WHERE IdFornitore = ?`,
      [req.body.IdFornitore, req.body.RagSoc, req.params.id]
    );
    res.status(200).json({ message: 'Fornitore aggiornato con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore nell\'aggiornamento', error: err });
  } finally {
    conn.release();
  }
}
export async function deleteFornitore(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    await conn.query(
      `DELETE FROM fornitore WHERE IdFornitore = ?`,
      [req.params.id]
    );
    res.status(200).json({ message: 'Fornitore eliminato con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore nella cancellazione', error: err });
  } finally {
    conn.release();
  }
}

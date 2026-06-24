import { Request, Response } from 'express';
import { connection } from '../utils/db';

// CRUD per Risorsa
export async function getRisorse(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    const [results] = await conn.query(
      `SELECT * FROM risorsa WHERE NomeRisorsa <> '0'`
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Errore nel recupero della risorsa', error: err });
  } finally {
    conn.release();
  }
}
export async function getRisorsaById(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    const [results]: any = await conn.query(
      `SELECT * FROM risorsa WHERE NomeRisorsa = ?`,
      [req.params.id]
    );
    res.json(results.length > 0 ? results[0] : { message: 'Non esiste una macchina con questo nome' });
  } catch (err) {
    res.status(500).json({ message: 'Errore nel recupero della risorsa', error: err });
  } finally {
    conn.release();
  }
}
export async function createRisorsa(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    await conn.execute(
      `INSERT INTO risorsa (NomeRisorsa, ModMacc, DescMacc, CostoOrarioFermo) VALUES (?, ?, ?, ?)`,
      [req.body.NomeRisorsa, req.body.ModMacc, req.body.DescMacc || null, req.body.CostoOrarioFermo]
    );
    res.status(201).json({ message: 'Risorsa creata con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore nella creazione della risorsa', error: err });
  } finally {
    conn.release();
  }
}
export async function updateRisorsa(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    await conn.execute(
      `UPDATE risorsa SET ModMacc = ?, DescMacc = ?, CostoOrarioFermo = ? WHERE NomeRisorsa = ?`,
      [req.body.ModMacc, req.body.DescMacc || null, req.body.CostoOrarioFermo, req.params.id]
    );
    res.status(200).json({ message: 'Modifica avvenuta con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore nella modifica', error: err });
  } finally {
    conn.release();
  }
}
export async function deleteRisorsa(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    await conn.execute(
      `DELETE FROM risorsa WHERE NomeRisorsa = ?`,
      [req.params.id]
    );
    res.status(200).json({ message: 'Eliminazione avvenuta con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore nella cancellazione', error: err });
  } finally {
    conn.release();
  }
}
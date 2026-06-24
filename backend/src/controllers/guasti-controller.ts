import { Request, Response } from "express";
import { connection } from "../utils/db";

// Le causali di guasto vengono inserite/gestite a livello applicativo.
// Tutte le funzioni sono state convertite ad async/await per allinearsi
// all'adapter mssql che NON espone API a callback.

export async function getGuasti(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    const [results] = await conn.query(`SELECT * FROM cause_guasto`);
    res.json(results);
  } catch (err: any) {
    console.error("Errore recupero cause_guasto:", err);
    res.status(500).json({
      message: 'Errore nel recupero dei dati',
      error: err.message,
    });
  } finally {
    conn.release();
  }
}

export async function createGuasto(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    await conn.execute(
      'INSERT INTO cause_guasto (Descrizione) VALUES (?)',
      [req.body.Descrizione]
    );
    res.status(201).json({ message: 'Tipologia di guasto inserita con successo' });
  } catch (err: any) {
    console.error("Errore creazione causale guasto:", err);
    res.status(500).json({
      message: "Errore durante l'inserimento",
      error: err.message,
    });
  } finally {
    conn.release();
  }
}

export async function updateGuasto(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    const [result]: any = await conn.execute(
      `UPDATE cause_guasto
          SET Descrizione = ?
        WHERE IdGuasto = ?`,
      [req.body.Descrizione, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Nessuna causale di guasto trovata con questo ID",
      });
    }

    res.status(200).json({ message: "Causale di guasto modificata con successo" });
  } catch (err: any) {
    console.error("Errore aggiornamento causale guasto:", err);
    res.status(500).json({
      error: "Errore nell'aggiornamento",
      details: err.message,
    });
  } finally {
    conn.release();
  }
}

export async function deleteGuasto(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    await conn.execute(
      `DELETE FROM cause_guasto WHERE IdGuasto = ?`,
      [req.params.id]
    );
    res.status(200).json({ message: 'Causale Guasto eliminata con successo' });
  } catch (err: any) {
    // 547 = violazione di vincolo FK in SQL Server
    const sqlNumber = err.number ?? err.originalError?.info?.number;
    if (sqlNumber === 547) {
      return res.status(409).json({
        message: 'Impossibile eliminare: causale collegata ad interventi esistenti',
        suggestion: 'Rimuovere o riassociare gli interventi collegati prima di procedere',
      });
    }
    console.error("Errore cancellazione causale guasto:", err);
    res.status(500).json({
      message: 'Errore nella cancellazione',
      error: err.message,
    });
  } finally {
    conn.release();
  }
}

import { Request, Response } from "express"
import { connection } from "../utils/db"

export async function getArticoli(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    const [results] = await conn.query(`SELECT * FROM articoli_consumabili`);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: 'Errore nel recupero dei dati', error: err });
  } finally {
    if (conn) conn.release();
  }
}
export async function createArticolo(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    await conn.execute(
      `INSERT INTO articoli_consumabili 
        (NomeArt, DescArtBreve, DescArtLunga, Udm, PrezzoStandard) 
        VALUES (?, ?, ?, ?, ?)`,
      [
        req.body.NomeArt,
        req.body.DescArtBreve || null,
        req.body.DescArtLunga || null,
        req.body.Udm,
        req.body.PrezzoStandard
      ]
    );
    res.status(201).json({ message: 'Articolo inserito con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore durante l’inserimento', error: err });
  } finally {
    if (conn) conn.release();
  }
}
export async function updateArticolo(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  const { NomeArt, DescArtBreve, DescArtLunga, Udm, PrezzoStandard } = req.body;
  const { id } = req.params;
  try {
    const [results]: any = await connection.promise().execute(
      `UPDATE articoli_consumabili 
       SET NomeArt = ?, DescArtBreve = ?, DescArtLunga = ?, Udm = ?, PrezzoStandard = ? 
       WHERE Articolo = ?`,
      [NomeArt, DescArtBreve, DescArtLunga, Udm, PrezzoStandard, id]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Nessun articolo trovato con questo ID" });
    }

    res.status(200).json({ message: "Articolo modificato con successo" });
  } catch (err) {
    res.status(500).json({ error: "Errore nell'aggiornamento dell'articolo", details: err });
   }finally {
      if (conn) conn.release();
  }
}
export async function deleteArticolo(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    const [results]: any = await conn.execute(
      `DELETE FROM articoli_consumabili WHERE Articolo = ?`,
      [req.params.id]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Nessun articolo trovato con questo ID" });
    }

    res.status(200).json({ message: 'Articolo eliminato con successo' });
  } catch (err) {
    res.status(500).json({ message: 'Errore nella cancellazione', error: err });
  } finally {
    if (conn) conn.release();
  }
}
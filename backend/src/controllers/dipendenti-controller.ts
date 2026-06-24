import { Request, Response } from 'express';
import { connection } from '../utils/db';
import bcrypt from "bcrypt"

// Funzione per ottenere tutti i dipendenti abilitati
export async function getDipendente(req: Request, res: Response) {
  // Ottiene una connessione dal pool
  const conn = await connection.promise().getConnection();
  try {
    // Recupera tutti i dipendenti con Abilitato diverso da '0'
    // SQL Server: <> per disuguaglianza (compatibile con Abilitato BIT)
    const [results] = await conn.query(`SELECT * FROM operatore WHERE Abilitato <> 0`);
    res.json(results); // Restituisce i risultati come JSON
  } catch (err) {
    res.status(500).json({ message: 'Errore nel recupero dei dati', error: err });
  } finally {
    conn.release(); // Rilascia la connessione al pool
  }
}

// Funzione per creare un nuovo dipendente
export async function createDipendente(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    // Estrae i dati dal body della richiesta
    const { Matricola, NomeDip, CognDip, EmailDip, PassDip, CostoOrario, username, ruolo } = req.body;

    // Controlla che i campi obbligatori siano presenti
    if (!NomeDip || !CognDip || !PassDip) {
        return res.status(400).json({ message: "Campi obbligatori mancanti." });
    }
    // Cifra la password prima di salvarla nel database
    const hash = await bcrypt.hash(PassDip, 10); 
    // Inserisce il nuovo dipendente nella tabella operatore
    await conn.query(
      `INSERT INTO operatore (Matricola, NomeDip, CognDip, EmailDip, PassDip, CostoOrario, username, ruolo)
       VALUES (?, ?, ?, ?, ?, ? , ?, ? )`,
      [
        Matricola,
        NomeDip,
        CognDip,
        EmailDip || null, // Se non fornita, salva null
        hash, // Password cifrata
        CostoOrario,
        username,
        ruolo
      ]
    );
    res.status(201).json({ message: 'Dipendente inserito con successo' });

  } catch (err) {
    // Gestione errore: può essere dovuto a campi univoci già presenti (es. Matricola)
    console.error("Errore durante l'inserimento del dipendente:", err); 
    res.status(400).json({ message: "Errore: Matricola o altro campo univoco già esistente." });

    // Nota: questa riga non verrà mai eseguita perché la risposta è già stata inviata sopra
    res.status(500).json({ message: "Errore durante l'inserimento", });
  } finally {
    if (conn) conn.release();
  }
}

export async function updateDipendente(req: Request, res: Response) {
  const conn = await connection.promise().getConnection();
  try {
    const IdDipToUpdate = req.params.id; // ID del dipendente da aggiornare
    // Estrae i dati aggiornati dal body della richiesta
    const {
      Matricola, NomeDip, CognDip, EmailDip, CostoOrario, username, ruolo, PassDip // PassDip: nuova password se fornita
    } = req.body;

    const updates: string[] = []; // Array per le parti della query da aggiornare
    const values: any[] = [];     // Array per i valori da inserire nella query

    // Per ogni campo, se presente, aggiunge la parte di query e il valore
    if (Matricola !== undefined) { 
      updates.push("Matricola = ?");
      values.push(Matricola);
    }
    if (NomeDip !== undefined) {
      updates.push("NomeDip = ?");
      values.push(NomeDip);
    }
    if (CognDip !== undefined) {
      updates.push("CognDip = ?");
      values.push(CognDip);
    }
    if (EmailDip !== undefined) {
      updates.push("EmailDip = ?");
      values.push(EmailDip);
    }
    if (CostoOrario !== undefined) {
      updates.push("CostoOrario = ?");
      values.push(CostoOrario);
    }
    if (username !== undefined) {
      updates.push("username = ?");
      values.push(username);
    }
    if (ruolo !== undefined) {
      updates.push("ruolo = ?");
      values.push(ruolo);
    }
    // Se viene fornita una nuova password, la cifra e la aggiunge all'update
    if (PassDip !== undefined && typeof PassDip === 'string' && PassDip.length > 0) {
      const hashedPassword = await bcrypt.hash(PassDip, 10);
      updates.push("PassDip = ?"); 
      values.push(hashedPassword); 
    }

    // Se nessun campo è stato fornito, restituisce errore
    if (updates.length === 0) {
      return res.status(400).json({ message: "Nessun campo valido fornito per l'aggiornamento." });
    }
    // Costruisce la query dinamicamente in base ai campi da aggiornare
    const query = `UPDATE operatore SET ${updates.join(', ')} WHERE IdDip = ?`;
    values.push(IdDipToUpdate);

    // Esegue la query di aggiornamento
    const [result]: any = await conn.query(query, values);

    // Se nessuna riga è stata modificata, il dipendente non esiste
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Nessun dipendente trovato con questo ID." });
    }

    res.json({ message: "Anagrafica Dipendente modificata con successo" });

  } catch (err) {
    console.error("Errore nell'aggiornamento del dipendente:", err); 
    res.status(500).json({ error: "Errore nell'aggiornamento del dipendente"}); 
  } finally {
    if (conn) conn.release();
  }
} 

// Funzione per disabilitare (non cancellare) un dipendente
export async function disableDipendente(req: Request, res: Response) {
  const IdDip = req.params.id;
  const conn = await connection.promise().getConnection();

  try {
    // Verifica se il dipendente esiste
    const [check]: any = await conn.query(
      'SELECT IdDip FROM operatore WHERE IdDip = ?',
      [IdDip]
    );

    if (check.length === 0) {
      return res.status(404).json({ message: 'Dipendente non trovato' });
    }

    // Disabilita il dipendente impostando Abilitato = 0 (soft delete)
    const [result]: any = await conn.query(
      'UPDATE operatore SET Abilitato = 0 WHERE IdDip = ?',
      [IdDip]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ message: 'Errore durante la disabilitazione del dipendente' });
    }

    res.status(200).json({ message: 'Dipendente disabilitato con successo' });

  } catch (err) {
    console.error('Errore nella disabilitazione:', err);
    res.status(500).json({ message: 'Errore interno', error: err });
  } finally {
    conn.release();
  }
}
# Script di test

Da eseguire **dopo** aver avviato il sistema con `docker compose up --build`
(attendi che tutti i servizi siano partiti: la prima volta ci vogliono alcuni
minuti per la build).

- **Windows (PowerShell):**
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts\test-e2e.ps1
  ```
- **Linux / macOS / Git Bash:**
  ```bash
  bash scripts/test-e2e.sh
  ```

Lo script verifica in sequenza: raggiungibilità dell'API Gateway, login,
lettura dei dati di esempio e — soprattutto — il **flusso a eventi Kafka**:
crea un intervento tramite l'AI Agent (che pubblica su `interventi.requested`)
e controlla che il `manutenzioni-service` lo abbia creato consumando l'evento.

Per vedere anche la fattura generata automaticamente: apri il frontend
(http://localhost), valida l'intervento appena creato (esito positivo) e
controlla la sezione fatture, oppure `GET /api/VisualizzazioneFatture`.

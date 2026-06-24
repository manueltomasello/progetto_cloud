# Guida alla migrazione: MariaDB → SQL Server + WCAG 2.1 AA

Questa guida descrive in modo completo come passare il progetto **Gestionale-Manutenzioni** da MariaDB a Microsoft SQL Server e quali miglioramenti di accessibilità (WCAG 2.1 AA) sono stati introdotti nel frontend.

---

## 1. Panoramica delle modifiche

### Backend
- Driver database sostituito: `mysql2` → `mssql` (basato su `tedious`).
- Adapter di compatibilità in `src/db.ts`: i controller continuano a usare la vecchia API (`?` come placeholder, `conn.query(sql, params)`), ma la query viene tradotta a runtime in T-SQL (`@p0`, `@p1`, ...). In questo modo solo i controller con sintassi specifica MariaDB sono stati riscritti.
- Conversione completa dello schema in T-SQL: `backend/sql/gestionale_manutenzioni_mssql.sql`.
- Script di migrazione dati MariaDB → SQL Server: `backend/scripts/migrate-mariadb-to-mssql.ts`.
- Conversioni SQL applicate: `\`backtick\`` → `[bracket]`, `AUTO_INCREMENT` → `IDENTITY(1,1)`, `TINYINT(1)` → `BIT`, `ENUM` → `NVARCHAR + CHECK`, `LIMIT n` → `TOP n`, `CURDATE()` → `CAST(GETDATE() AS DATE)`, `JSON_ARRAYAGG`/`JSON_OBJECT` → `STRING_AGG` / `FOR JSON PATH`, `GROUP_CONCAT(... SEPARATOR ', ')` → `STRING_AGG(..., N', ')`, codice errore `ER_ROW_IS_REFERENCED_2` → numero errore SQL Server **547**.

### Frontend
- Refactor completo di `src/style.css` con design tokens, palette WCAG-verificata e supporto a `prefers-reduced-motion` / `prefers-contrast`.
- App shell (`App.vue`) con landmark semantici, skip-link, live region per le rotte, focus management.
- Tutte le pagine (`Login`, `NotFound`, `Home`, `Risorse`, `Dipendenti`, `Fornitori`, `Articolo`, `Fatture`, `Manutenzioni`, `Interventi`, `Consultazioni`) ristrutturate con `<section aria-labelledby>`, intestazioni gerarchiche corrette, etichette form esplicite, `aria-required`, `aria-invalid`, `aria-busy`, `autocomplete`, paginazione come `<nav aria-label>` con indicatori `aria-live`.
- Indicatori di stato non più basati solo sul colore (icone tipografiche su `.ritardo`, `.NotValidate`).

---

## 2. Prerequisiti

1. **SQL Server 2019+** (o SQL Server Express 2019+/2022) raggiungibile dalla macchina che esegue il backend.
2. **SQL Server Management Studio** o **Azure Data Studio** per eseguire lo script DDL.
3. **Node.js 18+** e **npm**.
4. (Solo per la migrazione dati) un'istanza MariaDB/MySQL ancora accessibile contenente i dati di partenza.
5. Sull'istanza SQL Server occorre:
   - Un login con permessi `db_owner` sul database di destinazione.
   - Autenticazione SQL abilitata (Mixed Mode), oppure autenticazione Windows con utente configurato.
   - Porta TCP/IP attiva (default 1433).

---

## 3. Creazione dello schema su SQL Server

1. Aprire `backend/sql/gestionale_manutenzioni_mssql.sql` in SSMS / Azure Data Studio.
2. Creare un nuovo database, ad esempio:

   ```sql
   CREATE DATABASE GestionaleManutenzioni;
   GO
   USE GestionaleManutenzioni;
   GO
   ```

3. Eseguire l'intero contenuto di `gestionale_manutenzioni_mssql.sql`. Lo script crea tabelle, vincoli `CHECK` (al posto degli ENUM), `IDENTITY` per le chiavi auto-incrementanti, `BIT` per i flag e tutte le foreign key con `ON DELETE` coerenti con il modello originale.

---

## 4. Configurazione del backend

### 4.1 Installare le dipendenze

Dalla cartella `backend/`:

```bash
npm install
```

`package.json` è già aggiornato: `mssql` è in `dependencies`, mentre `mysql2` resta in `devDependencies` solo perché serve allo **script di migrazione una tantum**. Una volta migrati i dati può essere rimosso (`npm uninstall mysql2`).

### 4.2 Variabili d'ambiente

Copiare `backend/.env.example` in `backend/.env` e compilare:

```env
# SQL Server di destinazione (utilizzato dall'app)
DB_HOST=localhost
DB_PORT=1433
DB_USER=gestionale_user
DB_PASSWORD=********
DB_NAME=GestionaleManutenzioni
DB_ENCRYPT=true            # true se TLS abilitato (default su Azure)
DB_TRUST_SERVER_CERT=true  # true in dev / certificati self-signed
DB_INSTANCE=               # opzionale, es. SQLEXPRESS

# MariaDB sorgente (solo per lo script di migrazione)
SRC_DB_HOST=localhost
SRC_DB_PORT=3306
SRC_DB_USER=root
SRC_DB_PASSWORD=********
SRC_DB_NAME=gestionale_manutenzioni

# Pulisce le tabelle di destinazione prima della migrazione
WIPE_TARGET=true
```

### 4.3 Avvio del backend

```bash
npm run dev
```

Il pool `mssql` viene creato in `src/db.ts`; eventuali errori di connessione vengono loggati una sola volta all'avvio.

---

## 5. Migrazione dei dati esistenti (opzionale)

Se la base dati MariaDB contiene dati da preservare:

1. Verificare di aver già eseguito lo schema su SQL Server (sezione 3).
2. Verificare che le credenziali `SRC_DB_*` in `.env` puntino al database MariaDB d'origine.
3. Eseguire:

   ```bash
   npm run migrate:mariadb-to-mssql
   ```

Lo script (`backend/scripts/migrate-mariadb-to-mssql.ts`):

- legge le tabelle in **ordine FK-safe** (`risorsa`, `fornitore`, `cause_guasto`, `articoli_consumabili`, `operatore`, `manutenzioni`, `interventi`, `interventi_dipendenti`, `interventi_esterni`, `interventi_articoli`, `fatture`);
- se `WIPE_TARGET=true` esegue `DELETE` sulle tabelle in ordine **inverso**;
- usa `INFORMATION_SCHEMA.COLUMNS` per costruire al volo il `sql.Table` con i tipi corretti (`BIT`, `INT`, `NVARCHAR`, `DATE`, `DATETIME2`, `DECIMAL`, ...);
- normalizza i valori sorgente: `"0000-00-00"` → `null`, `Buffer` di lunghezza 1 → `0|1` per i `BIT`;
- gestisce le colonne `IDENTITY` con `SET IDENTITY_INSERT [tab] ON/OFF` per preservare gli ID storici (`IdGuasto`, `Articolo`, `IdDip`, `ManId`);
- inserisce in batch con `request.bulk(table)`.

L'output a console mostra, per ogni tabella, righe lette / righe inserite. In caso di errore lo script termina con codice ≠ 0 e lo stack viene stampato per diagnosi.

---

## 6. Frontend – miglioramenti WCAG 2.1 AA

### 6.1 Design system

`src/style.css` introduce token CSS:

- **Palette primaria** (verde brand) con livelli 50→900 e contrasto verificato (primary 500 = **5.27:1**, primary 700 = **8.1:1** su sfondo bianco).
- **Stati semantici**: success / warning / danger / info, ognuno con coppia testo+sfondo a contrasto AA.
- **Focus ring**: `--focus-ring-width: 3px` con offset di 2px e colore dedicato (contrasto **7.5:1**).
- **Tipografia**: `--font-size-base: 1rem`, scala modulare e altezze di linea ≥ 1.5.

### 6.2 Patterns applicati a tutte le pagine

- **Skip-link** all'inizio dell'app: `Tab` lo rende visibile e porta al `<main id="contenuto-principale">`.
- **Landmark semantici**: `header[role=banner]`, `nav[aria-label="Navigazione principale"]`, `main`, `footer[role=contentinfo]`.
- **Live region** per annunci di rotta e per i messaggi di successo/errore (`aria-live="polite"`, `role="status"` o `role="alert"`).
- **Form**:
  - ogni `<input>` / `<select>` / `<textarea>` ha una `<label for>`;
  - asterisco di obbligatorietà accompagnato da `<span class="visually-hidden">asterisco</span>`;
  - `aria-required`, `aria-invalid`, `aria-describedby` sui campi che mostrano hint o errori;
  - `autocomplete` corretto (`username`, `current-password`, `off`, `name`, ...).
- **Tabelle**: `<caption class="visually-hidden">`, `<thead>` con `<th scope="col">`, righe interattive con `tabindex="0"`, `role="button"`, `aria-label`, gestione `Enter`/`Space` (`@keydown.enter.prevent` / `@keydown.space.prevent`) oltre al click.
- **Paginazione**: sostituita da `<nav aria-label="Navigazione pagine ...">` con `<button type="button">`, indicatore "Pagina X di Y" in elemento `aria-live="polite" aria-atomic="true"`.
- **Pulsanti icona**: testo accessibile via `<span class="visually-hidden">` (es. "Elimina") accanto all'icona `aria-hidden="true"`.
- **Stati senza solo-colore**: `.ritardo` ha prefisso `⚠`, `.NotValidate` ha prefisso `◐`. Soddisfa **WCAG 1.4.1 (Use of Color)**.
- **Riduzione motion / contrasto alto**: animazioni e transizioni rimosse sotto `@media (prefers-reduced-motion: reduce)`; bordi/contrast ricalcolati sotto `@media (prefers-contrast: more)`.
- **Stampa**: `@media print` rimuove sfondi scuri e inverte i colori delle tabelle per preservare leggibilità.

### 6.3 Pagine ristrutturate
`Login.vue`, `NotFound.vue`, `Home.vue`, `Risorse.vue`, `Dipendenti.vue`, `Fornitori.vue`, `Articolo.vue`, `Fatture.vue`, `Manutenzioni.vue`, `Interventi.vue`, `Consultazioni.vue`, `App.vue`, `index.html`.

---

## 7. Checklist di verifica finale

Prima di considerare la migrazione conclusa:

**Database**
- [ ] Lo script `gestionale_manutenzioni_mssql.sql` viene eseguito su SQL Server senza errori.
- [ ] `SELECT name FROM sys.tables ORDER BY name;` ritorna le 11 tabelle del modello.
- [ ] Tutte le foreign key sono presenti: `SELECT * FROM sys.foreign_keys;`.

**Migrazione dati (se eseguita)**
- [ ] `npm run migrate:mariadb-to-mssql` termina senza errori.
- [ ] Le righe per ogni tabella corrispondono fra origine e destinazione (`SELECT COUNT(*) FROM ...` su entrambi).
- [ ] Gli ID storici sono preservati nelle tabelle con `IDENTITY` (es. `manutenzioni.ManId`).

**Backend**
- [ ] `npm run dev` si avvia senza errori di connessione.
- [ ] Un `GET /api/VisualizzaRisorse` ritorna i dati attesi.
- [ ] La cancellazione di un record referenziato risponde **HTTP 409** (errore SQL 547 catturato).
- [ ] `grep -R "mysql2" src/` mostra solo riferimenti in commenti / adapter (nessuna `require/import` attiva).

**Frontend**
- [ ] La navigazione da tastiera (`Tab`, `Shift+Tab`, `Enter`, `Space`) raggiunge tutti i controlli interattivi e mostra sempre un focus ring visibile.
- [ ] Lo skip-link compare al primo `Tab` e porta a `#contenuto-principale`.
- [ ] Uno screen reader (NVDA/VoiceOver) annuncia: heading di pagina al cambio rotta, esiti dei form, indicatore di paginazione.
- [ ] `axe DevTools` / `Lighthouse Accessibility` su Home, Login, Manutenzioni, Interventi → punteggio ≥ 95 e nessuna violazione bloccante.
- [ ] Test manuale con `prefers-reduced-motion: reduce` (DevTools → Rendering): nessuna animazione applicata.

**Regressioni**
- [ ] Login funzionante.
- [ ] CRUD su Risorse, Dipendenti, Fornitori, Articoli, Manutenzioni, Interventi, Fatture, Guasti.
- [ ] Generazione interventi automatica (Home) e consultazioni storiche (Consultazioni).
- [ ] Esportazione Excel su Fatture funzionante.

---

## 8. Rollback rapido

Se è necessario tornare temporaneamente a MariaDB:

1. Da `backend/`, ripristinare `mysql2` come dipendenza principale: `npm install mysql2`.
2. Sostituire `src/db.ts` con la versione precedente (presente in `git log` → commit prima della migrazione).
3. Riavviare `npm run dev`.

I controller restano compatibili grazie all'adapter: la modifica si limita al modulo `db.ts`.

---

## 9. Riferimenti utili

- `backend/sql/gestionale_manutenzioni_mssql.sql` — schema T-SQL completo.
- `backend/scripts/migrate-mariadb-to-mssql.ts` — script di migrazione dati.
- `backend/src/db.ts` — adapter di compatibilità mssql ↔ mysql2.
- `backend/.env.example` — template variabili d'ambiente.
- `frontend/src/style.css` — design system con token WCAG-verificati.
- WCAG 2.1: <https://www.w3.org/TR/WCAG21/>

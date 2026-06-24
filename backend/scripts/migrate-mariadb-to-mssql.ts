/**
 * Script di migrazione dati MariaDB → SQL Server
 * ------------------------------------------------
 * Legge tutte le tabelle dal database MariaDB d'origine e le ricarica nel
 * database SQL Server di destinazione, rispettando l'ordine delle Foreign Key
 * e gestendo le colonne IDENTITY tramite SET IDENTITY_INSERT ON/OFF.
 *
 * NB: Lo schema SQL Server deve essere stato già creato (vedi
 * `backend/sql/gestionale_manutenzioni_mssql.sql`). Lo script si limita a
 * spostare i dati e non modifica la struttura.
 *
 * Uso:
 *   npm run migrate:mariadb-to-mssql
 *
 * Variabili d'ambiente attese (oltre alle DB_* per SQL Server già definite
 * in `.env.example`):
 *
 *   SRC_DB_HOST=localhost
 *   SRC_DB_PORT=3306
 *   SRC_DB_USER=root
 *   SRC_DB_PASSWORD=root
 *   SRC_DB_NAME=gestionale_manutenzioni
 */

import 'dotenv/config';
import mysql, { RowDataPacket } from 'mysql2/promise';
import sql from 'mssql';

// ----------------------------------------------------------------------------
// Configurazione
// ----------------------------------------------------------------------------

const SOURCE_CFG = {
    host: process.env.SRC_DB_HOST ?? 'localhost',
    port: Number(process.env.SRC_DB_PORT ?? 3306),
    user: process.env.SRC_DB_USER ?? 'root',
    password: process.env.SRC_DB_PASSWORD ?? '',
    database: process.env.SRC_DB_NAME ?? 'gestionale_manutenzioni',
    dateStrings: true as const,
    multipleStatements: false,
};

const TARGET_CFG: sql.config = {
    server: process.env.DB_SERVER ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 1433),
    user: process.env.DB_USER ?? 'sa',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'gestionale_manutenzioni',
    options: {
        encrypt: (process.env.DB_ENCRYPT ?? 'true') === 'true',
        trustServerCertificate:
            (process.env.DB_TRUST_SERVER_CERTIFICATE ?? 'true') === 'true',
        instanceName: process.env.DB_INSTANCE || undefined,
        enableArithAbort: true,
    },
    pool: { max: 5, min: 0, idleTimeoutMillis: 30000 },
};

// ----------------------------------------------------------------------------
// Definizione tabelle
// L'ordine di INSERIMENTO rispetta le FK: prima le tabelle "padre", poi le figlie.
// L'ordine di TRUNCATE è inverso (figlie prima dei padri).
// ----------------------------------------------------------------------------

interface TableDef {
    name: string;
    /** Colonna IDENTITY se presente — verrà attivato SET IDENTITY_INSERT */
    identityColumn?: string;
    /**
     * Colonne da escludere dalla migrazione (tipicamente computed columns
     * o colonne con DEFAULT che non vogliamo replicare).
     */
    skipColumns?: string[];
}

/** Ordine di inserimento (rispetta le FK) */
const TABLES: TableDef[] = [
    { name: 'risorsa' },
    { name: 'fornitore' },
    { name: 'cause_guasto', identityColumn: 'IdGuasto' },
    { name: 'articoli_consumabili', identityColumn: 'Articolo' },
    { name: 'operatore', identityColumn: 'IdDip' },
    { name: 'manutenzioni', identityColumn: 'ManId' },
    { name: 'interventi' }, // IntId è VARCHAR (no IDENTITY)
    { name: 'interventi_dipendenti' },
    { name: 'interventi_esterni' },
    { name: 'interventi_articoli' },
    { name: 'fatture' },
];

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

function log(msg: string) {
    const ts = new Date().toISOString();
    // eslint-disable-next-line no-console
    console.log(`[${ts}] ${msg}`);
}

function chunk<T>(arr: T[], size: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

/**
 * Mappa i tipi colonna SQL Server al tipo mssql corretto.
 * Si appoggia all'INFORMATION_SCHEMA per inferire la conversione corretta.
 */
async function getTargetColumnTypes(
    pool: sql.ConnectionPool,
    table: string
): Promise<Record<string, sql.ISqlType>> {
    const r = await pool
        .request()
        .input('t', sql.NVarChar, table)
        .query(`
            SELECT COLUMN_NAME, DATA_TYPE,
                   CHARACTER_MAXIMUM_LENGTH AS MaxLen,
                   NUMERIC_PRECISION        AS Prec,
                   NUMERIC_SCALE            AS Scale
              FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_NAME = @t
        `);

    const map: Record<string, sql.ISqlType> = {};
    for (const row of r.recordset as any[]) {
        const colName: string = row.COLUMN_NAME;
        const dt: string = (row.DATA_TYPE as string).toLowerCase();
        const maxLen: number | null = row.MaxLen;
        const prec: number | null = row.Prec;
        const scale: number | null = row.Scale;

        switch (dt) {
            case 'int':         map[colName] = sql.Int(); break;
            case 'bigint':      map[colName] = sql.BigInt(); break;
            case 'smallint':    map[colName] = sql.SmallInt(); break;
            case 'tinyint':     map[colName] = sql.TinyInt(); break;
            case 'bit':         map[colName] = sql.Bit(); break;
            case 'decimal':
            case 'numeric':     map[colName] = sql.Decimal(prec ?? 18, scale ?? 0); break;
            case 'float':       map[colName] = sql.Float(); break;
            case 'real':        map[colName] = sql.Real(); break;
            case 'money':       map[colName] = sql.Money(); break;
            case 'date':        map[colName] = sql.Date(); break;
            case 'time':        map[colName] = sql.Time(); break;
            case 'datetime':    map[colName] = sql.DateTime(); break;
            case 'datetime2':   map[colName] = sql.DateTime2(); break;
            case 'smalldatetime': map[colName] = sql.SmallDateTime(); break;
            case 'char':        map[colName] = sql.Char(maxLen ?? 1); break;
            case 'nchar':       map[colName] = sql.NChar(maxLen ?? 1); break;
            case 'varchar':     map[colName] = sql.VarChar(maxLen === -1 ? sql.MAX : (maxLen ?? 255)); break;
            case 'nvarchar':    map[colName] = sql.NVarChar(maxLen === -1 ? sql.MAX : (maxLen ?? 255)); break;
            case 'text':        map[colName] = sql.Text(); break;
            case 'ntext':       map[colName] = sql.NText(); break;
            case 'binary':      map[colName] = sql.Binary(); break;
            case 'varbinary':   map[colName] = sql.VarBinary(maxLen === -1 ? sql.MAX : (maxLen ?? 255)); break;
            case 'uniqueidentifier': map[colName] = sql.UniqueIdentifier(); break;
            default:            map[colName] = sql.NVarChar(sql.MAX); break;
        }
    }
    return map;
}

/**
 * Normalizza un valore proveniente da MariaDB per essere accettato da mssql.
 * - Buffer/Uint8Array → string
 * - "0000-00-00" → null (tipico edge case MySQL)
 * - "1"/"0" su BIT → boolean
 */
function normalizeValue(v: any, t: sql.ISqlType): any {
    if (v === undefined || v === null) return null;
    // Buffer da TINYINT(1) o BIT
    if (Buffer.isBuffer(v)) {
        if ((t as any).type === sql.Bit.type) {
            return v.length > 0 ? v[0] !== 0 : false;
        }
        return v.toString('utf8');
    }
    // Stringhe data invalide
    if (typeof v === 'string' && /^0000-00-00/.test(v)) return null;
    // BIT da numerico/stringa
    if ((t as any).type === sql.Bit.type) {
        if (typeof v === 'number') return v !== 0;
        if (typeof v === 'string') return v === '1' || v.toLowerCase() === 'true';
    }
    return v;
}

// ----------------------------------------------------------------------------
// Migrazione di una tabella
// ----------------------------------------------------------------------------

async function migrateTable(
    src: mysql.Pool,
    dst: sql.ConnectionPool,
    def: TableDef
): Promise<{ count: number }> {
    const { name, identityColumn, skipColumns = [] } = def;

    log(`→ Migrazione tabella "${name}"`);

    // 1. Leggi dati origine
    const [rows] = await src.query<RowDataPacket[]>(`SELECT * FROM \`${name}\``);
    log(`   ${rows.length} righe lette da MariaDB`);

    if (rows.length === 0) return { count: 0 };

    // 2. Schema colonne destinazione
    const colTypes = await getTargetColumnTypes(dst, name);
    const allTargetCols = Object.keys(colTypes);

    // Filtra le colonne effettivamente presenti su entrambi i lati
    const sourceCols = Object.keys(rows[0]);
    const cols = allTargetCols.filter(
        (c) => sourceCols.includes(c) && !skipColumns.includes(c)
    );

    if (cols.length === 0) {
        log(`   Nessuna colonna mappabile, skip.`);
        return { count: 0 };
    }

    // 3. Attiva IDENTITY_INSERT se serve
    if (identityColumn) {
        await dst.request().query(`SET IDENTITY_INSERT [${name}] ON`);
    }

    // 4. Insert a batch (uso Table-Valued bulk per efficienza)
    const tvp = new sql.Table(name);
    tvp.create = false;
    for (const c of cols) {
        const t = colTypes[c];
        // sql.Table.columns.add richiede oggetto opzioni; mssql gestisce nullable in automatico
        tvp.columns.add(c, t as any, { nullable: true });
    }

    for (const r of rows) {
        const values = cols.map((c) => normalizeValue((r as any)[c], colTypes[c]));
        tvp.rows.add(...values);
    }

    try {
        const request = dst.request();
        await request.bulk(tvp);
        log(`   ✓ ${rows.length} righe inserite in [${name}]`);
    } finally {
        if (identityColumn) {
            await dst.request().query(`SET IDENTITY_INSERT [${name}] OFF`);
        }
    }

    return { count: rows.length };
}

// ----------------------------------------------------------------------------
// Pulizia tabelle destinazione (DELETE in ordine inverso)
// ----------------------------------------------------------------------------

async function truncateTargetTables(dst: sql.ConnectionPool) {
    log('Pulizia tabelle destinazione (in ordine inverso)…');
    const reverse = [...TABLES].reverse();
    for (const def of reverse) {
        await dst.request().query(`DELETE FROM [${def.name}]`);
        log(`   ✓ DELETE FROM [${def.name}]`);
    }
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

async function main() {
    log('=== Migrazione MariaDB → SQL Server ===');
    log(`Origine:      ${SOURCE_CFG.user}@${SOURCE_CFG.host}:${SOURCE_CFG.port}/${SOURCE_CFG.database}`);
    log(`Destinazione: ${TARGET_CFG.user}@${TARGET_CFG.server}:${TARGET_CFG.port}/${TARGET_CFG.database}`);

    const srcPool = mysql.createPool(SOURCE_CFG);
    const dstPool = await new sql.ConnectionPool(TARGET_CFG).connect();

    try {
        const wipe = (process.env.WIPE_TARGET ?? 'true') === 'true';
        if (wipe) await truncateTargetTables(dstPool);

        let total = 0;
        for (const def of TABLES) {
            const { count } = await migrateTable(srcPool, dstPool, def);
            total += count;
        }

        log(`=== ✅ Migrazione completata: ${total} righe trasferite ===`);
    } catch (err: any) {
        log(`❌ Errore: ${err.message}`);
        if (err.originalError?.info?.message) {
            log(`   Dettaglio SQL: ${err.originalError.info.message}`);
        }
        process.exitCode = 1;
    } finally {
        await srcPool.end();
        await dstPool.close();
    }
}

main();

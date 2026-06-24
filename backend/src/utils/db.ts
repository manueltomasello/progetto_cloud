/**
 * db.ts - Pool SQL Server con un'API "mysql2-compatibile".
 *
 * Storia:
 *  - In origine il backend usava il driver `mysql2` su MariaDB.
 *  - Nel maggio 2026 abbiamo migrato a Microsoft SQL Server usando il driver
 *    `mssql` (basato su tedious).
 *
 * Per ridurre l'impatto sui controller, questo modulo espone una superficie
 * compatibile con quella di mysql2:
 *
 *    const conn = await connection.promise().getConnection();
 *    const [rows] = await conn.query('SELECT * FROM x WHERE id = ?', [id]);
 *    await conn.beginTransaction();
 *    await conn.commit();
 *    conn.release();
 *
 * Internamente:
 *  - i placeholder posizionali `?` vengono tradotti in `@p0`, `@p1`, ...
 *  - il pattern multi-row `INSERT ... VALUES ?` con un singolo parametro
 *    array-di-array viene espanso in `(@p0,@p1),(@p2,@p3),...`
 *  - i risultati vengono restituiti come `[rows, fields]`, e per le query
 *    che modificano dati l'array ha la proprieta' `affectedRows` (non
 *    enumerabile) come in mysql2.
 *
 * Variabili d'ambiente lette (.env):
 *   DB_SERVER, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME,
 *   DB_ENCRYPT, DB_TRUST_SERVER_CERTIFICATE, DB_INSTANCE
 */

import sql, {
  ConnectionPool,
  IResult,
  Transaction,
  Request as SqlRequest,
  config as SqlConfig,
} from 'mssql';


export type RowDataPacket = Record<string, any>;
export type OkPacket = { affectedRows: number; insertId: number };


//Configurazione pool

const config: SqlConfig = {
  server: process.env.DB_SERVER ?? 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 1433,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    encrypt: (process.env.DB_ENCRYPT ?? 'true').toLowerCase() !== 'false',
    trustServerCertificate:
      (process.env.DB_TRUST_SERVER_CERTIFICATE ?? 'true').toLowerCase() !== 'false',
    enableArithAbort: true,
    instanceName: process.env.DB_INSTANCE || undefined,
    useUTC: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  requestTimeout: 30000,
  connectionTimeout: 30000,
};

let poolPromise: Promise<ConnectionPool> | null = null;

function getPool(): Promise<ConnectionPool> {
  if (!poolPromise) {
    const p = new sql.ConnectionPool(config);
    poolPromise = p.connect().then((pool) => {
      pool.on('error', (err) => {
        console.error('[mssql] pool error:', err);
      });
      return pool;
    });
  }
  return poolPromise;
}


function translateQuery(
  sqlText: string,
  params: any[],
): { text: string; finalParams: any[] } {
  const valuesQM = /VALUES\s*\?/i;
  // Caso multi-row INSERT: VALUES ? con un solo parametro array-di-array
  if (
    valuesQM.test(sqlText) &&
    params.length === 1 &&
    Array.isArray(params[0]) &&
    Array.isArray(params[0][0])
  ) {
    const matrix = params[0] as any[][];
    if (matrix.length === 0) {
      // Nessuna riga da inserire: ritorno una query no-op valida
      return { text: 'SELECT 1 WHERE 1 = 0', finalParams: [] };
    }
    const cols = matrix[0].length;
    const flat: any[] = [];
    const tuples: string[] = [];
    let idx = 0;
    for (const row of matrix) {
      const placeholders: string[] = [];
      for (let i = 0; i < cols; i++) {
        placeholders.push('@p' + idx);
        flat.push(row[i]);
        idx++;
      }
      tuples.push('(' + placeholders.join(', ') + ')');
    }
    return {
      text: sqlText.replace(valuesQM, 'VALUES ' + tuples.join(', ')),
      finalParams: flat,
    };
  }

  // Caso standard: sostituzione posizionale dei `?`
  let i = 0;
  const text = sqlText.replace(/\?/g, () => `@p${i++}`);
  return { text, finalParams: params };
}

function bindParams(req: SqlRequest, params: any[]) {
  for (let i = 0; i < params.length; i++) {
    req.input('p' + i, params[i]);
  }
}

function makeRows(result: IResult<any>): any {
  const recordset: any[] = result.recordset || [];
  const arr: any = recordset;
  const totalAffected = result.rowsAffected
    ? result.rowsAffected.reduce((a, b) => a + b, 0)
    : 0;
  // mysql2-style metadata (non-enumerable per non comparire in JSON.stringify)
  Object.defineProperty(arr, 'affectedRows', {
    value: totalAffected,
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(arr, 'insertId', {
    value: 0,
    enumerable: false,
    configurable: true,
  });
  return arr;
}


class Connection {
  private tx: Transaction | null = null;

  constructor(private pool: ConnectionPool) {}

  private newRequest(): SqlRequest {
    return this.tx ? new sql.Request(this.tx) : this.pool.request();
  }

  async query<T = any>(sqlText: string, params: any[] = []): Promise<[T, undefined]> {
    const p = Array.isArray(params) ? params : [];
    const { text, finalParams } = translateQuery(sqlText, p);
    const request = this.newRequest();
    bindParams(request, finalParams);
    const result = await request.query(text);
    const rows = makeRows(result);
    return [rows as T, undefined];
  }

  // Per compatibilita' con mysql2 (prepared statement); con mssql equivale a query
  async execute<T = any>(sqlText: string, params: any[] = []): Promise<[T, undefined]> {
    return this.query<T>(sqlText, params);
  }

  async beginTransaction(): Promise<void> {
    if (this.tx) throw new Error('Transaction already started');
    this.tx = new sql.Transaction(this.pool);
    await this.tx.begin();
  }

  async commit(): Promise<void> {
    if (!this.tx) return;
    try {
      await this.tx.commit();
    } finally {
      this.tx = null;
    }
  }

  async rollback(): Promise<void> {
    if (!this.tx) return;
    try {
      await this.tx.rollback();
    } catch (e) {
      // ignora "no transaction in progress" e simili
    } finally {
      this.tx = null;
    }
  }

  release(): void {

  }
}

export const connection = {
  promise() {
    return {
      async getConnection(): Promise<Connection> {
        const pool = await getPool();
        return new Connection(pool);
      },
      async query<T = any>(sqlText: string, params: any[] = []): Promise<[T, undefined]> {
        const pool = await getPool();
        return new Connection(pool).query<T>(sqlText, params);
      },
      async execute<T = any>(sqlText: string, params: any[] = []): Promise<[T, undefined]> {
        const pool = await getPool();
        return new Connection(pool).execute<T>(sqlText, params);
      },
    };
  },

  /**
   * Helper di convenienza in stile promise (sostituisce il vecchio
   * `connection.execute(sql, params, callback)` di mysql2 callback-style).
   */
  async execute<T = any>(sqlText: string, params: any[] = []): Promise<[T, undefined]> {
    const pool = await getPool();
    return new Connection(pool).execute<T>(sqlText, params);
  },

  async query<T = any>(sqlText: string, params: any[] = []): Promise<[T, undefined]> {
    const pool = await getPool();
    return new Connection(pool).query<T>(sqlText, params);
  },
};

export type { Connection };

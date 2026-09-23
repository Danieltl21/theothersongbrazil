import mysql from 'mysql2/promise';
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const isMysql = process.env.DB_TYPE === 'mysql' || Boolean(process.env.MYSQL_HOST);

let mysqlPool = null;
let pgPool = null;

export function getMysqlPool() {
  if (!mysqlPool) {
    const host = process.env.MYSQL_HOST || 'localhost';
    const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
    const user = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || '';
    const database = process.env.MYSQL_DATABASE || 'lms_homeopatia';
    const connectionLimit = parseInt(process.env.MYSQL_CONNECTION_LIMIT || '10', 10);

    mysqlPool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      multipleStatements: true,
      waitForConnections: true,
      connectionLimit,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
  }
  return mysqlPool;
}

if (isMysql) {
  getMysqlPool();
} else {
  const { Pool } = pg;
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
}

// Converter SQL PostgreSQL ($1, $2, RETURNING, INTERVAL) para MySQL (?)
function formatQuery(text, params = []) {
  if (!isMysql) return { text, params };
  
  let sql = text;

  // 1. Converter sintaxe de intervalo de datas PostgreSQL -> MySQL
  sql = sql.replace(/NOW\(\)\s*\+\s*\(\s*\$(\d+)\s*\|\|\s*' days'\)::INTERVAL/gi, 'DATE_ADD(NOW(), INTERVAL \$$1 DAY)');
  sql = sql.replace(/CURRENT_DATE\s*-\s*INTERVAL\s*'(\d+)\s*days'/gi, 'DATE_SUB(CURRENT_DATE(), INTERVAL $1 DAY)');
  sql = sql.replace(/NOW\(\)\s*-\s*INTERVAL\s*'(\d+)\s*days'/gi, 'DATE_SUB(NOW(), INTERVAL $1 DAY)');

  // 2. Substituir $1, $2... por ?
  sql = sql.replace(/\$(\d+)/g, '?');

  // 3. Remover cláusula RETURNING (incompatível com MySQL padrão)
  sql = sql.replace(/\s+RETURNING\s+[\w\*,\s]+$/i, '');

  return { sql, params };
}

// Adapter unificado para query
export const query = async (text, params = []) => {
  if (isMysql) {
    const pool = getMysqlPool();
    const { sql, params: formattedParams } = formatQuery(text, params);
    const [results] = await pool.query(sql, formattedParams);
    const isArray = Array.isArray(results);
    let rows = isArray ? results : [];
    if (!isArray && results && results.insertId) {
      rows = [{ id: results.insertId, insertId: results.insertId }];
    }
    return {
      rows,
      rowCount: isArray ? results.length : (results ? results.affectedRows || 0 : 0),
      insertId: results ? results.insertId : null
    };
  } else {
    return pgPool.query(text, params);
  }
};

// Adapter unificado para transações (pool.connect())
export const connect = async () => {
  if (isMysql) {
    const pool = getMysqlPool();
    const conn = await pool.getConnection();
    let released = false;
    return {
      query: async (text, params = []) => {
        const trimmed = text.trim().toUpperCase();
        if (trimmed === 'BEGIN') {
          await conn.beginTransaction();
          return { rows: [], rowCount: 0 };
        }
        if (trimmed === 'COMMIT') {
          await conn.commit();
          return { rows: [], rowCount: 0 };
        }
        if (trimmed === 'ROLLBACK') {
          await conn.rollback();
          return { rows: [], rowCount: 0 };
        }
        const { sql, params: formattedParams } = formatQuery(text, params);
        const [results] = await conn.query(sql, formattedParams);
        const isArray = Array.isArray(results);
        let rows = isArray ? results : [];
        if (!isArray && results && results.insertId) {
          rows = [{ id: results.insertId, insertId: results.insertId }];
        }
        return {
          rows,
          rowCount: isArray ? results.length : (results ? results.affectedRows || 0 : 0),
          insertId: results ? results.insertId : null
        };
      },
      release: () => {
        if (!released) {
          released = true;
          conn.release();
        }
      }
    };
  } else {
    return pgPool.connect();
  }
};

export const closeDb = async () => {
  if (mysqlPool) {
    console.log('🔌 Fechando pool de conexões do MySQL...');
    await mysqlPool.end();
    mysqlPool = null;
  }
  if (pgPool) {
    console.log('🔌 Fechando pool de conexões do PostgreSQL...');
    await pgPool.end();
    pgPool = null;
  }
};

// Inicialização automática do banco e carga de tabelas / sementes
export const initDb = async () => {
  try {
    if (isMysql) {
      const host = process.env.MYSQL_HOST || 'localhost';
      const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
      const user = process.env.MYSQL_USER || 'root';
      const password = process.env.MYSQL_PASSWORD || '';
      const dbName = process.env.MYSQL_DATABASE || 'lms_homeopatia';

      console.log(`🔌 Conectando ao MySQL local (${host}:${port})...`);
      
      // Conexão inicial para garantir a existência do banco de dados (fechada no final)
      const rootConn = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
      try {
        await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      } finally {
        await rootConn.end();
      }

      console.log(`✅ Banco de dados '${dbName}' verificado/criado.`);

      const pool = getMysqlPool();
      const schemaPath = path.join(__dirname, 'schema_mysql.sql');
      const seedPath = path.join(__dirname, 'seed_mysql.sql');

      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      const seedSql = fs.readFileSync(seedPath, 'utf8');

      console.log('📦 Executando criação de tabelas MySQL...');
      await pool.query(schemaSql);

      console.log('🌱 Populando dados de exemplo (Cursos, Livros, Módulos, Aulas, Professores, Alunos)...');
      await pool.query(seedSql);

      console.log('🎉 Banco de dados MySQL configurado e semeado com sucesso!');
    } else {
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      console.log('Tentando conectar ao banco de dados PostgreSQL...');
      await pgPool.query('SELECT NOW()');
      console.log('Conexão estabelecida. Inicializando tabelas e sementes...');
      await pgPool.query(schemaSql);
      console.log('Banco de dados PostgreSQL estruturado com sucesso!');
    }
  } catch (error) {
    console.error('⚠️ ERRO AO INICIALIZAR BANCO DE DADOS:');
    console.error('   ', error.message);
    throw error;
  }
};

const defaultPool = {
  query,
  connect,
  close: closeDb,
  end: closeDb
};

export default defaultPool;

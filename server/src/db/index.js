import mysql from 'mysql2/promise';
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isMysql = process.env.DB_TYPE === 'mysql' || Boolean(process.env.MYSQL_HOST);

let mysqlPool = null;
let pgPool = null;

if (isMysql) {
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'lms_homeopatia';

  mysqlPool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} else {
  const { Pool } = pg;
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
}

// Converter SQL PostgreSQL ($1, $2) para MySQL (?)
function formatQuery(text, params = []) {
  if (!isMysql) return { text, params };
  // Substitui $1, $2... por ?
  const sql = text.replace(/\$(\d+)/g, '?');
  return { sql, params };
}

// Adapter unificado para query
export const query = async (text, params = []) => {
  if (isMysql) {
    const { sql, params: formattedParams } = formatQuery(text, params);
    const [results] = await mysqlPool.query(sql, formattedParams);
    const isArray = Array.isArray(results);
    return {
      rows: isArray ? results : [],
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
    const conn = await mysqlPool.getConnection();
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
        return {
          rows: isArray ? results : [],
          rowCount: isArray ? results.length : (results ? results.affectedRows || 0 : 0),
          insertId: results ? results.insertId : null
        };
      },
      release: () => conn.release()
    };
  } else {
    return pgPool.connect();
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
      
      // Conexão inicial para garantir a existência do banco de dados
      const rootConn = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
      await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      await rootConn.end();

      console.log(`✅ Banco de dados '${dbName}' verificado/criado.`);

      const schemaPath = path.join(__dirname, 'schema_mysql.sql');
      const seedPath = path.join(__dirname, 'seed_mysql.sql');

      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      const seedSql = fs.readFileSync(seedPath, 'utf8');

      console.log('📦 Executando criação de tabelas MySQL...');
      await mysqlPool.query(schemaSql);

      console.log('🌱 Populando dados de exemplo (Cursos, Livros, Módulos, Aulas, Professores, Alunos)...');
      await mysqlPool.query(seedSql);

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
    console.error('💡 DICA: Se o MySQL estiver instalado na sua máquina, inicie o serviço MySQL (ex: no Painel do XAMPP, Laragon, WAMP ou Serviços do Windows).');
    console.error('💡 Se o MySQL estiver rodando em outra porta ou com senha, ajuste MYSQL_PORT e MYSQL_PASSWORD no arquivo server/.env');
    throw error;
  }
};

const defaultPool = {
  query,
  connect
};

export default defaultPool;

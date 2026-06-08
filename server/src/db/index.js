import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const query = (text, params) => pool.query(text, params);

export const initDb = async () => {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Tentando conectar ao banco de dados PostgreSQL...');
    // Testa a conexão
    await pool.query('SELECT NOW()');
    console.log('Conexão estabelecida. Inicializando tabelas e sementes...');
    await pool.query(schemaSql);
    console.log('Banco de dados estruturado e semeado com sucesso!');
  } catch (error) {
    console.error('⚠️ ERRO DE BANCO DE DADOS:', error.message);
    console.error('⚠️ Detalhe: Certifique-se de que o PostgreSQL está ativo e que o banco de dados configurado em DATABASE_URL no .env existe.');
  }
};

export default pool;

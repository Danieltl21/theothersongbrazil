import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { initDb, closeDb } from './db/index.js';

// Importação das Rotas
import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import paymentRoutes from './routes/payments.js';
import reportRoutes from './routes/reports.js';
import conciliationRoutes from './routes/conciliations.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares Globais
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor LMS Homeopatia ativo e rodando.' });
});

// API Health Check com verificação do Banco de Dados
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', database: 'CONNECTED', message: 'Servidor e Banco de dados ativos.' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', database: 'DISCONNECTED', message: 'Erro ao conectar ao banco de dados.' });
  }
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/conciliations', conciliationRoutes);

// Rota coringa / 404
app.use((req, res) => {
  res.status(404).json({ message: 'Rota de API não encontrada.' });
});

let server = null;

// Inicialização do Banco e do Servidor
const startServer = async () => {
  try {
    await initDb();

    server = app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`👉 Acesse a API local em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Erro ao iniciar servidor:', err.message);
    await closeDb().catch(() => {});
    process.exit(1);
  }
};

// Graceful Shutdown: Encerramento limpo de conexões ao receber sinais de reinício
let isShuttingDown = false;
const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n🛑 Recebido sinal ${signal}. Fechando servidor HTTP e pool de conexões do MySQL...`);

  if (server) {
    server.close(async () => {
      console.log('🚪 Servidor HTTP encerrado.');
      try {
        await closeDb();
        console.log('🔌 Pool do MySQL encerrado com sucesso.');
        process.exit(0);
      } catch (err) {
        console.error('⚠️ Erro ao fechar pool do MySQL:', err.message);
        process.exit(1);
      }
    });
  } else {
    try {
      await closeDb();
    } catch (e) {}
    process.exit(0);
  }

  // Timeout de segurança (5s)
  setTimeout(() => {
    console.error('⚠️ Forçando saída por tempo limite no encerramento (5s).');
    process.exit(1);
  }, 5000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Tratamento de reinício pelo Nodemon / Node --watch
process.once('SIGUSR2', async () => {
  console.log('🔄 Sinal SIGUSR2 (watch/reload) recebido. Fechando pool do MySQL...');
  try {
    await closeDb();
  } catch (e) {}
  process.kill(process.pid, 'SIGUSR2');
});

startServer();

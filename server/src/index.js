import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db/index.js';

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
app.use(express.json({ limit: '10mb' })); // Limite estendido para uploads de arquivos OFX como texto

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor LMS Homeopatia ativo e rodando.' });
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

// Inicialização do Banco e do Servidor
const startServer = async () => {
  // Inicializa o banco de dados PostgreSQL (cria tabelas e insere seeds)
  await initDb();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`👉 Acesse a API local em http://localhost:${PORT}`);
  });
};

startServer();

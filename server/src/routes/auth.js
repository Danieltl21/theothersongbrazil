import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Registro de Aluno (Com termos e registro profissional)
router.post('/register', async (req, res) => {
  const { name, email, password, registrationType, registrationNumber, acceptTerms } = req.body;

  if (!name || !email || !password || !registrationType || !registrationNumber || !acceptTerms) {
    return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verificar se e-mail já existe
    const checkEmail = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ message: 'E-mail já cadastrado.' });
    }

    // Criar hash da senha
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Inserir Usuário
    const userInsert = await client.query(
      'INSERT INTO users (name, email, password_hash, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [name, email, passwordHash, 'STUDENT', 'ACTIVE']
    );
    const userId = userInsert.rows[0].id;

    // Inserir Perfil de Aluno
    await client.query(
      'INSERT INTO student_profiles (user_id, terms_accepted, professional_registration_type, professional_registration_number) VALUES ($1, $2, $3, $4)',
      [userId, true, registrationType, registrationNumber]
    );

    // Matricular o aluno automaticamente em um curso livre padrão para que ele já comece com acesso!
    const freeCourse = await client.query("SELECT id FROM courses WHERE type = 'FREE' LIMIT 1");
    if (freeCourse.rows.length > 0) {
      await client.query(
        "INSERT INTO enrollments (student_id, course_id, expires_at, status) VALUES ($1, $2, NOW() + INTERVAL '180 days', 'ACTIVE')",
        [userId, freeCourse.rows[0].id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Cadastro realizado com sucesso! Matrícula no curso introdutório liberada por 6 meses.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Erro interno ao realizar cadastro.' });
  } finally {
    client.release();
  }
});

// Login com verificação de compartilhamento de senhas (Opção B)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Desconhecido';

  if (!email || !password) {
    return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
    }

    const user = userResult.rows[0];

    // Verificar se está suspenso
    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        message: 'Esta conta foi bloqueada temporariamente devido a acessos simultâneos de localizações distintas. Por favor, utilize o portal de desbloqueio para reativar seu acesso.',
        suspended: true
      });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
    }

    // Trava de login simultâneo (Opção B):
    // Se existir uma sessão ativa de um IP diferente, bloqueia a conta temporariamente!
    const activeSessions = await pool.query(
      'SELECT * FROM active_sessions WHERE user_id = $1 AND ip_address != $2',
      [user.id, ip]
    );

    if (activeSessions.rows.length > 0) {
      // Bloqueia a conta
      await pool.query("UPDATE users SET status = 'SUSPENDED' WHERE id = $1", [user.id]);
      // Remove todas as sessões ativas
      await pool.query('DELETE FROM active_sessions WHERE user_id = $1', [user.id]);
      
      // Registrar log de bloqueio de segurança
      await pool.query(
        'INSERT INTO access_logs (user_id, ip_address, user_agent, content_accessed) VALUES ($1, $2, $3, $4)',
        [user.id, ip, userAgent, 'CONCURRENT_LOGIN_LOCKOUT']
      );

      return res.status(403).json({
        message: '⚠️ BLOQUEIO DE SEGURANÇA: Foi detectada uma sessão ativa a partir de outro endereço IP. Sua conta foi suspensa temporariamente para evitar compartilhamento. Enviamos um alerta de segurança para seu e-mail.',
        suspended: true
      });
    }

    // Gerar Token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'super_secret_homeopathy_key_123!',
      { expiresIn: '24h' }
    );

    // Inserir sessão ativa
    await pool.query(
      'INSERT INTO active_sessions (user_id, token, ip_address, user_agent) VALUES ($1, $2, $3, $4)',
      [user.id, token, ip, userAgent]
    );

    // Registrar log
    await pool.query(
      'INSERT INTO access_logs (user_id, ip_address, user_agent, content_accessed) VALUES ($1, $2, $3, $4)',
      [user.id, ip, userAgent, 'LOGIN_SUCCESS']
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao processar login.' });
  }
});

// Deslogar sessão
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM active_sessions WHERE token = $1', [req.token]);
    res.json({ message: 'Sessão encerrada com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deslogar.' });
  }
});

// Desbloquear Conta (Fluxo simulado de verificação de e-mail)
router.post('/unlock', async (req, res) => {
  const { email, password, verificationCode } = req.body;

  if (!email || !password || !verificationCode) {
    return res.status(400).json({ message: 'Todos os campos de validação são necessários.' });
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: 'Senha inválida.' });
    }

    if (verificationCode !== '123456') { // Mockup de código enviado para o e-mail
      return res.status(400).json({ message: 'Código de verificação de segurança inválido ou expirado.' });
    }

    // Desbloquear usuário
    await pool.query("UPDATE users SET status = 'ACTIVE' WHERE id = $1", [user.id]);

    // Registrar log
    await pool.query(
      'INSERT INTO access_logs (user_id, ip_address, user_agent, content_accessed) VALUES ($1, $2, $3, $4)',
      [user.id, '127.0.0.1', 'SYSTEM', 'ACCOUNT_UNLOCKED']
    );

    res.json({ message: 'Conta desbloqueada com sucesso! Você já pode realizar o login.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao desbloquear conta.' });
  }
});

// Carregar Perfil do Usuário Logado
router.get('/me', authenticateToken, async (req, res) => {
  try {
    let profileData = {};
    if (req.user.role === 'STUDENT') {
      const sp = await pool.query('SELECT * FROM student_profiles WHERE user_id = $1', [req.user.id]);
      profileData = sp.rows[0] || {};
    } else if (req.user.role === 'TEACHER') {
      const tp = await pool.query('SELECT * FROM teacher_profiles WHERE user_id = $1', [req.user.id]);
      profileData = tp.rows[0] || {};
    }

    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        ...profileData
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao carregar dados do usuário.' });
  }
});

export default router;

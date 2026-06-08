import jwt from 'jsonwebtoken';
import pool from '../db/index.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_homeopathy_key_123!');
    
    // Verificar se o usuário existe e se está ativo
    const userResult = await pool.query(
      'SELECT id, name, email, role, status FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const user = userResult.rows[0];

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ 
        message: user.status === 'SUSPENDED' 
          ? 'Sua conta foi suspensa temporariamente devido a logins múltiplos suspeitos. Entre em contato com o suporte ou realize o desbloqueio.'
          : 'Sua conta está inativa.'
      });
    }

    // Verificar se a sessão ainda é válida no active_sessions
    const sessionResult = await pool.query(
      'SELECT * FROM active_sessions WHERE user_id = $1 AND token = $2',
      [user.id, token]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ message: 'Sessão expirada ou invalidada por outro login.' });
    }

    // Atualizar última atividade da sessão
    await pool.query(
      'UPDATE active_sessions SET last_activity = NOW() WHERE token = $2',
      [user.id, token]
    );

    // Registrar o log de acesso básico para segurança
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Desconhecido';
    
    await pool.query(
      'INSERT INTO access_logs (user_id, ip_address, user_agent, content_accessed) VALUES ($1, $2, $3, $4)',
      [user.id, ip, userAgent, req.originalUrl]
    );

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido ou expirado.' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acesso negado: privilégios insuficientes.' });
    }
    next();
  };
};

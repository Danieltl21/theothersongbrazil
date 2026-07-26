import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Registro de Aluno (Com termos e registro profissional)
router.post('/register', async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    cpf,
    profession,
    custom_profession,
    council_type,
    council_number,
    council_state,
    specialty,
    billing_zip,
    billing_street,
    billing_number,
    billing_complement,
    billing_neighborhood,
    billing_city,
    billing_state,
    commercial_zip,
    commercial_street,
    commercial_number,
    commercial_complement,
    commercial_neighborhood,
    commercial_city,
    commercial_state,
    commercial_phone,
    acceptGeneralTerms,
    acceptSigiloTerms
  } = req.body;

  // Validação dos campos comuns obrigatórios
  if (
    !name || !email || !password || !phone || !cpf ||
    !billing_zip || !billing_street || !billing_number || !billing_neighborhood || !billing_city || !billing_state ||
    !profession || !acceptGeneralTerms
  ) {
    return res.status(400).json({ message: 'Todos os campos obrigatórios de identificação e endereço de cobrança devem ser preenchidos.' });
  }

  // Validação de saúde vs outro
  const isHealthProfession = [
    'médico(a)', 'odontologista', 'veterinário(a)', 'farmaceutico(a)',
    'Médico(a)', 'Odontologista', 'Veterinário(a)', 'Farmacêutico(a)'
  ].includes(profession);
  if (isHealthProfession) {
    if (
      !council_type || !council_state || !council_number ||
      !commercial_zip || !commercial_street || !commercial_number || !commercial_neighborhood || !commercial_city || !commercial_state || !commercial_phone ||
      !acceptSigiloTerms
    ) {
      return res.status(400).json({ message: 'Para profissionais da área da saúde, os campos de registro profissional, endereço comercial e termo de sigilo são obrigatórios.' });
    }
  } else if (profession === 'outro' || profession === 'Outro') {
    if (!custom_profession) {
      return res.status(400).json({ message: 'Por favor, informe o nome da sua profissão.' });
    }
  } else {
    return res.status(400).json({ message: 'Profissão inválida.' });
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
      `INSERT INTO users (
        name, email, password_hash, role, status, is_homeopath,
        phone, cpf, profession, custom_profession, council_type, council_number, council_state, specialty,
        billing_zip, billing_street, billing_number, billing_complement, billing_neighborhood, billing_city, billing_state,
        commercial_zip, commercial_street, commercial_number, commercial_complement, commercial_neighborhood, commercial_city, commercial_state,
        commercial_phone, terms_accepted, terms_accepted_at, general_terms_accepted, general_terms_accepted_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20, $21,
        $22, $23, $24, $25, $26, $27, $28,
        $29, $30, $31, $32, $33
      ) RETURNING id`,
      [
        name, email, passwordHash, 'STUDENT', 'ACTIVE', false, // por padrão começa desativado
        phone, cpf, profession, isHealthProfession ? null : custom_profession,
        isHealthProfession ? council_type : null,
        isHealthProfession ? council_number : null,
        isHealthProfession ? council_state : null,
        isHealthProfession ? specialty : null,
        billing_zip, billing_street, billing_number, billing_complement, billing_neighborhood, billing_city, billing_state,
        isHealthProfession ? commercial_zip : null,
        isHealthProfession ? commercial_street : null,
        isHealthProfession ? commercial_number : null,
        isHealthProfession ? commercial_complement : null,
        isHealthProfession ? commercial_neighborhood : null,
        isHealthProfession ? commercial_city : null,
        isHealthProfession ? commercial_state : null,
        isHealthProfession ? commercial_phone : null,
        isHealthProfession ? !!acceptSigiloTerms : false,
        isHealthProfession ? new Date() : null,
        !!acceptGeneralTerms,
        new Date()
      ]
    );
    const userId = userInsert.rows[0].id;

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
        role: user.role,
        is_homeopath: user.is_homeopath
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
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    const user = userResult.rows[0];
    delete user.password_hash;
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao carregar dados do usuário.' });
  }
});

// Atualizar Perfil do Aluno ou Professor
router.put('/profile', authenticateToken, async (req, res) => {
  const {
    name,
    email,
    phone,
    cpf,
    profession,
    custom_profession,
    council_type,
    council_number,
    council_state,
    specialty,
    rqe,
    bio,
    billing_zip,
    billing_street,
    billing_number,
    billing_complement,
    billing_neighborhood,
    billing_city,
    billing_state,
    commercial_zip,
    commercial_street,
    commercial_number,
    commercial_complement,
    commercial_neighborhood,
    commercial_city,
    commercial_state,
    commercial_phone,
    is_homeopath
  } = req.body;

  try {
    await pool.query(
      `UPDATE users SET 
        name = $1, 
        email = $2, 
        phone = $3, 
        cpf = $4, 
        profession = $5, 
        custom_profession = $6, 
        council_type = $7, 
        council_number = $8, 
        council_state = $9, 
        specialty = $10, 
        rqe = $11, 
        bio = $12, 
        billing_zip = $13, 
        billing_street = $14, 
        billing_number = $15, 
        billing_complement = $16, 
        billing_neighborhood = $17, 
        billing_city = $18, 
        billing_state = $19, 
        commercial_zip = $20, 
        commercial_street = $21, 
        commercial_number = $22, 
        commercial_complement = $23, 
        commercial_neighborhood = $24, 
        commercial_city = $25, 
        commercial_state = $26, 
        commercial_phone = $27, 
        is_homeopath = $28
       WHERE id = $29`,
      [
        name,
        email,
        phone,
        cpf,
        profession,
        custom_profession,
        council_type,
        council_number,
        council_state,
        specialty,
        rqe,
        bio,
        billing_zip,
        billing_street,
        billing_number,
        billing_complement,
        billing_neighborhood,
        billing_city,
        billing_state,
        commercial_zip,
        commercial_street,
        commercial_number,
        commercial_complement,
        commercial_neighborhood,
        commercial_city,
        commercial_state,
        commercial_phone,
        is_homeopath === undefined ? req.user.is_homeopath : !!is_homeopath,
        req.user.id
      ]
    );

    res.json({ message: 'Perfil atualizado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar perfil.' });
  }
});

// Obter lista de homeopatas cadastrados (Público)
router.get('/homeopaths', async (req, res) => {
  try {
    const queryStr = `
      SELECT id, name, email, role, profession, custom_profession,
             council_type, council_number, council_state, specialty, rqe, bio,
             commercial_city, commercial_state, commercial_phone
      FROM users
      WHERE is_homeopath = TRUE AND status = 'ACTIVE'
      ORDER BY name ASC
    `;
    const result = await pool.query(queryStr);
    
    const homeopaths = result.rows.map(row => {
      let reg = '';
      if (row.council_type && row.council_number) {
        reg = `${row.council_type}-${row.council_state || ''} ${row.council_number}`;
      }
      
      let specialty = row.specialty || '';
      let city = (row.commercial_city && row.commercial_state) ? `${row.commercial_city} - ${row.commercial_state}` : 'Não informado';
      
      return {
        name: row.name,
        reg: reg.trim(),
        profession: row.profession === 'outro' ? row.custom_profession : row.profession,
        specialty: specialty,
        city: city,
        phone: row.commercial_phone || '',
        email: row.email
      };
    });
    
    res.json(homeopaths);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar lista de homeopatas.' });
  }
});

export default router;

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/index.js';
import { authenticateToken } from '../middlewares/auth.js';
import { sendEmail } from '../utils/mailer.js';

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

    // Criar hash da senha e ID único
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = uuidv4();

    // Inserir Usuário
    await client.query(
      `INSERT INTO users (
        id, name, email, password_hash, role, status, is_homeopath,
        phone, cpf, profession, custom_profession, council_type, council_number, council_state, specialty,
        billing_zip, billing_street, billing_number, billing_complement, billing_neighborhood, billing_city, billing_state,
        commercial_zip, commercial_street, commercial_number, commercial_complement, commercial_neighborhood, commercial_city, commercial_state,
        commercial_phone, terms_accepted, terms_accepted_at, general_terms_accepted, general_terms_accepted_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22,
        $23, $24, $25, $26, $27, $28, $29,
        $30, $31, $32, $33, $34
      )`,
      [
        userId, name, email, passwordHash, 'STUDENT', 'ACTIVE', false, // por padrão começa desativado
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

    // Matricular o aluno automaticamente em um curso livre padrão para que ele já comece com acesso!
    const freeCourse = await client.query("SELECT id FROM courses WHERE type = 'FREE' LIMIT 1");
    if (freeCourse.rows.length > 0) {
      const enrollmentId = uuidv4();
      const expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
      await client.query(
        "INSERT INTO enrollments (id, student_id, course_id, expires_at, status) VALUES ($1, $2, $3, $4, 'ACTIVE')",
        [enrollmentId, userId, freeCourse.rows[0].id, expiresAt]
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
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro ao atualizar dados do perfil.' });
  }
});

// SOLICITAR REDEFINIÇÃO DE SENHA (ESQUECI A SENHA)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'E-mail é obrigatório.' });
  }

  try {
    const userResult = await pool.query('SELECT id, name, email FROM users WHERE LOWER(email) = $1', [email.trim().toLowerCase()]);
    if (userResult.rows.length === 0) {
      return res.json({ message: 'Se o e-mail estiver cadastrado em nosso sistema, enviamos as instruções de redefinição para sua caixa de entrada.' });
    }

    const user = userResult.rows[0];
    const token = 'RST_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(
      'INSERT INTO password_resets (email, token, expires_at) VALUES ($1, $2, $3)',
      [user.email, token, expiresAt]
    );

    const clientOrigin = req.headers.origin || 'http://localhost:3000';
    const resetLink = `${clientOrigin}/#redefinir-senha?token=${token}&email=${encodeURIComponent(user.email)}`;

    // Disparar e-mail transacional via Resend
    await sendEmail({
      to: user.email,
      subject: '🔑 Recuperação de Senha - The Other Song Brasil',
      text: `Olá ${user.name},\n\nRecebemos uma solicitação para redefinir a senha da sua conta no portal EAD TOSB.\n\nCódigo do Token: ${token}\nLink Direto: ${resetLink}\n\nAtenciosamente,\nEquipe TOSB Brasil`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e293b; text-align: center;">🌿 The Other Song Brasil</h2>
          <h3 style="color: #0f766e;">Recuperação de Senha de Acesso</h3>
          <p>Olá <strong>${user.name}</strong>,</p>
          <p>Recebemos uma solicitação para redefinir a senha da sua conta no portal de ensino EAD.</p>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
            <span style="font-size: 14px; color: #64748b; display: block; margin-bottom: 5px;">Seu Código do Token:</span>
            <strong style="font-size: 24px; letter-spacing: 2px; color: #0f766e;">${token}</strong>
          </div>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetLink}" style="background-color: #0f766e; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Redefinir Senha Agora ➔</a>
          </div>
          <p style="font-size: 12px; color: #64748b;">Se você não solicitou a alteração de senha, pode desconsiderar esta mensagem com segurança.</p>
        </div>
      `
    }).catch(err => console.error('[MAILER WARNING] Erro ao disparar e-mail:', err));

    console.log(`[AUTH LOG] Solicitado reset de senha para ${user.email}. Token gerado: ${token}`);

    res.json({
      message: 'Se o e-mail estiver cadastrado em nosso sistema, enviamos as instruções e o código de verificação para sua caixa de entrada.'
    });
  } catch (error) {
    console.error('Erro ao solicitar reset de senha:', error);
    res.status(500).json({ message: 'Erro ao processar solicitação de senha.' });
  }
});

// CONFIRMAR E REDEFINIR A NOVA SENHA
router.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;

  if (!email || !token || !newPassword) {
    return res.status(400).json({ message: 'E-mail, token e nova senha são obrigatórios.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'A nova senha deve ter no mínimo 6 caracteres.' });
  }

  try {
    const resetResult = await pool.query(
      `SELECT * FROM password_resets 
       WHERE LOWER(email) = $1 AND token = $2 AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email.trim().toLowerCase(), token.trim()]
    );

    if (resetResult.rows.length === 0) {
      return res.status(400).json({ message: 'Código de token inválido, expirado ou já utilizado. Por favor, solicite um novo código.' });
    }

    const resetRecord = resetResult.rows[0];
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE LOWER(email) = $2',
      [passwordHash, email.trim().toLowerCase()]
    );

    await pool.query(
      'UPDATE password_resets SET used = TRUE WHERE id = $1',
      [resetRecord.id]
    );

    res.json({ message: 'Senha redefinida com sucesso! Você já pode realizar o login com sua nova senha.' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ message: 'Erro ao salvar nova senha.' });
  }
});



// Atualizar Usuário por ADM (Incluindo Dados Bancários e Moeda de Pagamento)
router.put('/admin/users/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Acesso negado.' });
  const targetId = req.params.id;
  const {
    name, email, role, status, is_homeopath, phone, cpf, profession, custom_profession,
    council_type, council_number, council_state, specialty, rqe, bio,
    bank_name, bank_agency, bank_account, pix_key, payout_currency
  } = req.body;

  try {
    await pool.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        role = COALESCE($3, role),
        status = COALESCE($4, status),
        is_homeopath = COALESCE($5, is_homeopath),
        phone = COALESCE($6, phone),
        cpf = COALESCE($7, cpf),
        profession = COALESCE($8, profession),
        custom_profession = COALESCE($9, custom_profession),
        council_type = COALESCE($10, council_type),
        council_number = COALESCE($11, council_number),
        council_state = COALESCE($12, council_state),
        specialty = COALESCE($13, specialty),
        rqe = COALESCE($14, rqe),
        bio = COALESCE($15, bio),
        bank_name = COALESCE($16, bank_name),
        bank_agency = COALESCE($17, bank_agency),
        bank_account = COALESCE($18, bank_account),
        pix_key = COALESCE($19, pix_key),
        payout_currency = COALESCE($20, payout_currency)
       WHERE id = $21`,
      [
        name, email, role, status, is_homeopath, phone, cpf, profession, custom_profession,
        council_type, council_number, council_state, specialty, rqe, bio,
        bank_name, bank_agency, bank_account, pix_key, payout_currency, targetId
      ]
    );

    res.json({ message: 'Dados do usuário atualizados com sucesso pelo Administrador!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar usuário pelo ADM.' });
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

import pool from '../src/db/index.js';
import bcrypt from 'bcryptjs';

async function testLogins() {
  const usersToTest = [
    { email: 'admin@theothersongbrazil.com.br', pass: 'admin123' },
    { email: 'rajan@theothersongbrazil.com.br', pass: 'senha123' },
    { email: 'anapaula@gmail.com', pass: 'senha123' }
  ];

  for (const { email, pass } of usersToTest) {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (res.rows.length === 0) {
      console.log(`❌ USUÁRIO NÃO ENCONTRADO: ${email}`);
    } else {
      const user = res.rows[0];
      const match = await bcrypt.compare(pass, user.password_hash);
      console.log(`✅ ${email} (${user.role}): Login ${match ? 'SUCESSO 🔓' : 'FALHOU 🔒'}`);
    }
  }

  process.exit(0);
}

testLogins().catch(console.error);

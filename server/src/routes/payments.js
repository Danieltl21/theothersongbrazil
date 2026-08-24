import express from 'express';
import pool from '../db/index.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Middleware auxiliar para verificar inadimplência do aluno antes de acessar rotas
export const checkDelinquency = async (studentId) => {
  try {
    // Buscar faturas vencidas há mais de 10 dias
    const overduePaymentsResult = await pool.query(
      "SELECT DISTINCT course_id FROM payments " +
      "WHERE student_id = $1 AND status = 'PENDING' AND due_date < CURRENT_DATE - INTERVAL '10 days'",
      [studentId]
    );

    if (overduePaymentsResult.rows.length > 0) {
      const courseIds = overduePaymentsResult.rows.map(row => row.course_id);
      
      // Suspender as matrículas correspondentes
      await pool.query(
        "UPDATE enrollments SET status = 'SUSPENDED' " +
        "WHERE student_id = $1 AND course_id = ANY($2) AND status = 'ACTIVE'",
        [studentId, courseIds]
      );
      console.log(`Matrículas dos cursos [${courseIds.join(', ')}] suspensas por inadimplência superior a 10 dias para o aluno ${studentId}`);
    }
  } catch (error) {
    console.error('Erro na verificação de inadimplência:', error);
  }
};

// Obter histórico de faturas do Aluno
router.get('/my-invoices', authenticateToken, async (req, res) => {
  const studentId = req.user.id;
  try {
    // Verificar inadimplência em tempo real ao carregar faturas
    await checkDelinquency(studentId);

    const invoices = await pool.query(
      'SELECT p.*, COALESCE(c.title, b.title, \'Item\') as course_title FROM payments p ' +
      'LEFT JOIN courses c ON c.id = p.course_id ' +
      'LEFT JOIN books b ON b.id = p.book_id ' +
      'WHERE p.student_id = $1 ORDER BY p.due_date DESC',
      [studentId]
    );

    res.json(invoices.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao carregar faturas.' });
  }
});

// Obter histórico de pedidos do Aluno
router.get('/my-orders', authenticateToken, async (req, res) => {
  const studentId = req.user.id;
  try {
    const ordersResult = await pool.query(
      'SELECT o.*, COALESCE(c.title, b.title, \'Item\') as item_title FROM orders o ' +
      'LEFT JOIN courses c ON c.id = o.course_id ' +
      'LEFT JOIN books b ON b.id = o.book_id ' +
      'WHERE o.student_id = $1 ORDER BY o.created_at DESC',
      [studentId]
    );

    const paymentsResult = await pool.query(
      'SELECT * FROM payments WHERE student_id = $1 ORDER BY due_date ASC',
      [studentId]
    );

    const orders = ordersResult.rows.map(order => ({
      ...order,
      payments: paymentsResult.rows.filter(p => p.order_id === order.id)
    }));

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao carregar pedidos.' });
  }
});

// Criar Cobrança (Simulando Integração com Asaas Sandbox)
// Cria a cobrança (Order + Payments) no banco local com código de transação
router.post('/checkout', authenticateToken, async (req, res) => {
  const { itemType, courseId, bookId, paymentMethod, installments, quantity } = req.body;
  const studentId = req.user.id;
  
  const type = itemType || (courseId ? 'course' : 'book');
  const qty = quantity || 1;

  if ((!courseId && !bookId) || !paymentMethod) {
    return res.status(400).json({ message: 'Item e método de pagamento são obrigatórios.' });
  }

  try {
    let price = 0.00;
    
    if (type === 'course') {
      const courseResult = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
      if (courseResult.rows.length === 0) return res.status(404).json({ message: 'Curso não encontrado.' });
      const course = courseResult.rows[0];
      
      if (course.type === 'SUBSCRIPTION') {
        price = 99.00;
      } else if (course.type === 'POSTGRAD') {
        price = 3600.00;
      } else if (course.type === 'FREE') {
        return res.status(400).json({ message: 'Cursos gratuitos não necessitam de checkout.' });
      } else {
        price = 1200.00; // Valor fallback para INPERSON/SEMINAR
      }
    } else {
      const bookResult = await pool.query('SELECT * FROM books WHERE id = $1', [bookId]);
      if (bookResult.rows.length === 0) return res.status(404).json({ message: 'Livro não encontrado.' });
      price = parseFloat(bookResult.rows[0].price);
    }
    
    const totalAmount = price * qty;
    const transactionCode = 'ASAAS_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const asaasPaymentId = 'pay_' + Math.random().toString(36).substr(2, 12);
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // 1. Criar a Order (Pedido)
      const orderResult = await client.query(
        'INSERT INTO orders (student_id, course_id, book_id, item_type, total_amount, installments, payment_method, status) ' +
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [studentId, courseId || null, bookId || null, type, totalAmount, installments || 1, paymentMethod, 'PENDING']
      );
      const order = orderResult.rows[0];

      const invoicesCreated = [];
      const numberOfInstallments = installments || 1;
      
      if ((paymentMethod === 'CARNE' || paymentMethod === 'CREDIT_CARD') && numberOfInstallments > 1) {
        const installmentAmount = (totalAmount / numberOfInstallments).toFixed(2);
        for (let i = 1; i <= numberOfInstallments; i++) {
          const installmentCode = `${transactionCode}_PARC${i}`;
          const installmentAsaasId = `${asaasPaymentId}_${i}`;
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + (i - 1));

          const paymentResult = await client.query(
            'INSERT INTO payments (order_id, student_id, course_id, book_id, asaas_payment_id, transaction_code, amount, payment_method, status, due_date) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [order.id, studentId, courseId || null, bookId || null, installmentAsaasId, installmentCode, installmentAmount, paymentMethod, 'PENDING', dueDate]
          );
          invoicesCreated.push(paymentResult.rows[0]);
        }
      } else {
        const dueDate = new Date();
        if (paymentMethod === 'BOLETO' || paymentMethod === 'BOLETO_PROGRAMADO') dueDate.setDate(dueDate.getDate() + 3);

        const paymentResult = await client.query(
          'INSERT INTO payments (order_id, student_id, course_id, book_id, asaas_payment_id, transaction_code, amount, payment_method, status, due_date) ' +
          'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
          [order.id, studentId, courseId || null, bookId || null, asaasPaymentId, transactionCode, totalAmount, paymentMethod, 'PENDING', dueDate]
        );
        invoicesCreated.push(paymentResult.rows[0]);
      }

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Pedido e Fatura(s) gerados com sucesso.',
        checkoutUrl: 'https://sandbox.asaas.com/checkout/simulado',
        order,
        invoices: invoicesCreated,
        transactionCode
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao gerar checkout.' });
  }
});

// Webhook para simulação/processamento do Asaas
// Libera o curso pós-pagamento
router.post('/webhook/asaas', async (req, res) => {
  const { event, payment } = req.body;
  const token = req.headers['asaas-access-token'];

  // Validar o token de webhook das variáveis de ambiente
  if (token !== (process.env.WEBHOOK_TOKEN || 'homeopathy_webhook_secret_token_abc')) {
    return res.status(401).json({ message: 'Token de webhook inválido.' });
  }

  // Eventos de sucesso do Asaas: PAYMENT_RECEIVED ou PAYMENT_CONFIRMED
  if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
    const asaasPaymentId = payment.id;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Buscar faturas locais pelo asaasPaymentId ou asaasPaymentId de parcelas
      // Como o carnê gera IDs compostos 'pay_xxx_1', usamos LIKE
      const checkPayment = await client.query(
        'SELECT * FROM payments WHERE asaas_payment_id = $1 OR asaas_payment_id LIKE $2',
        [asaasPaymentId, `${asaasPaymentId}_%`]
      );

      if (checkPayment.rows.length > 0) {
        const localPayment = checkPayment.rows[0];

        // Atualizar pagamento para recebido
        await client.query(
          "UPDATE payments SET status = 'RECEIVED', paid_at = NOW() WHERE id = $1",
          [localPayment.id]
        );

        // Buscar curso para saber a duração de acesso
        const courseResult = await client.query('SELECT duration_days FROM courses WHERE id = $1', [localPayment.course_id]);
        const durationDays = courseResult.rows[0].duration_days;

        // Criar ou atualizar matrícula para ACTIVE
        const checkEnroll = await client.query(
          'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
          [localPayment.student_id, localPayment.course_id]
        );

        if (checkEnroll.rows.length > 0) {
          // Reativar e estender data
          await client.query(
            "UPDATE enrollments SET status = 'ACTIVE', expires_at = NOW() + ($1 || ' days')::INTERVAL WHERE id = $2",
            [durationDays, checkEnroll.rows[0].id]
          );
        } else {
          // Criar nova matrícula
          await client.query(
            "INSERT INTO enrollments (student_id, course_id, expires_at, status) VALUES ($1, $2, NOW() + ($3 || ' days')::INTERVAL, 'ACTIVE')",
            [localPayment.student_id, localPayment.course_id, durationDays]
          );
        }
      }

      await client.query('COMMIT');
      res.json({ success: true, message: 'Confirmação de pagamento webhook processada.' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro no webhook de pagamento:', error);
      res.status(500).json({ error: 'Erro interno ao processar webhook.' });
    } finally {
      client.release();
    }
  } else {
    res.json({ success: true, message: 'Evento ignorado pelo webhook.' });
  }
});

// Endpoint de Simulação (Para facilitar o teste de webhook local no frontend)
router.post('/simulate-webhook', authenticateToken, async (req, res) => {
  const { asaasPaymentId } = req.body;

  if (!asaasPaymentId) {
    return res.status(400).json({ message: 'ID da fatura Asaas obrigatório.' });
  }

  try {
    const checkPayment = await pool.query('SELECT * FROM payments WHERE asaas_payment_id = $1', [asaasPaymentId]);
    if (checkPayment.rows.length === 0) {
      return res.status(404).json({ message: 'Pagamento não localizado no banco local.' });
    }

    const localPayment = checkPayment.rows[0];

    // Fazer uma chamada simulada ao webhook local
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        "UPDATE payments SET status = 'RECEIVED', paid_at = NOW() WHERE id = $1",
        [localPayment.id]
      );

      const courseResult = await client.query('SELECT duration_days FROM courses WHERE id = $1', [localPayment.course_id]);
      const durationDays = courseResult.rows[0].duration_days;

      const checkEnroll = await client.query(
        'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
        [localPayment.student_id, localPayment.course_id]
      );

      if (checkEnroll.rows.length > 0) {
        await client.query(
          "UPDATE enrollments SET status = 'ACTIVE', expires_at = NOW() + ($1 || ' days')::INTERVAL WHERE id = $2",
          [durationDays, checkEnroll.rows[0].id]
        );
      } else {
        await client.query(
          "INSERT INTO enrollments (student_id, course_id, expires_at, status) VALUES ($1, $2, NOW() + ($3 || ' days')::INTERVAL, 'ACTIVE')",
          [localPayment.student_id, localPayment.course_id, durationDays]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'Sucesso: Pagamento simulado com sucesso. Matrícula ativada.' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao processar simulação.' });
  }
});

// Relatório financeiro para dashboard do administrador (Vendas por mês, MRR, Inadimplência)
router.get('/admin-finance-report', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    // 1. Receita total líquida recebida
    const receivedRevenue = await pool.query(
      "SELECT SUM(amount) as total FROM payments WHERE status = 'RECEIVED'"
    );

    // 2. Receita prevista em aberto (Boletos pendentes)
    const pendingRevenue = await pool.query(
      "SELECT SUM(amount) as total FROM payments WHERE status = 'PENDING'"
    );

    // 3. Taxa de inadimplência (Quantidade de faturas OVERDUE + PENDING vencidas)
    const overdueRevenue = await pool.query(
      "SELECT SUM(amount) as total FROM payments WHERE status IN ('OVERDUE') OR (status = 'PENDING' AND due_date < CURRENT_DATE)"
    );

    // 4. Receita recorrente mensal (MRR) aproximada das assinaturas ativas
    const mrrResult = await pool.query(
      "SELECT SUM(p.amount) as mrr FROM payments p " +
      "JOIN courses c ON c.id = p.course_id " +
      "WHERE c.type = 'SUBSCRIPTION' AND p.status = 'RECEIVED' " +
      "AND p.paid_at >= NOW() - INTERVAL '30 days'"
    );

    // 5. Contagem de vendas por método
    const salesByMethod = await pool.query(
      "SELECT payment_method, COUNT(*)::int as count, SUM(amount) as total FROM payments GROUP BY payment_method"
    );

    // 6. Total de despesas pagas
    const expensesResult = await pool.query(
      "SELECT SUM(amount) as total FROM expenses WHERE status = 'PAID'"
    );

    // 7. Total de honorários pagos
    const payoutsResult = await pool.query(
      "SELECT SUM(amount) as total FROM teacher_payouts WHERE status = 'PAID'"
    );

    res.json({
      summary: {
        totalReceived: parseFloat(receivedRevenue.rows[0].total || 0),
        totalPending: parseFloat(pendingRevenue.rows[0].total || 0),
        totalOverdue: parseFloat(overdueRevenue.rows[0].total || 0),
        mrr: parseFloat(mrrResult.rows[0].mrr || 0),
        totalExpenses: parseFloat(expensesResult.rows[0].total || 0),
        totalPayouts: parseFloat(payoutsResult.rows[0].total || 0)
      },
      salesByMethod: salesByMethod.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao obter relatório financeiro.' });
  }
});

// Registrar Despesa
router.post('/expenses', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  const { description, category, amount, date, status, receipt_proof_url } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO expenses (description, category, amount, date, status, receipt_proof_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [description, category, amount, date, status, receipt_proof_url]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao registrar despesa.' });
  }
});

// Listar Despesas
router.get('/expenses', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao listar despesas.' });
  }
});

// Confirmar pagamento manualmente
router.put('/:id/confirm-transfer', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { receipt_proof_url, transaction_code } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Atualiza pagamento
    const paymentResult = await client.query(
      "UPDATE payments SET status = 'RECEIVED', paid_at = NOW(), receipt_proof_url = $1, transaction_code = COALESCE($2, transaction_code) WHERE id = $3 RETURNING *",
      [receipt_proof_url, transaction_code, id]
    );
    
    if (paymentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Pagamento não encontrado.' });
    }
    
    const localPayment = paymentResult.rows[0];
    
    // Buscar curso
    const courseResult = await client.query('SELECT duration_days FROM courses WHERE id = $1', [localPayment.course_id]);
    if (courseResult.rows.length > 0) {
      const durationDays = courseResult.rows[0].duration_days;
      
      const checkEnroll = await client.query(
        'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
        [localPayment.student_id, localPayment.course_id]
      );

      if (checkEnroll.rows.length > 0) {
        await client.query(
          "UPDATE enrollments SET status = 'ACTIVE', expires_at = NOW() + ($1 || ' days')::INTERVAL WHERE id = $2",
          [durationDays, checkEnroll.rows[0].id]
        );
      } else {
        await client.query(
          "INSERT INTO enrollments (student_id, course_id, expires_at, status) VALUES ($1, $2, NOW() + ($3 || ' days')::INTERVAL, 'ACTIVE')",
          [localPayment.student_id, localPayment.course_id, durationDays]
        );
      }
    }
    
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Erro ao confirmar pagamento.' });
  } finally {
    client.release();
  }
});

// Simular pagamento Asaas no modo sandbox/desenvolvimento
router.post('/simulate-asaas-payment', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  const { asaasPaymentId } = req.body;

  if (!asaasPaymentId) {
    return res.status(400).json({ message: 'ID da fatura Asaas obrigatório.' });
  }

  try {
    const checkPayment = await pool.query('SELECT * FROM payments WHERE asaas_payment_id = $1', [asaasPaymentId]);
    if (checkPayment.rows.length === 0) {
      return res.status(404).json({ message: 'Pagamento não localizado no banco local.' });
    }

    const localPayment = checkPayment.rows[0];

    // Fazer uma chamada simulada ao webhook local
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        "UPDATE payments SET status = 'RECEIVED', paid_at = NOW() WHERE id = $1",
        [localPayment.id]
      );

      const courseResult = await client.query('SELECT duration_days FROM courses WHERE id = $1', [localPayment.course_id]);
      const durationDays = courseResult.rows[0].duration_days;

      const checkEnroll = await client.query(
        'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
        [localPayment.student_id, localPayment.course_id]
      );

      if (checkEnroll.rows.length > 0) {
        await client.query(
          "UPDATE enrollments SET status = 'ACTIVE', expires_at = NOW() + ($1 || ' days')::INTERVAL WHERE id = $2",
          [durationDays, checkEnroll.rows[0].id]
        );
      } else {
        await client.query(
          "INSERT INTO enrollments (student_id, course_id, expires_at, status) VALUES ($1, $2, NOW() + ($3 || ' days')::INTERVAL, 'ACTIVE')",
          [localPayment.student_id, localPayment.course_id, durationDays]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'Sucesso: Pagamento simulado com sucesso. Matrícula ativada.' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao processar simulação.' });
  }
});

// Relatório financeiro para dashboard do administrador (Vendas por mês, MRR, Inadimplência)
router.get('/admin-finance-report', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    // 1. Receita total líquida recebida
    const receivedRevenue = await pool.query(
      "SELECT SUM(amount) as total FROM payments WHERE status = 'RECEIVED'"
    );

    // 2. Receita prevista em aberto (Boletos pendentes)
    const pendingRevenue = await pool.query(
      "SELECT SUM(amount) as total FROM payments WHERE status = 'PENDING'"
    );

    // 3. Taxa de inadimplência (Quantidade de faturas OVERDUE + PENDING vencidas)
    const overdueRevenue = await pool.query(
      "SELECT SUM(amount) as total FROM payments WHERE status IN ('OVERDUE') OR (status = 'PENDING' AND due_date < CURRENT_DATE)"
    );

    // 4. Receita recorrente mensal (MRR) aproximada das assinaturas ativas
    const mrrResult = await pool.query(
      "SELECT SUM(p.amount) as mrr FROM payments p " +
      "JOIN courses c ON c.id = p.course_id " +
      "WHERE c.type = 'SUBSCRIPTION' AND p.status = 'RECEIVED' " +
      "AND p.paid_at >= NOW() - INTERVAL '30 days'"
    );

    // 5. Contagem de vendas por método
    const salesByMethod = await pool.query(
      "SELECT payment_method, COUNT(*)::int as count, SUM(amount) as total FROM payments GROUP BY payment_method"
    );

    // 6. Total de despesas pagas
    const expensesResult = await pool.query(
      "SELECT SUM(amount) as total FROM expenses WHERE status = 'PAID'"
    );

    // 7. Total de honorários pagos
    const payoutsResult = await pool.query(
      "SELECT SUM(amount) as total FROM teacher_payouts WHERE status = 'PAID'"
    );

    res.json({
      summary: {
        totalReceived: parseFloat(receivedRevenue.rows[0].total || 0),
        totalPending: parseFloat(pendingRevenue.rows[0].total || 0),
        totalOverdue: parseFloat(overdueRevenue.rows[0].total || 0),
        mrr: parseFloat(mrrResult.rows[0].mrr || 0),
        totalExpenses: parseFloat(expensesResult.rows[0].total || 0),
        totalPayouts: parseFloat(payoutsResult.rows[0].total || 0)
      },
      salesByMethod: salesByMethod.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao obter relatório financeiro.' });
  }
});

// Confirmar pagamento manualmente
router.put('/:id/confirm-transfer', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { receipt_proof_url, transaction_code } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Atualiza pagamento
    const paymentResult = await client.query(
      "UPDATE payments SET status = 'RECEIVED', paid_at = NOW(), receipt_proof_url = $1, transaction_code = COALESCE($2, transaction_code) WHERE id = $3 RETURNING *",
      [receipt_proof_url, transaction_code, id]
    );
    
    if (paymentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Pagamento não encontrado.' });
    }
    
    const localPayment = paymentResult.rows[0];
    
    // Buscar curso
    const courseResult = await client.query('SELECT duration_days FROM courses WHERE id = $1', [localPayment.course_id]);
    if (courseResult.rows.length > 0) {
      const durationDays = courseResult.rows[0].duration_days;
      
      const checkEnroll = await client.query(
        'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
        [localPayment.student_id, localPayment.course_id]
      );

      if (checkEnroll.rows.length > 0) {
        await client.query(
          "UPDATE enrollments SET status = 'ACTIVE', expires_at = NOW() + ($1 || ' days')::INTERVAL WHERE id = $2",
          [durationDays, checkEnroll.rows[0].id]
        );
      } else {
        await client.query(
          "INSERT INTO enrollments (student_id, course_id, expires_at, status) VALUES ($1, $2, NOW() + ($3 || ' days')::INTERVAL, 'ACTIVE')",
          [localPayment.student_id, localPayment.course_id, durationDays]
        );
      }
    }
    
    await client.query('COMMIT');
    res.json({ message: 'Pagamento confirmado com sucesso.', payment: localPayment });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ message: 'Erro ao confirmar pagamento.' });
  } finally {
    client.release();
  }
});

// Registrar Pagamento de Professor
router.post('/teacher-payouts', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  const { teacher_id, amount, period_start, period_end, status, receipt_proof_url, paid_at } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO teacher_payouts (teacher_id, amount, period_start, period_end, status, receipt_proof_url, paid_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [teacher_id, amount, period_start, period_end, status, receipt_proof_url, paid_at]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao registrar pagamento ao professor.' });
  }
});

// Obter Despesas (Saídas)
router.get('/expenses', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar despesas.' });
  }
});

// Criar / Atualizar Despesa
router.post('/expenses', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  const { id, description, category, amount, date, paid_at, status, receipt_proof_url } = req.body;
  try {
    if (id) {
      const result = await pool.query(
        'UPDATE expenses SET description = $1, category = $2, amount = $3, date = $4, paid_at = $5, status = $6, receipt_proof_url = $7 WHERE id = $8 RETURNING *',
        [description, category, amount, date, paid_at, status, receipt_proof_url, id]
      );
      return res.json(result.rows[0]);
    } else {
      const result = await pool.query(
        'INSERT INTO expenses (description, category, amount, date, paid_at, status, receipt_proof_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [description, category, amount, date, paid_at, status, receipt_proof_url]
      );
      return res.json(result.rows[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao salvar despesa.' });
  }
});

// Obter Pagamentos a Professores
router.get('/teacher-payouts', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT tp.*, u.name as teacher_name, u.email as teacher_email FROM teacher_payouts tp JOIN users u ON u.id = tp.teacher_id ORDER BY tp.period_end DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar pagamentos de professores.' });
  }
});

// Atualizar Pagamento de Professor
router.put('/teacher-payouts/:id', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { status, receipt_proof_url, paid_at } = req.body;
  try {
    const result = await pool.query(
      'UPDATE teacher_payouts SET status = $1, receipt_proof_url = $2, paid_at = $3 WHERE id = $4 RETURNING *',
      [status, receipt_proof_url, paid_at, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar pagamento do professor.' });
  }
});

export default router;

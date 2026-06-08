import express from 'express';
import pool from '../db/index.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Parser manual simplificado de arquivo .OFX (Evita dependências extras de XML)
const parseOfx = (ofxText) => {
  const transactions = [];
  // Regex para encontrar blocos <STMTTRN>...</STMTTRN> (case-insensitive e multiline)
  const stmttrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match;

  while ((match = stmttrnRegex.exec(ofxText)) !== null) {
    const block = match[1];
    
    // Auxiliar para extrair tags XML simples do tipo <TAG>VALOR ou <TAG>VALOR</TAG>
    const getTagValue = (tag) => {
      const regex = new RegExp(`<${tag}>([^<\\r\\n]+)`, 'i');
      const tagMatch = block.match(regex);
      return tagMatch ? tagMatch[1].trim() : null;
    };

    const trntype = getTagValue('TRNTYPE');
    const dtposted = getTagValue('DTPOSTED');
    const trnamt = getTagValue('TRNAMT');
    const fitid = getTagValue('FITID');
    const refnum = getTagValue('REFNUM');
    const memo = getTagValue('MEMO');

    transactions.push({
      trntype,
      date: dtposted ? parseOfxDate(dtposted) : null,
      amount: trnamt ? parseFloat(trnamt) : 0,
      fitid,
      refnum,
      memo
    });
  }

  return transactions;
};

// Converte a data do OFX (ex: 20260601120000) para um objeto Date
const parseOfxDate = (dateStr) => {
  try {
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1;
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(year, month, day);
  } catch (e) {
    return new Date();
  }
};

// Upload do arquivo OFX e conciliação (Recebe o texto do arquivo diretamente no body)
router.post('/upload', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  const { ofxContent } = req.body;

  if (!ofxContent) {
    return res.status(400).json({ message: 'O conteúdo do arquivo OFX não foi enviado.' });
  }

  try {
    const bankTransactions = parseOfx(ofxContent);
    const results = {
      reconciled: [],   // Conciliados com sucesso
      divergent: [],    // Código achado, mas valor diferente
      unmatched: [],    // Transação do banco não encontrada no LMS
      processedCount: bankTransactions.length
    };

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (let tx of bankTransactions) {
        // Tentar extrair o código de transação do LMS (ex: ASAAS_XXXXXX)
        // O código pode estar no MEMO ou REFNUM
        const rawCode = tx.memo || tx.refnum || tx.fitid || '';
        const codeMatch = rawCode.match(/ASAAS_[A-Z0-9_]+/i);
        const transactionCode = codeMatch ? codeMatch[0].toUpperCase() : null;

        if (!transactionCode) {
          results.unmatched.push({
            description: `Transação sem código LMS identificável (FITID: ${tx.fitid})`,
            amount: tx.amount,
            date: tx.date
          });
          continue;
        }

        // Buscar pagamento no banco local
        const paymentQuery = await client.query(
          'SELECT * FROM payments WHERE transaction_code = $1',
          [transactionCode]
        );

        if (paymentQuery.rows.length === 0) {
          results.unmatched.push({
            description: `Transação com código ${transactionCode} não localizada no LMS`,
            amount: tx.amount,
            date: tx.date
          });
          continue;
        }

        const localPayment = paymentQuery.rows[0];

        // Verificar divergência de valores (OFX pode vir com sinal negativo para débito, ignoramos sinal nas vendas/receitas)
        const bankAmount = Math.abs(tx.amount);
        const localAmount = parseFloat(localPayment.amount);

        if (bankAmount !== localAmount) {
          results.divergent.push({
            transactionCode,
            bankAmount,
            localAmount,
            date: tx.date,
            message: 'Valores divergentes entre o extrato bancário e o LMS'
          });
          continue;
        }

        // Conciliação de sucesso!
        // Se estiver pendente, aprovar pagamento e liberar curso
        if (localPayment.status === 'PENDING') {
          // Atualizar pagamento
          await client.query(
            "UPDATE payments SET status = 'RECEIVED', paid_at = $1 WHERE id = $2",
            [tx.date || new Date(), localPayment.id]
          );

          // Buscar duração do acesso
          const courseResult = await client.query(
            'SELECT duration_days FROM courses WHERE id = $1',
            [localPayment.course_id]
          );
          const durationDays = courseResult.rows[0].duration_days;

          // Criar ou reativar matrícula
          const enrollQuery = await client.query(
            'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
            [localPayment.student_id, localPayment.course_id]
          );

          if (enrollQuery.rows.length > 0) {
            await client.query(
              "UPDATE enrollments SET status = 'ACTIVE', expires_at = NOW() + ($1 || ' days')::INTERVAL WHERE id = $2",
              [durationDays, enrollQuery.rows[0].id]
            );
          } else {
            await client.query(
              "INSERT INTO enrollments (student_id, course_id, expires_at, status) VALUES ($1, $2, NOW() + ($3 || ' days')::INTERVAL, 'ACTIVE')",
              [localPayment.student_id, localPayment.course_id, durationDays]
            );
          }

          results.reconciled.push({
            transactionCode,
            amount: bankAmount,
            date: tx.date,
            statusChanged: true
          });
        } else {
          // Já estava pago anteriormente
          results.reconciled.push({
            transactionCode,
            amount: bankAmount,
            date: tx.date,
            statusChanged: false,
            message: 'Transação já havia sido confirmada anteriormente'
          });
        }
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.json({
      message: 'Processamento de conciliação financeira concluído com sucesso.',
      results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao processar arquivo de conciliação.' });
  }
});

export default router;

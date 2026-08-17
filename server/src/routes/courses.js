import express from 'express';
import pool from '../db/index.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Listar Cursos
router.get('/', authenticateToken, async (req, res) => {
  const { type } = req.query;
  try {
    let queryText = 'SELECT * FROM courses WHERE active = true';
    const queryParams = [];

    if (type) {
      queryText += ' AND type = $1';
      queryParams.push(type);
    }

    queryText += ' ORDER BY title ASC';
    const coursesResult = await pool.query(queryText, queryParams);

    // Cruzar com matrículas do usuário logado se for estudante
    if (req.user.role === 'STUDENT') {
      const enrollResult = await pool.query(
        'SELECT course_id, expires_at, status FROM enrollments WHERE student_id = $1',
        [req.user.id]
      );

      const enrollMap = {};
      enrollResult.rows.forEach(e => {
        const isExpired = new Date(e.expires_at) < new Date();
        enrollMap[e.course_id] = {
          enrolled: true,
          status: isExpired ? 'EXPIRED' : e.status,
          expiresAt: e.expires_at
        };
      });

      const coursesWithEnrollment = coursesResult.rows.map(c => ({
        ...c,
        enrollment: enrollMap[c.id] || { enrolled: false }
      }));

      return res.json(coursesWithEnrollment);
    }

    res.json(coursesResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar cursos.' });
  }
});

// Matricular aluno em Curso Livre (6 meses de acesso grátis)
router.post('/:id/enroll-free', authenticateToken, async (req, res) => {
  const courseId = req.params.id;
  const studentId = req.user.id;

  try {
    // Verificar se o curso é grátis
    const courseResult = await pool.query('SELECT type FROM courses WHERE id = $1', [courseId]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ message: 'Curso não encontrado.' });
    }

    const course = courseResult.rows[0];
    if (course.type !== 'FREE') {
      return res.status(400).json({ message: 'Este curso exige pagamento e não pode ser adquirido gratuitamente.' });
    }

    // Verificar se já está matriculado
    const checkEnroll = await pool.query(
      'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [studentId, courseId]
    );

    if (checkEnroll.rows.length > 0) {
      return res.status(400).json({ message: 'Você já possui uma matrícula ativa ou expirada neste curso.' });
    }

    // Inserir matrícula por 6 meses (180 dias)
    await pool.query(
      "INSERT INTO enrollments (student_id, course_id, expires_at, status) VALUES ($1, $2, NOW() + INTERVAL '180 days', 'ACTIVE')",
      [studentId, courseId]
    );

    res.json({ message: 'Matrícula realizada com sucesso! Acesso liberado por 6 meses.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao matricular no curso.' });
  }
});

// Detalhes do Curso (Módulos e Aulas)
router.get('/:id', authenticateToken, async (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.id;

  try {
    const courseResult = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ message: 'Curso não encontrado.' });
    }

    const course = courseResult.rows[0];

    // Se for estudante, validar se possui matrícula ativa
    let hasAccess = req.user.role !== 'STUDENT';
    let enrollmentDetails = null;

    if (req.user.role === 'STUDENT') {
      const enrollResult = await pool.query(
        'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
        [userId, courseId]
      );

      if (enrollResult.rows.length > 0) {
        const enroll = enrollResult.rows[0];
        const isExpired = new Date(enroll.expires_at) < new Date();
        
        enrollmentDetails = {
          enrolled_at: enroll.enrolled_at,
          expires_at: enroll.expires_at,
          status: isExpired ? 'EXPIRED' : enroll.status
        };

        if (enroll.status === 'ACTIVE' && !isExpired) {
          hasAccess = true;
        }
      }
    }

    if (!hasAccess) {
      return res.status(403).json({
        message: 'Você não tem uma matrícula ativa neste curso ou seu acesso de 6 meses expirou.',
        enrollment: enrollmentDetails
      });
    }

    // Buscar Módulos e Aulas
    const modulesResult = await pool.query(
      'SELECT * FROM modules WHERE course_id = $1 ORDER BY display_order ASC',
      [courseId]
    );

    const modules = modulesResult.rows;

    for (let i = 0; i < modules.length; i++) {
      const lessonsResult = await pool.query(
        'SELECT l.*, p.seconds_watched, p.completed FROM lessons l ' +
        'LEFT JOIN lesson_progress p ON p.lesson_id = l.id AND p.student_id = $2 ' +
        'WHERE l.module_id = $1 ORDER BY l.display_order ASC',
        [modules[i].id, userId]
      );
      modules[i].lessons = lessonsResult.rows.map(lesson => ({
        ...lesson,
        completed: lesson.completed || false,
        seconds_watched: lesson.seconds_watched || 0
      }));
    }

    res.json({
      course,
      enrollment: enrollmentDetails,
      modules
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao carregar detalhes do curso.' });
  }
});

// Atualizar progresso da aula e marcar conclusão
router.post('/lessons/:lessonId/progress', authenticateToken, async (req, res) => {
  const { lessonId } = req.params;
  const { secondsWatched } = req.body;
  const studentId = req.user.id;

  if (secondsWatched === undefined) {
    return res.status(400).json({ message: 'O tempo assistido é obrigatório.' });
  }

  try {
    // Buscar duração total do vídeo
    const lessonResult = await pool.query('SELECT duration_seconds FROM lessons WHERE id = $1', [lessonId]);
    if (lessonResult.rows.length === 0) {
      return res.status(404).json({ message: 'Aula não encontrada.' });
    }

    const { duration_seconds } = lessonResult.rows[0];
    
    // Regra da pós-graduação ou padrão: 60% assistido = Completo
    const targetSeconds = Math.floor(duration_seconds * 0.60);
    const completed = secondsWatched >= targetSeconds;

    // UPSERT no lesson_progress
    const progressResult = await pool.query(
      'INSERT INTO lesson_progress (student_id, lesson_id, seconds_watched, completed, updated_at) ' +
      'VALUES ($1, $2, $3, $4, NOW()) ' +
      'ON CONFLICT (student_id, lesson_id) ' +
      'DO UPDATE SET seconds_watched = GREATEST(lesson_progress.seconds_watched, EXCLUDED.seconds_watched), ' +
      'completed = CASE WHEN lesson_progress.completed THEN TRUE ELSE EXCLUDED.completed END, ' +
      'updated_at = NOW() ' +
      'RETURNING completed, seconds_watched',
      [studentId, lessonId, secondsWatched, completed]
    );

    res.json({
      message: 'Progresso salvo.',
      progress: progressResult.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao registrar progresso.' });
  }
});

// Detalhes do Quiz (Oculta respostas corretas do aluno)
router.get('/lessons/:lessonId/quiz', authenticateToken, async (req, res) => {
  const { lessonId } = req.params;
  const studentId = req.user.id;

  try {
    const quizResult = await pool.query('SELECT * FROM quizzes WHERE lesson_id = $1', [lessonId]);
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ message: 'Esta aula não possui um Quiz associado.' });
    }

    const quiz = quizResult.rows[0];

    // Buscar questões
    const questionsResult = await pool.query(
      'SELECT id, question_text, options FROM quiz_questions WHERE quiz_id = $1',
      [quiz.id]
    );

    // Buscar tentativas prévias do aluno
    const attemptsResult = await pool.query(
      'SELECT score, passed, attempt_number, completed_at FROM quiz_attempts WHERE student_id = $1 AND quiz_id = $2 ORDER BY attempt_number DESC',
      [studentId, quiz.id]
    );

    res.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        max_attempts: quiz.max_attempts,
        passing_score: quiz.passing_score,
        questions: questionsResult.rows
      },
      attempts: attemptsResult.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao carregar o quiz.' });
  }
});

// Responder Quiz (2 tentativas, aprovação mínima de 70%)
router.post('/quizzes/:quizId/submit', authenticateToken, async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body; // Array de inteiros indicando os índices selecionados [1, 2]
  const studentId = req.user.id;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: 'Respostas devem ser enviadas como uma lista ordenada.' });
  }

  try {
    // Buscar definições do quiz
    const quizResult = await pool.query('SELECT * FROM quizzes WHERE id = $1', [quizId]);
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ message: 'Quiz não encontrado.' });
    }
    const quiz = quizResult.rows[0];

    // Contar tentativas anteriores
    const attemptsCountResult = await pool.query(
      'SELECT COUNT(*)::int as count FROM quiz_attempts WHERE student_id = $1 AND quiz_id = $2',
      [studentId, quizId]
    );
    const attemptNumber = attemptsCountResult.rows[0].count + 1;

    if (attemptNumber > quiz.max_attempts) {
      return res.status(403).json({
        message: `Você já esgotou o número máximo de tentativas (${quiz.max_attempts}) para esta avaliação.`
      });
    }

    // Buscar questões gabaritadas
    const questionsResult = await pool.query(
      'SELECT id, correct_option_index FROM quiz_questions WHERE quiz_id = $1 ORDER BY id ASC',
      [quizId]
    );

    const questions = questionsResult.rows;
    if (questions.length === 0) {
      return res.status(400).json({ message: 'O Quiz não possui questões cadastradas.' });
    }

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] !== undefined && answers[idx] === q.correct_option_index) {
        correctCount++;
      }
    });

    const score = parseFloat(((correctCount / questions.length) * 100).toFixed(2));
    const passed = score >= parseFloat(quiz.passing_score);

    // Gravar tentativa
    await pool.query(
      'INSERT INTO quiz_attempts (student_id, quiz_id, score, passed, attempt_number) VALUES ($1, $2, $3, $4, $5)',
      [studentId, quizId, score, passed, attemptNumber]
    );

    res.json({
      message: passed ? 'Parabéns, você foi aprovado!' : 'Infelizmente você não atingiu a nota mínima de 70%.',
      score,
      passed,
      attemptNumber,
      remainingAttempts: quiz.max_attempts - attemptNumber
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao processar quiz.' });
  }
});

// --- PLATFORM SETTINGS (Modelo de Certificado) ---
router.get('/platform-settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM platform_settings');
    const settings = {};
    result.rows.forEach(r => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar configurações.' });
  }
});

router.post('/admin-certificate-template', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Acesso negado.' });
  const { certificate_template_url } = req.body;
  try {
    await pool.query(
      'INSERT INTO platform_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
      ['certificate_template_url', certificate_template_url]
    );
    res.json({ message: 'Modelo de certificado atualizado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao salvar modelo de certificado.' });
  }
});

// --- GESTÃO DE LIVROS COM MÚLTIPLAS FOTOS ---
router.get('/books/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books ORDER BY title ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao listar livros.' });
  }
});

router.post('/admin-books', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Acesso negado.' });
  const { id, title, author, price, description, page_count, content_table, images } = req.body;
  try {
    const bookId = id || `book-${Date.now()}`;
    const imagesJson = JSON.stringify(images || []);
    await pool.query(
      `INSERT INTO books (id, title, author, price, description, page_count, content_table, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         author = EXCLUDED.author,
         price = EXCLUDED.price,
         description = EXCLUDED.description,
         page_count = EXCLUDED.page_count,
         content_table = EXCLUDED.content_table,
         images = EXCLUDED.images`,
      [bookId, title, author, price, description, page_count, content_table, imagesJson]
    );
    res.json({ message: 'Livro salvo com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao salvar livro.' });
  }
});

export default router;

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/index.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// 1. Listar Cursos
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
    if (req.user && req.user.role === 'STUDENT') {
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
    console.error('Erro ao listar cursos:', error);
    res.status(500).json({ message: 'Erro ao buscar cursos.' });
  }
});

// Listar todos os cursos para Administradores e Professores
router.get('/all-admin', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar todos os cursos:', error);
    res.status(500).json({ message: 'Erro ao carregar lista de cursos.' });
  }
});

// 2. Criar Curso (ADM)
router.post('/admin', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Acesso negado.' });
  const { title, description, type, duration_days, finishing_message, active, teacher_id } = req.body;

  if (!title || !type) {
    return res.status(400).json({ message: 'Título e tipo de curso são obrigatórios.' });
  }

  try {
    const courseId = req.body.id || `course-${Date.now()}`;
    await pool.query(
      `INSERT INTO courses (id, title, description, type, duration_days, finishing_message, active, teacher_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        courseId,
        title,
        description || '',
        type,
        duration_days || 180,
        finishing_message || '',
        active !== undefined ? active : true,
        teacher_id || null
      ]
    );

    const newCourse = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    res.status(201).json({ message: 'Curso criado com sucesso!', course: newCourse.rows[0] });
  } catch (error) {
    console.error('Erro ao criar curso:', error);
    res.status(500).json({ message: 'Erro interno ao criar curso.' });
  }
});

// 3. Editar Curso (ADM)
router.put('/admin/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Acesso negado.' });
  const courseId = req.params.id;
  const { title, description, type, duration_days, finishing_message, active, teacher_id } = req.body;

  try {
    await pool.query(
      `UPDATE courses SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        type = COALESCE($3, type),
        duration_days = COALESCE($4, duration_days),
        finishing_message = COALESCE($5, finishing_message),
        active = COALESCE($6, active),
        teacher_id = COALESCE($7, teacher_id)
       WHERE id = $8`,
      [title, description, type, duration_days, finishing_message, active, teacher_id, courseId]
    );

    const updatedCourse = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    res.json({ message: 'Curso atualizado com sucesso!', course: updatedCourse.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar curso:', error);
    res.status(500).json({ message: 'Erro ao atualizar curso.' });
  }
});

// 4. Excluir Curso (ADM)
router.delete('/admin/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Acesso negado.' });
  const courseId = req.params.id;

  try {
    await pool.query('DELETE FROM courses WHERE id = $1', [courseId]);
    res.json({ message: 'Curso excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir curso:', error);
    res.status(500).json({ message: 'Erro ao excluir curso.' });
  }
});

// 5. Matricular aluno em Curso Livre
router.post('/:id/enroll-free', authenticateToken, async (req, res) => {
  const courseId = req.params.id;
  const studentId = req.user.id;

  try {
    const courseResult = await pool.query('SELECT type FROM courses WHERE id = $1', [courseId]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ message: 'Curso não encontrado.' });
    }

    const course = courseResult.rows[0];
    if (course.type !== 'FREE') {
      return res.status(400).json({ message: 'Este curso exige pagamento.' });
    }

    const checkEnroll = await pool.query(
      'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [studentId, courseId]
    );

    if (checkEnroll.rows.length > 0) {
      return res.status(400).json({ message: 'Você já possui uma matrícula neste curso.' });
    }

    const enrollmentId = uuidv4();
    const expiresAt = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);
    await pool.query(
      "INSERT INTO enrollments (id, student_id, course_id, expires_at, status) VALUES ($1, $2, $3, $4, 'ACTIVE')",
      [enrollmentId, studentId, courseId, expiresAt]
    );

    res.json({ message: 'Matrícula realizada com sucesso! Acesso liberado por 6 meses.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao matricular no curso.' });
  }
});

// 6. Detalhes do Curso (Módulos e Aulas)
router.get('/:id', authenticateToken, async (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.id;

  try {
    const courseResult = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ message: 'Curso não encontrado.' });
    }

    const course = courseResult.rows[0];
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
        message: 'Você não tem uma matrícula ativa neste curso ou seu acesso expirou.',
        enrollment: enrollmentDetails
      });
    }

    const modulesResult = await pool.query(
      'SELECT * FROM modules WHERE course_id = $1 ORDER BY display_order ASC',
      [courseId]
    );

    const modules = modulesResult.rows;

    for (let i = 0; i < modules.length; i++) {
      const lessonsResult = await pool.query(
        'SELECT * FROM lessons WHERE module_id = $1 ORDER BY display_order ASC',
        [modules[i].id]
      );
      modules[i].lessons = lessonsResult.rows;
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

// 7. MÓDULOS E AULAS - CRUD
router.post('/admin/:courseId/modules', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Acesso negado.' });
  }
  const { courseId } = req.params;
  const { title, display_order } = req.body;

  try {
    const moduleId = uuidv4();
    await pool.query(
      'INSERT INTO modules (id, course_id, title, display_order) VALUES ($1, $2, $3, $4)',
      [moduleId, courseId, title || 'Novo Módulo', display_order || 1]
    );
    const newModule = await pool.query('SELECT * FROM modules WHERE id = $1', [moduleId]);
    res.status(201).json({ message: 'Módulo criado com sucesso!', module: newModule.rows[0] });
  } catch (error) {
    console.error('Erro ao criar módulo:', error);
    res.status(500).json({ message: 'Erro ao criar módulo.' });
  }
});

router.put('/admin/modules/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Acesso negado.' });
  }
  const { id } = req.params;
  const { title, display_order } = req.body;

  try {
    await pool.query(
      'UPDATE modules SET title = COALESCE($1, title), display_order = COALESCE($2, display_order) WHERE id = $3',
      [title, display_order, id]
    );
    res.json({ message: 'Módulo atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar módulo:', error);
    res.status(500).json({ message: 'Erro ao atualizar módulo.' });
  }
});

router.delete('/admin/modules/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Acesso negado.' });
  }
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM modules WHERE id = $1', [id]);
    res.json({ message: 'Módulo excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir módulo:', error);
    res.status(500).json({ message: 'Erro ao excluir módulo.' });
  }
});

router.post('/admin/modules/:moduleId/lessons', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Acesso negado.' });
  }
  const { moduleId } = req.params;
  const { title, video_url, duration_seconds, display_order } = req.body;

  try {
    const lessonId = uuidv4();
    await pool.query(
      'INSERT INTO lessons (id, module_id, title, video_url, duration_seconds, display_order) VALUES ($1, $2, $3, $4, $5, $6)',
      [lessonId, moduleId, title || 'Nova Aula', video_url || '', duration_seconds || 1800, display_order || 1]
    );
    const newLesson = await pool.query('SELECT * FROM lessons WHERE id = $1', [lessonId]);
    res.status(201).json({ message: 'Aula criada com sucesso!', lesson: newLesson.rows[0] });
  } catch (error) {
    console.error('Erro ao criar aula:', error);
    res.status(500).json({ message: 'Erro ao criar aula.' });
  }
});

router.put('/admin/lessons/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Acesso negado.' });
  }
  const { id } = req.params;
  const { title, video_url, duration_seconds, display_order } = req.body;

  try {
    await pool.query(
      `UPDATE lessons SET
        title = COALESCE($1, title),
        video_url = COALESCE($2, video_url),
        duration_seconds = COALESCE($3, duration_seconds),
        display_order = COALESCE($4, display_order)
       WHERE id = $5`,
      [title, video_url, duration_seconds, display_order, id]
    );
    res.json({ message: 'Aula atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar aula:', error);
    res.status(500).json({ message: 'Erro ao atualizar aula.' });
  }
});

router.delete('/admin/lessons/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'TEACHER') {
    return res.status(403).json({ message: 'Acesso negado.' });
  }
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM lessons WHERE id = $1', [id]);
    res.json({ message: 'Aula excluída com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir aula:', error);
    res.status(500).json({ message: 'Erro ao excluir aula.' });
  }
});

// 8. LIVROS - CRUD
router.get('/books/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM books ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar livros:', error);
    res.status(500).json({ message: 'Erro ao listar livros.' });
  }
});

router.post('/admin-books', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Acesso negado.' });
  const { id, title, author, price, desc, page_count, content_table, images, image } = req.body;

  if (!title || !author) {
    return res.status(400).json({ message: 'Título e autor são obrigatórios.' });
  }

  try {
    const bookId = id || `book-${Date.now()}`;
    const contentTableJson = typeof content_table === 'string' ? content_table : JSON.stringify(content_table || []);
    const imagesJson = typeof images === 'string' ? images : JSON.stringify(images || []);
    const coverImage = image || (Array.isArray(images) && images.length > 0 ? images[0] : '');

    // Verificar se livro ja existe para UPDATE ou INSERT
    const checkBook = await pool.query('SELECT id FROM books WHERE id = $1', [bookId]);

    if (checkBook.rows.length > 0) {
      await pool.query(
        `UPDATE books SET
          title = $1, author = $2, price = $3, \`desc\` = $4, page_count = $5,
          content_table = $6, images = $7, image = $8
         WHERE id = $9`,
        [title, author, price || 0, desc || '', page_count || 0, contentTableJson, imagesJson, coverImage, bookId]
      );
    } else {
      await pool.query(
        `INSERT INTO books (id, title, author, price, \`desc\`, page_count, content_table, images, image)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [bookId, title, author, price || 0, desc || '', page_count || 0, contentTableJson, imagesJson, coverImage]
      );
    }

    const updatedBook = await pool.query('SELECT * FROM books WHERE id = $1', [bookId]);
    res.json({ message: 'Livro salvo com sucesso no banco de dados!', book: updatedBook.rows[0] });
  } catch (error) {
    console.error('Erro ao salvar livro:', error);
    res.status(500).json({ message: 'Erro ao salvar livro.' });
  }
});

router.delete('/admin-books/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Acesso negado.' });
  const bookId = req.params.id;

  try {
    await pool.query('DELETE FROM books WHERE id = $1', [bookId]);
    res.json({ message: 'Livro excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir livro:', error);
    res.status(500).json({ message: 'Erro ao excluir livro.' });
  }
});

export default router;

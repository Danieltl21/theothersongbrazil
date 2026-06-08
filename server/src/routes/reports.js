import express from 'express';
import pool from '../db/index.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// 1. Relatório do Aluno (Seus Cursos, Aulas Assistidas, Progresso Geral e Notas nos Quizzes)
router.get('/student-dashboard', authenticateToken, requireRole(['STUDENT']), async (req, res) => {
  const studentId = req.user.id;

  try {
    // Matrículas ativas/concluídas
    const enrollmentsResult = await pool.query(
      'SELECT e.*, c.title, c.type, c.finishing_message FROM enrollments e ' +
      'JOIN courses c ON c.id = e.course_id ' +
      'WHERE e.student_id = $1',
      [studentId]
    );

    const progressReports = [];

    for (let enroll of enrollmentsResult.rows) {
      // Total de aulas do curso
      const totalLessonsResult = await pool.query(
        'SELECT COUNT(*)::int as count FROM lessons l ' +
        'JOIN modules m ON m.id = l.module_id ' +
        'WHERE m.course_id = $1',
        [enroll.course_id]
      );
      const totalLessons = totalLessonsResult.rows[0].count;

      // Aulas concluídas pelo aluno
      const completedLessonsResult = await pool.query(
        'SELECT COUNT(*)::int as count FROM lesson_progress lp ' +
        'JOIN lessons l ON l.id = lp.lesson_id ' +
        'JOIN modules m ON m.id = l.module_id ' +
        'WHERE m.course_id = $1 AND lp.student_id = $2 AND lp.completed = true',
        [enroll.course_id, studentId]
      );
      const completedLessons = completedLessonsResult.rows[0].count;

      // Média de pontuação dos quizzes
      const quizGradesResult = await pool.query(
        'SELECT AVG(qa.score) as avg_score, COUNT(DISTINCT qa.quiz_id)::int as quizzes_done ' +
        'FROM quiz_attempts qa ' +
        'JOIN quizzes q ON q.id = qa.quiz_id ' +
        'JOIN lessons l ON l.id = q.lesson_id ' +
        'JOIN modules m ON m.id = l.module_id ' +
        'WHERE m.course_id = $1 AND qa.student_id = $2',
        [enroll.course_id, studentId]
      );

      const percentProgress = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100) 
        : 0;

      // Presença baseada na regra: quiz feito + 60% do vídeo assistido
      // O campo "completed" na tabela lesson_progress já calcula os 60% de vídeo.
      // O controle de presença oficial da pós: número de aulas com progresso >= 60% que também possuem quiz aprovado.
      const presenceDetailsResult = await pool.query(
        'SELECT COUNT(DISTINCT l.id)::int as presence_count ' +
        'FROM lesson_progress lp ' +
        'JOIN lessons l ON l.id = lp.lesson_id ' +
        'JOIN modules m ON m.id = l.module_id ' +
        'JOIN quizzes q ON q.lesson_id = l.id ' +
        'JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.student_id = $2 ' +
        'WHERE m.course_id = $1 AND lp.student_id = $2 AND lp.completed = true AND qa.passed = true',
        [enroll.course_id, studentId]
      );

      progressReports.push({
        courseId: enroll.course_id,
        courseTitle: enroll.title,
        courseType: enroll.type,
        status: enroll.status,
        expiresAt: enroll.expires_at,
        totalLessons,
        completedLessons,
        percentProgress,
        avgQuizScore: parseFloat(quizGradesResult.rows[0].avg_score || 0).toFixed(1),
        quizzesDone: quizGradesResult.rows[0].quizzes_done,
        officialPresenceCount: presenceDetailsResult.rows[0].presence_count,
        finishingMessage: enroll.finishing_message
      });
    }

    res.json(progressReports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao gerar relatório do aluno.' });
  }
});

// 2. Relatório do Professor (Restrito: Apenas alunos de seus próprios cursos)
router.get('/teacher-report', authenticateToken, requireRole(['TEACHER']), async (req, res) => {
  const teacherId = req.user.id;

  try {
    // Buscar relatórios de progresso de todos os alunos matriculados nos cursos deste professor
    const reportResult = await pool.query(
      'SELECT e.id as enrollment_id, e.enrolled_at, e.status as enrollment_status, e.expires_at, ' +
      'u.id as student_id, u.name as student_name, u.email as student_email, ' +
      'c.id as course_id, c.title as course_title, c.type as course_type ' +
      'FROM enrollments e ' +
      'JOIN users u ON u.id = e.student_id ' +
      'JOIN courses c ON c.id = e.course_id ' +
      'WHERE c.teacher_id = $1 ORDER BY c.title ASC, u.name ASC',
      [teacherId]
    );

    const detailedReports = [];

    for (let record of reportResult.rows) {
      // Aulas totais do curso
      const totalLessons = await pool.query(
        'SELECT COUNT(*)::int as count FROM lessons l JOIN modules m ON m.id = l.module_id WHERE m.course_id = $1',
        [record.course_id]
      );

      // Aulas completadas pelo aluno (>= 60% assistido)
      const completedLessons = await pool.query(
        'SELECT COUNT(*)::int as count FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id ' +
        'JOIN modules m ON m.id = l.module_id WHERE m.course_id = $1 AND lp.student_id = $2 AND lp.completed = true',
        [record.course_id, record.student_id]
      );

      // Quizzes aprovados pelo aluno no curso
      const quizzesPassed = await pool.query(
        'SELECT COUNT(DISTINCT q.id)::int as count ' +
        'FROM quizzes q ' +
        'JOIN lessons l ON l.id = q.lesson_id ' +
        'JOIN modules m ON m.id = l.module_id ' +
        'JOIN quiz_attempts qa ON qa.quiz_id = q.id ' +
        'WHERE m.course_id = $1 AND qa.student_id = $2 AND qa.passed = true',
        [record.course_id, record.student_id]
      );

      // Presença Oficial (Fase 3: 60% vídeo assistido + Quiz do módulo concluído com aprovação)
      const officialPresence = await pool.query(
        'SELECT COUNT(DISTINCT l.id)::int as count ' +
        'FROM lesson_progress lp ' +
        'JOIN lessons l ON l.id = lp.lesson_id ' +
        'JOIN modules m ON m.id = l.module_id ' +
        'JOIN quizzes q ON q.lesson_id = l.id ' +
        'JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.student_id = $2 ' +
        'WHERE m.course_id = $1 AND lp.student_id = $2 AND lp.completed = true AND qa.passed = true',
        [record.course_id, record.student_id]
      );

      detailedReports.push({
        enrollmentId: record.enrollment_id,
        studentName: record.student_name,
        studentEmail: record.student_email,
        courseTitle: record.course_title,
        courseType: record.course_type,
        enrolledAt: record.enrolled_at,
        expiresAt: record.expires_at,
        enrollmentStatus: record.enrollment_status,
        totalLessons: totalLessons.rows[0].count,
        completedLessons: completedLessons.rows[0].count,
        quizzesPassed: quizzesPassed.rows[0].count,
        presenceCount: officialPresence.rows[0].count,
        progressPercent: totalLessons.rows[0].count > 0 
          ? Math.round((completedLessons.rows[0].count / totalLessons.rows[0].count) * 100)
          : 0
      });
    }

    res.json(detailedReports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao gerar relatórios do professor.' });
  }
});

// 3. Monitoramento de logs de segurança (Apenas Admin)
router.get('/security-logs', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const logs = await pool.query(
      'SELECT al.*, u.name as user_name, u.email as user_email, u.role as user_role FROM access_logs al ' +
      'JOIN users u ON u.id = al.user_id ' +
      'ORDER BY al.created_at DESC LIMIT 100'
    );

    res.json(logs.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar logs de segurança.' });
  }
});

export default router;

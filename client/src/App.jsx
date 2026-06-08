import React, { useState, useEffect, useRef } from 'react';

// Termos de Uso específicos para profissionais da saúde / homeopatas
const TERMS_TEXT = `TERMOS DE USO E ACEITE PARA HOMEOPATAS E PROFISSIONAIS DA SAÚDE
Ao se cadastrar na plataforma EAD The Other Song Brasil (TOSB), você declara e concorda que:
1. Este conteúdo é destinado a profissionais da saúde (Médicos, Dentistas, Farmacêuticos, Veterinários e terapeutas integrativos autorizados).
2. O material científico, incluindo casos clínicos expostos em vídeo, é estritamente confidencial e protegido por sigilo médico, sendo vedado qualquer tipo de download, gravação de tela ou compartilhamento externo sob pena de suspensão de acesso e medidas legais cabíveis.
3. A prescrição de medicamentos homeopáticos e a aplicação clínica do Método Sensação são de inteira responsabilidade técnica do profissional matriculado.
4. A plataforma proíbe o compartilhamento de senhas. A identificação de acessos simultâneos em localizações geograficamente distantes resultará no bloqueio preventivo automático do usuário.`;

export default function App() {
  // Controle de Estado Geral
  const [currentPage, setCurrentPage] = useState('login'); // login, register, unlock, student-dash, course-view, teacher-dash, admin-dash, checkout
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Estados de Negócio
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonProgress, setLessonProgress] = useState(null); // { completed, seconds_watched }
  
  // Estado do Quiz
  const [quizData, setQuizData] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  // Estado de Faturas e Checkout
  const [myInvoices, setMyInvoices] = useState([]);
  const [checkoutCourse, setCheckoutCourse] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [installments, setInstallments] = useState(12);

  // Estado de Relatórios
  const [teacherReportData, setTeacherReportData] = useState([]);
  const [adminReportData, setAdminReportData] = useState(null);
  const [securityLogs, setSecurityLogs] = useState([]);

  // Estado do upload OFX
  const [ofxInput, setOfxInput] = useState('');
  const [conciliationResults, setConciliationResults] = useState(null);

  // Refs de mídia
  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Backup Local (Mock Database) para funcionamento Offline
  const [mockDb, setMockDb] = useState(() => {
    const saved = localStorage.getItem('mock_db');
    if (saved) return JSON.parse(saved);

    const initialDb = {
      users: [
        { id: 'admin-id', name: 'Admin Principal', email: 'admin@lms.com', role: 'ADMIN', status: 'ACTIVE', password: 'senha123' },
        { id: 'teacher-id', name: 'Dr. Carlos Eduardo (TOSB)', email: 'carlos@tosb.com', role: 'TEACHER', status: 'ACTIVE', password: 'senha123', crm: 'CRM-PR 12345', rqe: 'RQE 6789', bio: 'Médico Homeopata especialista no Método Sensação.' },
        { id: 'student-id', name: 'Dra. Ana Paula (Aluna)', email: 'ana@lms.com', role: 'STUDENT', status: 'ACTIVE', password: 'senha123', registrationType: 'CRM', registrationNumber: 'CRM-SP 98765' }
      ],
      courses: [
        { id: 'course-free', title: 'Introdução à Homeopatia e Sensação Vital', description: 'Princípios básicos da homeopatia clássica e as bases do Método Sensação da The Other Song.', type: 'FREE', duration_days: 180, finishing_message: 'Parabéns pela conclusão! Que os ensinamentos da Homeopatia e a busca pela sensação vital enriqueçam a sua prática clínica cotidiana.', teacher_id: 'teacher-id', active: true },
        { id: 'course-sub', title: 'Clube TOSB: Estudo Continuado de Matéria Médica', description: 'Curso recorrente mensal focado no estudo aprofundado dos reinos animal, vegetal e mineral na clínica homeopática.', type: 'SUBSCRIPTION', duration_days: 30, finishing_message: 'Parabéns por concluir mais um ciclo de estudos continuados em nossa Matéria Médica!', teacher_id: 'teacher-id', active: true },
        { id: 'course-post', title: 'Pós-Graduação em Homeopatia Avançada - Método Sensação', description: 'Especialização acadêmica stricto/lato sensu voltada para médicos, dentistas e profissionais da saúde com controle estrito de presença e quizzes.', type: 'POSTGRAD', duration_days: 180, finishing_message: 'Parabéns pela conquista do título de Especialista em Homeopatia Avançada! Sua dedicação científica eleva o nível da nossa prática médica.', teacher_id: 'teacher-id', active: true }
      ],
      modules: {
        'course-free': [
          { id: 'mod-f1', title: 'Módulo 1: Fundamentos da Homeopatia', lessons: [
            { id: 'les-f1', title: 'Aula 1: A Lei dos Semelhantes e a história', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration_seconds: 10 }
          ]}
        ],
        'course-sub': [
          { id: 'mod-s1', title: 'Módulo 1: O Reino Mineral', lessons: [
            { id: 'les-s1', title: 'Aula 1: Elementos da Tabela Periódica na Homeopatia', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration_seconds: 10 }
          ]}
        ],
        'course-post': [
          { id: 'mod-p1', title: 'Módulo de Especialização 1: Método Sensação na Prática', lessons: [
            { id: 'les-p1', title: 'Aula 1.1: O Conceito de Sensação Vital no Reino Vegetal', video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration_seconds: 10, quiz: {
              id: 'quiz-p1', title: 'Quiz: Avaliação do Reino Vegetal e Sensação Vital', max_attempts: 2, passing_score: 70.00,
              questions: [
                { id: 'q1', question_text: 'Qual é o foco principal do Método Sensação de Rajan Sankaran?', options: ['Identificar apenas sintomas locais', 'Encontrar a Sensação Vital profunda que conecta mente e corpo', 'Prescrever com base na cor da pele do paciente', 'Nenhuma das anteriores'], correct: 1 },
                { id: 'q2', question_text: 'A Sensação Vital expressa-se através de quais reinos da natureza?', options: ['Apenas Mineral', 'Apenas Vegetal', 'Vegetal, Mineral e Animal', 'Nenhum reino da natureza'], correct: 2 }
              ]
            }}
          ]}
        ]
      },
      enrollments: [
        { id: 'enroll-1', student_id: 'student-id', course_id: 'course-free', enrolled_at: new Date().toISOString(), expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), status: 'ACTIVE' }
      ],
      payments: [
        { id: 'pay-mock-1', student_id: 'student-id', course_id: 'course-free', amount: 0, payment_method: 'PIX', status: 'RECEIVED', transaction_code: 'FREE_100', due_date: new Date().toISOString().split('T')[0], paid_at: new Date().toISOString() }
      ],
      lesson_progress: {},
      quiz_attempts: {},
      logs: [
        { id: 'log-1', user_name: 'Dra. Ana Paula', user_email: 'ana@lms.com', ip_address: '189.12.34.56', user_agent: 'Chrome/Windows', content_accessed: 'LOGIN_SUCCESS', created_at: new Date().toISOString() }
      ]
    };
    localStorage.setItem('mock_db', JSON.stringify(initialDb));
    return initialDb;
  });

  // Salvar alterações do banco mock
  useEffect(() => {
    localStorage.setItem('mock_db', JSON.stringify(mockDb));
  }, [mockDb]);

  // Testar conexão ao carregar e carregar usuário se houver token
  useEffect(() => {
    const testConnection = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setIsOfflineMode(false);
          // Redirecionar para o dashboard correspondente
          redirectToDashboard(data.user.role);
        } else {
          // Token inválido/expirado
          setUser(null);
          setToken('');
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.warn("Backend não conectado. Iniciando em Modo de Simulação (Frontend-Only).");
        setIsOfflineMode(true);
        // Tenta restaurar login mock se houver token mockado
        if (token) {
          const found = mockDb.users.find(u => u.id === token);
          if (found) {
            setUser(found);
            redirectToDashboard(found.role);
          } else {
            setToken('');
          }
        }
      }
    };
    testConnection();
  }, [token]);

  const redirectToDashboard = (role) => {
    if (role === 'STUDENT') setCurrentPage('student-dash');
    else if (role === 'TEACHER') {
      setCurrentPage('teacher-dash');
      loadTeacherReport();
    }
    else if (role === 'ADMIN') {
      setCurrentPage('admin-dash');
      loadAdminReport();
    }
  };

  // Funções de API / Ações do Usuário

  // Limpar alertas
  const clearAlerts = () => {
    setError('');
    setSuccess('');
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    clearAlerts();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const simulateDifferentIp = e.target.simulateIp?.checked || false;

    if (isOfflineMode) {
      // Login Mockado
      const foundUser = mockDb.users.find(u => u.email === email && u.password === password);
      if (!foundUser) {
        setError('E-mail ou senha incorretos.');
        return;
      }

      if (foundUser.status === 'SUSPENDED') {
        setError('⚠️ BLOQUEIO: Esta conta foi suspensa devido a logins simultâneos suspeitos.');
        return;
      }

      // Simulação da trava de IP/Localização distinta (Opção B)
      if (foundUser.role === 'STUDENT' && simulateDifferentIp) {
        // Bloquear a conta mockada
        setMockDb(prev => {
          const updatedUsers = prev.users.map(u => u.id === foundUser.id ? { ...u, status: 'SUSPENDED' } : u);
          const newLog = {
            id: 'log_' + Date.now(),
            user_name: foundUser.name,
            user_email: foundUser.email,
            ip_address: '200.180.12.34 (Diferente)',
            user_agent: 'Firefox/Mac',
            content_accessed: 'CONCURRENT_LOGIN_LOCKOUT',
            created_at: new Date().toISOString()
          };
          return {
            ...prev,
            users: updatedUsers,
            logs: [newLog, ...prev.logs]
          };
        });
        setError('⚠️ BLOQUEIO DE SEGURANÇA: Detectamos uma sessão ativa de outro endereço IP. Sua conta foi suspensa temporariamente para evitar compartilhamento.');
        return;
      }

      setUser(foundUser);
      setToken(foundUser.id);
      localStorage.setItem('token', foundUser.id);
      setSuccess('Login efetuado (Modo Simulação)!');
      redirectToDashboard(foundUser.role);
    } else {
      // Login API Real
      try {
        const body = { email, password };
        // Para simular IP diferente no back, mandamos um cabeçalho customizado simulado
        const headers = { 'Content-Type': 'application/json' };
        if (simulateDifferentIp) {
          headers['X-Forwarded-For'] = '177.45.12.99'; // IP diferente do localhost
        }

        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });

        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          setToken(data.token);
          localStorage.setItem('token', data.token);
          setSuccess('Login efetuado!');
          redirectToDashboard(data.user.role);
        } else {
          setError(data.message || 'Erro ao efetuar login.');
        }
      } catch (err) {
        setError('Erro de rede ao conectar ao backend.');
      }
    }
  };

  // LOGOUT
  const handleLogout = async () => {
    clearAlerts();
    if (!isOfflineMode) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e) {}
    }
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    setCurrentPage('login');
  };

  // CADASTRO DO ALUNO
  const handleRegister = async (e) => {
    e.preventDefault();
    clearAlerts();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const registrationType = e.target.registrationType.value;
    const registrationNumber = e.target.registrationNumber.value;
    const acceptTerms = e.target.acceptTerms.checked;

    if (!acceptTerms) {
      setError('Você precisa aceitar os Termos de Uso e Sigilo de dados.');
      return;
    }

    if (isOfflineMode) {
      // Registro Mockado
      const exists = mockDb.users.some(u => u.email === email);
      if (exists) {
        setError('E-mail já cadastrado.');
        return;
      }

      const newUserId = 'student_' + Date.now();
      const newStudent = {
        id: newUserId, name, email, password, role: 'STUDENT', status: 'ACTIVE',
        registrationType, registrationNumber, terms_accepted: true, terms_accepted_at: new Date().toISOString()
      };

      // Matricular no curso livre padrão por 6 meses
      const newEnrollment = {
        id: 'enroll_' + Date.now(),
        student_id: newUserId,
        course_id: 'course-free',
        enrolled_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'ACTIVE'
      };

      setMockDb(prev => ({
        ...prev,
        users: [...prev.users, newStudent],
        enrollments: [...prev.enrollments, newEnrollment]
      }));

      setSuccess('Cadastro realizado! Matrícula no curso introdutório liberada por 6 meses (Modo Simulação).');
      setCurrentPage('login');
    } else {
      // Registro Real
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, registrationType, registrationNumber, acceptTerms })
        });
        const data = await res.json();
        if (res.ok) {
          setSuccess(data.message);
          setCurrentPage('login');
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Erro de rede.');
      }
    }
  };

  // DESBLOQUEIO DE CONTA
  const handleUnlock = async (e) => {
    e.preventDefault();
    clearAlerts();
    const email = e.target.email.value;
    const password = e.target.password.value;
    const verificationCode = e.target.verificationCode.value;

    if (isOfflineMode) {
      const found = mockDb.users.find(u => u.email === email && u.password === password);
      if (!found) {
        setError('Dados incorretos.');
        return;
      }
      if (verificationCode !== '123456') {
        setError('Código de segurança inválido. Utilize o código de teste "123456".');
        return;
      }
      setMockDb(prev => {
        const updated = prev.users.map(u => u.id === found.id ? { ...u, status: 'ACTIVE' } : u);
        return { ...prev, users: updated };
      });
      setSuccess('Conta desbloqueada com sucesso! Você já pode efetuar o login.');
      setCurrentPage('login');
    } else {
      try {
        const res = await fetch('/api/auth/unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, verificationCode })
        });
        const data = await res.json();
        if (res.ok) {
          setSuccess(data.message);
          setCurrentPage('login');
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Erro ao desbloquear.');
      }
    }
  };

  // CARREGAR CURSOS
  const loadCourses = async () => {
    if (isOfflineMode) {
      // Filtrar matrículas
      const myEnrollments = mockDb.enrollments.filter(e => e.student_id === user.id);
      const enrollMap = {};
      myEnrollments.forEach(e => {
        const isExpired = new Date(e.expires_at) < new Date();
        enrollMap[e.course_id] = {
          enrolled: true,
          status: isExpired ? 'EXPIRED' : e.status,
          expiresAt: e.expires_at
        };
      });

      const coursesWithEnrollment = mockDb.courses.map(c => ({
        ...c,
        enrollment: enrollMap[c.id] || { enrolled: false }
      }));
      setCourses(coursesWithEnrollment);
    } else {
      try {
        const res = await fetch('/api/courses', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (user && user.role === 'STUDENT' && currentPage === 'student-dash') {
      loadCourses();
      loadInvoices();
    }
  }, [user, currentPage]);

  // MATRICULAR NO CURSO LIVRE (GRATUITO)
  const enrollFreeCourse = async (courseId) => {
    clearAlerts();
    if (isOfflineMode) {
      const newEnroll = {
        id: 'enroll_' + Date.now(),
        student_id: user.id,
        course_id: courseId,
        enrolled_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 meses
        status: 'ACTIVE'
      };
      setMockDb(prev => ({
        ...prev,
        enrollments: [...prev.enrollments, newEnroll]
      }));
      setSuccess('Matrícula efetuada com sucesso! Acesso liberado por 6 meses.');
      loadCourses();
    } else {
      try {
        const res = await fetch(`/api/courses/${courseId}/enroll-free`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setSuccess(data.message);
          loadCourses();
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Erro de rede.');
      }
    }
  };

  // VISUALIZAR CURSO E AULAS
  const viewCourseDetails = async (courseId) => {
    clearAlerts();
    if (isOfflineMode) {
      const enroll = mockDb.enrollments.find(e => e.student_id === user.id && e.course_id === courseId);
      if (!enroll || enroll.status !== 'ACTIVE' || new Date(enroll.expires_at) < new Date()) {
        setError('Acesso negado: matrícula inexistente, inativa ou expirada.');
        return;
      }
      const course = mockDb.courses.find(c => c.id === courseId);
      const rawModules = mockDb.modules[courseId] || [];

      // Mapear progresso
      const populatedModules = rawModules.map(m => {
        const populatedLessons = m.lessons.map(l => {
          const prog = mockDb.lesson_progress[`${user.id}_${l.id}`] || { seconds_watched: 0, completed: false };
          return { ...l, ...prog };
        });
        return { ...m, lessons: populatedLessons };
      });

      setSelectedCourse({
        course,
        enrollment: enroll,
        modules: populatedModules
      });
      setCurrentPage('course-view');
    } else {
      try {
        const res = await fetch(`/api/courses/${courseId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setSelectedCourse(data);
          setCurrentPage('course-view');
        } else {
          setError(data.message);
        }
      } catch (e) {
        setError('Erro ao acessar o curso.');
      }
    }
  };

  // PLAYER E SELEÇÃO DE AULA
  const selectLesson = (lesson) => {
    setSelectedLesson(lesson);
    setLessonProgress({
      seconds_watched: lesson.seconds_watched || 0,
      completed: lesson.completed || false
    });
    setQuizData(null);
    setQuizResult(null);
    setQuizAnswers({});

    // Resetar timers do vídeo
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  // Quando o vídeo é executado, monitoramos a reprodução e enviamos o progresso
  const handleVideoPlay = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    progressIntervalRef.current = setInterval(async () => {
      if (videoRef.current) {
        const currentSeconds = Math.floor(videoRef.current.currentTime);
        const duration = Math.floor(videoRef.current.duration) || selectedLesson.duration_seconds;
        
        // Se assistiu mais de 60%, marca localmente como completo
        const completed = currentSeconds >= Math.floor(duration * 0.60);
        
        setLessonProgress({
          seconds_watched: currentSeconds,
          completed: completed || lessonProgress.completed
        });

        // Enviar para o servidor / Atualizar DB mock
        if (isOfflineMode) {
          setMockDb(prev => {
            const key = `${user.id}_${selectedLesson.id}`;
            const currentProg = prev.lesson_progress[key] || { completed: false, seconds_watched: 0 };
            
            return {
              ...prev,
              lesson_progress: {
                ...prev.lesson_progress,
                [key]: {
                  student_id: user.id,
                  lesson_id: selectedLesson.id,
                  seconds_watched: Math.max(currentProg.seconds_watched, currentSeconds),
                  completed: currentProg.completed || completed,
                  updated_at: new Date().toISOString()
                }
              }
            };
          });
        } else {
          try {
            await fetch(`/api/courses/lessons/${selectedLesson.id}/progress`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ secondsWatched: currentSeconds })
            });
          } catch (e) {}
        }
      }
    }, 2000); // Envia progresso a cada 2 segundos
  };

  const handleVideoPause = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // QUIZZES
  const loadQuiz = async () => {
    clearAlerts();
    if (isOfflineMode) {
      if (!selectedLesson.quiz) {
        setError('Esta aula não possui Quiz.');
        return;
      }
      const attemptsKey = `${user.id}_${selectedLesson.quiz.id}`;
      const attempts = mockDb.quiz_attempts[attemptsKey] || [];
      setQuizData({
        ...selectedLesson.quiz,
        attempts
      });
    } else {
      try {
        const res = await fetch(`/api/courses/lessons/${selectedLesson.id}/quiz`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setQuizData({
            ...data.quiz,
            attempts: data.attempts || []
          });
        } else {
          setError(data.message);
        }
      } catch (e) {}
    }
  };

  const handleSelectQuizOption = (questionId, optionIndex) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const submitQuiz = async () => {
    clearAlerts();
    const answersList = quizData.questions.map(q => quizAnswers[q.id]);
    
    if (answersList.includes(undefined)) {
      setError('Por favor, responda todas as perguntas.');
      return;
    }

    if (isOfflineMode) {
      const attemptsKey = `${user.id}_${quizData.id}`;
      const prevAttempts = mockDb.quiz_attempts[attemptsKey] || [];
      const attemptNum = prevAttempts.length + 1;

      if (attemptNum > quizData.max_attempts) {
        setError(`Erro: Você já utilizou o limite máximo de ${quizData.max_attempts} tentativas.`);
        return;
      }

      let correct = 0;
      quizData.questions.forEach((q, idx) => {
        if (answersList[idx] === q.correct) correct++;
      });

      const score = Math.round((correct / quizData.questions.length) * 100);
      const passed = score >= quizData.passing_score;

      const newAttempt = {
        score,
        passed,
        attempt_number: attemptNum,
        completed_at: new Date().toISOString()
      };

      setMockDb(prev => {
        const attempts = prev.quiz_attempts[attemptsKey] || [];
        return {
          ...prev,
          quiz_attempts: {
            ...prev.quiz_attempts,
            [attemptsKey]: [...attempts, newAttempt]
          }
        };
      });

      setQuizResult(newAttempt);
      loadQuiz(); // Recarregar tentativas
    } else {
      try {
        const res = await fetch(`/api/courses/quizzes/${quizData.id}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ answers: answersList })
        });
        const data = await res.json();
        if (res.ok) {
          setQuizResult(data);
          loadQuiz();
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Erro ao enviar quiz.');
      }
    }
  };

  // CHECKOUT & FATURAS
  const loadInvoices = async () => {
    if (isOfflineMode) {
      const userInvoices = mockDb.payments
        .filter(p => p.student_id === user.id)
        .map(p => {
          const c = mockDb.courses.find(course => course.id === p.course_id);
          return { ...p, course_title: c ? c.title : 'Curso' };
        });
      setMyInvoices(userInvoices);
    } else {
      try {
        const res = await fetch('/api/payments/my-invoices', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMyInvoices(data);
        }
      } catch (e) {}
    }
  };

  const startCheckout = (course) => {
    setCheckoutCourse(course);
    setCurrentPage('checkout');
  };

  const handleProcessCheckout = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (isOfflineMode) {
      const transactionCode = 'ASAAS_' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const asaasPaymentId = 'pay_' + Math.random().toString(36).substr(2, 12);
      let price = checkoutCourse.type === 'SUBSCRIPTION' ? 99.00 : 3600.00;

      const newPayments = [];
      if (paymentMethod === 'CARNE' && checkoutCourse.type === 'POSTGRAD') {
        const count = installments || 12;
        const partAmt = (price / count).toFixed(2);
        for (let i = 1; i <= count; i++) {
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + (i - 1));
          newPayments.push({
            id: `pay-${Date.now()}-${i}`,
            student_id: user.id,
            course_id: checkoutCourse.id,
            amount: parseFloat(partAmt),
            payment_method: 'CARNE',
            status: 'PENDING',
            transaction_code: `${transactionCode}_PARC${i}`,
            due_date: dueDate.toISOString().split('T')[0],
            asaas_payment_id: `${asaasPaymentId}_${i}`
          });
        }
      } else {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3);
        newPayments.push({
          id: `pay-${Date.now()}`,
          student_id: user.id,
          course_id: checkoutCourse.id,
          amount: price,
          payment_method: paymentMethod,
          status: 'PENDING',
          transaction_code: transactionCode,
          due_date: dueDate.toISOString().split('T')[0],
          asaas_payment_id: asaasPaymentId
        });
      }

      setMockDb(prev => ({
        ...prev,
        payments: [...prev.payments, ...newPayments]
      }));

      setSuccess('Faturas geradas em modo Sandbox do Asaas! Realize a simulação de pagamento na listagem financeira.');
      setCurrentPage('student-dash');
    } else {
      try {
        const res = await fetch('/api/payments/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            courseId: checkoutCourse.id,
            paymentMethod,
            installments: paymentMethod === 'CARNE' ? installments : 1
          })
        });
        const data = await res.json();
        if (res.ok) {
          setSuccess(data.message);
          setCurrentPage('student-dash');
        } else {
          setError(data.message);
        }
      } catch (e) {
        setError('Erro de rede ao finalizar checkout.');
      }
    }
  };

  // Simular recebimento do webhook (Libera curso)
  const simulatePaymentWebhook = async (asaasPaymentId) => {
    clearAlerts();
    if (isOfflineMode) {
      const matchPayments = mockDb.payments.filter(p => p.asaas_payment_id === asaasPaymentId || p.asaas_payment_id.startsWith(`${asaasPaymentId}_`));
      
      if (matchPayments.length === 0) return;

      setMockDb(prev => {
        // Atualiza pagamentos para RECEIVED
        const updatedPayments = prev.payments.map(p => {
          if (p.asaas_payment_id === asaasPaymentId || p.asaas_payment_id.startsWith(`${asaasPaymentId}_`)) {
            return { ...p, status: 'RECEIVED', paid_at: new Date().toISOString() };
          }
          return p;
        });

        // Criar ou reativar matrícula
        const targetCourseId = matchPayments[0].course_id;
        const course = prev.courses.find(c => c.id === targetCourseId);
        const duration = course ? course.duration_days : 180;

        let enrollmentExists = false;
        const updatedEnrollments = prev.enrollments.map(e => {
          if (e.student_id === user.id && e.course_id === targetCourseId) {
            enrollmentExists = true;
            return { ...e, status: 'ACTIVE', expires_at: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString() };
          }
          return e;
        });

        if (!enrollmentExists) {
          updatedEnrollments.push({
            id: 'enroll_' + Date.now(),
            student_id: user.id,
            course_id: targetCourseId,
            enrolled_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
            status: 'ACTIVE'
          });
        }

        return {
          ...prev,
          payments: updatedPayments,
          enrollments: updatedEnrollments
        };
      });

      setSuccess('Simulação concluída! Pagamento recebido e matrícula ativada por 6 meses (ou 30 dias se assinatura).');
      loadInvoices();
    } else {
      try {
        const res = await fetch('/api/payments/simulate-webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ asaasPaymentId })
        });
        const data = await res.json();
        if (res.ok) {
          setSuccess(data.message);
          loadInvoices();
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Erro de rede.');
      }
    }
  };

  // PROFESSOR: CARREGAR RELATÓRIO
  const loadTeacherReport = async () => {
    if (isOfflineMode) {
      // Filtrar matrículas dos cursos deste professor
      const myCourses = mockDb.courses.filter(c => c.teacher_id === user.id);
      const myCourseIds = myCourses.map(c => c.id);

      const reports = mockDb.enrollments
        .filter(e => myCourseIds.includes(e.course_id))
        .map(e => {
          const student = mockDb.users.find(u => u.id === e.student_id);
          const course = myCourses.find(c => c.id === e.course_id);
          
          // Progresso de aulas (quantidade)
          const courseModules = mockDb.modules[course.id] || [];
          let totalLessons = 0;
          let completedLessons = 0;
          let quizPassed = 0;
          let presenceCount = 0;

          courseModules.forEach(mod => {
            mod.lessons.forEach(l => {
              totalLessons++;
              const progKey = `${student.id}_${l.id}`;
              const prog = mockDb.lesson_progress[progKey];
              if (prog && prog.completed) {
                completedLessons++;
              }

              // Quizzes
              if (l.quiz) {
                const quizKey = `${student.id}_${l.quiz.id}`;
                const attempts = mockDb.quiz_attempts[quizKey] || [];
                const passed = attempts.some(a => a.passed);
                if (passed) quizPassed++;

                if (prog && prog.completed && passed) {
                  presenceCount++; // Presença oficial: 60% assistido + quiz feito
                }
              }
            });
          });

          return {
            studentName: student ? student.name : 'Aluno',
            studentEmail: student ? student.email : '',
            courseTitle: course.title,
            courseType: course.type,
            enrolledAt: e.enrolled_at,
            expiresAt: e.expires_at,
            enrollmentStatus: e.status,
            totalLessons,
            completedLessons,
            quizzesPassed: quizPassed,
            presenceCount,
            progressPercent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
          };
        });

      setTeacherReportData(reports);
    } else {
      try {
        const res = await fetch('/api/reports/teacher-report', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setTeacherReportData(data);
        }
      } catch (e) {}
    }
  };

  // ADMIN: CARREGAR RELATÓRIO FINANCEIRO & LOGS
  const loadAdminReport = async () => {
    if (isOfflineMode) {
      // Métricas financeiras mock
      const received = mockDb.payments
        .filter(p => p.status === 'RECEIVED')
        .reduce((sum, p) => sum + p.amount, 0);

      const pending = mockDb.payments
        .filter(p => p.status === 'PENDING')
        .reduce((sum, p) => sum + p.amount, 0);

      // Overdue (Vencimento menor que hoje e status pending)
      const todayStr = new Date().toISOString().split('T')[0];
      const overdue = mockDb.payments
        .filter(p => p.status === 'PENDING' && p.due_date < todayStr)
        .reduce((sum, p) => sum + p.amount, 0);

      // MRR mock (assinaturas recebidas nos últimos 30 dias)
      const mrr = mockDb.payments
        .filter(p => p.status === 'RECEIVED' && p.course_id === 'course-sub')
        .reduce((sum, p) => sum + p.amount, 0);

      setAdminReportData({
        summary: { totalReceived: received, totalPending: pending, totalOverdue: overdue, mrr },
        salesByMethod: [
          { payment_method: 'PIX', count: mockDb.payments.filter(p => p.payment_method === 'PIX').length, total: mockDb.payments.filter(p => p.payment_method === 'PIX').reduce((s, p) => s + p.amount, 0) },
          { payment_method: 'CREDIT_CARD', count: mockDb.payments.filter(p => p.payment_method === 'CREDIT_CARD').length, total: mockDb.payments.filter(p => p.payment_method === 'CREDIT_CARD').reduce((s, p) => s + p.amount, 0) },
          { payment_method: 'CARNE', count: mockDb.payments.filter(p => p.payment_method === 'CARNE').length, total: mockDb.payments.filter(p => p.payment_method === 'CARNE').reduce((s, p) => s + p.amount, 0) }
        ]
      });

      setSecurityLogs(mockDb.logs);
    } else {
      try {
        const resFin = await fetch('/api/payments/admin-report', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const resLogs = await fetch('/api/reports/security-logs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resFin.ok && resLogs.ok) {
          const finData = await resFin.json();
          const logData = await resLogs.json();
          setAdminReportData(finData);
          setSecurityLogs(logData);
        }
      } catch (e) {}
    }
  };

  // ADMIN: CONCILIAÇÃO OFX
  const handleConciliation = async (e) => {
    e.preventDefault();
    clearAlerts();

    if (isOfflineMode) {
      // Simulação de Parser de OFX no frontend!
      // Extrair tags <STMTTRN>
      const trnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
      const parsedTx = [];
      let m;
      while ((m = trnRegex.exec(ofxInput)) !== null) {
        const block = m[1];
        const amtMatch = block.match(/<TRNAMT>([^<\r\n]+)/i);
        const refMatch = block.match(/<REFNUM>([^<\r\n]+)/i);
        const memoMatch = block.match(/<MEMO>([^<\r\n]+)/i);

        const amt = amtMatch ? parseFloat(amtMatch[1].trim()) : 0;
        const ref = refMatch ? refMatch[1].trim() : '';
        const memo = memoMatch ? memoMatch[1].trim() : '';

        parsedTx.push({ amount: amt, ref, memo });
      }

      const results = { reconciled: [], divergent: [], unmatched: [], processedCount: parsedTx.length };
      
      setMockDb(prev => {
        const currentPayments = [...prev.payments];
        const currentEnrollments = [...prev.enrollments];

        parsedTx.forEach(tx => {
          const rawCode = tx.memo || tx.ref || '';
          const codeMatch = rawCode.match(/ASAAS_[A-Z0-9_]+/i);
          const code = codeMatch ? codeMatch[0].toUpperCase() : null;

          if (!code) {
            results.unmatched.push({ description: 'Transação bancária sem código Asaas', amount: tx.amount });
            return;
          }

          const payIdx = currentPayments.findIndex(p => p.transaction_code === code);
          if (payIdx === -1) {
            results.unmatched.push({ description: `Código ${code} não encontrado no LMS`, amount: tx.amount });
            return;
          }

          const p = currentPayments[payIdx];
          const bankAmt = Math.abs(tx.amount);
          const localAmt = parseFloat(p.amount);

          if (bankAmt !== localAmt) {
            results.divergent.push({ transactionCode: code, bankAmount: bankAmt, localAmount: localAmt });
            return;
          }

          // Conciliar
          if (p.status === 'PENDING') {
            currentPayments[payIdx] = { ...p, status: 'RECEIVED', paid_at: new Date().toISOString() };
            
            // Ativar matrícula
            const c = prev.courses.find(course => course.id === p.course_id);
            const duration = c ? c.duration_days : 180;
            const enIdx = currentEnrollments.findIndex(e => e.student_id === p.student_id && e.course_id === p.course_id);
            
            if (enIdx !== -1) {
              currentEnrollments[enIdx] = { ...currentEnrollments[enIdx], status: 'ACTIVE', expires_at: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString() };
            } else {
              currentEnrollments.push({
                id: 'enroll_' + Date.now(),
                student_id: p.student_id,
                course_id: p.course_id,
                enrolled_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
                status: 'ACTIVE'
              });
            }

            results.reconciled.push({ transactionCode: code, amount: bankAmt, statusChanged: true });
          } else {
            results.reconciled.push({ transactionCode: code, amount: bankAmt, statusChanged: false, message: 'Já estava confirmado' });
          }
        });

        return {
          ...prev,
          payments: currentPayments,
          enrollments: currentEnrollments
        };
      });

      setConciliationResults(results);
      setSuccess('Conciliação financeira simulada processada com sucesso!');
      loadAdminReport();
    } else {
      try {
        const res = await fetch('/api/conciliations/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ofxContent: ofxInput })
        });
        const data = await res.json();
        if (res.ok) {
          setConciliationResults(data.results);
          setSuccess(data.message);
          loadAdminReport();
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Erro ao processar conciliação.');
      }
    }
  };

  // Gerador rápido de arquivo OFX para o Admin testar
  const handleGenerateMockOfx = () => {
    // Pegar o primeiro pagamento PENDING do banco mock ou buscar no relatório
    const pendingP = mockDb.payments.find(p => p.status === 'PENDING');
    const code = pendingP ? pendingP.transaction_code : 'ASAAS_TEST999';
    const amount = pendingP ? pendingP.amount : 99.00;

    const ofxStr = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEENCODING:NONE
NEWFILEENCODING:NONE

<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<TRNUID>1
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<STMTRS>
<CURDEF>BRL
<BANKTRANLIST>
<DTSTART>20260601120000
<DTEND>20260604120000
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20260604120000
<TRNAMT>${amount}
<FITID>bank_tx_10012
<REFNUM>${code}</REFNUM>
<MEMO>Recebimento boleto ${code}</MEMO>
</STMTTRN>
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;

    setOfxInput(ofxStr);
    setSuccess('OFX gerado com o código da fatura pendente ativa! Clique em "Processar Conciliação" abaixo.');
  };

  // LOGIN RÁPIDO PARA DESENVOLVEDOR (Fácil e prático para o usuário validar)
  const quickLogin = (role) => {
    clearAlerts();
    let email = '';
    if (role === 'admin') email = 'admin@lms.com';
    else if (role === 'teacher') email = 'carlos@tosb.com';
    else if (role === 'student') email = 'ana@lms.com';

    // Fazer preenchimento automático
    const form = document.getElementById('login-form');
    if (form) {
      form.email.value = email;
      form.password.value = 'senha123';
    }
  };

  // Simular avanço manual de vencimento de boleto para testar os 10 dias de inadimplência
  const handleSimulateDelinquency = () => {
    clearAlerts();
    setMockDb(prev => {
      // Atualizar o vencimento de algum boleto pendente da ana@lms.com para 12 dias atrás
      const updatedPayments = prev.payments.map(p => {
        if (p.student_id === 'student-id' && p.status === 'PENDING') {
          const oldDate = new Date();
          oldDate.setDate(oldDate.getDate() - 12); // 12 dias atrás
          return { ...p, due_date: oldDate.toISOString().split('T')[0] };
        }
        return p;
      });

      // Suspender matrícula
      const updatedEnroll = prev.enrollments.map(e => {
        if (e.student_id === 'student-id' && e.course_id === 'course-free') {
          return { ...e, status: 'SUSPENDED' };
        }
        return e;
      });

      return {
        ...prev,
        payments: updatedPayments,
        enrollments: updatedEnroll
      };
    });
    setSuccess('Simulação de Inadimplência: O vencimento do boleto pendente da Dra. Ana Paula foi alterado para 12 dias atrás, e sua matrícula foi SUSPENSA automaticamente.');
    loadCourses();
  };

  return (
    <div className="app-container">
      {/* Cabeçalho */}
      <header className="tosb-header">
        <a href="#home" className="logo-container" onClick={() => user ? redirectToDashboard(user.role) : setCurrentPage('login')}>
          <span className="logo-symbol">🌿</span>
          <div className="logo-text">
            <span className="logo-title">The Other Song</span>
            <span className="logo-subtitle">Brasil | EAD</span>
          </div>
        </a>

        {isOfflineMode && (
          <div className="offline-mode-badge">
            🔌 Modo de Simulação
          </div>
        )}

        <nav className="nav-links">
          {user ? (
            <>
              <span className="user-greeting">Olá, <strong>{user.name}</strong> ({user.role})</span>
              <button className="btn btn-secondary" onClick={handleLogout}>Sair</button>
            </>
          ) : (
            <>
              <button className="nav-link" onClick={() => { clearAlerts(); setCurrentPage('login'); }}>Entrar</button>
              <button className="nav-link" onClick={() => { clearAlerts(); setCurrentPage('register'); }}>Cadastrar</button>
              <button className="nav-link" onClick={() => { clearAlerts(); setCurrentPage('unlock'); }}>Portal de Segurança</button>
            </>
          )}
        </nav>
      </header>

      {/* Alertas */}
      <div className="main-content main-content-top">
        {error && <div className="alert alert-danger"><strong>Aviso:</strong> {error}</div>}
        {success && <div className="alert alert-success"><strong>Sucesso:</strong> {success}</div>}
      </div>

      {/* Conteúdo das Páginas */}
      <main className="main-content">
        
        {/* PÁGINA: LOGIN */}
        {currentPage === 'login' && (
          <div className="card auth-box">
            <h2 className="mb-2 text-center">Acesso Acadêmico</h2>
            <p className="text-muted text-center mb-5">
              Plataforma Científica de Homeopatia
            </p>

            {/* LOGIN RÁPIDO ASSISTENTE */}
            <div className="quick-login-container">
              <span className="quick-login-title">Assistente de Validação Rápida:</span>
              <div className="quick-login-buttons">
                <button className="btn btn-secondary btn-quick-login" onClick={() => quickLogin('student')}>Ana (Aluno)</button>
                <button className="btn btn-secondary btn-quick-login" onClick={() => quickLogin('teacher')}>Carlos (Prof)</button>
                <button className="btn btn-secondary btn-quick-login" onClick={() => quickLogin('admin')}>Admin</button>
              </div>
              <small className="helper-text">Preenche automaticamente com a senha padrão <em>senha123</em>.</small>
            </div>

            <form id="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input className="form-input" type="email" name="email" required placeholder="ex: medico@exemplo.com" />
              </div>
              
              <div className="form-group">
                <label className="form-label">Senha</label>
                <input className="form-input" type="password" name="password" required placeholder="Digite sua senha" />
              </div>

              <div className="form-group ip-warning-container">
                <input type="checkbox" id="simulateIp" name="simulateIp" />
                <label htmlFor="simulateIp" className="ip-warning-label">
                  <strong>Simular login em IP distante</strong> (Trava Opção B)
                </label>
              </div>

              <button className="btn btn-primary w-full mt-2" type="submit">Entrar na Plataforma</button>
            </form>
          </div>
        )}

        {/* PÁGINA: CADASTRO */}
        {currentPage === 'register' && (
          <div className="card auth-box auth-box-wide">
            <h2 className="mb-2 text-center">Inscrição Profissional</h2>
            <p className="text-muted text-center mb-5">
              Preencha seus dados de saúde para validação acadêmica
            </p>

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Nome Completo</label>
                <input className="form-input" type="text" name="name" required placeholder="Dra. Roberta Silva" />
              </div>

              <div className="form-group">
                <label className="form-label">E-mail de Trabalho</label>
                <input className="form-input" type="email" name="email" required placeholder="contato@robertasilva.med.br" />
              </div>

              <div className="form-group">
                <label className="form-label">Senha de Acesso</label>
                <input className="form-input" type="password" name="password" required placeholder="Mínimo 6 caracteres" />
              </div>

              <div className="grid-2col">
                <div className="form-group">
                  <label className="form-label">Conselho Profissional</label>
                  <select className="form-input" name="registrationType">
                    <option value="CRM">CRM (Medicina)</option>
                    <option value="CRO">CRO (Odontologia)</option>
                    <option value="CRF">CRF (Farmácia)</option>
                    <option value="CRV">CRV (Veterinária)</option>
                    <option value="OUTROS">Outros Conselhos Integrados</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Número de Registro</label>
                  <input className="form-input" type="text" name="registrationNumber" required placeholder="ex: 123456-SP" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Termos de Uso e Sigilo Científico</label>
                <div className="terms-container">
                  {TERMS_TEXT}
                </div>
                <div className="flex-center-gap">
                  <input type="checkbox" id="acceptTerms" name="acceptTerms" required />
                  <label htmlFor="acceptTerms" className="cursor-pointer">Li e aceito os termos específicos para Homeopatas.</label>
                </div>
              </div>

              <button className="btn btn-primary w-full mt-4" type="submit">Criar Conta e Confirmar Registro</button>
            </form>
          </div>
        )}

        {/* PÁGINA: DESBLOQUEIO DE SEGURANÇA */}
        {currentPage === 'unlock' && (
          <div className="card auth-box">
            <h2 className="mb-2 text-center">Portal de Desbloqueio</h2>
            <p className="text-muted text-center mb-5">
              Ativação de conta suspensa por detecção de login simultâneo
            </p>

            <form onSubmit={handleUnlock}>
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input className="form-input" type="email" name="email" required />
              </div>

              <div className="form-group">
                <label className="form-label">Senha</label>
                <input className="form-input" type="password" name="password" required />
              </div>

              <div className="form-group">
                <label className="form-label">Código de Segurança Enviado por E-mail</label>
                <input className="form-input" type="text" name="verificationCode" required placeholder="Digite o código enviado (Código de teste: 123456)" />
              </div>

              <button className="btn btn-danger w-full mt-4" type="submit">Reativar Conta</button>
            </form>
          </div>
        )}

        {/* PÁGINA: DASHBOARD DO ALUNO */}
        {currentPage === 'student-dash' && (
          <div>
            <div className="dashboard-header">
              <div>
                <h1 className="font-serif-title">Meus Estudos Homeopáticos</h1>
                <p className="text-muted">Gerencie suas disciplinas, progresso acadêmico e financeiro.</p>
              </div>

              {isOfflineMode && (
                <button className="btn btn-danger" onClick={handleSimulateDelinquency}>
                  Simular Inadimplência (Boleto Vencido)
                </button>
              )}
            </div>

            <div className="dashboard-layout">
              
              {/* Lista de Cursos */}
              <div>
                <h3 className="section-title-underlined">Grade de Cursos</h3>
                
                <div className="courses-list">
                  {courses.map(course => (
                    <div key={course.id} className="card course-card-grid">
                      <div>
                        <span className="course-type-badge">
                          {course.type === 'FREE' ? 'Curso Livre (Gratuito)' : course.type === 'SUBSCRIPTION' ? 'Clube (Assinatura)' : 'Pós-Graduação'}
                        </span>
                        <h3 className="course-card-title">{course.title}</h3>
                        <p className="course-card-description">{course.description}</p>
                        
                        {course.enrollment.enrolled && (
                          <div className="course-card-expires">
                            Acesso até: <strong>{new Date(course.enrollment.expiresAt).toLocaleDateString('pt-BR')}</strong>
                          </div>
                        )}
                      </div>

                      <div className="course-card-actions">
                        {course.enrollment.enrolled ? (
                          course.enrollment.status === 'ACTIVE' ? (
                            <button className="btn btn-primary" onClick={() => viewCourseDetails(course.id)}>Assistir Aulas</button>
                          ) : course.enrollment.status === 'SUSPENDED' ? (
                            <div className="error-text-bold">
                              ⚠️ Acesso Bloqueado por Inadimplência
                            </div>
                          ) : (
                            <div className="muted-text-bold">
                              ❌ Acesso Expirado (6 Meses)
                            </div>
                          )
                        ) : (
                          course.type === 'FREE' ? (
                            <button className="btn btn-secondary" onClick={() => enrollFreeCourse(course.id)}>Matricular Grátis</button>
                          ) : (
                            <button className="btn btn-primary" onClick={() => startCheckout(course)}>Comprar / Assinar</button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Faturamento / Financeiro do Aluno */}
              <div>
                <h3 className="section-title-underlined">Financeiro</h3>
                
                <div className="invoices-list">
                  {myInvoices.length === 0 ? (
                    <p className="text-muted text-center mt-3">Nenhuma fatura registrada.</p>
                  ) : (
                    myInvoices.map(inv => (
                      <div key={inv.id} className="invoice-card">
                        <div className="invoice-title">{inv.course_title}</div>
                        <div className="invoice-details">Valor: R$ {parseFloat(inv.amount).toFixed(2)} ({inv.payment_method})</div>
                        
                        <div className="invoice-footer">
                          <span className={inv.status === 'RECEIVED' ? 'badge-paid' : 'badge-pending'}>
                            {inv.status === 'RECEIVED' ? 'PAGO' : 'PENDENTE'}
                          </span>

                          {inv.status === 'PENDING' && (
                            <button className="btn btn-primary btn-quick-login" onClick={() => simulatePaymentWebhook(inv.asaas_payment_id)}>
                              Simular Pago
                            </button>
                          )}
                        </div>
                        <small className="invoice-ref">Ref: {inv.transaction_code}</small>
                        <small className="invoice-due">Vencimento: {new Date(inv.due_date).toLocaleDateString('pt-BR')}</small>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PÁGINA: CHECKOUT */}
        {currentPage === 'checkout' && checkoutCourse && (
          <div className="card auth-box">
            <h2 className="section-title-underlined-thin">Matrícula & Checkout Asaas</h2>
            
            <div className="mb-5">
              <span className="course-type-badge">Item Selecionado</span>
              <h3>{checkoutCourse.title}</h3>
              <p className="course-card-description">{checkoutCourse.description}</p>
              <div className="checkout-item-title">
                {checkoutCourse.type === 'SUBSCRIPTION' ? 'R$ 99,00 / mês' : 'R$ 3.600,00 à vista'}
              </div>
            </div>

            <form onSubmit={handleProcessCheckout}>
              <div className="form-group">
                <label className="form-label">Forma de Pagamento</label>
                <select className="form-input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  <option value="PIX">Pix Imediato (QR Code)</option>
                  <option value="CREDIT_CARD">Cartão de Crédito</option>
                  <option value="BOLETO">Boleto Programado</option>
                  {checkoutCourse.type === 'POSTGRAD' && (
                    <option value="CARNE">Boleto Parcelado (Carnê da Pós)</option>
                  )}
                </select>
              </div>

              {paymentMethod === 'CARNE' && (
                <div className="form-group">
                  <label className="form-label">Parcelas (Carnê)</label>
                  <select className="form-input" value={installments} onChange={(e) => setInstallments(parseInt(e.target.value))}>
                    <option value={6}>6x de R$ 600,00</option>
                    <option value={12}>12x de R$ 300,00</option>
                    <option value={18}>18x de R$ 200,00</option>
                  </select>
                </div>
              )}

              <div className="checkout-actions">
                <button className="btn btn-secondary flex-1" type="button" onClick={() => setCurrentPage('student-dash')}>Cancelar</button>
                <button className="btn btn-primary flex-2" type="submit">Gerar Fatura no Asaas</button>
              </div>
            </form>
          </div>
        )}

        {/* PÁGINA: LMS / CURSO E PLAYER */}
        {currentPage === 'course-view' && selectedCourse && (
          <div>
            <button className="btn btn-secondary" style={{ marginBottom: '1.5rem' }} onClick={() => setCurrentPage('student-dash')}>
              ← Voltar ao Dashboard
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
              
              {/* Player Principal e Aulas */}
              <div>
                <h2>{selectedCourse.course.title}</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>{selectedCourse.course.description}</p>
                
                {selectedLesson ? (
                  <div>
                    <div className="player-container">
                      <video
                        ref={videoRef}
                        key={selectedLesson.id}
                        className="player-video"
                        controls
                        src={selectedLesson.video_url}
                        onPlay={handleVideoPlay}
                        onPause={handleVideoPause}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                      <h3>{selectedLesson.title}</h3>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem' }}>
                          Assistido: <strong>{lessonProgress ? lessonProgress.seconds_watched : 0}s</strong> / {selectedLesson.duration_seconds}s
                        </span>
                        
                        <span style={{
                          padding: '0.2rem 0.5rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
                          backgroundColor: lessonProgress && lessonProgress.completed ? '#dcfce7' : '#f1f5f9',
                          color: lessonProgress && lessonProgress.completed ? '#166534' : '#64748b'
                        }}>
                          {lessonProgress && lessonProgress.completed ? '✓ Concluído (60%+)' : 'Pendente'}
                        </span>
                      </div>
                    </div>

                    {/* Exibir Questionário se hovar na aula (Exemplo na Pós) */}
                    {selectedLesson.quiz ? (
                      <div style={{ marginTop: '2rem', borderTop: '2px solid var(--color-border)', paddingTop: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <div>
                            <h3 style={{ fontFamily: 'var(--font-serif)' }}>{selectedLesson.quiz.title}</h3>
                            <small style={{ color: 'var(--color-text-muted)' }}>Regras: Máx. 2 tentativas, aprovação mínima de 70%.</small>
                          </div>
                          {!quizData ? (
                            <button className="btn btn-primary" onClick={loadQuiz}>Iniciar Quiz da Aula</button>
                          ) : (
                            <button className="btn btn-secondary" onClick={() => setQuizData(null)}>Recolher Quiz</button>
                          )}
                        </div>

                        {quizData && (
                          <div className="quiz-container">
                            {quizData.attempts.length > 0 && (
                              <div style={{ marginBottom: '1.5rem' }}>
                                <strong>Suas tentativas anteriores:</strong>
                                <ul style={{ fontSize: '0.85rem', marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                                  {quizData.attempts.map((a, i) => (
                                    <li key={i} style={{ color: a.passed ? 'var(--color-success)' : 'var(--color-error)' }}>
                                      Tentativa {a.attempt_number}: Nota {a.score}% ({a.passed ? 'Aprovado' : 'Reprovado'}) em {new Date(a.completed_at).toLocaleDateString('pt-BR')}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Mostrar formulário se não atingiu limite e não foi aprovado ainda */}
                            {quizData.attempts.length < quizData.max_attempts && !quizData.attempts.some(a => a.passed) ? (
                              <div>
                                {quizData.questions.map((q, idx) => (
                                  <div key={q.id} className="quiz-question-card">
                                    <div className="quiz-question-text"><strong>Questão {idx + 1}:</strong> {q.question_text}</div>
                                    {q.options.map((opt, oIdx) => (
                                      <div
                                        key={oIdx}
                                        className={`quiz-option-label ${quizAnswers[q.id] === oIdx ? 'selected' : ''}`}
                                        onClick={() => handleSelectQuizOption(q.id, oIdx)}
                                      >
                                        <input
                                          type="radio"
                                          name={`q_${q.id}`}
                                          checked={quizAnswers[q.id] === oIdx}
                                          onChange={() => {}}
                                          style={{ pointerEvents: 'none' }}
                                        />
                                        <span>{opt}</span>
                                      </div>
                                    ))}
                                  </div>
                                ))}

                                <button className="btn btn-primary" style={{ width: '100%' }} onClick={submitQuiz}>Enviar Respostas do Quiz</button>
                              </div>
                            ) : (
                              <div className="alert alert-warning">
                                {quizData.attempts.some(a => a.passed) 
                                  ? '✓ Você já está aprovado nesta avaliação!' 
                                  : '❌ Você esgotou suas tentativas de questionário nesta disciplina.'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Esta aula não possui Quiz obrigatório.</p>
                    )}

                  </div>
                ) : (
                  <div style={{ border: '2px dashed var(--color-border)', borderRadius: '12px', padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    🌿 Selecione uma aula ao lado para assistir à gravação científica.
                  </div>
                )}

                {/* Mensagem personalizada ao finalizar todas as aulas do curso */}
                {selectedCourse.modules.every(m => m.lessons.every(l => l.completed)) && (
                  <div className="card alert-success" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '2rem', borderLeft: '8px solid var(--color-success)' }}>
                    <h3 style={{ color: 'var(--color-success)', fontFamily: 'var(--font-serif)' }}>Curso Concluído!</h3>
                    <p style={{ fontSize: '0.95rem' }}>"{selectedCourse.course.finishing_message}"</p>
                  </div>
                )}

              </div>

              {/* Lista de Módulos / Aulas Laterais */}
              <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Módulos do Curso</h3>
                
                {selectedCourse.modules.map(mod => (
                  <div key={mod.id} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                      {mod.title}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {mod.lessons.map(lesson => (
                        <div
                          key={lesson.id}
                          onClick={() => selectLesson(lesson)}
                          style={{
                            padding: '0.6rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
                            border: '1px solid',
                            borderColor: selectedLesson && selectedLesson.id === lesson.id ? 'var(--color-primary)' : 'transparent',
                            backgroundColor: selectedLesson && selectedLesson.id === lesson.id ? 'var(--color-primary-light)' : '#fff',
                            color: selectedLesson && selectedLesson.id === lesson.id ? 'var(--color-primary)' : 'var(--color-text-main)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                          }}
                        >
                          <span>{lesson.title}</span>
                          <span>{lesson.completed ? '✓' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* PÁGINA: DASHBOARD DO PROFESSOR */}
        {currentPage === 'teacher-dash' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ fontFamily: 'var(--font-serif)' }}>Portal do Professor</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Gerencie o progresso e a presença dos seus alunos nas aulas gravadas.</p>
              </div>
              <button className="btn btn-secondary" onClick={loadTeacherReport}>Atualizar Relatório</button>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Relatório Consolidado de Alunos</h3>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-secondary)' }}>
                      <th style={{ padding: '0.75rem' }}>Aluno</th>
                      <th style={{ padding: '0.75rem' }}>Curso</th>
                      <th style={{ padding: '0.75rem' }}>Data Matrícula</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Progresso Aulas</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Presenças</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Quizzes Feitos</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status Acesso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherReportData.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: '2rem', textAlignment: 'center', color: 'var(--color-text-muted)' }}>
                          Nenhum aluno matriculado em seus cursos ainda.
                        </td>
                      </tr>
                    ) : (
                      teacherReportData.map((rep, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '0.75rem' }}>
                            <strong>{rep.studentName}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{rep.studentEmail}</div>
                          </td>
                          <td style={{ padding: '0.75rem' }}>{rep.courseTitle}</td>
                          <td style={{ padding: '0.75rem' }}>{new Date(rep.enrolledAt).toLocaleDateString('pt-BR')}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            {rep.completedLessons}/{rep.totalLessons} ({rep.progressPercent}%)
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: rep.presenceCount > 0 ? 'var(--color-success)' : 'inherit' }}>
                              {rep.presenceCount}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>{rep.quizzesPassed}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <span style={{
                              padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                              backgroundColor: rep.enrollmentStatus === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                              color: rep.enrollmentStatus === 'ACTIVE' ? '#166534' : '#991b1b'
                            }}>
                              {rep.enrollmentStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PÁGINA: DASHBOARD DO ADMINISTRADOR */}
        {currentPage === 'admin-dash' && (
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1.5rem' }}>Painel Administrativo da Homeopatia EAD</h1>

            {/* Widgets Financeiros */}
            {adminReportData && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                
                <div className="card" style={{ borderLeft: '6px solid var(--color-primary)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Receita Total (Paga)</span>
                  <h2 style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>R$ {adminReportData.summary.totalReceived.toFixed(2)}</h2>
                </div>

                <div className="card" style={{ borderLeft: '6px solid var(--color-warning)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Receita em Aberto</span>
                  <h2 style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>R$ {adminReportData.summary.totalPending.toFixed(2)}</h2>
                </div>

                <div className="card" style={{ borderLeft: '6px solid var(--color-error)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Valores Vencidos</span>
                  <h2 style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>R$ {adminReportData.summary.totalOverdue.toFixed(2)}</h2>
                </div>

                <div className="card" style={{ borderLeft: '6px solid var(--color-accent)' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Recorrência Mensal (MRR)</span>
                  <h2 style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>R$ {adminReportData.summary.mrr.toFixed(2)}</h2>
                </div>

              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              
              {/* Conciliação OFX */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3>Conciliação Bancária (.OFX)</h3>
                  <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={handleGenerateMockOfx}>
                    Gerar OFX de Teste
                  </button>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Cole aqui o conteúdo textual do arquivo de extrato bancário (.OFX) para cruzar com as vendas no banco do LMS.
                </p>

                <form onSubmit={handleConciliation}>
                  <textarea
                    className="form-input"
                    style={{ minHeight: '180px', fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '1rem' }}
                    placeholder="Cole as tags XML do arquivo OFX ou use o botão 'Gerar OFX de Teste' acima..."
                    value={ofxInput}
                    onChange={(e) => setOfxInput(e.target.value)}
                    required
                  />

                  <button className="btn btn-primary" style={{ width: '100%' }} type="submit">Processar Conciliação Financeira</button>
                </form>

                {conciliationResults && (
                  <div style={{ marginTop: '1.5rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Resultado do Processamento:</h4>
                    <div>Total de Lançamentos no Arquivo: <strong>{conciliationResults.processedCount}</strong></div>
                    <div style={{ color: 'var(--color-success)' }}>✓ Conciliados: <strong>{conciliationResults.reconciled.length}</strong></div>
                    <div style={{ color: 'var(--color-warning)' }}>⚠️ Divergentes de valor: <strong>{conciliationResults.divergent.length}</strong></div>
                    <div style={{ color: 'var(--color-text-muted)' }}>✗ Não localizados no LMS: <strong>{conciliationResults.unmatched.length}</strong></div>
                  </div>
                )}
              </div>

              {/* Logs de Acesso e Auditoria de Segurança */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3>Registros de Acesso e Segurança</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Auditoria em tempo real de IPs, agentes de usuário e travas de segurança acionadas.
                </p>

                <div style={{ flex: 1, maxHeight: '350px', overflowY: 'auto', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: '#f8fafc', padding: '0.5rem' }}>
                  {securityLogs.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', padding: '1rem' }}>Nenhum log registrado.</p>
                  ) : (
                    securityLogs.map((log, idx) => (
                      <div key={idx} style={{ borderBottom: '1px solid #e2e8f0', padding: '0.5rem 0', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 'bold' }}>{log.user_name || 'Sistema'}</span>
                          <span style={{ color: 'var(--color-text-muted)' }}>{new Date(log.created_at).toLocaleTimeString('pt-BR')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{
                            padding: '0.1rem 0.3rem', borderRadius: '3px', fontSize: '0.7rem', fontWeight: 'bold',
                            backgroundColor: log.content_accessed === 'CONCURRENT_LOGIN_LOCKOUT' ? '#fee2e2' : '#e2e8f0',
                            color: log.content_accessed === 'CONCURRENT_LOGIN_LOCKOUT' ? 'var(--color-error)' : '#475569'
                          }}>
                            {log.content_accessed}
                          </span>
                          <span style={{ color: '#475569' }}>IP: {log.ip_address}</span>
                        </div>
                        <small style={{ display: 'block', color: '#94a3b8', marginTop: '0.25rem' }}>{log.user_agent}</small>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Rodapé TOSB */}
      <footer className="tosb-footer">
        <div className="footer-grid">
          <div className="footer-section">
            <h4>Sobre Nós</h4>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
              Plataforma autorizada The Other Song no Brasil. Compromisso científico no ensino acadêmico da Homeopatia e do Método Sensação.
            </p>
          </div>
          <div className="footer-section">
            <h4>Cursos Livres</h4>
            <ul className="footer-links">
              <li><a href="#link" className="footer-link">Princípios da Homeopatia</a></li>
              <li><a href="#link" className="footer-link">Introdução à Sensação Vital</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Pós-Graduação</h4>
            <ul className="footer-links">
              <li><a href="#link" className="footer-link">Especialização Médica</a></li>
              <li><a href="#link" className="footer-link">Repertorização Digital</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contato e Suporte</h4>
            <p style={{ fontSize: '0.85rem' }}>
              Curitiba - PR / Brasil<br />
              suporte@tosb.com.br<br />
              Atendimento exclusivo para profissionais de saúde.
            </p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} The Other Song Brasil. Todos os direitos reservados.</span>
          <span>Plataforma Desenvolvida com Elevado Rigor Acadêmico.</span>
        </div>
      </footer>
    </div>
  );
}

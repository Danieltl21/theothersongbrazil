import React, { useState, useEffect, useRef } from 'react';

// Termos de Uso específicos para profissionais da saúde / homeopatas
const TERMS_TEXT = `TERMOS DE USO E ACEITE PARA HOMEOPATAS E PROFISSIONAIS DA SAÚDE
Ao se cadastrar na plataforma EAD The Other Song Brasil (TOSB), você declara e concorda que:
1. Este conteúdo é destinado a profissionais da saúde (Médicos, Dentistas, Farmacêuticos, Veterinários e terapeutas integrativos autorizados).
2. O material científico, incluindo casos clínicos expostos em vídeo, é estritamente confidencial e protegido por sigilo médico, sendo vedado qualquer tipo de download, gravação de tela ou compartilhamento externo sob pena de suspensão de acesso e medidas legais cabíveis.
3. A prescrição de medicamentos homeopáticos e a aplicação clínica do Método Sensação são de inteira responsabilidade técnica do profissional matriculado.
4. A plataforma proíbe o compartilhamento de senhas. A identificação de acessos simultâneos em localizações geograficamente distantes resultará no bloqueio preventivo automático do usuário.`;

const BOOKS_DATA = [
  { id: 'book-esquema', title: 'Esquema de Reinos e Subreinos 2.0', author: 'Dr. Rajan Sankaran', price: 220.00, desc: 'A obra clássica do Método Sensação atualizada com tabelas de referência e diferenciação rápida.' },
  { id: 'book-superclasses', title: 'Superclasses em Homeopatia', author: 'Dr. Rajan Sankaran', price: 180.00, desc: 'Entenda os caminhos da percepção vital através da divisão revolucionária em seis superclasses.' },
  { id: 'book-oito-caixas', title: 'O Método das Oito Caixas', author: 'Dr. Rajan Sankaran', price: 240.00, desc: 'Um guia prático para integrar repertorização, sintomas locais, sensação e caminhos de cura no caso clínico.' },
  { id: 'book-followup', title: 'A Arte do Follow-up na Clínica', author: 'Dr. Gaurang Gaikwad', price: 190.00, desc: 'Casos práticos de acompanhamento clínico e estratégias de redosagem e troca de remédio homeopático.' }
];

const HOMEOPATHS_DATA = [];

const GALLERY_DATA = [
  { title: 'Turma de Especialização 2025', desc: 'Membros da Pós-Graduação reunidos em Curitiba.' },
  { title: 'Seminário Internacional com Rajan Sankaran', desc: 'Evento científico transmitido ao vivo.' },
  { title: 'Sede da The Other Song Brasil', desc: 'Espaço acadêmico e administrativo em Curitiba.' },
  { title: 'Encontro Científico de Homeopatas', desc: 'Discussão de casos e evolução clínica.' }
];

const COURSES_DETAILS_DATA = {
  'course-free': {
    target: 'Médicos, Médicas, Farmacêuticos, Veterinários, Dentistas e terapeutas integrativos interessados em conhecer a homeopatia clássica.',
    duration: '180 dias de acesso',
    workload: '30 horas',
    certificate: 'Disponível após assistir todas as aulas.',
    modules: [
      {
        title: 'Módulo 1: Fundamentos da Homeopatia',
        lessons: [
          'Introdução à Lei dos Semelhantes e Hahnemann',
          'Conceito de Força Vital e Saúde Dinâmica',
          'Diferença entre Alopatia, Homeopatia e Fitoterapia'
        ]
      },
      {
        title: 'Módulo 2: O Método Sensação Vital',
        lessons: [
          'Rajan Sankaran e a evolução do diagnóstico homeopático',
          'Os Sete Níveis de Experiência Humana',
          'Introdução aos três reinos da natureza'
        ]
      }
    ]
  },
  'course-sub': {
    target: 'Homeopatas formados, estudantes avançados de homeopatia e clínicos que desejam estudar Matéria Médica de forma continuada.',
    duration: 'Recorrente mensal (cancelamento a qualquer momento)',
    workload: 'Estudo continuado (2h de novos conteúdos por semana)',
    certificate: 'Certificado de participação anual emitido sob demanda.',
    modules: [
      {
        title: 'Ciclo 1: O Reino Vegetal na Clínica',
        lessons: [
          'Diferenciando Família das Solanáceas',
          'Família das Compostas e reações de choque/trauma',
          'Estudo de Casos Clínicos de Plantas Raras'
        ]
      },
      {
        title: 'Ciclo 2: O Reino Mineral e Tabela Periódica',
        lessons: [
          'Linha do Carbono e Linha do Silício na infância',
          'Metais Pesados e reações de sobrevivência/defesa',
          'Diferenciação de Sais Homeopáticos'
        ]
      }
    ]
  },
  'course-post': {
    target: 'Médicos, Dentistas e Profissionais da saúde graduados que desejam obter a especialização no Método Sensação e prática de consultório.',
    duration: '18 meses (acesso estendido por mais 6 meses)',
    workload: '360 horas',
    certificate: 'Certificado de Pós-Graduação Lato Sensu reconhecido.',
    modules: [
      {
        title: 'Módulo de Especialização 1: Método Sensação na Prática',
        lessons: [
          'O Conceito de Sensação Vital no Reino Vegetal',
          'Mapeamento dos reinos e subreinos da natureza',
          'Anamnese Clínica Avançada (Tomada de caso)'
        ]
      },
      {
        title: 'Módulo de Especialização 2: Casos Clínicos Complexos',
        lessons: [
          'Diagnóstico diferencial no Reino Animal',
          'Reações de Luta ou Fuga vs. Competição',
          'Superclasses em Homeopatia'
        ]
      }
    ]
  }
};

const PAGE_URLS = {
  home: 'index',
  about: 'sobre-nos',
  homeopaths: 'homeopatas',
  books: 'livros',
  synergy: 'software-synergy',
  contact: 'contato',
  cart: 'carrinho',
  login: 'entrar',
  register: 'cadastro',
  unlock: 'desbloquear',
  'student-dash': 'painel-aluno',
  'teacher-dash': 'painel-professor',
  'admin-dash': 'painel-administrador',
  'course-detail': 'detalhes-curso',
  'course-view': 'assistir-aula',
  checkout: 'finalizar-compra'
};

// Helper para gerar slugs legíveis de cursos
const getSlug = (title) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const getPageFromPathname = () => {
  const isDemo = window.location.pathname.endsWith('demo.html') || window.location.protocol === 'file:';
  if (isDemo) {
    const hash = window.location.hash || '#inicio';
    if (hash.startsWith('#curso/')) return 'course-detail';
    if (hash.startsWith('#aula/')) return 'course-view';
    const pageHash = hash.replace('#', '');
    
    // Reverse lookup for hash
    const entries = Object.entries(PAGE_URLS);
    for (const [key, value] of entries) {
      if (value === pageHash) return key;
    }
    if (pageHash === 'inicio') return 'home';
    return 'home';
  }
  
  const pathname = window.location.pathname;
  for (const [key, value] of Object.entries(PAGE_URLS)) {
    if (pathname.endsWith(`/${value}.html`) || pathname.endsWith(`/${value}`)) {
      return key;
    }
  }
  return 'home';
};

export default function App() {
  // Controle de Estado Geral
  const [currentPage, setCurrentPage] = useState(getPageFromPathname); // home, about, homeopaths, books, synergy, contact, cart, login, register, unlock, student-dash, course-view, teacher-dash, admin-dash, checkout
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Backup Local (Mock Database) para funcionamento Offline
  const [mockDb, setMockDb] = useState(() => {
    const saved = localStorage.getItem('mock_db');
    if (saved) {
      const parsed = JSON.parse(saved);
      let changed = false;
      if (!parsed.books) {
        parsed.books = BOOKS_DATA;
        changed = true;
      }
      if (!parsed.events) {
        parsed.events = [
          { id: 'event-1', title: "Lançamento Oficial: Superclasses em Homeopatia", type: "Lançamento de Livro", day: "15", month: "Set", location: "Sede da TOSB Curitiba / Transmissão ao vivo via Zoom" },
          { id: 'event-2', title: "Discussão Científica do Livro 'Esquema de Reinos'", type: "Grupo de Estudos", day: "10", month: "Out", location: "Online Zoom exclusivo para alunos e portadores da obra" },
          { id: 'event-3', title: "Seminário Avançado com base nas 'Oito Caixas'", type: "Seminário Literário", day: "24", month: "Out", location: "Auditório TOSB Curitiba / Evento Presencial" }
        ];
        changed = true;
      }
      if (!parsed.classes) {
        parsed.classes = [
          { id: 'class-1', name: 'Turma Alfa - Sensação Vital 2026', course_id: 'course-free', teacher_ids: ['teacher-id'], student_ids: ['student-id'], max_students: 30, max_teachers: 2 }
        ];
        changed = true;
      }
      if (!parsed.class_attendance) {
        parsed.class_attendance = {};
        changed = true;
      }
      if (changed) {
        localStorage.setItem('mock_db', JSON.stringify(parsed));
      }
      return parsed;
    }

    const initialDb = {
      users: [
        { id: 'admin-id', name: 'Admin Principal', email: 'admin@lms.com', role: 'ADMIN', status: 'ACTIVE', password: 'senha123', is_homeopath: false },
        { id: 'teacher-id', name: 'Dr. Carlos Eduardo (TOSB)', email: 'carlos@tosb.com', role: 'TEACHER', status: 'ACTIVE', password: 'senha123', crm: 'CRM-PR 12345', rqe: 'RQE 6789', bio: 'Médico Homeopata especialista no Método Sensação.', is_homeopath: false },
        { id: 'student-id', name: 'Dra. Ana Paula (Aluna)', email: 'ana@lms.com', role: 'STUDENT', status: 'ACTIVE', password: 'senha123', registrationType: 'CRM', registrationNumber: 'CRM-SP 98765', is_homeopath: false }
      ],
      courses: [
        { id: 'course-free', title: 'Introdução à Homeopatia e Sensação Vital', description: 'Princípios básicos da homeopatia clássica e as bases do Método Sensação da The Other Song.', type: 'FREE', duration_days: 180, finishing_message: 'Parabéns pela conclusão! Que os ensinamentos da Homeopatia e a busca pela sensação vital enriqueçam a sua prática clínica cotidiana.', teacher_id: 'teacher-id', active: true },
        { id: 'course-sub', title: 'Clube TOSB: Estudo Continuado de Matéria Médica', description: 'Curso recorrente mensal focado no estudo aprofundado dos reinos animal, vegetal e mineral na clínica homeopática.', type: 'SUBSCRIPTION', duration_days: 30, finishing_message: 'Parabéns por concluir mais um ciclo de estudos continuados em nossa Matéria Médica!', teacher_id: 'teacher-id', active: true },
        { id: 'course-post', title: 'Pós-Graduação em Homeopatia Avançada - Método Sensação', description: 'Especialização acadêmica stricto/lato sensu voltada para médicos, dentistas e profissionais da saúde com controle estrito de presença e quizzes.', type: 'POSTGRAD', duration_days: 180, finishing_message: 'Parabéns pela conquista do título de Especialista em Homeopatia Avançada! Sua dedicação científica eleva o nível da nossa prática médica.', teacher_id: 'teacher-id', active: true }
      ],
      books: BOOKS_DATA,
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
      ],
      events: [
        { id: 'event-1', title: "Lançamento Oficial: Superclasses em Homeopatia", type: "Lançamento de Livro", day: "15", month: "Set", location: "Sede da TOSB Curitiba / Transmissão ao vivo via Zoom" },
        { id: 'event-2', title: "Discussão Científica do Livro 'Esquema de Reinos'", type: "Grupo de Estudos", day: "10", month: "Out", location: "Online Zoom exclusivo para alunos e portadores da obra" },
        { id: 'event-3', title: "Seminário Avançado com base nas 'Oito Caixas'", type: "Seminário Literário", day: "24", month: "Out", location: "Auditório TOSB Curitiba / Evento Presencial" }
      ],
      classes: [
        { id: 'class-1', name: 'Turma Alfa - Sensação Vital 2026', course_id: 'course-free', teacher_ids: ['teacher-id'], student_ids: ['student-id'], max_students: 30, max_teachers: 2 }
      ],
      class_attendance: {}
    };
    localStorage.setItem('mock_db', JSON.stringify(initialDb));
    return initialDb;
  });

  // Salvar alterações do banco mock
  useEffect(() => {
    localStorage.setItem('mock_db', JSON.stringify(mockDb));
  }, [mockDb]);

  // Estados de Responsividade e Dropdowns
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWhatsappText, setShowWhatsappText] = useState(true);

  // Ocultar texto do WhatsApp após 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWhatsappText(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Limpar alertas automaticamente após 5 segundos (Toast auto-hide)
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        clearAlerts();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'about' | 'courses' | 'panel' | null
  const [selectedDetailCourse, setSelectedDetailCourse] = useState(null);

  // Estados de Acessibilidade (público idoso)
  const [fontMultiplier, setFontMultiplier] = useState(() => {
    return parseFloat(localStorage.getItem('fontMultiplier')) || 1.0;
  });

  // Estado do Carrinho de Compras
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart_items');
    return saved ? JSON.parse(saved) : [];
  });

  // Estado da aba ativa no Dashboard do Aluno
  const [studentActiveTab, setStudentActiveTab] = useState('panel'); // panel, courses, payments, account, agenda

  // Estados de Negócio
  const [courses, setCourses] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Estados de Edição CRUD Administrador
  const [adminCrudTab, setAdminCrudTab] = useState('courses'); // courses, books
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [formUserRole, setFormUserRole] = useState('STUDENT');
  const [adminRegType, setAdminRegType] = useState('CRM');
  const [adminRegNumber, setAdminRegNumber] = useState('');
  const [adminTeacherCrm, setAdminTeacherCrm] = useState('');
  const [profileRegType, setProfileRegType] = useState('OUTROS');
  const [profileRegNumber, setProfileRegNumber] = useState('');
  const [profileTeacherCrm, setProfileTeacherCrm] = useState('');

  const startAddUser = () => {
    setEditingUser({});
    setFormUserRole('STUDENT');
    setAdminRegType('CRM');
    setAdminRegNumber('');
    setAdminTeacherCrm('');
  };

  const startEditUser = (userObj) => {
    setEditingUser(userObj);
    setFormUserRole(userObj.role || 'STUDENT');
    setAdminRegType(userObj.registrationType || 'CRM');
    setAdminRegNumber(userObj.registrationNumber || '');
    setAdminTeacherCrm(userObj.crm || '');
  };

  // Novos estados para busca de homeopatas e abas dos dashboards
  const [homeopathsSearch, setHomeopathsSearch] = useState('');
  const [teacherActiveTab, setTeacherActiveTab] = useState('panel');
  const [adminActiveTab, setAdminActiveTab] = useState('stats');

  useEffect(() => {
    if (user) {
      setProfileRegType(user.professional_registration_type || 'OUTROS');
      setProfileRegNumber(user.professional_registration_number || '');
      setProfileTeacherCrm(user.crm || '');
    }
  }, [user]);
  const [serverHomeopaths, setServerHomeopaths] = useState([]);

  useEffect(() => {
    if (currentPage === 'homeopaths' && !isOfflineMode) {
      fetch('/api/auth/homeopaths')
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch');
        })
        .then(data => {
          setServerHomeopaths(data);
        })
        .catch(err => {
          console.warn("Erro ao carregar homeopatas do servidor:", err);
        });
    }
  }, [currentPage, isOfflineMode]);

  const getHomeopathsList = () => {
    let dynamicList = [];
    if (isOfflineMode) {
      dynamicList = mockDb.users
        .filter(u => u.is_homeopath && (u.role === 'STUDENT' || u.role === 'TEACHER'))
        .map(u => {
          let reg = '';
          let specialty = '';
          let city = '';
          
          if (u.role === 'TEACHER') {
            reg = u.crm || 'CRM';
            specialty = 'Professor / Método Sensação Vital';
            city = 'Curitiba - PR';
          } else {
            reg = `${u.registrationType || 'CRM'} ${u.registrationNumber || ''}`;
            specialty = 'Homeopatia Clássica';
            city = (u.address_city && u.address_state) ? `${u.address_city} - ${u.address_state}` : 'Não informado';
          }
          
          return {
            name: u.name,
            reg: reg.trim(),
            specialty: specialty,
            city: city,
            phone: u.phone || '',
            email: u.email
          };
        });
    } else {
      dynamicList = serverHomeopaths || [];
    }

    const combined = [...dynamicList];
    HOMEOPATHS_DATA.forEach(staticH => {
      if (isOfflineMode) {
        const dbUser = mockDb.users.find(u => u.email.toLowerCase() === staticH.email.toLowerCase());
        if (dbUser) {
          // Skip static listing, as the database user preference decides.
          // If the user opted-in, they are already in dynamicList (and thus combined).
          // If they opted-out, they are excluded.
          return;
        }
      } else {
        // Online mode: Skip if already in the fetched dynamic list (opted-in)
        // or if it matches the current logged-in user who opted-out.
        const isOptedIn = combined.some(h => h.email.toLowerCase() === staticH.email.toLowerCase());
        const isCurrentUserOptedOut = user && user.email.toLowerCase() === staticH.email.toLowerCase() && !user.is_homeopath;
        if (isOptedIn || isCurrentUserOptedOut) {
          return;
        }
      }
      combined.push(staticH);
    });

    return combined;
  };
  
  // Estados adicionais para administração de eventos e cadastros
  const [editingEvent, setEditingEvent] = useState(null);

  // ROTEADOR HÍBRIDO E FUNÇÕES AUXILIARES
  const getLinkHref = (page, queryParams = '') => {
    const isDemo = window.location.pathname.endsWith('demo.html') || window.location.protocol === 'file:';
    if (isDemo) {
      if (page === 'home') return '#inicio';
      if (page === 'about') return '#sobre-nos';
      if (page === 'homeopaths') return '#homeopatas';
      if (page === 'books') return '#livros';
      if (page === 'synergy') return '#software-synergy';
      if (page === 'contact') return '#contato';
      if (page === 'cart') return '#carrinho';
      if (page === 'login') return '#entrar';
      if (page === 'register') return '#cadastro';
      if (page === 'unlock') return '#desbloquear';
      if (page === 'student-dash') return '#painel-aluno';
      if (page === 'teacher-dash') return '#painel-professor';
      if (page === 'admin-dash') return '#painel-administrador';
      if (page === 'course-detail') return `#curso/${queryParams.replace('id=', '')}`;
      if (page === 'course-view') return `#aula/${queryParams.replace('id=', '')}`;
      if (page === 'checkout') return '#finalizar-compra';
      return `#${page}`;
    }
    const urlSegment = PAGE_URLS[page] || page;
    if (page === 'home') return 'index.html';
    if (queryParams) return `${urlSegment}.html?${queryParams}`;
    return `${urlSegment}.html`;
  };

  const navigateTo = (page, queryParams = '') => {
    const href = getLinkHref(page, queryParams);
    if (href.startsWith('#')) {
      window.location.hash = href;
    } else {
      window.location.href = href;
    }
  };

  const handleLinkClick = (e, page, queryParams = '') => {
    const href = getLinkHref(page, queryParams);
    if (href.startsWith('#')) {
      e.preventDefault();
      clearAlerts();
      setMobileMenuOpen(false);
      setActiveDropdown(null);
      navigateTo(page, queryParams);
    } else {
      clearAlerts();
    }
  };

  const handleDashboardTabClick = (e, targetPage, tabName) => {
    e.preventDefault();
    clearAlerts();
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    
    if (targetPage === 'student-dash') {
      setStudentActiveTab(tabName);
    } else if (targetPage === 'teacher-dash') {
      setTeacherActiveTab(tabName);
    } else if (targetPage === 'admin-dash') {
      setAdminActiveTab(tabName);
    }
    
    if (currentPage !== targetPage) {
      navigateTo(targetPage);
    }
  };

  // Fechar dropdowns e menu mobile ao clicar fora
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.nav-dropdown') && !e.target.closest('.hamburger-btn')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Fechar menus automaticamente ao navegar
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [currentPage]);

  // Sincronizar Acessibilidade com Documento e LocalStorage
  useEffect(() => {
    document.documentElement.style.setProperty('--font-multiplier', fontMultiplier);
    localStorage.setItem('fontMultiplier', fontMultiplier);
  }, [fontMultiplier]);

  // Sincronizar Carrinho
  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sincronizar Livros do mockDb
  useEffect(() => {
    if (mockDb && mockDb.books) {
      setBooks(mockDb.books);
    } else {
      setBooks(BOOKS_DATA);
    }
  }, [mockDb, isOfflineMode]);

  useEffect(() => {
    const handleNavigation = async () => {
      const isDemo = window.location.pathname.endsWith('demo.html') || window.location.protocol === 'file:';
      const hash = window.location.hash || '#inicio';

      let page = 'home';
      let courseIdFromQuery = null;

      if (isDemo) {
        // Modo Demo (SPA por Hash)
        if (hash.startsWith('#curso/')) {
          const slug = hash.replace('#curso/', '');
          const courseList = mockDb?.courses || [];
          const course = courseList.find(c => 
            getSlug(c.title) === slug || 
            c.id === slug ||
            (c.id === 'course-free' && slug === 'introducao-homeopatia') ||
            (c.id === 'course-sub' && slug === 'clube-tosb-estudos') ||
            (c.id === 'course-post' && slug === 'pos-graduacao-homeopatia')
          );
          if (course) {
            setSelectedDetailCourse(course);
            page = 'course-detail';
          }
        } else if (hash.startsWith('#aula/')) {
          const courseId = hash.replace('#aula/', '');
          courseIdFromQuery = courseId;
          page = 'course-view';
        } else {
          const pageHash = hash.replace('#', '');
          const entries = Object.entries(PAGE_URLS);
          let found = false;
          for (const [key, value] of entries) {
            if (value === pageHash) {
              page = key;
              found = true;
              break;
            }
          }
          if (!found && pageHash === 'inicio') {
            page = 'home';
          }
        }
      } else {
        // Modo MPA Real (HTML por arquivo)
        const pathname = window.location.pathname;
        const searchParams = new URLSearchParams(window.location.search);
        courseIdFromQuery = searchParams.get('id');

        let found = false;
        for (const [key, value] of Object.entries(PAGE_URLS)) {
          if (pathname.endsWith(`/${value}.html`) || pathname.endsWith(`/${value}`)) {
            page = key;
            found = true;
            break;
          }
        }
        if (!found) page = 'home';
      }

      setCurrentPage(page);

      // Carregamentos de dados baseados na página
      if (page === 'course-detail' && courseIdFromQuery) {
        const courseList = mockDb?.courses || [];
        const course = courseList.find(c => c.id === courseIdFromQuery);
        if (course) {
          setSelectedDetailCourse(course);
        }
      }

      if (page === 'course-view' && courseIdFromQuery && user) {
        await viewCourseDetails(courseIdFromQuery);
      }

      if (page === 'student-dash' && user) {
        loadInvoices();
        loadCourses();
      } else if (page === 'teacher-dash' && user) {
        loadTeacherReport();
      } else if (page === 'admin-dash' && user) {
        loadAdminReport();
      }
    };

    window.addEventListener('hashchange', handleNavigation);
    handleNavigation();
    return () => window.removeEventListener('hashchange', handleNavigation);
  }, [user, mockDb.courses, token]);


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

  // Testar conexão ao carregar e carregar usuário se houver token
  useEffect(() => {
    const testConnection = async () => {
      try {
        const healthRes = await fetch('/api/health');
        if (!healthRes.ok) {
          throw new Error('Database is offline');
        }

        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setIsOfflineMode(false);
          
          // Só redireciona se estiver na página de login/cadastro/desbloqueio
          const pathname = window.location.pathname;
          if (pathname.includes('login') || pathname.includes('register') || pathname.includes('unlock')) {
            redirectToDashboard(data.user.role);
          }
        } else {
          // Token inválido/expirado
          setUser(null);
          setToken('');
          localStorage.removeItem('token');
          setIsOfflineMode(false);
        }
      } catch (err) {
        console.warn("Backend ou Banco de Dados não conectado. Iniciando em Modo de Simulação (Frontend-Only).");
        setIsOfflineMode(true);
        // Tenta restaurar login mock se houver token mockado
        if (token) {
          const found = mockDb.users.find(u => u.id === token);
          if (found) {
            setUser(found);
            const pathname = window.location.pathname;
            if (pathname.includes('login') || pathname.includes('register') || pathname.includes('unlock')) {
              redirectToDashboard(found.role);
            }
          } else {
            setToken('');
          }
        }
      }
    };
    testConnection();
  }, [token]);

  // Sistema de Guards e Proteção de Rotas (Evita que o login bloqueie navegação pública)
  useEffect(() => {
    const pathname = window.location.pathname;
    const isDemo = pathname.endsWith('demo.html') || window.location.protocol === 'file:';
    
    if (!isDemo) {
      const isDashboard = pathname.includes('student-dash') || pathname.includes('teacher-dash') || pathname.includes('admin-dash') || pathname.includes('course-view') || pathname.includes('checkout');
      const isAuthPage = pathname.includes('login') || pathname.includes('register') || pathname.includes('unlock');
      
      const storedToken = localStorage.getItem('token');
      
      if (isDashboard) {
        if (!storedToken) {
          navigateTo('login');
        }
        else if (storedToken && !token && !user) {
          navigateTo('login');
        }
      }
      
      if (isAuthPage && user) {
        redirectToDashboard(user.role);
      }
    }
  }, [user, token, currentPage]);

  // Sincronizar mockDb entre páginas/abas via evento storage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'mock_db') {
        const saved = localStorage.getItem('mock_db');
        if (saved) {
          setMockDb(JSON.parse(saved));
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const redirectToDashboard = (role) => {
    const pathname = window.location.pathname;
    const isDemo = pathname.endsWith('demo.html') || window.location.protocol === 'file:';
    
    if (role === 'STUDENT') {
      if (isDemo || (!pathname.endsWith('/student-dash.html') && !pathname.endsWith('/student-dash'))) {
        navigateTo('student-dash');
      }
    } else if (role === 'TEACHER') {
      if (isDemo || (!pathname.endsWith('/teacher-dash.html') && !pathname.endsWith('/teacher-dash'))) {
        navigateTo('teacher-dash');
      }
    } else if (role === 'ADMIN') {
      if (isDemo || (!pathname.endsWith('/admin-dash.html') && !pathname.endsWith('/admin-dash'))) {
        navigateTo('admin-dash');
      }
    }
  };

  // Funções de API / Ações do Usuário

  // Limpar alertas
  const clearAlerts = () => {
    setError('');
    setSuccess('');
  };

  // MANIPULADORES DO CARRINHO DE COMPRAS
  const addToCart = (product, type = 'book') => {
    clearAlerts();
    setCartItems(prev => {
      const exists = prev.find(item => item.product.id === product.id);
      if (exists) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, type }];
    });
    setSuccess(`"${product.title}" adicionado ao carrinho!`);
  };

  const updateCartQty = (productId, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // ATUALIZAÇÃO DO CADASTRO E PERFIL
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    clearAlerts();
    
    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      cpf_cnpj: e.target.cpf_cnpj.value,
      address_zip: e.target.address_zip?.value || '',
      address_street: e.target.address_street?.value || '',
      address_number: e.target.address_number?.value || '',
      address_complement: e.target.address_complement?.value || '',
      address_neighborhood: e.target.address_neighborhood?.value || '',
      address_city: e.target.address_city?.value || '',
      address_state: e.target.address_state?.value || '',
      professional_registration_type: e.target.professional_registration_type?.value || user.professional_registration_type || 'OUTROS',
      professional_registration_number: e.target.professional_registration_number?.value || user.professional_registration_number || '',
      crm: e.target.crm?.value || '',
      rqe: e.target.rqe?.value || '',
      bio: e.target.bio?.value || '',
      is_homeopath: e.target.is_homeopath?.checked || false
    };

    if (isOfflineMode) {
      setMockDb(prev => {
        const updatedUsers = prev.users.map(u => {
          if (u.id === user.id) {
            return { ...u, ...formData };
          }
          return u;
        });
        return { ...prev, users: updatedUsers };
      });
      setUser(prev => ({ ...prev, ...formData }));
      setSuccess('Cadastro atualizado com sucesso (Modo Simulação)!');
    } else {
      try {
        const res = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (res.ok) {
          setUser(prev => ({ ...prev, ...formData }));
          setSuccess(data.message);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Erro ao salvar dados de cadastro.');
      }
    }
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
    navigateTo('login');
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
      navigateTo('login');
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
          navigateTo('login');
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
      navigateTo('login');
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
          navigateTo('login');
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Erro ao desbloquear.');
      }
    }
  };

  // Handlers do CRUD do Administrador
  const handleSaveCourse = (e) => {
    e.preventDefault();
    clearAlerts();
    const id = e.target.id.value || 'course_' + Date.now();
    const title = e.target.title.value;
    const description = e.target.description.value;
    const type = e.target.type.value;
    const duration_days = parseInt(e.target.duration_days.value) || 180;
    const finishing_message = e.target.finishing_message.value;
    const teacher_id = e.target.teacher_id.value || 'teacher-id';

    setMockDb(prev => {
      let updatedCourses;
      const exists = prev.courses.some(c => c.id === id);
      if (exists) {
        updatedCourses = prev.courses.map(c => c.id === id ? { ...c, title, description, type, duration_days, finishing_message, teacher_id } : c);
        setSuccess('Curso atualizado com sucesso!');
      } else {
        const newCourse = { id, title, description, type, duration_days, finishing_message, teacher_id, active: true };
        updatedCourses = [...prev.courses, newCourse];
        setSuccess('Curso criado com sucesso!');
      }
      return { ...prev, courses: updatedCourses };
    });

    setEditingCourse(null);
    e.target.reset();
  };

  const handleDeleteCourse = (id) => {
    clearAlerts();
    if (confirm('Tem certeza que deseja remover este curso do catálogo?')) {
      setMockDb(prev => {
        const updatedCourses = prev.courses.filter(c => c.id !== id);
        return { ...prev, courses: updatedCourses };
      });
      setSuccess('Curso removido com sucesso!');
    }
  };

  const handleSaveBook = (e) => {
    e.preventDefault();
    clearAlerts();
    const id = e.target.id.value || 'book_' + Date.now();
    const title = e.target.title.value;
    const author = e.target.author.value;
    const price = parseFloat(e.target.price.value);
    const desc = e.target.desc.value;

    setMockDb(prev => {
      let updatedBooks;
      const exists = (prev.books || BOOKS_DATA).some(b => b.id === id);
      if (exists) {
        updatedBooks = (prev.books || BOOKS_DATA).map(b => b.id === id ? { ...b, title, author, price, desc } : b);
        setSuccess('Livro atualizado com sucesso!');
      } else {
        const newBook = { id, title, author, price, desc };
        updatedBooks = [...(prev.books || BOOKS_DATA), newBook];
        setSuccess('Livro adicionado com sucesso!');
      }
      return { ...prev, books: updatedBooks };
    });

    setEditingBook(null);
    e.target.reset();
  };

  const handleDeleteBook = (id) => {
    clearAlerts();
    if (confirm('Tem certeza que deseja remover este livro da livraria?')) {
      setMockDb(prev => {
        const updatedBooks = (prev.books || BOOKS_DATA).filter(b => b.id !== id);
        return { ...prev, books: updatedBooks };
      });
      setSuccess('Livro removido com sucesso!');
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
      if (currentPage !== 'course-view') {
        navigateTo('course-view', 'id=' + courseId);
      }
    } else {
      try {
        const res = await fetch(`/api/courses/${courseId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setSelectedCourse(data);
          if (currentPage !== 'course-view') {
            navigateTo('course-view', 'id=' + courseId);
          }
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
    navigateTo('checkout');
  };

  const handleProcessCheckout = async (e) => {
    e.preventDefault();
    clearAlerts();

    const itemsToBuy = checkoutCourse ? [{ product: checkoutCourse, quantity: 1, type: 'course' }] : cartItems;
    if (itemsToBuy.length === 0) {
      setError('Seu carrinho está vazio.');
      return;
    }

    const transactionCode = 'ASAAS_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const asaasPaymentId = 'pay_' + Math.random().toString(36).substr(2, 12);
    
    // Calcular preço total
    let totalAmt = 0;
    itemsToBuy.forEach(item => {
      if (item.type === 'course') {
        totalAmt += item.product.type === 'SUBSCRIPTION' ? 99.00 : 3600.00;
      } else {
        totalAmt += item.product.price * item.quantity;
      }
    });

    if (isOfflineMode) {
      const newPayments = [];
      
      // Se for boleto parcelado do curso pós-graduação
      const hasPostgrad = itemsToBuy.some(item => item.type === 'course' && item.product.type === 'POSTGRAD');
      if (paymentMethod === 'CARNE' && hasPostgrad) {
        const count = installments || 12;
        const partAmt = (totalAmt / count).toFixed(2);
        for (let i = 1; i <= count; i++) {
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + (i - 1));
          newPayments.push({
            id: `pay-${Date.now()}-${i}`,
            student_id: user.id,
            course_id: itemsToBuy.find(item => item.type === 'course').product.id,
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
        const firstCourse = itemsToBuy.find(item => item.type === 'course');
        const courseId = firstCourse ? firstCourse.product.id : null;

        newPayments.push({
          id: `pay-${Date.now()}`,
          student_id: user.id,
          course_id: courseId,
          amount: totalAmt,
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

      setSuccess('Faturas geradas em modo Sandbox! Realize a simulação de pagamento na listagem financeira.');
      clearCart();
      setCheckoutCourse(null);
      setStudentActiveTab('payments'); // Ir direto para financeiro
      navigateTo('student-dash');
    } else {
      try {
        const firstCourse = itemsToBuy.find(item => item.type === 'course');
        const body = {
          courseId: firstCourse ? firstCourse.product.id : null,
          paymentMethod,
          installments: paymentMethod === 'CARNE' ? installments : 1,
          amount: totalAmt
        };

        const res = await fetch('/api/payments/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (res.ok) {
          setSuccess(data.message);
          clearCart();
          setCheckoutCourse(null);
          setStudentActiveTab('payments');
          navigateTo('student-dash');
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

  // Funções de Gerenciamento do Administrador
  const toggleUserStatus = (userId) => {
    setMockDb(prev => {
      const updatedUsers = prev.users.map(u => {
        if (u.id === userId) {
          const newStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          return { ...u, status: newStatus };
        }
        return u;
      });
      const updatedEnrollments = prev.enrollments.map(e => {
        if (e.student_id === userId) {
          const userObj = updatedUsers.find(u => u.id === userId);
          return { ...e, status: userObj.status };
        }
        return e;
      });
      return {
        ...prev,
        users: updatedUsers,
        enrollments: updatedEnrollments
      };
    });
    setSuccess('Status do usuário atualizado com sucesso.');
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    clearAlerts();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const role = e.target.role.value;
    const status = e.target.status.value;
    const is_homeopath = e.target.is_homeopath?.checked || false;
    
    let registrationType = '';
    let registrationNumber = '';
    let crm = '';
    let rqe = '';
    let bio = '';
    
    if (role === 'STUDENT') {
      registrationType = e.target.registrationType?.value || '';
      registrationNumber = e.target.registrationNumber?.value || '';
    } else if (role === 'TEACHER') {
      crm = e.target.crm?.value || '';
      rqe = e.target.rqe?.value || '';
      bio = e.target.bio?.value || '';
    }

    let errorOccurred = false;

    setMockDb(prev => {
      const existingUser = prev.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== editingUser.id);
      if (existingUser) {
        errorOccurred = true;
        return prev;
      }

      let updatedUsers;
      if (editingUser.id) {
        updatedUsers = prev.users.map(u => {
          if (u.id === editingUser.id) {
            return {
              ...u,
              name,
              email,
              password,
              role,
              status,
              registrationType,
              registrationNumber,
              crm,
              rqe,
              bio,
              is_homeopath
            };
          }
          return u;
        });
      } else {
        const newUser = {
          id: 'user-' + Date.now(),
          name,
          email,
          password,
          role,
          status,
          registrationType,
          registrationNumber,
          crm,
          rqe,
          bio,
          is_homeopath
        };
        updatedUsers = [...prev.users, newUser];
      }

      return {
        ...prev,
        users: updatedUsers
      };
    });

    if (errorOccurred) {
      setError('E-mail já cadastrado por outro usuário.');
    } else {
      setSuccess(editingUser.id ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
      setEditingUser(null);
    }
  };

  const handleSavePayment = (e) => {
    e.preventDefault();
    clearAlerts();
    const student_id = e.target.student_id.value;
    const course_id = e.target.course_id.value || null;
    const amount = parseFloat(e.target.amount.value) || 0;
    const payment_method = e.target.payment_method.value;
    const status = e.target.status.value;
    const due_date = e.target.due_date.value;
    const transaction_code = e.target.transaction_code.value || ('ASAAS_' + Math.random().toString(36).substr(2, 9).toUpperCase());
    const paid_at = status === 'RECEIVED' ? (editingPayment.paid_at || new Date().toISOString().split('T')[0]) : null;

    setMockDb(prev => {
      let updatedPayments;
      if (editingPayment.id) {
        updatedPayments = prev.payments.map(p => {
          if (p.id === editingPayment.id) {
            return {
              ...p,
              student_id,
              course_id,
              amount,
              payment_method,
              status,
              due_date,
              transaction_code,
              paid_at
            };
          }
          return p;
        });
      } else {
        const newPayment = {
          id: 'pay-' + Date.now(),
          student_id,
          course_id,
          amount,
          payment_method,
          status,
          due_date,
          transaction_code,
          paid_at
        };
        updatedPayments = [...prev.payments, newPayment];
      }

      return {
        ...prev,
        payments: updatedPayments
      };
    });

    setSuccess(editingPayment.id ? 'Fatura atualizada com sucesso!' : 'Fatura criada com sucesso!');
    setEditingPayment(null);
  };

  const handleSaveClass = (e) => {
    e.preventDefault();
    clearAlerts();
    const name = e.target.name.value;
    const course_id = e.target.course_id.value;
    const max_students = parseInt(e.target.max_students.value) || 0;
    const max_teachers = parseInt(e.target.max_teachers.value) || 0;

    const selectedTeachers = Array.from(e.target.elements)
      .filter(el => el.name === 'teacher_ids' && el.checked)
      .map(el => el.value);

    const selectedStudents = Array.from(e.target.elements)
      .filter(el => el.name === 'student_ids' && el.checked)
      .map(el => el.value);

    if (max_students > 0 && selectedStudents.length > max_students) {
      setError(`O número de alunos alocados (${selectedStudents.length}) excede o limite máximo permitido (${max_students}).`);
      return;
    }

    if (max_teachers > 0 && selectedTeachers.length > max_teachers) {
      setError(`O número de professores alocados (${selectedTeachers.length}) excede o limite máximo permitido (${max_teachers}).`);
      return;
    }

    setMockDb(prev => {
      let updatedClasses;
      if (editingClass.id) {
        updatedClasses = prev.classes.map(c => {
          if (c.id === editingClass.id) {
            return {
              ...c,
              name,
              course_id,
              teacher_ids: selectedTeachers,
              student_ids: selectedStudents,
              max_students,
              max_teachers
            };
          }
          return c;
        });
      } else {
        const newClass = {
          id: 'class-' + Date.now(),
          name,
          course_id,
          teacher_ids: selectedTeachers,
          student_ids: selectedStudents,
          max_students,
          max_teachers
        };
        updatedClasses = [...(prev.classes || []), newClass];
      }

      return {
        ...prev,
        classes: updatedClasses
      };
    });

    setSuccess(editingClass.id ? 'Turma atualizada com sucesso!' : 'Turma criada com sucesso!');
    setEditingClass(null);
  };

  const registerAttendance = (classId, studentId) => {
    const todayStr = new Date().toISOString().split('T')[0];
    let alreadyExists = false;

    setMockDb(prev => {
      const attendanceKey = `${classId}_${studentId}`;
      const currentRecords = prev.class_attendance[attendanceKey] || [];
      
      const exists = currentRecords.find(r => r.date === todayStr);
      if (exists) {
        alreadyExists = true;
        return prev;
      }

      const newRecords = [...currentRecords, { date: todayStr, present: true }];
      
      const updatedAttendance = {
        ...prev.class_attendance,
        [attendanceKey]: newRecords
      };

      return {
        ...prev,
        class_attendance: updatedAttendance
      };
    });

    if (alreadyExists) {
      setError('Presença para este aluno já foi registrada hoje.');
    } else {
      setSuccess('Presença registrada com sucesso!');
    }
  };

  const resetQuizAttempts = (studentId, quizId) => {
    setMockDb(prev => {
      const updatedAttempts = { ...prev.quiz_attempts };
      delete updatedAttempts[`${studentId}_${quizId}`];
      return {
        ...prev,
        quiz_attempts: updatedAttempts
      };
    });
    setSuccess('Tentativas de avaliação do aluno reiniciadas com sucesso.');
  };

  const simulatePaymentConfirm = (paymentId) => {
    setMockDb(prev => {
      const updatedPayments = prev.payments.map(p => {
        if (p.id === paymentId) {
          return { ...p, status: 'RECEIVED', paid_at: new Date().toISOString() };
        }
        return p;
      });
      
      const paymentObj = updatedPayments.find(p => p.id === paymentId);
      let updatedEnroll = [...prev.enrollments];
      
      if (paymentObj && paymentObj.course_id) {
        const enrollIndex = updatedEnroll.findIndex(e => e.student_id === paymentObj.student_id && e.course_id === paymentObj.course_id);
        if (enrollIndex > -1) {
          updatedEnroll[enrollIndex] = {
            ...updatedEnroll[enrollIndex],
            status: 'ACTIVE',
            expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
          };
        } else {
          updatedEnroll.push({
            id: 'enroll_' + Date.now(),
            student_id: paymentObj.student_id,
            course_id: paymentObj.course_id,
            enrolled_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'ACTIVE'
          });
        }
      }
      
      return {
        ...prev,
        payments: updatedPayments,
        enrollments: updatedEnroll
      };
    });
    setSuccess('Pagamento confirmado e matrícula liberada / ativada com sucesso.');
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const type = e.target.type.value;
    const day = e.target.day.value;
    const month = e.target.month.value;
    const location = e.target.location.value;
    const time = e.target.time?.value || '';

    const newEvent = {
      id: 'event-' + Date.now(),
      title, type, day, month, location, time
    };

    setMockDb(prev => ({
      ...prev,
      events: [...(prev.events || []), newEvent]
    }));

    setSuccess('Evento acadêmico criado com sucesso!');
    e.target.reset();
  };

  const handleDeleteEvent = (eventId) => {
    setMockDb(prev => ({
      ...prev,
      events: (prev.events || []).filter(ev => ev.id !== eventId)
    }));
    setSuccess('Evento acadêmico removido.');
  };

  // Evitar flicker de renderização enquanto recupera sessão
  if (token && !user) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', animation: 'spin 2s linear infinite', display: 'inline-block' }}>🌿</span>
          <h2 className="font-serif-title mt-4" style={{ color: 'var(--color-primary)' }}>Carregando Portal...</h2>
          <p className="text-muted">Verificando credenciais acadêmicas de segurança.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Cabeçalho */}
      <header className="tosb-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a href={getLinkHref('home')} className="logo-container" onClick={(e) => handleLinkClick(e, 'home')}>
            <span className="logo-symbol" style={{ fontSize: '2rem' }}>🌿</span>
            <div className="logo-text">
              <span className="logo-title" style={{ fontSize: '1.25rem' }}>The Other Song</span>
              <span className="logo-subtitle">Brasil | Homeopatia</span>
            </div>
          </a>

          {isOfflineMode && (
            <div className="offline-mode-badge" style={{ fontSize: '0.75rem' }}>
              🔌 Simulação
            </div>
          )}
        </div>

        {/* Botão Hamburger Mobile */}
        <button 
          className="hamburger-btn" 
          onClick={() => setMobileMenuOpen(prev => !prev)}
          aria-label="Alternar Menu"
        >
          ☰
        </button>

        {/* Menu Principal */}
        <nav className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`} style={{ gap: '0.75rem' }}>
          <a href={getLinkHref('home')} className={`nav-link ${currentPage === 'home' ? 'active' : ''}`} onClick={(e) => handleLinkClick(e, 'home')}>Início</a>
          
          <div className="nav-dropdown">
            <button 
              className={`nav-link ${['about', 'homeopaths'].includes(currentPage) ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === 'about' ? null : 'about');
              }}
            >
              Quem Somos ▾
            </button>
            <div className={`nav-dropdown-content ${activeDropdown === 'about' ? 'open' : ''}`}>
              <a href={getLinkHref('about')} className="dropdown-item" onClick={(e) => handleLinkClick(e, 'about')}>Sobre Nós & Galeria</a>
              <a href={getLinkHref('homeopaths')} className="dropdown-item" onClick={(e) => handleLinkClick(e, 'homeopaths')}>Lista de Homeopatas</a>
            </div>
          </div>

          <div className="nav-dropdown">
            <button 
              className="nav-link"
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === 'courses' ? null : 'courses');
              }}
            >
              Cursos ▾
            </button>
            <div className={`nav-dropdown-content ${activeDropdown === 'courses' ? 'open' : ''}`}>
              <a href={getLinkHref('home') + '#online-courses'} className="dropdown-item" onClick={(e) => {
                const isDemo = window.location.pathname.endsWith('demo.html') || window.location.protocol === 'file:';
                if (isDemo) {
                  e.preventDefault();
                  clearAlerts();
                  setMobileMenuOpen(false);
                  setActiveDropdown(null);
                  navigateTo('home');
                  setTimeout(() => document.getElementById('online-courses')?.scrollIntoView({ behavior: 'smooth' }), 100);
                } else {
                  clearAlerts();
                }
              }}>Cursos Online</a>
              <a href={getLinkHref('home') + '#inperson-courses'} className="dropdown-item" onClick={(e) => {
                const isDemo = window.location.pathname.endsWith('demo.html') || window.location.protocol === 'file:';
                if (isDemo) {
                  e.preventDefault();
                  clearAlerts();
                  setMobileMenuOpen(false);
                  setActiveDropdown(null);
                  navigateTo('home');
                  setTimeout(() => document.getElementById('inperson-courses')?.scrollIntoView({ behavior: 'smooth' }), 100);
                } else {
                  clearAlerts();
                }
              }}>Cursos Presenciais</a>
            </div>
          </div>

          <a href={getLinkHref('books')} className={`nav-link ${currentPage === 'books' ? 'active' : ''}`} onClick={(e) => handleLinkClick(e, 'books')}>Livros</a>
          <a href={getLinkHref('synergy')} className={`nav-link ${currentPage === 'synergy' ? 'active' : ''}`} onClick={(e) => handleLinkClick(e, 'synergy')}>Synergy Software</a>
          <a href={getLinkHref('contact')} className={`nav-link ${currentPage === 'contact' ? 'active' : ''}`} onClick={(e) => handleLinkClick(e, 'contact')}>Contato</a>

          {/* Bloco de Usuário exclusivo para mobile */}
          <div className="mobile-only-block" style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            {user ? (
              <div className="nav-dropdown">
                <button 
                  className="nav-link w-full text-left" 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === 'panel-hamburger' ? null : 'panel-hamburger');
                  }}
                >
                  <span>👤 Painel de {user.name}</span>
                  <span>▾</span>
                </button>
                <div className={`nav-dropdown-content ${activeDropdown === 'panel-hamburger' ? 'open' : ''}`} style={{ display: activeDropdown === 'panel-hamburger' ? 'block' : 'none', position: 'static', boxShadow: 'none', paddingLeft: '1rem' }}>
                  {user.role === 'STUDENT' && (
                    <>
                      <a href="#" className="dropdown-item" style={{ padding: '0.5rem 0' }} onClick={(e) => handleDashboardTabClick(e, 'student-dash', 'panel')}>📊 Painel Geral</a>
                      <a href="#" className="dropdown-item" style={{ padding: '0.5rem 0' }} onClick={(e) => handleDashboardTabClick(e, 'student-dash', 'courses')}>📚 Meus Cursos</a>
                      <a href="#" className="dropdown-item" style={{ padding: '0.5rem 0' }} onClick={(e) => handleDashboardTabClick(e, 'student-dash', 'payments')}>💳 Financeiro / Faturas</a>
                      <a href="#" className="dropdown-item" style={{ padding: '0.5rem 0' }} onClick={(e) => handleDashboardTabClick(e, 'student-dash', 'account')}>👤 Meus Dados</a>
                      <a href="#" className="dropdown-item" style={{ padding: '0.5rem 0' }} onClick={(e) => handleDashboardTabClick(e, 'student-dash', 'agenda')}>📅 Calendário Acadêmico</a>
                    </>
                  )}
                  {user.role === 'TEACHER' && (
                    <>
                      <a href="#" className="dropdown-item" style={{ padding: '0.5rem 0' }} onClick={(e) => handleDashboardTabClick(e, 'teacher-dash', 'panel')}>📊 Painel Geral</a>
                      <a href="#" className="dropdown-item" style={{ padding: '0.5rem 0' }} onClick={(e) => handleDashboardTabClick(e, 'teacher-dash', 'students')}>👥 Gerenciar Turmas</a>
                      <a href="#" className="dropdown-item" style={{ padding: '0.5rem 0' }} onClick={(e) => handleDashboardTabClick(e, 'teacher-dash', 'payments')}>💳 Financeiro</a>
                      <a href="#" className="dropdown-item" style={{ padding: '0.5rem 0' }} onClick={(e) => handleDashboardTabClick(e, 'teacher-dash', 'account')}>⚙️ Detalhes da Conta</a>
                    </>
                  )}
                  {user.role === 'ADMIN' && (
                    <>
                      <a href="#" className="dropdown-item" style={{ padding: '0.5rem 0' }} onClick={(e) => handleDashboardTabClick(e, 'admin-dash', 'stats')}>📊 Estatísticas / OFX</a>
                      <a href="#" className="dropdown-item" style={{ padding: '0.5rem 0' }} onClick={(e) => handleDashboardTabClick(e, 'admin-dash', 'courses')}>🌿 Gerenciar Cursos</a>
                      <a href="#" className="dropdown-item" style={{ padding: '0.5rem 0' }} onClick={(e) => handleDashboardTabClick(e, 'admin-dash', 'books')}>📚 Gerenciar Livros</a>
                      <a href="#" className="dropdown-item" style={{ padding: '0.5rem 0' }} onClick={(e) => handleDashboardTabClick(e, 'admin-dash', 'students')}>👥 Gerenciar Usuários</a>
                      <a href="#" className="dropdown-item" style={{ padding: '0.5rem 0' }} onClick={(e) => handleDashboardTabClick(e, 'admin-dash', 'payments')}>💳 Gerenciar Faturas</a>
                      <a href="#" className="dropdown-item" style={{ padding: '0.5rem 0' }} onClick={(e) => handleDashboardTabClick(e, 'admin-dash', 'classes')}>🎓 Gerenciar Turmas</a>
                      <a href="#" className="dropdown-item" style={{ padding: '0.5rem 0' }} onClick={(e) => handleDashboardTabClick(e, 'admin-dash', 'events')}>📅 Agenda / Eventos</a>
                      <a href="#" className="dropdown-item" style={{ padding: '0.5rem 0' }} onClick={(e) => handleDashboardTabClick(e, 'admin-dash', 'logs')}>🔒 Logs de Segurança</a>
                    </>
                  )}
                  <div style={{ borderTop: '1px solid var(--color-border)', margin: '0.5rem 0' }}></div>
                  <a href="#" className="dropdown-item text-danger" style={{ padding: '0.5rem 0' }} onClick={(e) => { e.preventDefault(); handleLogout(); }}>Sair da Conta</a>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a href={getLinkHref('login')} className="btn btn-secondary w-full" onClick={(e) => handleLinkClick(e, 'login')}>Entrar</a>
                <a href={getLinkHref('register')} className="btn btn-primary w-full" onClick={(e) => handleLinkClick(e, 'register')}>Cadastrar</a>
              </div>
            )}
          </div>
        </nav>

        {/* Painel do Usuário, Carrinho e Acessibilidade */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          
          {/* Controles de Acessibilidade */}
          <div className="accessibility-bar">
            <button className="btn-acc" onClick={() => setFontMultiplier(prev => Math.max(0.8, prev - 0.1))} title="Diminuir Fonte (A-)" aria-label="Diminuir Fonte">A-</button>
            <button className="btn-acc" onClick={() => setFontMultiplier(1.0)} title="Tamanho Padrão (A)" aria-label="Restaurar Fonte">A</button>
            <button className="btn-acc" onClick={() => setFontMultiplier(prev => Math.min(1.6, prev + 0.1))} title="Aumentar Fonte (A+)" aria-label="Aumentar Fonte">A+</button>
          </div>

          {/* Carrinho de Compras */}
          <a href={getLinkHref('cart')} className="btn btn-secondary cart-badge-nav" onClick={(e) => handleLinkClick(e, 'cart')} aria-label="Carrinho de Compras" style={{ padding: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem' }}>🛒</span>
            {cartItems.length > 0 && (
              <span className="cart-count">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </a>

          {/* Ações Rápidas Mobile (Sempre Visíveis no Mobile Sticky Header) */}
          <div className="mobile-only-flex header-mobile-actions" style={{ alignItems: 'center', gap: '0.35rem' }}>
            {user ? (
              <div className="nav-dropdown">
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', height: 'auto', minHeight: 'unset', textTransform: 'none' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === 'panel-mobile' ? null : 'panel-mobile');
                  }}
                >
                  Painel ▾
                </button>
                <div className={`nav-dropdown-content ${activeDropdown === 'panel-mobile' ? 'open' : ''}`} style={{ right: 0, left: 'auto', minWidth: '220px' }}>
                  {user.role === 'STUDENT' && (
                    <>
                      <a href="#" className="dropdown-item" onClick={(e) => handleDashboardTabClick(e, 'student-dash', 'panel')}>📊 Painel Geral</a>
                      <a href="#" className="dropdown-item" onClick={(e) => handleDashboardTabClick(e, 'student-dash', 'courses')}>📚 Meus Cursos</a>
                      <a href="#" className="dropdown-item" onClick={(e) => handleDashboardTabClick(e, 'student-dash', 'payments')}>💳 Financeiro / Faturas</a>
                      <a href="#" className="dropdown-item" onClick={(e) => handleDashboardTabClick(e, 'student-dash', 'account')}>👤 Meus Dados</a>
                      <a href="#" className="dropdown-item" onClick={(e) => handleDashboardTabClick(e, 'student-dash', 'agenda')}>📅 Calendário Acadêmico</a>
                    </>
                  )}
                  {user.role === 'TEACHER' && (
                    <>
                      <a href="#" className="dropdown-item" onClick={(e) => handleDashboardTabClick(e, 'teacher-dash', 'panel')}>📊 Painel Geral</a>
                      <a href="#" className="dropdown-item" onClick={(e) => handleDashboardTabClick(e, 'teacher-dash', 'students')}>👥 Gerenciar Turmas</a>
                      <a href="#" className="dropdown-item" onClick={(e) => handleDashboardTabClick(e, 'teacher-dash', 'payments')}>💳 Financeiro</a>
                      <a href="#" className="dropdown-item" onClick={(e) => handleDashboardTabClick(e, 'teacher-dash', 'account')}>⚙️ Detalhes da Conta</a>
                    </>
                  )}
                  {user.role === 'ADMIN' && (
                    <>
                      <a href="#" className="dropdown-item" onClick={(e) => handleDashboardTabClick(e, 'admin-dash', 'stats')}>📊 Estatísticas / OFX</a>
                      <a href="#" className="dropdown-item" onClick={(e) => handleDashboardTabClick(e, 'admin-dash', 'courses')}>🌿 Gerenciar Cursos</a>
                      <a href="#" className="dropdown-item" onClick={(e) => handleDashboardTabClick(e, 'admin-dash', 'books')}>📚 Gerenciar Livros</a>
                      <a href="#" className="dropdown-item" onClick={(e) => handleDashboardTabClick(e, 'admin-dash', 'students')}>👥 Gerenciar Usuários</a>
                      <a href="#" className="dropdown-item" onClick={(e) => handleDashboardTabClick(e, 'admin-dash', 'payments')}>💳 Gerenciar Faturas</a>
                      <a href="#" className="dropdown-item" onClick={(e) => handleDashboardTabClick(e, 'admin-dash', 'classes')}>🎓 Gerenciar Turmas</a>
                      <a href="#" className="dropdown-item" onClick={(e) => handleDashboardTabClick(e, 'admin-dash', 'events')}>📅 Agenda / Eventos</a>
                      <a href="#" className="dropdown-item" onClick={(e) => handleDashboardTabClick(e, 'admin-dash', 'logs')}>🔒 Logs de Segurança</a>
                    </>
                  )}
                  <div style={{ borderTop: '1px solid var(--color-border)', margin: '0.25rem 0' }}></div>
                  <a href="#" className="dropdown-item text-danger" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Sair da Conta</a>
                </div>
              </div>
            ) : (
              <>
                <a 
                  href={getLinkHref('login')} 
                  className="btn btn-secondary" 
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', height: 'auto', minHeight: 'unset', textTransform: 'none' }}
                  onClick={(e) => handleLinkClick(e, 'login')}
                >
                  Entrar
                </a>
                <a 
                  href={getLinkHref('register')} 
                  className="btn btn-primary" 
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', height: 'auto', minHeight: 'unset', textTransform: 'none' }}
                  onClick={(e) => handleLinkClick(e, 'register')}
                >
                  Inscrever
                </a>
              </>
            )}
          </div>

          {/* Ações do Usuário (Desktop Apenas) */}
          <div className="nav-links desktop-only-block" style={{ gap: '0.5rem' }}>
            {user ? (
              <div className="nav-dropdown">
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '0.5rem 0.75rem', backgroundColor: 'var(--color-primary)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === 'panel' ? null : 'panel');
                  }}
                >
                  👤 Painel ▾
                </button>
                <div className={`nav-dropdown-content ${activeDropdown === 'panel' ? 'open' : ''}`} style={{ right: 0, left: 'auto' }}>
                  <a href={getLinkHref(user.role === 'STUDENT' ? 'student-dash' : user.role === 'TEACHER' ? 'teacher-dash' : 'admin-dash')} className="dropdown-item" onClick={(e) => { e.preventDefault(); clearAlerts(); redirectToDashboard(user.role); }}>Acessar Dashboard</a>
                  <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Sair</a>
                </div>
              </div>
            ) : (
              <>
                <a href={getLinkHref('login')} className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem' }} onClick={(e) => handleLinkClick(e, 'login')}>Entrar</a>
                <a href={getLinkHref('register')} className="btn btn-primary" style={{ padding: '0.75rem' }} onClick={(e) => handleLinkClick(e, 'register')}>Cadastrar</a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Container de Toasts Flutuantes */}
      <div className="tosb-toast-container">
        {error && (
          <div className="tosb-toast alert-danger">
            <span><strong>Aviso:</strong> {error}</span>
            <button className="toast-close-btn" onClick={() => setError('')}>&times;</button>
          </div>
        )}
        {success && (
          <div className="tosb-toast alert-success">
            <span><strong>Sucesso:</strong> {success}</span>
            <button className="toast-close-btn" onClick={() => setSuccess('')}>&times;</button>
          </div>
        )}
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

        {/* PÁGINA: HOME (PUBLIC LANDING PAGE) */}
        {currentPage === 'home' && (
          <div>
            {/* Hero Section */}
            <section className="hero-section">
              <h1>Conheça nossos cursos online</h1>
              <p className="hero-subtitle">🌿 A escola oficial do Método Sensação da The Other Song no Brasil. Ensino homeopático de elevado rigor científico e clínico.</p>
              <button className="btn btn-primary" onClick={() => { clearAlerts(); navigateTo('register'); }} style={{ fontSize: '1.1rem', padding: '0.8rem 2rem' }}>Inscreva-se Agora</button>
            </section>

            {/* Cursos Online Catalog */}
            <section id="online-courses" className="mb-7">
              <h2 className="home-section-title">Cursos de Homeopatia Online</h2>
              <div className="premium-card-grid">
                
                {/* Curso Livre */}
                <div className="premium-card animate-fade-in">
                  <div className="premium-card-img-placeholder cursor-pointer" onClick={() => navigateTo('course-detail', 'id=course-free')}>🌿</div>
                  <div className="premium-card-content">
                    <span className="premium-card-tag">Gratuito</span>
                    <h3 className="premium-card-title cursor-pointer" onClick={() => navigateTo('course-detail', 'id=course-free')}>Introdução à Homeopatia e Sensação Vital</h3>
                    <p className="premium-card-text">Entenda as bases históricas da homeopatia clássica e conheça a teoria fundamental da sensação vital do Dr. Rajan Sankaran.</p>
                    <div className="premium-card-footer" style={{ gap: '0.25rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} onClick={() => navigateTo('course-detail', 'id=course-free')}>Ementa</button>
                      {user ? (
                        <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => enrollFreeCourse('course-free')}>Matricular</button>
                      ) : (
                        <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => { clearAlerts(); navigateTo('login'); }}>Entrar</button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Assinatura Clube */}
                <div className="premium-card animate-fade-in">
                  <div className="premium-card-img-placeholder cursor-pointer" onClick={() => navigateTo('course-detail', 'id=course-sub')}>📖</div>
                  <div className="premium-card-content">
                    <span className="premium-card-tag">Assinatura</span>
                    <h3 className="premium-card-title cursor-pointer" onClick={() => navigateTo('course-detail', 'id=course-sub')}>Clube TOSB: Estudos de Matéria Médica</h3>
                    <p className="premium-card-text">Estudo mensal continuado dos reinos animal, vegetal e mineral, focado na clínica homeopática contemporânea.</p>
                    <div className="premium-card-footer" style={{ gap: '0.25rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} onClick={() => navigateTo('course-detail', 'id=course-sub')}>Ementa</button>
                      <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => addToCart({ id: 'course-sub', title: 'Clube TOSB: Estudos de Matéria Médica', type: 'SUBSCRIPTION', price: 99.00 }, 'course')}>Comprar</button>
                    </div>
                  </div>
                </div>

                {/* Pós-Graduação */}
                <div className="premium-card animate-fade-in">
                  <div className="premium-card-img-placeholder cursor-pointer" onClick={() => navigateTo('course-detail', 'id=course-post')}>🎓</div>
                  <div className="premium-card-content">
                    <span className="premium-card-tag">Especialização</span>
                    <h3 className="premium-card-title cursor-pointer" onClick={() => navigateTo('course-detail', 'id=course-post')}>Pós-Graduação em Homeopatia Avançada</h3>
                    <p className="premium-card-text">Especialização completa Lato Sensu voltada para médicos e profissionais de saúde. Aulas com controle de presença e avaliações.</p>
                    <div className="premium-card-footer" style={{ gap: '0.25rem' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} onClick={() => navigateTo('course-detail', 'id=course-post')}>Ementa</button>
                      <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => addToCart({ id: 'course-post', title: 'Pós-Graduação em Homeopatia Avançada', type: 'POSTGRAD', price: 3600.00 }, 'course')}>Comprar</button>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* Vídeo Institucional */}
            <section className="video-section-home">
              <div className="video-section-grid">
                <div className="video-section-content">
                  <span className="premium-card-tag" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>Apresentação</span>
                  <h3 className="font-serif-title mt-2">O Método de Sankaran e Níveis de Experiência</h3>
                  <p>Assista a esta aula explicativa do Dr. Carlos Eduardo Leitão sobre como funciona o Método Sensação, aprofundando o diagnóstico homeopático além da abordagem convencional.</p>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-primary" onClick={() => { clearAlerts(); navigateTo('about'); }}>Ver Sobre Nós</button>
                  </div>
                </div>
                <div>
                  <div className="video-wrapper-embed">
                    <iframe 
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                      title="Introdução ao Método de Sankaran"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              </div>
            </section>

            {/* Cursos Presenciais */}
            <section id="inperson-courses" className="mb-7">
              <h2 className="home-section-title">Seminários e Cursos Presenciais</h2>
              <div className="premium-card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
                
                <div className="premium-card" style={{ borderTop: '4px solid var(--color-accent)' }}>
                  <div className="premium-card-content">
                    <span className="premium-card-tag" style={{ backgroundColor: '#fff7ed', color: '#c2410c' }}>Presencial Curitiba</span>
                    <h3 className="premium-card-title mt-2">Seminário Avançado de Homeopatia 2026</h3>
                    <p className="premium-card-text">Um encontro presencial na sede de Curitiba - PR focando no diagnóstico clínico de casos do reino animal e reações de hipersensibilidade.</p>
                    <div className="premium-card-footer" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Data: <strong>23 a 25/Outubro/2026</strong></div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Local: <strong>Curitiba - PR</strong></div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.25rem', width: '100%', marginTop: '0.5rem' }}>
                        <button className="btn btn-secondary flex-1" style={{ padding: '0.4rem' }} onClick={() => { clearAlerts(); navigateTo('contact'); }}>Mais Detalhes</button>
                        <button className="btn btn-primary flex-1" style={{ padding: '0.4rem' }} onClick={() => addToCart({ id: 'course-inperson-seminar', title: 'Seminário Avançado de Homeopatia 2026', price: 1200.00, type: 'INPERSON' }, 'course')}>Comprar Vaga</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="premium-card" style={{ borderTop: '4px solid var(--color-accent)' }}>
                  <div className="premium-card-content">
                    <span className="premium-card-tag" style={{ backgroundColor: '#fff7ed', color: '#c2410c' }}>Encontro Prático</span>
                    <h3 className="premium-card-title mt-2">Encontro de Matéria Médica Prática</h3>
                    <p className="premium-card-text">Estudos práticos presenciais voltados à repertorização e discussão de casos complexos trazidos pelos próprios alunos homeopatas.</p>
                    <div className="premium-card-footer" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Data: <strong>05/Dezembro/2026</strong></div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Local: <strong>Sede TOSB Curitiba</strong></div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.25rem', width: '100%', marginTop: '0.5rem' }}>
                        <button className="btn btn-secondary flex-1" style={{ padding: '0.4rem' }} onClick={() => { clearAlerts(); navigateTo('contact'); }}>Mais Detalhes</button>
                        <button className="btn btn-primary flex-1" style={{ padding: '0.4rem' }} onClick={() => addToCart({ id: 'course-inperson-meeting', title: 'Encontro de Matéria Médica Prática', price: 600.00, type: 'INPERSON' }, 'course')}>Comprar Vaga</button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* Livros em Destaque */}
            <section className="mb-7">
              <h2 className="home-section-title">Livros Científicos Recomendados</h2>
              <div className="premium-card-grid">
                {books.slice(0, 3).map(book => (
                  <div key={book.id} className="premium-card">
                    <div className="premium-card-img-placeholder" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)', height: '140px' }}>📚</div>
                    <div className="premium-card-content">
                      <span className="premium-card-tag">{book.author}</span>
                      <h3 className="premium-card-title">{book.title}</h3>
                      <p className="premium-card-text">{book.desc}</p>
                      <div className="premium-card-footer">
                        <span className="premium-card-price">R$ {book.price.toFixed(2)}</span>
                        <button className="btn btn-primary" onClick={() => addToCart(book, 'book')}>Adicionar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <button className="btn btn-secondary" onClick={() => { clearAlerts(); navigateTo('books'); }}>Ver Todos os Livros</button>
              </div>
            </section>

            {/* Synergy Software Section */}
            <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--color-primary-light)', padding: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>
              <span className="premium-card-tag" style={{ margin: '0 auto' }}>Parceria Tecnológica</span>
              <h3 className="font-serif-title" style={{ fontSize: '1.75rem', color: 'var(--color-primary)' }}>Synergy Homeopathic Software (SHS)</h3>
              <p className="text-muted" style={{ maxWidth: '800px', margin: '0 auto' }}>
                O software definitivo para repertorização de medicamentos homeopáticos e busca rápida do Método Sensação. Aprenda a usar através de nossos tutoriais exclusivos e facilite sua prática de consultório.
              </p>
              <div style={{ marginTop: '1rem' }}>
                <button className="btn btn-primary" onClick={() => { clearAlerts(); navigateTo('synergy'); }}>Conhecer Software e Tutoriais</button>
              </div>
            </section>
          </div>
        )}

        {/* PÁGINA: DETALHES DO CURSO */}
        {currentPage === 'course-detail' && selectedDetailCourse && (
          <div>
            <button className="btn btn-secondary mb-5" onClick={() => navigateTo('home')}>
              ← Voltar para Cursos
            </button>

            <div className="course-detail-hero">
              <span className="premium-card-tag" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                {selectedDetailCourse.type === 'FREE' ? 'Curso Livre (Gratuito)' : selectedDetailCourse.type === 'SUBSCRIPTION' ? 'Clube (Assinatura)' : 'Pós-Graduação'}
              </span>
              <h1 className="mt-2">{selectedDetailCourse.title}</h1>
              <p className="hero-subtitle mb-0" style={{ fontSize: '1.1rem', margin: '0.5rem 0 0' }}>
                {selectedDetailCourse.description}
              </p>
            </div>

            <div className="course-detail-grid">
              <div>
                <h3 className="section-title-underlined mb-4">Ementa e Módulos do Curso</h3>
                
                {COURSES_DETAILS_DATA[selectedDetailCourse.id]?.modules.map((mod, idx) => (
                  <div key={idx} className="syllabus-module-card">
                    <div className="syllabus-module-header">{mod.title}</div>
                    <ul className="syllabus-lessons-list">
                      {mod.lessons.map((les, lIdx) => (
                        <li key={lIdx} className="syllabus-lesson-item">
                          <span>📖</span> {les}
                        </li>
                      ))}
                    </ul>
                  </div>
                )) || (
                  <p className="text-muted">A ementa detalhada estará disponível em breve.</p>
                )}

                <h3 className="section-title-underlined mt-6 mb-4">Corpo Docente</h3>
                <div className="teacher-bio-card">
                  <div className="teacher-bio-avatar">C</div>
                  <div>
                    <h4>Dr. Carlos Eduardo Leitão (TOSB)</h4>
                    <p className="helper-text" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>CRM-PR 12345 | RQE 6789</p>
                    <p className="mt-2 text-muted" style={{ fontSize: '0.92rem' }}>
                      Médico Homeopata com mais de 20 anos de experiência clínica. Diretor científico e principal responsável pela difusão do Método Sensação Vital no Brasil.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="card" style={{ position: 'sticky', top: '100px' }}>
                  <h3 className="section-title-underlined-thin mb-4">Ficha Técnica</h3>
                  <table className="course-specs-table">
                    <tbody>
                      <tr>
                        <td>Carga Horária:</td>
                        <td>{COURSES_DETAILS_DATA[selectedDetailCourse.id]?.workload || '30 horas'}</td>
                      </tr>
                      <tr>
                        <td>Acesso:</td>
                        <td>{COURSES_DETAILS_DATA[selectedDetailCourse.id]?.duration || '180 dias'}</td>
                      </tr>
                      <tr>
                        <td>Certificado:</td>
                        <td>{COURSES_DETAILS_DATA[selectedDetailCourse.id]?.certificate || 'Disponível'}</td>
                      </tr>
                      <tr>
                        <td>Público-Alvo:</td>
                        <td style={{ fontSize: '0.85rem' }}>{COURSES_DETAILS_DATA[selectedDetailCourse.id]?.target || 'Profissionais de saúde'}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="mt-5">
                    {selectedDetailCourse.type === 'FREE' ? (
                      user ? (
                        <button className="btn btn-primary w-full" onClick={() => { enrollFreeCourse(selectedDetailCourse.id); navigateTo('student-dash'); }}>
                          Matricular-se Grátis
                        </button>
                      ) : (
                        <button className="btn btn-primary w-full" onClick={() => { clearAlerts(); navigateTo('login'); }}>
                          Entrar para Matricular
                        </button>
                      )
                    ) : (
                      <button className="btn btn-primary w-full" onClick={() => { addToCart({ id: selectedDetailCourse.id, title: selectedDetailCourse.title, type: selectedDetailCourse.type, price: selectedDetailCourse.type === 'SUBSCRIPTION' ? 99 : 3600 }, 'course'); }}>
                        Adicionar ao Carrinho
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PÁGINA: SOBRE NÓS */}
        {currentPage === 'about' && (
          <div className="card">
            <h2 className="mb-4 font-serif-title text-center" style={{ fontSize: '2rem' }}>Sobre a The Other Song Brasil</h2>
            <div style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.8' }}>
              <p className="mb-4">
                A <strong>The Other Song Brasil (TOSB)</strong> é a filial brasileira autorizada da prestigiosa academia internacional *The Other Song - International Academy of Advanced Homeopathy*, sediada em Mumbai, Índia.
              </p>
              <p className="mb-4">
                Nossa filial, sediada em <strong>Curitiba - PR</strong>, é liderada pelo renomado médico homeopata <strong>Dr. Carlos Eduardo Leitão</strong>. Temos como missão central difundir o **Método Sensação Vital**, desenvolvido pelo pioneiro **Dr. Rajan Sankaran**, e capacitar profissionais da saúde no Brasil para aplicarem essa metodologia clínica avançada.
              </p>
              <blockquote style={{ borderLeft: '4px solid var(--color-accent)', paddingLeft: '1.25rem', color: 'var(--color-primary)', fontStyle: 'italic', margin: '2rem 0', fontWeight: '600' }}>
                "O Método Sensação nos permite ir além do diagnóstico físico e mental superficial, mergulhando no reino da natureza que expressa o desequilíbrio dinâmico mais profundo de cada indivíduo."
              </blockquote>
              <h3 className="font-serif-title mb-3 mt-5">Pilares Científicos da TOSB:</h3>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem' }}>
                <li className="mb-2"><strong>Qualidade Acadêmica:</strong> Corpo docente credenciado internacionalmente e discussões científicas contínuas.</li>
                <li className="mb-2"><strong>Casos Clínicos Reais:</strong> Ensino baseado em gravações reais de consultas, respeitando o sigilo de dados.</li>
                <li className="mb-2"><strong>Integração de Tecnologias:</strong> Uso do Synergy Software como base para repertorização rápida.</li>
              </ul>
              <div className="text-center mt-6 mb-7">
                <button className="btn btn-primary" onClick={() => { clearAlerts(); window.location.hash = '#home'; }}>Voltar para Cursos</button>
              </div>

              <h3 className="font-serif-title mb-4 mt-6 text-center" style={{ fontSize: '1.75rem' }}>Galeria de Fotos Institucional</h3>
              <div className="gallery-grid-photos">
                {GALLERY_DATA.map((item, idx) => (
                  <div key={idx} className="gallery-item">
                    <div className="gallery-placeholder-img">
                      🌿
                    </div>
                    <div className="gallery-caption">
                      <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#e2e8f0', fontWeight: 'normal' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PÁGINA: LISTA DE HOMEOPATAS */}
        {currentPage === 'homeopaths' && (
          <div className="card">
            <h2 className="mb-2 font-serif-title text-center" style={{ fontSize: '2rem' }}>Diretório de Profissionais Homeopatas</h2>
            <p className="text-muted text-center mb-5">Encontre profissionais qualificados e credenciados no Método Sensação.</p>

            <div className="directory-search-box">
              <input 
                type="text" 
                className="form-input" 
                placeholder="Buscar homeopata por nome, CRM, conselho ou cidade..." 
                value={homeopathsSearch} 
                onChange={(e) => setHomeopathsSearch(e.target.value)} 
              />
              {homeopathsSearch && (
                <button className="btn btn-secondary" onClick={() => setHomeopathsSearch('')}>Limpar</button>
              )}
            </div>

            <div className="directory-grid">
              {getHomeopathsList().filter(h => {
                const searchLower = homeopathsSearch.toLowerCase();
                return h.name.toLowerCase().includes(searchLower) ||
                       h.reg.toLowerCase().includes(searchLower) ||
                       h.specialty.toLowerCase().includes(searchLower) ||
                       h.city.toLowerCase().includes(searchLower);
              }).map((h, idx) => (
                <div key={idx} className="homeopath-card">
                  <div className="homeopath-avatar">
                    {h.name.split(' ').slice(1).map(n => n[0]).join('').substring(0,2).toUpperCase()}
                  </div>
                  <div className="homeopath-info">
                    <h4>{h.name}</h4>
                    <span className="homeopath-reg">{h.reg}</span>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>{h.specialty}</div>
                    <div className="homeopath-contact-item">📍 {h.city}</div>
                    <div className="homeopath-contact-item">📞 {h.phone}</div>
                    <div className="homeopath-contact-item">✉️ {h.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PÁGINA: GALERIA DE FOTOS */}
        {currentPage === 'gallery' && (
          <div className="card">
            <h2 className="mb-2 font-serif-title text-center" style={{ fontSize: '2rem' }}>Galeria de Fotos Institucional</h2>
            <p className="text-muted text-center mb-5">Veja registros de nossos seminários científicos, encontros de alunos e nossa sede em Curitiba.</p>

            <div className="gallery-grid-photos">
              {GALLERY_DATA.map((item, idx) => (
                <div key={idx} className="gallery-item">
                  <div className="gallery-placeholder-img">
                    🌿
                  </div>
                  <div className="gallery-caption">
                    <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#e2e8f0', fontWeight: 'normal' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PÁGINA: LOJA DE LIVROS */}
        {currentPage === 'books' && (
          <div>
            <div className="card">
              <h2 className="mb-2 font-serif-title text-center" style={{ fontSize: '2rem' }}>Livraria Científica TOSB</h2>
              <p className="text-muted text-center mb-5">Adquira as obras traduzidas oficiais do Dr. Rajan Sankaran e Dr. Gaurang Gaikwad.</p>

              <div className="premium-card-grid">
                {books.map(book => (
                  <div key={book.id} className="premium-card">
                    <div className="premium-card-img-placeholder" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)', height: '160px' }}>📚</div>
                    <div className="premium-card-content">
                      <span className="premium-card-tag">{book.author}</span>
                      <h3 className="premium-card-title">{book.title}</h3>
                      <p className="premium-card-text">{book.desc}</p>
                      <div className="premium-card-footer">
                        <span className="premium-card-price">R$ {book.price.toFixed(2)}</span>
                        <button className="btn btn-primary" onClick={() => addToCart(book, 'book')}>Adicionar ao Carrinho</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RELATOS DOS CLIENTES (TESTIMONIALS) */}
            <div className="testimonials-section">
              <h2 className="home-section-title">Relatos de Nossos Leitores</h2>
              <p className="text-muted text-center mb-5">Veja o impacto das obras de Rajan Sankaran na prática clínica de médicos e homeopatas no Brasil.</p>
              
              <div className="testimonial-grid">
                <div className="testimonial-card">
                  <div className="testimonial-stars">★★★★★</div>
                  <p>"O livro 'Esquema de Reinos e Subreinos' tornou-se um guia de consulta diária no meu consultório. A rapidez para diferenciar o reino mineral do vegetal aumentou significativamente meus acertos prescritivos."</p>
                  <div className="testimonial-author">Dr. Marcos Souza — CRM-SP</div>
                </div>

                <div className="testimonial-card">
                  <div className="testimonial-stars">★★★★★</div>
                  <p>"'O Método das Oito Caixas' clareou de forma definitiva como organizar os sintomas clínicos. A tradução está excelente e muito fiel aos ensinamentos originais de Mumbai."</p>
                  <div className="testimonial-author">Dra. Letícia Ramos — CRM-PR</div>
                </div>

                <div className="testimonial-card">
                  <div className="testimonial-stars">★★★★★</div>
                  <p>"Estudar as 'Superclasses em Homeopatia' me deu a segurança que faltava para tratar casos crônicos de hipersensibilidade. Indispensável para quem atua com o Método Sensação."</p>
                  <div className="testimonial-author">Dr. Roberto de Almeida — CRM-RJ</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PÁGINA: SYNERGY SOFTWARE */}
        {currentPage === 'synergy' && (
          <div className="card">
            <h2 className="mb-2 font-serif-title text-center" style={{ fontSize: '2rem' }}>Synergy Homeopathic Software (SHS)</h2>
            <p className="text-muted text-center mb-5">Conheça o software oficial de repertorização de medicamentos e suporte ao Método Sensação.</p>

            <div style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.05rem', lineHeight: '1.8' }}>
              <p className="mb-4">
                O **Synergy Homeopathic Software (SHS)** é a ferramenta de tecnologia médica mais utilizada por homeopatas no mundo inteiro. Com sua interface voltada para repertorização rápida e cruzamento de sintomas, o software se torna um parceiro indispensável no consultório.
              </p>
              
              <h3 className="font-serif-title mb-3 mt-5">Tutoriais Exclusivos da Filial Brasil:</h3>
              <div className="invoices-list" style={{ gap: '1rem' }}>
                <div className="invoice-card" style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Tutorial 1: Como realizar a busca rápida de famílias botânicas</strong>
                    <div className="helper-text">Assista ao vídeo explicativo passo-a-passo no SHS (15 min)</div>
                  </div>
                  <a href="#video" className="btn btn-primary btn-quick-login" onClick={(e) => { e.preventDefault(); alert('Vídeo do tutorial abrindo no player...'); }}>Assistir</a>
                </div>

                <div className="invoice-card" style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Tutorial 2: Repertorização combinada com níveis de experiência</strong>
                    <div className="helper-text">Estratégia para cruzar sintomas locais com o reino do paciente (22 min)</div>
                  </div>
                  <a href="#video" className="btn btn-primary btn-quick-login" onClick={(e) => { e.preventDefault(); alert('Vídeo do tutorial abrindo no player...'); }}>Assistir</a>
                </div>

                <div className="invoice-card" style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>Tutorial 3: Cadastrar e importar novos dados de matéria médica</strong>
                    <div className="helper-text">Saiba como customizar suas anotações no SHS (10 min)</div>
                  </div>
                  <a href="#video" className="btn btn-primary btn-quick-login" onClick={(e) => { e.preventDefault(); alert('Vídeo do tutorial abrindo no player...'); }}>Assistir</a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PÁGINA: CONTATO */}
        {currentPage === 'contact' && (
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="mb-2 font-serif-title text-center" style={{ fontSize: '2rem' }}>Contato e Suporte Acadêmico</h2>
            <p className="text-muted text-center mb-5">Tem dúvidas sobre matrículas, certificados ou sobre o Synergy Software? Entre em contato.</p>

            <div className="grid-2col-wide">
              <div>
                <h4 className="section-title-underlined-thin mb-3">Informações de Contato</h4>
                <p className="mb-4" style={{ fontSize: '1.05rem' }}>
                  <strong>The Other Song Brasil</strong><br />
                  📍 Rua Brigadeiro Franco, 1234 - Batel<br />
                  Curitiba - PR / CEP: 80420-000
                </p>
                <p className="mb-4">
                  📞 Telefone: <strong>(41) 3322-1100</strong><br />
                  🟢 WhatsApp: <strong>(41) 99111-2233</strong>
                </p>
                <p className="mb-4">
                  ✉️ E-mail de Suporte:<br />
                  <strong>suporte@tosb.com.br</strong>
                </p>
                <div className="alert alert-warning" style={{ margin: '0' }}>
                  <strong>Atenção:</strong> Nosso atendimento é exclusivo para profissionais da saúde e estudantes da plataforma.
                </div>
              </div>

              <div>
                <h4 className="section-title-underlined-thin mb-3">Envie uma Mensagem</h4>
                <form onSubmit={(e) => { e.preventDefault(); alert('Mensagem enviada com sucesso! Em breve retornaremos o contato.'); e.target.reset(); }}>
                  <div className="form-group">
                    <label className="form-label">Seu Nome</label>
                    <input className="form-input" type="text" required placeholder="Dra. Roberta Silva" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Seu E-mail</label>
                    <input className="form-input" type="email" required placeholder="exemplo@gmail.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mensagem / Dúvida</label>
                    <textarea className="form-input" required rows="4" placeholder="Descreva sua dúvida sobre nossos cursos..." style={{ minHeight: '120px' }}></textarea>
                  </div>
                  <button className="btn btn-primary w-full mt-2" type="submit">Enviar Mensagem</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* PÁGINA: CARRINHO DE COMPRAS */}
        {currentPage === 'cart' && (
          <div>
            <h2 className="mb-5 font-serif-title">Seu Carrinho de Compras</h2>
            
            {cartItems.length === 0 ? (
              <div className="placeholder-box text-center">
                <span style={{ fontSize: '3rem' }}>🛒</span>
                <h3 className="mt-3 mb-3">Seu carrinho está vazio!</h3>
                <p className="text-muted mb-4">Adicione livros de matéria médica ou cursos acadêmicos à sua sacola para prosseguir.</p>
                <button className="btn btn-primary" onClick={() => navigateTo('home')}>Ver Cursos e Livros</button>
              </div>
            ) : (
              <div className="cart-layout">
                {/* Lista de Itens */}
                <div className="cart-items-list">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="cart-item-row">
                      <div className="cart-item-title-section">
                        <span className="course-type-badge">{item.type === 'course' ? 'Curso / Assinatura' : 'Livro impresso'}</span>
                        <h4 className="mt-1">{item.product.title}</h4>
                        <span className="helper-text">{item.type === 'course' ? '' : `Autor: ${item.product.author}`}</span>
                      </div>
                      
                      <div className="cart-item-actions">
                        <span style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>
                          R$ {(item.type === 'course' ? (item.product.type === 'SUBSCRIPTION' ? 99.00 : 3600.00) : item.product.price * item.quantity).toFixed(2)}
                        </span>
                        
                        {item.type === 'book' && (
                          <div className="cart-quantity-selector">
                            <button className="btn-qty" onClick={() => updateCartQty(item.product.id, -1)}>-</button>
                            <span className="cart-qty-value">{item.quantity}</span>
                            <button className="btn-qty" onClick={() => updateCartQty(item.product.id, 1)}>+</button>
                          </div>
                        )}

                        <button className="btn-remove-cart" onClick={() => removeFromCart(item.product.id)}>Remover</button>
                      </div>
                    </div>
                  ))}
                  
                  <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                    <button className="btn btn-secondary btn-quick-login" onClick={clearCart}>Esvaziar Carrinho</button>
                  </div>
                </div>

                {/* Resumo da Compra */}
                <div className="cart-summary-box">
                  <h3 className="section-title-underlined-thin mb-4">Resumo do Pedido</h3>
                  <div className="summary-row">
                    <span>Itens ({cartItems.reduce((acc, item) => acc + item.quantity, 0)}):</span>
                    <span>R$ {cartItems.reduce((acc, item) => acc + (item.type === 'course' ? (item.product.type === 'SUBSCRIPTION' ? 99 : 3600) : item.product.price * item.quantity), 0).toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Envio / Entrega:</span>
                    <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>Grátis</span>
                  </div>
                  <div className="summary-row">
                    <span>Descontos:</span>
                    <span>R$ 0.00</span>
                  </div>
                  
                  <div className="summary-total">
                    <span>Total Geral:</span>
                    <span>R$ {cartItems.reduce((acc, item) => acc + (item.type === 'course' ? (item.product.type === 'SUBSCRIPTION' ? 99 : 3600) : item.product.price * item.quantity), 0).toFixed(2)}</span>
                  </div>

                  <button 
                    className="btn btn-primary w-full mt-5" 
                    onClick={() => {
                      if (!user) {
                        setError('Por favor, faça login ou crie uma conta para poder finalizar a compra do seu carrinho.');
                        navigateTo('login');
                      } else {
                        setCheckoutCourse(null);
                        navigateTo('checkout');
                      }
                    }}
                  >
                    Prosseguir para o Checkout
                  </button>
                  <button className="btn btn-secondary w-full mt-2" onClick={() => navigateTo('home')}>Continuar Comprando</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PÁGINA: DASHBOARD DO ALUNO */}
        {currentPage === 'student-dash' && (
          <div>
            <div className="dashboard-header">
              <div>
                <h1 className="font-serif-title">Painel de Estudos Homeopáticos</h1>
                <p className="text-muted">Olá, <strong>{user?.name}</strong>! Gerencie seu aprendizado, dados cadastrais e financeiro.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {isOfflineMode && (
                  <button className="btn btn-danger btn-quick-login" onClick={handleSimulateDelinquency}>
                    Simular Inadimplência
                  </button>
                )}
                <button className="btn btn-secondary" onClick={() => { clearAlerts(); handleLogout(); }}>Sair da Conta</button>
              </div>
            </div>

            <div className="student-panel-container">
              {/* Menu Lateral de Abas */}
              <aside className="student-sidebar">
                <ul className="student-sidebar-menu">
                  <li className={`student-sidebar-item ${studentActiveTab === 'panel' ? 'active' : ''}`}>
                    <button onClick={() => setStudentActiveTab('panel')}>📊 Painel Geral</button>
                  </li>
                  <li className={`student-sidebar-item ${studentActiveTab === 'courses' ? 'active' : ''}`}>
                    <button onClick={() => setStudentActiveTab('courses')}>🌿 Meus Cursos</button>
                  </li>
                  <li className={`student-sidebar-item ${studentActiveTab === 'agenda' ? 'active' : ''}`}>
                    <button onClick={() => setStudentActiveTab('agenda')}>📅 Agenda & Eventos</button>
                  </li>
                  <li className={`student-sidebar-item ${studentActiveTab === 'payments' ? 'active' : ''}`}>
                    <button onClick={() => setStudentActiveTab('payments')}>💳 Pedidos / Financeiro</button>
                  </li>
                  <li className={`student-sidebar-item ${studentActiveTab === 'account' ? 'active' : ''}`}>
                    <button onClick={() => setStudentActiveTab('account')}>⚙️ Detalhes da Conta</button>
                  </li>
                </ul>
              </aside>
 
              {/* Conteúdo da Aba Ativa */}
              <div className="student-panel-content">
                {studentActiveTab === 'panel' && (
                  <div className="card">
                    <h3 className="mb-4">Painel Geral</h3>
                    <p style={{ marginBottom: '1.5rem' }}>
                      A partir do seu painel de controle, você pode visualizar faturas pendentes, acompanhar datas e locais de seminários integrados, gerenciar seus dados de cadastro e endereços de faturamento e entrega.
                    </p>
                    <div className="grid-container" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                      <div className="card" style={{ borderLeft: '4px solid var(--color-primary)', padding: '1.25rem' }}>
                        <span className="course-type-badge">Acesso Acadêmico</span>
                        <h4 className="mt-1">Cursos Ativos</h4>
                        <button className="btn btn-secondary btn-quick-login mt-4 w-full" onClick={() => setStudentActiveTab('courses')}>Acessar Aulas</button>
                      </div>
                      <div className="card" style={{ borderLeft: '4px solid var(--color-accent)', padding: '1.25rem' }}>
                        <span className="course-type-badge">Financeiro</span>
                        <h4 className="mt-1">Faturas & Cobranças</h4>
                        <button className="btn btn-secondary btn-quick-login mt-4 w-full" onClick={() => setStudentActiveTab('payments')}>Ver Cobranças</button>
                      </div>
                      <div className="card" style={{ borderLeft: '4px solid var(--color-success)', padding: '1.25rem' }}>
                        <span className="course-type-badge">Dados Cadastrais</span>
                        <h4 className="mt-1">Editar Perfil</h4>
                        <button className="btn btn-secondary btn-quick-login mt-4 w-full" onClick={() => setStudentActiveTab('account')}>Editar Cadastro</button>
                      </div>
                    </div>
                  </div>
                )}
 
                {studentActiveTab === 'courses' && (
                  <div className="card">
                    <h3 className="mb-4">Meus Cursos e Disciplinas</h3>
                    <div className="courses-list">
                      {courses.filter(course => course.enrollment.enrolled).length > 0 ? (
                        courses.filter(course => course.enrollment.enrolled).map(course => (
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

                              {/* Informações de Turma, Professor e Presença do Aluno */}
                              {(() => {
                                const associatedClass = (mockDb.classes || []).find(cl => cl.course_id === course.id && (cl.student_ids || []).includes(user.id));
                                const classTeachers = associatedClass ? mockDb.users.filter(u => (associatedClass.teacher_ids || []).includes(u.id)) : [];
                                const attendanceKey = associatedClass ? `${associatedClass.id}_${user.id}` : null;
                                const attendanceRecords = attendanceKey ? (mockDb.class_attendance[attendanceKey] || []) : [];
                                return associatedClass ? (
                                  <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px dashed var(--color-border)' }}>
                                    <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                      🏫 <strong>Turma:</strong> {associatedClass.name}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                                      👨‍🏫 <strong>Professores:</strong> {classTeachers.map(t => t.name).join(', ') || 'Nenhum alocado'}
                                    </div>
                                    <div style={{ fontSize: '0.85rem' }}>
                                      📅 <strong>Presenças:</strong> <span className="badge-paid" style={{ display: 'inline-block', padding: '0.1rem 0.3rem', fontSize: '0.75rem' }}>{attendanceRecords.length} registrada(s)</span>
                                      {attendanceRecords.length > 0 && (
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                          Datas: {attendanceRecords.map(r => new Date(r.date + 'T00:00:00').toLocaleDateString('pt-BR')).join(', ')}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                    Nenhuma turma alocada para este curso ainda.
                                  </div>
                                );
                              })()}
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
                        ))
                      ) : (
                        <div className="text-center p-6 text-muted">
                          <p>Você não possui nenhuma matrícula ativa no momento.</p>
                          <a href={getLinkHref('home') + '#online-courses'} className="btn btn-primary mt-4" onClick={(e) => {
                            const isDemo = window.location.pathname.endsWith('demo.html') || window.location.protocol === 'file:';
                            if (isDemo) {
                              e.preventDefault();
                              clearAlerts();
                              navigateTo('home');
                              setTimeout(() => document.getElementById('online-courses')?.scrollIntoView({ behavior: 'smooth' }), 100);
                            }
                          }}>Explorar Cursos</a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
 
                {studentActiveTab === 'agenda' && (
                  <div className="card">
                    <h3 className="mb-4">Agenda & Eventos Científicos</h3>
                    <p className="text-muted mb-4">Confira nosso cronograma integrado de aulas magnas, encontros de matéria médica e lançamentos de livros.</p>
                    
                    <div className="agenda-list">
                      {(mockDb.events || []).map(event => (
                        <div key={event.id} className="agenda-card">
                          <div className="agenda-date-box">
                            <span className="agenda-date-day">{event.day}</span>
                            <span className="agenda-date-month">{event.month}</span>
                          </div>
                          <div className="agenda-details">
                            <span className="agenda-type">{event.type}</span>
                            <h3 className="agenda-title">{event.title}</h3>
                            <p className="agenda-location">
                              📍 {event.location}
                              {event.time && <span style={{ marginLeft: '1rem', color: 'var(--color-primary)', fontWeight: '500' }}>🕒 {event.time}</span>}
                            </p>
                          </div>
                        </div>
                      ))}
                      {(mockDb.events || []).length === 0 && (
                        <p className="text-muted text-center w-full py-4">Nenhum evento agendado no momento.</p>
                      )}
                    </div>
                  </div>
                )}
 
                {studentActiveTab === 'payments' && (
                  <div className="card">
                    <h3 className="mb-4">Histórico Financeiro e Faturas</h3>
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
                                  Simular Webhook Asaas (Pago)
                                </button>
                              )}
                            </div>
                            <small className="invoice-ref">Código de Transação: {inv.transaction_code}</small>
                            <small className="invoice-due">Vencimento: {new Date(inv.due_date).toLocaleDateString('pt-BR')}</small>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}



                {studentActiveTab === 'account' && (
                  <div className="card">
                    <h3 className="mb-4">Detalhes da Conta e Informações de Entrega</h3>
                    <form onSubmit={handleUpdateProfile}>
                      <div className="grid-2col">
                        <div className="form-group">
                          <label className="form-label">Nome Completo</label>
                          <input className="form-input" type="text" name="name" defaultValue={user?.name || ''} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label">E-mail</label>
                          <input className="form-input" type="email" name="email" defaultValue={user?.email || ''} required />
                        </div>
                      </div>

                      <div className="grid-2col">
                        <div className="form-group">
                          <label className="form-label">Telefone de Contato</label>
                          <input className="form-input" type="text" name="phone" placeholder="ex: (41) 99999-9999" defaultValue={user?.phone || ''} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">CPF ou CNPJ</label>
                          <input className="form-input" type="text" name="cpf_cnpj" placeholder="ex: 000.000.000-00" defaultValue={user?.cpf_cnpj || ''} />
                        </div>
                      </div>

                      <h4 className="mt-4 mb-3 section-title-underlined-thin">Endereço de Correspondência</h4>
                      
                      <div className="grid-2col">
                        <div className="form-group">
                          <label className="form-label">CEP</label>
                          <input className="form-input" type="text" name="address_zip" placeholder="00000-000" defaultValue={user?.address_zip || ''} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Logradouro / Rua</label>
                          <input className="form-input" type="text" name="address_street" placeholder="Rua, Avenida, etc." defaultValue={user?.address_street || ''} />
                        </div>
                      </div>

                      <div className="grid-container" style={{ gridTemplateColumns: '1fr 2fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Número</label>
                          <input className="form-input" type="text" name="address_number" defaultValue={user?.address_number || ''} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Complemento</label>
                          <input className="form-input" type="text" name="address_complement" placeholder="Apto, Bloco, etc." defaultValue={user?.address_complement || ''} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Bairro</label>
                          <input className="form-input" type="text" name="address_neighborhood" defaultValue={user?.address_neighborhood || ''} />
                        </div>
                      </div>

                      <div className="grid-2col">
                        <div className="form-group">
                          <label className="form-label">Cidade</label>
                          <input className="form-input" type="text" name="address_city" defaultValue={user?.address_city || ''} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Estado</label>
                          <input className="form-input" type="text" name="address_state" placeholder="ex: PR" defaultValue={user?.address_state || ''} />
                        </div>
                      </div>

                      <h4 className="mt-4 mb-3 section-title-underlined-thin">Identificação de Saúde</h4>
                      <div className="grid-2col">
                        <div className="form-group">
                          <label className="form-label">Conselho</label>
                          <select 
                            className="form-input" 
                            name="professional_registration_type" 
                            value={profileRegType}
                            onChange={(e) => setProfileRegType(e.target.value)}
                          >
                            <option value="CRM">CRM (Medicina)</option>
                            <option value="CRO">CRO (Odontologia)</option>
                            <option value="CRF">CRF (Farmácia)</option>
                            <option value="CRV">CRV (Veterinária)</option>
                            <option value="OUTROS">Outros Conselhos Integrados</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Registro Profissional</label>
                          <input 
                            className="form-input" 
                            type="text" 
                            name="professional_registration_number" 
                            value={profileRegNumber}
                            onChange={(e) => setProfileRegNumber(e.target.value)} 
                          />
                        </div>
                      </div>

                      {profileRegType.toUpperCase() !== 'OUTROS' && profileRegNumber.trim() !== '' && (
                        <div className="form-group mt-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input 
                            type="checkbox" 
                            id="is_homeopath" 
                            name="is_homeopath" 
                            defaultChecked={user?.is_homeopath} 
                            style={{ width: 'auto', margin: 0 }} 
                          />
                          <label htmlFor="is_homeopath" className="cursor-pointer" style={{ fontWeight: '500' }}>
                            Quero participar da lista de Homeopatas indicados
                          </label>
                        </div>
                      )}

                      <button className="btn btn-primary w-full mt-4" type="submit">Salvar Alterações de Cadastro</button>
                    </form>
                  </div>
                )}
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
                <button className="btn btn-secondary flex-1" type="button" onClick={() => navigateTo('student-dash')}>Cancelar</button>
                <button className="btn btn-primary flex-2" type="submit">Gerar Fatura no Asaas</button>
              </div>
            </form>
          </div>
        )}

        {/* PÁGINA: LMS / CURSO E PLAYER */}
        {currentPage === 'course-view' && selectedCourse && (
          <div>
            <button className="btn btn-secondary mb-5" onClick={() => navigateTo('student-dash')}>
              ← Voltar ao Dashboard
            </button>

            <div className="lms-layout">
              
              {/* Player Principal e Aulas */}
              <div>
                <h2>{selectedCourse.course.title}</h2>
                <p className="course-card-description mb-5">{selectedCourse.course.description}</p>
                
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

                    <div className="lesson-info">
                      <h3>{selectedLesson.title}</h3>
                      <div className="lesson-progress-meta">
                        <span className="course-card-expires">
                          Assistido: <strong>{lessonProgress ? lessonProgress.seconds_watched : 0}s</strong> / {selectedLesson.duration_seconds}s
                        </span>
                        
                        <span className={lessonProgress && lessonProgress.completed ? 'lesson-progress-badge-completed' : 'lesson-progress-badge-pending'}>
                          {lessonProgress && lessonProgress.completed ? '✓ Concluído (60%+)' : 'Pendente'}
                        </span>
                      </div>
                    </div>

                    {/* Exibir Questionário se houver na aula (Exemplo na Pós) */}
                    {selectedLesson.quiz ? (
                      <div className="quiz-section-wrapper">
                        <div className="quiz-header">
                          <div>
                            <h3 className="font-serif-title">{selectedLesson.quiz.title}</h3>
                            <small className="text-muted">Regras: Máx. 2 tentativas, aprovação mínima de 70%.</small>
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
                              <div className="mb-5">
                                <strong>Suas tentativas anteriores:</strong>
                                <ul className="quiz-attempts-list">
                                  {quizData.attempts.map((a, i) => (
                                    <li key={i} className={a.passed ? 'quiz-attempt-passed' : 'quiz-attempt-failed'}>
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
                                          className="pointer-events-none"
                                        />
                                        <span>{opt}</span>
                                      </div>
                                    ))}
                                  </div>
                                ))}

                                <button className="btn btn-primary w-full" onClick={submitQuiz}>Enviar Respostas do Quiz</button>
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
                      <p className="course-card-description">Esta aula não possui Quiz obrigatório.</p>
                    )}

                  </div>
                ) : (
                  <div className="placeholder-box">
                    🌿 Selecione uma aula ao lado para assistir à gravação científica.
                  </div>
                )}

                {/* Mensagem personalizada ao finalizar todas as aulas do curso */}
                {selectedCourse.modules.every(m => m.lessons.every(l => l.completed)) && (
                  <div className="card alert-success course-conclusion-card">
                    <h3 className="quiz-attempt-passed font-serif-title">Curso Concluído!</h3>
                    <p className="fontSize-base">"{selectedCourse.course.finishing_message}"</p>
                  </div>
                )}

              </div>

              {/* Lista de Módulos / Aulas Laterais */}
              <div className="lms-sidebar">
                <h3 className="sidebar-title">Módulos do Curso</h3>
                
                {selectedCourse.modules.map(mod => (
                  <div key={mod.id} className="modules-list-container">
                    <div className="module-header-title">
                      {mod.title}
                    </div>

                    <div className="lessons-list-container">
                      {mod.lessons.map(lesson => (
                        <div
                          key={lesson.id}
                          onClick={() => selectLesson(lesson)}
                          className={`lesson-item-sidebar ${selectedLesson && selectedLesson.id === lesson.id ? 'active' : ''}`}
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
        {currentPage === 'teacher-dash' && user && (
          <div>
            <div className="teacher-dash-header">
              <div>
                <h1 className="font-serif-title">Portal do Docente</h1>
                <p className="text-muted">Seja bem-vindo, <strong>{user.name}</strong>! Gerencie suas turmas e acompanhe a receita de seus cursos.</p>
              </div>
              <button className="btn btn-secondary" onClick={loadTeacherReport}>Atualizar Painel</button>
            </div>

            <div className="student-panel-container">
              {/* Menu Lateral do Professor */}
              <aside className="student-sidebar">
                <ul className="student-sidebar-menu">
                  <li className={`student-sidebar-item ${teacherActiveTab === 'panel' ? 'active' : ''}`}>
                    <button onClick={() => setTeacherActiveTab('panel')}>📊 Painel Geral</button>
                  </li>
                  <li className={`student-sidebar-item ${teacherActiveTab === 'students' ? 'active' : ''}`}>
                    <button onClick={() => setTeacherActiveTab('students')}>👥 Gerenciar Turmas</button>
                  </li>
                  <li className={`student-sidebar-item ${teacherActiveTab === 'payments' ? 'active' : ''}`}>
                    <button onClick={() => setTeacherActiveTab('payments')}>💳 Financeiro</button>
                  </li>
                  <li className={`student-sidebar-item ${teacherActiveTab === 'account' ? 'active' : ''}`}>
                    <button onClick={() => setTeacherActiveTab('account')}>⚙️ Detalhes da Conta</button>
                  </li>
                </ul>
              </aside>

              {/* Conteúdo da Aba Ativa */}
              <div className="student-panel-content">
                {teacherActiveTab === 'panel' && (
                  <div>
                    {/* Metadados do Professor */}
                    <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
                      <div className="admin-stat-card primary">
                        <span className="course-type-badge">Receita de Vendas Gerada</span>
                        <h2 className="stat-value">R$ {mockDb.payments
                          .filter(p => p.status === 'RECEIVED' && mockDb.courses.filter(c => c.teacher_id === user.id).map(c => c.id).includes(p.course_id))
                          .reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</h2>
                      </div>
                      
                      <div className="admin-stat-card accent">
                        <span className="course-type-badge">Cursos Vinculados</span>
                        <h2 className="stat-value">{mockDb.courses.filter(c => c.teacher_id === user.id).length} Cursos</h2>
                      </div>

                      <div className="admin-stat-card warning">
                        <span className="course-type-badge">Total de Matrículas Ativas</span>
                        <h2 className="stat-value">
                          {mockDb.enrollments.filter(e => e.status === 'ACTIVE' && mockDb.courses.filter(c => c.teacher_id === user.id).map(c => c.id).includes(e.course_id)).length} Alunos
                        </h2>
                      </div>
                    </div>

                    {/* Lista de Cursos Vinculados */}
                    <div className="card">
                      <h3 className="section-title-underlined mb-4">Meus Cursos Vinculados</h3>
                      <div className="courses-list">
                        {mockDb.courses.filter(c => c.teacher_id === user.id).map(c => {
                          const enrollCount = mockDb.enrollments.filter(e => e.course_id === c.id && e.status === 'ACTIVE').length;
                          return (
                            <div key={c.id} className="invoice-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <strong>{c.title}</strong>
                                <div className="helper-text">{c.description}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <span className="badge-paid">{c.type}</span>
                                <div className="helper-text mt-1">{enrollCount} aluno(s) ativo(s)</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {teacherActiveTab === 'students' && (
                  <div className="card">
                    <h3 className="mb-4">Gerenciamento de Turmas e Presenças</h3>
                    <p className="course-card-description mb-4">
                      Abaixo estão listadas as turmas sob sua coordenação. Você pode registrar a presença dos alunos diariamente.
                    </p>

                    {(mockDb.classes || [])
                      .filter(c => (c.teacher_ids || []).includes(user.id))
                      .map(c => {
                        const course = mockDb.courses.find(course => course.id === c.course_id);
                        const studentsInClass = mockDb.users.filter(u => (c.student_ids || []).includes(u.id));

                        return (
                          <div key={c.id} className="card p-4 mb-5" style={{ border: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                              <div>
                                <h4 style={{ margin: 0, color: 'var(--color-primary)' }}>🏫 {c.name}</h4>
                                <small className="text-muted">Curso: {course ? course.title : 'Curso Removido'}</small>
                              </div>
                              <span className="course-type-badge">{studentsInClass.length} aluno(s) alocado(s)</span>
                            </div>

                            <div className="table-responsive">
                              <table className="lms-table" style={{ fontSize: '0.9rem' }}>
                                <thead>
                                  <tr>
                                    <th>Aluno</th>
                                    <th>E-mail</th>
                                    <th className="text-center">Presenças Registradas</th>
                                    <th className="text-center">Datas das Presenças</th>
                                    <th className="text-center">Ação</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {studentsInClass.map(s => {
                                    const attendanceKey = `${c.id}_${s.id}`;
                                    const attendanceList = mockDb.class_attendance[attendanceKey] || [];
                                    
                                    // Match student progress in this course
                                    const studentProgress = teacherReportData.find(rep => rep.studentEmail === s.email && rep.courseTitle === course?.title);
                                    const progressStr = studentProgress ? `${studentProgress.completedLessons}/${studentProgress.totalLessons} (${studentProgress.progressPercent}%)` : '-';

                                    return (
                                      <tr key={s.id}>
                                        <td>
                                          <strong>{s.name}</strong>
                                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Progresso Aulas: {progressStr}</div>
                                        </td>
                                        <td>{s.email}</td>
                                        <td className="text-center">
                                          <span className="badge-paid" style={{ padding: '0.2rem 0.5rem' }}>{attendanceList.length}</span>
                                        </td>
                                        <td>
                                          {attendanceList.length > 0 ? (
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                              {attendanceList.map(r => new Date(r.date + 'T00:00:00').toLocaleDateString('pt-BR')).join(', ')}
                                            </span>
                                          ) : (
                                            <span className="text-muted" style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>Nenhuma registrada</span>
                                          )}
                                        </td>
                                        <td className="text-center">
                                          <button 
                                            className="btn btn-primary" 
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                            onClick={() => registerAttendance(c.id, s.id)}
                                          >
                                            ➕ Registrar Presença Hoje
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                  {studentsInClass.length === 0 && (
                                    <tr>
                                      <td colSpan="5" className="text-center text-muted" style={{ padding: '1rem' }}>
                                        Nenhum aluno alocado nesta turma ainda.
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}

                    {(mockDb.classes || []).filter(c => (c.teacher_ids || []).includes(user.id)).length === 0 && (
                      <div className="text-center p-6 text-muted">
                        Você não está alocado como professor em nenhuma turma ativa no momento.
                      </div>
                    )}
                  </div>
                )}

                {teacherActiveTab === 'payments' && (
                  <div className="card">
                    <h3 className="mb-4">Relatório Financeiro do Docente</h3>
                    <p className="course-card-description mb-4">
                      Acompanhe as vendas e faturas recebidas referentes aos cursos sob sua docência.
                    </p>
                    <div className="table-responsive">
                      <table className="lms-table">
                        <thead>
                          <tr>
                            <th>Data</th>
                            <th>Código/Ref</th>
                            <th>Aluno</th>
                            <th>Curso</th>
                            <th>Valor Repassado</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockDb.payments
                            .filter(p => mockDb.courses.filter(c => c.teacher_id === user.id).map(c => c.id).includes(p.course_id))
                            .map(p => {
                              const student = mockDb.users.find(u => u.id === p.student_id);
                              const course = mockDb.courses.find(c => c.id === p.course_id);
                              return (
                                <tr key={p.id}>
                                  <td>{p.due_date ? new Date(p.due_date).toLocaleDateString('pt-BR') : '-'}</td>
                                  <td><small><code>{p.transaction_code || p.id}</code></small></td>
                                  <td>
                                    <strong>{student ? student.name : 'Aluno Removido'}</strong>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{student?.email}</div>
                                  </td>
                                  <td>{course ? course.title : 'Curso Removido'}</td>
                                  <td><strong>R$ {p.amount.toFixed(2)}</strong></td>
                                  <td>
                                    <span className={p.status === 'RECEIVED' ? 'badge-paid' : p.status === 'OVERDUE' ? 'badge-overdue' : 'badge-pending'}>
                                      {p.status === 'RECEIVED' ? 'PAID' : p.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          {mockDb.payments.filter(p => mockDb.courses.filter(c => c.teacher_id === user.id).map(c => c.id).includes(p.course_id)).length === 0 && (
                            <tr>
                              <td colSpan="6" className="text-center text-muted" style={{ padding: '2rem' }}>
                                Nenhuma fatura vinculada aos seus cursos localizada.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {teacherActiveTab === 'account' && (
                  <div className="card">
                    <h3 className="mb-4">Detalhes da Conta Docente</h3>
                    <form onSubmit={handleUpdateProfile}>
                      <div className="grid-2col">
                        <div className="form-group">
                          <label className="form-label">Nome Completo</label>
                          <input className="form-input" type="text" name="name" defaultValue={user?.name || ''} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label">E-mail</label>
                          <input className="form-input" type="email" name="email" defaultValue={user?.email || ''} required />
                        </div>
                      </div>

                      <div className="grid-2col">
                        <div className="form-group">
                          <label className="form-label">Telefone de Contato</label>
                          <input className="form-input" type="text" name="phone" placeholder="ex: (41) 99999-9999" defaultValue={user?.phone || ''} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">CPF ou CNPJ</label>
                          <input className="form-input" type="text" name="cpf_cnpj" placeholder="ex: 000.000.000-00" defaultValue={user?.cpf_cnpj || ''} />
                        </div>
                      </div>

                      <h4 className="mt-4 mb-3 section-title-underlined-thin">Identificação Profissional</h4>
                      <div className="grid-2col">
                        <div className="form-group">
                          <label className="form-label">CRM / Conselho</label>
                          <input 
                            className="form-input" 
                            type="text" 
                            name="crm" 
                            value={profileTeacherCrm} 
                            onChange={(e) => setProfileTeacherCrm(e.target.value)} 
                            required 
                            placeholder="ex: CRM-PR 12345" 
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">RQE</label>
                          <input className="form-input" type="text" name="rqe" defaultValue={user?.rqe || ''} placeholder="ex: RQE 6789" />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Biografia Curta</label>
                        <textarea className="form-input" name="bio" defaultValue={user?.bio || ''} placeholder="Descreva sua formação e experiência profissional..." style={{ minHeight: '100px' }} />
                      </div>

                      {profileTeacherCrm.trim() !== '' && (
                        <div className="form-group mt-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input 
                            type="checkbox" 
                            id="teacher_is_homeopath" 
                            name="is_homeopath" 
                            defaultChecked={user?.is_homeopath} 
                            style={{ width: 'auto', margin: 0 }} 
                          />
                          <label htmlFor="teacher_is_homeopath" className="cursor-pointer" style={{ fontWeight: '500' }}>
                            Quero participar da lista de Homeopatas indicados
                          </label>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                        <button className="btn btn-primary" type="submit">Atualizar Meus Dados</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PÁGINA: DASHBOARD DO ADMINISTRADOR */}
        {currentPage === 'admin-dash' && (
          <div>
            <h1 className="font-serif-title mb-5">Painel Administrativo da Homeopatia EAD</h1>

            <div className="student-panel-container">
              {/* Menu Lateral do Administrador */}
              <aside className="student-sidebar">
                <ul className="student-sidebar-menu">
                  <li className={`student-sidebar-item ${adminActiveTab === 'stats' ? 'active' : ''}`}>
                    <button onClick={() => setAdminActiveTab('stats')}>📊 Estatísticas & OFX</button>
                  </li>
                  <li className={`student-sidebar-item ${adminActiveTab === 'courses' ? 'active' : ''}`}>
                    <button onClick={() => setAdminActiveTab('courses')}>🌿 Gerenciar Cursos</button>
                  </li>
                  <li className={`student-sidebar-item ${adminActiveTab === 'books' ? 'active' : ''}`}>
                    <button onClick={() => setAdminActiveTab('books')}>📚 Gerenciar Livros</button>
                  </li>
                  <li className={`student-sidebar-item ${adminActiveTab === 'students' ? 'active' : ''}`}>
                    <button onClick={() => setAdminActiveTab('students')}>👥 Gerenciar Usuários</button>
                  </li>
                  <li className={`student-sidebar-item ${adminActiveTab === 'payments' ? 'active' : ''}`}>
                    <button onClick={() => setAdminActiveTab('payments')}>💳 Gerenciar Faturas</button>
                  </li>
                  <li className={`student-sidebar-item ${adminActiveTab === 'events' ? 'active' : ''}`}>
                    <button onClick={() => setAdminActiveTab('events')}>📅 Agenda / Eventos</button>
                  </li>
                  <li className={`student-sidebar-item ${adminActiveTab === 'logs' ? 'active' : ''}`}>
                    <button onClick={() => setAdminActiveTab('logs')}>🔒 Logs de Segurança</button>
                  </li>
                </ul>
              </aside>

              {/* Conteúdo da Aba Ativa */}
              <div className="student-panel-content">
                {adminActiveTab === 'stats' && (
                  <div>
                    {/* Widgets Financeiros */}
                    {adminReportData && (
                      <div className="admin-stats-grid" style={{ marginBottom: '2rem' }}>
                        <div className="admin-stat-card primary">
                          <span className="course-type-badge">Receita Total (Paga)</span>
                          <h2 className="stat-value">R$ {adminReportData.summary.totalReceived.toFixed(2)}</h2>
                        </div>
                        <div className="admin-stat-card warning">
                          <span className="course-type-badge">Receita em Aberto</span>
                          <h2 className="stat-value">R$ {adminReportData.summary.totalPending.toFixed(2)}</h2>
                        </div>
                        <div className="admin-stat-card error">
                          <span className="course-type-badge">Valores Vencidos</span>
                          <h2 className="stat-value">R$ {adminReportData.summary.totalOverdue.toFixed(2)}</h2>
                        </div>
                        <div className="admin-stat-card accent">
                          <span className="course-type-badge">Recorrência Mensal (MRR)</span>
                          <h2 className="stat-value">R$ {adminReportData.summary.mrr.toFixed(2)}</h2>
                        </div>
                      </div>
                    )}

                    <div className="admin-layout">
                      {/* Conciliação OFX */}
                      <div className="card">
                        <div className="quiz-header">
                          <h3>Conciliação Bancária (.OFX)</h3>
                          <button className="btn btn-secondary btn-quick-login" onClick={handleGenerateMockOfx}>
                            Gerar OFX de Teste
                          </button>
                        </div>
                        <p className="course-card-description mb-4">
                          Cole aqui o conteúdo textual do arquivo de extrato bancário (.OFX) para cruzar com as vendas no banco do LMS.
                        </p>
                        <form onSubmit={handleConciliation}>
                          <textarea
                            className="form-input ofx-textarea"
                            placeholder="Cole as tags XML do arquivo OFX ou use o botão 'Gerar OFX de Teste' acima..."
                            value={ofxInput}
                            onChange={(e) => setOfxInput(e.target.value)}
                            required
                          />
                          <button className="btn btn-primary w-full" type="submit">Processar Conciliação Financeira</button>
                        </form>
                        {conciliationResults && (
                          <div className="conciliation-results">
                            <h4 className="mb-2">Resultado do Extrato:</h4>
                            <div>Total Lançamentos: <strong>{conciliationResults.processedCount}</strong></div>
                            <div style={{ color: 'var(--color-success)' }}>✓ Conciliados: <strong>{conciliationResults.reconciled.length}</strong></div>
                            <div style={{ color: 'var(--color-warning)' }}>⚠️ Divergentes: <strong>{conciliationResults.divergent.length}</strong></div>
                            <div className="text-muted">✗ Não localizados: <strong>{conciliationResults.unmatched.length}</strong></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {adminActiveTab === 'courses' && (
                  <div className="card">
                    <div className="quiz-header mb-4">
                      <h3>Gerenciamento de Cursos Acadêmicos</h3>
                      <button className="btn btn-primary" onClick={() => setEditingCourse({})}>＋ Criar Novo Curso</button>
                    </div>

                    {editingCourse && (
                      <form onSubmit={handleSaveCourse} className="card p-5 mb-5" style={{ border: '1px solid var(--color-border)' }}>
                        <h4 className="mb-4">{editingCourse.id ? 'Editar Detalhes do Curso' : 'Cadastrar Novo Curso'}</h4>
                        <input type="hidden" name="id" defaultValue={editingCourse.id || ''} />
                        
                        <div className="form-group">
                          <label className="form-label">Título do Curso</label>
                          <input className="form-input" name="title" defaultValue={editingCourse.title || ''} required placeholder="ex: Introdução à Sensação Vital" />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Descrição</label>
                          <textarea className="form-input" name="description" defaultValue={editingCourse.description || ''} required placeholder="Descreva os objetivos do curso..." />
                        </div>

                        <div className="grid-2col">
                          <div className="form-group">
                            <label className="form-label">Tipo de Curso</label>
                            <select className="form-input" name="type" defaultValue={editingCourse.type || 'FREE'}>
                              <option value="FREE">FREE (Gratuito)</option>
                              <option value="SUBSCRIPTION">SUBSCRIPTION (Assinatura)</option>
                              <option value="POSTGRAD">POSTGRAD (Pós-Graduação)</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Duração de Acesso (Dias)</label>
                            <input className="form-input" type="number" name="duration_days" defaultValue={editingCourse.duration_days || 180} required />
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Mensagem de Conclusão</label>
                          <input className="form-input" name="finishing_message" defaultValue={editingCourse.finishing_message || ''} placeholder="Parabéns pela conclusão..." />
                        </div>

                        <div className="form-group">
                          <label className="form-label">ID do Professor Responsável</label>
                          <input className="form-input" name="teacher_id" defaultValue={editingCourse.teacher_id || 'teacher-id'} required />
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                          <button className="btn btn-secondary flex-1" type="button" onClick={() => setEditingCourse(null)}>Cancelar</button>
                          <button className="btn btn-primary flex-1" type="submit">Gravar Curso no LMS</button>
                        </div>
                      </form>
                    )}

                    <div className="table-responsive">
                      <table className="lms-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Título</th>
                            <th>Tipo</th>
                            <th>Duração (Dias)</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockDb.courses.map(c => (
                            <tr key={c.id}>
                              <td><code>{c.id}</code></td>
                              <td><strong>{c.title}</strong></td>
                              <td><span className="course-type-badge">{c.type}</span></td>
                              <td>{c.duration_days} dias</td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                  <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setEditingCourse(c)}>Editar</button>
                                  <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleDeleteCourse(c.id)}>Excluir</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {adminActiveTab === 'books' && (
                  <div className="card">
                    <div className="quiz-header mb-4">
                      <h3>Gerenciamento da Livraria (Livros)</h3>
                      <button className="btn btn-primary" onClick={() => setEditingBook({})}>＋ Adicionar Novo Livro</button>
                    </div>

                    {editingBook && (
                      <form onSubmit={handleSaveBook} className="card p-5 mb-5" style={{ border: '1px solid var(--color-border)' }}>
                        <h4 className="mb-4">{editingBook.id ? 'Editar Detalhes do Livro' : 'Adicionar Novo Livro'}</h4>
                        <input type="hidden" name="id" defaultValue={editingBook.id || ''} />
                        
                        <div className="form-group">
                          <label className="form-label">Título do Livro</label>
                          <input className="form-input" name="title" defaultValue={editingBook.title || ''} required placeholder="ex: O Método das Oito Caixas" />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Autor</label>
                          <input className="form-input" name="author" defaultValue={editingBook.author || ''} required placeholder="ex: Dr. Rajan Sankaran" />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Preço (R$)</label>
                          <input className="form-input" type="number" step="0.01" name="price" defaultValue={editingBook.price || 0.00} required />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Descrição Curta</label>
                          <textarea className="form-input" name="desc" defaultValue={editingBook.desc || ''} required placeholder="Escreva um resumo da obra didática..." />
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                          <button className="btn btn-secondary flex-1" type="button" onClick={() => setEditingBook(null)}>Cancelar</button>
                          <button className="btn btn-primary flex-1" type="submit">Gravar Livro</button>
                        </div>
                      </form>
                    )}

                    <div className="table-responsive">
                      <table className="lms-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Título</th>
                            <th>Autor</th>
                            <th>Preço</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {books.map(b => (
                            <tr key={b.id}>
                              <td><code>{b.id}</code></td>
                              <td><strong>{b.title}</strong></td>
                              <td>{b.author}</td>
                              <td><strong>R$ {b.price.toFixed(2)}</strong></td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                  <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setEditingBook(b)}>Editar</button>
                                  <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleDeleteBook(b.id)}>Excluir</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {adminActiveTab === 'students' && (
                  <div className="card">
                    <div className="quiz-header mb-4">
                      <h3>Gerenciamento de Usuários</h3>
                      <button className="btn btn-primary" onClick={startAddUser}>＋ Adicionar Novo Usuário</button>
                    </div>
                    <p className="course-card-description mb-4">
                      Adicione, edite, ative ou suspenda contas de usuários (alunos, professores e administradores) da plataforma.
                    </p>

                    {editingUser && (
                      <form onSubmit={handleSaveUser} className="card p-5 mb-5" style={{ border: '1px solid var(--color-border)' }}>
                        <h4 className="mb-4">{editingUser.id ? 'Editar Detalhes do Usuário' : 'Cadastrar Novo Usuário'}</h4>
                        <input type="hidden" name="id" defaultValue={editingUser.id || ''} />
                        
                        <div className="grid-2col">
                          <div className="form-group">
                            <label className="form-label">Nome Completo</label>
                            <input className="form-input" name="name" defaultValue={editingUser.name || ''} required placeholder="ex: Dr. Rajan Sankaran" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">E-mail (Login)</label>
                            <input className="form-input" type="email" name="email" defaultValue={editingUser.email || ''} required placeholder="ex: rajan@tosb.com" />
                          </div>
                        </div>

                        <div className="grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                          <div className="form-group">
                            <label className="form-label">Senha de Acesso</label>
                            <input className="form-input" type="password" name="password" defaultValue={editingUser.password || 'senha123'} required placeholder="Mínimo 6 caracteres" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Função / Perfil</label>
                            <select 
                              className="form-input" 
                              name="role" 
                              value={formUserRole} 
                              onChange={(e) => setFormUserRole(e.target.value)}
                            >
                              <option value="STUDENT">Aluno (Profissional de Saúde)</option>
                              <option value="TEACHER">Professor Colaborador</option>
                              <option value="ADMIN">Administrador</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Status da Conta</label>
                            <select className="form-input" name="status" defaultValue={editingUser.status || 'ACTIVE'}>
                              <option value="ACTIVE">Ativo / Liberado</option>
                              <option value="SUSPENDED">Suspenso / Inativo</option>
                            </select>
                          </div>
                        </div>

                        {/* Campos Dinâmicos baseados na Função */}
                        {formUserRole === 'STUDENT' && (
                          <div className="grid-2col" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem' }}>
                            <div className="form-group">
                              <label className="form-label">Tipo de Registro Acadêmico/Conselho</label>
                              <select 
                                className="form-input" 
                                name="registrationType" 
                                value={adminRegType}
                                onChange={(e) => setAdminRegType(e.target.value)}
                              >
                                <option value="CRM">CRM (Medicina)</option>
                                <option value="CRO">CRO (Odontologia)</option>
                                <option value="CRF">CRF (Farmácia)</option>
                                <option value="CRMV">CRMV (Veterinária)</option>
                                <option value="Outros">Outros Conselhos</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label className="form-label">Número do Conselho</label>
                              <input 
                                className="form-input" 
                                name="registrationNumber" 
                                value={adminRegNumber}
                                onChange={(e) => setAdminRegNumber(e.target.value)}
                                required 
                                placeholder="ex: 12345-PR" 
                              />
                            </div>
                          </div>
                        )}

                        {formUserRole === 'TEACHER' && (
                          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '1rem' }}>
                            <div className="grid-2col">
                              <div className="form-group">
                                <label className="form-label">CRM / Conselho</label>
                                <input 
                                  className="form-input" 
                                  name="crm" 
                                  value={adminTeacherCrm}
                                  onChange={(e) => setAdminTeacherCrm(e.target.value)}
                                  required 
                                  placeholder="ex: CRM-PR 12345" 
                                />
                              </div>
                              <div className="form-group">
                                <label className="form-label">RQE (Registro de Especialidade)</label>
                                <input className="form-input" name="rqe" defaultValue={editingUser.rqe || ''} placeholder="ex: RQE 6789 (Homeopatia)" />
                              </div>
                            </div>
                            <div className="form-group">
                              <label className="form-label">Biografia Curta</label>
                              <textarea className="form-input" name="bio" defaultValue={editingUser.bio || ''} placeholder="Mini-currículo ou especialidades do docente..." />
                            </div>
                          </div>
                        )}

                        {((formUserRole === 'STUDENT' && adminRegType && adminRegType.toUpperCase() !== 'OUTROS' && adminRegNumber && adminRegNumber.trim() !== '') || 
                          (formUserRole === 'TEACHER' && adminTeacherCrm && adminTeacherCrm.trim() !== '')) && (
                          <div className="form-group mt-3 mb-3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input 
                              type="checkbox" 
                              id="admin_is_homeopath" 
                              name="is_homeopath" 
                              defaultChecked={editingUser.is_homeopath || false} 
                              style={{ width: 'auto', margin: 0 }} 
                            />
                            <label htmlFor="admin_is_homeopath" className="cursor-pointer" style={{ fontWeight: '500' }}>
                              Quero participar da lista de Homeopatas indicados
                            </label>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                          <button className="btn btn-secondary flex-1" type="button" onClick={() => setEditingUser(null)}>Cancelar</button>
                          <button className="btn btn-primary flex-1" type="submit">Gravar Usuário</button>
                        </div>
                      </form>
                    )}

                    <div className="table-responsive">
                      <table className="lms-table">
                        <thead>
                          <tr>
                            <th>Nome</th>
                            <th>Função</th>
                            <th>Cadastro / E-mail</th>
                            <th>Status</th>
                            <th>Histórico de Testes</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockDb.users.map(s => {
                            const hasAttempts = mockDb.quiz_attempts[`${s.id}_quiz-p1`] || null;
                            return (
                              <tr key={s.id}>
                                <td><strong>{s.name}</strong></td>
                                <td>
                                  <span className="course-type-badge">{s.role === 'STUDENT' ? 'Aluno' : s.role === 'TEACHER' ? 'Professor' : 'Administrador'}</span>
                                </td>
                                <td>
                                  <div>{s.email}</div>
                                  {s.role === 'STUDENT' && s.registrationType && (
                                    <small className="text-muted">{s.registrationType}: {s.registrationNumber}</small>
                                  )}
                                  {s.role === 'TEACHER' && s.crm && (
                                    <small className="text-muted">{s.crm} / {s.rqe || 'Sem RQE'}</small>
                                  )}
                                </td>
                                <td>
                                  <span className={s.status === 'ACTIVE' ? 'badge-status-active' : 'badge-status-suspended'}>
                                    {s.status === 'ACTIVE' ? 'Ativo' : 'Suspenso'}
                                  </span>
                                </td>
                                <td>
                                  {s.role === 'STUDENT' ? (
                                    hasAttempts ? (
                                      <div>
                                        <span style={{ fontSize: '0.85rem' }}>Quiz Pós: <strong>{hasAttempts.attempts_count}</strong> tentativa(s)</span>
                                        <button 
                                          className="btn btn-secondary mt-1 w-full" 
                                          style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }} 
                                          onClick={() => resetQuizAttempts(s.id, 'quiz-p1')}
                                        >
                                          Reiniciar
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-muted" style={{ fontSize: '0.85rem' }}>Nenhuma tentativa</span>
                                    )
                                  ) : (
                                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>N/A</span>
                                  )}
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => startEditUser(s)}>Editar</button>
                                    {s.id !== user.id ? (
                                      <button 
                                        className={`btn ${s.status === 'ACTIVE' ? 'btn-danger' : 'btn-primary'}`} 
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                        onClick={() => toggleUserStatus(s.id)}
                                      >
                                        {s.status === 'ACTIVE' ? 'Suspender' : 'Ativar'}
                                      </button>
                                    ) : (
                                      <span className="text-muted" style={{ fontSize: '0.85rem' }}>Sua Conta</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {adminActiveTab === 'payments' && (
                  <div className="card">
                    <div className="quiz-header mb-4">
                      <h3>Gerenciamento de Faturas e Cobranças</h3>
                      <button className="btn btn-primary" onClick={() => setEditingPayment({})}>＋ Criar Nova Fatura</button>
                    </div>
                    <p className="course-card-description mb-4">
                      Visualize o status das cobranças geradas pelo sistema EAD, edite seus dados ou simule/confirme o recebimento manualmente.
                    </p>

                    {editingPayment && (
                      <form onSubmit={handleSavePayment} className="card p-5 mb-5" style={{ border: '1px solid var(--color-border)' }}>
                        <h4 className="mb-4">{editingPayment.id ? 'Editar Fatura' : 'Criar Nova Fatura'}</h4>
                        <input type="hidden" name="id" defaultValue={editingPayment.id || ''} />

                        <div className="grid-2col">
                          <div className="form-group">
                            <label className="form-label">Selecionar Aluno (Responsável)</label>
                            <select className="form-input" name="student_id" defaultValue={editingPayment.student_id || ''} required>
                              <option value="" disabled>-- Selecione o Aluno --</option>
                              {mockDb.users.filter(u => u.role === 'STUDENT').map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Curso Associado (Opcional)</label>
                            <select className="form-input" name="course_id" defaultValue={editingPayment.course_id || ''}>
                              <option value="">Nenhum / Avulso / Livro</option>
                              {mockDb.courses.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                          <div className="form-group">
                            <label className="form-label">Valor (R$)</label>
                            <input className="form-input" type="number" step="0.01" name="amount" defaultValue={editingPayment.amount || 0.00} required placeholder="0.00" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Forma de Pagamento</label>
                            <select className="form-input" name="payment_method" defaultValue={editingPayment.payment_method || 'PIX'}>
                              <option value="PIX">Pix</option>
                              <option value="BOLETO">Boleto Bancário</option>
                              <option value="CREDIT_CARD">Cartão de Crédito</option>
                              <option value="CARNE">Carnê</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Status da Fatura</label>
                            <select className="form-input" name="status" defaultValue={editingPayment.status || 'PENDING'}>
                              <option value="PENDING">PENDING (Pendente)</option>
                              <option value="RECEIVED">RECEIVED (Pago)</option>
                              <option value="OVERDUE">OVERDUE (Vencido)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid-2col">
                          <div className="form-group">
                            <label className="form-label">Data de Vencimento</label>
                            <input className="form-input" type="date" name="due_date" defaultValue={editingPayment.due_date || ''} required />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Código de Transação / Referência</label>
                            <input className="form-input" name="transaction_code" defaultValue={editingPayment.transaction_code || ''} placeholder="Gerado automaticamente se vazio" />
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                          <button className="btn btn-secondary flex-1" type="button" onClick={() => setEditingPayment(null)}>Cancelar</button>
                          <button className="btn btn-primary flex-1" type="submit">Gravar Fatura</button>
                        </div>
                      </form>
                    )}

                    <div className="table-responsive">
                      <table className="lms-table">
                        <thead>
                          <tr>
                            <th>Ref / Transação</th>
                            <th>Aluno</th>
                            <th>Valor</th>
                            <th>Método</th>
                            <th>Vencimento</th>
                            <th>Status</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockDb.payments.map(p => {
                            const student = mockDb.users.find(u => u.id === p.student_id);
                            return (
                              <tr key={p.id}>
                                <td>
                                  <small><code>{p.transaction_code || p.id}</code></small>
                                </td>
                                <td>
                                  <strong>{student ? student.name : 'Aluno Removido'}</strong>
                                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{student?.email}</div>
                                </td>
                                <td><strong>R$ {p.amount.toFixed(2)}</strong></td>
                                <td><span className="course-type-badge">{p.payment_method}</span></td>
                                <td>{p.due_date ? new Date(p.due_date).toLocaleDateString('pt-BR') : '-'}</td>
                                <td>
                                  <span className={p.status === 'RECEIVED' ? 'badge-paid' : p.status === 'OVERDUE' ? 'badge-overdue' : 'badge-pending'}>
                                    {p.status}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setEditingPayment(p)}>Editar</button>
                                    {p.status !== 'RECEIVED' ? (
                                      <button 
                                        className="btn btn-primary" 
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                        onClick={() => simulatePaymentConfirm(p.id)}
                                      >
                                        Confirmar
                                      </button>
                                    ) : (
                                      <span className="text-muted" style={{ fontSize: '0.85rem' }}>Pago {p.paid_at ? new Date(p.paid_at).toLocaleDateString('pt-BR') : '-'}</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {adminActiveTab === 'classes' && (
                  <div className="card">
                    <div className="quiz-header mb-4">
                      <h3>Gerenciamento de Turmas</h3>
                      <button className="btn btn-primary" onClick={() => setEditingClass({})}>＋ Criar Nova Turma</button>
                    </div>
                    <p className="course-card-description mb-4">
                      Crie turmas baseadas em cursos, defina os limites máximos de alunos e professores, e aloque-os para a turma.
                    </p>

                    {editingClass && (
                      <form onSubmit={handleSaveClass} className="card p-5 mb-5" style={{ border: '1px solid var(--color-border)' }}>
                        <h4 className="mb-4">{editingClass.id ? 'Editar Detalhes da Turma' : 'Criar Nova Turma'}</h4>
                        <input type="hidden" name="id" defaultValue={editingClass.id || ''} />

                        <div className="grid-2col">
                          <div className="form-group">
                            <label className="form-label">Nome da Turma</label>
                            <input className="form-input" name="name" defaultValue={editingClass.name || ''} required placeholder="ex: Turma Alfa - Sensação Vital 2026" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Curso Associado</label>
                            <select className="form-input" name="course_id" defaultValue={editingClass.course_id || ''} required>
                              <option value="" disabled>-- Selecione o Curso --</option>
                              {mockDb.courses.map(c => (
                                <option key={c.id} value={c.id}>{c.title} ({c.type})</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Abas/Campos de Limites */}
                        <div className="grid-2col" style={{ margin: '1rem 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '1rem 0' }}>
                          <div className="form-group">
                            <label className="form-label">📊 Limite Máximo de Alunos (0 para ilimitado)</label>
                            <input className="form-input" type="number" name="max_students" defaultValue={editingClass.max_students || 0} required />
                          </div>
                          <div className="form-group">
                            <label className="form-label">👥 Limite Máximo de Professores (0 para ilimitado)</label>
                            <input className="form-input" type="number" name="max_teachers" defaultValue={editingClass.max_teachers || 0} required />
                          </div>
                        </div>

                        {/* Alocação de Professores e Alunos */}
                        <div className="grid-2col" style={{ gap: '2rem' }}>
                          <div>
                            <h5 className="mb-2" style={{ fontWeight: 'bold' }}>Alocar Professores</h5>
                            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--color-border)', padding: '0.5rem', borderRadius: '4px' }}>
                              {mockDb.users.filter(u => u.role === 'TEACHER').map(u => {
                                const isChecked = (editingClass.teacher_ids || []).includes(u.id);
                                return (
                                  <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                                    <input type="checkbox" name="teacher_ids" value={u.id} defaultChecked={isChecked} />
                                    <span>{u.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                          <div>
                            <h5 className="mb-2" style={{ fontWeight: 'bold' }}>Alocar Alunos</h5>
                            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--color-border)', padding: '0.5rem', borderRadius: '4px' }}>
                              {mockDb.users.filter(u => u.role === 'STUDENT').map(u => {
                                const isChecked = (editingClass.student_ids || []).includes(u.id);
                                return (
                                  <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                                    <input type="checkbox" name="student_ids" value={u.id} defaultChecked={isChecked} />
                                    <span>{u.name} ({u.email})</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                          <button className="btn btn-secondary flex-1" type="button" onClick={() => setEditingClass(null)}>Cancelar</button>
                          <button className="btn btn-primary flex-1" type="submit">Gravar Turma</button>
                        </div>
                      </form>
                    )}

                    <div className="table-responsive">
                      <table className="lms-table">
                        <thead>
                          <tr>
                            <th>Nome da Turma</th>
                            <th>Curso Associado</th>
                            <th>Professores</th>
                            <th>Alunos Alocados</th>
                            <th>Limites (Alunos/Profs)</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(mockDb.classes || []).map(c => {
                            const course = mockDb.courses.find(course => course.id === c.course_id);
                            const teachers = mockDb.users.filter(u => (c.teacher_ids || []).includes(u.id));
                            const studentsCount = (c.student_ids || []).length;
                            return (
                              <tr key={c.id}>
                                <td><strong>{c.name}</strong></td>
                                <td>{course ? course.title : 'Curso Removido'}</td>
                                <td>
                                  {teachers.map(t => <div key={t.id} style={{ fontSize: '0.85rem' }}>👨‍🏫 {t.name}</div>)}
                                  {teachers.length === 0 && <span className="text-muted">Nenhum</span>}
                                </td>
                                <td>
                                  <strong>{studentsCount}</strong> aluno(s)
                                </td>
                                <td>
                                  <div>Máx Alunos: {c.max_students > 0 ? c.max_students : 'Ilimitado'}</div>
                                  <div>Máx Profs: {c.max_teachers > 0 ? c.max_teachers : 'Ilimitado'}</div>
                                </td>
                                <td>
                                  <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setEditingClass(c)}>Editar</button>
                                </td>
                              </tr>
                            );
                          })}
                          {(mockDb.classes || []).length === 0 && (
                            <tr>
                              <td colSpan="6" className="text-center text-muted" style={{ padding: '2rem' }}>
                                Nenhuma turma criada ainda.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {adminActiveTab === 'events' && (
                  <div>
                    {/* Criar Evento */}
                    <div className="card mb-6">
                      <h3 className="mb-4">Adicionar Evento Científico</h3>
                      <form onSubmit={handleCreateEvent} className="grid-2col" style={{ gap: '1rem' }}>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                          <label className="form-label">Título do Evento</label>
                          <input className="form-input" name="title" required placeholder="Lançamento do Livro X / Grupo de Estudos" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Tipo de Evento</label>
                          <select className="form-input" name="type">
                            <option value="Lançamento de Livro">Lançamento de Livro</option>
                            <option value="Grupo de Estudos">Grupo de Estudos</option>
                            <option value="Seminário Literário">Seminário Literário</option>
                            <option value="Aula Magna">Aula Magna</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Localização / Link</label>
                          <input className="form-input" name="location" required placeholder="ex: Online via Zoom / Curitiba - PR" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Dia (ex: 15)</label>
                          <input className="form-input" name="day" required placeholder="ex: 15" maxLength="2" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Mês (ex: Set)</label>
                          <input className="form-input" name="month" required placeholder="ex: Set" maxLength="3" />
                        </div>
                        <div style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
                          <button className="btn btn-primary w-full" type="submit">Cadastrar Evento na Agenda</button>
                        </div>
                      </form>
                    </div>

                    {/* Listagem de Eventos */}
                    <div className="card">
                      <h3 className="mb-4">Eventos Programados</h3>
                      <div className="table-responsive">
                        <table className="lms-table">
                          <thead>
                            <tr>
                              <th>Data</th>
                              <th>Tipo</th>
                              <th>Título</th>
                              <th>Local</th>
                              <th>Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(mockDb.events || []).map(event => (
                              <tr key={event.id}>
                                <td><strong>{event.day} {event.month}</strong></td>
                                <td><span className="course-type-badge">{event.type}</span></td>
                                <td><strong>{event.title}</strong></td>
                                <td>{event.location}</td>
                                <td>
                                  <button 
                                    className="btn btn-danger" 
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                    onClick={() => handleDeleteEvent(event.id)}
                                  >
                                    Excluir
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {(mockDb.events || []).length === 0 && (
                              <tr>
                                <td colSpan="5" className="text-center text-muted" style={{ padding: '2rem' }}>Nenhum evento agendado.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {adminActiveTab === 'logs' && (
                  <div className="card flex-col">
                    <h3>Registros de Acesso e Segurança</h3>
                    <p className="course-card-description mb-4">
                      Auditoria em tempo real de IPs, agentes de usuário e travas de segurança acionadas.
                    </p>
                    <div className="logs-container">
                      {securityLogs.length === 0 ? (
                        <p className="course-card-description text-center mt-3">Nenhum log registrado.</p>
                      ) : (
                        securityLogs.map((log, idx) => (
                          <div key={idx} className="log-item">
                            <div className="invoice-footer mb-1">
                              <span className="invoice-title mb-0">{log.user_name || 'Sistema'}</span>
                              <span className="text-muted">{new Date(log.created_at).toLocaleTimeString('pt-BR')}</span>
                            </div>
                            <div className="invoice-footer">
                              <span className={`badge-log-type ${log.content_accessed === 'CONCURRENT_LOGIN_LOCKOUT' ? 'lockout' : ''}`}>
                                {log.content_accessed}
                              </span>
                              <span className="helper-text">IP: {log.ip_address}</span>
                            </div>
                            <small className="invoice-ref mt-1">{log.user_agent}</small>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
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
            <p className="footer-about-text">
              Plataforma autorizada The Other Song no Brasil. Compromisso científico no ensino acadêmico da Homeopatia e do Método Sensação.
            </p>
          </div>
          <div className="footer-section">
            <h4>Cursos Livres</h4>
            <ul className="footer-links">
              <li><a href={getLinkHref('course-detail', 'id=course-free')} className="footer-link" onClick={(e) => { e.preventDefault(); clearAlerts(); navigateTo('course-detail', 'id=course-free'); }}>Princípios da Homeopatia</a></li>
              <li><a href={getLinkHref('course-detail', 'id=course-free')} className="footer-link" onClick={(e) => { e.preventDefault(); clearAlerts(); navigateTo('course-detail', 'id=course-free'); }}>Introdução à Sensação Vital</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Pós-Graduação</h4>
            <ul className="footer-links">
              <li><a href={getLinkHref('course-detail', 'id=course-post')} className="footer-link" onClick={(e) => { e.preventDefault(); clearAlerts(); navigateTo('course-detail', 'id=course-post'); }}>Especialização Médica</a></li>
              <li><a href={getLinkHref('synergy')} className="footer-link" onClick={(e) => handleLinkClick(e, 'synergy')}>Repertorização Digital</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contato e Suporte</h4>
            <p className="footer-contact-text">
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
      {/* Botão Flutuante do WhatsApp */}
      <a 
        href="https://wa.me/5541991112233" 
        className={`whatsapp-float-btn animate-fade-in ${!showWhatsappText ? 'text-hidden' : ''}`}
        target="_blank" 
        rel="noopener noreferrer"
        title="Fale Conosco no WhatsApp"
      >
        <svg className="whatsapp-icon-svg" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.578 1.98 14.116.953 11.49.951 6.058.951 1.632 5.321 1.628 10.75c-.001 1.71.463 3.384 1.34 4.877l-.994 3.633 3.737-.981zM17.11 13.99c-.27-.135-1.597-.788-1.846-.878-.25-.09-.432-.135-.612.135-.18.27-.697.878-.855 1.058-.158.18-.315.202-.585.067-.27-.135-1.14-.42-2.172-1.34-.803-.717-1.346-1.603-1.503-1.872-.158-.27-.017-.417.118-.552.122-.122.27-.315.405-.472.135-.158.18-.27.27-.45.09-.18.045-.337-.022-.472-.068-.135-.612-1.474-.838-2.016-.22-.53-.442-.459-.612-.468-.158-.008-.338-.008-.517-.008-.18 0-.473.067-.72.337-.247.27-.945.923-.945 2.25 0 1.328.968 2.61 1.103 2.79.135.18 1.902 2.905 4.608 4.07 1.1.474 1.88.66 2.532.766.702.112 1.34.08 1.843.005.56-.083 1.598-.653 1.822-1.282.225-.63.225-1.17.158-1.282-.068-.113-.248-.18-.518-.315z"/>
        </svg>
        <span className={`whatsapp-text ${!showWhatsappText ? 'hidden' : ''}`}>Fale Conosco</span>
      </a>
    </div>
  );
}

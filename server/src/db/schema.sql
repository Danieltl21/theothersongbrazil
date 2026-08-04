-- Habilitar extensão pgcrypto para uuid_generate_v4 se necessário
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de Usuários Unificada
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'TEACHER', 'STUDENT')),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_homeopath BOOLEAN NOT NULL DEFAULT FALSE,
    phone VARCHAR(50),
    cpf VARCHAR(50),
    profession VARCHAR(100),
    custom_profession VARCHAR(255),
    council_type VARCHAR(50),
    council_number VARCHAR(50),
    council_state VARCHAR(50),
    specialty VARCHAR(255),
    rqe VARCHAR(50),
    bio TEXT,
    -- Endereço de Cobrança
    billing_zip VARCHAR(20),
    billing_street VARCHAR(255),
    billing_number VARCHAR(50),
    billing_complement VARCHAR(255),
    billing_neighborhood VARCHAR(100),
    billing_city VARCHAR(100),
    billing_state VARCHAR(50),
    -- Endereço Comercial
    commercial_zip VARCHAR(20),
    commercial_street VARCHAR(255),
    commercial_number VARCHAR(50),
    commercial_complement VARCHAR(255),
    commercial_neighborhood VARCHAR(100),
    commercial_city VARCHAR(100),
    commercial_state VARCHAR(50),
    commercial_phone VARCHAR(50),
    -- Termos
    terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    terms_accepted_at TIMESTAMP WITH TIME ZONE,
    general_terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    general_terms_accepted_at TIMESTAMP WITH TIME ZONE
);

-- Garantir que todas as colunas novas existam caso a tabela já tenha sido criada antes
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profession VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_profession VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS council_type VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS council_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS council_state VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialty VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS rqe VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_zip VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_street VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_complement VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_neighborhood VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_state VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS commercial_zip VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS commercial_street VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS commercial_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS commercial_complement VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS commercial_neighborhood VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS commercial_city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS commercial_state VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS commercial_phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS general_terms_accepted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS general_terms_accepted_at TIMESTAMP WITH TIME ZONE;

-- Remover tabelas antigas se não contiverem funcionalidade relevante
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS teacher_profiles CASCADE;

-- Tabela de Cursos
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('FREE', 'SUBSCRIPTION', 'POSTGRAD')),
    duration_days INTEGER NOT NULL DEFAULT 180,
    finishing_message TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Módulos
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0
);

-- Tabela de Aulas
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    video_url VARCHAR(255) NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    display_order INTEGER NOT NULL DEFAULT 0
);

-- Tabela de Matrículas (Acessos dos alunos)
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'SUSPENDED'))
);

-- Tabela de Pagamentos
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    asaas_payment_id VARCHAR(255),
    transaction_code VARCHAR(255) UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('CREDIT_CARD', 'PIX', 'BOLETO', 'CARNE', 'TRANSFER')),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RECEIVED', 'OVERDUE', 'REFUNDED')),
    due_date DATE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    receipt_proof_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Atualizar CHECK constraint se já existir para permitir TRANSFER
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_method_check;
ALTER TABLE payments ADD CONSTRAINT payments_payment_method_check CHECK (payment_method IN ('CREDIT_CARD', 'PIX', 'BOLETO', 'CARNE', 'TRANSFER'));
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_proof_url TEXT;

-- Tabela de Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    max_attempts INTEGER NOT NULL DEFAULT 2,
    passing_score DECIMAL(5, 2) NOT NULL DEFAULT 70.00
);

-- Tabela de Questões do Quiz
CREATE TABLE IF NOT EXISTS quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Lista de alternativas ['Alt A', 'Alt B', 'Alt C']
    correct_option_index INTEGER NOT NULL
);

-- Tabela de Tentativas do Quiz
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    score DECIMAL(5, 2) NOT NULL,
    passed BOOLEAN NOT NULL,
    attempt_number INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Progresso da Aula
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    seconds_watched INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_lesson UNIQUE (student_id, lesson_id)
);

-- Tabela de Logs de Acesso e Segurança
CREATE TABLE IF NOT EXISTS access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(100) NOT NULL,
    user_agent VARCHAR(255),
    content_accessed VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para gerenciar sessões ativas (Prevenção de compartilhamento de senhas)
CREATE TABLE IF NOT EXISTS active_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    ip_address VARCHAR(100) NOT NULL,
    user_agent VARCHAR(255),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados iniciais (Seed)
-- Senha de teste padrão criptografada com bcryptjs para 'senha123': $2a$10$tZ2R.211U5H52PuxFpU9/.B3vR.pT9oIq0Jocd4i4oN2rQzW7aFjC
-- Admin
INSERT INTO users (id, name, email, password_hash, role, status, is_homeopath)
VALUES ('a1111111-1111-1111-1111-111111111111', 'Admin Principal', 'admin@lms.com', '$2a$10$tZ2R.211U5H52PuxFpU9/.B3vR.pT9oIq0Jocd4i4oN2rQzW7aFjC', 'ADMIN', 'ACTIVE', FALSE)
ON CONFLICT (email) DO NOTHING;

-- Professor
INSERT INTO users (id, name, email, password_hash, role, status, is_homeopath, profession, council_type, council_state, council_number, rqe, bio)
VALUES (
    'b2222222-2222-2222-2222-222222222222',
    'Dr. Carlos Eduardo (TOSB)',
    'carlos@tosb.com',
    '$2a$10$tZ2R.211U5H52PuxFpU9/.B3vR.pT9oIq0Jocd4i4oN2rQzW7aFjC',
    'TEACHER',
    'ACTIVE',
    FALSE,
    'médico(a)',
    'CRM',
    'PR',
    '12345',
    '6789',
    'Médico Homeopata, Diretor e Professor Especialista no Método Sensação.'
)
ON CONFLICT (email) DO NOTHING;

-- Aluno
INSERT INTO users (id, name, email, password_hash, role, status, is_homeopath, profession, council_type, council_number, council_state, terms_accepted, terms_accepted_at, general_terms_accepted, general_terms_accepted_at)
VALUES (
    'c3333333-3333-3333-3333-333333333333',
    'Dra. Ana Paula (Aluna)',
    'ana@lms.com',
    '$2a$10$tZ2R.211U5H52PuxFpU9/.B3vR.pT9oIq0Jocd4i4oN2rQzW7aFjC',
    'STUDENT',
    'ACTIVE',
    FALSE,
    'médico(a)',
    'CRM',
    '98765',
    'SP',
    TRUE,
    CURRENT_TIMESTAMP,
    TRUE,
    CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- Cursos Iniciais
-- 1. Curso Livre
INSERT INTO courses (id, title, description, type, duration_days, finishing_message, teacher_id, active)
VALUES (
    'd4444444-4444-4444-4444-444444444444',
    'Introdução à Homeopatia e Sensação Vital',
    'Curso livre sobre os princípios básicos da homeopatia clássica e as bases do Método Sensação da The Other Song.',
    'FREE',
    180,
    'Parabéns pela conclusão! Que os ensinamentos da Homeopatia e a busca pela sensação vital enriqueçam a sua prática clínica cotidiana.',
    'b2222222-2222-2222-2222-222222222222',
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- 2. Assinatura Mensal (Clube de Cursos)
INSERT INTO courses (id, title, description, type, duration_days, finishing_message, teacher_id, active)
VALUES (
    'e5555555-5555-5555-5555-555555555555',
    'Clube TOSB: Estudo Continuado de Matéria Médica',
    'Curso recorrente mensal focado no estudo aprofundado dos reinos animal, vegetal e mineral na clínica homeopática.',
    'SUBSCRIPTION',
    30, -- 1 mês por renovação recorrente
    'Parabéns por concluir mais um ciclo de estudos continuados em nossa Matéria Médica!',
    'b2222222-2222-2222-2222-222222222222',
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- 3. Pós-Graduação (Separado)
INSERT INTO courses (id, title, description, type, duration_days, finishing_message, teacher_id, active)
VALUES (
    'f6666666-6666-6666-6666-666666666666',
    'Pós-Graduação em Homeopatia Avançada - Método Sensação',
    'Especialização acadêmica stricto/lato sensu voltada para médicos, dentistas e profissionais da saúde com controle estrito de presença e quizzes.',
    'POSTGRAD',
    180,
    'Parabéns pela conquista do título de Especialista em Homeopatia Avançada! Sua dedicação científica eleva o nível da nossa prática médica.',
    'b2222222-2222-2222-2222-222222222222',
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- Módulos e Aulas do Curso Livre
INSERT INTO modules (id, course_id, title, display_order)
VALUES ('11111111-1111-1111-1111-111111111111', 'd4444444-4444-4444-4444-444444444444', 'Módulo 1: Fundamentos', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, module_id, title, video_url, duration_seconds, display_order)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'Aula 1: A Lei dos Semelhantes e a história',
    'https://www.w3schools.com/html/mov_bbb.mp4', -- Vídeo público simples para testes
    10, -- 10 segundos para testar progresso rápido
    1
) ON CONFLICT (id) DO NOTHING;

-- Módulos, Aulas e Quizzes da Pós-Graduação (Para testar bloqueios estritos)
INSERT INTO modules (id, course_id, title, display_order)
VALUES ('33333333-3333-3333-3333-333333333333', 'f6666666-6666-6666-6666-666666666666', 'Módulo de Especialização 1: Método Sensação na Prática', 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO lessons (id, module_id, title, video_url, duration_seconds, display_order)
VALUES (
    '44444444-4444-4444-4444-444444444444',
    '33333333-3333-3333-3333-333333333333',
    'Aula 1.1: O Conceito de Sensação Vital no Reino Vegetal',
    'https://www.w3schools.com/html/mov_bbb.mp4', -- Vídeo teste
    10, -- 10 segundos
    1
) ON CONFLICT (id) DO NOTHING;

-- Quiz associado à Aula 1.1
INSERT INTO quizzes (id, lesson_id, title, max_attempts, passing_score)
VALUES (
    '55555555-5555-5555-5555-555555555555',
    '44444444-4444-4444-4444-444444444444',
    'Quiz: Avaliação do Reino Vegetal e Sensação Vital',
    2,
    70.00
) ON CONFLICT (id) DO NOTHING;

-- Questões do Quiz
INSERT INTO quiz_questions (id, quiz_id, question_text, options, correct_option_index)
VALUES (
    '66666666-6666-6666-6666-666666666666',
    '55555555-5555-5555-5555-555555555555',
    'Qual é o foco principal do Método Sensação de Rajan Sankaran?',
    '["Identificar apenas sintomas locais", "Encontrar a Sensação Vital profunda que conecta mente e corpo", "Prescrever com base na cor da pele do paciente", "Nenhuma das anteriores"]'::jsonb,
    1
) ON CONFLICT (id) DO NOTHING;

INSERT INTO quiz_questions (id, quiz_id, question_text, options, correct_option_index)
VALUES (
    '77777777-7777-7777-7777-777777777777',
    '55555555-5555-5555-5555-555555555555',
    'A Sensação Vital expressa-se através de quais reinos da natureza?',
    '["Apenas Mineral", "Apenas Vegetal", "Vegetal, Mineral e Animal", "Nenhum reino da natureza"]'::jsonb,
    2
) ON CONFLICT (id) DO NOTHING;

-- Matrícula básica para o aluno testar
INSERT INTO enrollments (id, student_id, course_id, enrolled_at, expires_at, status)
VALUES (
    '88888888-8888-8888-8888-888888888888',
    'c3333333-3333-3333-3333-333333333333',
    'd4444444-4444-4444-4444-444444444444',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '180 days',
    'ACTIVE'
) ON CONFLICT (id) DO NOTHING;

-- Tabela de Livros da Livraria TOSB (Com Páginas e Relação de Conteúdo)
CREATE TABLE IF NOT EXISTS books (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    description TEXT,
    page_count INTEGER NOT NULL DEFAULT 0,
    content_table TEXT -- Sumário / Relação de Conteúdo em formato JSON ou texto
);
ALTER TABLE books ADD COLUMN IF NOT EXISTS page_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE books ADD COLUMN IF NOT EXISTS content_table TEXT;

-- Tabela de Liberações Temporárias para Alunos Inadimplentes (ADM)
CREATE TABLE IF NOT EXISTS temporary_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    days_valid INTEGER NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Formas de Recebimento de Professor por Curso
CREATE TABLE IF NOT EXISTS teacher_course_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('HOURLY', 'COMMISSION', 'FIXED')), -- 'hora_aula', 'comissao', 'valor_fixo'
    payment_rate DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_teacher_course UNIQUE (teacher_id, course_id)
);

-- Alterações adicionais em student_profiles e teacher_profiles
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS receive_promotions BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS bank_agency VARCHAR(50);
ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS bank_account VARCHAR(50);
ALTER TABLE teacher_profiles ADD COLUMN IF NOT EXISTS pix_key VARCHAR(100);

-- Tabela de Tokens de Redefinição de Senha
CREATE TABLE IF NOT EXISTS password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Campanhas Promocionais (E-mail Marketing ADM)
CREATE TABLE IF NOT EXISTS promotional_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target_course_id UUID REFERENCES courses(id) ON DELETE SET NULL, -- NULL para todos os alunos que aceitaram promoções
    sent_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



-- Tabela de Despesas (Saidas)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    paid_at DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE')),
    receipt_proof_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS paid_at DATE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS book_id UUID REFERENCES books(id) ON DELETE SET NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS description TEXT;

-- Tabela de Pagamentos a Professores (Honorarios)
CREATE TABLE IF NOT EXISTS teacher_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'OVERDUE')),
    receipt_proof_url TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);



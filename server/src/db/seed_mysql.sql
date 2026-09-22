-- Sementes Iniciais para Banco de Dados MySQL (LMS Homeopatia)

-- Limpeza preventiva de dados para recriação limpa (ordem respeitando chaves estrangeiras)
DELETE FROM `orders`;
DELETE FROM `enrollments`;
DELETE FROM `lessons`;
DELETE FROM `modules`;
DELETE FROM `courses`;
DELETE FROM `books`;
DELETE FROM `users`;
DELETE FROM `platform_settings`;

-- 1. Inserir Configurações Gerais
INSERT INTO `platform_settings` (`key`, `value`) VALUES
('site_title', 'The Other Song Brasil'),
('support_email', 'contato@theothersongbrazil.com.br'),
('asaas_environment', 'sandbox');

-- 2. Inserir Usuários (Senhas hash para 'senha123': $2a$10$w8T.NnK/Mv8g.R8V0sHwEu4H7T4b8bS.H/gHqg4oJ/H5uG5sV1YtG ou similar via bcrypt)
-- Administrador principal
INSERT INTO `users` (
    `id`, `name`, `email`, `password_hash`, `role`, `status`, `is_homeopath`, `phone`, `cpf`,
    `profession`, `billing_zip`, `billing_street`, `billing_number`, `billing_neighborhood`, `billing_city`, `billing_state`,
    `terms_accepted`, `general_terms_accepted`
) VALUES (
    'usr-admin-001', 'Administração TOSB', 'admin@theothersongbrazil.com.br',
    '$2a$10$q0.17hHn0e2HwS4lV0eBjeX/K4f/7D1s9T2g5H8j0K2l4M6n8P0qS', -- admin123 hash
    'ADMIN', 'ACTIVE', 1, '(11) 99999-0000', '000.000.000-00',
    'Administrador', '01310-100', 'Av. Paulista', '1000', 'Bela Vista', 'São Paulo', 'SP',
    1, 1
);

-- Professores
INSERT INTO `users` (
    `id`, `name`, `email`, `password_hash`, `role`, `status`, `is_homeopath`, `phone`, `cpf`,
    `profession`, `council_type`, `council_number`, `council_state`, `specialty`, `bio`,
    `billing_zip`, `billing_street`, `billing_number`, `billing_neighborhood`, `billing_city`, `billing_state`,
    `commercial_zip`, `commercial_street`, `commercial_number`, `commercial_neighborhood`, `commercial_city`, `commercial_state`, `commercial_phone`,
    `terms_accepted`, `general_terms_accepted`
) VALUES 
(
    'usr-teacher-001', 'Dr. Rajan Sankaran', 'rajan@theothersongbrazil.com.br',
    '$2a$10$q0.17hHn0e2HwS4lV0eBjeX/K4f/7D1s9T2g5H8j0K2l4M6n8P0qS',
    'TEACHER', 'ACTIVE', 1, '(11) 98888-1111', '111.111.111-11',
    'médico(a)', 'CRM', '123456', 'SP', 'Homeopatia Geral e Método Sensação',
    'Fundador da escola The Other Song e criador do Método Sensação Vital em Homeopatia.',
    '01310-200', 'Alameda Santos', '500', 'Jardins', 'São Paulo', 'SP',
    '01310-200', 'Alameda Santos', '500', 'Jardins', 'São Paulo', 'SP', '(11) 3333-1111',
    1, 1
),
(
    'usr-teacher-002', 'Prof. Lucas Miranda', 'lucas@theothersongbrazil.com.br',
    '$2a$10$q0.17hHn0e2HwS4lV0eBjeX/K4f/7D1s9T2g5H8j0K2l4M6n8P0qS',
    'TEACHER', 'ACTIVE', 1, '(21) 97777-2222', '222.222.222-22',
    'farmaceutico(a)', 'CRF', '654321', 'RJ', 'Homeopatia Farmacêutica e Matéria Médica',
    'Farmacêutico e pesquisador especialista em reinos homeopáticos e dinamização.',
    '22041-001', 'Av. Copacabana', '200', 'Copacabana', 'Rio de Janeiro', 'RJ',
    '22041-001', 'Av. Copacabana', '200', 'Copacabana', 'Rio de Janeiro', 'RJ', '(21) 2222-2222',
    1, 1
);

-- Alunos
INSERT INTO `users` (
    `id`, `name`, `email`, `password_hash`, `role`, `status`, `is_homeopath`, `phone`, `cpf`,
    `profession`, `council_type`, `council_number`, `council_state`, `specialty`,
    `billing_zip`, `billing_street`, `billing_number`, `billing_neighborhood`, `billing_city`, `billing_state`,
    `commercial_zip`, `commercial_street`, `commercial_number`, `commercial_neighborhood`, `commercial_city`, `commercial_state`, `commercial_phone`,
    `terms_accepted`, `general_terms_accepted`
) VALUES 
(
    'usr-student-001', 'Dra. Ana Paula Silva', 'anapaula@gmail.com',
    '$2a$10$q0.17hHn0e2HwS4lV0eBjeX/K4f/7D1s9T2g5H8j0K2l4M6n8P0qS',
    'STUDENT', 'ACTIVE', 1, '(11) 96666-3333', '333.333.333-33',
    'médico(a)', 'CRM', '98765', 'SP', 'Pediatria e Homeopatia',
    '04571-010', 'Rua Berrini', '150', 'Brooklin', 'São Paulo', 'SP',
    '04571-010', 'Rua Berrini', '150', 'Brooklin', 'São Paulo', 'SP', '(11) 4444-3333',
    1, 1
),
(
    'usr-student-002', 'Dr. Carlos Eduardo Rocha', 'carloseduardo@gmail.com',
    '$2a$10$q0.17hHn0e2HwS4lV0eBjeX/K4f/7D1s9T2g5H8j0K2l4M6n8P0qS',
    'STUDENT', 'ACTIVE', 1, '(31) 95555-4444', '444.444.444-44',
    'odontologista', 'CRO', '54321', 'MG', 'Odontologia Integrativa',
    '30130-000', 'Av. Afonso Pena', '800', 'Centro', 'Belo Horizonte', 'MG',
    '30130-000', 'Av. Afonso Pena', '800', 'Centro', 'Belo Horizonte', 'MG', '(31) 3333-4444',
    1, 1
);

-- 3. Inserir Cursos
INSERT INTO `courses` (
    `id`, `title`, `description`, `type`, `duration_days`, `finishing_message`, `active`, `teacher_id`
) VALUES 
(
    'course-pos-grad',
    'Pós-Graduação em Homeopatia Contemporânea e Método Sensação',
    'Formação completa e aprofundada nos conceitos vitais do Método Sensação, classificação dos reinos, miasmas e prática clínica avançada.',
    'POSTGRAD', 365,
    'Parabéns por concluir a Pós-Graduação em Homeopatia Contemporânea! Seu certificado oficial está disponível para download.',
    1, 'usr-teacher-001'
),
(
    'course-intro-sensacao',
    'Introdução ao Método Sensação de Rajan Sankaran',
    'Curso gratuito introdutório sobre os princípios de percepção da sensação vital e diferenciação do sintoma central no paciente.',
    'FREE', 90,
    'Parabéns! Você concluiu a Introdução ao Método Sensação. Continue sua jornada na Pós-Graduação.',
    1, 'usr-teacher-001'
),
(
    'course-miasmas-avancado',
    'Miasmas e Casos Clínicos Avançados',
    'Estudo prático dos dez miasmas homeopáticos com análise de vídeos de anamneses reais e tomada de caso passo a passo.',
    'SUBSCRIPTION', 180,
    'Módulo avançado concluído com sucesso!',
    1, 'usr-teacher-002'
);

-- 4. Inserir Módulos
INSERT INTO `modules` (`id`, `course_id`, `title`, `display_order`) VALUES 
('mod-pos-01', 'course-pos-grad', 'Módulo 1: Filosofia Vitalista e os 7 Níveis de Experiência', 1),
('mod-pos-02', 'course-pos-grad', 'Módulo 2: O Reino Vegetal e Sensações Opostas', 2),
('mod-pos-03', 'course-pos-grad', 'Módulo 3: O Reino Mineral e a Tabela Periódica', 3),
('mod-intro-01', 'course-intro-sensacao', 'Módulo Único: Conceitos Fundamentais', 1);

-- 5. Inserir Aulas
INSERT INTO `lessons` (`id`, `module_id`, `title`, `video_url`, `duration_seconds`, `display_order`) VALUES 
('les-pos-01', 'mod-pos-01', 'Aula 1: Apresentação do Método Sensação', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 2700, 1),
('les-pos-02', 'mod-pos-01', 'Aula 2: Os Sete Níveis da Experiência Humana', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 3600, 2),
('les-pos-03', 'mod-pos-02', 'Aula 1: A Anamnese no Reino Vegetal', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 3000, 1),
('les-pos-04', 'mod-pos-02', 'Aula 2: Diferenciação de Famílias Botânicas', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 3300, 2),
('les-intro-01', 'mod-intro-01', 'Aula Inaugural: O Que É a Sensação Vital?', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 1800, 1);

-- 6. Inserir Livros
INSERT INTO `books` (`id`, `title`, `author`, `image`, `price`, `desc`, `page_count`, `content_table`, `images`) VALUES 
(
    'book-esquema',
    'Esquema de Reinos e Subreinos 2.0',
    'Dr. Rajan Sankaran',
    'https://media-cldnry.s-nbcnews.com/image/upload/t_fit-760w,f_auto,q_auto:best/rockcms/2025-10/Mixbook-Photobook-471d52.jpg',
    220.00,
    'A obra clássica do Método Sensação atualizada com tabelas de referência e diferenciação rápida.',
    340,
    '["Capítulo 1: Classificação Vital", "Capítulo 2: Reino Vegetal", "Capítulo 3: Reino Mineral", "Capítulo 4: Reino Animal", "Capítulo 5: Tabelas Clínicas"]',
    '["https://placehold.co/600x800/2c3e50/ffffff?text=Capa+1", "https://placehold.co/600x800/e74c3c/ffffff?text=Capa+2"]'
),
(
    'book-superclasses',
    'Superclasses em Homeopatia',
    'Dr. Rajan Sankaran',
    'https://media-cldnry.s-nbcnews.com/image/upload/t_fit-760w,f_auto,q_auto:best/rockcms/2025-10/Mixbook-Photobook-471d52.jpg',
    180.00,
    'Entenda os caminhos da percepção vital através da divisão revolucionária em seis superclasses.',
    280,
    '["Capítulo 1: O Conceito de Superclasses", "Capítulo 2: Superclasse 1", "Capítulo 3: Superclasse 2", "Capítulo 4: Guia de Prescrição"]',
    '["https://placehold.co/600x800/27ae60/ffffff?text=Foto+1", "https://placehold.co/600x800/8e44ad/ffffff?text=Foto+2"]'
),
(
    'book-oito-caixas',
    'O Método das Oito Caixas',
    'Dr. Rajan Sankaran',
    'https://media-cldnry.s-nbcnews.com/image/upload/t_fit-760w,f_auto,q_auto:best/rockcms/2025-10/Mixbook-Photobook-471d52.jpg',
    240.00,
    'Um guia prático para integrar repertorização, sintomas locais, sensação e caminhos de cura no caso clínico.',
    410,
    '["Capítulo 1: Integração de Métodos", "Capítulo 2: Mapeamento de Caixas", "Capítulo 3: Evitando Erros", "Capítulo 4: 30 Casos Resolvidos"]',
    '["https://placehold.co/600x800/2980b9/ffffff?text=Imagem+A", "https://placehold.co/600x800/c0392b/ffffff?text=Imagem+B"]'
);

-- 7. Inserir Matrículas
INSERT INTO `enrollments` (`id`, `student_id`, `course_id`, `enrolled_at`, `expires_at`, `status`) VALUES 
(
    'enr-001', 'usr-student-001', 'course-pos-grad',
    NOW(), DATE_ADD(NOW(), INTERVAL 365 DAY), 'ACTIVE'
),
(
    'enr-002', 'usr-student-002', 'course-intro-sensacao',
    NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), 'ACTIVE'
);

-- 8. Inserir Pedidos de Exemplo
INSERT INTO `orders` (
    `id`, `student_id`, `course_id`, `book_id`, `item_type`, `total_amount`, `installments`, `payment_method`, `status`
) VALUES 
(
    'ord-001', 'usr-student-001', 'course-pos-grad', NULL, 'course',
    3500.00, 10, 'CREDIT_CARD', 'PAID'
),
(
    'ord-002', 'usr-student-001', NULL, 'book-esquema', 'book',
    220.00, 1, 'PIX', 'PAID'
);

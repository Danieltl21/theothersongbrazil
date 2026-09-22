-- Esquema de Banco de Dados MySQL para LMS Homeopatia (The Other Song Brasil)

CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('ADMIN', 'TEACHER', 'STUDENT') NOT NULL,
    `status` ENUM('ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `is_homeopath` TINYINT(1) NOT NULL DEFAULT 0,
    `phone` VARCHAR(50),
    `cpf` VARCHAR(50),
    `profession` VARCHAR(100),
    `custom_profession` VARCHAR(255),
    `council_type` VARCHAR(50),
    `council_number` VARCHAR(50),
    `council_state` VARCHAR(50),
    `specialty` VARCHAR(255),
    `rqe` VARCHAR(50),
    `bio` TEXT,
    `billing_zip` VARCHAR(20),
    `billing_street` VARCHAR(255),
    `billing_number` VARCHAR(50),
    `billing_complement` VARCHAR(255),
    `billing_neighborhood` VARCHAR(100),
    `billing_city` VARCHAR(100),
    `billing_state` VARCHAR(50),
    `commercial_zip` VARCHAR(20),
    `commercial_street` VARCHAR(255),
    `commercial_number` VARCHAR(50),
    `commercial_complement` VARCHAR(255),
    `commercial_neighborhood` VARCHAR(100),
    `commercial_city` VARCHAR(100),
    `commercial_state` VARCHAR(50),
    `commercial_phone` VARCHAR(50),
    `terms_accepted` TINYINT(1) NOT NULL DEFAULT 0,
    `terms_accepted_at` DATETIME NULL,
    `general_terms_accepted` TINYINT(1) NOT NULL DEFAULT 0,
    `general_terms_accepted_at` DATETIME NULL,
    `payout_currency` VARCHAR(10) DEFAULT 'BRL',
    `bank_name` VARCHAR(100),
    `bank_agency` VARCHAR(50),
    `bank_account` VARCHAR(50),
    `pix_key` VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `platform_settings` (
    `key` VARCHAR(100) PRIMARY KEY,
    `value` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `courses` (
    `id` VARCHAR(36) PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `type` ENUM('FREE', 'SUBSCRIPTION', 'POSTGRAD') NOT NULL,
    `duration_days` INT NOT NULL DEFAULT 180,
    `finishing_message` TEXT,
    `active` TINYINT(1) NOT NULL DEFAULT 1,
    `teacher_id` VARCHAR(36),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_courses_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `modules` (
    `id` VARCHAR(36) PRIMARY KEY,
    `course_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `display_order` INT NOT NULL DEFAULT 0,
    CONSTRAINT `fk_modules_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `lessons` (
    `id` VARCHAR(36) PRIMARY KEY,
    `module_id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `video_url` VARCHAR(255) NOT NULL,
    `duration_seconds` INT NOT NULL DEFAULT 0,
    `display_order` INT NOT NULL DEFAULT 0,
    CONSTRAINT `fk_lessons_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `books` (
    `id` VARCHAR(100) PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `author` VARCHAR(255) NOT NULL,
    `image` VARCHAR(500),
    `price` DECIMAL(10, 2) NOT NULL,
    `desc` TEXT,
    `page_count` INT DEFAULT 0,
    `content_table` JSON,
    `images` JSON,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `enrollments` (
    `id` VARCHAR(36) PRIMARY KEY,
    `student_id` VARCHAR(36) NOT NULL,
    `course_id` VARCHAR(36) NOT NULL,
    `enrolled_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `expires_at` DATETIME NOT NULL,
    `status` ENUM('ACTIVE', 'EXPIRED', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT `fk_enrollments_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_enrollments_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `orders` (
    `id` VARCHAR(36) PRIMARY KEY,
    `student_id` VARCHAR(36) NOT NULL,
    `course_id` VARCHAR(36) NULL,
    `book_id` VARCHAR(100) NULL,
    `item_type` ENUM('course', 'book', 'other') NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `installments` INT NOT NULL DEFAULT 1,
    `payment_method` ENUM('CREDIT_CARD', 'PIX', 'BOLETO', 'CARNE', 'TRANSFER') NOT NULL,
    `status` ENUM('PENDING', 'PAID', 'CANCELED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_orders_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_orders_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
    CONSTRAINT `fk_orders_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `active_sessions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` VARCHAR(36) NOT NULL,
    `token` TEXT NOT NULL,
    `ip_address` VARCHAR(50),
    `user_agent` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `access_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` VARCHAR(36) NULL,
    `ip_address` VARCHAR(50),
    `user_agent` TEXT,
    `content_accessed` VARCHAR(255),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `password_resets` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `used` TINYINT(1) DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

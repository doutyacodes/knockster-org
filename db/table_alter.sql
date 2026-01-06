-- ============================================================
-- Knockster Database Schema Updates
-- File: table_alter.sql
-- Purpose: Add app config, notifications, and enhanced device tokens
-- ============================================================

-- Table 1: App Config (Maintenance & Force Update Settings)
-- ============================================================
CREATE TABLE IF NOT EXISTS `app_config` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `guest_app_maintenance` BOOLEAN NOT NULL DEFAULT FALSE,
  `guest_app_maintenance_message` TEXT,
  `security_app_maintenance` BOOLEAN NOT NULL DEFAULT FALSE,
  `security_app_maintenance_message` TEXT,
  `guest_app_force_update` BOOLEAN NOT NULL DEFAULT FALSE,
  `guest_app_min_version` VARCHAR(20),
  `security_app_force_update` BOOLEAN NOT NULL DEFAULT FALSE,
  `security_app_min_version` VARCHAR(20),
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default app config row
INSERT INTO `app_config` (
  `id`,
  `guest_app_maintenance`,
  `security_app_maintenance`,
  `guest_app_force_update`,
  `security_app_force_update`,
  `updated_at`
) VALUES (
  UUID(),
  FALSE,
  FALSE,
  FALSE,
  FALSE,
  NOW()
);

-- ============================================================
-- Table 2: Update Notification Tokens Table
-- ============================================================

-- Check if notification_tokens table exists
-- If it exists, alter it. If not, create it fresh.

-- Drop existing table if you want to recreate (CAUTION: This will delete existing tokens)
-- DROP TABLE IF EXISTS `notification_tokens`;

-- Create notification_tokens table with new fields
CREATE TABLE IF NOT EXISTS `notification_tokens` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `guest_id` VARCHAR(36),
  `security_personnel_id` VARCHAR(36),
  `device_token` TEXT NOT NULL,
  `platform` ENUM('ios', 'android') NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_guest_id` (`guest_id`),
  INDEX `idx_security_personnel_id` (`security_personnel_id`),
  INDEX `idx_is_active` (`is_active`),
  FOREIGN KEY (`guest_id`) REFERENCES `guest`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`security_personnel_id`) REFERENCES `security_personnel`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- If table already exists, add new columns:
-- ALTER TABLE `notification_tokens` ADD COLUMN `platform` ENUM('ios', 'android') NOT NULL DEFAULT 'android' AFTER `device_token`;
-- ALTER TABLE `notification_tokens` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT TRUE AFTER `platform`;
-- ALTER TABLE `notification_tokens` ADD COLUMN `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;
-- ALTER TABLE `notification_tokens` ADD INDEX `idx_guest_id` (`guest_id`);
-- ALTER TABLE `notification_tokens` ADD INDEX `idx_security_personnel_id` (`security_personnel_id`);
-- ALTER TABLE `notification_tokens` ADD INDEX `idx_is_active` (`is_active`);

-- ============================================================
-- Table 3: Notifications Table (Broadcast to all guests or all security)
-- ============================================================
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `body` TEXT NOT NULL,
  `recipient_type` ENUM('guest', 'security') NOT NULL,
  `notification_type` ENUM('invitation', 'scan', 'alert', 'system', 'general') NOT NULL,
  `related_entity_id` VARCHAR(36),
  `sent_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_recipient_type` (`recipient_type`),
  INDEX `idx_notification_type` (`notification_type`),
  INDEX `idx_sent_at` (`sent_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Table 4: Notification Reads (Track which user read which notification)
-- ============================================================
CREATE TABLE IF NOT EXISTS `notification_reads` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `notification_id` VARCHAR(36) NOT NULL,
  `guest_id` VARCHAR(36),
  `security_personnel_id` VARCHAR(36),
  `read_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notification_id` (`notification_id`),
  INDEX `idx_guest_id` (`guest_id`),
  INDEX `idx_security_personnel_id` (`security_personnel_id`),
  UNIQUE KEY `unique_guest_read` (`notification_id`, `guest_id`),
  UNIQUE KEY `unique_security_read` (`notification_id`, `security_personnel_id`),
  FOREIGN KEY (`notification_id`) REFERENCES `notifications`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`guest_id`) REFERENCES `guest`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`security_personnel_id`) REFERENCES `security_personnel`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Sample Notifications (Optional - for testing)
-- ============================================================
-- INSERT INTO `notifications` (
--   `id`,
--   `title`,
--   `body`,
--   `recipient_type`,
--   `notification_type`,
--   `sent_at`
-- ) VALUES (
--   UUID(),
--   'Welcome to Knockster',
--   'Your invitation has been created successfully.',
--   'guest',
--   'invitation',
--   NOW()
-- );

-- ============================================================
-- Verification Queries
-- ============================================================

-- Check if tables were created successfully
-- SELECT TABLE_NAME, TABLE_ROWS
-- FROM INFORMATION_SCHEMA.TABLES
-- WHERE TABLE_SCHEMA = DATABASE()
-- AND TABLE_NAME IN ('app_config', 'notification_tokens', 'notifications', 'notification_reads');

-- Check app_config data
-- SELECT * FROM app_config;

-- Check notifications structure
-- DESCRIBE notifications;

-- Check notification_reads structure
-- DESCRIBE notification_reads;

-- Check notification_tokens structure
-- DESCRIBE notification_tokens;

-- ============================================================
-- End of Schema Updates
-- ============================================================

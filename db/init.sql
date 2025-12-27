-- ==========================================
-- KNOCKSTER SUPER ADMIN DATABASE SCHEMA
-- Multi-Layer Visitor & Security Access System
-- MySQL Version
-- ==========================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ==================== TABLES ====================

-- 1. SuperAdmin
CREATE TABLE `super_admin` (
  `id` VARCHAR(36) PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` TEXT NOT NULL,
  `two_factor_enabled` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Organization Node (Hierarchical Tree)
CREATE TABLE `organization_node` (
  `id` VARCHAR(36) PRIMARY KEY,
  `parent_id` VARCHAR(36),
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('techpark', 'block', 'building', 'company', 'gate', 'custom') NOT NULL,
  `plan_override_level` INT,
  `status` ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`parent_id`) REFERENCES `organization_node`(`id`) ON DELETE CASCADE,
  INDEX `idx_org_node_parent` (`parent_id`),
  INDEX `idx_org_node_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Subscription Plan
CREATE TABLE `subscription_plan` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `allow_l1` BOOLEAN NOT NULL DEFAULT TRUE,
  `allow_l2` BOOLEAN NOT NULL DEFAULT FALSE,
  `allow_l3` BOOLEAN NOT NULL DEFAULT FALSE,
  `allow_l4` BOOLEAN NOT NULL DEFAULT FALSE,
  `max_guards` INT NOT NULL,
  `max_guest_passes` INT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Organization Plan (Bridge: org → plan)
CREATE TABLE `organization_plan` (
  `id` VARCHAR(36) PRIMARY KEY,
  `organization_node_id` VARCHAR(36) NOT NULL,
  `subscription_plan_id` VARCHAR(36) NOT NULL,
  `start_date` TIMESTAMP NOT NULL,
  `end_date` TIMESTAMP,
  `status` ENUM('active', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`organization_node_id`) REFERENCES `organization_node`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subscription_plan_id`) REFERENCES `subscription_plan`(`id`),
  INDEX `idx_org_plan_node` (`organization_node_id`),
  INDEX `idx_org_plan_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Org Admin
CREATE TABLE `org_admin` (
  `id` VARCHAR(36) PRIMARY KEY,
  `organization_node_id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` TEXT NOT NULL,
  `status` ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`organization_node_id`) REFERENCES `organization_node`(`id`) ON DELETE CASCADE,
  INDEX `idx_org_admin_node` (`organization_node_id`),
  INDEX `idx_org_admin_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Security Personnel
CREATE TABLE `security_personnel` (
  `id` VARCHAR(36) PRIMARY KEY,
  `organization_node_id` VARCHAR(36) NOT NULL,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` TEXT NOT NULL,
  `shift_start_time` VARCHAR(5),
  `shift_end_time` VARCHAR(5),
  `status` ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
  `last_active` TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`organization_node_id`) REFERENCES `organization_node`(`id`) ON DELETE CASCADE,
  INDEX `idx_security_personnel_node` (`organization_node_id`),
  INDEX `idx_security_personnel_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Guard Device
CREATE TABLE `guard_device` (
  `id` VARCHAR(36) PRIMARY KEY,
  `security_personnel_id` VARCHAR(36) NOT NULL,
  `device_model` VARCHAR(100),
  `os_version` VARCHAR(50),
  `last_active` TIMESTAMP,
  `force_logout` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`security_personnel_id`) REFERENCES `security_personnel`(`id`) ON DELETE CASCADE,
  INDEX `idx_guard_device_personnel` (`security_personnel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Guest
CREATE TABLE `guest` (
  `id` VARCHAR(36) PRIMARY KEY,
  `phone` VARCHAR(20) NOT NULL UNIQUE,
  `name` VARCHAR(255),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_guest_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Guest Device
CREATE TABLE `guest_device` (
  `id` VARCHAR(36) PRIMARY KEY,
  `guest_id` VARCHAR(36) NOT NULL,
  `device_model` VARCHAR(100),
  `os_version` VARCHAR(50),
  `last_active` TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`guest_id`) REFERENCES `guest`(`id`) ON DELETE CASCADE,
  INDEX `idx_guest_device_guest` (`guest_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Guest Invitation
CREATE TABLE `guest_invitation` (
  `id` VARCHAR(36) PRIMARY KEY,
  `organization_node_id` VARCHAR(36) NOT NULL,
  `guest_id` VARCHAR(36) NOT NULL,
  `employee_name` VARCHAR(255) NOT NULL,
  `employee_phone` VARCHAR(20) NOT NULL,
  `valid_from` TIMESTAMP NOT NULL,
  `valid_to` TIMESTAMP NOT NULL,
  `requested_security_level` INT NOT NULL,
  `status` ENUM('pending', 'active', 'expired', 'revoked') NOT NULL DEFAULT 'pending',
  `created_by_org_admin_id` VARCHAR(36) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`organization_node_id`) REFERENCES `organization_node`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`guest_id`) REFERENCES `guest`(`id`),
  FOREIGN KEY (`created_by_org_admin_id`) REFERENCES `org_admin`(`id`),
  INDEX `idx_invitation_node` (`organization_node_id`),
  INDEX `idx_invitation_guest` (`guest_id`),
  INDEX `idx_invitation_status` (`status`),
  INDEX `idx_invitation_valid_dates` (`valid_from`, `valid_to`),
  CONSTRAINT `chk_security_level` CHECK (`requested_security_level` >= 1 AND `requested_security_level` <= 4),
  CONSTRAINT `chk_valid_date_range` CHECK (`valid_to` > `valid_from`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Guest QR Session
CREATE TABLE `guest_qr_session` (
  `id` VARCHAR(36) PRIMARY KEY,
  `invitation_id` VARCHAR(36) NOT NULL,
  `rotating_key` TEXT NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`invitation_id`) REFERENCES `guest_invitation`(`id`) ON DELETE CASCADE,
  INDEX `idx_qr_session_invitation` (`invitation_id`),
  INDEX `idx_qr_session_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Guest OTP
CREATE TABLE `guest_otp` (
  `id` VARCHAR(36) PRIMARY KEY,
  `invitation_id` VARCHAR(36) NOT NULL,
  `otp_code` VARCHAR(6) NOT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`invitation_id`) REFERENCES `guest_invitation`(`id`) ON DELETE CASCADE,
  INDEX `idx_otp_invitation` (`invitation_id`),
  INDEX `idx_otp_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Invitation Scan Event
CREATE TABLE `invitation_scan_event` (
  `id` VARCHAR(36) PRIMARY KEY,
  `invitation_id` VARCHAR(36) NOT NULL,
  `scanned_by_security_personnel_id` VARCHAR(36) NOT NULL,
  `used_security_level` INT NOT NULL,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `success` BOOLEAN NOT NULL,
  `failure_reason` TEXT,
  FOREIGN KEY (`invitation_id`) REFERENCES `guest_invitation`(`id`),
  FOREIGN KEY (`scanned_by_security_personnel_id`) REFERENCES `security_personnel`(`id`),
  INDEX `idx_scan_event_invitation` (`invitation_id`),
  INDEX `idx_scan_event_personnel` (`scanned_by_security_personnel_id`),
  INDEX `idx_scan_event_timestamp` (`timestamp`),
  CONSTRAINT `chk_used_security_level` CHECK (`used_security_level` >= 1 AND `used_security_level` <= 4)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Notification Tokens
CREATE TABLE `notification_tokens` (
  `id` VARCHAR(36) PRIMARY KEY,
  `guest_id` VARCHAR(36),
  `security_personnel_id` VARCHAR(36),
  `device_token` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`guest_id`) REFERENCES `guest`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`security_personnel_id`) REFERENCES `security_personnel`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Audit Log
CREATE TABLE `audit_log` (
  `id` VARCHAR(36) PRIMARY KEY,
  `actor_type` ENUM('SuperAdmin', 'OrgAdmin', 'Guard', 'System') NOT NULL,
  `actor_id` VARCHAR(36) NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `metadata` JSON,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_log_actor` (`actor_type`, `actor_id`),
  INDEX `idx_audit_log_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Billing Record
CREATE TABLE `billing_record` (
  `id` VARCHAR(36) PRIMARY KEY,
  `organization_node_id` VARCHAR(36) NOT NULL,
  `subscription_plan_id` VARCHAR(36) NOT NULL,
  `payment_reference` VARCHAR(255),
  `amount` DECIMAL(10, 2) NOT NULL,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  FOREIGN KEY (`organization_node_id`) REFERENCES `organization_node`(`id`),
  FOREIGN KEY (`subscription_plan_id`) REFERENCES `subscription_plan`(`id`),
  INDEX `idx_billing_node` (`organization_node_id`),
  INDEX `idx_billing_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Geo Gate Location (Optional)
CREATE TABLE `geo_gate_location` (
  `id` VARCHAR(36) PRIMARY KEY,
  `organization_node_id` VARCHAR(36) NOT NULL,
  `latitude` DECIMAL(10, 8) NOT NULL,
  `longitude` DECIMAL(11, 8) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`organization_node_id`) REFERENCES `organization_node`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== SEED DATA ====================

-- Default Subscription Plans
INSERT INTO `subscription_plan` (`id`, `name`, `allow_l1`, `allow_l2`, `allow_l3`, `allow_l4`, `max_guards`, `max_guest_passes`, `price`) VALUES
(UUID(), 'Basic L1', TRUE, FALSE, FALSE, FALSE, 5, 100, 99.00),
(UUID(), 'Standard L2', TRUE, TRUE, FALSE, FALSE, 10, 250, 249.00),
(UUID(), 'Premium L3', TRUE, TRUE, TRUE, FALSE, 25, 500, 499.00),
(UUID(), 'Enterprise L4', TRUE, TRUE, TRUE, TRUE, 100, 2000, 999.00);

-- Default SuperAdmin (password: SuperAdmin@123)
-- Note: This is a bcrypt hash of 'SuperAdmin@123' - CHANGE THIS IN PRODUCTION!
INSERT INTO `super_admin` (`id`, `email`, `password_hash`, `two_factor_enabled`) VALUES
(UUID(), 'superadmin@knockster.io', '$2b$10$YourHashedPasswordHere', FALSE);

SET FOREIGN_KEY_CHECKS = 1;

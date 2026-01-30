-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 08, 2026 at 10:52 PM
-- Server version: 8.0.44
-- PHP Version: 8.4.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `devuser_knockster_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `app_config`
--

CREATE TABLE `app_config` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guest_app_maintenance` tinyint(1) NOT NULL DEFAULT '0',
  `guest_app_maintenance_message` text COLLATE utf8mb4_unicode_ci,
  `security_app_maintenance` tinyint(1) NOT NULL DEFAULT '0',
  `security_app_maintenance_message` text COLLATE utf8mb4_unicode_ci,
  `guest_app_force_update` tinyint(1) NOT NULL DEFAULT '0',
  `guest_app_min_version` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `security_app_force_update` tinyint(1) NOT NULL DEFAULT '0',
  `security_app_min_version` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `app_config`
--

INSERT INTO `app_config` (`id`, `guest_app_maintenance`, `guest_app_maintenance_message`, `security_app_maintenance`, `security_app_maintenance_message`, `guest_app_force_update`, `guest_app_min_version`, `security_app_force_update`, `security_app_min_version`, `updated_at`) VALUES
('3457d2b7-eade-11f0-9793-52541aa39e4a', 0, NULL, 0, NULL, 0, NULL, 0, NULL, '2026-01-08 00:58:24');

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `actor_type` enum('SuperAdmin','OrgAdmin','Guard','System') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `actor_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `metadata` json DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_log`
--

INSERT INTO `audit_log` (`id`, `actor_type`, `actor_id`, `action`, `metadata`, `timestamp`) VALUES
('00f0f567-bab8-4a96-8f50-a69bde70a299', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ORG_NODE_CREATED', '{\"type\": \"techpark\", \"organizationId\": \"287fcc6f-8e08-4c1a-aa18-300d4c25bc44\", \"organizationName\": \"Orion Tech Park\"}', '2026-01-02 05:22:06'),
('05ec45cd-e72f-4087-ba93-9bfb693d2584', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ADMIN_CREATED', '{\"adminId\": \"c7e7fba9-5320-4186-a776-17cc0f978dc4\", \"adminEmail\": \"buildinga@gmail.com\", \"organizationNodeId\": \"3b421420-bcb2-4b99-8a70-6f311cd4fb57\"}', '2026-01-02 05:39:17'),
('099d1c13-f6a3-4d02-ba3d-4465a4d5e6b7', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ADMIN_DELETED', '{\"adminId\": \"deb9b0ac-5a09-4cdc-a364-a569d40a619d\", \"adminEmail\": \"admin@meta.com\"}', '2026-01-03 05:43:15'),
('09cdbf54-4ffb-4cc0-8330-0dbcdaa99a0b', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ORG_NODE_DELETED', '{\"organizationId\": \"6604fdb0-68a8-4240-9dc9-0a26a77df9fe\", \"organizationName\": \"Technopark\"}', '2026-01-02 05:16:38'),
('148d6784-7808-4d25-b5e5-9debeaf2333c', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ADMIN_CREATED', '{\"adminId\": \"5c5867a8-bc56-4a44-9f9f-c8df6f85475f\", \"adminEmail\": \"admi@ust.com\", \"organizationNodeId\": \"b3d40002-43a5-4f5b-8b82-ac9cdcb2e89a\"}', '2025-12-27 06:36:18'),
('15970c4a-1716-4557-9ee2-25fffce2a1aa', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ORG_NODE_CREATED', '{\"type\": \"building\", \"organizationId\": \"3b421420-bcb2-4b99-8a70-6f311cd4fb57\", \"organizationName\": \"Building A\"}', '2026-01-02 05:23:50'),
('1ad00003-4776-4f81-864c-4f52e4ada37c', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ORG_NODE_CREATED', '{\"type\": \"company\", \"organizationId\": \"72b4fa5a-ccb6-472b-b463-8b0825e2378e\", \"organizationName\": \"Infosys\"}', '2026-01-02 05:15:10'),
('1f4074f0-a1e9-49c4-93c3-fde675095a6b', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ADMIN_CREATED', '{\"adminId\": \"9cd1f39d-e7f6-4f10-aca2-895e849d2778\", \"adminEmail\": \"admin2@infosys.com\", \"organizationNodeId\": \"287a973d-ff6e-449c-be62-62fb9aeb09cf\"}', '2025-12-30 05:59:16'),
('2008adef-f9dc-4a7a-bb78-885b75e46539', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ADMIN_CREATED', '{\"adminId\": \"0e190c7f-951c-4b6b-a684-a7ebdb5292e4\", \"adminEmail\": \"orion@gmail.com\", \"organizationNodeId\": \"287fcc6f-8e08-4c1a-aa18-300d4c25bc44\"}', '2026-01-02 05:37:58'),
('214c73ed-7875-4418-96e2-aff624c29a2c', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ADMIN_UPDATED', '{\"adminId\": \"c6948eeb-5b78-4113-a462-5dd3b42270a1\", \"changes\": {\"status\": \"active\"}, \"adminEmail\": \"apple@gmail.com\"}', '2025-12-27 22:30:32'),
('2fd8305c-ec43-456d-bab1-8e47334b04d7', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ORG_NODE_CREATED', '{\"type\": \"block\", \"organizationId\": \"bf375421-462e-4206-8e3d-6bfca73c381b\", \"organizationName\": \"Block A\"}', '2026-01-02 05:22:39'),
('3522a0a8-b529-497c-bfbe-131462f54292', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ADMIN_CREATED', '{\"adminId\": \"e395e793-9116-4b64-91ae-52587f6d3593\", \"adminEmail\": \"companya@gmail.com\", \"organizationNodeId\": \"959a159d-96f3-48a9-afb1-81bf42f82e6d\"}', '2026-01-02 05:40:24'),
('3c4f1a5e-591b-4575-9216-21c94075b11d', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ADMIN_CREATED', '{\"adminId\": \"097e360d-74b8-48bf-be2e-6f81349e9137\", \"adminEmail\": \"admin@infosys.com\", \"organizationNodeId\": \"287a973d-ff6e-449c-be62-62fb9aeb09cf\"}', '2025-12-29 06:04:19'),
('5e09622b-25be-44af-99ed-d7564b115112', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'APP_CONFIG_UPDATED', '{\"guestAppMinVersion\": null, \"guestAppForceUpdate\": false, \"guestAppMaintenance\": false, \"securityAppMinVersion\": null, \"securityAppForceUpdate\": false, \"securityAppMaintenance\": false, \"guestAppMaintenanceMessage\": null, \"securityAppMaintenanceMessage\": null}', '2026-01-08 00:58:25'),
('6edb4dae-9d22-4399-9296-9a104eb73bbe', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ADMIN_CREATED', '{\"adminId\": \"1328a448-5a0f-4d74-aae7-dfcc50c28593\", \"adminEmail\": \"blocka@gmail.com\", \"organizationNodeId\": \"bf375421-462e-4206-8e3d-6bfca73c381b\"}', '2026-01-02 05:38:28'),
('79b16eda-f286-45f1-935b-821eebc5656d', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ORG_NODE_CREATED', '{\"type\": \"company\", \"organizationId\": \"287a973d-ff6e-449c-be62-62fb9aeb09cf\", \"organizationName\": \"Infosys\"}', '2025-12-29 06:03:35'),
('8fdfbbc5-e879-4a41-9fff-6960d2a994dc', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ADMIN_CREATED', '{\"adminId\": \"5a11fbec-b14d-4eaa-bfd2-41a36d6ca21c\", \"adminEmail\": \"admin@oracle.com\", \"organizationNodeId\": \"c1b72cc1-60b9-41b6-82ab-c37829a839ff\"}', '2026-01-02 05:19:39'),
('97358819-7fc2-48a3-bcfd-686d45004a7c', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ORG_NODE_CREATED', '{\"type\": \"techpark\", \"organizationId\": \"41d8e1b3-e911-4eb7-b963-5b41b3cae0ba\", \"organizationName\": \"Test\"}', '2025-12-26 23:39:49'),
('9cec5c18-e565-4243-bbaa-3302def6a9e7', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ORG_NODE_CREATED', '{\"type\": \"company\", \"organizationId\": \"b3d40002-43a5-4f5b-8b82-ac9cdcb2e89a\", \"organizationName\": \"UST Global\"}', '2025-12-27 06:34:20'),
('a0a16f40-77da-4f3e-bb0e-57ddfab5e8fa', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ORG_NODE_CREATED', '{\"type\": \"company\", \"organizationId\": \"959a159d-96f3-48a9-afb1-81bf42f82e6d\", \"organizationName\": \"Company 1\"}', '2026-01-02 05:24:06'),
('a2726dbc-c681-49df-a2b2-5dd6b20f9578', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ORG_NODE_DELETED', '{\"organizationId\": \"72b4fa5a-ccb6-472b-b463-8b0825e2378e\", \"organizationName\": \"Infosys\"}', '2026-01-02 05:16:30'),
('a4cfe3ba-6136-45dc-b48a-648cf92da8d0', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'APP_CONFIG_UPDATED', '{\"guestAppMinVersion\": null, \"guestAppForceUpdate\": true, \"guestAppMaintenance\": true, \"securityAppMinVersion\": null, \"securityAppForceUpdate\": false, \"securityAppMaintenance\": false, \"guestAppMaintenanceMessage\": null, \"securityAppMaintenanceMessage\": null}', '2026-01-06 16:52:01'),
('a77df0d3-9ce5-45eb-9a23-b98d7fbcab3e', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ORG_NODE_CREATED', '{\"type\": \"techpark\", \"organizationId\": \"86cc36f4-9337-4faf-8c99-574d79c4bae9\", \"organizationName\": \"Technopark\"}', '2026-01-02 05:18:46'),
('aea78492-d56c-4c80-8918-f8cc8699f279', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ADMIN_CREATED', '{\"adminId\": \"c6948eeb-5b78-4113-a462-5dd3b42270a1\", \"adminEmail\": \"apple@gmail.com\", \"organizationNodeId\": \"41d8e1b3-e911-4eb7-b963-5b41b3cae0ba\"}', '2025-12-26 23:40:13'),
('b9d0638b-3b56-4134-95d8-cb95fc045a7b', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ADMIN_CREATED', '{\"adminId\": \"381f609e-7042-4d4a-9782-f9b267379c04\", \"adminEmail\": \"admin2@gmail.com\", \"organizationNodeId\": \"b3d40002-43a5-4f5b-8b82-ac9cdcb2e89a\"}', '2025-12-29 05:18:49'),
('c9b8e608-72ba-4600-8ae9-e586cd7ddba4', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ADMIN_CREATED', '{\"adminId\": \"deb9b0ac-5a09-4cdc-a364-a569d40a619d\", \"adminEmail\": \"admin@meta.com\", \"organizationNodeId\": \"86cc36f4-9337-4faf-8c99-574d79c4bae9\"}', '2026-01-03 05:42:56'),
('cab41e3b-af3e-4ead-be6f-f373d696dea4', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ORG_NODE_CREATED', '{\"type\": \"techpark\", \"organizationId\": \"6604fdb0-68a8-4240-9dc9-0a26a77df9fe\", \"organizationName\": \"Technopark\"}', '2026-01-02 05:14:47'),
('d07fb457-496e-478c-81ba-3e005baca96f', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ADMIN_CREATED', '{\"adminId\": \"6857f6a4-9ee3-471f-989c-24aeecfff6b2\", \"adminEmail\": \"admin@meta.com\", \"organizationNodeId\": \"eca96e85-391b-4eb7-a3b2-f6fae048452e\"}', '2026-01-03 05:43:32'),
('d37550f0-e675-4fdb-8bc5-20695c33a83c', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ADMIN_CREATED', '{\"adminId\": \"c0e6ef7f-9a43-4193-b3bf-be12779fcfc4\", \"adminEmail\": \"apple2@gmail.com\", \"organizationNodeId\": \"41d8e1b3-e911-4eb7-b963-5b41b3cae0ba\"}', '2025-12-27 22:31:14'),
('e4ef6eb9-4b63-4244-a6c8-ea5a284db91e', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ORG_NODE_CREATED', '{\"type\": \"company\", \"organizationId\": \"eca96e85-391b-4eb7-a3b2-f6fae048452e\", \"organizationName\": \"Meta\"}', '2026-01-03 05:42:15'),
('f1040bd5-db7e-41bd-a3ad-d8587e433ef6', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'APP_CONFIG_UPDATED', '{\"guestAppMinVersion\": null, \"guestAppForceUpdate\": true, \"guestAppMaintenance\": false, \"securityAppMinVersion\": null, \"securityAppForceUpdate\": false, \"securityAppMaintenance\": false, \"guestAppMaintenanceMessage\": null, \"securityAppMaintenanceMessage\": null}', '2026-01-08 00:58:12'),
('f4140079-2383-4f16-9d6c-646414d224b3', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ADMIN_UPDATED', '{\"adminId\": \"c6948eeb-5b78-4113-a462-5dd3b42270a1\", \"changes\": {\"status\": \"disabled\"}, \"adminEmail\": \"apple@gmail.com\"}', '2025-12-27 22:30:28'),
('f5eb5a68-2283-4f55-95eb-84f2b39c16a9', 'SuperAdmin', '0cede4ab-c277-446c-88f2-d7909bb37e7c', 'ORG_NODE_CREATED', '{\"type\": \"company\", \"organizationId\": \"c1b72cc1-60b9-41b6-82ab-c37829a839ff\", \"organizationName\": \"Oracle\"}', '2026-01-02 05:19:05');

-- --------------------------------------------------------

--
-- Table structure for table `billing_record`
--

CREATE TABLE `billing_record` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_node_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subscription_plan_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_reference` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','paid','failed','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `geo_gate_location`
--

CREATE TABLE `geo_gate_location` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_node_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guard_device`
--

CREATE TABLE `guard_device` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `security_personnel_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `os_version` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_active` timestamp NULL DEFAULT NULL,
  `force_logout` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `guard_device`
--

INSERT INTO `guard_device` (`id`, `security_personnel_id`, `device_model`, `os_version`, `last_active`, `force_logout`, `created_at`) VALUES
('0cbfad9c-0e94-42ca-814c-6022384f3dd0', 'ca23a63f-c3d7-46f2-b575-d5ce3330ba0f', 'I2304', '15', '2025-12-29 04:50:55', 0, '2025-12-29 04:50:54'),
('2b9f41d9-d109-40bd-abb4-09e650071b7a', 'cb07557d-4625-4ee7-bc91-c4d95c512189', 'SM-G9980', '12', '2026-01-03 05:47:35', 0, '2026-01-03 05:47:35'),
('2ba118ce-a75e-4be2-8c69-e271625cbe8c', '71141d25-3af4-4ac0-b285-702587226437', 'SM-G9980', '12', '2026-01-03 05:39:09', 0, '2026-01-03 05:39:09'),
('a3fef7cc-c4e7-47e1-8599-1a66dd7974aa', '63b1a9b0-0880-4bbb-b7d0-56d26e7e4ae0', 'I2304', '15', '2025-12-31 07:35:54', 0, '2025-12-31 07:35:53'),
('ad98b08a-4323-424c-98fa-61be3121fec0', 'f1727ded-3e6f-412f-a320-96912e02a5e2', 'I2304', '15', '2025-12-29 05:26:52', 0, '2025-12-29 05:26:52'),
('d8defa80-3ab5-4aeb-a8fd-3cf351503dc2', 'f58008f1-ca1b-43bb-ba5c-b6e5384c24f3', 'SM-G9980', '12', '2026-01-03 05:33:13', 0, '2026-01-03 05:33:13'),
('e8ca5a0f-726c-4861-83aa-199d4382419e', '5364bf0f-cfe8-4dbe-885b-01831373df5e', 'sdk_gphone64_x86_64', '16', '2025-12-30 03:41:21', 0, '2025-12-30 03:41:20'),
('f8a6e806-52aa-4732-be31-1cdee8906d04', 'b4950c55-6d6d-415c-9352-1cd3edbe1fda', 'A001', '15', '2026-01-02 09:47:54', 0, '2026-01-02 09:47:53'),
('fc8b3ed1-a134-4881-baa2-95d5e8d0c868', 'a2e3a0b6-cfb7-4c1d-bf69-48a8fe4d9da9', 'A001', '15', '2026-01-03 04:23:44', 0, '2026-01-03 04:23:44');

-- --------------------------------------------------------

--
-- Table structure for table `guest`
--

CREATE TABLE `guest` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `guest`
--

INSERT INTO `guest` (`id`, `phone`, `name`, `created_at`) VALUES
('07975c77-7ccc-4128-aa6b-4518fcb9e34c', '9945882254', 'Mohan', '2026-01-02 05:59:38'),
('0a815513-f60f-4fc3-aa21-16b83f8628be', '4050607080', 'Arnold', '2026-01-02 06:00:39'),
('0ec6f99f-d298-4bbc-8231-59088ada7b64', '999999999', 'Hathway', '2026-01-03 05:45:52'),
('10c58ece-5d4b-4d56-aa7e-ee1b2984a47e', '405060708090', 'Alan', '2026-01-02 05:59:32'),
('1a06540b-99d6-4fe7-9aba-19a9df4770dc', '9632330214', 'Vijin', '2026-01-02 06:18:14'),
('25cfc3db-419e-4f84-b75a-13a34af3b962', '3212321235', 'Nolan', '2026-01-03 05:46:28'),
('25fee2ac-1362-43b8-861c-ebf8c4e35a7e', '7575858545', 'Ajith', '2025-12-29 05:23:53'),
('26e3150e-a99e-4eee-8399-3d17d0f2af9a', '9999999999', 'Hathaway', '2026-01-03 05:48:22'),
('2f599d03-7e1e-4667-98ee-c47c6ea85e42', '8080707090', 'Alan', '2026-01-08 22:29:48'),
('337fc37c-0535-44e6-82be-4fd81dc879e3', '7070708080', 'Alan', '2026-01-08 22:44:35'),
('36dedc4d-399f-442d-9b3f-5f85d76cb77c', '3343431267', 'Ak', '2025-12-30 06:00:38'),
('4003ed66-e741-45ba-a8a5-697eda76dd71', '9886019202', 'Felicia Thomas', '2026-01-02 09:45:11'),
('419efdfc-ec76-43c1-a0c4-0b27c70fe086', '9854785478', 'Joe', '2026-01-02 05:27:10'),
('49f62a2f-f6ce-4ae8-9947-2ba699940e4c', '7070707070', 'Alvin', '2025-12-30 12:07:35'),
('4ddf13b4-2e80-49c7-8af6-a794fbcbb2dc', '3569985865', 'Jk', '2025-12-31 07:14:39'),
('515ebb1d-229a-440c-b188-4742c7af5694', '2020202020', 'Aleena', '2025-12-27 00:11:29'),
('53d8cd5e-76d7-4b52-b4a6-a4bd52867868', '3212121484', 'Derin', '2025-12-29 05:30:34'),
('5f504de0-af5e-406f-bc8d-54dd3fe13dfa', '9090909090', 'Alan', '2025-12-26 23:46:39'),
('6a02507f-d5e7-4350-826a-eddc4d453d9a', '1010101024', 'Bha', '2025-12-30 06:05:30'),
('70d045b3-f0b7-4529-990e-f2255ff0477c', '2021112023', 'Ditto', '2025-12-29 05:24:44'),
('8a3b04d2-f182-4651-a74d-0b0ada3a1cd5', '9852525825', 'Akhil', '2026-01-02 05:21:22'),
('8fecbc43-80d2-459d-b61c-671c51b2aa79', '3022120032', 'Ajith', '2025-12-29 05:29:49'),
('a75b4171-9f01-4cb4-9eac-54b60e5ce17b', '8585852321', 'Fenix', '2026-01-03 05:21:22'),
('ab5b7a8d-654b-44fe-8e96-482a18f1ee89', '7070704040', 'Alan', '2026-01-08 22:40:13'),
('b4fa428e-7e9e-4da8-a911-58c8c1bc0cac', '8080809090', 'Alan', '2026-01-08 22:35:10'),
('b5e2a38f-ab2c-491d-9250-b7c3a304fcba', '8080909080', 'Alab', '2026-01-08 21:10:18'),
('c62dfd37-942e-4814-9369-b238727267c9', '6565656568', 'Alex', '2025-12-27 22:33:23'),
('c9a1a192-bbb1-4766-b231-8eadb164b6c8', '1010101010', 'Arnold', '2025-12-27 05:04:44'),
('d2f38d04-c99c-430d-b3ed-20c1064b3742', '5252520252', 'Barath', '2026-01-03 05:32:30'),
('ed0149b9-5581-49d5-b725-2afad3124a56', '12345678956', 'Ajith', '2025-12-29 05:28:59'),
('f37b36c4-77bd-4368-9317-cdfa7f801ca1', '9123456780', 'Arjun', '2025-12-27 06:41:11'),
('f4c45b86-10bf-4d16-9213-dfdda805e01c', '9898985654', 'Jackson', '2026-01-02 05:58:52'),
('f80fa5e6-a3ab-4546-8dfd-77089ef93a83', '2323232323', 'Jeena', '2025-12-27 22:27:41'),
('f88e55b7-68d2-4b23-9a25-cb59ad52a9f3', '8080808080', 'Alan', '2025-12-30 03:35:17');

-- --------------------------------------------------------

--
-- Table structure for table `guest_device`
--

CREATE TABLE `guest_device` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `guest_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_model` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `os_version` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_active` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `guest_invitation`
--

CREATE TABLE `guest_invitation` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_node_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `guest_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `valid_from` timestamp NOT NULL,
  `valid_to` timestamp NOT NULL,
  `requested_security_level` int NOT NULL,
  `status` enum('pending','active','expired','revoked') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_by_org_admin_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `guest_invitation`
--

INSERT INTO `guest_invitation` (`id`, `organization_node_id`, `guest_id`, `employee_name`, `employee_phone`, `valid_from`, `valid_to`, `requested_security_level`, `status`, `created_by_org_admin_id`, `created_at`) VALUES
('0d3f6aaa-07a3-42ff-b1ce-cc8c1f3d53b4', 'b3d40002-43a5-4f5b-8b82-ac9cdcb2e89a', '8fecbc43-80d2-459d-b61c-671c51b2aa79', 'Akhil', '78787845102', '2025-12-28 10:59:00', '2026-02-17 10:59:00', 1, 'active', '381f609e-7042-4d4a-9782-f9b267379c04', '2025-12-29 05:29:49'),
('0dc9511f-36f4-4d54-8f28-0b48803902c5', 'bf375421-462e-4206-8e3d-6bfca73c381b', 'c9a1a192-bbb1-4766-b231-8eadb164b6c8', 'Alicia', '1010101010', '2026-01-02 05:54:00', '2026-01-02 13:58:00', 4, 'active', '1328a448-5a0f-4d74-aae7-dfcc50c28593', '2026-01-02 05:58:53'),
('14cfdf65-09ce-4fb1-a19d-7e3c0d438490', '41d8e1b3-e911-4eb7-b963-5b41b3cae0ba', '515ebb1d-229a-440c-b188-4742c7af5694', 'Jeena', '1010101010', '2025-12-28 03:54:00', '2025-12-28 15:56:00', 2, 'pending', 'c6948eeb-5b78-4113-a462-5dd3b42270a1', '2025-12-27 22:26:10'),
('14f6841c-4b66-4357-8cd7-12f8b52eb8ee', 'eca96e85-391b-4eb7-a3b2-f6fae048452e', '25cfc3db-419e-4f84-b75a-13a34af3b962', 'Christopher', '8956474512', '2026-01-03 05:46:00', '2026-01-30 05:46:00', 4, 'active', '6857f6a4-9ee3-471f-989c-24aeecfff6b2', '2026-01-03 05:46:28'),
('1d1744be-c2c2-4d85-b8c2-187d8fdc7662', 'eca96e85-391b-4eb7-a3b2-f6fae048452e', '0ec6f99f-d298-4bbc-8231-59088ada7b64', 'Ann', '5858585858', '2026-01-03 05:45:00', '2026-01-30 05:45:00', 3, 'active', '6857f6a4-9ee3-471f-989c-24aeecfff6b2', '2026-01-03 05:45:52'),
('1e62447b-36b6-476b-9409-4ebafc54f1b4', '41d8e1b3-e911-4eb7-b963-5b41b3cae0ba', 'c9a1a192-bbb1-4766-b231-8eadb164b6c8', 'aLVIN', '2020202020', '2025-12-29 09:10:00', '2025-12-30 21:12:00', 3, 'active', 'c6948eeb-5b78-4113-a462-5dd3b42270a1', '2025-12-30 03:40:56'),
('2e416eba-4d31-4157-99ad-b109b7453f37', '287a973d-ff6e-449c-be62-62fb9aeb09cf', '36dedc4d-399f-442d-9b3f-5f85d76cb77c', 'Jack', '242424242413', '2025-12-30 06:00:00', '2026-02-17 06:00:00', 3, 'active', '9cd1f39d-e7f6-4f10-aca2-895e849d2778', '2025-12-30 06:00:38'),
('3125ea92-91bf-4750-9a5b-e78726e4af08', '41d8e1b3-e911-4eb7-b963-5b41b3cae0ba', '5f504de0-af5e-406f-bc8d-54dd3fe13dfa', 'John', '8080808080', '2025-12-26 18:12:00', '2025-12-27 09:19:00', 2, 'active', 'c6948eeb-5b78-4113-a462-5dd3b42270a1', '2025-12-26 23:46:39'),
('328fc488-f383-4cb2-a2ab-9fe1d6301af8', 'c1b72cc1-60b9-41b6-82ab-c37829a839ff', '1a06540b-99d6-4fe7-9aba-19a9df4770dc', 'Adersh', '9856521247', '2026-01-02 06:18:00', '2026-01-30 06:18:00', 4, 'active', '5a11fbec-b14d-4eaa-bfd2-41a36d6ca21c', '2026-01-02 06:18:15'),
('3324824e-43a1-46c8-b90a-bbce58923720', 'b3d40002-43a5-4f5b-8b82-ac9cdcb2e89a', 'f37b36c4-77bd-4368-9317-cdfa7f801ca1', 'Rahul', '9876543210', '2025-12-26 12:10:00', '2026-01-30 12:10:00', 1, 'active', '5c5867a8-bc56-4a44-9f9f-c8df6f85475f', '2025-12-27 06:41:11'),
('3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', 'c1b72cc1-60b9-41b6-82ab-c37829a839ff', 'f4c45b86-10bf-4d16-9213-dfdda805e01c', 'Sarah', '9855554101', '2026-01-02 05:58:00', '2026-01-30 05:58:00', 3, 'active', '5a11fbec-b14d-4eaa-bfd2-41a36d6ca21c', '2026-01-02 05:58:52'),
('525ee322-7fa4-4181-bd59-70d4c7071367', 'b3d40002-43a5-4f5b-8b82-ac9cdcb2e89a', '70d045b3-f0b7-4529-990e-f2255ff0477c', 'Shiju', '7845452123', '2025-12-29 10:54:00', '2026-02-26 10:54:00', 2, 'pending', '381f609e-7042-4d4a-9782-f9b267379c04', '2025-12-29 05:24:44'),
('5777c7cd-93d0-4e68-90f1-012d26e5250c', 'bf375421-462e-4206-8e3d-6bfca73c381b', 'c9a1a192-bbb1-4766-b231-8eadb164b6c8', 'Sarah ', '1010101010', '2026-01-02 05:55:00', '2026-01-02 17:55:00', 4, 'active', '1328a448-5a0f-4d74-aae7-dfcc50c28593', '2026-01-02 05:55:41'),
('607d1f41-2fd7-4cd0-ad4e-7abe6ed6d59c', '41d8e1b3-e911-4eb7-b963-5b41b3cae0ba', '49f62a2f-f6ce-4ae8-9947-2ba699940e4c', 'Sarah', '7070707070', '2025-12-30 12:14:00', '2025-12-30 17:17:00', 4, 'active', 'c6948eeb-5b78-4113-a462-5dd3b42270a1', '2025-12-30 12:17:15'),
('69c9bbd2-0f6e-4e9c-bb1e-f461c3de51a5', 'c1b72cc1-60b9-41b6-82ab-c37829a839ff', '8a3b04d2-f182-4651-a74d-0b0ada3a1cd5', 'Arun', '9858585455', '2026-01-02 05:21:00', '2026-01-26 05:21:00', 1, 'active', '5a11fbec-b14d-4eaa-bfd2-41a36d6ca21c', '2026-01-02 05:21:22'),
('6a75c5d2-0187-4286-9c5e-aa5cb5764c88', 'c1b72cc1-60b9-41b6-82ab-c37829a839ff', '07975c77-7ccc-4128-aa6b-4518fcb9e34c', 'Ajith', '858995463', '2026-01-02 05:59:00', '2026-01-30 05:59:00', 4, 'revoked', '5a11fbec-b14d-4eaa-bfd2-41a36d6ca21c', '2026-01-02 05:59:38'),
('70d9f354-c797-4fc9-a220-2de4f61fa9b8', '41d8e1b3-e911-4eb7-b963-5b41b3cae0ba', 'c9a1a192-bbb1-4766-b231-8eadb164b6c8', 'Alvin', '1010101010', '2025-12-30 12:06:00', '2025-12-30 18:08:00', 3, 'pending', 'c6948eeb-5b78-4113-a462-5dd3b42270a1', '2025-12-30 12:05:03'),
('8cb19390-256b-437f-a03d-3797533072b6', 'b3d40002-43a5-4f5b-8b82-ac9cdcb2e89a', '25fee2ac-1362-43b8-861c-ebf8c4e35a7e', 'Akhil', '9595959565', '2025-12-29 10:53:00', '2026-01-29 10:53:00', 1, 'pending', '381f609e-7042-4d4a-9782-f9b267379c04', '2025-12-29 05:23:53'),
('8e66bb41-3a34-42bb-bb0b-c403b32d8a4d', '41d8e1b3-e911-4eb7-b963-5b41b3cae0ba', '515ebb1d-229a-440c-b188-4742c7af5694', 'Aleena', '1010101010', '2025-12-26 18:41:00', '2025-12-27 06:41:00', 1, 'active', 'c6948eeb-5b78-4113-a462-5dd3b42270a1', '2025-12-27 00:11:29'),
('9e649f34-f484-46c8-9633-229dd28fad31', '41d8e1b3-e911-4eb7-b963-5b41b3cae0ba', '49f62a2f-f6ce-4ae8-9947-2ba699940e4c', 'Calvin', '7070707070', '2025-12-30 11:59:00', '2025-12-30 17:07:00', 3, 'active', 'c6948eeb-5b78-4113-a462-5dd3b42270a1', '2025-12-30 12:08:06'),
('a5f0a3d0-44be-4cdd-8f8f-ded7c5b10798', '41d8e1b3-e911-4eb7-b963-5b41b3cae0ba', 'c9a1a192-bbb1-4766-b231-8eadb164b6c8', 'Sarah', '1010101010', '2025-12-30 04:28:00', '2025-12-30 16:28:00', 1, 'active', 'c6948eeb-5b78-4113-a462-5dd3b42270a1', '2025-12-30 04:28:16'),
('a74d00aa-f238-43b2-9f1b-4da5de81da67', 'b3d40002-43a5-4f5b-8b82-ac9cdcb2e89a', '53d8cd5e-76d7-4b52-b4a6-a4bd52867868', 'Ben', '2558889656', '2025-12-28 11:00:00', '2026-02-17 11:00:00', 2, 'active', '381f609e-7042-4d4a-9782-f9b267379c04', '2025-12-29 05:30:34'),
('aff65475-7acb-4ec2-98e3-6be5440dc120', 'bf375421-462e-4206-8e3d-6bfca73c381b', '0a815513-f60f-4fc3-aa21-16b83f8628be', 'Arnold', '4050607080', '2026-01-02 05:58:00', '2026-01-02 11:00:00', 4, 'active', '1328a448-5a0f-4d74-aae7-dfcc50c28593', '2026-01-02 06:00:54'),
('b7f0bb78-9fd4-4d3d-bba7-a3b347045f50', '41d8e1b3-e911-4eb7-b963-5b41b3cae0ba', 'c9a1a192-bbb1-4766-b231-8eadb164b6c8', 'Alice', '1212121212', '2025-12-30 11:13:00', '2025-12-30 17:14:00', 4, 'active', 'c6948eeb-5b78-4113-a462-5dd3b42270a1', '2025-12-30 11:14:38'),
('ba93adf4-eda5-4392-a692-4f2f6773c57e', '41d8e1b3-e911-4eb7-b963-5b41b3cae0ba', 'f80fa5e6-a3ab-4546-8dfd-77089ef93a83', 'Aleeta', '1313131313', '2025-12-28 01:56:00', '2025-12-28 15:46:00', 2, 'pending', 'c6948eeb-5b78-4113-a462-5dd3b42270a1', '2025-12-27 22:27:41'),
('c6419965-21d8-48d8-92b5-b4848f5f459b', 'c1b72cc1-60b9-41b6-82ab-c37829a839ff', 'a75b4171-9f01-4cb4-9eac-54b60e5ce17b', 'Lenin', '5656565632', '2026-01-03 05:20:00', '2026-01-30 05:20:00', 3, 'active', '5a11fbec-b14d-4eaa-bfd2-41a36d6ca21c', '2026-01-03 05:23:44'),
('c96f8dbd-8133-48e0-837f-134be2cc0609', '41d8e1b3-e911-4eb7-b963-5b41b3cae0ba', 'c9a1a192-bbb1-4766-b231-8eadb164b6c8', 'ALEETA', '2020202020', '2025-12-29 09:12:00', '2025-12-30 21:16:00', 4, 'active', 'c6948eeb-5b78-4113-a462-5dd3b42270a1', '2025-12-30 03:42:29'),
('d041ad6f-0c94-41bf-ac63-006205e29bcd', '41d8e1b3-e911-4eb7-b963-5b41b3cae0ba', 'c62dfd37-942e-4814-9369-b238727267c9', 'Albin', '6565656565', '2025-12-27 05:04:00', '2025-12-29 17:04:00', 2, 'active', 'c0e6ef7f-9a43-4193-b3bf-be12779fcfc4', '2025-12-27 22:33:23'),
('d1b566b3-5865-4ffb-920b-cd00be50026b', 'c1b72cc1-60b9-41b6-82ab-c37829a839ff', 'd2f38d04-c99c-430d-b3ed-20c1064b3742', 'Beth', '8754548720', '2026-01-03 05:32:00', '2026-01-30 05:32:00', 4, 'active', '5a11fbec-b14d-4eaa-bfd2-41a36d6ca21c', '2026-01-03 05:32:32'),
('d9197ade-a454-4264-8560-7d27772d72fb', 'b3d40002-43a5-4f5b-8b82-ac9cdcb2e89a', 'ed0149b9-5581-49d5-b725-2afad3124a56', 'Akhil', '4564567891', '2025-12-29 10:58:00', '2026-02-03 10:58:00', 1, 'pending', '381f609e-7042-4d4a-9782-f9b267379c04', '2025-12-29 05:29:00'),
('e0f50256-244d-422d-82c8-c0e2962d118d', 'bf375421-462e-4206-8e3d-6bfca73c381b', 'c9a1a192-bbb1-4766-b231-8eadb164b6c8', 'Sarah', '1010101010', '2026-01-02 05:47:00', '2026-01-02 13:47:00', 1, 'active', '1328a448-5a0f-4d74-aae7-dfcc50c28593', '2026-01-02 05:47:47'),
('efb9d8f8-4eb2-4c58-9b1b-becb58933157', '287a973d-ff6e-449c-be62-62fb9aeb09cf', '6a02507f-d5e7-4350-826a-eddc4d453d9a', 'Jk', '3569985865', '2025-12-30 06:05:00', '2026-03-10 06:05:00', 4, 'active', '9cd1f39d-e7f6-4f10-aca2-895e849d2778', '2025-12-30 06:05:31'),
('f4bb960b-1636-40c3-bf84-d5af7f9251bf', 'c1b72cc1-60b9-41b6-82ab-c37829a839ff', '419efdfc-ec76-43c1-a0c4-0b27c70fe086', 'Sarath', '9856563201', '2026-01-02 05:26:00', '2026-01-30 05:27:00', 2, 'active', '5a11fbec-b14d-4eaa-bfd2-41a36d6ca21c', '2026-01-02 05:27:10');

-- --------------------------------------------------------

--
-- Table structure for table `guest_otp`
--

CREATE TABLE `guest_otp` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `invitation_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `otp_code` varchar(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `guest_otp`
--

INSERT INTO `guest_otp` (`id`, `invitation_id`, `otp_code`, `expires_at`, `verified`, `created_at`) VALUES
('055d17a4-0c04-4c04-baa3-f0424a1ef253', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '546342', '2025-12-27 23:13:43', 0, '2025-12-27 23:08:43'),
('079fc549-d2de-4269-bc81-7c548bca71ea', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '216189', '2026-01-02 07:03:05', 0, '2026-01-02 06:58:05'),
('091d1b8b-4be6-4c70-a488-011636cf3b82', '3125ea92-91bf-4750-9a5b-e78726e4af08', '930016', '2025-12-26 18:42:44', 1, '2025-12-27 00:07:44'),
('0ae55e5e-20e0-4810-96fd-2c9c28fc23d8', 'f4bb960b-1636-40c3-bf84-d5af7f9251bf', '104353', '2026-01-02 05:43:06', 0, '2026-01-02 05:38:06'),
('10863003-f961-4ff9-9f5d-bab53da7ec84', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '113876', '2025-12-27 23:18:45', 0, '2025-12-27 23:13:44'),
('112dfefd-d272-49c3-aa6c-87d4a9d0dbdc', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '744457', '2026-01-03 04:47:05', 0, '2026-01-03 04:42:06'),
('15cfcba5-192a-428b-8502-e07384e25964', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '213743', '2025-12-29 06:12:19', 0, '2025-12-29 06:07:19'),
('1cd4b873-f86b-4997-9a6d-51b3b05370b0', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '961648', '2026-01-02 07:13:05', 0, '2026-01-02 07:08:05'),
('1e75992a-40ea-40df-805c-db2d078e6113', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '320640', '2026-01-02 07:54:05', 0, '2026-01-02 07:49:05'),
('21af9fef-177e-475d-8666-1fd5aa591190', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '535766', '2025-12-29 06:35:20', 0, '2025-12-29 06:30:20'),
('223f41d3-02db-4ecd-b7d0-1ea24dd9fa4a', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '368656', '2025-12-29 05:41:43', 0, '2025-12-29 05:36:43'),
('230fff18-1e6b-4f0a-b144-244ca6e27315', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '839017', '2025-12-28 00:08:55', 0, '2025-12-28 00:03:54'),
('24fbe8b8-8b1f-49a4-a47f-0ffed3258a98', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '316174', '2025-12-29 06:52:19', 0, '2025-12-29 06:47:19'),
('2873776d-3d20-4663-b87c-e7dd6d00e517', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '383027', '2025-12-29 07:03:20', 0, '2025-12-29 06:58:19'),
('2a2bd5f7-62c5-4a40-b812-d629024a1dec', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '658538', '2025-12-27 23:48:50', 0, '2025-12-27 23:43:49'),
('2ab270b9-b93d-4aa0-81a7-3eccf225cac5', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '942690', '2025-12-29 05:36:41', 1, '2025-12-29 05:31:40'),
('2b6522d3-5860-416a-9565-30c118acafdb', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '981387', '2026-01-03 05:15:13', 0, '2026-01-03 05:10:12'),
('2d7763d5-0288-4113-aa1d-fc445b797f4a', 'c96f8dbd-8133-48e0-837f-134be2cc0609', '237187', '2025-12-30 12:11:00', 0, '2025-12-30 12:06:01'),
('3084d86d-9d84-49b5-a11f-304d5142e8b8', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '832737', '2025-12-28 00:13:56', 0, '2025-12-28 00:08:56'),
('3499914b-7727-4743-b838-fe44e6f88223', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '246940', '2025-12-27 23:33:48', 0, '2025-12-27 23:28:48'),
('3590b622-8c9e-4cc4-a121-17f84cb5e48e', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '993232', '2025-12-28 00:03:54', 0, '2025-12-27 23:58:54'),
('380b8c2b-4689-4a02-bc3d-d51a6c670b43', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '818979', '2026-01-03 04:59:02', 0, '2026-01-03 04:54:02'),
('3cd62228-e950-4d32-8c08-065597b14714', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '474127', '2026-01-02 08:04:05', 0, '2026-01-02 07:59:05'),
('402fde7b-ba08-426a-86ba-3ca5edb08f29', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '266723', '2025-12-28 00:28:59', 0, '2025-12-28 00:23:59'),
('451d6cc6-4b7d-4843-a5ce-77e8b3a1d7bd', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '712151', '2026-01-02 06:57:05', 0, '2026-01-02 06:52:05'),
('4660c515-b42e-4a22-93c5-b3ec95d1594f', '3125ea92-91bf-4750-9a5b-e78726e4af08', '655055', '2025-12-26 18:21:51', 0, '2025-12-26 23:46:50'),
('48e76d0f-4afa-4384-b4e9-38abfc1903c2', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '429844', '2025-12-27 23:53:52', 0, '2025-12-27 23:48:51'),
('49b57df5-6925-4c10-8804-216a7241726a', 'aff65475-7acb-4ec2-98e3-6be5440dc120', '163227', '2026-01-02 06:06:08', 0, '2026-01-02 06:01:09'),
('4d4597e0-8609-4a8a-8e0f-99ca28d4a06c', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '309392', '2025-12-29 06:23:20', 0, '2025-12-29 06:18:19'),
('542d06ef-3acd-440e-84d5-658df1d2a706', 'f4bb960b-1636-40c3-bf84-d5af7f9251bf', '776606', '2026-01-02 05:48:09', 0, '2026-01-02 05:43:09'),
('597f1aca-4344-4d08-b8df-2bf781a57596', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '221998', '2025-12-27 23:23:46', 0, '2025-12-27 23:18:46'),
('5dd2bfd5-5958-43e1-a537-bde5ced46a19', 'f4bb960b-1636-40c3-bf84-d5af7f9251bf', '682747', '2026-01-02 05:54:08', 0, '2026-01-02 05:49:08'),
('5e233eb1-a8b1-4ce4-9bde-7e932a459a97', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '165124', '2025-12-29 07:09:19', 0, '2025-12-29 07:04:19'),
('61abc643-0a34-4d11-901c-38351d407d5a', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '495004', '2025-12-27 22:38:36', 0, '2025-12-27 22:33:36'),
('6439495e-14c0-4c02-a974-ac3c3dc5c7d8', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '654862', '2026-01-03 05:36:07', 0, '2026-01-03 05:31:07'),
('650b3923-e901-404c-8967-df537c0322bc', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '311935', '2026-01-02 07:33:07', 0, '2026-01-02 07:28:07'),
('67b486fb-c036-4436-b3ae-0052afb55a3e', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '453919', '2026-01-03 05:29:11', 0, '2026-01-03 05:24:10'),
('6a66e99c-ec0e-4ed7-a0bd-7ea748ad1189', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '945335', '2025-12-29 06:17:23', 0, '2025-12-29 06:12:22'),
('6cbc2e88-9df8-4093-8db5-cfbbaa3a3e9c', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '778480', '2026-01-02 06:41:09', 0, '2026-01-02 06:36:09'),
('6e1571d1-2557-4f25-97fd-fa90e6c47a8c', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '353576', '2026-01-02 06:15:22', 1, '2026-01-02 06:10:21'),
('6e66aea8-650b-433f-af2e-15250bfcfef5', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '514064', '2025-12-29 07:41:21', 0, '2025-12-29 07:36:21'),
('6f312864-5f93-40c5-b16f-adc37ff1f096', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '392140', '2025-12-28 00:18:57', 0, '2025-12-28 00:13:57'),
('742f359e-a180-45ab-91c4-967a35a13b97', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '427967', '2025-12-31 07:41:51', 0, '2025-12-31 07:36:51'),
('759b742d-47b5-4d1f-9659-d2be3ccc9d59', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '354956', '2026-01-02 06:26:05', 0, '2026-01-02 06:21:05'),
('76bfcdcc-bed6-499e-8f19-e9b42d0ae16c', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '910490', '2026-01-02 06:47:05', 0, '2026-01-02 06:42:05'),
('78abb690-efd2-4fca-83b7-e8fce90fd8f9', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '188467', '2025-12-27 22:48:38', 1, '2025-12-27 22:43:38'),
('79646ebe-05d4-4d14-86ff-bbb4ad1d8f50', '3125ea92-91bf-4750-9a5b-e78726e4af08', '177705', '2025-12-26 18:27:44', 0, '2025-12-26 23:52:44'),
('7dd68b93-4cbb-4133-b54c-d9a3d83fff8a', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '752430', '2025-12-29 06:06:47', 0, '2025-12-29 06:01:47'),
('848cb89c-5be6-4dd6-97e8-bfa783144b4b', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '472721', '2026-01-02 07:44:05', 0, '2026-01-02 07:39:05'),
('84ed9c3a-6f91-4199-aef6-ab52be033fb7', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '584468', '2025-12-29 05:51:41', 0, '2025-12-29 05:46:41'),
('89d71def-da29-4896-9c64-3977040795aa', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '867580', '2026-01-03 05:42:06', 0, '2026-01-03 05:37:06'),
('8a4c2685-53a7-4a6a-82e7-740a8b048eab', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '509360', '2025-12-29 07:20:19', 0, '2025-12-29 07:15:19'),
('8bc7e9e6-de16-49f3-8179-73b14b6cb003', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '661274', '2025-12-28 00:49:02', 0, '2025-12-28 00:44:02'),
('8db22e11-e86c-4a82-b62f-a28a9eceeef0', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '305207', '2025-12-27 22:43:37', 0, '2025-12-27 22:38:37'),
('8e99afd0-9f23-4853-9e83-94bf012ba698', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '180870', '2025-12-27 23:58:53', 0, '2025-12-27 23:53:53'),
('904ca594-1f20-495a-a33e-e9f05295a7b1', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '346230', '2026-01-03 05:09:03', 0, '2026-01-03 05:04:03'),
('908586d2-9b9a-4182-a000-efeb1c704685', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '109983', '2025-12-31 07:41:30', 1, '2025-12-31 07:36:30'),
('948600b9-46f9-4852-af9e-7a610bce1ee6', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '837353', '2025-12-27 23:43:48', 0, '2025-12-27 23:38:48'),
('9bfd39fc-1039-4506-8977-bd4118765fe8', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '468510', '2026-01-02 06:15:48', 0, '2026-01-02 06:10:48'),
('9f5635dd-ae6f-4c07-b112-d338e60d12fc', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '280283', '2025-12-29 10:34:20', 0, '2025-12-29 10:29:20'),
('a3155465-7efc-47b2-a622-9f0508a381fc', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '218352', '2025-12-29 07:30:19', 0, '2025-12-29 07:25:19'),
('a4762944-7931-4a5c-b6a5-c876ad1b8789', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '224863', '2026-01-02 07:38:09', 0, '2026-01-02 07:33:08'),
('a4a82f03-b69c-4dc9-837f-bc453bd46ad2', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '750208', '2026-01-02 08:24:05', 0, '2026-01-02 08:19:05'),
('a60918b7-f322-4278-94d9-07f84f08862a', 'd1b566b3-5865-4ffb-920b-cd00be50026b', '530413', '2026-01-03 05:45:08', 1, '2026-01-03 05:40:09'),
('a6804995-cc1c-458e-aae4-86da55196cbb', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '280421', '2025-12-29 06:29:19', 0, '2025-12-29 06:24:19'),
('aabcabc8-db63-4f7e-b7aa-dd725b3e9712', 'f4bb960b-1636-40c3-bf84-d5af7f9251bf', '742326', '2026-01-02 06:00:07', 0, '2026-01-02 05:55:07'),
('adf24d61-edc9-48f6-864a-d88060c287f0', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '262146', '2025-12-28 00:44:01', 0, '2025-12-28 00:39:00'),
('af4297c6-f9ff-4a29-8e2f-414e33d021d6', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '157331', '2025-12-27 22:53:39', 0, '2025-12-27 22:48:39'),
('af945efc-62d2-4ded-b30a-d72a8db7f328', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '823943', '2025-12-27 23:08:42', 0, '2025-12-27 23:03:42'),
('b5ec6cd5-06da-4ded-9629-5d191b8e0fc1', '3125ea92-91bf-4750-9a5b-e78726e4af08', '885044', '2025-12-26 18:37:44', 0, '2025-12-27 00:02:44'),
('bcda936d-a761-4683-8402-1786f9c1168f', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '498807', '2025-12-27 23:08:42', 0, '2025-12-27 23:03:42'),
('bce9fa16-0b21-410b-a989-527b5158e81b', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '778599', '2025-12-27 23:28:47', 0, '2025-12-27 23:23:47'),
('be0e0d92-67ae-4db0-875d-cfe653d0e1f7', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '171739', '2025-12-28 00:34:00', 0, '2025-12-28 00:28:59'),
('c0703b31-8996-4ea3-ab7a-0e3022507c43', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '876677', '2026-01-02 08:14:05', 0, '2026-01-02 08:09:05'),
('c326906d-2a7f-4fc4-b2d2-a89d79a1a852', 'f4bb960b-1636-40c3-bf84-d5af7f9251bf', '409096', '2026-01-02 05:37:26', 0, '2026-01-02 05:32:26'),
('c73156c3-3abb-4a34-a014-c68a2a404ad7', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '953195', '2025-12-29 06:01:45', 0, '2025-12-29 05:56:45'),
('c8b3b8d0-9337-43d4-a3d1-7b0da4bba7ed', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '537130', '2026-01-03 05:22:55', 0, '2026-01-03 05:17:54'),
('c8e5ef79-b22b-4116-9df5-dbeabd67fa9d', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '930656', '2025-12-27 22:58:40', 0, '2025-12-27 22:53:39'),
('d71d15a9-31ac-485c-8901-354e8e690ac5', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '156243', '2025-12-29 06:46:22', 0, '2025-12-29 06:41:21'),
('d929368f-812e-4ab6-b5ad-61c4a51295ce', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '188185', '2026-01-03 04:53:05', 0, '2026-01-03 04:48:05'),
('db2bb37b-d53f-4f07-bc65-b50bb6b380b8', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '438026', '2025-12-29 05:56:43', 0, '2025-12-29 05:51:43'),
('df66c7c9-60d7-4675-979b-e6c0508ab928', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '782281', '2025-12-29 06:41:19', 0, '2025-12-29 06:36:19'),
('e0b02582-5fda-490b-a01a-df30b0e5c045', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '529112', '2026-01-02 06:36:05', 0, '2026-01-02 06:31:05'),
('e5942e0a-77a0-4f95-a7dd-4ff6945db4f0', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '240040', '2025-12-29 07:36:19', 0, '2025-12-29 07:31:19'),
('e5a3df9c-9df8-4856-a5a5-d9fc609fd184', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '521523', '2025-12-29 07:47:20', 0, '2025-12-29 07:42:19'),
('ead15ac3-22d9-4e42-89a6-3e26792e7314', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '338316', '2025-12-28 00:23:58', 0, '2025-12-28 00:18:57'),
('eb62d481-9f48-43c9-9519-6e75e05f0736', '607d1f41-2fd7-4cd0-ad4e-7abe6ed6d59c', '946212', '2025-12-30 12:22:49', 1, '2025-12-30 12:17:49'),
('f1e46ff4-5e9e-412e-aabb-9820d28f0b83', 'f4bb960b-1636-40c3-bf84-d5af7f9251bf', '292717', '2026-01-02 05:32:23', 1, '2026-01-02 05:27:23'),
('f74a4b85-a30a-47e6-9890-edaab9224731', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '507696', '2026-01-02 07:23:05', 0, '2026-01-02 07:18:05'),
('fc90b289-7246-4c42-a97a-d19b72564643', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '855483', '2026-01-03 04:41:36', 0, '2026-01-03 04:36:35'),
('ff69e363-013e-478a-9913-2c04bccf08f9', '14f6841c-4b66-4357-8cd7-12f8b52eb8ee', '218599', '2026-01-03 05:54:51', 1, '2026-01-03 05:49:51'),
('ff757bbe-01b9-4e88-9fc9-84819bc2c515', '3125ea92-91bf-4750-9a5b-e78726e4af08', '835683', '2025-12-26 18:32:44', 0, '2025-12-26 23:57:44');

-- --------------------------------------------------------

--
-- Table structure for table `guest_qr_session`
--

CREATE TABLE `guest_qr_session` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `invitation_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rotating_key` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `guest_qr_session`
--

INSERT INTO `guest_qr_session` (`id`, `invitation_id`, `rotating_key`, `expires_at`, `created_at`) VALUES
('03682e40-e4b5-47cb-9ba0-6b0dd965e5a3', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '7d62215ee8cbf4a25427c4dc75bf20d2', '2025-12-29 06:57:19', '2025-12-29 06:52:19'),
('0406dcb6-0b70-42f2-a641-0f68ccdaebcb', 'e0f50256-244d-422d-82c8-c0e2962d118d', '2e0c9aa54e22e1285b3214c7122fd798', '2026-01-02 13:03:35', '2026-01-02 12:58:35'),
('04a6d3e2-a8fd-43de-b3e8-aa4e9aa54561', '3125ea92-91bf-4750-9a5b-e78726e4af08', '0a1fd652104799059c0c5960c0775b82', '2025-12-26 18:21:51', '2025-12-26 23:46:50'),
('04fbe04d-d73c-45e7-95c8-b16d7bc01e1e', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '621579ec2471ef877e213cf0bcc7cc90', '2026-01-02 08:14:04', '2026-01-02 08:09:04'),
('0abfb2dd-ea25-46f1-ae60-6ad4ee3256ed', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '0fc96837043bb86f4c7237a977d40448', '2026-01-02 07:38:06', '2026-01-02 07:33:06'),
('0ad245ef-304f-4032-beab-b890f0d6b2cd', 'e0f50256-244d-422d-82c8-c0e2962d118d', '66c39cbb9acaaf121687a942c99db375', '2026-01-02 13:45:35', '2026-01-02 13:40:35'),
('0c81ffea-3db5-4508-944c-f05e1fb457e5', '3324824e-43a1-46c8-b90a-bbce58923720', 'd87903dbd364058965912f6caf43301e', '2025-12-27 06:51:33', '2025-12-27 06:46:33'),
('0cd26b63-c39c-49fc-b9fd-b627b0372ce0', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '2f5474ffcc4bf06d997f670d3071cdf1', '2025-12-29 10:34:19', '2025-12-29 10:29:19'),
('0cf14462-0da6-4194-8a32-6f82384491b5', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '6e8aeba8207b298890254c2ebd3d28ec', '2026-01-03 04:41:34', '2026-01-03 04:36:34'),
('0cf5558b-5584-4d75-b809-5e1bc28cc295', 'a5f0a3d0-44be-4cdd-8f8f-ded7c5b10798', 'b0ad12318fd33bad8eb8d5907817ac27f6416ac8a06e84289f5c263a1e67e3b0', '2026-01-02 06:04:15', '2026-01-02 05:54:15'),
('0d19eb04-8b47-4d48-bb62-1e099d723c63', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', 'c5314880bbbd9875fdfb021025417a3a', '2026-01-03 05:58:02', '2026-01-03 05:53:01'),
('0d527261-1d2f-47e2-87a0-674b435d85ae', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '2ff684032626d9de7d4a4943dd80e47b', '2025-12-28 00:03:53', '2025-12-27 23:58:53'),
('0da7f844-bfa5-499a-a2b9-0137ff19d98c', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '6c6f529b4a0eccc33979160f67680ab4', '2025-12-31 07:43:11', '2025-12-31 07:38:11'),
('0df2898a-7dd1-4847-89be-1fb90f08eccb', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', 'fb5da07d3a182211e2e77dd47b43e373', '2025-12-31 07:05:11', '2025-12-31 07:00:10'),
('0e4c2e94-3523-4ba4-b5de-20776e7be1b6', '2e416eba-4d31-4157-99ad-b109b7453f37', 'd55346069e3d16fb70ec116186ff1692', '2025-12-30 07:20:14', '2025-12-30 07:15:14'),
('0e87a0c0-140a-49f3-aeb9-2badeb1417da', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '23bf18633d2259690f48bbf2072a1e20', '2025-12-31 07:32:12', '2025-12-31 07:27:11'),
('0ea4b805-0c5b-42ec-9cbd-cecff8167dfa', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', 'b7b4447cdeb4b4978fa3cfd1f8271208', '2025-12-31 04:44:55', '2025-12-31 04:39:55'),
('0f882d90-e894-4e88-80cd-92558b487c67', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '68e5c7bfd94551548e9546d636ec48f2', '2025-12-27 23:53:51', '2025-12-27 23:48:51'),
('10b7b801-f3f6-4274-8ce4-a627c4a6e4d9', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'eaa87ff7663751eae1d9f0df9d7d0b1b', '2026-01-02 06:52:35', '2026-01-02 06:47:35'),
('10cd61d1-1c1c-491a-a466-49dfc676a74a', '2e416eba-4d31-4157-99ad-b109b7453f37', '5275c485b2ad037de1daba94bbe053a7', '2025-12-31 04:44:55', '2025-12-31 04:39:54'),
('12243d2c-e860-4a63-8460-4c2444c5432f', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', 'b929b5c4bbc9643b5f8d83118644237a', '2026-01-02 06:15:05', '2026-01-02 06:10:05'),
('12374cad-2e93-4210-885f-774f015ae102', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '309917a67b4fe20d05abaa54626e9f19', '2025-12-30 07:00:15', '2025-12-30 06:55:14'),
('1429cf0f-2831-42e2-bfe0-c39fdc705eb0', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '3b0a2e382311e411695f3e859ef868e4', '2026-01-02 07:59:04', '2026-01-02 07:54:04'),
('1617e26d-1687-435b-aaa5-67af0e9a38ff', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', 'f313406123fe550f6e1b95f881ba1289', '2025-12-27 23:48:49', '2025-12-27 23:43:48'),
('1648ec84-3584-4d0b-aac5-e23800be6a4d', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '5f54381cc8e229ac4eccf49396f9d1a0', '2026-01-02 07:49:04', '2026-01-02 07:44:04'),
('16d0d6f1-5356-4b41-bdfd-6247b561716a', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'debf99554150613573a5bee7c3ca10aa', '2026-01-02 05:58:40', '2026-01-02 05:53:40'),
('1713092c-1e33-4f9b-b482-0e9c94713880', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', 'e92aee1d158645ea75ce1c1281d21b0a', '2026-01-03 06:03:03', '2026-01-03 05:58:03'),
('17681cd4-97dd-4f3b-a3e2-cfe670d3acc2', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '6d9cb5e5015df83cd26f332291e4d254', '2025-12-31 06:59:15', '2025-12-31 06:54:14'),
('17c4527e-f437-4397-9e8a-ace383d5e8dc', '2e416eba-4d31-4157-99ad-b109b7453f37', 'f3e4a93c336ee497537a7bb18e53ef28', '2025-12-30 07:14:16', '2025-12-30 07:09:15'),
('185ff6b2-a256-4397-8751-466b615e7947', 'e0f50256-244d-422d-82c8-c0e2962d118d', '7fd31191eed1c86b1b41d360380b6b50', '2026-01-02 08:33:35', '2026-01-02 08:28:35'),
('18bbd514-8658-4dea-8a9b-d586a538fe8b', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', 'b92972eec2ff8dff2ef0cfc86ad8868d', '2025-12-29 06:06:48', '2025-12-29 06:01:48'),
('19442174-7b67-4f58-9881-49b1a04422de', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'ee8cf359a2b369136b946c182d74e6d4', '2026-01-02 11:09:35', '2026-01-02 11:04:35'),
('1988f6ca-2182-4c82-959c-cbe8b8872371', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'b484192e7d9c1636f6ad86f6f4f12680', '2026-01-02 10:27:35', '2026-01-02 10:22:35'),
('199e8529-dde5-4653-98c2-71d5b1c43c0f', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'cb4e2ec076d6d225daa8ca1a9e0727ee', '2026-01-02 08:21:35', '2026-01-02 08:16:35'),
('1d9bcac6-ee77-4aed-901f-3b928cb56da7', '3125ea92-91bf-4750-9a5b-e78726e4af08', '6789937ba9726be369f7548bd8fbac27', '2025-12-26 18:27:44', '2025-12-26 23:52:44'),
('1e93b65d-68d9-47db-a780-6921e61d81e4', '69c9bbd2-0f6e-4e9c-bb1e-f461c3de51a5', '2f371764ead6b04f071e8d1d4ccaa784', '2026-01-02 05:37:08', '2026-01-02 05:32:08'),
('1f403b23-ed9b-45e2-afac-8ebc90119aa1', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '810e3470e02bc3d93d06d3036d630868', '2026-01-02 06:45:08', '2026-01-02 06:40:08'),
('211dcf63-28c6-4a11-9d7a-ec18499073ba', '2e416eba-4d31-4157-99ad-b109b7453f37', 'eb652467f9b513f8cbd48336192eda6f', '2025-12-31 06:42:14', '2025-12-31 06:37:15'),
('212c94f2-1127-4d65-b3ca-53f9ae1b629c', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '2ef0b454ed7b98034b94e9366e42b018', '2025-12-30 06:55:14', '2025-12-30 06:50:14'),
('214da367-ac02-4ee6-b4fe-894c9b60c722', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'a9842fc76c05d799705c915db8fb32f5', '2026-01-02 05:52:57', '2026-01-02 05:47:57'),
('22063bed-f322-4a2d-99e0-05058595bcb8', 'e0f50256-244d-422d-82c8-c0e2962d118d', '13e2d70c4f7df0e1bcefe29129f85f8b', '2026-01-02 07:04:34', '2026-01-02 06:59:34'),
('22896eec-97be-4b38-8b3e-39139320a8eb', '2e416eba-4d31-4157-99ad-b109b7453f37', '78b19685e77e31c544fe1ec2a57a1622', '2025-12-31 07:32:13', '2025-12-31 07:27:13'),
('234f96a6-def4-4ad0-a2b2-27535badf5af', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '08a46a5d116ad4e179e6f83c5c3e0229', '2026-01-02 07:13:04', '2026-01-02 07:08:04'),
('236d30a8-d99f-4ac4-8189-3db915bb674c', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '82c67d6eec688c3abd0f4122daac0ed8', '2025-12-31 04:50:12', '2025-12-31 04:45:12'),
('246cf881-dc28-4261-9e2e-7698dc1cf18d', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'a793cf8d977740729687edb0fdf3f984', '2026-01-02 11:45:35', '2026-01-02 11:40:35'),
('24ff66b4-bde1-448d-bd1b-c84c82be2114', '2e416eba-4d31-4157-99ad-b109b7453f37', '7b98924b45dc84408d0411679626cb86', '2025-12-31 07:27:11', '2025-12-31 07:22:11'),
('25b24bb0-06cc-4c9b-9ef3-519d5bb182e2', '2e416eba-4d31-4157-99ad-b109b7453f37', 'da1ffa979bee61f9408992ccbb38627f', '2025-12-31 05:01:11', '2025-12-31 04:56:11'),
('26d1c79a-bf5b-4391-8b57-fc14fce59f63', 'e0f50256-244d-422d-82c8-c0e2962d118d', '8a362ed7029711f330b97af82a33ea7a', '2026-01-02 09:39:35', '2026-01-02 09:34:34'),
('27d2e249-27dd-46b0-906e-90df35ae1adb', 'e0f50256-244d-422d-82c8-c0e2962d118d', '8d6177364ef5b63f9f2f6993f632a77c', '2026-01-02 08:51:35', '2026-01-02 08:46:35'),
('28cdb6f0-152c-4b0d-95d0-68e01916c8b1', '3324824e-43a1-46c8-b90a-bbce58923720', 'fff2f48907d32489c305a30a94733c31', '2025-12-27 11:29:25', '2025-12-27 11:24:24'),
('2950c3db-fd6a-4756-b56e-1e6d98287cf8', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', 'e1aa9c840a3556e45e6f548c028bb743', '2026-01-02 06:29:08', '2026-01-02 06:24:08'),
('2ad2a03e-e846-4dae-abcc-5254486133a9', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', 'ebc355fb53c59de9eba0efedfc87d1f1', '2025-12-30 07:06:14', '2025-12-30 07:01:14'),
('2b535e8e-5ccc-4c5e-8229-854e72be0bc2', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '1543012936cfe88b46c369f101a7436d', '2026-01-02 06:04:00', '2026-01-02 05:59:00'),
('2ca92285-71ba-4a49-bef0-bb5aaa17a761', '3324824e-43a1-46c8-b90a-bbce58923720', '6ea65f7f0f44bd9864626e34371aa66a', '2025-12-27 11:39:26', '2025-12-27 11:34:25'),
('2cbacfc2-8b1f-418b-b0af-0ca314257a59', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '5f6c7b7e56eeec8e035c992cec01fcb2', '2025-12-30 07:11:17', '2025-12-30 07:06:16'),
('2da4ee64-9a67-4345-a4e8-76db7ef47d26', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', 'b1831541ed0f4784fbb4166678fb4026', '2025-12-29 06:52:18', '2025-12-29 06:47:18'),
('2e8b979a-fdee-46dc-a461-2b557725755c', '3324824e-43a1-46c8-b90a-bbce58923720', '963a78752cc7bc159514c4deca50c727', '2025-12-29 05:01:29', '2025-12-29 04:56:29'),
('2efd76a6-83dc-4bf2-b363-24d2c8d58f1b', 'e0f50256-244d-422d-82c8-c0e2962d118d', '1fa618e0cae9ce1c1de3a85d4277fa3b', '2026-01-02 08:15:35', '2026-01-02 08:10:35'),
('2f1cd840-3444-4911-85ee-f29e783dd8be', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', 'e9c761363bbab436890638b6668786de', '2025-12-31 07:21:12', '2025-12-31 07:16:12'),
('2fd8c8ad-62b4-4721-9a1c-9d9bc2cc9cee', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '744451a6ca386ebf21c2972e6f731c88', '2025-12-30 07:17:14', '2025-12-30 07:12:14'),
('303e745e-6898-4149-9574-056daf9e25fc', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '8aeb704f88e2070e71545f3bec5c3918', '2025-12-27 22:48:37', '2025-12-27 22:43:36'),
('30752e88-6f61-4f86-82fe-28159e03ec90', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', 'c9551afbe30450b8055f2eaf77572dce', '2026-01-03 05:22:53', '2026-01-03 05:17:53'),
('30f81c34-b4c0-4d1d-9d73-19b0089f25b0', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', 'd028468f5b74254011bfac44d60bc1cd', '2026-01-02 07:33:05', '2026-01-02 07:28:05'),
('314bcd23-3aeb-4ac6-b771-a414841d1773', '69c9bbd2-0f6e-4e9c-bb1e-f461c3de51a5', '314ceffe288a934f2e52bb87ee974279', '2026-01-02 05:49:05', '2026-01-02 05:44:05'),
('3174ade8-d842-4c30-a1b8-159dfd45245e', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', 'b8143c40e189f2a0ebb918af53620bf2', '2026-01-02 07:58:06', '2026-01-02 07:53:06'),
('336466df-4c47-4010-aaa2-a98b79cb6f1b', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '0f5e8927f6af4048e42dd66997e4c42e', '2026-01-02 07:48:06', '2026-01-02 07:43:06'),
('343729e7-db02-45c6-ae86-89d128df113e', 'e0f50256-244d-422d-82c8-c0e2962d118d', '94b346b3bf471e88dde3c599f8126a38', '2026-01-02 11:39:35', '2026-01-02 11:34:35'),
('349614e7-a3b6-4dcc-9a09-45c0507d11e8', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '64223bff60737441bd129bbe1413ad9b', '2026-01-02 06:09:03', '2026-01-02 06:04:03'),
('3499d4e8-55ac-46fb-baf5-29f3cfb2f8c6', 'f4bb960b-1636-40c3-bf84-d5af7f9251bf', '12be1d55f2fb84941011f42d30c209a2', '2026-01-02 06:00:05', '2026-01-02 05:55:05'),
('357f9d5c-619b-4967-b37b-37e66feef5be', 'e0f50256-244d-422d-82c8-c0e2962d118d', '1708123144bd6661099c102973af9fc58b0ad2d6cb3881531c3a67882e307894', '2026-01-02 06:08:41', '2026-01-02 05:58:42'),
('37f68a6a-8eb1-4ee7-b12c-927759c84f04', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', 'ec74dbfa1c39c06a46e824f2d73d3f37', '2025-12-31 05:58:17', '2025-12-31 05:53:17'),
('380d7cd0-aa8e-47e5-968b-e70c72009c6a', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '658b997d4afcde9d7555c5ca5fd8d397', '2026-01-03 05:10:02', '2026-01-03 05:05:02'),
('384d7e41-ef69-4892-ad2f-8d3b780e5fc4', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '70f6c54891e55b2b208841b4409c160c', '2026-01-02 07:53:06', '2026-01-02 07:48:06'),
('385ae217-b1eb-4927-9da4-757e136d4f70', '2e416eba-4d31-4157-99ad-b109b7453f37', '4070f9330bcb2aedab18c7598789000c', '2025-12-31 07:43:10', '2025-12-31 07:38:10'),
('38c068bb-9694-4aae-bbcf-c04aded567be', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '31c93eb7770c9f1b5e20ec3bd97a5826', '2025-12-30 06:16:14', '2025-12-30 06:11:14'),
('3926d274-221d-4b52-a813-322cd73a2e99', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '6fb35ab9d4297cd8df4e82e20ded8f58', '2025-12-31 04:55:14', '2025-12-31 04:50:13'),
('3971061d-19a8-4bb9-a6c6-d76764c0f43c', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', 'e5d7387806ead34ce7485ec56d1e54e0', '2025-12-31 06:04:13', '2025-12-31 05:59:14'),
('39e39039-639e-497b-a980-46a168aefdda', '3324824e-43a1-46c8-b90a-bbce58923720', 'b1c98fbfdbb111d1a8586954087be151', '2025-12-27 07:02:27', '2025-12-27 06:57:26'),
('3a1fac74-af0a-44f0-90de-1acf1e0d33ee', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'ebcf97e5940c92fd49b102d3c938c952', '2026-01-02 10:09:35', '2026-01-02 10:04:34'),
('3a9e11b4-ad99-4ba9-87dc-a172471637b2', 'e0f50256-244d-422d-82c8-c0e2962d118d', '87a3400743e5a559c6e179c9bf82bdd7', '2026-01-02 13:27:35', '2026-01-02 13:22:35'),
('3b2e0d78-8761-4a04-a2b5-8fc7d34d407d', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', 'badca64f89ca11ca61e7cc9bf9257f4d', '2025-12-29 07:47:19', '2025-12-29 07:42:18'),
('3b322681-9ea7-4565-bb86-a64dc80868fa', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '420d9632a68c730fc28e09f445243884', '2026-01-02 07:54:04', '2026-01-02 07:49:04'),
('3b4f902f-e699-4ec3-ac06-ffc715324c8a', '3324824e-43a1-46c8-b90a-bbce58923720', 'bc87480b2740f8d9521600d17115c23c', '2025-12-29 04:56:28', '2025-12-29 04:51:28'),
('3b562f12-adc3-4879-8503-35fcf0c77b23', 'e0f50256-244d-422d-82c8-c0e2962d118d', '543be3bba34185978170e90f93b2e41f', '2026-01-02 12:15:35', '2026-01-02 12:10:35'),
('3b787063-0fb1-4540-b567-fa3545c8710d', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', 'a377088038c004c69f35974acb3b1ee8', '2025-12-28 00:44:00', '2025-12-28 00:38:59'),
('3c2aaf7b-f3ad-4bd2-a51f-50a5dabf3b36', 'a5f0a3d0-44be-4cdd-8f8f-ded7c5b10798', '5092353e4354a2e1306528339c77bb1c2ccf30d24409be1c9e12a65e472dcecc', '2025-12-30 12:15:16', '2025-12-30 12:05:16'),
('3c425a5a-5747-469a-a173-db161fa04b0a', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '5f2cc68ccc7e840198415ce9ebb0cc87', '2025-12-31 05:11:11', '2025-12-31 05:06:11'),
('3c46e319-e098-4fad-8556-ed6e808e562f', '3324824e-43a1-46c8-b90a-bbce58923720', '83f5793cea0d423af837643accaacf0a', '2025-12-27 11:07:25', '2025-12-27 11:02:24'),
('3cb5b74d-2a5e-44ef-ba58-ab5a103e066b', 'e0f50256-244d-422d-82c8-c0e2962d118d', '2eca9737b79e6b51837e84a0bcececd7', '2026-01-02 12:03:35', '2026-01-02 11:58:35'),
('3d25c9f8-5056-4d8c-9329-a9f3a147e5d3', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '77c490cac979a16a92c480d4199a5910', '2025-12-29 06:12:19', '2025-12-29 06:07:18'),
('3df500c9-57b7-4423-b179-48503863e55b', 'e0f50256-244d-422d-82c8-c0e2962d118d', '5b0dd13dbc9d2bcfe1c3f3d8179c799f', '2026-01-02 11:33:35', '2026-01-02 11:28:35'),
('3e6ccbf3-fa26-4731-a08d-52ad7d99e8a6', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '2fdf04749121a5dbfd336ad1b0db799d', '2025-12-29 07:30:19', '2025-12-29 07:25:18'),
('3f08a435-93a8-4703-b0db-7e0ebeca9588', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '46e4504ec9c15af2ae750cf0f224d69d', '2025-12-29 05:56:45', '2025-12-29 05:51:44'),
('3f787484-225b-4984-9ae5-440ae32d5ce2', 'a5f0a3d0-44be-4cdd-8f8f-ded7c5b10798', '10e3a45e23a84fb23af34316c13d8ec09609f8825f1ce7f253ac0204ac0aa183', '2025-12-30 11:26:03', '2025-12-30 11:16:03'),
('3f887c47-d2a3-4e72-8180-a178ae64dd15', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '0694808d402d01afaf45a284534adcef', '2026-01-02 06:36:04', '2026-01-02 06:31:04'),
('40745ff7-15e2-4c9e-81c6-b4ffb775d659', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', 'fa255bbf4cf9f8cb0ee5acd44d849bc8', '2025-12-30 07:33:14', '2025-12-30 07:28:14'),
('40899d41-ec10-47ee-8301-29094d796c65', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '43cf229af9ac9f20b10a637423a8ab05', '2026-01-03 05:47:05', '2026-01-03 05:42:05'),
('40dbff51-efd5-413a-b4f3-683e72e57080', '2e416eba-4d31-4157-99ad-b109b7453f37', '01c879430c726e27c4bc571aefa7af9a', '2025-12-31 06:10:15', '2025-12-31 06:05:15'),
('41a7e1ec-5bd5-4c63-9d7b-2da2b7af7f7c', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '22abb191d2c82acacf4c84b4e953412b', '2025-12-31 06:37:15', '2025-12-31 06:32:15'),
('41b13e30-5c8f-4a88-8e0b-0592b0f34859', '2e416eba-4d31-4157-99ad-b109b7453f37', '41bd344919c2cf25c04291be9016b4f5', '2025-12-31 05:06:11', '2025-12-31 05:01:11'),
('41fbe2aa-df6b-4a81-b9e5-d2a9aee1b2f5', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '096667b58d7251b40747f4d07724d373', '2026-01-02 08:24:04', '2026-01-02 08:19:04'),
('4203ce26-1b5c-4ec8-8936-c022cf13e07e', '2e416eba-4d31-4157-99ad-b109b7453f37', '010087ad390a4e1bb2341b9f00c3c911', '2025-12-30 07:25:17', '2025-12-30 07:20:17'),
('424cc030-ceee-4101-a6cc-e0277bde8c25', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '8e79bed805cdfd27193112f5eca29990', '2026-01-03 05:29:09', '2026-01-03 05:24:08'),
('43b8cdb2-bae1-47ba-a0db-f391bb3f0925', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', 'df246d9dd01906df006cd839053177ae', '2026-01-03 05:04:02', '2026-01-03 04:59:02'),
('456cfbe4-c03b-428d-8ea8-40f2c4804ebc', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '6b2ed354ae1c417c49bd306f7c0b9106', '2026-01-02 06:14:04', '2026-01-02 06:09:04'),
('46099d39-b25c-4a4c-9711-fa559b626e1e', 'e0f50256-244d-422d-82c8-c0e2962d118d', '1ec44762256a6a84e5cb1356895691e4', '2026-01-02 09:03:35', '2026-01-02 08:58:35'),
('46b5c91c-3ae2-4571-b0bf-2c23c2966255', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'd3467d340ce090928d43ef4fb4c6af19', '2026-01-02 09:51:35', '2026-01-02 09:46:34'),
('47ca6463-d698-4858-a3a1-e31b5a118a06', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '8e50bba1fe747fb008e25f41807d5345', '2025-12-29 06:01:47', '2025-12-29 05:56:46'),
('48edba5a-0d2a-4370-8e92-dc97583396d6', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '8fb79a8f7360b6d5945220c95c38c26d', '2025-12-28 00:38:59', '2025-12-28 00:33:58'),
('49991b6c-b5d0-43f5-b8dd-2438f65888a4', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'e676032a5f4b4e2f3c411aed23a84578', '2026-01-02 07:40:34', '2026-01-02 07:35:34'),
('4b1a1ade-0895-488d-a8fd-383948eff93a', 'e0f50256-244d-422d-82c8-c0e2962d118d', '66b0c795013c352a972f7e4d40e49244', '2026-01-02 07:45:34', '2026-01-02 07:40:34'),
('4b3a7885-09db-42f5-b1fe-349a1c693557', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '85b88294c42ee811699a3aadf2282419', '2025-12-31 07:26:12', '2025-12-31 07:21:12'),
('4b9cf22b-2391-45d9-9fe6-e853bb25e564', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '49513104978504264105113b17dddd0d', '2025-12-30 06:10:42', '2025-12-30 06:05:42'),
('4cbd5010-bf5f-4f19-b14e-d57ab1672ca5', '3324824e-43a1-46c8-b90a-bbce58923720', '5019f98b7b6cca3815e84eab95641532', '2025-12-27 06:57:26', '2025-12-27 06:52:26'),
('4d10ff41-26f5-476a-94cd-b21e07bdfe1a', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'f259dec4f634d48ca78a8d5cc67ea45d', '2026-01-02 13:09:36', '2026-01-02 13:04:36'),
('4da1e4d8-d6ed-458b-88f7-4e5636d7302d', '2e416eba-4d31-4157-99ad-b109b7453f37', 'eda563b237c7ee79e8dd8898ad088cae', '2025-12-31 05:59:13', '2025-12-31 05:54:13'),
('4e7e01f2-ca0a-45db-a040-90b44edf59fa', '2e416eba-4d31-4157-99ad-b109b7453f37', 'ba7e632eeb547e24287ff1782e49801c', '2025-12-30 07:36:14', '2025-12-30 07:31:14'),
('4f8e2a79-1ed4-4f6b-b9b8-67c46b03a3f7', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'fd84369da8914d11fc8a3208fda45874', '2026-01-02 10:57:35', '2026-01-02 10:52:35'),
('50019587-b31e-4f80-9371-c682e46048c0', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', 'cb70b7e28331f85bd4432217fa965a45', '2026-01-02 06:10:04', '2026-01-02 06:05:04'),
('50dd7a52-437f-4006-853b-9c3465636ce2', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'c07f9e940318aeb6d19c2cd49562b612', '2026-01-02 07:50:34', '2026-01-02 07:45:34'),
('51f4e096-1ceb-44aa-9cd3-af412a9eed97', 'e0f50256-244d-422d-82c8-c0e2962d118d', '21d4fb386ac22a45e3ce25a39fe70902', '2026-01-02 12:45:35', '2026-01-02 12:40:35'),
('524dbf5a-f37e-4d2b-a72d-259e16373ebd', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'bcc01d61ab33f207d2033fdfbcdac9f7', '2026-01-02 06:03:42', '2026-01-02 05:58:42'),
('526a436b-a841-43d6-aec1-8d16e6b88765', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '4d3e8d1773c9d185efe552b61e68e8ac', '2026-01-03 05:22:54', '2026-01-03 05:17:54'),
('528f109e-0d6d-4351-b797-ab217ed9fe01', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '6ece87fa96bf3aaa74ff8ca5d67d0a8f', '2025-12-27 23:43:48', '2025-12-27 23:38:47'),
('530d0eb3-f1d0-47e6-9d85-7b9f7ee81add', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '7fe0d89ae97cac83ef8ef25c5ac5b6d2', '2026-01-03 05:53:01', '2026-01-03 05:48:01'),
('5358d0e5-e703-43c4-b8ea-5f04144b3833', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', 'bc6b1aef6a47a40736c0776113d7bdd3', '2026-01-03 05:42:02', '2026-01-03 05:37:02'),
('5384b5df-30f4-47e5-ab28-657736dac896', '69c9bbd2-0f6e-4e9c-bb1e-f461c3de51a5', 'a1273a1952af734533a4f05420c11b00', '2026-01-02 05:43:07', '2026-01-02 05:38:07'),
('5418cd85-04d2-4020-b417-e28379ea7b54', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '4a4cc72c551494f903ef5b453d5b91c0', '2026-01-02 08:03:06', '2026-01-02 07:58:06'),
('5459c938-92aa-4503-a6e1-843395815279', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'b438086ed3ac8afae39bded53c9b3bbe', '2026-01-02 10:15:35', '2026-01-02 10:10:34'),
('546adb32-ad94-451e-a2b5-66c807fcd3e5', '2e416eba-4d31-4157-99ad-b109b7453f37', 'f5fdb1251606bebb35744544bc18f29c', '2025-12-31 05:53:18', '2025-12-31 05:48:18'),
('551834bf-cd58-4bbd-87be-6bbe702bf6c1', '2e416eba-4d31-4157-99ad-b109b7453f37', '70a01565d8fae52d9784c9ac7762ea9a', '2025-12-31 06:59:14', '2025-12-31 06:54:14'),
('57894344-e9a1-4917-b3dd-317792ddac6c', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', 'ea71f5930b569c4a88c1663d38ef6391', '2026-01-02 06:57:08', '2026-01-02 06:52:08'),
('57b486ef-9267-4463-94ce-8dc985800d09', '69c9bbd2-0f6e-4e9c-bb1e-f461c3de51a5', 'aea1e637a4d0a44f39fc4634e1b0c19a', '2026-01-02 05:26:35', '2026-01-02 05:21:34'),
('58bf97a4-0698-45aa-905d-e796b8b6498f', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '459b30bdba000d6f10ed294e413596fb', '2026-01-03 06:09:01', '2026-01-03 06:04:01'),
('59f86318-254f-46f2-9ec4-c4f2fe365eb0', '2e416eba-4d31-4157-99ad-b109b7453f37', '5406fc57e8ee3a6756be010710c23f60', '2025-12-31 07:05:11', '2025-12-31 07:00:11'),
('5a1917d4-621d-4fd5-aa5e-2430fe5ce480', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', 'ed380bd5a4720075308aa0eba67a8845', '2025-12-28 00:08:54', '2025-12-28 00:03:53'),
('5b349b97-6e2d-45f4-a07f-ae74f425efa6', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', 'adf01846a9a2345c7ddddf30acd36696', '2025-12-28 00:18:56', '2025-12-28 00:13:56'),
('5b82bea5-501b-4f70-a0e7-1ea0ade04a35', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', 'a85bd9538f779d996a6a421edfc7322d', '2026-01-02 07:18:04', '2026-01-02 07:13:04'),
('5d96bc81-688e-46f4-abcd-72284fbcea0f', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '07cf59a22e34c76c7af020bffa8e2bab', '2026-01-03 06:19:03', '2026-01-03 06:14:03'),
('5f861ac7-9947-4b01-95e8-e92f384e5c3d', '2e416eba-4d31-4157-99ad-b109b7453f37', '14528acde2a23716d35d6f02ad94f43a', '2025-12-31 07:16:10', '2025-12-31 07:11:10'),
('5fccc060-b7f6-4a64-80c8-fb7b435bf9bf', 'e0f50256-244d-422d-82c8-c0e2962d118d', '971f82f46c50b07d9faf1548a4d3e0a8', '2026-01-02 10:45:35', '2026-01-02 10:40:35'),
('600d4e3e-3c38-4e1c-a095-88780c2e1d3e', '2e416eba-4d31-4157-99ad-b109b7453f37', '2d6bdab60fddd8ee58136b2c9da86216', '2025-12-31 06:48:12', '2025-12-31 06:43:12'),
('61ef34d7-fd07-442e-9732-c70c4ca55e0e', '3324824e-43a1-46c8-b90a-bbce58923720', '93251f82a873feec6fdf7c98372810c2', '2025-12-29 05:16:34', '2025-12-29 05:11:33'),
('624d7323-a672-4dad-a60a-dda19425fbb2', '2e416eba-4d31-4157-99ad-b109b7453f37', 'b2da9ce4e85ee15071bf43dd2af5342d', '2025-12-30 06:22:14', '2025-12-30 06:17:14'),
('632f5765-7e75-4252-95a1-7344ac3cc9d0', 'e0f50256-244d-422d-82c8-c0e2962d118d', '982cff37767a653de2098e89c297dd11', '2026-01-02 13:39:35', '2026-01-02 13:34:35'),
('63e50d1b-1fb5-4dbf-8417-f7d24c583c88', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', 'a80c3f90429dbef981e4e5da0ee616d5', '2025-12-27 23:23:45', '2025-12-27 23:18:44'),
('63fb4bed-93e4-4007-801d-2a3ed5426e2a', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '62cec78d3e042f357eff5f3bd5ce1214', '2025-12-31 07:38:10', '2025-12-31 07:33:10'),
('645a4eef-4e62-4cc4-ba1a-da6df4255d2d', 'a5f0a3d0-44be-4cdd-8f8f-ded7c5b10798', 'bfea89123a931b76b539c214f45708090a76e590e03d6f879a7794834a234843', '2025-12-30 11:36:05', '2025-12-30 11:26:04'),
('65221cea-80b1-4f1a-8ba3-520dba9fa9e1', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'f1b3bb7c8ca411d29dcc8bd9d4bcddbe', '2026-01-02 12:21:35', '2026-01-02 12:16:35'),
('65263f36-b455-457a-8e4f-067d1557aa43', 'f4bb960b-1636-40c3-bf84-d5af7f9251bf', 'c0ddcad2675e2dc3c3fee8ec235935df', '2026-01-02 05:43:05', '2026-01-02 05:38:05'),
('65b5b13e-38cb-45fd-83fb-999a8515ab61', 'e0f50256-244d-422d-82c8-c0e2962d118d', '403c117c5d2e17f05a062dde257f1d79', '2026-01-02 09:33:35', '2026-01-02 09:28:34'),
('6740328e-f4aa-4e2e-96dc-6209faa323fb', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '55accb47ebcb89e14e2c3b29ad50ecbd', '2026-01-02 08:08:06', '2026-01-02 08:03:06'),
('683b9f11-12f2-41e5-b4bb-3e4f1dd36d92', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', 'c4a945a33caac92e424fa9296321e704', '2026-01-02 06:52:05', '2026-01-02 06:47:05'),
('685d1a7f-4b5d-47da-9a5b-502ea99904ae', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'a9d7a2b94d1d9d45e6345501b79a3b17', '2026-01-02 06:14:40', '2026-01-02 06:09:40'),
('6896dc9b-10f2-45ef-b975-4ab1b375c462', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', 'a5041c0b58f1bdf86762889d36409984', '2026-01-03 05:29:10', '2026-01-03 05:24:10'),
('6aa5bd77-13ee-4d31-b9a8-e66a669809e5', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', 'cdea6d785156543f748865f53c539dae', '2026-01-03 05:04:05', '2026-01-03 04:59:05'),
('6aeed2a3-153b-4d43-9ff2-c7367387720e', '3125ea92-91bf-4750-9a5b-e78726e4af08', '590cefea64e156c745769bf5918352a5', '2025-12-26 18:32:44', '2025-12-26 23:57:44'),
('6b51d8cd-6668-455f-af09-c58b94bd8b0f', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'bd90168df9f00f4eefb96944b5eede4f', '2026-01-02 08:27:35', '2026-01-02 08:22:35'),
('6c2bc8c9-ef6e-426c-8220-79bf42b1e106', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', 'a91214d1b263c8f047a356fd9fb6fc85', '2026-01-02 07:33:05', '2026-01-02 07:28:05'),
('6e19f742-81ac-490f-a16a-c21d1c7f3756', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '4219090a6ebec09998cb9c76608ffc88', '2026-01-03 04:53:04', '2026-01-03 04:48:04'),
('70189249-337f-4a93-a427-b0da4f8794bf', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '22cc43f578b6003d79b8ffb6290b2d95', '2026-01-03 06:31:03', '2026-01-03 06:26:02'),
('71658808-7d46-4605-b915-904f3a893291', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'd9f745af44664473c658684e0bbe9619', '2026-01-02 10:51:35', '2026-01-02 10:46:35'),
('71fd025a-f3e0-47a4-b547-a3a8adf878b9', '2e416eba-4d31-4157-99ad-b109b7453f37', 'e1f23dfa5ecfe5a0da9f01a3533b2c0d', '2025-12-31 04:55:14', '2025-12-31 04:50:13'),
('72aef5ae-0091-4426-9021-98bb4911e6d9', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', 'c9105d90bc2193b0cc8f1d5270934c97', '2025-12-29 06:17:22', '2025-12-29 06:12:21'),
('7348a8b4-605a-415c-9501-891550313e05', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '423da1cae5073ea2a2293f420f341e00', '2025-12-31 06:48:12', '2025-12-31 06:43:12'),
('7358054b-8569-4344-aa8a-9318ec598eca', '2e416eba-4d31-4157-99ad-b109b7453f37', '377efb5c038e8b95bf341cf6268bfb2b', '2025-12-31 07:21:14', '2025-12-31 07:16:14'),
('73e98ea4-1383-48a2-bc27-ed359174b41b', '2e416eba-4d31-4157-99ad-b109b7453f37', '3c534f77d9596abc41394ddde7de73d9', '2025-12-30 06:58:14', '2025-12-30 06:53:14'),
('751175ce-c51e-46a7-8677-1eb367cfb459', 'e0f50256-244d-422d-82c8-c0e2962d118d', '4d26d78ee2d945be3ed94db70983f0da', '2026-01-02 12:39:35', '2026-01-02 12:34:35'),
('7527eb73-769d-4a6e-b6ba-15aaf5416982', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '591ab82d36cdccfc163f74e8e129a424', '2025-12-31 06:43:11', '2025-12-31 06:38:11'),
('75369152-0e59-4696-afab-4007b2bde1e7', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', 'ca27a02558a0a986a5993c9c03dcfb88', '2026-01-02 07:03:04', '2026-01-02 06:58:04'),
('7637e925-1f08-420c-beea-832befc25344', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '1470d31b144b07925aeb7482709fd44f', '2026-01-02 06:57:06', '2026-01-02 06:52:05'),
('76d9bb1e-7473-4660-aaf6-340555f310ef', '2e416eba-4d31-4157-99ad-b109b7453f37', '1a0a968fb148ab7673fed755d1d54350', '2025-12-30 06:05:49', '2025-12-30 06:00:48'),
('771b92b5-72a1-407a-b6f6-e47733beb095', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', 'd2bbcfb7d4a17b7f8975bf0d3375fa38', '2025-12-27 23:33:47', '2025-12-27 23:28:47'),
('77c8836d-d212-4125-a4d7-4e7bbe7a940d', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '18b78345745363a8b2818e7af5dccdbe', '2026-01-03 06:14:02', '2026-01-03 06:09:02'),
('78232de1-4797-4275-a6c0-050c4717e051', '2e416eba-4d31-4157-99ad-b109b7453f37', 'e3a52dd65c5d1aef9ec0844907f05dee', '2025-12-30 06:37:14', '2025-12-30 06:32:14'),
('789241bf-b490-4962-a469-cf0f91d1fcc8', '2e416eba-4d31-4157-99ad-b109b7453f37', 'd6096ead39de1cf045fc95d1f71edcfc', '2025-12-31 06:32:11', '2025-12-31 06:27:11'),
('79709431-f036-4e60-b890-03f95d7f4297', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', 'e5ef22ebc038d8db4f02461f4decc58c', '2026-01-02 08:23:06', '2026-01-02 08:18:06'),
('7978d726-4ca9-483e-b382-aaf61d6c51ec', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '36de76e8ecae59fecd470e31a047adde', '2025-12-31 06:10:13', '2025-12-31 06:05:13'),
('7a5a71fa-df91-41f0-b578-6e9b9b71c840', 'f4bb960b-1636-40c3-bf84-d5af7f9251bf', 'eb62ab9237db1f34a82ae10bd7c833aa', '2026-01-02 05:32:22', '2026-01-02 05:27:22'),
('7bd57071-0761-44d3-98e0-29f62155e680', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '2df26ee1564fee687d75fb1656829744', '2026-01-02 08:18:06', '2026-01-02 08:13:06'),
('7c069981-89d5-497d-9b19-d40834441e93', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', 'dadca50b63356f4805a4b72a6d3a09cc', '2025-12-31 05:31:12', '2025-12-31 05:26:11'),
('7da5f224-9499-4bd3-92bb-59970e5b7167', 'e0f50256-244d-422d-82c8-c0e2962d118d', '24d3146c2c8fbd807a825f57ca291a26', '2026-01-02 09:57:35', '2026-01-02 09:52:34'),
('7dc5baf4-2c7d-42a0-894b-c652afa8a4fa', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', 'e685331ff145865f8091385f9a45b78e', '2025-12-31 05:06:11', '2025-12-31 05:01:11'),
('7dcdfc3c-ef13-4158-92bd-5fc969a699f0', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', 'eacf72af1431b49b95b6d94279632a4d', '2025-12-30 06:38:17', '2025-12-30 06:33:17'),
('7ee95807-fe8d-4fea-bd2f-9efa08415c6e', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', 'd97d86731d2c190bb5ec2f776080c7f6', '2026-01-02 07:28:04', '2026-01-02 07:23:04'),
('800889a8-d844-4324-81df-14f9dae723f1', '3324824e-43a1-46c8-b90a-bbce58923720', '46bbefa64196ca54e2c9939659c34bfe', '2025-12-29 04:51:27', '2025-12-29 04:46:27'),
('80c9a1fc-4086-45a8-8ff1-dceb2bc6e013', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', 'e59bd6eedee6307baf23cf931ad095d6', '2026-01-03 06:37:01', '2026-01-03 06:32:01'),
('80eb660f-4f86-4f1a-b4f8-f970703485f4', '3324824e-43a1-46c8-b90a-bbce58923720', '4fb0307d8447b4f254004e229459a96b', '2025-12-29 05:27:19', '2025-12-29 05:22:19'),
('816e77ae-d796-4590-8479-7fb3711e79f2', '2e416eba-4d31-4157-99ad-b109b7453f37', '0cca6bda688baf5a824cc2d8b8a84161', '2025-12-31 07:38:10', '2025-12-31 07:33:10'),
('83295764-7c3f-4fd9-a823-2defb55ab90f', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', 'bb97291467d7c79c64c9ece74a87d491', '2025-12-29 05:41:41', '2025-12-29 05:36:41'),
('839c486e-44a8-4ea1-bdc2-b8fd172972f2', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', 'c96c2b45db026cbdac5acaf8f5cb0c00', '2025-12-29 07:09:18', '2025-12-29 07:04:18'),
('83e2e6f5-2cee-4be1-b1b5-2bd78be65f03', '2e416eba-4d31-4157-99ad-b109b7453f37', 'dfa5da648ed4d6dc6451a81b55b57a0f', '2025-12-30 06:10:51', '2025-12-30 06:05:51'),
('850de023-6fcb-4e2f-94e4-eecbb46bf8c4', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '72eef1349131635ac0f35c21d6c6bcf6', '2025-12-31 06:27:11', '2025-12-31 06:22:11'),
('863659d0-57bb-4d7d-97c0-5b8156739462', '2e416eba-4d31-4157-99ad-b109b7453f37', '9431948a1b44b0189254c2054b5c0f11', '2025-12-31 06:54:11', '2025-12-31 06:49:10'),
('886fa958-9c1f-4110-a119-75adc7a3f8b2', '3324824e-43a1-46c8-b90a-bbce58923720', '67b3fb660944b16d38d448c1f8059218', '2025-12-27 11:18:25', '2025-12-27 11:13:24'),
('8892a0fa-8b0e-415a-bff7-3e8d7d4cdd6a', 'f4bb960b-1636-40c3-bf84-d5af7f9251bf', '1e0b0fefd7fbbfbcccd8bcb1ae4633bc', '2026-01-02 05:48:08', '2026-01-02 05:43:07'),
('88fb633c-ca2c-467f-a937-70217a6fe782', '3324824e-43a1-46c8-b90a-bbce58923720', '7751b6a8d937375319e8e0a2ea327bc4', '2025-12-27 11:34:25', '2025-12-27 11:29:25'),
('89596df1-47d9-402a-ad33-278c4950da87', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '02e9a5e6f833597b73a4f23f84210e6c', '2025-12-27 22:58:38', '2025-12-27 22:53:38'),
('8a2eaf8e-fac4-4b29-91ff-d5edb43c5fc3', '2e416eba-4d31-4157-99ad-b109b7453f37', 'd742f5ed306f90fc6a119f8745b12a6a', '2025-12-31 06:16:11', '2025-12-31 06:11:10'),
('8ada92a8-bb12-442f-b7fe-13a82ded8ab6', '2e416eba-4d31-4157-99ad-b109b7453f37', '767a2aeddd9cce37a8232612d53baee4', '2025-12-30 06:16:16', '2025-12-30 06:11:15'),
('8b8ff94c-8e60-4e83-aec2-bd4ea4d481b4', '3324824e-43a1-46c8-b90a-bbce58923720', '68f2da3b4e1f3e67c6aff86ed434bad9', '2025-12-27 11:23:27', '2025-12-27 11:18:26'),
('8cacf2ac-f151-4250-879a-65b4fb8e29eb', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '6cf5fcfaeb4028348374fe4b85550691', '2025-12-27 23:08:42', '2025-12-27 23:03:41'),
('8d34c4e5-5ff2-4477-bd8b-33a4a7c01af4', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', 'fe6d8a602506a104c6dbe103d1e109ed', '2026-01-03 04:47:03', '2026-01-03 04:42:03'),
('8e123589-e4bf-45ca-a4de-0ae5d049f783', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', 'a6b06b27e1638e4b0ac32bea97b1ad86', '2026-01-02 06:26:04', '2026-01-02 06:21:04'),
('8e373335-8822-469d-9e31-904d28da02f1', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '9da373006fafad25b9aad90610c3e174', '2026-01-03 05:36:08', '2026-01-03 05:31:07'),
('90e768d9-d70a-4e9e-86b7-10a9df6bedcd', 'e0f50256-244d-422d-82c8-c0e2962d118d', '43ca1524a160f73f4991314cecd63c88', '2026-01-02 09:27:35', '2026-01-02 09:22:34'),
('910fc357-a5b8-42e0-8ca3-9b8948e0a4dc', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', 'c690db08544f2f551c114227f4035d9f', '2025-12-29 05:36:40', '2025-12-29 05:31:40'),
('93e4b793-3347-4502-ad74-3a3a43e6c1ba', '69c9bbd2-0f6e-4e9c-bb1e-f461c3de51a5', '6deee54e6cc3e7fe6c918bad9f757427', '2026-01-02 06:00:05', '2026-01-02 05:55:05'),
('94995db8-91a5-40ab-b226-1167aa73edb7', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '30c079d0d665813810632a2339aa0de1', '2026-01-02 06:40:06', '2026-01-02 06:35:06'),
('96c12cd5-d517-413f-b24a-30078bc9d241', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '3c9cd62bfc2f8b1e590e89e1f4feecdd', '2025-12-28 00:49:01', '2025-12-28 00:44:01'),
('96f93ab1-4c9f-4ac5-9d19-529f500db3ee', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '6c951647ea893ac2368064fe89cea207', '2026-01-02 06:19:05', '2026-01-02 06:14:05'),
('9712ed3d-c899-4c25-a201-f506927bb353', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '6b1b296aef2318325a075d9e09079cbb', '2025-12-29 06:35:19', '2025-12-29 06:30:19'),
('97a6edf5-c402-4d09-8bcc-cc60d2adf0c4', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'e9572a576b3ebb3dcf2a5e1e2f0dd11f', '2026-01-02 11:15:36', '2026-01-02 11:10:35'),
('9865afa6-a240-4a81-a2c8-91687a56c2b9', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '84ea838dc5e2b05817264d53f42a34d3', '2025-12-30 06:33:14', '2025-12-30 06:28:14'),
('992bc7b1-9fdd-42ac-b82f-9596a87f49d8', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '14f95b6e7474b420239abf2d81d95eea', '2026-01-03 05:42:02', '2026-01-03 05:37:03'),
('99879e6d-3545-4a6c-86cd-30b18e637520', 'e0f50256-244d-422d-82c8-c0e2962d118d', '6d62d7df46aec319d04ea4503576b561', '2026-01-02 11:57:35', '2026-01-02 11:52:35'),
('998a6ddb-3f49-4b2d-b900-ea84234586fa', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'faab08cc96294901e9cecc09d5fd977a', '2026-01-02 08:10:34', '2026-01-02 08:05:34'),
('99d1f9e8-d6f2-42fb-8007-8e19e1e08a48', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '607175f33e147bc5d4e23111b55d86e5', '2025-12-30 06:44:14', '2025-12-30 06:39:14'),
('9a563775-6dfd-4d5f-9d4e-8c662e7ce3a9', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'db85b2bddfed7b6c423a51400fdf0b75', '2026-01-02 09:21:35', '2026-01-02 09:16:34'),
('9a6e8ffe-1f2e-4588-8baa-1880bbc7a7aa', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'f9676f21c15b83a0fc06c09b100cd486', '2026-01-02 06:58:35', '2026-01-02 06:53:35'),
('9b80a9f7-c965-49a4-9516-e5927b52e5e7', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', 'ed6206b96610db2a908db767c6e6df39', '2025-12-29 07:41:21', '2025-12-29 07:36:20'),
('9cbee969-e151-49ca-a892-bfcbc7427467', '2e416eba-4d31-4157-99ad-b109b7453f37', 'f77a8bdf73aabf2958686ed0f7ac03e7', '2025-12-31 06:05:12', '2025-12-31 06:00:12'),
('9e7b142e-b6c2-4a74-a74e-2aa1aae65ed3', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '0808a35db194e0839a098a51018d40a1', '2025-12-27 23:38:47', '2025-12-27 23:33:47'),
('9e925788-8102-48c0-a8b4-ee034e16265a', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', 'cb68209208ca281362ca3079b3925a27', '2025-12-28 00:13:55', '2025-12-28 00:08:55'),
('9f89781d-6476-426a-9b5f-44e479ed6555', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'd719f86a856c8ab80dfcead74add15a2', '2026-01-02 11:27:35', '2026-01-02 11:22:35'),
('a12beea0-8a9a-42bf-87b8-67b2fe712f6e', '2e416eba-4d31-4157-99ad-b109b7453f37', '1f4097ad403ffd5451a29a0d75a312a0', '2025-12-30 06:27:14', '2025-12-30 06:22:14'),
('a1b060a4-3674-4aa9-b58f-1ed23066d605', '3324824e-43a1-46c8-b90a-bbce58923720', '75c7d9d81e7098eb6b13dfbc0061eb9a', '2025-12-29 05:21:36', '2025-12-29 05:16:34'),
('a48e2529-1eee-4d97-a2ae-9e3aac8c5801', '2e416eba-4d31-4157-99ad-b109b7453f37', '2e0d8d8f5de1166d88d03b4e01c59534', '2025-12-31 04:50:12', '2025-12-31 04:45:12'),
('a4c11b62-142e-4ce0-b199-be705f547bd9', '8e66bb41-3a34-42bb-bb0b-c403b32d8a4d', 'b5c7a3485ed61dc818ab39af01e06ec1', '2025-12-26 18:46:50', '2025-12-27 00:11:49'),
('a5708c69-abe3-40b6-99d8-09a46224d4f2', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '69d75570c7a8f30a9d46700c2f0d38d1', '2026-01-02 07:23:04', '2026-01-02 07:18:04'),
('a6e5b597-fcf3-43d9-b555-cf417ea0ca1c', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '271f88c008c8aefdbd89953ad8fe1d40', '2025-12-30 06:27:16', '2025-12-30 06:22:16'),
('a6f90656-eae4-46c0-a12e-2ac210c4817a', 'e0f50256-244d-422d-82c8-c0e2962d118d', '4e1c5221650f30612a7fd7e3f8fe9db5', '2026-01-02 13:33:35', '2026-01-02 13:28:35'),
('a764a6e0-8456-4896-81e5-8e55e83ab373', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '99b21d1b2713bad4fe40b84a1722d073', '2026-01-02 07:44:04', '2026-01-02 07:39:04'),
('a79bb181-01cb-4286-8d00-d8f146f55821', 'e0f50256-244d-422d-82c8-c0e2962d118d', '3c69687ea90624da1c96f3a8fc2ea6c3', '2026-01-02 06:47:34', '2026-01-02 06:42:34'),
('a8466ae3-9fa3-4f80-808c-44a133a053ae', 'e0f50256-244d-422d-82c8-c0e2962d118d', '59a8d94b971a992d24e77fbeb2c18aef8f01ae06444af00d2930f37fefd4b6b9', '2026-01-02 06:08:42', '2026-01-02 05:58:42'),
('a8609bec-e146-40ea-b192-28fa1bcefbeb', 'e0f50256-244d-422d-82c8-c0e2962d118d', '779e52b31355247cfa3d90370e98a00d', '2026-01-02 13:51:35', '2026-01-02 13:46:35'),
('a8da89f7-013f-49a5-b0ba-1f15a759bef5', 'e0f50256-244d-422d-82c8-c0e2962d118d', '26c2fdc76bc52652e2d4aec3877595cb', '2026-01-02 12:51:35', '2026-01-02 12:46:35'),
('a97c6051-2089-4697-bac2-513f1064c7df', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '95997d41f35d6066836f6735e73c9291', '2025-12-29 07:25:18', '2025-12-29 07:20:18'),
('aa226c58-0c11-4df5-906d-5e24599e93ea', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '65f4d0d40b5e95349fbcc4f312a872e3', '2026-01-02 07:22:07', '2026-01-02 07:17:07'),
('aa5e6d77-134c-41a0-9cfd-67dc841f81fd', '3324824e-43a1-46c8-b90a-bbce58923720', '8b87ce854f8c2e21da9237d5b2aac61c', '2025-12-27 11:02:24', '2025-12-27 10:57:24'),
('aa76c94b-f578-425b-96ed-7f5a4aecd100', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'e225ca64c6db268a76a8d020c0de1506', '2026-01-02 12:27:35', '2026-01-02 12:22:35'),
('acceb431-955d-4971-8f74-5e85661ab795', '69c9bbd2-0f6e-4e9c-bb1e-f461c3de51a5', '4ebbe8111add01ec4bcf06b154581889', '2026-01-02 05:32:05', '2026-01-02 05:27:04'),
('ad39652f-0df4-4ac4-9a89-e4b7e976bf4e', '69c9bbd2-0f6e-4e9c-bb1e-f461c3de51a5', '8b797e886bd6d1d05ddc193da42a1278', '2026-01-02 05:54:07', '2026-01-02 05:49:07'),
('ad6bb847-72e6-4d26-b7ce-1da818cbfe52', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'ac5169d43c55e8d4a1ed748051473dd1', '2026-01-02 09:45:35', '2026-01-02 09:40:34'),
('ae659c7a-975b-4779-bd5d-bbeec19078fc', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '42277000a81dcc95382ee384b0fd1948', '2026-01-02 07:07:06', '2026-01-02 07:02:06'),
('aeae9729-f57f-45c4-89b4-0c9c91fd73d4', '2e416eba-4d31-4157-99ad-b109b7453f37', '3f1327e6aeea4237c9247f62aeaca571', '2025-12-30 06:47:14', '2025-12-30 06:42:14'),
('afef7d96-caf6-4d3d-80cd-b74890547394', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '8344592147a3144a6a6f98144379606b', '2025-12-27 22:38:36', '2025-12-27 22:33:35'),
('b011db36-e064-4c86-a69d-067a5c88bbfc', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', 'f626fb37c4e7ccfb3b8a362a9d9f620d', '2025-12-29 07:36:18', '2025-12-29 07:31:18'),
('b021deb0-ae2c-4883-a39f-a3f6ee21af75', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', 'e650b409ef1a387e86b8b8d5a5a62600', '2025-12-27 22:53:38', '2025-12-27 22:48:38'),
('b0cd8cd5-72e8-4b98-9eb1-71d842c9a362', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'b50f8f723bbc421023cba7bdbe452db4', '2026-01-02 11:21:35', '2026-01-02 11:16:35'),
('b165b5de-3505-4ae7-99f6-d434117564e5', 'f4bb960b-1636-40c3-bf84-d5af7f9251bf', '57c3826a922cc7426401b51ded06451a', '2026-01-02 05:54:07', '2026-01-02 05:49:07'),
('b3c63915-54a3-4705-86f1-e4be943f67e7', '3324824e-43a1-46c8-b90a-bbce58923720', 'a6f8ac2d29104917a3a6442d2c49a1b0', '2025-12-27 11:12:27', '2025-12-27 11:07:26'),
('b4018726-4c7e-455e-823d-c7b66d1c3b6c', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '256b69425c2b375db13284b1570149cb', '2025-12-31 06:32:12', '2025-12-31 06:27:12'),
('b4325abc-ba19-4a20-abc9-5340a48523c0', '2e416eba-4d31-4157-99ad-b109b7453f37', '52c9b064cccb0eef67e0ca68f4de015b', '2025-12-31 06:21:14', '2025-12-31 06:16:13'),
('b58dc713-6b5b-4438-86a3-bbf1d877b104', '3324824e-43a1-46c8-b90a-bbce58923720', '5b85749ab7809e1e5cff45f5d1b89f4d', '2025-12-27 06:46:31', '2025-12-27 06:41:30'),
('b60c0caf-884c-4333-852b-8317246bdeff', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', 'c44f09577b3780a14ffe6bddd67c4d7c', '2025-12-31 06:16:11', '2025-12-31 06:11:11'),
('b611b83e-0baa-4a37-889e-defbe81f5fce', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'aafa7fc5c1089659ccbcf8a4b4362739', '2026-01-02 10:03:35', '2026-01-02 09:58:34'),
('b6f7b117-cd91-40ce-96f8-7a326f894cee', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '7a5c160f36cc80ad9dc947f174bffe59', '2025-12-29 06:46:21', '2025-12-29 06:41:21'),
('b718b2a2-f244-4967-819f-49b4ffaa72c6', 'e0f50256-244d-422d-82c8-c0e2962d118d', '1cb4ebe548fa0522318ff3d0c935518c', '2026-01-02 13:21:35', '2026-01-02 13:16:35'),
('b8dc582d-e35c-469e-86b2-a20a72d334dd', '2e416eba-4d31-4157-99ad-b109b7453f37', 'ca79d0efd9ac802589a91c2a29b35afa', '2025-12-31 05:31:12', '2025-12-31 05:26:11'),
('b99ce527-00b4-4327-8ffe-062a10ee98cb', '2e416eba-4d31-4157-99ad-b109b7453f37', '2e15edafe0c35aad316504774e4b747a', '2025-12-31 06:37:12', '2025-12-31 06:32:12'),
('ba97d189-b866-4612-a0e7-e1c43b9d6961', 'e0f50256-244d-422d-82c8-c0e2962d118d', '54c01e729ea98e36fd1f253a39cee429', '2026-01-02 13:15:35', '2026-01-02 13:10:35'),
('bb6d1623-0550-4a98-b1b9-303f65d90c41', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '40ac8af513b04cd38cb9ff57e7e185a0', '2025-12-30 07:22:19', '2025-12-30 07:17:19'),
('bc05f13d-6f1b-4120-9682-d535609c2296', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '26f384e0728415e72b44758b3571ed9e', '2025-12-29 07:14:19', '2025-12-29 07:09:18'),
('bdaa254d-6d79-4abd-85ab-d7318d8bbbbb', '3125ea92-91bf-4750-9a5b-e78726e4af08', '74e380ba90b5357ca6f8620abfbcb923', '2025-12-26 18:37:44', '2025-12-27 00:02:44'),
('be9cb7ff-b7f9-498d-872b-bb363ad13233', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '83c391892d4d77da2429eea21a589e00', '2025-12-31 06:54:11', '2025-12-31 06:49:11'),
('bec14096-1b32-45fb-ab41-bfd6072b94d3', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '2125d710675a81329445028d9068cc75', '2026-01-02 07:38:08', '2026-01-02 07:33:08'),
('bee2f7c8-23da-4824-8fc7-37db7fe1236d', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '648021a96fd24356c6e5617b70d9e863', '2025-12-28 00:33:58', '2025-12-28 00:28:58'),
('bf5c914c-8a99-493b-becc-c1da800c388c', 'e0f50256-244d-422d-82c8-c0e2962d118d', '79cd8a5fd1f84179d353c71fae1f471b', '2026-01-02 08:57:35', '2026-01-02 08:52:35'),
('bf9a6e8e-6630-4724-a4de-cfba4803d3ec', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '49beb5f273b6cec6abe8555c71cee3e5', '2026-01-02 07:02:06', '2026-01-02 06:57:06'),
('c0053fa8-6c4e-47ac-8fe0-7b65ae74841f', '2e416eba-4d31-4157-99ad-b109b7453f37', 'b51ba5948b827805b1b63920df106652', '2025-12-30 07:09:14', '2025-12-30 07:04:13'),
('c238a31b-998f-446c-b0d2-d8a0d0f27bf1', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '09d08a40d3048e515d11c1be3065763c', '2025-12-29 07:03:19', '2025-12-29 06:58:18'),
('c247c5ee-4332-44e4-830c-492a5d5b89f3', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', 'ff3d988c3230b60fe298957fcfe62093', '2026-01-02 07:17:06', '2026-01-02 07:12:06'),
('c249bdf0-c2cf-49d4-9945-187bf0b1c06e', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', 'b70743788c9ea899127f4d68d833a946', '2026-01-03 05:36:05', '2026-01-03 05:31:05'),
('c24bebf8-f85d-4520-872a-277a0100e568', 'e0f50256-244d-422d-82c8-c0e2962d118d', '0c8964d574e52dc1597b1db53c906e5f', '2026-01-02 10:39:35', '2026-01-02 10:34:35'),
('c250d40c-d923-43b5-9185-dab827a2fa88', '3324824e-43a1-46c8-b90a-bbce58923720', '17c05b4aa50472156ed8cc2d9df0d69b', '2025-12-29 05:11:32', '2025-12-29 05:06:32'),
('c2658fde-a962-4e2e-b9be-2853b92f1e16', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '275185f33c2bf98971702be71ab4b996', '2026-01-02 06:35:04', '2026-01-02 06:30:04'),
('c59c8e81-be3d-46ef-be09-e8c3ffb0c623', 'e0f50256-244d-422d-82c8-c0e2962d118d', '0187a52e6eb6986b2054f58c5ea44616', '2026-01-02 08:39:35', '2026-01-02 08:34:35'),
('c59f64ca-b808-468b-88c6-95f45c2f6e27', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'e23de962961ea9e7bcb3465527029639', '2026-01-02 07:55:34', '2026-01-02 07:50:36'),
('c6cdc1b2-0123-4292-af8f-ece06f21c803', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '168a854f1bb6408351ff07bb412ff365', '2025-12-29 05:46:41', '2025-12-29 05:41:41'),
('c70e5132-54bc-4853-b675-eda225a430ed', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '996a00c0632c47830d368808f0c98d47', '2025-12-31 05:53:12', '2025-12-31 05:48:11'),
('c77c539a-ccac-4a3a-bf8d-728e87ffd5fc', 'e0f50256-244d-422d-82c8-c0e2962d118d', '481d3cffcf88921934f71beab50750be', '2026-01-02 12:57:35', '2026-01-02 12:52:35'),
('ca6e2e01-adf5-4005-9ba7-9e3dd48ad494', 'e0f50256-244d-422d-82c8-c0e2962d118d', '86e3216af1deda1049ee042ff780162c', '2026-01-02 07:34:35', '2026-01-02 07:29:35'),
('cabb3893-404c-4292-8b63-c759bff70a63', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '9f304acaaec6a8ca4ccc9dae6efa647b', '2025-12-27 23:18:44', '2025-12-27 23:13:44'),
('cac5fbe8-c762-4ac0-863a-2dd7ef40e340', '2e416eba-4d31-4157-99ad-b109b7453f37', 'ff7dfba46403cd230acb4a8fe9d1854f', '2025-12-30 06:42:14', '2025-12-30 06:37:14'),
('cb28fa03-f35c-47ee-85dd-892f9d9e0a0f', 'e0f50256-244d-422d-82c8-c0e2962d118d', '9b70ab46c4790c3d12f55dfb478c2cf6', '2026-01-02 08:05:34', '2026-01-02 08:00:34'),
('cbf4b232-a902-4447-a285-e8062b692bbf', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '6309bc913146c58e02ddc08b0a5a9d90', '2025-12-31 07:16:10', '2025-12-31 07:11:10'),
('cc152bc6-dabd-4c15-9b63-7022ece63131', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '122f723cfe64020e5cece2d474971978', '2025-12-29 06:23:19', '2025-12-29 06:18:18'),
('cc8f5a41-be01-4747-a511-0b91c8b3ccc0', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '01a2ef7d867ee1242eb6d82a41d4b681', '2026-01-02 07:28:04', '2026-01-02 07:23:04'),
('cd285b82-8aeb-41ce-aefb-6f7eee93d239', '2e416eba-4d31-4157-99ad-b109b7453f37', 'b56005a5dead6b063cc45fa361f699d5', '2025-12-30 07:03:15', '2025-12-30 06:58:15'),
('cda8e52b-a7a2-4dae-b996-8ebfa3cf38fe', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '0b8be2d65f5b6770dbfdde7371e88a79', '2025-12-30 06:49:15', '2025-12-30 06:44:14'),
('cdc2c595-12d7-4c58-8bc1-8688e9d9a592', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', 'a0e3c8ebea81ff24572a24251f7851c4', '2025-12-27 23:13:43', '2025-12-27 23:08:42'),
('ce885a3b-5d51-42bc-b2ca-9a178f7e706c', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '89702db69feb206f96a243be470e0825', '2025-12-31 05:16:14', '2025-12-31 05:11:13'),
('ceb397af-ad84-449a-9fbc-b967848348ba', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '7a627f4b29cdde67c06a10dafc3a59b8', '2026-01-03 05:09:07', '2026-01-03 05:04:07'),
('d2365b83-d1bb-4cca-8032-7152129d29ac', '2e416eba-4d31-4157-99ad-b109b7453f37', 'b380968ffbd1201e9b1e62b9e616beff', '2025-12-31 07:10:13', '2025-12-31 07:05:13'),
('d27fe690-0a10-465e-a136-96ecd5be1968', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', 'acbee021ff2ffabca1f6ca29c5174644', '2026-01-02 07:08:04', '2026-01-02 07:03:04'),
('d381debb-8076-40fa-82f8-de1ca2dfbeaf', 'e0f50256-244d-422d-82c8-c0e2962d118d', '9f042cc9405430e8a6f8cec959960564', '2026-01-02 12:33:35', '2026-01-02 12:28:35'),
('d383d681-79f8-4ac1-829c-49dd3107526e', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '7fdf8087f4c0ba2ccceb8b106a685f6b', '2025-12-29 07:20:18', '2025-12-29 07:15:18'),
('d3ce04ba-cf9e-4203-81f6-3bd0d9200b21', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', 'a6412149f6b031d6075d874f72609388', '2025-12-29 06:41:18', '2025-12-29 06:36:18'),
('d3f8bc78-6965-482c-a33b-c4319113c4af', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '9cad2ab8a50037eb1716591b9896bc9c', '2025-12-28 00:23:57', '2025-12-28 00:18:56'),
('d42aabc0-be5e-4994-85e3-35590c3929b0', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '0f1c19acb2e5411377e3f82513eb4561', '2025-12-30 07:28:14', '2025-12-30 07:23:14'),
('d5494386-73a4-4390-b030-e9a9e1daa0b6', 'e0f50256-244d-422d-82c8-c0e2962d118d', '14922f614799b1494d72d6f06cbfa10d', '2026-01-02 11:03:35', '2026-01-02 10:58:35'),
('d77ade57-8966-4b13-a5c3-22bd6631746c', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', 'b3fa14e740f0a5879096f30644d927d2', '2025-12-27 23:03:39', '2025-12-27 22:58:39'),
('d8080f43-fb7e-477c-8212-b6f6642ea31f', 'e0f50256-244d-422d-82c8-c0e2962d118d', '2e2bc94f4b4b93d9ea4517319270bd1f', '2026-01-02 12:09:35', '2026-01-02 12:04:35'),
('d9075b5e-e807-4a46-b9c6-ea2db1169803', 'e0f50256-244d-422d-82c8-c0e2962d118d', '2fd24d752a3c2d93970ed66c0d4808e0', '2026-01-02 08:00:34', '2026-01-02 07:55:34'),
('d9bc1f06-389c-4c40-9b79-a5194e5ec15a', '0d3f6aaa-07a3-42ff-b1ce-cc8c1f3d53b4', '129dc8f18bc9c82480a9404b7dcd7eee', '2025-12-29 05:36:12', '2025-12-29 05:31:11');
INSERT INTO `guest_qr_session` (`id`, `invitation_id`, `rotating_key`, `expires_at`, `created_at`) VALUES
('d9c0e469-89c4-45b2-a163-afb0b54b845f', '2e416eba-4d31-4157-99ad-b109b7453f37', '49201e5d305326cdbb1eeeb7818af97e', '2025-12-30 06:32:14', '2025-12-30 06:27:14'),
('db2897d3-e2e6-4a23-ae2a-0e574105592a', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '91804e144ed5c45f016a135a5df20979', '2025-12-28 00:28:58', '2025-12-28 00:23:58'),
('db9fdbe7-f70b-4b4f-8854-130527531f88', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '4433b33db6a856d983a9cca581824b0f', '2025-12-31 05:01:11', '2025-12-31 04:56:11'),
('dc3d583a-8223-4ac3-aa12-a8862223ebb3', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '9f129b7e70de3a2304029bbb595458f5', '2026-01-03 04:59:02', '2026-01-03 04:54:02'),
('dc77fa8c-e86e-4fb3-bc57-1ce2c63877fd', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', 'f0847e91cbaa7a0bce68bc4968a9852c', '2026-01-02 08:04:04', '2026-01-02 07:59:04'),
('dd78c20b-4c1f-4538-95e4-00bd109a5a3d', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '9936150e3d57821df2edb0c18e68504e', '2026-01-02 06:47:04', '2026-01-02 06:42:04'),
('de5831dd-5f66-49d5-99e6-ec96a5b5c30e', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', 'e1d466e00b5141f6f56e555308eef049', '2025-12-29 06:29:19', '2025-12-29 06:24:18'),
('dfdc1676-74fe-45ed-94ec-5c157e97936f', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '4bc217697158804c4ced94fd573bba4b', '2026-01-03 04:47:03', '2026-01-03 04:42:03'),
('e02e0fda-48ad-4127-ab9e-80f88addf6bb', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', 'c271d5e128231faa80e68bf2113717df', '2026-01-02 06:41:07', '2026-01-02 06:36:07'),
('e056aeb5-12fd-41af-9396-0096de2134a0', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '93c93451f2ab86b3be6925f583c426b2', '2026-01-02 08:09:04', '2026-01-02 08:04:04'),
('e20cb99e-5120-45b3-b38d-fa01fde64326', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '0d9d57ea8b6b76648c7a52eb9cde8966', '2025-12-31 07:10:15', '2025-12-31 07:05:15'),
('e2d6a15c-b1db-4ca7-be0e-ac73c74e2e72', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '1b60596d314c1d27de9e13cc777682c3', '2026-01-03 04:59:01', '2026-01-03 04:54:01'),
('e3894aaf-a2ef-44f8-85c6-416e4fcd7eaf', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '3cc8a91c8cea74aced2093ee2b12be51', '2025-12-27 23:28:46', '2025-12-27 23:23:46'),
('e3d36f61-fa1f-4009-bc56-98fec1d9bb42', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '7368928b8c75e5d562071a2418c21081', '2026-01-02 06:31:04', '2026-01-02 06:26:04'),
('e41139ab-f776-49ad-acad-508c8cde3297', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', 'be677df04aa48f54aae312e84c90efb6', '2026-01-03 04:41:35', '2026-01-03 04:36:34'),
('e45b577b-4302-4787-a87e-fbfc15ee1562', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '8767c99fdd555cb6d88dbf5620787913', '2026-01-02 06:20:07', '2026-01-02 06:15:07'),
('e52ad621-302b-49d1-bd38-50bfa76f2f26', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', 'cd12ca75b437255a4019ae0a2ecd861c', '2026-01-03 06:25:02', '2026-01-03 06:20:01'),
('e5ba5a47-699e-4f48-a2ea-0a83a4f711b0', '2e416eba-4d31-4157-99ad-b109b7453f37', '493ca0c8cb5ec6c24693702b5261d752', '2025-12-30 06:52:15', '2025-12-30 06:47:14'),
('e6c95e85-8a6a-44bf-a282-cd6a1624fea3', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'ff80481980d20b343abc52a7e7563099', '2026-01-02 08:45:35', '2026-01-02 08:40:35'),
('e70a946b-973e-45d2-ba96-7d3b29f5409f', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'f5a3f51f6a004b16ab05d3800c46b049', '2026-01-02 09:15:35', '2026-01-02 09:10:34'),
('e7dcca16-137a-4a43-83e9-172576c6e24b', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '8f778a484da694c1a406a82eea5443b5', '2025-12-30 06:21:17', '2025-12-30 06:16:17'),
('e8395a8f-01c8-4c70-8fed-7b557c09f4c9', 'e0f50256-244d-422d-82c8-c0e2962d118d', '18c59ab9ed5ff4ca4824be11d023368a', '2026-01-02 06:41:38', '2026-01-02 06:36:38'),
('e96a9fd9-7992-4886-8232-57662425ea74', '2e416eba-4d31-4157-99ad-b109b7453f37', '8ea58a8b27e266c834ede4e205b66d0e', '2025-12-30 07:31:13', '2025-12-30 07:26:13'),
('e9dc95c6-2443-4b2f-a5d7-adfb385f1fac', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'f721007e5c83900c10414b5777eec60f', '2026-01-02 10:33:35', '2026-01-02 10:28:35'),
('eb58553c-998d-4be1-96ee-24cb18caf27b', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', '3a4160b4f8c70d7be56c2f84e4c01105', '2025-12-29 05:51:43', '2025-12-29 05:46:42'),
('ed3df405-7c29-4fc6-8ca9-58c909f82c7d', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', 'b46e7f503d010735ddeb10d0624ee67a', '2025-12-27 22:43:36', '2025-12-27 22:38:36'),
('ed5bfa78-912f-4c77-ab7a-da8beda35d45', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '3076334744c0c3926d032baf3ca618b6', '2026-01-02 08:13:06', '2026-01-02 08:08:06'),
('ee6f03ef-1eaa-4e2e-bc4a-8b97ada926fa', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', 'fcbd2e5e4bb06f4e76cdfa73b12c660a', '2025-12-31 06:21:14', '2025-12-31 06:16:13'),
('ee73c024-7017-4ecf-aa19-5b34d6845946', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '14dfa4484d0b3a80d4140a966004d61e', '2026-01-02 06:51:07', '2026-01-02 06:46:07'),
('ee7dbbe0-88ba-41c0-b34f-e6145b3d63bf', '2e416eba-4d31-4157-99ad-b109b7453f37', 'aa0286e15e5bb6b5ad0a4ea6bbf67499', '2025-12-31 05:11:11', '2025-12-31 05:06:11'),
('effb62d7-abf0-4868-8051-677b3736cc48', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '60cb99435a65c9aca624ba4432b1052f', '2026-01-03 04:53:03', '2026-01-03 04:48:03'),
('f229789d-5a7e-40e5-bb0a-add7824cfb61', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'b05421711ac0c877800e979b072d2751', '2026-01-02 10:21:35', '2026-01-02 10:16:35'),
('f24a9ace-93da-44c6-a5e8-cf85eb4e01f7', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '7f6519ab1be3f450a8fef3ebaa8f8dfb', '2026-01-02 06:04:48', '2026-01-02 05:59:48'),
('f288a51a-c3c1-4bbe-b701-2190ac0f25ef', '3324824e-43a1-46c8-b90a-bbce58923720', 'b8671016d60587229c4baa40277617b5', '2025-12-27 10:56:27', '2025-12-27 10:51:27'),
('f2a76e5d-425f-4b0d-95e9-2d04375bbb7d', '3125ea92-91bf-4750-9a5b-e78726e4af08', '4bab916fb711ed20f1b97aa94268a36f', '2025-12-26 18:42:44', '2025-12-27 00:07:44'),
('f2eaf7b9-0f43-4fd0-b63f-c676575ae865', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'a267c63e522266be540ff63aef887243', '2026-01-02 11:51:35', '2026-01-02 11:46:35'),
('f2ee7523-babc-4353-9060-e23735c2e4bf', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', 'f0156335816934849e48a8d44e88e147', '2026-01-03 05:22:53', '2026-01-03 05:17:53'),
('f32b5f22-788e-43d9-9038-682845b905f9', 'f4bb960b-1636-40c3-bf84-d5af7f9251bf', 'c0347cdf4245768724600ffe67ef7489', '2026-01-02 05:37:23', '2026-01-02 05:32:23'),
('f36965bb-9485-4b35-a416-0dc468c6f0c5', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '58a7f6ad51d27ae15a8202ce1052ae0c', '2026-01-02 07:12:06', '2026-01-02 07:07:06'),
('f4b9955f-db29-4b8f-97d6-4b5f3b53069d', '2e416eba-4d31-4157-99ad-b109b7453f37', 'b2c0b717fc7042b2e6099a0bd9b875a3', '2025-12-31 05:16:13', '2025-12-31 05:11:12'),
('f680571d-6ed5-41f8-b21e-d884954deefe', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', 'd654061019c99863f19730c81e48dc38', '2025-12-27 23:58:52', '2025-12-27 23:53:51'),
('f76abb7a-5d5a-4ddc-95ae-4ceb1783d17a', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '50cd2598fb4bf7b27a991c01a279a336', '2026-01-02 07:43:06', '2026-01-02 07:38:06'),
('f7e36a3c-a387-4f0a-8408-2881a13d1e8e', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'fc5036a7046891fa51c4fb3c2b9b1d34', '2026-01-02 07:28:36', '2026-01-02 07:23:36'),
('f8831884-26cc-4dad-a673-3b8c78a30d2a', 'e0f50256-244d-422d-82c8-c0e2962d118d', '5313206d78d7a4222160ba3caa67dbdd', '2026-01-02 09:09:37', '2026-01-02 09:04:37'),
('f886d29e-5418-4164-ac2c-32b5710c5a2a', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', 'dc39cf7a9b3f19b21f7dc705262b9938', '2026-01-03 05:15:09', '2026-01-03 05:10:09'),
('fad46d51-0dba-4e25-b263-e184ff88bed5', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', '19b300450f70a2f5c91e22bcae470259', '2026-01-02 08:19:04', '2026-01-02 08:14:04'),
('fb663ada-4625-4e8c-a084-005ac25f1744', '2e416eba-4d31-4157-99ad-b109b7453f37', 'd1616f85863602519f6db2f00acbd2b3', '2025-12-31 06:27:11', '2025-12-31 06:22:11'),
('fbdc2e15-68ad-49e6-9e31-edf47d71645a', '3324824e-43a1-46c8-b90a-bbce58923720', '850f35e99c70eced43f4700ddd36aa98', '2025-12-29 05:06:30', '2025-12-29 05:01:29'),
('fed0199f-2f20-4104-8a3c-702ffac4b804', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', 'c8535ff22ca8ffca613e3c6a03468126', '2026-01-02 06:24:06', '2026-01-02 06:19:06'),
('ff798da9-d87c-4c01-995e-0329f2bfea9e', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', '9dc3a21f66733cfdf43484598bcd1f10', '2026-01-03 05:15:08', '2026-01-03 05:10:07');

-- --------------------------------------------------------

--
-- Table structure for table `invitation_scan_event`
--

CREATE TABLE `invitation_scan_event` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `invitation_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `scanned_by_security_personnel_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `used_security_level` int NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `success` tinyint(1) NOT NULL,
  `failure_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `invitation_scan_event`
--

INSERT INTO `invitation_scan_event` (`id`, `invitation_id`, `scanned_by_security_personnel_id`, `used_security_level`, `timestamp`, `success`, `failure_reason`) VALUES
('04841564-c2d2-486b-a418-f7b4dae236e6', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'a2e3a0b6-cfb7-4c1d-bf69-48a8fe4d9da9', 1, '2026-01-02 05:49:00', 1, NULL),
('0552fb15-4449-4c91-9db1-eedd63534518', '607d1f41-2fd7-4cd0-ad4e-7abe6ed6d59c', '5364bf0f-cfe8-4dbe-885b-01831373df5e', 4, '2025-12-30 12:17:59', 1, NULL),
('06831f96-e2b9-4b51-a257-8a9ddcf371ff', '2e416eba-4d31-4157-99ad-b109b7453f37', '63b1a9b0-0880-4bbb-b7d0-56d26e7e4ae0', 3, '2025-12-31 07:13:20', 1, NULL),
('07f57baf-2773-4e04-95e8-9190fc7c90ba', '14f6841c-4b66-4357-8cd7-12f8b52eb8ee', 'cb07557d-4625-4ee7-bc91-c4d95c512189', 4, '2026-01-03 05:49:59', 1, NULL),
('097ce11b-d655-4653-a102-8e394b3a090c', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '63b1a9b0-0880-4bbb-b7d0-56d26e7e4ae0', 4, '2025-12-30 06:06:07', 0, 'Wrong security level for this scan method'),
('09f0bcf6-8368-40c5-b11e-d8018df04846', 'c6419965-21d8-48d8-92b5-b4848f5f459b', 'f58008f1-ca1b-43bb-ba5c-b6e5384c24f3', 3, '2026-01-03 05:35:00', 1, NULL),
('0fda6ba3-2150-4482-8662-0c75b650c7bb', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', 'f58008f1-ca1b-43bb-ba5c-b6e5384c24f3', 3, '2026-01-02 06:04:40', 1, NULL),
('29f38866-1ca5-433a-9567-e1a54da59638', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '63b1a9b0-0880-4bbb-b7d0-56d26e7e4ae0', 4, '2025-12-31 07:16:18', 0, 'Wrong security level for this scan method'),
('2bb9607a-dfb0-49c9-81f0-f7a0b6637092', 'd1b566b3-5865-4ffb-920b-cd00be50026b', '71141d25-3af4-4ac0-b285-702587226437', 4, '2026-01-03 05:40:23', 1, NULL),
('33c976ad-6371-430e-a7b9-9d564c801634', '69c9bbd2-0f6e-4e9c-bb1e-f461c3de51a5', 'f58008f1-ca1b-43bb-ba5c-b6e5384c24f3', 1, '2026-01-02 05:24:54', 1, NULL),
('360c54b7-bb71-4a08-a22f-abcfcc9228e3', 'e0f50256-244d-422d-82c8-c0e2962d118d', 'b4950c55-6d6d-415c-9352-1cd3edbe1fda', 1, '2026-01-02 05:51:01', 1, NULL),
('3ec5d585-0d6c-4216-abd1-323176eb72c1', 'c96f8dbd-8133-48e0-837f-134be2cc0609', 'b4950c55-6d6d-415c-9352-1cd3edbe1fda', 4, '2026-01-02 05:59:17', 0, 'Time expired'),
('4cc553da-d2f6-4413-940f-0511565f1dba', '3125ea92-91bf-4750-9a5b-e78726e4af08', '5364bf0f-cfe8-4dbe-885b-01831373df5e', 2, '2025-12-27 00:09:06', 1, NULL),
('4d75daff-02e4-44a2-9759-9383a9d45076', 'c6419965-21d8-48d8-92b5-b4848f5f459b', '71141d25-3af4-4ac0-b285-702587226437', 3, '2026-01-03 05:39:31', 1, NULL),
('5220ec2c-d537-4d7e-99f4-145b720f0442', 'a74d00aa-f238-43b2-9f1b-4da5de81da67', 'f1727ded-3e6f-412f-a320-96912e02a5e2', 2, '2025-12-29 05:32:12', 1, NULL),
('5936a665-da46-4714-8250-63a466bf2cdb', '3324824e-43a1-46c8-b90a-bbce58923720', 'ca23a63f-c3d7-46f2-b575-d5ce3330ba0f', 1, '2025-12-29 04:51:01', 1, NULL),
('5a82efc5-88be-4da0-b153-e29540b13403', '2e416eba-4d31-4157-99ad-b109b7453f37', '63b1a9b0-0880-4bbb-b7d0-56d26e7e4ae0', 3, '2025-12-30 06:04:27', 0, 'Wrong security level for this scan method'),
('60c30c4b-629f-4e64-9522-edf17911324b', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '63b1a9b0-0880-4bbb-b7d0-56d26e7e4ae0', 4, '2025-12-31 07:36:42', 1, NULL),
('6402aaf1-c570-476a-b30d-bab19d79a2fe', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '63b1a9b0-0880-4bbb-b7d0-56d26e7e4ae0', 4, '2025-12-30 06:06:05', 0, 'Wrong security level for this scan method'),
('6f25054a-5089-41d6-9200-bf99f4671b8d', '3b58064a-2fd3-4fb8-93b0-a0c6ff58e80a', 'f58008f1-ca1b-43bb-ba5c-b6e5384c24f3', 3, '2026-01-02 06:20:58', 1, NULL),
('6f254a30-86bc-47e9-9cdb-127c7357525e', '69c9bbd2-0f6e-4e9c-bb1e-f461c3de51a5', 'f58008f1-ca1b-43bb-ba5c-b6e5384c24f3', 1, '2026-01-02 05:29:31', 1, NULL),
('76c1c677-a690-49ca-a4e2-7e759f17aa02', 'a5f0a3d0-44be-4cdd-8f8f-ded7c5b10798', 'b4950c55-6d6d-415c-9352-1cd3edbe1fda', 1, '2026-01-02 05:54:24', 0, 'Time expired'),
('7bda266d-93e8-4e41-a43f-146ea9cd2017', '9e649f34-f484-46c8-9633-229dd28fad31', '5364bf0f-cfe8-4dbe-885b-01831373df5e', 3, '2025-12-30 12:08:26', 1, NULL),
('9b8dedfe-ad91-4cbd-ab70-f0052c2eb3e1', '3324824e-43a1-46c8-b90a-bbce58923720', 'ca23a63f-c3d7-46f2-b575-d5ce3330ba0f', 1, '2025-12-27 06:44:59', 1, NULL),
('a033d7ab-2e39-450e-9f6b-ff6b845353e3', '69c9bbd2-0f6e-4e9c-bb1e-f461c3de51a5', 'f58008f1-ca1b-43bb-ba5c-b6e5384c24f3', 1, '2026-01-02 05:29:34', 1, NULL),
('b4d688e0-de7d-4f56-bfe3-49781cd8d08d', 'd041ad6f-0c94-41bf-ac63-006205e29bcd', '5364bf0f-cfe8-4dbe-885b-01831373df5e', 2, '2025-12-27 22:47:19', 1, NULL),
('bfb7d39f-7c6f-4491-9617-5abae944378b', '3324824e-43a1-46c8-b90a-bbce58923720', 'ca23a63f-c3d7-46f2-b575-d5ce3330ba0f', 1, '2025-12-27 06:44:54', 1, NULL),
('cfcd8732-ee17-4dc8-a734-6aaaf96d627c', '1e62447b-36b6-476b-9409-4ebafc54f1b4', '5364bf0f-cfe8-4dbe-885b-01831373df5e', 3, '2025-12-30 03:41:35', 1, NULL),
('d672bda7-60f6-4e92-b1f4-a3fa7e4c5062', '3324824e-43a1-46c8-b90a-bbce58923720', 'ca23a63f-c3d7-46f2-b575-d5ce3330ba0f', 1, '2025-12-29 04:46:42', 1, NULL),
('d8e303a1-850f-4e94-8633-08fb9dc8bfb6', '6a75c5d2-0187-4286-9c5e-aa5cb5764c88', 'f58008f1-ca1b-43bb-ba5c-b6e5384c24f3', 4, '2026-01-02 06:10:41', 1, NULL),
('dca7e40e-f25f-4e24-b605-4ca6a0ce83ec', 'c96f8dbd-8133-48e0-837f-134be2cc0609', 'b4950c55-6d6d-415c-9352-1cd3edbe1fda', 4, '2026-01-02 05:57:55', 0, 'Time expired'),
('e10f439d-94a2-436e-b307-2f7292a7def4', '0d3f6aaa-07a3-42ff-b1ce-cc8c1f3d53b4', 'f1727ded-3e6f-412f-a320-96912e02a5e2', 1, '2025-12-29 05:31:28', 1, NULL),
('e2b79ec0-8a52-4ccc-8ddc-0bc8bc84d182', '8e66bb41-3a34-42bb-bb0b-c403b32d8a4d', '5364bf0f-cfe8-4dbe-885b-01831373df5e', 1, '2025-12-27 00:11:51', 1, NULL),
('e8074207-8f5e-4c5f-a3f8-d984bd1e873a', '1d1744be-c2c2-4d85-b8c2-187d8fdc7662', 'cb07557d-4625-4ee7-bc91-c4d95c512189', 3, '2026-01-03 05:49:15', 1, NULL),
('ed468416-9f71-46d2-ad3d-c0dbd91b54bf', 'efb9d8f8-4eb2-4c58-9b1b-becb58933157', '63b1a9b0-0880-4bbb-b7d0-56d26e7e4ae0', 4, '2025-12-31 07:35:29', 0, 'OTP verification failed - Invalid OTP code'),
('ee9f8110-6ebb-4deb-a782-7dd2c26883e7', 'f4bb960b-1636-40c3-bf84-d5af7f9251bf', 'f58008f1-ca1b-43bb-ba5c-b6e5384c24f3', 2, '2026-01-02 05:30:13', 1, NULL),
('f53794bb-20c0-4606-9248-97d09c353393', 'c6419965-21d8-48d8-92b5-b4848f5f459b', 'f58008f1-ca1b-43bb-ba5c-b6e5384c24f3', 3, '2026-01-03 05:34:48', 1, NULL),
('f9cde318-14cc-4cb6-a818-e68f4e0a2f30', '2e416eba-4d31-4157-99ad-b109b7453f37', 'f1727ded-3e6f-412f-a320-96912e02a5e2', 3, '2025-12-30 06:01:00', 0, 'Wrong security level for this scan method'),
('fa44e295-ae3b-4b1b-8878-fa170cfb4154', '2e416eba-4d31-4157-99ad-b109b7453f37', '63b1a9b0-0880-4bbb-b7d0-56d26e7e4ae0', 3, '2025-12-30 06:04:36', 0, 'Wrong security level for this scan method'),
('fcad1875-b5e3-4721-9fe3-844364c514fa', '2e416eba-4d31-4157-99ad-b109b7453f37', 'f1727ded-3e6f-412f-a320-96912e02a5e2', 3, '2025-12-30 06:01:23', 0, 'Wrong security level for this scan method');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_type` enum('guest','security') COLLATE utf8mb4_unicode_ci NOT NULL,
  `notification_type` enum('invitation','scan','alert','system','general') COLLATE utf8mb4_unicode_ci NOT NULL,
  `related_entity_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification_reads`
--

CREATE TABLE `notification_reads` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notification_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `guest_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `security_personnel_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `read_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification_tokens`
--

CREATE TABLE `notification_tokens` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `guest_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `security_personnel_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `device_token` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `platform` enum('ios','android') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'android',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `organization_node`
--

CREATE TABLE `organization_node` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('techpark','block','building','company','gate','custom') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `plan_override_level` int DEFAULT NULL,
  `status` enum('active','suspended') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `organization_node`
--

INSERT INTO `organization_node` (`id`, `parent_id`, `name`, `type`, `plan_override_level`, `status`, `created_at`) VALUES
('287a973d-ff6e-449c-be62-62fb9aeb09cf', NULL, 'Infosys', 'company', NULL, 'active', '2025-12-29 06:03:35'),
('287fcc6f-8e08-4c1a-aa18-300d4c25bc44', NULL, 'Orion Tech Park', 'techpark', NULL, 'active', '2026-01-02 05:22:06'),
('3b421420-bcb2-4b99-8a70-6f311cd4fb57', 'bf375421-462e-4206-8e3d-6bfca73c381b', 'Building A', 'building', NULL, 'active', '2026-01-02 05:23:50'),
('41d8e1b3-e911-4eb7-b963-5b41b3cae0ba', NULL, 'Test', 'techpark', NULL, 'active', '2025-12-26 23:39:49'),
('86cc36f4-9337-4faf-8c99-574d79c4bae9', NULL, 'Technopark', 'techpark', NULL, 'active', '2026-01-02 05:18:46'),
('959a159d-96f3-48a9-afb1-81bf42f82e6d', '3b421420-bcb2-4b99-8a70-6f311cd4fb57', 'Company 1', 'company', NULL, 'active', '2026-01-02 05:24:06'),
('b3d40002-43a5-4f5b-8b82-ac9cdcb2e89a', '41d8e1b3-e911-4eb7-b963-5b41b3cae0ba', 'UST Global', 'company', NULL, 'active', '2025-12-27 06:34:19'),
('bf375421-462e-4206-8e3d-6bfca73c381b', '287fcc6f-8e08-4c1a-aa18-300d4c25bc44', 'Block A', 'block', NULL, 'active', '2026-01-02 05:22:38'),
('c1b72cc1-60b9-41b6-82ab-c37829a839ff', '86cc36f4-9337-4faf-8c99-574d79c4bae9', 'Oracle', 'company', NULL, 'active', '2026-01-02 05:19:04'),
('eca96e85-391b-4eb7-a3b2-f6fae048452e', '86cc36f4-9337-4faf-8c99-574d79c4bae9', 'Meta', 'company', NULL, 'active', '2026-01-03 05:42:14');

-- --------------------------------------------------------

--
-- Table structure for table `organization_plan`
--

CREATE TABLE `organization_plan` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_node_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `subscription_plan_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` timestamp NOT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  `status` enum('active','expired','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `org_admin`
--

CREATE TABLE `org_admin` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_node_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('active','disabled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `org_admin`
--

INSERT INTO `org_admin` (`id`, `organization_node_id`, `email`, `password_hash`, `status`, `created_at`) VALUES
('097e360d-74b8-48bf-be2e-6f81349e9137', '287a973d-ff6e-449c-be62-62fb9aeb09cf', 'admin@infosys.com', '$2a$10$dnVlsBO2OkNEkLcb8HJF/Of22GJ/E2FEOQ2OLCa8XxZbgZXiYo3hO', 'active', '2025-12-29 06:04:18'),
('0e190c7f-951c-4b6b-a684-a7ebdb5292e4', '287fcc6f-8e08-4c1a-aa18-300d4c25bc44', 'orion@gmail.com', '$2a$10$XVB1sTSPVuqei989RxiarOvMmrajQ1LBBOcEA4g/bccc6H3QM7x2W', 'active', '2026-01-02 05:37:57'),
('1328a448-5a0f-4d74-aae7-dfcc50c28593', 'bf375421-462e-4206-8e3d-6bfca73c381b', 'blocka@gmail.com', '$2a$10$4fIhJT/9ABiqTRnLTHSq.u8uE6rl33kKh8KPfeGR.mTIzKC1eTEK2', 'active', '2026-01-02 05:38:28'),
('381f609e-7042-4d4a-9782-f9b267379c04', 'b3d40002-43a5-4f5b-8b82-ac9cdcb2e89a', 'admin2@gmail.com', '$2a$10$yRlu2WLWpS/6v0MDErTUaexz471fjZbPpRqUQCTYWC9FKD2UCy2Y6', 'active', '2025-12-29 05:18:48'),
('5a11fbec-b14d-4eaa-bfd2-41a36d6ca21c', 'c1b72cc1-60b9-41b6-82ab-c37829a839ff', 'admin@oracle.com', '$2a$10$AgiOxYkcbmlDzemDFuwUS.JdxmICyCXRjHW4WRYLnao4qrjUEDGH.', 'active', '2026-01-02 05:19:38'),
('5c5867a8-bc56-4a44-9f9f-c8df6f85475f', 'b3d40002-43a5-4f5b-8b82-ac9cdcb2e89a', 'admi@ust.com', '$2a$10$8tuKJeP8ssdN7w.hKItI0uzeFyufMKqYEJcJEFm6xGcM682XPDn0C', 'active', '2025-12-27 06:36:18'),
('6857f6a4-9ee3-471f-989c-24aeecfff6b2', 'eca96e85-391b-4eb7-a3b2-f6fae048452e', 'admin@meta.com', '$2a$10$QNjsFsDz2Ssz57ZABWUV/OUXjzoa5o3lZNkMPsYw3jgYq7025yqlK', 'active', '2026-01-03 05:43:30'),
('9cd1f39d-e7f6-4f10-aca2-895e849d2778', '287a973d-ff6e-449c-be62-62fb9aeb09cf', 'admin2@infosys.com', '$2a$10$YJbHaIoxaEVK13hp6qyxpOOB8LAaYMq3qcldiGQidjbh15seTHG56', 'active', '2025-12-30 05:59:16'),
('c0e6ef7f-9a43-4193-b3bf-be12779fcfc4', '41d8e1b3-e911-4eb7-b963-5b41b3cae0ba', 'apple2@gmail.com', '$2a$10$g9jhAL1GKK.DhBAKsMTSqOfxdEqebhEqwJElUknnZBDhFdKEXZx1O', 'active', '2025-12-27 22:31:13'),
('c6948eeb-5b78-4113-a462-5dd3b42270a1', '41d8e1b3-e911-4eb7-b963-5b41b3cae0ba', 'apple@gmail.com', '$2a$10$rVHdmWuh0Ow50CpIFOYLT.i/G58WERyWwN87G1GHR4vKiwsw3FGSu', 'active', '2025-12-26 23:40:13'),
('c7e7fba9-5320-4186-a776-17cc0f978dc4', '3b421420-bcb2-4b99-8a70-6f311cd4fb57', 'buildinga@gmail.com', '$2a$10$ry591.75cJsx0esm4Pc0me3yxqZYkqXJbKuQfrewps69aVvRRV24e', 'active', '2026-01-02 05:39:16'),
('e395e793-9116-4b64-91ae-52587f6d3593', '959a159d-96f3-48a9-afb1-81bf42f82e6d', 'companya@gmail.com', '$2a$10$yzXPGmp/M9rRI2pN./18ZeeFort7OL9nfXkaewnTfIz5OCyXcUegS', 'active', '2026-01-02 05:40:23');

-- --------------------------------------------------------

--
-- Table structure for table `security_personnel`
--

CREATE TABLE `security_personnel` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_node_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `shift_start_time` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shift_end_time` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','disabled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_active` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `security_personnel`
--

INSERT INTO `security_personnel` (`id`, `organization_node_id`, `username`, `password_hash`, `shift_start_time`, `shift_end_time`, `status`, `created_at`, `last_active`) VALUES
('5364bf0f-cfe8-4dbe-885b-01831373df5e', '41d8e1b3-e911-4eb7-b963-5b41b3cae0ba', 'alex', '$2b$10$cEF8C6lniWEssm4J83hrzOd2iBNAk5EaGRgkA/1yyTHPlgig.rtWq', '05:14', '22:19', 'active', '2025-12-26 23:44:42', '2025-12-30 03:41:21'),
('63b1a9b0-0880-4bbb-b7d0-56d26e7e4ae0', '287a973d-ff6e-449c-be62-62fb9aeb09cf', 'Anirudh', '$2b$10$1aTZ5/wzDpgKkR4lO521QewYXhnp0VJmnc5/8A7ASG9D7V7WNaM5K', '05:00', '22:00', 'active', '2025-12-30 06:03:53', '2025-12-31 07:35:54'),
('71141d25-3af4-4ac0-b285-702587226437', 'c1b72cc1-60b9-41b6-82ab-c37829a839ff', 'Nelson', '$2b$10$Ti0geG8BkdWhGe2mGMo1beP/sWoMTj7bwil9/xm5Vpa.zHos018s6', '07:00', '23:00', 'active', '2026-01-03 05:36:30', '2026-01-03 05:39:09'),
('a2e3a0b6-cfb7-4c1d-bf69-48a8fe4d9da9', '287fcc6f-8e08-4c1a-aa18-300d4c25bc44', 'orion', '$2b$10$TbJAcOP2T.XsdrgRVNFePeXdg54R1//OiWwVn7YZXqqgGdMsO5296', '11:13', '20:13', 'active', '2026-01-02 05:43:21', '2026-01-03 04:23:45'),
('b4950c55-6d6d-415c-9352-1cd3edbe1fda', 'bf375421-462e-4206-8e3d-6bfca73c381b', 'blocka', '$2b$10$6eTL.3WQ.xtC2JO8.jWHy.4Gv2M9geZhUZC6xjd0jxWcZtzDtR6AG', '11:14', '18:14', 'active', '2026-01-02 05:44:31', '2026-01-02 09:47:54'),
('ca23a63f-c3d7-46f2-b575-d5ce3330ba0f', 'b3d40002-43a5-4f5b-8b82-ac9cdcb2e89a', 'Amal', '$2b$10$AecIYX5hqvnbcd0.0cT3teDuhaXz4YnhctT.FbS1e0LzvWmscJm5i', '08:00', '18:00', 'active', '2025-12-27 06:43:40', '2025-12-29 04:50:55'),
('cb07557d-4625-4ee7-bc91-c4d95c512189', 'eca96e85-391b-4eb7-a3b2-f6fae048452e', 'Thomas', '$2b$10$.7D7Ye8NxgqDff8EYRS1/uZWr4XI35B8OqnVaEeC1fHBAXmHu98GW', '04:00', '21:00', 'active', '2026-01-03 05:47:13', '2026-01-03 05:47:36'),
('f1727ded-3e6f-412f-a320-96912e02a5e2', 'b3d40002-43a5-4f5b-8b82-ac9cdcb2e89a', 'Varun', '$2b$10$v3nBIk5Ggwyb0bk36T5QfO.LkZGpgsVrPKbIVFyaIs4sq88TAzYI6', '08:00', '18:00', 'active', '2025-12-29 05:25:35', '2025-12-29 05:26:52'),
('f58008f1-ca1b-43bb-ba5c-b6e5384c24f3', 'c1b72cc1-60b9-41b6-82ab-c37829a839ff', 'Max', '$2b$10$5tZYD6vo8C7hQoMkHUJzm.g1ksI27qSwFotTPGDhNRqS4aP2.dyMC', '07:00', '22:00', 'active', '2026-01-02 05:22:20', '2026-01-03 05:33:14');

-- --------------------------------------------------------

--
-- Table structure for table `subscription_plan`
--

CREATE TABLE `subscription_plan` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `allow_l1` tinyint(1) NOT NULL DEFAULT '1',
  `allow_l2` tinyint(1) NOT NULL DEFAULT '0',
  `allow_l3` tinyint(1) NOT NULL DEFAULT '0',
  `allow_l4` tinyint(1) NOT NULL DEFAULT '0',
  `max_guards` int NOT NULL,
  `max_guest_passes` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `super_admin`
--

CREATE TABLE `super_admin` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `two_factor_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `super_admin`
--

INSERT INTO `super_admin` (`id`, `email`, `password_hash`, `two_factor_enabled`, `created_at`) VALUES
('0cede4ab-c277-446c-88f2-d7909bb37e7c', 'apple@gmail.com', '$2a$10$rvGiGgjIVPHkCYyj4ZCP5.5hq3wHs.AdbCC6HHSssfpATDCCF6Pq2', 0, '2025-12-26 23:38:58');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `app_config`
--
ALTER TABLE `app_config`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_log_actor` (`actor_type`,`actor_id`),
  ADD KEY `idx_audit_log_timestamp` (`timestamp`);

--
-- Indexes for table `billing_record`
--
ALTER TABLE `billing_record`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscription_plan_id` (`subscription_plan_id`),
  ADD KEY `idx_billing_node` (`organization_node_id`),
  ADD KEY `idx_billing_status` (`status`);

--
-- Indexes for table `geo_gate_location`
--
ALTER TABLE `geo_gate_location`
  ADD PRIMARY KEY (`id`),
  ADD KEY `organization_node_id` (`organization_node_id`);

--
-- Indexes for table `guard_device`
--
ALTER TABLE `guard_device`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_guard_device_personnel` (`security_personnel_id`);

--
-- Indexes for table `guest`
--
ALTER TABLE `guest`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD KEY `idx_guest_phone` (`phone`);

--
-- Indexes for table `guest_device`
--
ALTER TABLE `guest_device`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_guest_device_guest` (`guest_id`);

--
-- Indexes for table `guest_invitation`
--
ALTER TABLE `guest_invitation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by_org_admin_id` (`created_by_org_admin_id`),
  ADD KEY `idx_invitation_node` (`organization_node_id`),
  ADD KEY `idx_invitation_guest` (`guest_id`),
  ADD KEY `idx_invitation_status` (`status`),
  ADD KEY `idx_invitation_valid_dates` (`valid_from`,`valid_to`);

--
-- Indexes for table `guest_otp`
--
ALTER TABLE `guest_otp`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_otp_invitation` (`invitation_id`),
  ADD KEY `idx_otp_expires` (`expires_at`);

--
-- Indexes for table `guest_qr_session`
--
ALTER TABLE `guest_qr_session`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_qr_session_invitation` (`invitation_id`),
  ADD KEY `idx_qr_session_expires` (`expires_at`);

--
-- Indexes for table `invitation_scan_event`
--
ALTER TABLE `invitation_scan_event`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_scan_event_invitation` (`invitation_id`),
  ADD KEY `idx_scan_event_personnel` (`scanned_by_security_personnel_id`),
  ADD KEY `idx_scan_event_timestamp` (`timestamp`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_recipient_type` (`recipient_type`),
  ADD KEY `idx_notification_type` (`notification_type`),
  ADD KEY `idx_sent_at` (`sent_at`);

--
-- Indexes for table `notification_reads`
--
ALTER TABLE `notification_reads`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_guest_read` (`notification_id`,`guest_id`),
  ADD UNIQUE KEY `unique_security_read` (`notification_id`,`security_personnel_id`),
  ADD KEY `idx_notification_id` (`notification_id`),
  ADD KEY `idx_guest_id` (`guest_id`),
  ADD KEY `idx_security_personnel_id` (`security_personnel_id`);

--
-- Indexes for table `notification_tokens`
--
ALTER TABLE `notification_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guest_id` (`guest_id`),
  ADD KEY `security_personnel_id` (`security_personnel_id`);

--
-- Indexes for table `organization_node`
--
ALTER TABLE `organization_node`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_org_node_parent` (`parent_id`),
  ADD KEY `idx_org_node_status` (`status`);

--
-- Indexes for table `organization_plan`
--
ALTER TABLE `organization_plan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscription_plan_id` (`subscription_plan_id`),
  ADD KEY `idx_org_plan_node` (`organization_node_id`),
  ADD KEY `idx_org_plan_status` (`status`);

--
-- Indexes for table `org_admin`
--
ALTER TABLE `org_admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_org_admin_node` (`organization_node_id`),
  ADD KEY `idx_org_admin_status` (`status`);

--
-- Indexes for table `security_personnel`
--
ALTER TABLE `security_personnel`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_security_personnel_node` (`organization_node_id`),
  ADD KEY `idx_security_personnel_status` (`status`);

--
-- Indexes for table `subscription_plan`
--
ALTER TABLE `subscription_plan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `super_admin`
--
ALTER TABLE `super_admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `billing_record`
--
ALTER TABLE `billing_record`
  ADD CONSTRAINT `billing_record_ibfk_1` FOREIGN KEY (`organization_node_id`) REFERENCES `organization_node` (`id`),
  ADD CONSTRAINT `billing_record_ibfk_2` FOREIGN KEY (`subscription_plan_id`) REFERENCES `subscription_plan` (`id`);

--
-- Constraints for table `geo_gate_location`
--
ALTER TABLE `geo_gate_location`
  ADD CONSTRAINT `geo_gate_location_ibfk_1` FOREIGN KEY (`organization_node_id`) REFERENCES `organization_node` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `guard_device`
--
ALTER TABLE `guard_device`
  ADD CONSTRAINT `guard_device_ibfk_1` FOREIGN KEY (`security_personnel_id`) REFERENCES `security_personnel` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `guest_device`
--
ALTER TABLE `guest_device`
  ADD CONSTRAINT `guest_device_ibfk_1` FOREIGN KEY (`guest_id`) REFERENCES `guest` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `guest_invitation`
--
ALTER TABLE `guest_invitation`
  ADD CONSTRAINT `guest_invitation_ibfk_1` FOREIGN KEY (`organization_node_id`) REFERENCES `organization_node` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `guest_invitation_ibfk_2` FOREIGN KEY (`guest_id`) REFERENCES `guest` (`id`),
  ADD CONSTRAINT `guest_invitation_ibfk_3` FOREIGN KEY (`created_by_org_admin_id`) REFERENCES `org_admin` (`id`);

--
-- Constraints for table `guest_otp`
--
ALTER TABLE `guest_otp`
  ADD CONSTRAINT `guest_otp_ibfk_1` FOREIGN KEY (`invitation_id`) REFERENCES `guest_invitation` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `guest_qr_session`
--
ALTER TABLE `guest_qr_session`
  ADD CONSTRAINT `guest_qr_session_ibfk_1` FOREIGN KEY (`invitation_id`) REFERENCES `guest_invitation` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `invitation_scan_event`
--
ALTER TABLE `invitation_scan_event`
  ADD CONSTRAINT `invitation_scan_event_ibfk_1` FOREIGN KEY (`invitation_id`) REFERENCES `guest_invitation` (`id`),
  ADD CONSTRAINT `invitation_scan_event_ibfk_2` FOREIGN KEY (`scanned_by_security_personnel_id`) REFERENCES `security_personnel` (`id`);

--
-- Constraints for table `notification_reads`
--
ALTER TABLE `notification_reads`
  ADD CONSTRAINT `notification_reads_ibfk_1` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notification_reads_ibfk_2` FOREIGN KEY (`guest_id`) REFERENCES `guest` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notification_reads_ibfk_3` FOREIGN KEY (`security_personnel_id`) REFERENCES `security_personnel` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notification_tokens`
--
ALTER TABLE `notification_tokens`
  ADD CONSTRAINT `notification_tokens_ibfk_1` FOREIGN KEY (`guest_id`) REFERENCES `guest` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `notification_tokens_ibfk_2` FOREIGN KEY (`security_personnel_id`) REFERENCES `security_personnel` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `organization_node`
--
ALTER TABLE `organization_node`
  ADD CONSTRAINT `organization_node_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `organization_node` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `organization_plan`
--
ALTER TABLE `organization_plan`
  ADD CONSTRAINT `organization_plan_ibfk_1` FOREIGN KEY (`organization_node_id`) REFERENCES `organization_node` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `organization_plan_ibfk_2` FOREIGN KEY (`subscription_plan_id`) REFERENCES `subscription_plan` (`id`);

--
-- Constraints for table `org_admin`
--
ALTER TABLE `org_admin`
  ADD CONSTRAINT `org_admin_ibfk_1` FOREIGN KEY (`organization_node_id`) REFERENCES `organization_node` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `security_personnel`
--
ALTER TABLE `security_personnel`
  ADD CONSTRAINT `security_personnel_ibfk_1` FOREIGN KEY (`organization_node_id`) REFERENCES `organization_node` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

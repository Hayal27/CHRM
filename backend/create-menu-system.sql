-- Menu System Tables for Privilege Management

-- Table to store all available menu items
CREATE TABLE `menu_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `label` varchar(100) NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `path` varchar(255) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `parent_id` (`parent_id`),
  FOREIGN KEY (`parent_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table to store role-based menu permissions
CREATE TABLE `role_menu_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) NOT NULL,
  `menu_item_id` int(11) NOT NULL,
  `can_view` tinyint(1) DEFAULT 1,
  `can_create` tinyint(1) DEFAULT 0,
  `can_edit` tinyint(1) DEFAULT 0,
  `can_delete` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_menu_unique` (`role_id`, `menu_item_id`),
  KEY `role_id` (`role_id`),
  KEY `menu_item_id` (`menu_item_id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE,
  FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table to store user-specific menu permissions (overrides role permissions)
CREATE TABLE `user_menu_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `menu_item_id` int(11) NOT NULL,
  `can_view` tinyint(1) DEFAULT 1,
  `can_create` tinyint(1) DEFAULT 0,
  `can_edit` tinyint(1) DEFAULT 0,
  `can_delete` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_menu_unique` (`user_id`, `menu_item_id`),
  KEY `user_id` (`user_id`),
  KEY `menu_item_id` (`menu_item_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert default menu items
INSERT INTO `menu_items` (`name`, `label`, `icon`, `path`, `parent_id`, `sort_order`) VALUES
-- Main Dashboard
('hr-dashboard', 'HR Dashboard', 'DashboardOutlined', '/hrms/dashboard', NULL, 1),

-- Core HR Group
('core-hr', 'Core HR', 'SolutionOutlined', NULL, NULL, 2),
('employee', 'Employee Profiles', 'IdcardOutlined', '/hrms/employee', 2, 1),
('enhanced-employee-profile', 'Enhanced Employee Profile', 'UserOutlined', '/hrms/employee/enhanced', 2, 2),
('department-management', 'Department Management', 'ApartmentOutlined', '/hrms/employee/departments', 2, 3),
('role-management', 'Role Management', 'SafetyOutlined', '/hrms/employee/roles', 2, 4),
('enhanced-employee-registration', 'Enhanced Employee Registration', 'UserAddOutlined', '/enhanced-employee-registration', 2, 5),
('attendance', 'Attendance', 'CalendarOutlined', '/hrms/attendance', 2, 6),
('leave', 'Leave Management', 'FileTextOutlined', '/hrms/leave', 2, 7),
('payroll', 'Payroll', 'MoneyCollectOutlined', '/hrms/payroll', 2, 8),

-- Talent Management Group
('talent', 'Talent Management', 'RiseOutlined', NULL, NULL, 3),
('recruitment', 'Recruitment', 'TeamOutlined', '/hrms/recruitment', 11, 1),
('onboarding', 'Onboarding', 'UserOutlined', '/hrms/onboarding', 11, 2),
('training', 'Training', 'ReadOutlined', '/hrms/training', 11, 3),
('performance', 'Performance', 'LineChartOutlined', '/hrms/performance', 11, 4),
('promotion', 'Promotion/Transfer', 'SwapOutlined', '/hrms/promotion', 11, 5),

-- Employee Lifecycle Group
('lifecycle', 'Employee Lifecycle', 'UserDeleteOutlined', NULL, NULL, 4),
('disciplinary', 'Disciplinary', 'WarningOutlined', '/hrms/disciplinary', 17, 1),
('resignation', 'Resignation/Termination', 'UserDeleteOutlined', '/hrms/resignation', 17, 2),
('archival', 'Archival/Ex-Employee', 'InboxOutlined', '/hrms/archival', 17, 3),

-- Admin Only
('employees-admin', 'Employees', 'UserOutlined', '/employees', NULL, 5),
('settings', 'Settings', 'SettingOutlined', '/settings', NULL, 6),
('menu-access', 'Menu Access Control', 'SettingOutlined', '/admin/menu-access', NULL, 7),

-- User Management
('user-management', 'User Management', 'TeamOutlined', NULL, NULL, 8),
('users', 'Users', 'UserOutlined', '/admin/users', 24, 1),
('user-register', 'Register User', 'UserAddOutlined', '/admin/users/register', 24, 2),

-- Role 3 Specific Menus
('my-profiles', 'My Profiles', 'IdcardOutlined', '/hrms/employees', NULL, 9),
('my-attendances', 'My Attendances', 'CalendarOutlined', '/hrms/attendances', NULL, 10),
('my-leaves', 'My Leaves', 'FileTextOutlined', '/hrms/leaves', NULL, 11),
('my-trainings', 'My Trainings', 'ReadOutlined', '/hrms/trainings', NULL, 12),
('my-disciplinarys', 'My Disciplinarys', 'WarningOutlined', '/hrms/disciplinarys', NULL, 13),
('my-resignations', 'My Resignations', 'UserDeleteOutlined', '/hrms/resignations', NULL, 14);

-- Insert default role permissions
-- Admin (Role 1) - Full access to everything
INSERT INTO `role_menu_permissions` (`role_id`, `menu_item_id`, `can_view`, `can_create`, `can_edit`, `can_delete`)
SELECT 1, id, 1, 1, 1, 1 FROM `menu_items`;

-- Academician (Role 2) - Access to most HR functions
INSERT INTO `role_menu_permissions` (`role_id`, `menu_item_id`, `can_view`, `can_create`, `can_edit`, `can_delete`)
SELECT 2, id, 1, 1, 1, 0 FROM `menu_items` 
WHERE name NOT IN ('employees-admin', 'settings', 'menu-access', 'users', 'user-register', 'my-profiles', 'my-attendances', 'my-leaves', 'my-trainings', 'my-disciplinarys', 'my-resignations');

-- Admin Staff (Role 3) - Limited access to own records
INSERT INTO `role_menu_permissions` (`role_id`, `menu_item_id`, `can_view`, `can_create`, `can_edit`, `can_delete`)
SELECT 3, id, 1, 0, 1, 0 FROM `menu_items` 
WHERE name IN ('hr-dashboard', 'my-profiles', 'my-attendances', 'my-leaves', 'my-trainings', 'my-disciplinarys', 'my-resignations');

-- HR Admin (Role 4) - HR specific functions
INSERT INTO `role_menu_permissions` (`role_id`, `menu_item_id`, `can_view`, `can_create`, `can_edit`, `can_delete`)
SELECT 4, id, 1, 1, 1, 1 FROM `menu_items` 
WHERE name NOT IN ('settings', 'menu-access', 'my-profiles', 'my-attendances', 'my-leaves', 'my-trainings', 'my-disciplinarys', 'my-resignations');

-- Registrar (Role 5) - Registration and basic HR functions
INSERT INTO `role_menu_permissions` (`role_id`, `menu_item_id`, `can_view`, `can_create`, `can_edit`, `can_delete`)
SELECT 5, id, 1, 1, 1, 0 FROM `menu_items` 
WHERE name IN ('hr-dashboard', 'employee', 'enhanced-employee-registration', 'attendance', 'leave', 'recruitment', 'onboarding');

-- Agent (Role 6) - Very limited access
INSERT INTO `role_menu_permissions` (`role_id`, `menu_item_id`, `can_view`, `can_create`, `can_edit`, `can_delete`)
SELECT 6, id, 1, 0, 0, 0 FROM `menu_items` 
WHERE name IN ('hr-dashboard');

-- Super User (Role 7) - Similar to admin but no settings
INSERT INTO `role_menu_permissions` (`role_id`, `menu_item_id`, `can_view`, `can_create`, `can_edit`, `can_delete`)
SELECT 7, id, 1, 1, 1, 1 FROM `menu_items` 
WHERE name NOT IN ('settings', 'menu-access');

-- Super Admin (Role 8) - Full access like admin
INSERT INTO `role_menu_permissions` (`role_id`, `menu_item_id`, `can_view`, `can_create`, `can_edit`, `can_delete`)
SELECT 8, id, 1, 1, 1, 1 FROM `menu_items`;
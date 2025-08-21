-- Migration Script for Enhanced CHRM System
-- This script safely migrates the existing database to the new enhanced schema
-- Run this script to update your existing database

-- =====================================================
-- 1. BACKUP EXISTING DATA (Create backup tables)
-- =====================================================

-- Backup existing tables before migration
CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM users;
CREATE TABLE IF NOT EXISTS employees_backup AS SELECT * FROM employees;

-- =====================================================
-- 2. CREATE NEW TABLES
-- =====================================================

-- Create colleges table
CREATE TABLE IF NOT EXISTS colleges (
    college_id INT PRIMARY KEY AUTO_INCREMENT,
    college_name VARCHAR(255) NOT NULL UNIQUE,
    college_code VARCHAR(50) UNIQUE,
    location VARCHAR(255),
    established_year YEAR,
    college_type ENUM('technical', 'vocational', 'university', 'institute') DEFAULT 'technical',
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    address TEXT,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. ALTER EXISTING TABLES
-- =====================================================

-- Add college_id to users table if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS college_id INT,
ADD FOREIGN KEY IF NOT EXISTS fk_users_college (college_id) REFERENCES colleges(college_id) ON DELETE SET NULL;

-- Add college_id to departments table if it doesn't exist
ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS college_id INT,
ADD FOREIGN KEY IF NOT EXISTS fk_departments_college (college_id) REFERENCES colleges(college_id) ON DELETE SET NULL;

-- Enhance employees table with new fields
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS user_id INT,
ADD COLUMN IF NOT EXISTS college_id INT,
ADD COLUMN IF NOT EXISTS employee_type ENUM('trainer', 'admin') DEFAULT 'admin',
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS age INT,
ADD COLUMN IF NOT EXISTS year_of_birth YEAR,
ADD COLUMN IF NOT EXISTS year_of_employment YEAR,
ADD COLUMN IF NOT EXISTS qualification_level VARCHAR(255),
ADD COLUMN IF NOT EXISTS qualification_subject VARCHAR(255),
ADD COLUMN IF NOT EXISTS year_of_upgrading YEAR,
ADD COLUMN IF NOT EXISTS competence_level VARCHAR(255),
ADD COLUMN IF NOT EXISTS competence_occupation VARCHAR(255),
ADD COLUMN IF NOT EXISTS citizen_address TEXT,
ADD COLUMN IF NOT EXISTS mobile VARCHAR(50),
ADD COLUMN IF NOT EXISTS occupation_on_training VARCHAR(255),
ADD COLUMN IF NOT EXISTS employed_work_process VARCHAR(255);

-- Add foreign key constraints to employees table
ALTER TABLE employees 
ADD FOREIGN KEY IF NOT EXISTS fk_employees_user (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
ADD FOREIGN KEY IF NOT EXISTS fk_employees_college (college_id) REFERENCES colleges(college_id) ON DELETE SET NULL;

-- =====================================================
-- 4. UPDATE EXISTING DATA
-- =====================================================

-- Update full_name field from existing name field
UPDATE employees 
SET full_name = COALESCE(CONCAT(fname, ' ', lname), name, email)
WHERE full_name IS NULL;

-- Set default employee_type based on existing role_id
UPDATE employees e
JOIN roles r ON e.role_id = r.role_id
SET e.employee_type = CASE 
    WHEN r.role_name LIKE '%trainer%' OR r.role_name LIKE '%instructor%' THEN 'trainer'
    ELSE 'admin'
END
WHERE e.employee_type IS NULL;

-- Link employees to users table via employee_id
UPDATE employees e
JOIN users u ON e.employee_id = u.employee_id
SET e.user_id = u.user_id
WHERE e.user_id IS NULL;

-- =====================================================
-- 5. CREATE NEW TABLES FOR ENHANCED FUNCTIONALITY
-- =====================================================

-- Education Office Reports Table
CREATE TABLE IF NOT EXISTS education_office_reports (
    report_id INT PRIMARY KEY AUTO_INCREMENT,
    college_id INT NOT NULL,
    report_type ENUM('employee_summary', 'trainer_details', 'admin_details', 'comprehensive') DEFAULT 'comprehensive',
    generated_by INT NOT NULL,
    report_data JSON,
    report_period_start DATE,
    report_period_end DATE,
    status ENUM('generating', 'completed', 'failed') DEFAULT 'generating',
    file_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(user_id) ON DELETE CASCADE
);

-- College User Assignments
CREATE TABLE IF NOT EXISTS college_user_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    college_id INT NOT NULL,
    assignment_type ENUM('primary', 'secondary', 'read_only') DEFAULT 'primary',
    assigned_by INT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_college (user_id, college_id)
);

-- =====================================================
-- 6. INSERT DEFAULT DATA
-- =====================================================

-- Insert enhanced roles
INSERT IGNORE INTO roles (role_id, role_name, description, is_system_role) VALUES
(1, 'Super Administrator', 'Full system access with all permissions', TRUE),
(2, 'Education Office Head', 'Head of education office with college management permissions', TRUE),
(3, 'Administrator', 'System administrator with user and college management permissions', TRUE),
(4, 'Manager', 'Department manager with limited administrative permissions', TRUE),
(5, 'Supervisor', 'Team supervisor with employee oversight permissions', TRUE),
(6, 'Employee', 'Regular employee with basic access permissions', TRUE),
(7, 'Trainer', 'Training staff with specialized permissions', TRUE),
(8, 'Job Seeker', 'External applicants with limited access', TRUE);

-- Insert sample colleges
INSERT IGNORE INTO colleges (college_name, college_code, location, college_type, contact_email, status) VALUES
('Technical College of Engineering', 'TCE001', 'Addis Ababa', 'technical', 'info@tce.edu.et', 'active'),
('Vocational Training Institute', 'VTI002', 'Bahir Dar', 'vocational', 'contact@vti.edu.et', 'active'),
('Institute of Technology', 'IOT003', 'Mekelle', 'institute', 'admin@iot.edu.et', 'active');

-- =====================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Colleges indexes
CREATE INDEX IF NOT EXISTS idx_colleges_status ON colleges(status);
CREATE INDEX IF NOT EXISTS idx_colleges_type ON colleges(college_type);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_college_id ON users(college_id);

-- Employees indexes
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_college_id ON employees(college_id);
CREATE INDEX IF NOT EXISTS idx_employees_type ON employees(employee_type);

-- Departments indexes
CREATE INDEX IF NOT EXISTS idx_departments_college_id ON departments(college_id);

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_college_id ON education_office_reports(college_id);
CREATE INDEX IF NOT EXISTS idx_reports_generated_by ON education_office_reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_reports_status ON education_office_reports(status);

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================

-- Verify migration success
SELECT 'Migration completed successfully' as status;
SELECT COUNT(*) as total_colleges FROM colleges;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_employees FROM employees;
SELECT COUNT(*) as employees_with_user_link FROM employees WHERE user_id IS NOT NULL;
SELECT COUNT(*) as employees_with_full_name FROM employees WHERE full_name IS NOT NULL;

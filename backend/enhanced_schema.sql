-- Enhanced CHRM Database Schema
-- This file contains the complete database schema for the enhanced CHRM system
-- including Education Office Dashboard and enhanced HRMS modules

-- =====================================================
-- 1. CORE SYSTEM TABLES (Enhanced)
-- =====================================================

-- Colleges Table for Education Office Management
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

-- Enhanced Roles Table with new roles for Education Office
CREATE TABLE IF NOT EXISTS roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSON,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Enhanced Departments Table
CREATE TABLE IF NOT EXISTS departments (
    department_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id INT,
    college_id INT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE SET NULL
);

-- Enhanced Users Table with college reference
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    user_name VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    department_id INT,
    college_id INT,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    avatar_url TEXT,
    failed_attempts INT DEFAULT 0,
    lock_until TIMESTAMP NULL,
    online_flag TINYINT DEFAULT 0,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL,
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE SET NULL
);

-- Enhanced Employees Table with detailed trainer/admin attributes
CREATE TABLE IF NOT EXISTS employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    college_id INT,
    employee_type ENUM('trainer', 'admin') NOT NULL,
    
    -- Common fields for both trainer and admin
    full_name VARCHAR(255) NOT NULL,
    fname VARCHAR(100),
    lname VARCHAR(100),
    sex ENUM('male', 'female', 'other'),
    age INT,
    year_of_birth YEAR,
    year_of_employment YEAR,
    qualification_level VARCHAR(255),
    qualification_subject VARCHAR(255),
    year_of_upgrading YEAR,
    competence_level VARCHAR(255),
    competence_occupation VARCHAR(255),
    citizen_address TEXT,
    mobile VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    
    -- Trainer specific fields
    occupation_on_training VARCHAR(255),
    
    -- Admin specific fields  
    employed_work_process VARCHAR(255),
    
    -- System fields
    name VARCHAR(255), -- Legacy field for compatibility
    role_id INT,
    department_id INT,
    supervisor_id INT,
    position VARCHAR(255),
    dateOfJoining DATE,
    hire_date DATE,
    salary DECIMAL(10,2),
    status ENUM('active', 'inactive', 'terminated') DEFAULT 'active',
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE SET NULL,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL,
    FOREIGN KEY (supervisor_id) REFERENCES employees(employee_id) ON DELETE SET NULL
);

-- =====================================================
-- 2. AUTHENTICATION & SECURITY TABLES
-- =====================================================

-- Login Attempts Table
CREATE TABLE IF NOT EXISTS login_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success TINYINT DEFAULT 0,
    ip_address VARCHAR(45),
    browser VARCHAR(255),
    location VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Password Reset Table
CREATE TABLE IF NOT EXISTS password_resets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    otp VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_reset (user_id)
);

-- =====================================================
-- 3. EDUCATION OFFICE SPECIFIC TABLES
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

-- College User Assignments (for tracking which users can access which colleges)
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
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================

-- Colleges indexes
CREATE INDEX idx_colleges_status ON colleges(status);
CREATE INDEX idx_colleges_type ON colleges(college_type);

-- Users indexes
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_department_id ON users(department_id);
CREATE INDEX idx_users_college_id ON users(college_id);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_employee_id ON users(employee_id);

-- Employees indexes
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_college_id ON employees(college_id);
CREATE INDEX idx_employees_type ON employees(employee_type);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_department_id ON employees(department_id);
CREATE INDEX idx_employees_email ON employees(email);

-- Departments indexes
CREATE INDEX idx_departments_college_id ON departments(college_id);
CREATE INDEX idx_departments_status ON departments(status);

-- Reports indexes
CREATE INDEX idx_reports_college_id ON education_office_reports(college_id);
CREATE INDEX idx_reports_generated_by ON education_office_reports(generated_by);
CREATE INDEX idx_reports_status ON education_office_reports(status);
CREATE INDEX idx_reports_type ON education_office_reports(report_type);

-- =====================================================
-- 5. INITIAL DATA SETUP
-- =====================================================

-- Insert default roles for the enhanced system
INSERT IGNORE INTO roles (role_id, role_name, description, is_system_role) VALUES
(1, 'Super Administrator', 'Full system access with all permissions', TRUE),
(2, 'Education Office Head', 'Head of education office with college management permissions', TRUE),
(3, 'Administrator', 'System administrator with user and college management permissions', TRUE),
(4, 'Manager', 'Department manager with limited administrative permissions', TRUE),
(5, 'Supervisor', 'Team supervisor with employee oversight permissions', TRUE),
(6, 'Employee', 'Regular employee with basic access permissions', TRUE),
(7, 'Trainer', 'Training staff with specialized permissions', TRUE),
(8, 'Job Seeker', 'External applicants with limited access', TRUE);

-- Insert sample colleges for testing
INSERT IGNORE INTO colleges (college_name, college_code, location, college_type, contact_email, status) VALUES
('Technical College of Engineering', 'TCE001', 'Addis Ababa', 'technical', 'info@tce.edu.et', 'active'),
('Vocational Training Institute', 'VTI002', 'Bahir Dar', 'vocational', 'contact@vti.edu.et', 'active'),
('Institute of Technology', 'IOT003', 'Mekelle', 'institute', 'admin@iot.edu.et', 'active');

-- =====================================================
-- 6. VIEWS FOR REPORTING
-- =====================================================

-- View for comprehensive employee information
CREATE OR REPLACE VIEW employee_comprehensive_view AS
SELECT
    e.employee_id,
    e.full_name,
    e.employee_type,
    e.sex,
    e.age,
    e.year_of_birth,
    e.year_of_employment,
    e.qualification_level,
    e.qualification_subject,
    e.year_of_upgrading,
    e.competence_level,
    e.competence_occupation,
    e.citizen_address,
    e.mobile,
    e.email,
    e.occupation_on_training,
    e.employed_work_process,
    e.position,
    e.dateOfJoining,
    e.status as employee_status,
    c.college_name,
    c.college_code,
    d.name as department_name,
    r.role_name,
    u.status as user_status,
    u.last_login
FROM employees e
LEFT JOIN colleges c ON e.college_id = c.college_id
LEFT JOIN departments d ON e.department_id = d.department_id
LEFT JOIN roles r ON e.role_id = r.role_id
LEFT JOIN users u ON e.user_id = u.user_id;

-- View for trainer-specific information
CREATE OR REPLACE VIEW trainer_details_view AS
SELECT
    e.employee_id,
    e.full_name,
    e.sex,
    e.age,
    e.year_of_birth,
    e.year_of_employment,
    e.qualification_level,
    e.qualification_subject,
    e.year_of_upgrading,
    e.competence_level,
    e.competence_occupation,
    e.occupation_on_training,
    e.mobile,
    e.citizen_address,
    e.email,
    c.college_name,
    c.college_code,
    e.status
FROM employees e
LEFT JOIN colleges c ON e.college_id = c.college_id
WHERE e.employee_type = 'trainer';

-- View for admin-specific information
CREATE OR REPLACE VIEW admin_details_view AS
SELECT
    e.employee_id,
    e.full_name,
    e.sex,
    e.age,
    e.year_of_birth,
    e.year_of_employment,
    e.qualification_level,
    e.qualification_subject,
    e.competence_level,
    e.competence_occupation,
    e.employed_work_process,
    e.citizen_address,
    e.mobile,
    e.email,
    c.college_name,
    c.college_code,
    e.status
FROM employees e
LEFT JOIN colleges c ON e.college_id = c.college_id
WHERE e.employee_type = 'admin';

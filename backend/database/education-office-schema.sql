-- Education Office Database Schema
-- This script creates the necessary tables for the Education Office features

USE hrms;

-- =====================================================
-- COLLEGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS colleges (
    college_id INT AUTO_INCREMENT PRIMARY KEY,
    college_name VARCHAR(255) NOT NULL UNIQUE,
    college_code VARCHAR(50) NOT NULL UNIQUE,
    location VARCHAR(255),
    college_type ENUM('technical', 'vocational', 'university', 'institute') DEFAULT 'technical',
    status ENUM('active', 'inactive') DEFAULT 'active',
    established_date DATE,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    description TEXT,
    capacity INT DEFAULT 0,
    current_enrollment INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_college_name (college_name),
    INDEX idx_college_code (college_code),
    INDEX idx_status (status)
);

-- =====================================================
-- COLLEGE DEPARTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS college_departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    college_id INT NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    department_code VARCHAR(50),
    head_of_department INT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE CASCADE,
    FOREIGN KEY (head_of_department) REFERENCES employees(employee_id) ON DELETE SET NULL,
    UNIQUE KEY unique_dept_per_college (college_id, department_name),
    INDEX idx_college_id (college_id),
    INDEX idx_department_name (department_name)
);

-- =====================================================
-- ENHANCED EMPLOYEES TABLE (Extension of existing employees table)
-- =====================================================
-- Add new columns to existing employees table for enhanced features
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS employee_type ENUM('admin', 'trainer', 'support', 'management') DEFAULT 'admin',
ADD COLUMN IF NOT EXISTS college_id INT,
ADD COLUMN IF NOT EXISTS specialization VARCHAR(255),
ADD COLUMN IF NOT EXISTS qualification_level ENUM('diploma', 'bachelor', 'master', 'phd', 'certificate') DEFAULT 'bachelor',
ADD COLUMN IF NOT EXISTS years_of_experience INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS certification_details TEXT,
ADD COLUMN IF NOT EXISTS training_areas TEXT,
ADD COLUMN IF NOT EXISTS citizen_address TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100),
ADD COLUMN IF NOT EXISTS created_by INT,
ADD COLUMN IF NOT EXISTS updated_by INT;

-- Add foreign key constraints for new columns
ALTER TABLE employees 
ADD CONSTRAINT fk_employee_college 
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE SET NULL,
ADD CONSTRAINT fk_employee_created_by 
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,
ADD CONSTRAINT fk_employee_updated_by 
    FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL;

-- Add indexes for better performance
ALTER TABLE employees 
ADD INDEX idx_employee_type (employee_type),
ADD INDEX idx_college_id (college_id),
ADD INDEX idx_specialization (specialization);

-- =====================================================
-- EMPLOYEE REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS employee_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    report_name VARCHAR(255) NOT NULL,
    college_id INT,
    department_id INT,
    report_type ENUM('comprehensive', 'summary', 'detailed', 'statistical') DEFAULT 'comprehensive',
    period_start DATE,
    period_end DATE,
    include_inactive BOOLEAN DEFAULT FALSE,
    generated_by INT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    report_data JSON,
    file_path VARCHAR(500),
    status ENUM('generating', 'completed', 'failed') DEFAULT 'generating',
    
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES college_departments(department_id) ON DELETE SET NULL,
    FOREIGN KEY (generated_by) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_college_id (college_id),
    INDEX idx_generated_by (generated_by),
    INDEX idx_generated_at (generated_at)
);

-- =====================================================
-- ADMIN ROLES TABLE (Extension for education office roles)
-- =====================================================
-- Insert education office specific roles if they don't exist
INSERT IGNORE INTO roles (role_name, description) VALUES 
('Education Office Head', 'Head of Education Office with administrative privileges'),
('College Administrator', 'Administrator for specific college operations'),
('Department Head', 'Head of a specific department within a college'),
('Training Coordinator', 'Coordinates training programs and activities');

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================
-- Insert sample colleges for testing
INSERT IGNORE INTO colleges (college_name, college_code, location, college_type, status, contact_email, contact_phone, description) VALUES 
('Addis Ababa Technical College', 'AATC001', 'Addis Ababa', 'technical', 'active', 'info@aatc.edu.et', '+251-11-123-4567', 'Leading technical college in Addis Ababa'),
('Bahir Dar Vocational Institute', 'BDVI002', 'Bahir Dar', 'vocational', 'active', 'admin@bdvi.edu.et', '+251-58-123-4567', 'Vocational training institute in Bahir Dar'),
('Hawassa Technical University', 'HTU003', 'Hawassa', 'university', 'active', 'registrar@htu.edu.et', '+251-46-123-4567', 'Technical university offering various programs');

-- Insert sample departments
INSERT IGNORE INTO college_departments (college_id, department_name, department_code, status) VALUES 
(1, 'Computer Science', 'CS', 'active'),
(1, 'Electrical Engineering', 'EE', 'active'),
(1, 'Mechanical Engineering', 'ME', 'active'),
(2, 'Automotive Technology', 'AT', 'active'),
(2, 'Construction Technology', 'CT', 'active'),
(3, 'Information Technology', 'IT', 'active'),
(3, 'Civil Engineering', 'CE', 'active');

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================
-- Create view for comprehensive employee data
CREATE OR REPLACE VIEW employee_comprehensive_view AS
SELECT 
    e.employee_id,
    e.name,
    e.fname,
    e.lname,
    e.email,
    e.phone,
    e.sex,
    e.position,
    e.dateOfJoining,
    e.status,
    e.employee_type,
    e.specialization,
    e.qualification_level,
    e.years_of_experience,
    e.citizen_address,
    e.emergency_contact_name,
    e.emergency_contact_phone,
    e.emergency_contact_relationship,
    c.college_name,
    c.college_code,
    c.location as college_location,
    cd.department_name,
    cd.department_code,
    d.department_name as hr_department,
    r.role_name,
    u.user_name,
    u.status as user_status,
    e.created_at,
    e.updated_at
FROM employees e
LEFT JOIN colleges c ON e.college_id = c.college_id
LEFT JOIN college_departments cd ON e.department_id = cd.department_id
LEFT JOIN departments d ON e.department_id = d.department_id
LEFT JOIN users u ON e.employee_id = u.employee_id
LEFT JOIN roles r ON u.role_id = r.role_id;

-- Create view for college statistics
CREATE OR REPLACE VIEW college_statistics_view AS
SELECT 
    c.college_id,
    c.college_name,
    c.college_code,
    c.location,
    c.college_type,
    c.status,
    COUNT(DISTINCT e.employee_id) as total_employees,
    COUNT(DISTINCT CASE WHEN e.employee_type = 'trainer' THEN e.employee_id END) as trainer_count,
    COUNT(DISTINCT CASE WHEN e.employee_type = 'admin' THEN e.employee_id END) as admin_count,
    COUNT(DISTINCT CASE WHEN e.employee_type = 'support' THEN e.employee_id END) as support_count,
    COUNT(DISTINCT cd.department_id) as department_count,
    c.capacity,
    c.current_enrollment,
    c.created_at,
    c.updated_at
FROM colleges c
LEFT JOIN employees e ON c.college_id = e.college_id AND e.status = 'Active'
LEFT JOIN college_departments cd ON c.college_id = cd.college_id AND cd.status = 'active'
GROUP BY c.college_id;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
-- Additional indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_employees_college_type ON employees(college_id, employee_type);
CREATE INDEX IF NOT EXISTS idx_employees_status_type ON employees(status, employee_type);
CREATE INDEX IF NOT EXISTS idx_colleges_type_status ON colleges(college_type, status);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
SELECT 'Education Office database schema created successfully!' as message;

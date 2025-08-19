-- Recruitment Module Database Tables

-- 1. Job Vacancies Table
CREATE TABLE IF NOT EXISTS job_vacancies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    description TEXT,
    requirements TEXT,
    responsibilities TEXT,
    salary_range VARCHAR(100),
    location VARCHAR(255),
    employment_type ENUM('full_time', 'part_time', 'contract', 'internship') DEFAULT 'full_time',
    experience_level ENUM('entry', 'mid', 'senior', 'executive') DEFAULT 'mid',
    education_required VARCHAR(255),
    skills_required TEXT,
    deadline DATE,
    status ENUM('active', 'inactive', 'closed') DEFAULT 'active',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 2. Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vacancy_id INT NOT NULL,
    user_id INT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    cover_letter TEXT,
    cv_path VARCHAR(500),
    expected_salary DECIMAL(10,2),
    availability_date DATE,
    status ENUM('pending', 'reviewed', 'shortlisted', 'interview_scheduled', 'interviewed', 'offer_sent', 'hired', 'rejected', 'on_hold') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vacancy_id) REFERENCES job_vacancies(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Interviews Table
CREATE TABLE IF NOT EXISTS interviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    interview_date DATE NOT NULL,
    interview_time TIME NOT NULL,
    interview_type ENUM('phone', 'video', 'in_person', 'technical', 'panel') DEFAULT 'in_person',
    location VARCHAR(255),
    interviewer_id INT,
    notes TEXT,
    status ENUM('scheduled', 'completed', 'cancelled', 'rescheduled') DEFAULT 'scheduled',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES job_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (interviewer_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 4. Interview Evaluations Table
CREATE TABLE IF NOT EXISTS interview_evaluations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    interview_id INT NOT NULL,
    evaluator_id INT NOT NULL,
    technical_skills INT CHECK (technical_skills >= 1 AND technical_skills <= 10),
    communication_skills INT CHECK (communication_skills >= 1 AND communication_skills <= 10),
    problem_solving INT CHECK (problem_solving >= 1 AND problem_solving <= 10),
    cultural_fit INT CHECK (cultural_fit >= 1 AND cultural_fit <= 10),
    overall_rating INT CHECK (overall_rating >= 1 AND overall_rating <= 10),
    strengths TEXT,
    weaknesses TEXT,
    recommendation ENUM('hire', 'do_not_hire', 'consider', 'strong_hire') NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluator_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 5. Offer Letters Table
CREATE TABLE IF NOT EXISTS offer_letters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    position VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    start_date DATE NOT NULL,
    benefits TEXT,
    terms_conditions TEXT,
    offer_expiry_date DATE,
    status ENUM('pending', 'accepted', 'declined', 'expired') DEFAULT 'pending',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES job_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 6. Hiring Decisions Table
CREATE TABLE IF NOT EXISTS hiring_decisions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    decision ENUM('hired', 'rejected', 'on_hold') NOT NULL,
    employment_start_date DATE,
    salary_confirmed DECIMAL(10,2),
    department VARCHAR(100),
    position VARCHAR(255),
    notes TEXT,
    decided_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES job_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (decided_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- 7. Employees Table (for hired candidates)
CREATE TABLE IF NOT EXISTS employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    department VARCHAR(100),
    position VARCHAR(255),
    hire_date DATE,
    salary DECIMAL(10,2),
    status ENUM('active', 'inactive', 'terminated') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Indexes for better performance
CREATE INDEX idx_job_vacancies_status ON job_vacancies(status);
CREATE INDEX idx_job_vacancies_department ON job_vacancies(department);
CREATE INDEX idx_job_applications_vacancy_id ON job_applications(vacancy_id);
CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_interviews_application_id ON interviews(application_id);
CREATE INDEX idx_interviews_date ON interviews(interview_date);
CREATE INDEX idx_interview_evaluations_interview_id ON interview_evaluations(interview_id);
CREATE INDEX idx_offer_letters_application_id ON offer_letters(application_id);
CREATE INDEX idx_hiring_decisions_application_id ON hiring_decisions(application_id);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_status ON employees(status); 
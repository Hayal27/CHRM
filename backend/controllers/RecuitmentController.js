const db = require('../models/db');
const multer = require('multer');
const path = require('path');

// Configure multer for CV uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/cvs/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'CV-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
        }
    }
});

// Helper function for database queries
const queryPromise = (sql, values) => {
    return new Promise((resolve, reject) => {
        db.query(sql, values)
            .then(results => resolve(results))
            .catch(error => {
                error.sql = sql;
                reject(error);
            });
    });
};

// ==================== RECRUITMENT MODULE FUNCTIONS ====================

// 1. Job Vacancy Management
const createJobVacancy = async (req, res) => {
    try {
        if (!req.user || !req.user.user_id) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const {
            title,
            department,
            description,
            requirements,
            responsibilities,
            salary_range,
            location,
            employment_type,
            experience_level,
            education_required,
            skills_required,
            deadline,
            status = 'active'
        } = req.body;

        if (!title || !department || !description) {
            return res.status(400).json({ message: "Title, department, and description are required." });
        }

        const sql = `
            INSERT INTO job_vacancies (
                title, department, description, requirements, responsibilities,
                salary_range, location, employment_type, experience_level,
                education_required, skills_required, deadline, status, created_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const values = [
            title, department, description, requirements, responsibilities,
            salary_range, location, employment_type, experience_level,
            education_required, skills_required, deadline, status, req.user.user_id
        ].map(v => v === undefined ? null : v);

        const result = await db.query(sql, values);
        
        res.status(201).json({
            message: "Job vacancy created successfully",
            vacancy_id: result.insertId,
            vacancy: {
                id: result.insertId,
                title,
                department,
                status
            }
        });

    } catch (error) {
        console.error("Error in createJobVacancy:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getJobVacancies = async (req, res) => {
    try {
        const { status, department, search } = req.query;
        
        let sql = `
            SELECT 
                jv.*,
                u.user_name as created_by_name,
                COUNT(ja.id) as application_count
            FROM job_vacancies jv
            LEFT JOIN users u ON jv.created_by = u.user_id
            LEFT JOIN job_applications ja ON jv.id = ja.vacancy_id
        `;
        
        const whereConditions = [];
        const params = [];
        
        if (status) {
            whereConditions.push("jv.status = ?");
            params.push(status);
        }
        
        if (department) {
            whereConditions.push("jv.department = ?");
            params.push(department);
        }
        
        if (search) {
            whereConditions.push("(jv.title LIKE ? OR jv.description LIKE ?)");
            params.push(`%${search}%`, `%${search}%`);
        }
        
        if (whereConditions.length > 0) {
            sql += " WHERE " + whereConditions.join(" AND ");
        }
        
        sql += " GROUP BY jv.id ORDER BY jv.created_at DESC";
        
        const vacancies = await db.query(sql, params);
        
        res.status(200).json({ vacancies });
        
    } catch (error) {
        console.error("Error in getJobVacancies:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const updateJobVacancy = async (req, res) => {
    try {
        if (!req.user || !req.user.user_id) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const { id } = req.params;
        const updateData = req.body;
        
        if (!id) {
            return res.status(400).json({ message: "Vacancy ID is required." });
        }

        const allowedFields = [
            'title', 'department', 'description', 'requirements', 'responsibilities',
            'salary_range', 'location', 'employment_type', 'experience_level',
            'education_required', 'skills_required', 'deadline', 'status'
        ];

        const updateFields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key)) {
                updateFields.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ message: "No valid fields to update." });
        }
        
        values.push(id);
        const sql = `UPDATE job_vacancies SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`;
        
        const result = await db.query(sql, values);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Job vacancy not found." });
        }
        
        res.json({ message: "Job vacancy updated successfully" });
        
    } catch (error) {
        console.error("Error in updateJobVacancy:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 2. Application Submission
const submitJobApplication = async (req, res) => {
    try {
        if (!req.user || !req.user.user_id) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const {
            vacancy_id,
            full_name,
            email,
            phone,
            address,
            cover_letter,
            expected_salary,
            availability_date
        } = req.body;

        if (!vacancy_id || !full_name || !email) {
            return res.status(400).json({ message: "Vacancy ID, full name, and email are required." });
        }

        // Check if vacancy exists and is active
        const vacancyCheck = await db.query("SELECT status FROM job_vacancies WHERE id = ?", [vacancy_id]);
        if (vacancyCheck.length === 0) {
            return res.status(404).json({ message: "Job vacancy not found." });
        }
        if (vacancyCheck[0].status !== 'active') {
            return res.status(400).json({ message: "This job vacancy is not accepting applications." });
        }

        // Check if user already applied
        const existingApplication = await db.query(
            "SELECT id FROM job_applications WHERE vacancy_id = ? AND user_id = ?",
            [vacancy_id, req.user.user_id]
        );
        
        if (existingApplication.length > 0) {
            return res.status(409).json({ message: "You have already applied for this position." });
        }

        const sql = `
            INSERT INTO job_applications (
                vacancy_id, user_id, full_name, email, phone, address,
                cover_letter, expected_salary, availability_date, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        `;

        const values = [
            vacancy_id, req.user.user_id, full_name, email, phone, address,
            cover_letter, expected_salary, availability_date
        ];

        const result = await db.query(sql, values);
        
        res.status(201).json({
            message: "Application submitted successfully",
            application_id: result.insertId
        });

    } catch (error) {
        console.error("Error in submitJobApplication:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const uploadApplicationCV = async (req, res) => {
    try {
        if (!req.user || !req.user.user_id) {
            return res.status(401).json({ message: "Authentication required." });
        }

        if (!req.file) {
            return res.status(400).json({ message: "CV file is required." });
        }

        const { application_id } = req.params;
        
        if (!application_id) {
            return res.status(400).json({ message: "Application ID is required." });
        }

        // Check if application exists and belongs to user
        const applicationCheck = await db.query(
            "SELECT id FROM job_applications WHERE id = ? AND user_id = ?",
            [application_id, req.user.user_id]
        );
        
        if (applicationCheck.length === 0) {
            return res.status(404).json({ message: "Application not found." });
        }

        const cv_path = req.file.path;
        const sql = "UPDATE job_applications SET cv_path = ? WHERE id = ?";
        await db.query(sql, [cv_path, application_id]);
        
        res.json({ 
            message: "CV uploaded successfully",
            cv_path: cv_path
        });

    } catch (error) {
        console.error("Error in uploadApplicationCV:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getJobApplications = async (req, res) => {
    try {
        if (!req.user || !req.user.user_id) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const { vacancy_id, status, user_id } = req.query;
        
        let sql = `
            SELECT 
                ja.*,
                jv.title as job_title,
                jv.department,
                u.user_name as applicant_name
            FROM job_applications ja
            JOIN job_vacancies jv ON ja.vacancy_id = jv.id
            LEFT JOIN users u ON ja.user_id = u.user_id
        `;
        
        const whereConditions = [];
        const params = [];
        
        if (vacancy_id) {
            whereConditions.push("ja.vacancy_id = ?");
            params.push(vacancy_id);
        }
        
        if (status) {
            whereConditions.push("ja.status = ?");
            params.push(status);
        }
        
        if (user_id) {
            whereConditions.push("ja.user_id = ?");
            params.push(user_id);
        }
        
        if (whereConditions.length > 0) {
            sql += " WHERE " + whereConditions.join(" AND ");
        }
        
        sql += " ORDER BY ja.created_at DESC";
        
        const applications = await db.query(sql, params);
        
        res.status(200).json({ applications });
        
    } catch (error) {
        console.error("Error in getJobApplications:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 3. Interview Scheduling
const scheduleInterview = async (req, res) => {
    try {
        if (!req.user || !req.user.user_id) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const {
            application_id,
            interview_date,
            interview_time,
            interview_type,
            location,
            interviewer_id,
            notes
        } = req.body;

        if (!application_id || !interview_date || !interview_time || !interview_type) {
            return res.status(400).json({ message: "Application ID, date, time, and type are required." });
        }

        // Check if application exists
        const applicationCheck = await db.query(
            "SELECT id, status FROM job_applications WHERE id = ?",
            [application_id]
        );
        
        if (applicationCheck.length === 0) {
            return res.status(404).json({ message: "Application not found." });
        }

        const sql = `
            INSERT INTO interviews (
                application_id, interview_date, interview_time, interview_type,
                location, interviewer_id, notes, status, created_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', ?, NOW())
        `;

        const values = [
            application_id, interview_date, interview_time, interview_type,
            location, interviewer_id, notes, req.user.user_id
        ];

        const result = await db.query(sql, values);
        
        // Update application status
        await db.query(
            "UPDATE job_applications SET status = 'interview_scheduled' WHERE id = ?",
            [application_id]
        );
        
        res.status(201).json({
            message: "Interview scheduled successfully",
            interview_id: result.insertId
        });

    } catch (error) {
        console.error("Error in scheduleInterview:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getInterviews = async (req, res) => {
    try {
        if (!req.user || !req.user.user_id) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const { status, date, interviewer_id } = req.query;
        
        let sql = `
            SELECT 
                i.*,
                ja.full_name as applicant_name,
                ja.email as applicant_email,
                jv.title as job_title,
                u.user_name as interviewer_name
            FROM interviews i
            JOIN job_applications ja ON i.application_id = ja.id
            JOIN job_vacancies jv ON ja.vacancy_id = jv.id
            LEFT JOIN users u ON i.interviewer_id = u.user_id
        `;
        
        const whereConditions = [];
        const params = [];
        
        if (status) {
            whereConditions.push("i.status = ?");
            params.push(status);
        }
        
        if (date) {
            whereConditions.push("DATE(i.interview_date) = ?");
            params.push(date);
        }
        
        if (interviewer_id) {
            whereConditions.push("i.interviewer_id = ?");
            params.push(interviewer_id);
        }
        
        if (whereConditions.length > 0) {
            sql += " WHERE " + whereConditions.join(" AND ");
        }
        
        sql += " ORDER BY i.interview_date, i.interview_time";
        
        const interviews = await db.query(sql, params);
        
        res.status(200).json({ interviews });
        
    } catch (error) {
        console.error("Error in getInterviews:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 4. Interview Evaluation
const submitInterviewEvaluation = async (req, res) => {
    try {
        if (!req.user || !req.user.user_id) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const { interview_id } = req.params;
        const {
            technical_skills,
            communication_skills,
            problem_solving,
            cultural_fit,
            overall_rating,
            strengths,
            weaknesses,
            recommendation,
            notes
        } = req.body;

        if (!interview_id || !overall_rating || !recommendation) {
            return res.status(400).json({ message: "Interview ID, overall rating, and recommendation are required." });
        }

        // Check if interview exists
        const interviewCheck = await db.query(
            "SELECT id, status FROM interviews WHERE id = ?",
            [interview_id]
        );
        
        if (interviewCheck.length === 0) {
            return res.status(404).json({ message: "Interview not found." });
        }

        const sql = `
            INSERT INTO interview_evaluations (
                interview_id, evaluator_id, technical_skills, communication_skills,
                problem_solving, cultural_fit, overall_rating, strengths, weaknesses,
                recommendation, notes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const values = [
            interview_id, req.user.user_id, technical_skills, communication_skills,
            problem_solving, cultural_fit, overall_rating, strengths, weaknesses,
            recommendation, notes
        ];

        const result = await db.query(sql, values);
        
        // Update interview status
        await db.query(
            "UPDATE interviews SET status = 'completed' WHERE id = ?",
            [interview_id]
        );
        
        res.status(201).json({
            message: "Interview evaluation submitted successfully",
            evaluation_id: result.insertId
        });

    } catch (error) {
        console.error("Error in submitInterviewEvaluation:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getInterviewEvaluations = async (req, res) => {
    try {
        if (!req.user || !req.user.user_id) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const { interview_id, application_id } = req.query;
        
        let sql = `
            SELECT 
                ie.*,
                i.interview_date,
                i.interview_time,
                ja.full_name as applicant_name,
                jv.title as job_title,
                u.user_name as evaluator_name
            FROM interview_evaluations ie
            JOIN interviews i ON ie.interview_id = i.id
            JOIN job_applications ja ON i.application_id = ja.id
            JOIN job_vacancies jv ON ja.vacancy_id = jv.id
            LEFT JOIN users u ON ie.evaluator_id = u.user_id
        `;
        
        const whereConditions = [];
        const params = [];
        
        if (interview_id) {
            whereConditions.push("ie.interview_id = ?");
            params.push(interview_id);
        }
        
        if (application_id) {
            whereConditions.push("i.application_id = ?");
            params.push(application_id);
        }
        
        if (whereConditions.length > 0) {
            sql += " WHERE " + whereConditions.join(" AND ");
        }
        
        sql += " ORDER BY ie.created_at DESC";
        
        const evaluations = await db.query(sql, params);
        
        res.status(200).json({ evaluations });
        
    } catch (error) {
        console.error("Error in getInterviewEvaluations:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 5. Offer Letter Generation
const generateOfferLetter = async (req, res) => {
    try {
        if (!req.user || !req.user.user_id) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const { application_id } = req.params;
        const {
            position,
            department,
            salary,
            start_date,
            benefits,
            terms_conditions,
            offer_expiry_date
        } = req.body;

        if (!application_id || !position || !salary || !start_date) {
            return res.status(400).json({ message: "Application ID, position, salary, and start date are required." });
        }

        // Check if application exists and is suitable for offer
        const applicationCheck = await db.query(
            "SELECT id, status FROM job_applications WHERE id = ?",
            [application_id]
        );
        
        if (applicationCheck.length === 0) {
            return res.status(404).json({ message: "Application not found." });
        }

        const sql = `
            INSERT INTO offer_letters (
                application_id, position, department, salary, start_date,
                benefits, terms_conditions, offer_expiry_date, status, created_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW())
        `;

        const values = [
            application_id, position, department, salary, start_date,
            benefits, terms_conditions, offer_expiry_date, req.user.user_id
        ];

        const result = await db.query(sql, values);
        
        // Update application status
        await db.query(
            "UPDATE job_applications SET status = 'offer_sent' WHERE id = ?",
            [application_id]
        );
        
        res.status(201).json({
            message: "Offer letter generated successfully",
            offer_id: result.insertId
        });

    } catch (error) {
        console.error("Error in generateOfferLetter:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getOfferLetters = async (req, res) => {
    try {
        if (!req.user || !req.user.user_id) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const { status, application_id } = req.query;
        
        let sql = `
            SELECT 
                ol.*,
                ja.full_name as applicant_name,
                ja.email as applicant_email,
                u.user_name as created_by_name
            FROM offer_letters ol
            JOIN job_applications ja ON ol.application_id = ja.id
            LEFT JOIN users u ON ol.created_by = u.user_id
        `;
        
        const whereConditions = [];
        const params = [];
        
        if (status) {
            whereConditions.push("ol.status = ?");
            params.push(status);
        }
        
        if (application_id) {
            whereConditions.push("ol.application_id = ?");
            params.push(application_id);
        }
        
        if (whereConditions.length > 0) {
            sql += " WHERE " + whereConditions.join(" AND ");
        }
        
        sql += " ORDER BY ol.created_at DESC";
        
        const offers = await db.query(sql, params);
        
        res.status(200).json({ offers });
        
    } catch (error) {
        console.error("Error in getOfferLetters:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// 6. Hiring Decision & Employment Start Date
const makeHiringDecision = async (req, res) => {
    try {
        if (!req.user || !req.user.user_id) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const { application_id } = req.params;
        const {
            decision,
            employment_start_date,
            salary_confirmed,
            department,
            position,
            notes
        } = req.body;

        if (!application_id || !decision || !employment_start_date) {
            return res.status(400).json({ message: "Application ID, decision, and employment start date are required." });
        }

        const validDecisions = ['hired', 'rejected', 'on_hold'];
        if (!validDecisions.includes(decision)) {
            return res.status(400).json({ message: "Invalid decision. Must be one of: hired, rejected, on_hold" });
        }

        // Check if application exists
        const applicationCheck = await db.query(
            "SELECT id, status FROM job_applications WHERE id = ?",
            [application_id]
        );
        
        if (applicationCheck.length === 0) {
            return res.status(404).json({ message: "Application not found." });
        }

        const sql = `
            INSERT INTO hiring_decisions (
                application_id, decision, employment_start_date, salary_confirmed,
                department, position, notes, decided_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const values = [
            application_id, decision, employment_start_date, salary_confirmed,
            department, position, notes, req.user.user_id
        ];

        const result = await db.query(sql, values);
        
        // Update application status
        const newStatus = decision === 'hired' ? 'hired' : decision === 'rejected' ? 'rejected' : 'on_hold';
        await db.query(
            "UPDATE job_applications SET status = ? WHERE id = ?",
            [newStatus, application_id]
        );
        
        // If hired, create employee record
        if (decision === 'hired') {
            const applicationDetails = await db.query(
                "SELECT full_name, email, phone FROM job_applications WHERE id = ?",
                [application_id]
            );
            
            if (applicationDetails.length > 0) {
                const employeeSql = `
                    INSERT INTO employees (
                        user_id, full_name, email, phone, department, position,
                        hire_date, salary, status, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
                `;
                
                const employeeValues = [
                    req.user.user_id, applicationDetails[0].full_name,
                    applicationDetails[0].email, applicationDetails[0].phone,
                    department, position, employment_start_date, salary_confirmed
                ];
                
                await db.query(employeeSql, employeeValues);
            }
        }
        
        res.status(201).json({
            message: `Hiring decision made: ${decision}`,
            decision_id: result.insertId
        });

    } catch (error) {
        console.error("Error in makeHiringDecision:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getHiringDecisions = async (req, res) => {
    try {
        if (!req.user || !req.user.user_id) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const { decision, department, date_range } = req.query;
        
        let sql = `
            SELECT 
                hd.*,
                ja.full_name as applicant_name,
                ja.email as applicant_email,
                jv.title as job_title,
                u.user_name as decided_by_name
            FROM hiring_decisions hd
            JOIN job_applications ja ON hd.application_id = ja.id
            JOIN job_vacancies jv ON ja.vacancy_id = jv.id
            LEFT JOIN users u ON hd.decided_by = u.user_id
        `;
        
        const whereConditions = [];
        const params = [];
        
        if (decision) {
            whereConditions.push("hd.decision = ?");
            params.push(decision);
        }
        
        if (department) {
            whereConditions.push("hd.department = ?");
            params.push(department);
        }
        
        if (date_range) {
            const [start_date, end_date] = date_range.split(',');
            whereConditions.push("DATE(hd.created_at) BETWEEN ? AND ?");
            params.push(start_date, end_date);
        }
        
        if (whereConditions.length > 0) {
            sql += " WHERE " + whereConditions.join(" AND ");
        }
        
        sql += " ORDER BY hd.created_at DESC";
        
        const decisions = await db.query(sql, params);
        
        res.status(200).json({ decisions });
        
    } catch (error) {
        console.error("Error in getHiringDecisions:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Recruitment Analytics
const getRecruitmentAnalytics = async (req, res) => {
    try {
        if (!req.user || !req.user.user_id) {
            return res.status(401).json({ message: "Authentication required." });
        }

        const { date_range } = req.query;
        
        let dateFilter = "";
        const params = [];
        
        if (date_range) {
            const [start_date, end_date] = date_range.split(',');
            dateFilter = "WHERE DATE(created_at) BETWEEN ? AND ?";
            params.push(start_date, end_date);
        }

        // Total applications
        const totalApplications = await db.query(
            `SELECT COUNT(*) as count FROM job_applications ${dateFilter}`,
            params
        );

        // Applications by status
        const applicationsByStatus = await db.query(
            `SELECT status, COUNT(*) as count 
             FROM job_applications ${dateFilter} 
             GROUP BY status`,
            params
        );

        // Interviews scheduled
        const interviewsScheduled = await db.query(
            `SELECT COUNT(*) as count FROM interviews ${dateFilter}`,
            params
        );

        // Hiring decisions
        const hiringDecisions = await db.query(
            `SELECT decision, COUNT(*) as count 
             FROM hiring_decisions ${dateFilter} 
             GROUP BY decision`,
            params
        );

        // Vacancies by department
        const vacanciesByDepartment = await db.query(
            `SELECT department, COUNT(*) as count 
             FROM job_vacancies ${dateFilter} 
             GROUP BY department`,
            params
        );

        res.status(200).json({
            analytics: {
                total_applications: totalApplications[0].count,
                applications_by_status: applicationsByStatus,
                interviews_scheduled: interviewsScheduled[0].count,
                hiring_decisions: hiringDecisions,
                vacancies_by_department: vacanciesByDepartment
            }
        });

    } catch (error) {
        console.error("Error in getRecruitmentAnalytics:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    // Existing vehicle functions
    
    
    // Job Vacancy Management
    createJobVacancy,
    getJobVacancies,
    updateJobVacancy,
    
    // Application Management
    submitJobApplication,
    uploadApplicationCV,
    getJobApplications,
    
    // Interview Management
    scheduleInterview,
    getInterviews,
    
    // Interview Evaluation
    submitInterviewEvaluation,
    getInterviewEvaluations,
    
    // Offer Management
    generateOfferLetter,
    getOfferLetters,
    
    // Hiring Decision
    makeHiringDecision,
    getHiringDecisions,
    
    // Recruitment Analytics
    getRecruitmentAnalytics
};
const db = require("../models/db");
const bcrypt = require('bcrypt');

// =====================================================
// ADMIN MODULE FUNCTIONS
// =====================================================

/**
 * Create a new user with administrator or education office head role
 */
const createAdminUser = async (req, res) => {
    const { 
        user_name, 
        password, 
        role_id, 
        college_id, 
        department_id,
        full_name,
        email,
        phone,
        employee_type = 'admin'
    } = req.body;

    // Input validation
    if (!user_name || !password || !role_id || !full_name || !email) {
        return res.status(400).json({
            success: false,
            code: "ERR_MISSING_FIELDS",
            message: "Missing required fields: user_name, password, role_id, full_name, email"
        });
    }

    // Validate role_id for admin roles (1=Super Admin, 2=Education Office Head, 3=Administrator)
    if (![1, 2, 3].includes(parseInt(role_id))) {
        return res.status(400).json({
            success: false,
            code: "ERR_INVALID_ROLE",
            message: "Invalid role. Only administrator roles are allowed."
        });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            code: "ERR_INVALID_EMAIL",
            message: "Invalid email format."
        });
    }

    // Password strength validation
    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            code: "ERR_WEAK_PASSWORD",
            message: "Password must be at least 8 characters long."
        });
    }

    let connection;

    try {
        connection = await db.pool.getConnection();
        await connection.beginTransaction();

        // Check if user already exists
        const [existingUser] = await connection.query(
            'SELECT user_id FROM users WHERE user_name = ? OR user_name = ?', 
            [user_name, email]
        );
        
        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(409).json({ 
                success: false, 
                message: "User with this username or email already exists." 
            });
        }

        // Create employee record first
        const [employeeResult] = await connection.query(
            `INSERT INTO employees 
                (full_name, email, phone, employee_type, college_id, department_id, status)
             VALUES (?, ?, ?, ?, ?, ?, 'active')`,
            [full_name, email, phone || null, employee_type, college_id || null, department_id || null]
        );

        const employee_id = employeeResult.insertId;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user record
        const [userResult] = await connection.query(
            `INSERT INTO users 
                (employee_id, user_name, password, role_id, department_id, college_id, status)
             VALUES (?, ?, ?, ?, ?, ?, 'active')`,
            [employee_id, user_name, hashedPassword, role_id, department_id || null, college_id || null]
        );

        const user_id = userResult.insertId;

        // Update employee with user_id
        await connection.query(
            'UPDATE employees SET user_id = ? WHERE employee_id = ?',
            [user_id, employee_id]
        );

        // If college_id is provided, create college assignment
        if (college_id) {
            await connection.query(
                `INSERT INTO college_user_assignments 
                    (user_id, college_id, assignment_type, assigned_by)
                 VALUES (?, ?, 'primary', ?)`,
                [user_id, college_id, req.user?.user_id || null]
            );
        }

        await connection.commit();

        res.status(201).json({ 
            success: true, 
            user_id, 
            employee_id,
            message: 'Admin user created successfully.' 
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Error creating admin user:", error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                success: false, 
                message: "User with this information already exists." 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: "An internal error occurred while creating the user.",
            error: error.message
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

/**
 * Create a new technical college
 */
const createCollege = async (req, res) => {
    const { 
        college_name, 
        college_code, 
        location, 
        college_type = 'technical',
        contact_phone,
        contact_email,
        address,
        established_date
    } = req.body;

    // Input validation
    if (!college_name) {
        return res.status(400).json({
            success: false,
            code: "ERR_MISSING_FIELDS",
            message: "College name is required."
        });
    }

    // Email format validation if provided
    if (contact_email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contact_email)) {
            return res.status(400).json({
                success: false,
                code: "ERR_INVALID_EMAIL",
                message: "Invalid contact email format."
            });
        }
    }

    let connection;

    try {
        connection = await db.pool.getConnection();
        await connection.beginTransaction();

        // Check if college already exists
        const [existingCollege] = await connection.query(
            'SELECT college_id FROM colleges WHERE college_name = ? OR college_code = ?', 
            [college_name, college_code]
        );
        
        if (existingCollege.length > 0) {
            await connection.rollback();
            return res.status(409).json({ 
                success: false, 
                message: "College with this name or code already exists." 
            });
        }

        // Create college record
        const [collegeResult] = await connection.query(
            `INSERT INTO colleges 
                (college_name, college_code, location, college_type, contact_phone, contact_email, address, established_date, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [
                college_name, 
                college_code || null, 
                location || null, 
                college_type, 
                contact_phone || null, 
                contact_email || null, 
                address || null, 
                established_date || null
            ]
        );

        const college_id = collegeResult.insertId;

        await connection.commit();

        res.status(201).json({ 
            success: true, 
            college_id,
            message: 'College created successfully.' 
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Error creating college:", error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                success: false, 
                message: "College with this information already exists." 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: "An internal error occurred while creating the college.",
            error: error.message
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

/**
 * Get all colleges
 */
const getAllColleges = async (req, res) => {
    try {
        const [colleges] = await db.pool.query(`
            SELECT 
                c.*,
                COUNT(e.employee_id) as employee_count,
                COUNT(CASE WHEN e.employee_type = 'trainer' THEN 1 END) as trainer_count,
                COUNT(CASE WHEN e.employee_type = 'admin' THEN 1 END) as admin_count
            FROM colleges c
            LEFT JOIN employees e ON c.college_id = e.college_id AND e.status = 'active'
            GROUP BY c.college_id
            ORDER BY c.college_name
        `);

        res.json({ 
            success: true, 
            colleges 
        });

    } catch (error) {
        console.error("Error fetching colleges:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching colleges",
            error: error.message
        });
    }
};

/**
 * Update college information
 */
const updateCollege = async (req, res) => {
    const { college_id } = req.params;
    const { 
        college_name, 
        college_code, 
        location, 
        college_type,
        contact_phone,
        contact_email,
        address,
        established_date,
        status
    } = req.body;

    if (!college_id) {
        return res.status(400).json({
            success: false,
            message: "College ID is required."
        });
    }

    try {
        const [result] = await db.pool.query(
            `UPDATE colleges SET 
                college_name = COALESCE(?, college_name),
                college_code = COALESCE(?, college_code),
                location = COALESCE(?, location),
                college_type = COALESCE(?, college_type),
                contact_phone = COALESCE(?, contact_phone),
                contact_email = COALESCE(?, contact_email),
                address = COALESCE(?, address),
                established_date = COALESCE(?, established_date),
                status = COALESCE(?, status),
                updated_at = CURRENT_TIMESTAMP
             WHERE college_id = ?`,
            [
                college_name, college_code, location, college_type,
                contact_phone, contact_email, address, established_date,
                status, college_id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "College not found."
            });
        }

        res.json({ 
            success: true, 
            message: "College updated successfully." 
        });

    } catch (error) {
        console.error("Error updating college:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error updating college",
            error: error.message
        });
    }
};

/**
 * Delete college
 */
const deleteCollege = async (req, res) => {
    const { college_id } = req.params;

    if (!college_id) {
        return res.status(400).json({
            success: false,
            message: "College ID is required."
        });
    }

    let connection;

    try {
        connection = await db.pool.getConnection();
        await connection.beginTransaction();

        // Check if college has employees
        const [employees] = await connection.query(
            'SELECT COUNT(*) as count FROM employees WHERE college_id = ?',
            [college_id]
        );

        if (employees[0].count > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: "Cannot delete college with existing employees. Please reassign or remove employees first."
            });
        }

        // Delete college
        const [result] = await connection.query(
            'DELETE FROM colleges WHERE college_id = ?',
            [college_id]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "College not found."
            });
        }

        await connection.commit();

        res.json({ 
            success: true, 
            message: "College deleted successfully." 
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Error deleting college:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error deleting college",
            error: error.message
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

// =====================================================
// EDUCATION OFFICE MODULE FUNCTIONS
// =====================================================

/**
 * Get all employees for a specific college with detailed information
 */
const getEmployeesByCollege = async (req, res) => {
    const { college_id } = req.params;
    const { employee_type, status } = req.query;

    if (!college_id) {
        return res.status(400).json({
            success: false,
            message: "College ID is required."
        });
    }

    try {
        let query = `
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
                e.status,
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
            LEFT JOIN users u ON e.user_id = u.user_id
            WHERE e.college_id = ?
        `;

        const queryParams = [college_id];

        // Add filters if provided
        if (employee_type) {
            query += ' AND e.employee_type = ?';
            queryParams.push(employee_type);
        }

        if (status) {
            query += ' AND e.status = ?';
            queryParams.push(status);
        }

        query += ' ORDER BY e.full_name';

        const [employees] = await db.pool.query(query, queryParams);

        res.json({
            success: true,
            employees,
            total: employees.length
        });

    } catch (error) {
        console.error("Error fetching employees by college:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching employees",
            error: error.message
        });
    }
};

/**
 * Generate comprehensive employee information report for a college
 */
const generateEmployeeReport = async (req, res) => {
    const {
        college_id,
        report_type = 'comprehensive',
        period_start,
        period_end,
        include_inactive = false
    } = req.body;

    if (!college_id) {
        return res.status(400).json({
            success: false,
            message: "College ID is required."
        });
    }

    let connection;

    try {
        connection = await db.pool.getConnection();
        await connection.beginTransaction();

        // Create report record
        const [reportResult] = await connection.query(
            `INSERT INTO education_office_reports
                (college_id, report_type, generated_by, report_period_start, report_period_end, status)
             VALUES (?, ?, ?, ?, ?, 'generating')`,
            [
                college_id,
                report_type,
                req.user?.user_id || null,
                period_start || null,
                period_end || null
            ]
        );

        const report_id = reportResult.insertId;

        // Build query based on report type
        let query;
        let queryParams = [college_id];

        switch (report_type) {
            case 'trainer_details':
                query = `
                    SELECT
                        full_name as "Trainer Full Name",
                        sex as "Sex",
                        age as "Age",
                        year_of_birth as "Year of Birth",
                        year_of_employment as "Year of Employment",
                        qualification_level as "Qualification Level",
                        qualification_subject as "Qualification Subject",
                        year_of_upgrading as "Year of Upgrading",
                        competence_level as "Competence Level",
                        competence_occupation as "Competence Occupation",
                        occupation_on_training as "Occupation on Training",
                        mobile as "Mobile",
                        citizen_address as "Citizen Address",
                        email as "Email"
                    FROM employees
                    WHERE college_id = ? AND employee_type = 'trainer'
                `;
                if (!include_inactive) {
                    query += ' AND status = "active"';
                }
                break;

            case 'admin_details':
                query = `
                    SELECT
                        full_name as "Employee Full Name",
                        sex as "Sex",
                        age as "Age",
                        year_of_birth as "Year of Birth",
                        year_of_employment as "Year of Employment",
                        qualification_level as "Qualification Level",
                        qualification_subject as "Qualification Subject",
                        competence_level as "Competence Level",
                        competence_occupation as "Competence Occupation",
                        employed_work_process as "Employed Work Process",
                        citizen_address as "Citizen Address",
                        mobile as "Mobile",
                        email as "Email"
                    FROM employees
                    WHERE college_id = ? AND employee_type = 'admin'
                `;
                if (!include_inactive) {
                    query += ' AND status = "active"';
                }
                break;

            default: // comprehensive
                query = `
                    SELECT
                        employee_type as "Employee Type",
                        full_name as "Full Name",
                        sex as "Sex",
                        age as "Age",
                        year_of_birth as "Year of Birth",
                        year_of_employment as "Year of Employment",
                        qualification_level as "Qualification Level",
                        qualification_subject as "Qualification Subject",
                        year_of_upgrading as "Year of Upgrading",
                        competence_level as "Competence Level",
                        competence_occupation as "Competence Occupation",
                        CASE
                            WHEN employee_type = 'trainer' THEN occupation_on_training
                            WHEN employee_type = 'admin' THEN employed_work_process
                            ELSE NULL
                        END as "Specific Role",
                        mobile as "Mobile",
                        citizen_address as "Citizen Address",
                        email as "Email",
                        status as "Status"
                    FROM employees
                    WHERE college_id = ?
                `;
                if (!include_inactive) {
                    query += ' AND status = "active"';
                }
        }

        query += ' ORDER BY employee_type, full_name';

        // Execute query to get report data
        const [reportData] = await connection.query(query, queryParams);

        // Update report with data
        await connection.query(
            `UPDATE education_office_reports
             SET report_data = ?, status = 'completed'
             WHERE report_id = ?`,
            [JSON.stringify(reportData), report_id]
        );

        await connection.commit();

        res.json({
            success: true,
            report_id,
            data: reportData,
            total_records: reportData.length,
            message: "Report generated successfully."
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Error generating employee report:", error);
        res.status(500).json({
            success: false,
            message: "Error generating report",
            error: error.message
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

/**
 * Get college statistics and summary
 */
const getCollegeStatistics = async (req, res) => {
    const { college_id } = req.params;

    if (!college_id) {
        return res.status(400).json({
            success: false,
            message: "College ID is required."
        });
    }

    try {
        // Get college basic info
        const [collegeInfo] = await db.pool.query(
            'SELECT * FROM colleges WHERE college_id = ?',
            [college_id]
        );

        if (collegeInfo.length === 0) {
            return res.status(404).json({
                success: false,
                message: "College not found."
            });
        }

        // Get employee statistics
        const [employeeStats] = await db.pool.query(`
            SELECT
                COUNT(*) as total_employees,
                COUNT(CASE WHEN employee_type = 'trainer' THEN 1 END) as total_trainers,
                COUNT(CASE WHEN employee_type = 'admin' THEN 1 END) as total_admins,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_employees,
                COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_employees,
                COUNT(CASE WHEN status = 'terminated' THEN 1 END) as terminated_employees
            FROM employees
            WHERE college_id = ?
        `, [college_id]);

        // Get department statistics
        const [departmentStats] = await db.pool.query(`
            SELECT
                d.name as department_name,
                COUNT(e.employee_id) as employee_count
            FROM departments d
            LEFT JOIN employees e ON d.department_id = e.department_id AND e.college_id = ?
            WHERE d.college_id = ?
            GROUP BY d.department_id, d.name
            ORDER BY employee_count DESC
        `, [college_id, college_id]);

        // Get recent activity (last 30 days)
        const [recentActivity] = await db.pool.query(`
            SELECT
                COUNT(*) as new_employees_last_30_days
            FROM employees
            WHERE college_id = ?
            AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `, [college_id]);

        res.json({
            success: true,
            college: collegeInfo[0],
            statistics: {
                employees: employeeStats[0],
                departments: departmentStats,
                recent_activity: recentActivity[0]
            }
        });

    } catch (error) {
        console.error("Error fetching college statistics:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching statistics",
            error: error.message
        });
    }
};

module.exports = {
    createAdminUser,
    createCollege,
    getAllColleges,
    updateCollege,
    deleteCollege,
    getEmployeesByCollege,
    generateEmployeeReport,
    getCollegeStatistics
};

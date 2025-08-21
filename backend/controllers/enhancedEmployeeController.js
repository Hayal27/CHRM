const db = require("../models/db");
const bcrypt = require('bcrypt');

// =====================================================
// ENHANCED EMPLOYEE MODULE FUNCTIONS
// =====================================================

/**
 * Add employee with dynamic trainer/admin attributes
 */
const addEnhancedEmployee = async (req, res) => {
    const { 
        // Common fields
        full_name,
        fname,
        lname,
        sex,
        age,
        year_of_birth,
        year_of_employment,
        qualification_level,
        qualification_subject,
        year_of_upgrading,
        competence_level,
        competence_occupation,
        citizen_address,
        mobile,
        email,
        
        // Employee type
        employee_type, // 'trainer' or 'admin'
        
        // Trainer specific fields
        occupation_on_training,
        
        // Admin specific fields
        employed_work_process,
        
        // System fields
        role_id,
        department_id,
        college_id,
        supervisor_id,
        position,
        dateOfJoining,
        
        // User creation fields
        create_user = true,
        user_name,
        password = 'Hrm@123'
    } = req.body;

    // Handle uploaded document
    const documentPath = req.file ? req.file.path : null;

    // Debug: Log what we received
    console.log('🔍 Content-Type:', req.headers['content-type']);
    console.log('🔍 Body keys:', Object.keys(req.body));
    console.log('🔍 Required fields check:');
    console.log('  - full_name:', req.body.full_name);
    console.log('  - email:', req.body.email);
    console.log('  - employee_type:', req.body.employee_type);

    // Input validation
    if (!full_name || !email || !employee_type) {
        return res.status(400).json({
            success: false,
            code: "ERR_MISSING_FIELDS",
            message: "Missing required fields: full_name, email, employee_type"
        });
    }

    // Validate employee type
    if (!['trainer', 'admin'].includes(employee_type)) {
        return res.status(400).json({
            success: false,
            code: "ERR_INVALID_EMPLOYEE_TYPE",
            message: "Employee type must be either 'trainer' or 'admin'"
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

    // Validate trainer-specific fields
    if (employee_type === 'trainer' && !occupation_on_training) {
        return res.status(400).json({
            success: false,
            code: "ERR_MISSING_TRAINER_FIELDS",
            message: "Occupation on Training is required for trainer employees."
        });
    }

    // Validate admin-specific fields
    if (employee_type === 'admin' && !employed_work_process) {
        return res.status(400).json({
            success: false,
            code: "ERR_MISSING_ADMIN_FIELDS",
            message: "Employed Work Process is required for admin employees."
        });
    }

    let connection;

    try {
        connection = await db.pool.getConnection();
        await connection.beginTransaction();

        // Check if employee with email already exists
        const [existingEmployee] = await connection.query(
            'SELECT employee_id FROM employees WHERE email = ?',
            [email]
        );

        if (existingEmployee.length > 0) {
            await connection.rollback();
            return res.status(409).json({
                success: false,
                message: "Employee with this email already exists."
            });
        }

        // Create employee record with enhanced attributes
        const [employeeResult] = await connection.query(
            `INSERT INTO employees
                (name, fname, lname, email, phone, sex, role_id, department_id, college_id,
                 position, dateOfJoining, status, employee_type, specialization, qualification_level,
                 years_of_experience, citizen_address, emergency_contact_name, emergency_contact_phone,
                 emergency_contact_relationship, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                full_name,
                fname || null,
                lname || null,
                email,
                mobile || null,
                sex || null,
                role_id || null,
                department_id || null,
                college_id || null,
                position || null,
                dateOfJoining || null,
                employee_type,
                qualification_subject || null,
                qualification_level || null,
                year_of_employment ? (new Date().getFullYear() - parseInt(year_of_employment)) : null,
                citizen_address || null,
                null, // emergency_contact_name - can be added to form later
                null, // emergency_contact_phone - can be added to form later
                null, // emergency_contact_relationship - can be added to form later
                req.user?.user_id || null
            ]
        );

        const employee_id = employeeResult.insertId;
        let user_id = null;

        // Store document path if uploaded
        if (documentPath) {
            await connection.query(
                'UPDATE employees SET document_path = ? WHERE employee_id = ?',
                [documentPath, employee_id]
            );
        }

        // Create user account if requested
        if (create_user) {
            const defaultUsername = user_name || email;
            
            // Check if username already exists
            const [existingUser] = await connection.query(
                'SELECT user_id FROM users WHERE user_name = ?',
                [defaultUsername]
            );

            if (existingUser.length > 0) {
                await connection.rollback();
                return res.status(409).json({
                    success: false,
                    message: "Username already exists. Please choose a different username."
                });
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const [userResult] = await connection.query(
                `INSERT INTO users 
                    (employee_id, user_name, password, role_id, department_id, status)
                 VALUES (?, ?, ?, ?, ?, '1')`,
                [employee_id, defaultUsername, hashedPassword, role_id || null, department_id || null]
            );

            user_id = userResult.insertId;
        }

        await connection.commit();

        res.status(201).json({
            success: true,
            employee_id,
            user_id,
            employee_type,
            message: `${employee_type.charAt(0).toUpperCase() + employee_type.slice(1)} employee created successfully.`
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Error creating enhanced employee:", error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: "Employee with this information already exists."
            });
        }

        res.status(500).json({
            success: false,
            message: "An internal error occurred while creating the employee.",
            error: error.message
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

/**
 * Get all employees with enhanced attributes
 */
const getAllEnhancedEmployees = async (req, res) => {
    const { employee_type, college_id, department_id, status } = req.query;

    try {
        let query = `
            SELECT 
                e.employee_id,
                e.name as full_name,
                e.fname,
                e.lname,
                e.email,
                e.phone as mobile,
                e.sex,
                e.position,
                e.dateOfJoining,
                e.status,
                r.role_name,
                d.name as department_name,
                u.user_id,
                u.user_name,
                u.status as user_status,
                u.last_login
            FROM employees e
            LEFT JOIN roles r ON e.role_id = r.role_id
            LEFT JOIN departments d ON e.department_id = d.department_id
            LEFT JOIN users u ON e.employee_id = u.employee_id
            WHERE 1=1
        `;

        const queryParams = [];

        // Add filters
        if (employee_type) {
            // For now, we'll use role-based filtering until the enhanced schema is implemented
            if (employee_type === 'trainer') {
                query += ' AND (r.role_name LIKE "%trainer%" OR r.role_name LIKE "%instructor%")';
            } else if (employee_type === 'admin') {
                query += ' AND (r.role_name LIKE "%admin%" OR r.role_name LIKE "%manager%")';
            }
        }

        if (department_id) {
            query += ' AND e.department_id = ?';
            queryParams.push(department_id);
        }

        if (status) {
            query += ' AND e.status = ?';
            queryParams.push(status);
        }

        query += ' ORDER BY e.name';

        const [employees] = await db.pool.query(query, queryParams);

        res.json({
            success: true,
            employees,
            total: employees.length,
            filters_applied: {
                employee_type,
                college_id,
                department_id,
                status
            }
        });

    } catch (error) {
        console.error("Error fetching enhanced employees:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching employees",
            error: error.message
        });
    }
};

/**
 * Get employee by ID with enhanced attributes
 */
const getEnhancedEmployeeById = async (req, res) => {
    const { employee_id } = req.params;

    if (!employee_id) {
        return res.status(400).json({
            success: false,
            message: "Employee ID is required."
        });
    }

    try {
        const [employee] = await db.pool.query(`
            SELECT 
                e.*,
                r.role_name,
                d.name as department_name,
                u.user_id,
                u.user_name,
                u.status as user_status,
                u.last_login,
                s.name as supervisor_name
            FROM employees e
            LEFT JOIN roles r ON e.role_id = r.role_id
            LEFT JOIN departments d ON e.department_id = d.department_id
            LEFT JOIN users u ON e.employee_id = u.employee_id
            LEFT JOIN employees s ON e.supervisor_id = s.employee_id
            WHERE e.employee_id = ?
        `, [employee_id]);

        if (employee.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found."
            });
        }

        res.json({
            success: true,
            employee: employee[0]
        });

    } catch (error) {
        console.error("Error fetching employee by ID:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching employee",
            error: error.message
        });
    }
};

/**
 * Update employee with enhanced attributes
 */
const updateEnhancedEmployee = async (req, res) => {
    const { employee_id } = req.params;
    const updateData = req.body;

    if (!employee_id) {
        return res.status(400).json({
            success: false,
            message: "Employee ID is required."
        });
    }

    try {
        // Build dynamic update query
        const updateFields = [];
        const updateValues = [];

        // Common fields that can be updated
        const allowedFields = [
            'name', 'fname', 'lname', 'email', 'phone', 'sex', 
            'position', 'dateOfJoining', 'status', 'role_id', 
            'department_id', 'supervisor_id'
        ];

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                updateFields.push(`${field} = ?`);
                updateValues.push(updateData[field]);
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided for update."
            });
        }

        updateValues.push(employee_id);

        const [result] = await db.pool.query(
            `UPDATE employees SET ${updateFields.join(', ')} WHERE employee_id = ?`,
            updateValues
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found."
            });
        }

        res.json({
            success: true,
            message: "Employee updated successfully."
        });

    } catch (error) {
        console.error("Error updating enhanced employee:", error);
        res.status(500).json({
            success: false,
            message: "Error updating employee",
            error: error.message
        });
    }
};

/**
 * Get employee statistics by type
 */
const getEmployeeStatistics = async (req, res) => {
    try {
        // Get overall statistics
        const [overallStats] = await db.pool.query(`
            SELECT 
                COUNT(*) as total_employees,
                COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_employees,
                COUNT(CASE WHEN status = 'Inactive' THEN 1 END) as inactive_employees
            FROM employees
        `);

        // Get statistics by role (approximating trainer/admin types)
        const [roleStats] = await db.pool.query(`
            SELECT 
                r.role_name,
                COUNT(e.employee_id) as count
            FROM roles r
            LEFT JOIN employees e ON r.role_id = e.role_id
            GROUP BY r.role_id, r.role_name
            ORDER BY count DESC
        `);

        // Get statistics by department
        const [departmentStats] = await db.pool.query(`
            SELECT 
                d.name as department_name,
                COUNT(e.employee_id) as count
            FROM departments d
            LEFT JOIN employees e ON d.department_id = e.department_id
            GROUP BY d.department_id, d.name
            ORDER BY count DESC
        `);

        res.json({
            success: true,
            statistics: {
                overall: overallStats[0],
                by_role: roleStats,
                by_department: departmentStats
            }
        });

    } catch (error) {
        console.error("Error fetching employee statistics:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching statistics",
            error: error.message
        });
    }
};

module.exports = {
    addEnhancedEmployee,
    getAllEnhancedEmployees,
    getEnhancedEmployeeById,
    updateEnhancedEmployee,
    getEmployeeStatistics
};

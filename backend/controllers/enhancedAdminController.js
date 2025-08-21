const db = require("../models/db");
const bcrypt = require('bcrypt');

// =====================================================
// ENHANCED HRMS ADMIN MODULE FUNCTIONS
// =====================================================

/**
 * Create a new user with college reference
 */
const createUserWithCollege = async (req, res) => {
    const { 
        user_name, 
        password, 
        role_id, 
        college_id, 
        department_id,
        full_name,
        fname,
        lname,
        email,
        phone,
        sex,
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
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            code: "ERR_WEAK_PASSWORD",
            message: "Password must be at least 6 characters long."
        });
    }

    let connection;

    try {
        connection = await db.pool.getConnection();
        await connection.beginTransaction();

        // Check if user already exists
        const [existingUser] = await connection.query(
            'SELECT user_id FROM users WHERE user_name = ?', 
            [user_name]
        );
        
        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(409).json({ 
                success: false, 
                message: "User with this username already exists." 
            });
        }

        // Check if email already exists in employees
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

        // Create employee record first
        const [employeeResult] = await connection.query(
            `INSERT INTO employees 
                (name, fname, lname, email, phone, sex, role_id, department_id, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')`,
            [
                full_name || `${fname} ${lname}`, 
                fname, 
                lname, 
                email, 
                phone || null, 
                sex || null, 
                role_id, 
                department_id || null
            ]
        );

        const employee_id = employeeResult.insertId;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user record with college reference
        const [userResult] = await connection.query(
            `INSERT INTO users 
                (employee_id, user_name, password, role_id, department_id, status)
             VALUES (?, ?, ?, ?, ?, '1')`,
            [employee_id, user_name, hashedPassword, role_id, department_id || null]
        );

        const user_id = userResult.insertId;

        // If college_id is provided, we'll need to add it to the enhanced schema later
        // For now, we'll store it in a temporary way or handle it in the migration

        await connection.commit();

        res.status(201).json({ 
            success: true, 
            user_id, 
            employee_id,
            message: 'User created successfully with college reference.' 
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Error creating user with college:", error);

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
 * Get all users with their college and employee information
 */
const getAllUsersWithColleges = async (req, res) => {
    try {
        const [users] = await db.pool.query(`
            SELECT 
                u.user_id,
                u.user_name,
                u.status as user_status,
                u.created_at as user_created_at,
                u.last_login,
                e.employee_id,
                e.name as employee_name,
                e.fname,
                e.lname,
                e.email,
                e.phone,
                e.sex,
                e.position,
                e.dateOfJoining,
                e.status as employee_status,
                r.role_name,
                d.name as department_name
            FROM users u
            LEFT JOIN employees e ON u.employee_id = e.employee_id
            LEFT JOIN roles r ON u.role_id = r.role_id
            LEFT JOIN departments d ON u.department_id = d.department_id
            ORDER BY u.created_at DESC
        `);

        res.json({ 
            success: true, 
            users,
            total: users.length
        });

    } catch (error) {
        console.error("Error fetching users with colleges:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching users",
            error: error.message
        });
    }
};

/**
 * Update user with college assignment
 */
const updateUserWithCollege = async (req, res) => {
    const { user_id } = req.params;
    const { 
        user_name, 
        role_id, 
        department_id,
        college_id,
        status,
        employee_data
    } = req.body;

    if (!user_id) {
        return res.status(400).json({
            success: false,
            message: "User ID is required."
        });
    }

    let connection;

    try {
        connection = await db.pool.getConnection();
        await connection.beginTransaction();

        // Update user record
        const [userResult] = await connection.query(
            `UPDATE users SET 
                user_name = COALESCE(?, user_name),
                role_id = COALESCE(?, role_id),
                department_id = COALESCE(?, department_id),
                status = COALESCE(?, status)
             WHERE user_id = ?`,
            [user_name, role_id, department_id, status, user_id]
        );

        if (userResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        // Update employee record if employee_data is provided
        if (employee_data) {
            const { fname, lname, email, phone, sex, position } = employee_data;
            
            await connection.query(
                `UPDATE employees e
                 JOIN users u ON e.employee_id = u.employee_id
                 SET 
                    e.fname = COALESCE(?, e.fname),
                    e.lname = COALESCE(?, e.lname),
                    e.email = COALESCE(?, e.email),
                    e.phone = COALESCE(?, e.phone),
                    e.sex = COALESCE(?, e.sex),
                    e.position = COALESCE(?, e.position),
                    e.role_id = COALESCE(?, e.role_id),
                    e.department_id = COALESCE(?, e.department_id)
                 WHERE u.user_id = ?`,
                [fname, lname, email, phone, sex, position, role_id, department_id, user_id]
            );
        }

        await connection.commit();

        res.json({ 
            success: true, 
            message: "User updated successfully." 
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Error updating user with college:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error updating user",
            error: error.message
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

/**
 * Link existing employee to user (for migration purposes)
 */
const linkEmployeeToUser = async (req, res) => {
    const { employee_id, user_id } = req.body;

    if (!employee_id || !user_id) {
        return res.status(400).json({
            success: false,
            message: "Both employee_id and user_id are required."
        });
    }

    try {
        // Update user with employee_id
        const [result] = await db.pool.query(
            'UPDATE users SET employee_id = ? WHERE user_id = ?',
            [employee_id, user_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.json({ 
            success: true, 
            message: "Employee linked to user successfully." 
        });

    } catch (error) {
        console.error("Error linking employee to user:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error linking employee to user",
            error: error.message
        });
    }
};

/**
 * Get available colleges for user assignment
 */
const getAvailableColleges = async (req, res) => {
    try {
        // For now, return departments as colleges until migration is complete
        const [departments] = await db.pool.query(`
            SELECT 
                department_id as college_id,
                name as college_name,
                'department' as type
            FROM departments
            ORDER BY name
        `);

        res.json({ 
            success: true, 
            colleges: departments
        });

    } catch (error) {
        console.error("Error fetching available colleges:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching colleges",
            error: error.message
        });
    }
};

/**
 * Get system statistics for admin dashboard
 */
const getSystemStatistics = async (req, res) => {
    try {
        // Get user statistics
        const [userStats] = await db.pool.query(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN status = '1' THEN 1 END) as active_users,
                COUNT(CASE WHEN status = '0' THEN 1 END) as inactive_users
            FROM users
        `);

        // Get employee statistics
        const [employeeStats] = await db.pool.query(`
            SELECT 
                COUNT(*) as total_employees,
                COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_employees,
                COUNT(CASE WHEN status = 'Inactive' THEN 1 END) as inactive_employees
            FROM employees
        `);

        // Get role distribution
        const [roleStats] = await db.pool.query(`
            SELECT 
                r.role_name,
                COUNT(u.user_id) as user_count
            FROM roles r
            LEFT JOIN users u ON r.role_id = u.role_id
            GROUP BY r.role_id, r.role_name
            ORDER BY user_count DESC
        `);

        // Get department distribution
        const [departmentStats] = await db.pool.query(`
            SELECT 
                d.name as department_name,
                COUNT(e.employee_id) as employee_count
            FROM departments d
            LEFT JOIN employees e ON d.department_id = e.department_id
            GROUP BY d.department_id, d.name
            ORDER BY employee_count DESC
        `);

        res.json({ 
            success: true, 
            statistics: {
                users: userStats[0],
                employees: employeeStats[0],
                roles: roleStats,
                departments: departmentStats
            }
        });

    } catch (error) {
        console.error("Error fetching system statistics:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching statistics",
            error: error.message
        });
    }
};

module.exports = {
    createUserWithCollege,
    getAllUsersWithColleges,
    updateUserWithCollege,
    linkEmployeeToUser,
    getAvailableColleges,
    getSystemStatistics
};

const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

const {
    createUserWithCollege,
    getAllUsersWithColleges,
    updateUserWithCollege,
    linkEmployeeToUser,
    getAvailableColleges,
    getSystemStatistics
} = require('../controllers/enhancedAdminController');

// =====================================================
// ENHANCED HRMS ADMIN MODULE ROUTES
// =====================================================

/**
 * @route POST /api/admin/create-user-with-college
 * @desc Create a new user with college reference
 * @access Private (Admin only)
 */
router.post('/create-user-with-college', verifyToken, createUserWithCollege);

/**
 * @route GET /api/admin/users-with-colleges
 * @desc Get all users with their college and employee information
 * @access Private (Admin only)
 */
router.get('/users-with-colleges', verifyToken, getAllUsersWithColleges);

/**
 * @route PUT /api/admin/users/:user_id/update-with-college
 * @desc Update user with college assignment
 * @access Private (Admin only)
 */
router.put('/users/:user_id/update-with-college', verifyToken, updateUserWithCollege);

/**
 * @route POST /api/admin/link-employee-user
 * @desc Link existing employee to user (for migration purposes)
 * @access Private (Admin only)
 */
router.post('/link-employee-user', verifyToken, linkEmployeeToUser);

/**
 * @route GET /api/admin/available-colleges
 * @desc Get available colleges for user assignment
 * @access Private (Admin only)
 */
router.get('/available-colleges', verifyToken, getAvailableColleges);

/**
 * @route GET /api/admin/system-statistics
 * @desc Get system statistics for admin dashboard
 * @access Private (Admin only)
 */
router.get('/system-statistics', verifyToken, getSystemStatistics);

// =====================================================
// UTILITY ROUTES FOR ADMIN
// =====================================================

/**
 * @route GET /api/admin/roles
 * @desc Get all available roles
 * @access Private (Admin only)
 */
router.get('/roles', verifyToken, async (req, res) => {
    try {
        const [roles] = await require('../models/db').pool.query(`
            SELECT role_id, role_name, status 
            FROM roles 
            WHERE status = 1
            ORDER BY role_name
        `);

        res.json({ 
            success: true, 
            roles 
        });

    } catch (error) {
        console.error("Error fetching roles:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching roles",
            error: error.message
        });
    }
});

/**
 * @route GET /api/admin/departments
 * @desc Get all available departments
 * @access Private (Admin only)
 */
router.get('/departments', verifyToken, async (req, res) => {
    try {
        const [departments] = await require('../models/db').pool.query(`
            SELECT department_id, name 
            FROM departments 
            ORDER BY name
        `);

        res.json({ 
            success: true, 
            departments 
        });

    } catch (error) {
        console.error("Error fetching departments:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching departments",
            error: error.message
        });
    }
});

/**
 * @route GET /api/admin/employees-without-users
 * @desc Get employees that don't have user accounts yet
 * @access Private (Admin only)
 */
router.get('/employees-without-users', verifyToken, async (req, res) => {
    try {
        const [employees] = await require('../models/db').pool.query(`
            SELECT 
                e.employee_id,
                e.name,
                e.fname,
                e.lname,
                e.email,
                e.phone,
                r.role_name,
                d.name as department_name
            FROM employees e
            LEFT JOIN users u ON e.employee_id = u.employee_id
            LEFT JOIN roles r ON e.role_id = r.role_id
            LEFT JOIN departments d ON e.department_id = d.department_id
            WHERE u.user_id IS NULL
            ORDER BY e.name
        `);

        res.json({ 
            success: true, 
            employees,
            total: employees.length
        });

    } catch (error) {
        console.error("Error fetching employees without users:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching employees",
            error: error.message
        });
    }
});

/**
 * @route POST /api/admin/create-user-for-employee
 * @desc Create user account for existing employee
 * @access Private (Admin only)
 */
router.post('/create-user-for-employee', verifyToken, async (req, res) => {
    const { employee_id, user_name, password } = req.body;

    if (!employee_id || !user_name || !password) {
        return res.status(400).json({
            success: false,
            message: "Employee ID, username, and password are required."
        });
    }

    const db = require('../models/db');
    const bcrypt = require('bcrypt');
    let connection;

    try {
        connection = await db.pool.getConnection();
        await connection.beginTransaction();

        // Get employee details
        const [employee] = await connection.query(
            'SELECT * FROM employees WHERE employee_id = ?',
            [employee_id]
        );

        if (employee.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Employee not found."
            });
        }

        // Check if user already exists
        const [existingUser] = await connection.query(
            'SELECT user_id FROM users WHERE user_name = ? OR employee_id = ?',
            [user_name, employee_id]
        );

        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(409).json({
                success: false,
                message: "User already exists for this employee or username is taken."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const [userResult] = await connection.query(
            `INSERT INTO users 
                (employee_id, user_name, password, role_id, department_id, status)
             VALUES (?, ?, ?, ?, ?, '1')`,
            [
                employee_id, 
                user_name, 
                hashedPassword, 
                employee[0].role_id, 
                employee[0].department_id
            ]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            user_id: userResult.insertId,
            message: "User account created successfully for employee."
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Error creating user for employee:", error);
        res.status(500).json({
            success: false,
            message: "Error creating user account",
            error: error.message
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;

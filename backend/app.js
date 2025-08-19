const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Increase limit for JSON and urlencoded bodies (e.g., 10mb)
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

const db = require("../models/db");
const bcrypt = require('bcrypt');

const addEmployee = async (req, res) => {
    const { 
        name, role_id, department_id, supervisor_id, fname, lname, email, phone, sex,
        position, dateOfJoining, status, profileImage
    } = req.body;

    // NOTE: You must update your Employees table to include:
    // - position VARCHAR
    // - dateOfJoining DATE
    // - status ENUM('Active','Inactive')
    // - profileImage TEXT (for base64 or URL)
    // Example SQL:
    // ALTER TABLE Employees
    //   ADD COLUMN position VARCHAR(100),
    //   ADD COLUMN dateOfJoining DATE,
    //   ADD COLUMN status ENUM('Active','Inactive') DEFAULT 'Active',
    //   ADD COLUMN profileImage TEXT;

    let connection;

    try {
        connection = await db.pool.getConnection();
        await connection.beginTransaction();

        const [existingUser] = await connection.query('SELECT user_id FROM users WHERE user_name = ? FOR UPDATE', [email]);
        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(409).json({ success: false, message: "An employee with this email already exists." });
        }

        const [employeeResult] = await connection.query(
            `INSERT INTO Employees 
                (name, role_id, department_id, supervisor_id, fname, lname, email, phone, sex, position, dateOfJoining, status, profileImage)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                role_id,
                department_id || null,
                supervisor_id || null,
                fname,
                lname,
                email,
                phone,
                sex,
                position || null,
                dateOfJoining || null,
                status || 'Active',
                profileImage || null
            ]
        );

        const employee_id = employeeResult.insertId;
        const defaultUsername = email;
        const defaultPassword = 'itp@123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        await connection.query(
            'INSERT INTO users (employee_id, user_name, password, role_id, department_id) VALUES (?, ?, ?, ?, ?)',
            [employee_id, defaultUsername, hashedPassword, role_id, department_id || null]
        );

        await connection.commit();
        res.status(201).json({ success: true, employee_id, message: 'Employee and user created successfully.' });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Error registering employee and user:", {
            code: error.code,
            message: error.message,
        });

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: "An employee with this email or another unique field already exists." });
        }

        res.status(500).json({ success: false, message: "An internal error occurred while registering the employee." });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const jobSeekerSinUp = async (req, res) => {
    const { fname, lname, email, password, phone, sex } = req.body;

    if (!fname || !lname || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Please use a valid Gmail address." });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    let connection;

    try {
        connection = await db.pool.getConnection();
        await connection.beginTransaction();

        const [existingUser] = await connection.query('SELECT user_id FROM users WHERE user_name = ? FOR UPDATE', [email]);
        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(409).json({ success: false, message: "Email already registered." });
        }

        const [applicantResult] = await connection.query(
            'INSERT INTO applicants (fname, lname, email, phone, sex) VALUES (?, ?, ?, ?, ?)',
            [fname, lname, email, phone || null, sex || null]
        );
        const applicant_id = applicantResult.insertId;

        const hashedPassword = await bcrypt.hash(password, 10);
        const role_id = 6; // Role for Job Seeker

        await connection.query(
            'INSERT INTO users (user_name, password, role_id) VALUES (?, ?, ?)',
            [email, hashedPassword, role_id]
        );

        await connection.commit();
        res.status(201).json({ success: true, message: "Job seeker registered successfully.", applicant_id });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        
        console.error("Error registering job seeker:", {
            code: error.code,
            message: error.message,
        });

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: "This email address is already in use." });
        }

        res.status(500).json({ success: false, message: "An unexpected error occurred during registration." });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const getAllDepartments = async (req, res) => {
    try {
        const [results] = await db.pool.query('SELECT * FROM departments');
        res.json(results);
    } catch (err) {
        console.error('Error fetching departments:', { code: err.code, message: err.message });
        res.status(500).json({ success: false, message: 'Error fetching departments' });
    }
};

const getAllRoles = async (req, res) => {
    try {
        const [results] = await db.pool.query('SELECT * FROM roles');
        res.json(results);
    } catch (err) {
        console.error('Error fetching roles:', { code: err.code, message: err.message });
        res.status(500).json({ success: false, message: 'Error fetching roles' });
    }
};

const getAllSupervisors = async (req, res) => {
    try {
        const [results] = await db.pool.query('SELECT employee_id, fname, lname FROM employees');
        res.json(results);
    } catch (err) {
        console.error('Error fetching supervisors:', { code: err.code, message: err.message });
        res.status(500).json({ success: false, message: 'Error fetching supervisors' });
    }
};

const changePassword = async (req, res) => {
    const { user_id, oldPassword, newPassword } = req.body;
    if (!user_id || !oldPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }
    try {
        const [userRows] = await db.pool.query('SELECT password FROM users WHERE user_id = ?', [user_id]);
        if (!userRows || userRows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        const currentHashedPassword = userRows[0].password;
        const isMatch = await bcrypt.compare(oldPassword, currentHashedPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Old password is incorrect." });
        }
        const newHashedPassword = await bcrypt.hash(newPassword, 10);
        await db.pool.query('UPDATE users SET password = ? WHERE user_id = ?', [newHashedPassword, user_id]);
        res.json({ success: true, message: "Password changed successfully." });
    } catch (error) {
        console.error("Error changing password:", { code: error.code, message: error.message });
        res.status(500).json({ success: false, message: "Failed to change password." });
    }
};

module.exports = {
    getAllDepartments,
    getAllRoles,
    getAllSupervisors,
    addEmployee,
    changePassword,
    jobSeekerSinUp,
};
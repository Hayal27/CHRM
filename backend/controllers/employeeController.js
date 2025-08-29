const db = require("../models/db");
const bcrypt = require('bcrypt');

const addEmployee = async (req, res) => {
    const { 
        name, role_id, department_id, supervisor_id, fname, lname, email, phone, sex,
        position, dateOfJoining, status, avatar
    } = req.body;

    // --- Input Validation ---
    if (!name || !role_id || !fname || !lname || !email || !phone || !sex) {
        return res.status(400).json({
            success: false,
            code: "ERR_MISSING_FIELDS",
            message: "Missing required fields. Please provide all mandatory employee details."
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
    // Phone format validation (basic)
    if (!/^\d{10,15}$/.test(phone)) {
        return res.status(400).json({
            success: false,
            code: "ERR_INVALID_PHONE",
            message: "Invalid phone number format."
        });
    }

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
            `INSERT INTO employees 
                (name, role_id, department_id, supervisor_id, fname, lname, email, phone, sex, position, dateOfJoining, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
                status || 'Active'
            ]
        );

        const employee_id = employeeResult.insertId;
        const defaultUsername = email;
        const defaultPassword = 'Hrm@123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        await connection.query(
            'INSERT INTO users (employee_id, user_name, password, role_id, department_id, status, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                employee_id,
                defaultUsername,
                hashedPassword,
                role_id,
                department_id || null,
                status || 'Active',
                avatar || null
            ]
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
            return res.status(409).json({ 
                success: false, 
                code: error.code,
                message: "An employee with this email or another unique field already exists." 
            });
        }

        res.status(500).json({ 
            success: false, 
            code: error.code || "ERR_INTERNAL",
            message: "An internal error occurred while registering the employee.",
            error: error.message
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const jobSeekerSignUp = async (req, res) => {
    const { fname, lname, email, password, phone, sex } = req.body;

    // --- Input Validation ---
    if (!fname || !lname || !email || !password) {
        return res.status(400).json({ 
            success: false, 
            code: "ERR_MISSING_FIELDS",
            message: "All fields are required." 
        });
    }
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
        return res.status(400).json({ 
            success: false, 
            code: "ERR_INVALID_EMAIL",
            message: "Please use a valid Gmail address." 
        });
    }
    if (password.length < 6) {
        return res.status(400).json({ 
            success: false, 
            code: "ERR_WEAK_PASSWORD",
            message: "Password must be at least 6 characters." 
        });
    }

    let connection;

    try {
        connection = await db.pool.getConnection();
        await connection.beginTransaction();

        // Check if user already exists
        const [existingUser] = await connection.query('SELECT user_id FROM users WHERE user_name = ? FOR UPDATE', [email]);
        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(409).json({ success: false, message: "Email already registered." });
        }

        // Insert into applicants
        const [applicantResult] = await connection.query(
            'INSERT INTO applicants (fname, lname, email, phone, sex) VALUES (?, ?, ?, ?, ?)',
            [fname, lname, email, phone || null, sex || null]
        );
        const applicant_id = applicantResult.insertId;

        // Insert into employees
        const [employeeResult] = await connection.query(
            `INSERT INTO employees 
                (fname, lname, email, phone, sex, role_id, name, department_id, supervisor_id, position, dateOfJoining, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                fname,
                lname,
                email,
                phone || null,
                sex || null,
                6, // role_id for job seeker
                email, // name as email or you can use fname + lname
                null, // department_id
                null, // supervisor_id
                null, // position
                null,  // dateOfJoining
                'Active' // status
            ]
        );
        const employee_id = employeeResult.insertId;

        // Insert into users
        const hashedPassword = await bcrypt.hash(password, 10);
        const role_id = 6; // Role for Job Seeker

        await connection.query(
            'INSERT INTO users (employee_id, user_name, password, role_id, status) VALUES (?, ?, ?, ?, ?)',
            [employee_id, email, hashedPassword, role_id, '1']
        );

        await connection.commit();
        res.status(201).json({ success: true, message: "Job seeker registered successfully.", applicant_id, employee_id });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        
        console.error("Error registering job seeker:", {
            code: error.code,
            message: error.message,
        });

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                success: false, 
                code: error.code,
                message: "This email address is already in use." 
            });
        }

        res.status(500).json({ 
            success: false, 
            code: error.code || "ERR_INTERNAL",
            message: "An unexpected error occurred during registration.",
            error: error.message
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

const getAllDepartments = async (req, res) => {
    try {
        const [results] = await db.pool.query('SELECT department_id, name FROM departments ORDER BY name');
        res.json(results);
    } catch (err) {
        console.error('Error fetching departments:', { code: err.code, message: err.message });
        res.status(500).json({ success: false, message: 'Error fetching departments' });
    }
};

const getAllRoles = async (req, res) => {
    try {
        const [results] = await db.pool.query('SELECT role_id, role_name FROM roles ORDER BY role_name');
        res.json(results);
    } catch (err) {
        console.error('Error fetching roles:', { code: err.code, message: err.message });
        res.status(500).json({ success: false, message: 'Error fetching roles' });
    }
};

const getAllSupervisors = async (req, res) => {
    try {
        const [results] = await db.pool.query(`
            SELECT 
                employee_id, 
                CONCAT(COALESCE(fname, ''), ' ', COALESCE(lname, '')) as name,
                name as user_name
            FROM employees 
            WHERE status = 'Active'
            ORDER BY name
        `);
        res.json(results);
    } catch (err) {
        console.error('Error fetching supervisors:', { code: err.code, message: err.message });
        res.status(500).json({ success: false, message: 'Error fetching supervisors' });
    }
};

const changePassword = async (req, res) => {
    const { user_id, oldPassword, newPassword } = req.body;
    if (!user_id || !oldPassword || !newPassword) {
        return res.status(400).json({ 
            success: false, 
            code: "ERR_MISSING_FIELDS",
            message: "Missing required fields." 
        });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ 
            success: false, 
            code: "ERR_WEAK_PASSWORD",
            message: "New password must be at least 6 characters." 
        });
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
        res.status(500).json({ 
            success: false, 
            code: error.code || "ERR_INTERNAL",
            message: "Failed to change password.",
            error: error.message
        });
    }
};

const getAllEmployees = async (req, res) => {
    try {
        console.log('📋 Fetching all employees...');

        // Simple query to get basic employee data based on actual table structure
        const [results] = await db.pool.query(`
            SELECT 
                e.employee_id,
                e.name,
                e.fname,
                e.lname,
                e.email,
                e.phone,
                e.mobile,
                e.sex,
                e.position,
                e.dateOfJoining,
                e.status,
                e.department_id,
                e.role_id,
                e.employee_type,
                e.age,
                e.qualification_level,
                e.qualification_subject,
                e.competence_level,
                e.competence_occupation,
                e.occupation_on_training,
                e.employed_work_process,
                e.citizen_address,
                d.name AS department_name,
                r.role_name,
                e.profileImage
            FROM employees e
            LEFT JOIN departments d ON e.department_id = d.department_id
            LEFT JOIN roles r ON e.role_id = r.role_id
            WHERE e.employee_id IS NOT NULL
            ORDER BY e.name ASC
            LIMIT 100
        `);
        
        console.log(`✅ Successfully fetched ${results.length} employees`);
        
        // Transform the data to match frontend expectations
        const transformedResults = results.map(emp => ({
            employee_id: emp.employee_id,
            id: emp.employee_id, // For backward compatibility
            full_name: emp.name || `${emp.fname || ''} ${emp.lname || ''}`.trim(),
            name: emp.name,
            fname: emp.fname,
            lname: emp.lname,
            email: emp.email,
            mobile: emp.mobile || emp.phone,
            phone: emp.phone,
            sex: emp.sex,
            position: emp.position,
            dateOfJoining: emp.dateOfJoining,
            date_of_joining: emp.dateOfJoining, // For backward compatibility
            status: emp.status || 'Active',
            department_id: emp.department_id,
            department_name: emp.department_name,
            role_id: emp.role_id,
            role_name: emp.role_name,
            employee_type: emp.employee_type,
            age: emp.age,
            qualification_level: emp.qualification_level,
            qualification_subject: emp.qualification_subject,
            competence_level: emp.competence_level,
            competence_occupation: emp.competence_occupation,
            occupation_on_training: emp.occupation_on_training,
            employed_work_process: emp.employed_work_process,
            citizen_address: emp.citizen_address,
            profileImage: emp.profileImage,
            profile_image: emp.profileImage // For backward compatibility
        }));

        res.json({ 
            success: true, 
            employees: transformedResults,
            total: transformedResults.length,
            message: 'Employees fetched successfully'
        });

    } catch (err) {
        console.error('❌ Error fetching employees:', { 
            code: err.code, 
            message: err.message, 
            stack: err.stack 
        });
        
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching employees',
            error: err.message,
            code: err.code
        });
    }
};

// Simple test endpoint to check database connectivity
const testDatabase = async (req, res) => {
    try {
        const [result] = await db.pool.query('SELECT 1 as test');
        const [tableCount] = await db.pool.query(`
            SELECT COUNT(*) as table_count 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE()
        `);
        
        res.json({
            success: true,
            message: 'Database connection successful',
            test_query: result[0],
            total_tables: tableCount[0].table_count
        });
    } catch (error) {
        console.error('Database test failed:', error);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
};

module.exports = {
    getAllDepartments,
    getAllRoles,
    getAllSupervisors,
    addEmployee,
    changePassword,
    jobSeekerSignUp,
    getAllEmployees,
    testDatabase
};
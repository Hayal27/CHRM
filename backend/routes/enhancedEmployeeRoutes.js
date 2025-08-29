const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/employee-documents';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'employee-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF, JPEG, JPG, and PNG files are allowed'));
        }
    }
});

const {
    addEnhancedEmployee,
    getAllEnhancedEmployees,
    getEnhancedEmployeeById,
    verifyToken, updateEnhancedEmployee,
    getEmployeeStatistics
} = require('../controllers/enhancedEmployeeController');

const {
    uploadEmployeeProfileImage,
    getEmployeeProfileImage,
    deleteEmployeeProfileImage
} = require("../controllers/profileImageController");

// =====================================================
// ENHANCED EMPLOYEE MODULE ROUTES
// =====================================================

/**
 * @route POST /api/employees/enhanced/add
 * @desc Add employee with dynamic trainer/admin attributes and optional document upload
 * @access Private
 */
// Conditional multer middleware - only apply if content-type is multipart/form-data
const conditionalUpload = (req, res, next) => {
    const contentType = req.headers['content-type'];
    if (contentType && contentType.includes('multipart/form-data')) {
        upload.single('document')(req, res, next);
    } else {
        next();
    }
};

router.post('/enhanced/add', verifyToken, conditionalUpload, addEnhancedEmployee);

/**
 * @route GET /api/employees/enhanced
 * @desc Get all employees with enhanced attributes and filtering
 * @access Private
 */
router.get('/enhanced', verifyToken, getAllEnhancedEmployees);

/**
 * @route GET /api/employees/enhanced/:employee_id
 * @desc Get employee by ID with enhanced attributes
 * @access Private
 */
router.get('/enhanced/:employee_id', verifyToken, getEnhancedEmployeeById);

/**
 * @route PUT /api/employees/enhanced/:employee_id
 * @desc Update employee with enhanced attributes
 * @access Private
 */
router.put('/enhanced/:employee_id', verifyToken, updateEnhancedEmployee);

/**
 * @route GET /api/employees/enhanced/statistics/overview
 * @desc Get employee statistics by type
 * @access Private
 */
router.get('/enhanced/statistics/overview', verifyToken, getEmployeeStatistics);

// =====================================================
// PROFILE IMAGE ROUTES
// =====================================================

/**
 * @route POST /api/employees/enhanced/:employee_id/profile-image
 * @desc Upload profile image for employee
 * @access Private
 */
router.post("/enhanced/:employee_id/profile-image", uploadEmployeeProfileImage);

/**
 * @route GET /api/employees/enhanced/:employee_id/profile-image
 * @desc Get profile image for employee
 * @access Private
 */
router.get("/enhanced/:employee_id/profile-image", getEmployeeProfileImage);

/**
 * @route DELETE /api/employees/enhanced/:employee_id/profile-image
 * @desc Delete profile image for employee
 * @access Private
 */
router.delete("/enhanced/:employee_id/profile-image", deleteEmployeeProfileImage);

// =====================================================
// TRAINER-SPECIFIC ROUTES
// =====================================================

/**
 * @route GET /api/employees/trainers
 * @desc Get all trainer employees with specific attributes
 * @access Private
 */
router.get('/trainers', verifyToken, async (req, res) => {
    try {
        const [trainers] = await require('../models/db').pool.query(`
            SELECT 
                e.employee_id,
                e.name as "Trainer Full Name",
                e.sex as "Sex",
                YEAR(CURDATE()) - YEAR(STR_TO_DATE(CONCAT(e.dateOfJoining, '-01-01'), '%Y-%m-%d')) as "Age",
                YEAR(e.dateOfJoining) as "Year of Employment",
                e.email as "Email",
                e.phone as "Mobile",
                e.position as "Occupation on Training",
                r.role_name,
                d.name as department_name,
                e.status
            FROM employees e
            LEFT JOIN roles r ON e.role_id = r.role_id
            LEFT JOIN departments d ON e.department_id = d.department_id
            WHERE (r.role_name LIKE '%trainer%' OR r.role_name LIKE '%instructor%' OR e.position LIKE '%train%')
            AND e.status = 'Active'
            ORDER BY e.name
        `);

        res.json({
            success: true,
            trainers,
            total: trainers.length,
            type: 'trainer'
        });

    } catch (error) {
        console.error("Error fetching trainers:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching trainers",
            error: error.message
        });
    }
});

/**
 * @route POST /api/employees/trainers/add
 * @desc Add new trainer with specific attributes
 * @access Private
 */
router.post('/trainers/add', verifyToken, async (req, res) => {
    const trainerData = {
        ...req.body,
        employee_type: 'trainer'
    };

    // Call the enhanced employee controller
    req.body = trainerData;
    return addEnhancedEmployee(req, res);
});

// =====================================================
// ADMIN-SPECIFIC ROUTES
// =====================================================

/**
 * @route GET /api/employees/admins
 * @desc Get all admin employees with specific attributes
 * @access Private
 */
router.get('/admins', verifyToken, async (req, res) => {
    try {
        const [admins] = await require('../models/db').pool.query(`
            SELECT 
                e.employee_id,
                e.name as "Employee Full Name",
                e.sex as "Sex",
                YEAR(CURDATE()) - YEAR(STR_TO_DATE(CONCAT(e.dateOfJoining, '-01-01'), '%Y-%m-%d')) as "Age",
                YEAR(e.dateOfJoining) as "Year of Employment",
                e.position as "Employed Work Process",
                e.email as "Email",
                e.phone as "Mobile",
                r.role_name,
                d.name as department_name,
                e.status
            FROM employees e
            LEFT JOIN roles r ON e.role_id = r.role_id
            LEFT JOIN departments d ON e.department_id = d.department_id
            WHERE (r.role_name LIKE '%admin%' OR r.role_name LIKE '%manager%' OR r.role_name LIKE '%supervisor%')
            AND e.status = 'Active'
            ORDER BY e.name
        `);

        res.json({
            success: true,
            admins,
            total: admins.length,
            type: 'admin'
        });

    } catch (error) {
        console.error("Error fetching admins:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching admins",
            error: error.message
        });
    }
});

/**
 * @route POST /api/employees/admins/add
 * @desc Add new admin with specific attributes
 * @access Private
 */
router.post('/admins/add', verifyToken, async (req, res) => {
    const adminData = {
        ...req.body,
        employee_type: 'admin'
    };

    // Call the enhanced employee controller
    req.body = adminData;
    return addEnhancedEmployee(req, res);
});

// =====================================================
// UTILITY ROUTES
// =====================================================

/**
 * @route GET /api/employees/employee-types
 * @desc Get available employee types
 * @access Private
 */
router.get('/employee-types', verifyToken, (req, res) => {
    const employeeTypes = [
        {
            value: 'trainer',
            label: 'Trainer',
            description: 'Training staff with specialized teaching responsibilities',
            required_fields: [
                'full_name', 'sex', 'age', 'year_of_birth', 'year_of_employment',
                'qualification_level', 'qualification_subject', 'year_of_upgrading',
                'competence_level', 'competence_occupation', 'occupation_on_training',
                'mobile', 'citizen_address', 'email'
            ]
        },
        {
            value: 'admin',
            label: 'Administrative Staff',
            description: 'Administrative and management staff',
            required_fields: [
                'full_name', 'sex', 'age', 'year_of_birth', 'year_of_employment',
                'qualification_level', 'qualification_subject', 'competence_level',
                'competence_occupation', 'employed_work_process', 'citizen_address',
                'mobile', 'email'
            ]
        }
    ];

    res.json({
        success: true,
        employee_types: employeeTypes
    });
});

/**
 * @route GET /api/employees/form-fields/:employee_type
 * @desc Get form fields for specific employee type
 * @access Private
 */
router.get('/form-fields/:employee_type', verifyToken, (req, res) => {
    const { employee_type } = req.params;

    const commonFields = [
        { name: 'full_name', label: 'Full Name', type: 'text', required: true },
        { name: 'fname', label: 'First Name', type: 'text', required: false },
        { name: 'lname', label: 'Last Name', type: 'text', required: false },
        { name: 'sex', label: 'Sex', type: 'select', options: ['male', 'female', 'other'], required: true },
        { name: 'age', label: 'Age', type: 'number', required: false },
        { name: 'year_of_birth', label: 'Year of Birth', type: 'year', required: false },
        { name: 'year_of_employment', label: 'Year of Employment', type: 'year', required: false },
        { name: 'qualification_level', label: 'Qualification Level', type: 'text', required: false },
        { name: 'qualification_subject', label: 'Qualification Subject', type: 'text', required: false },
        { name: 'year_of_upgrading', label: 'Year of Upgrading', type: 'year', required: false },
        { name: 'competence_level', label: 'Competence Level', type: 'text', required: false },
        { name: 'competence_occupation', label: 'Competence Occupation', type: 'text', required: false },
        { name: 'citizen_address', label: 'Citizen Address', type: 'textarea', required: false },
        { name: 'mobile', label: 'Mobile', type: 'tel', required: false },
        { name: 'email', label: 'Email', type: 'email', required: true }
    ];

    let specificFields = [];

    if (employee_type === 'trainer') {
        specificFields = [
            { name: 'occupation_on_training', label: 'Occupation on Training', type: 'text', required: true }
        ];
    } else if (employee_type === 'admin') {
        specificFields = [
            { name: 'employed_work_process', label: 'Employed Work Process', type: 'text', required: true }
        ];
    }

    const systemFields = [
        { name: 'role_id', label: 'Role', type: 'select', required: false },
        { name: 'department_id', label: 'Department', type: 'select', required: false },
        { name: 'college_id', label: 'College', type: 'select', required: false },
        { name: 'supervisor_id', label: 'Supervisor', type: 'select', required: false },
        { name: 'position', label: 'Position', type: 'text', required: false },
        { name: 'dateOfJoining', label: 'Date of Joining', type: 'date', required: false }
    ];

    const userFields = [
        { name: 'create_user', label: 'Create User Account', type: 'checkbox', required: false, default: true },
        { name: 'user_name', label: 'Username', type: 'text', required: false },
        { name: 'password', label: 'Password', type: 'password', required: false, default: 'Hrm@123' }
    ];

    res.json({
        success: true,
        employee_type,
        form_fields: {
            common: commonFields,
            specific: specificFields,
            system: systemFields,
            user: userFields
        }
    });
});

module.exports = router;

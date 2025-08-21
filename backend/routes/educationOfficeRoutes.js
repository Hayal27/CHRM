const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { checkSessionExpiration } = require('../middleware/sessionMiddleware');

const {
    createAdminUser,
    createCollege,
    getAllColleges,
    updateCollege,
    deleteCollege,
    generateEmployeeReport,
    getEmployeesByCollege,
    getCollegeStatistics
} = require('../controllers/educationOfficeController');

// =====================================================
// ADMIN MODULE ROUTES
// =====================================================

/**
 * @route POST /api/education-office/admin/create-user
 * @desc Create a new admin user (Administrator or Education Office Head)
 * @access Private (Admin only)
 */
router.post('/admin/create-user', verifyToken, createAdminUser);

/**
 * @route POST /api/education-office/admin/create-college
 * @desc Create a new technical college
 * @access Private (Admin only)
 */
router.post('/admin/create-college', verifyToken, createCollege);

/**
 * @route GET /api/education-office/admin/colleges
 * @desc Get all colleges with statistics
 * @access Private (Admin only)
 */
router.get('/admin/colleges', verifyToken, getAllColleges);

/**
 * @route PUT /api/education-office/admin/colleges/:college_id
 * @desc Update college information
 * @access Private (Admin only)
 */
router.put('/admin/colleges/:college_id', verifyToken, updateCollege);

/**
 * @route DELETE /api/education-office/admin/colleges/:college_id
 * @desc Delete a college
 * @access Private (Admin only)
 */
router.delete('/admin/colleges/:college_id', verifyToken, deleteCollege);

// =====================================================
// EDUCATION OFFICE MODULE ROUTES
// =====================================================

/**
 * @route GET /api/education-office/employees/:college_id
 * @desc Get all employees for a specific college
 * @access Private
 */
router.get('/employees/:college_id', verifyToken, getEmployeesByCollege);

/**
 * @route POST /api/education-office/reports/generate
 * @desc Generate comprehensive employee information report
 * @access Private
 */
router.post('/reports/generate', verifyToken, generateEmployeeReport);

/**
 * @route GET /api/education-office/statistics/:college_id
 * @desc Get college statistics and summary
 * @access Private
 */
router.get('/statistics/:college_id', verifyToken, getCollegeStatistics);

// =====================================================
// UTILITY ROUTES
// =====================================================

/**
 * @route GET /api/education-office/roles/admin
 * @desc Get available admin roles
 * @access Private
 */
router.get('/roles/admin', verifyToken, async (req, res) => {
    try {
        const [roles] = await require('../models/db').pool.query(`
            SELECT role_id, role_name, description 
            FROM roles 
            WHERE role_id IN (1, 2, 3) 
            ORDER BY role_id
        `);

        res.json({ 
            success: true, 
            roles 
        });

    } catch (error) {
        console.error("Error fetching admin roles:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching admin roles",
            error: error.message
        });
    }
});

/**
 * @route GET /api/education-office/college-types
 * @desc Get available college types
 * @access Private
 */
router.get('/college-types', verifyToken, (req, res) => {
    const collegeTypes = [
        { value: 'technical', label: 'Technical College' },
        { value: 'vocational', label: 'Vocational Training Institute' },
        { value: 'university', label: 'University' },
        { value: 'institute', label: 'Institute' }
    ];

    res.json({ 
        success: true, 
        collegeTypes 
    });
});

module.exports = router;

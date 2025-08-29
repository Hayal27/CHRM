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
    getCollegeStatistics,
    // Technology Transfer functions
    getAllTechnologyTransfers,
    createTechnologyTransfer,
    updateTechnologyTransfer,
    deleteTechnologyTransfer,
    getTechnologyTransferReport,
    // Enterprise Data functions
    getAllEnterprises,
    createEnterprise,
    updateEnterprise,
    deleteEnterprise,
    getEnterpriseReport
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
// TECHNOLOGY TRANSFER MODULE ROUTES
// =====================================================

/**
 * @route GET /api/education-office/technology-transfers
 * @desc Get all technology transfers
 * @access Private
 */
router.get('/technology-transfers', verifyToken, getAllTechnologyTransfers);

/**
 * @route POST /api/education-office/technology-transfers
 * @desc Create a new technology transfer
 * @access Private
 */
router.post('/technology-transfers', verifyToken, createTechnologyTransfer);

/**
 * @route PUT /api/education-office/technology-transfers/:id
 * @desc Update technology transfer
 * @access Private
 */
router.put('/technology-transfers/:id', verifyToken, updateTechnologyTransfer);

/**
 * @route DELETE /api/education-office/technology-transfers/:id
 * @desc Delete technology transfer
 * @access Private
 */
router.delete('/technology-transfers/:id', verifyToken, deleteTechnologyTransfer);

/**
 * @route GET /api/education-office/technology-transfers/report
 * @desc Get technology transfer report
 * @access Private
 */
router.get('/technology-transfers/report', verifyToken, getTechnologyTransferReport);

// =====================================================
// ENTERPRISE DATA MODULE ROUTES
// =====================================================

/**
 * @route GET /api/education-office/enterprises
 * @desc Get all enterprises
 * @access Private
 */
router.get('/enterprises', verifyToken, getAllEnterprises);

/**
 * @route POST /api/education-office/enterprises
 * @desc Create a new enterprise
 * @access Private
 */
router.post('/enterprises', verifyToken, createEnterprise);

/**
 * @route PUT /api/education-office/enterprises/:id
 * @desc Update enterprise
 * @access Private
 */
router.put('/enterprises/:id', verifyToken, updateEnterprise);

/**
 * @route DELETE /api/education-office/enterprises/:id
 * @desc Delete enterprise
 * @access Private
 */
router.delete('/enterprises/:id', verifyToken, deleteEnterprise);

/**
 * @route GET /api/education-office/enterprises/report
 * @desc Get enterprise data report
 * @access Private
 */
router.get('/enterprises/report', verifyToken, getEnterpriseReport);

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
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');  
const { checkSessionExpiration } = require('../middleware/sessionMiddleware');
const {  getAllRoles, getAllUsers, updateUser, deleteUser, getDepartment,changeUserStatus } = require('../controllers/userController.js');
const {
     requestPasswordReset,
    resetPassword,
    getLoginAnalytics,
    getBlockedUsersAnalytics
} = require('../models/LoginModel');
// Define routes


router.post('/requestPasswordReset', requestPasswordReset);
router.post('/reset-resetPassword', resetPassword);
router.get('/login-analytics', verifyToken, getLoginAnalytics);
router.get('/blocked-users', verifyToken, getBlockedUsersAnalytics);

// router.get('/roles', getAllRoles);
router.get('/users',  getAllUsers);
router.get('/department', getDepartment);

router.put('/:user_id/status', changeUserStatus);



router.put('/updateUser/:user_id', updateUser);
router.delete('/deleteUser/:user_id', deleteUser);

module.exports = router;



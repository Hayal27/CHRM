// employeeRoutes.js
const express = require('express');
const router = express.Router();
// const verifyToken = require ('../middleware/verifyToken')
// const { checkSessionExpiration } = require('../middleware/sessionMiddleware');
const { getAllEmployees,changePassword,addEmployee, getAllDepartments, getAllRoles, getAllSupervisors, jobSeekerSignUp, testDatabase } = require('../controllers/employeeController');

// Define routes
router.put('/changePassword', changePassword);

router.post('/addEmployee', addEmployee);
router.get('/departments',  getAllDepartments); // Route to fetch all departments
router.get('/roles',  getAllRoles); // Route to fetch all roles
router.get('/supervisors',  getAllSupervisors); // Route to fetch all supervisors
router.post('/signup', jobSeekerSignUp); // Route for job seeker registration
router.get('/getEmployees', getAllEmployees); // Route to fetch all employees
router.get('/test-db', testDatabase); // Route to test database connection

module.exports = router;
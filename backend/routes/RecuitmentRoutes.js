const express = require("express");
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');  

const multer = require('multer');
const path = require('path');

// Import recruitment controller functions
const {
    // Job Vacancy Management
    createJobVacancy,
    getJobVacancies,
    updateJobVacancy,
    
    // Application Management
    submitJobApplication,
    uploadApplicationCV,
    getJobApplications,
    
    // Interview Management
    scheduleInterview,
    getInterviews,
    
    // Interview Evaluation
    submitInterviewEvaluation,
    getInterviewEvaluations,
    
    // Offer Management
    generateOfferLetter,
    getOfferLetters,
    
    // Hiring Decision
    makeHiringDecision,
    getHiringDecisions,
    
    // Recruitment Analytics
    getRecruitmentAnalytics
} = require('../controllers/RecuitmentController');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/cv/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'cv-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Allow only PDF, DOC, DOCX files
        const allowedTypes = /pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, and DOCX files are allowed!'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// ==================== JOB VACANCY ROUTES ====================

// Create a new job vacancy
router.post('/vacancies', verifyToken, createJobVacancy);

// Get all job vacancies with optional filters
router.get('/vacancies', verifyToken, getJobVacancies);
router.get('/public-vacancies', getJobVacancies);
// Update a job vacancy
router.put('/vacancies/:id', verifyToken, updateJobVacancy);

// ==================== APPLICATION ROUTES ====================

// Submit a job application
router.post('/applications', verifyToken, submitJobApplication);

// Upload CV for an application
router.post('/applications/:application_id/cv', verifyToken, upload.single('cv'), uploadApplicationCV);

// Get job applications with optional filters
router.get('/applications', verifyToken, getJobApplications);

// ==================== INTERVIEW ROUTES ====================

// Schedule an interview
router.post('/interviews', verifyToken, scheduleInterview);

// Get interviews with optional filters
router.get('/interviews', verifyToken, getInterviews);

// ==================== INTERVIEW EVALUATION ROUTES ====================

// Submit interview evaluation
router.post('/interviews/:interview_id/evaluation', verifyToken, submitInterviewEvaluation);

// Get interview evaluations
router.get('/evaluations', verifyToken, getInterviewEvaluations);

// ==================== OFFER LETTER ROUTES ====================

// Generate offer letter
router.post('/applications/:application_id/offer', verifyToken, generateOfferLetter);

// Get offer letters
router.get('/offers', verifyToken, getOfferLetters);

// ==================== HIRING DECISION ROUTES ====================

// Make hiring decision
router.post('/applications/:application_id/decision', verifyToken, makeHiringDecision);

// Get hiring decisions
router.get('/decisions', verifyToken, getHiringDecisions);

// ==================== ANALYTICS ROUTES ====================

// Get recruitment analytics
router.get('/analytics', verifyToken, getRecruitmentAnalytics);

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
    }
    if (error.message) {
        return res.status(400).json({ error: error.message });
    }
    next(error);
});

module.exports = router; 
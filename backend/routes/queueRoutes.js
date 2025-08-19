const express = require("express");
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');  
const { initiatePayment,
  initiateMassPayment,addQueue ,
    } = require("../controllers/queueController.js");
const { submitComplaint,getComplaintById,
  updateComplaint,
  deleteComplaint,getComplaints} = require("../controllers/profileUploadController.js");

// payment routes
router.post('/initiate-payment', initiatePayment);
router.post('/initiate-mass-payment', initiateMassPayment);
router.post('/submit-complaint', submitComplaint);
router.get('/complaints', getComplaints); // Add auth later

// GET /api/complaints/:complaintId - Get a specific complaint (admin only)
// router.get('/complaints/:complaintId', isAdminAuth, getComplaintById);
router.get('/complaints/:complaintId', getComplaintById); // Add auth later

// PUT /api/complaints/:complaintId - Update a complaint (admin only)
// router.put('/complaints/:complaintId', isAdminAuth, updateComplaint);
router.put('/complaints/:complaintId', updateComplaint); // Add auth later

// DELETE /api/complaints/:complaintId - Delete a complaint (admin only)
// router.delete('/complaints/:complaintId', isAdminAuth, deleteComplaint);
router.delete('/complaints/:complaintId', deleteComplaint); // Add auth later



module.exports = router;

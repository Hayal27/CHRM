// planRoutes.js
const express = require("express");
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');  

const {getdepartment,getUserRoles} = require("../controllers/headerController.js");
const { getProfilePicture,uploadProfilePicture} =require("../controllers/profileUploadController")

// user information
router.get("/getdepartment",verifyToken, getdepartment);
router.get ('/userrole', verifyToken, getUserRoles);

// profile pic 
router.post('/uploadProfilePicture', verifyToken,uploadProfilePicture);
router.get("/getprofile/:user_id",verifyToken, getProfilePicture); // API endpoint





module.exports = router;

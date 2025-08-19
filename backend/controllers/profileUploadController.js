const db = require("../models/db"); // Assumes you have a db.js file that exports the database connection
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// --- Existing Profile Picture Logic ---

// Configure Multer for profile picture storage
const profilePicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/avatars"); // Specific subfolder for avatars
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `avatar-${req.body.user_id || 'unknown'}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const profilePicUpload = multer({ 
  storage: profilePicStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Example: 2MB limit for avatars
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type for avatar. Only JPEG, PNG, GIF allowed.'), false);
    }
  }
}).single("avatar");

const uploadProfilePicture = (req, res) => {
  profilePicUpload(req, res, async (err) => {
    if (err) {
      console.error("Multer error (profile pic):", err.message);
      if (err.message.includes('Invalid file type') || err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: "File upload failed." });
    }

    const { user_id } = req.body;
    if (!user_id) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "User ID is required." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const sql = `UPDATE users SET avatar_url = ? WHERE user_id = ?`;
    try {
      await db.query(sql, [avatarUrl, user_id]);
      console.log(`Profile picture uploaded for user: ${user_id} - URL: ${avatarUrl}`);
      res.json({ success: true, avatarUrl });
    } catch (dbErr) {
      console.error("Database error (profile pic):", dbErr);
      if (req.file) fs.unlinkSync(req.file.path); // Ensure file is unlinked on DB error
      return res.status(500).json({ error: "Database update failed." });
    }
  });
};

const getProfilePicture = async (req, res) => {
  const { user_id } = req.params;
  if (!user_id) {
    return res.status(400).json({ error: "User ID is required." });
  }
  console.log(`Fetching profile picture for user: ${user_id}`);
  const sql = "SELECT avatar_url FROM users WHERE user_id = ?";
  try {
    const [result] = await db.query(sql, [user_id]);
    if (result.length === 0) {
      console.error("User not found for ID (get profile pic):", user_id);
      return res.status(404).json({ error: "User not found." });
    }
    const avatarUrl = result[0].avatar_url;
    if (!avatarUrl) {
      console.error("No profile picture found for user (get profile pic):", user_id);
      return res.status(404).json({ error: "No profile picture found." });
    }
    const fullAvatarUrl = `${req.protocol}://${req.get("host")}${avatarUrl}`;
    console.log(`Profile picture fetched for user: ${user_id} - URL: ${fullAvatarUrl}`);
    res.json({
      success: true,
      avatarUrl: fullAvatarUrl
    });
  } catch (err) {
    console.error("Database error (get profile pic):", err);
    return res.status(500).json({ error: "Database query failed." });
  }
};


// --- Complaint Submission & Management Logic ---

/*
  Database schema for complaints (MySQL example):

  CREATE TABLE complaints (
      complaint_id INT AUTO_INCREMENT PRIMARY KEY,
      plate_no VARCHAR(50) NULL,
      complaint_text TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'pending', -- e.g., pending, investigating, resolved, closed
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );

  CREATE TABLE complaint_attachments (
      attachment_id INT AUTO_INCREMENT PRIMARY KEY,
      complaint_id INT NOT NULL,
      file_path VARCHAR(255) NOT NULL,       -- Relative path like /uploads/complaints/filename.ext
      original_name VARCHAR(255),
      mime_type VARCHAR(100),
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE
  );
*/

const complaintStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/complaints");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const safeOriginalName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeOriginalName}`);
  },
});

const ALLOWED_COMPLAINT_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'application/pdf', 'text/plain'];
const MAX_COMPLAINT_FILE_SIZE_MB = 5; 
const MAX_COMPLAINT_FILES = 5; 

const complaintFileFilter = (req, file, cb) => {
  if (ALLOWED_COMPLAINT_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types: ${ALLOWED_COMPLAINT_FILE_TYPES.join(', ')}`), false);
  }
};

const complaintUpload = multer({
  storage: complaintStorage,
  fileFilter: complaintFileFilter,
  limits: {
    fileSize: MAX_COMPLAINT_FILE_SIZE_MB * 1024 * 1024, 
    files: MAX_COMPLAINT_FILES 
  },
}).array("files", MAX_COMPLAINT_FILES); 

// CREATE Complaint (already implemented)
const submitComplaint = (req, res) => {
  complaintUpload(req, res, async (err) => {
    if (err) {
      console.error("Multer error (complaint):", err.message);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `File upload error: ${err.message}` });
      } else if (err.message.startsWith('Invalid file type')) {
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: "File upload processing failed." });
    }

    const {
      plateNo,
      complaintText,
      complainantName,
      complainantEmail,
      complainantPhone,
      incidentDate,
      incidentTime,
      incidentLocation,
      complaintCategory,
      priority,
      isAnonymous
    } = req.body;

    // Validation (remains the same)
    if (!complaintText || complaintText.trim() === "") {
      if (req.files && req.files.length > 0) req.files.forEach(file => fs.unlinkSync(file.path));
      return res.status(400).json({ error: "Complaint description is required." });
    }
    if (!isAnonymous || isAnonymous === 'false') {
      if (!complainantName || !complainantEmail) {
        if (req.files && req.files.length > 0) req.files.forEach(file => fs.unlinkSync(file.path));
        return res.status(400).json({ error: "Complainant name and email are required for non-anonymous complaints." });
      }
    }
    if (complainantEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(complainantEmail)) {
      if (req.files && req.files.length > 0) req.files.forEach(file => fs.unlinkSync(file.path));
      return res.status(400).json({ error: "Invalid email format." });
    }

    let connection;
    try {
      connection = await db.pool.getConnection();
      await connection.beginTransaction();

      const complaintRef = `COMP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      const complaintSql = `INSERT INTO complaints
        (complaint_ref, plate_no, complaint_text, complainant_name, complainant_email,
         complainant_phone, incident_date, incident_time, incident_location,
         complaint_category, priority, is_anonymous, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`;
      const complaintValues = [
        complaintRef, plateNo || null, complaintText.trim(),
        isAnonymous === 'true' ? null : complainantName, isAnonymous === 'true' ? null : complainantEmail,
        isAnonymous === 'true' ? null : complainantPhone, incidentDate || null, incidentTime || null,
        incidentLocation || null, complaintCategory || 'general', priority || 'medium',
        isAnonymous === 'true' ? 1 : 0
      ];

      const [complaintResult] = await connection.query(complaintSql, complaintValues);
      const complaintId = complaintResult.insertId;

      const activitySql = "INSERT INTO complaint_activities (complaint_id, activity_type, description, created_at) VALUES (?, 'created', 'Complaint submitted', NOW())";
      await connection.query(activitySql, [complaintId]);

      if (req.files && req.files.length > 0) {
        const attachmentPromises = req.files.map(file => {
          const relativeFilePath = `/uploads/complaints/${file.filename}`;
          const attachmentSql = `INSERT INTO complaint_attachments
            (complaint_id, file_path, original_name, mime_type, file_size, uploaded_at)
            VALUES (?, ?, ?, ?, ?, NOW())`;
          return connection.query(attachmentSql, [complaintId, relativeFilePath, file.originalname, file.mimetype, file.size]);
        });
        await Promise.all(attachmentPromises);
      }

      await connection.commit();
      console.log(`Complaint submitted: ID ${complaintId} (${complaintRef}) with ${req.files ? req.files.length : 0} attachments.`);
      res.status(201).json({
        message: "Complaint submitted successfully.",
        complaintId: complaintId,
        complaintRef: complaintRef,
        status: "pending"
      });

    } catch (dbError) {
      console.error("Database error (submit complaint):", dbError);
      if (connection) await connection.rollback();
      if (req.files && req.files.length > 0) req.files.forEach(file => fs.unlinkSync(file.path)); // Clean up uploaded files on error
      res.status(500).json({ error: "Failed to submit complaint." });
    } finally {
      if (connection) connection.release();
    }
  });
};
// READ All Complaints
// IMPORTANT: This endpoint should be protected by admin authentication/authorization
const getComplaints = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  let connection;
  try {
    connection = await db.pool.getConnection();
    let query = "SELECT * FROM complaints";
    const queryParams = [];
    
    if (status) {
      query += " WHERE status = ?";
      queryParams.push(status);
    }
    query += " ORDER BY created_at DESC";
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    query += " LIMIT ? OFFSET ?";
    queryParams.push(parseInt(limit, 10), offset);

    const [results] = await connection.query(query, queryParams);
    
    let countQuery = "SELECT COUNT(*) as total FROM complaints";
    const countParams = [];
    if (status) {
        countQuery += " WHERE status = ?";
        countParams.push(status);
    }
    const [countResult] = await connection.query(countQuery, countParams);
    const total = countResult[0].total;
    
    res.json({
        complaints: results,
        pagination: {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalItems: total,
            totalPages: Math.ceil(total / parseInt(limit, 10))
        }
    });
  } catch (err) {
    console.error("Database error (getting complaints):", err);
    res.status(500).json({ error: "Failed to retrieve complaints." });
  } finally {
    if (connection) connection.release();
  }
};

// READ Complaint by ID
// IMPORTANT: This endpoint should be protected by admin authentication/authorization
const getComplaintById = async (req, res) => {
  const { complaintId } = req.params;
  let connection;
  try {
    connection = await db.pool.getConnection();
    const complaintSql = "SELECT * FROM complaints WHERE complaint_id = ?";
    const [complaintResult] = await connection.query(complaintSql, [complaintId]);

    if (complaintResult.length === 0) {
      return res.status(404).json({ error: "Complaint not found." });
    }

    const complaint = complaintResult[0];
    const attachmentsSql = "SELECT attachment_id, file_path, original_name, mime_type, uploaded_at FROM complaint_attachments WHERE complaint_id = ?";
    const [attachmentsResult] = await connection.query(attachmentsSql, [complaintId]);
    
    complaint.attachments = attachmentsResult.map(att => ({
        ...att,
        url: `${req.protocol}://${req.get("host")}${att.file_path}`
    }));
    res.json(complaint);

  } catch (err) {
    console.error("Database error (getting complaint by ID):", err);
    res.status(500).json({ error: "Failed to retrieve complaint." });
  } finally {
    if (connection) connection.release();
  }
};

// UPDATE Complaint (e.g., status)
// IMPORTANT: This endpoint should be protected by admin authentication/authorization
const updateComplaint = async (req, res) => {
  const { complaintId } = req.params;
  const { status, plate_no, complaint_text } = req.body;

  if (!status && !plate_no && !complaint_text) {
    return res.status(400).json({ error: "No update data provided. Please provide status, plate_no, or complaint_text." });
  }
  
  const validStatuses = ['pending', 'investigating', 'resolved', 'closed', 'spam'];
  if (status && !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  let updateFields = [];
  let queryParams = [];

  if (status) {
    updateFields.push("status = ?");
    queryParams.push(status.toLowerCase());
  }
  if (plate_no !== undefined) {
    updateFields.push("plate_no = ?");
    queryParams.push(plate_no);
  }
  if (complaint_text) {
    updateFields.push("complaint_text = ?");
    queryParams.push(complaint_text.trim());
  }
  
  if (updateFields.length === 0) {
      return res.status(400).json({ error: "No valid fields to update provided." });
  }

  queryParams.push(complaintId);
  const sql = `UPDATE complaints SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE complaint_id = ?`;
  
  try {
const result = await db.query(sql, queryParams);
if (result.affectedRows === 0) {
  return res.status(404).json({ error: "Complaint not found or no changes made." });
}


} catch (err) {
    console.error("Database error (updating complaint):", err);
    return res.status(500).json({ error: "Failed to update complaint." });
  }
};

// DELETE Complaint
// IMPORTANT: This endpoint should be protected by admin authentication/authorization
const deleteComplaint = async (req, res) => {
  const { complaintId } = req.params;
  let connection;

  try {
    connection = await db.pool.getConnection();
    await connection.beginTransaction();

    // 1. Get attachment file paths
    const selectAttachmentsSql = "SELECT file_path FROM complaint_attachments WHERE complaint_id = ?";
    const [attachments] = await connection.query(selectAttachmentsSql, [complaintId]);

    // 2. Delete from complaints table (attachments will be deleted by ON DELETE CASCADE if set up)
    // If ON DELETE CASCADE is not set for complaint_attachments, you'd delete them explicitly first:
    // await connection.query("DELETE FROM complaint_attachments WHERE complaint_id = ?", [complaintId]);
    
    const deleteComplaintSql = "DELETE FROM complaints WHERE complaint_id = ?";
    const [delComplaintResult] = await connection.query(deleteComplaintSql, [complaintId]);

    if (delComplaintResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Complaint not found for deletion." });
    }

    await connection.commit();

    // 3. Delete files from filesystem AFTER successful DB commit
    attachments.forEach(attachment => {
      const filePath = path.join(__dirname, "..", attachment.file_path);
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error(`Failed to delete attachment file ${filePath}:`, unlinkErr);
        } else {
          console.log(`Deleted attachment file: ${filePath}`);
        }
      });
    });

    console.log(`Complaint deleted successfully: ID ${complaintId}`);
    res.json({ message: "Complaint deleted successfully." });

  } catch (error) {
    console.error("Error deleting complaint:", error);
    if (connection) await connection.rollback();
    res.status(500).json({ error: "Failed to delete complaint." });
  } finally {
    if (connection) connection.release();
  }
};


module.exports = {
  uploadProfilePicture,
  getProfilePicture,
  submitComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint
};
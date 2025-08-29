const db = require("../models/db");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for profile image uploads
const profileImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/employee-profiles';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `employee-${req.params.employee_id || 'unknown'}-${uniqueSuffix}${extension}`);
    }
});

const profileImageUpload = multer({
    storage: profileImageStorage,
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only JPEG, JPG, PNG, and GIF files are allowed for profile images'));
        }
    }
});

/**
 * Upload profile image for employee
 */
const uploadEmployeeProfileImage = async (req, res) => {
    console.log('🖼️ Profile image upload request received');
    console.log('📝 Employee ID:', req.params.employee_id);
    console.log('📝 Headers:', req.headers);

    const { employee_id } = req.params;

    if (!employee_id) {
        return res.status(400).json({
            success: false,
            message: "Employee ID is required."
        });
    }

    // Use multer middleware
    profileImageUpload.single('profileImage')(req, res, async (err) => {
        if (err) {
            console.error('❌ Multer error:', err.message);
            
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: 'File size too large. Maximum size is 5MB.'
                    });
                }
            }
            
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No profile image file uploaded.'
            });
        }

        let connection;

        try {
            connection = await db.pool.getConnection();
            await connection.beginTransaction();

            // Check if employee exists
            const [existingEmployee] = await connection.query(
                'SELECT employee_id, profileImage FROM employees WHERE employee_id = ?',
                [employee_id]
            );

            if (existingEmployee.length === 0) {
                // Clean up uploaded file
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: "Employee not found."
                });
            }

            // Delete old profile image if exists
            const oldImagePath = existingEmployee[0].profileImage;
            if (oldImagePath) {
                const oldImageFullPath = path.join(__dirname, '..', oldImagePath);
                if (fs.existsSync(oldImageFullPath)) {
                    fs.unlinkSync(oldImageFullPath);
                    console.log('🗑️ Deleted old profile image:', oldImagePath);
                }
            }

            // Update employee with new profile image path
            const profileImagePath = `uploads/employee-profiles/${req.file.filename}`;
            
            const [result] = await connection.query(
                'UPDATE employees SET profileImage = ? WHERE employee_id = ?',
                [profileImagePath, employee_id]
            );

            if (result.affectedRows === 0) {
                // Clean up uploaded file
                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: "Failed to update employee profile image."
                });
            }

            await connection.commit();

            console.log('✅ Profile image uploaded successfully');
            console.log('📁 File path:', profileImagePath);
            console.log('📊 File size:', req.file.size, 'bytes');

            res.json({
                success: true,
                message: "Profile image uploaded successfully.",
                profileImage: profileImagePath,
                imageUrl: `${req.protocol}://${req.get('host')}/${profileImagePath}`,
                fileInfo: {
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    size: req.file.size,
                    mimetype: req.file.mimetype
                }
            });

        } catch (error) {
            if (connection) {
                await connection.rollback();
            }

            // Clean up uploaded file on error
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            console.error("❌ Error uploading profile image:", error);
            res.status(500).json({
                success: false,
                message: "Error uploading profile image",
                error: error.message
            });

        } finally {
            if (connection) {
                connection.release();
            }
        }
    });
};

/**
 * Get employee profile image
 */
const getEmployeeProfileImage = async (req, res) => {
    const { employee_id } = req.params;

    if (!employee_id) {
        return res.status(400).json({
            success: false,
            message: "Employee ID is required."
        });
    }

    try {
        const [employee] = await db.pool.query(
            'SELECT employee_id, profileImage, name FROM employees WHERE employee_id = ?',
            [employee_id]
        );

        if (employee.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found."
            });
        }

        const profileImagePath = employee[0].profileImage;

        if (!profileImagePath) {
            return res.status(404).json({
                success: false,
                message: "No profile image found for this employee."
            });
        }

        // Check if file exists
        const fullImagePath = path.join(__dirname, '..', profileImagePath);
        if (!fs.existsSync(fullImagePath)) {
            return res.status(404).json({
                success: false,
                message: "Profile image file not found on server."
            });
        }

        const imageUrl = `${req.protocol}://${req.get('host')}/${profileImagePath}`;

        res.json({
            success: true,
            employee_id: employee_id,
            employee_name: employee[0].name,
            profileImage: profileImagePath,
            imageUrl: imageUrl
        });

    } catch (error) {
        console.error("❌ Error getting profile image:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving profile image",
            error: error.message
        });
    }
};

/**
 * Delete employee profile image
 */
const deleteEmployeeProfileImage = async (req, res) => {
    const { employee_id } = req.params;

    if (!employee_id) {
        return res.status(400).json({
            success: false,
            message: "Employee ID is required."
        });
    }

    let connection;

    try {
        connection = await db.pool.getConnection();
        await connection.beginTransaction();

        // Get current profile image
        const [employee] = await connection.query(
            'SELECT employee_id, profileImage FROM employees WHERE employee_id = ?',
            [employee_id]
        );

        if (employee.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Employee not found."
            });
        }

        const profileImagePath = employee[0].profileImage;

        if (!profileImagePath) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "No profile image found for this employee."
            });
        }

        // Update database to remove profile image
        const [result] = await connection.query(
            'UPDATE employees SET profileImage = NULL WHERE employee_id = ?',
            [employee_id]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Failed to remove profile image from database."
            });
        }

        await connection.commit();

        // Delete file from filesystem
        const fullImagePath = path.join(__dirname, '..', profileImagePath);
        if (fs.existsSync(fullImagePath)) {
            fs.unlinkSync(fullImagePath);
            console.log('🗑️ Deleted profile image file:', profileImagePath);
        }

        console.log('✅ Profile image deleted successfully');

        res.json({
            success: true,
            message: "Profile image deleted successfully."
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("❌ Error deleting profile image:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting profile image",
            error: error.message
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    uploadEmployeeProfileImage,
    getEmployeeProfileImage,
    deleteEmployeeProfileImage
};
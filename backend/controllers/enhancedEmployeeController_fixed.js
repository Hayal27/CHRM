const db = require("../models/db");
const bcrypt = require('bcrypt');

// =====================================================
// ENHANCED EMPLOYEE MODULE FUNCTIONS
// =====================================================

/**
 * Update employee with enhanced attributes
 */
const updateEnhancedEmployee = async (req, res) => {
    const { employee_id } = req.params;
    const updateData = req.body;

    console.log('🔄 Updating employee:', employee_id);
    console.log('📝 Update data received:', updateData);

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

        // Check if employee exists
        const [existingEmployee] = await connection.query(
            'SELECT employee_id, email FROM employees WHERE employee_id = ?',
            [employee_id]
        );

        if (existingEmployee.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Employee not found."
            });
        }

        // Check for email conflicts (if email is being updated)
        if (updateData.email && updateData.email !== existingEmployee[0].email) {
            const [emailConflict] = await connection.query(
                'SELECT employee_id FROM employees WHERE email = ? AND employee_id != ?',
                [updateData.email, employee_id]
            );

            if (emailConflict.length > 0) {
                await connection.rollback();
                return res.status(409).json({
                    success: false,
                    message: "Email already exists for another employee."
                });
            }
        }

        // Build dynamic update query with all enhanced fields
        const updateFields = [];
        const updateValues = [];

        // All fields that can be updated (including enhanced attributes)
        const allowedFields = [
            // Basic fields
            'name', 'fname', 'lname', 'email', 'phone', 'sex', 
            'position', 'dateOfJoining', 'status', 'role_id', 
            'department_id', 'supervisor_id', 'college_id',
            
            // Enhanced attributes
            'employee_type', 'age', 'year_of_birth', 'year_of_employment',
            'qualification_level', 'qualification_subject', 'year_of_upgrading',
            'competence_level', 'competence_occupation', 'citizen_address',
            'mobile', 'occupation_on_training', 'employed_work_process',
            'specialization', 'years_of_experience', 'emergency_contact_name',
            'emergency_contact_phone', 'emergency_contact_relationship'
        ];

        // Handle special field mappings
        const fieldMappings = {
            'full_name': 'name'
        };

        // Process each field
        Object.keys(updateData).forEach(key => {
            const dbField = fieldMappings[key] || key;
            
            if (allowedFields.includes(dbField) && updateData[key] !== undefined) {
                updateFields.push(`${dbField} = ?`);
                updateValues.push(updateData[key]);
                console.log(`✅ Adding field: ${dbField} = ${updateData[key]}`);
            } else if (key !== 'employee_id') {
                console.log(`⚠️ Skipping field: ${key} (not in allowed fields)`);
            }
        });

        if (updateFields.length === 0) {
            await connection.rollback();
            return res.status(400).json({
                success: false,
                message: "No valid fields provided for update."
            });
        }

        updateValues.push(employee_id);

        const updateQuery = `UPDATE employees SET ${updateFields.join(', ')} WHERE employee_id = ?`;
        console.log('🔍 Update query:', updateQuery);
        console.log('🔍 Update values:', updateValues);

        const [result] = await connection.query(updateQuery, updateValues);

        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: "Employee not found or no changes made."
            });
        }

        await connection.commit();

        // Fetch updated employee data
        const [updatedEmployee] = await connection.query(`
            SELECT 
                e.*,
                r.role_name,
                d.name as department_name
            FROM employees e
            LEFT JOIN roles r ON e.role_id = r.role_id
            LEFT JOIN departments d ON e.department_id = d.department_id
            WHERE e.employee_id = ?
        `, [employee_id]);

        console.log('✅ Employee updated successfully');

        res.json({
            success: true,
            message: "Employee updated successfully.",
            employee: updatedEmployee[0],
            updated_fields: updateFields.length
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("❌ Error updating enhanced employee:", error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: "Duplicate entry detected. Please check unique fields like email."
            });
        }

        res.status(500).json({
            success: false,
            message: "Error updating employee",
            error: error.message
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    updateEnhancedEmployee
};
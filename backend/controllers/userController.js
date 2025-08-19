const db = require('../models/db');
const bcrypt = require('bcrypt');
// const util = require('util');

// Update user details (both account and employee info)
const updateUser = async (req, res) => {
    const { user_id } = req.params;
    const { fname, lname, user_name, phone, department_id, role_id } = req.body;
    
    try {
        // Retrieve the employee_id from the users table
        const usersData = await db.query("SELECT employee_id FROM users WHERE user_id = ?", [user_id]);
        if (!usersData || usersData.length === 0) {
            console.error("User not found for update, user_id:", user_id);
            return res.status(404).json({ message: "User not found" });
        }
        const employee_id = usersData[0].employee_id;
        
        // If an employee_id exists, update the employees table
        if (employee_id) {
            await db.query(
                "UPDATE employees SET fname = ?, lname = ?, phone = ?, department_id = ? WHERE employee_id = ?",
                [fname, lname, phone, department_id, employee_id]
            );
            console.log("Employee details updated for employee_id:", employee_id);
        }
        
        // Update the users table with account details
        await db.query(
            "UPDATE users SET user_name = ?, role_id = ? WHERE user_id = ?",
            [user_name, role_id, user_id]
        );
        console.log("User account updated for user_id:", user_id);
        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Error updating user", error: error.message });
    }
};

// Get all roles
const getAllRoles = async (req, res) => {
    try {
        const con = await db.pool.getConnection();
        const [results] = await con.query("SELECT * FROM role");
        con.release();
        console.log("Fetched roles:", results);
        res.json(results);
    } catch (error) {
        console.error("Error retrieving roles:", error);
        res.status(500).json({ message: "Error retrieving roles", error: error.message });
    }
};

// Get all departments
const getDepartment = async (req, res) => {
    try {
        const con = await db.pool.getConnection();
        const [results] = await con.query("SELECT * FROM department");
        con.release();
        console.log("Fetched departments:", results);
        res.json(results);
    } catch (error) {
        console.error("Error retrieving department:", error);
        res.status(500).json({ message: "Error retrieving department", error: error.message });
    }
};

// Get all users (including employee details using LEFT JOIN)
const getAllUsers = async (req, res) => {
    try {
        const con = await db.pool.getConnection();
        const queryStr = `
            SELECT u.*, e.*
            FROM users u 
            LEFT JOIN employees e ON u.employee_id = e.employee_id
        `;
        const [results] = await con.query(queryStr);
        con.release();
        console.log("Fetched users:", results);
        res.json(results);
    } catch (error) {
        console.error("Error retrieving users:", error);
        res.status(500).json({ message: "Error retrieving users", error: error.message });
    }
};

// Change user status (active = 1 or inactive = 0)
const changeUserStatus = async (req, res) => {
    const { user_id } = req.params;
    const { status } = req.body;

    if (status !== 0 && status !== 1) {
        console.error("Invalid status provided:", status);
        return res.status(400).json({ message: "Invalid status. Use 0 for inactive and 1 for active." });
    }

    try {
        const con = await db.pool.getConnection();
        con.query("UPDATE users SET status = ? WHERE user_id = ?", [status, user_id], (err, result) => {
            con.release(); // Release the connection
            if (err) {
                console.error("Error updating user status:", err);
                return res.status(500).json({ message: "Error updating user status", error: err });
            }

            if (result.affectedRows === 0) {
                console.error("User not found for update, user_id:", user_id);
                return res.status(404).json({ message: "User not found" });
            }

            console.log("User status updated successfully for user_id:", user_id, "New status:", status);
            res.json({ message: "User status updated successfully" });
        });
    } catch (error) {
        console.error("Error getting connection:", error);
        res.status(500).json({ message: "Database connection error", error: error.message });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    const { user_id } = req.params;

    try {
        const con = await db.pool.getConnection();
        con.query("DELETE FROM users WHERE user_id = ?", [user_id], (err, result) => {
            con.release(); // Release the connection
            if (err) {
                console.error("Error deleting user:", err);
                return res.status(500).json({ message: "Error deleting user", error: err });
            }

            if (result.affectedRows === 0) {
                console.error("User not found for deletion, user_id:", user_id);
                return res.status(404).json({ message: "User not found" });
            }

            console.log("User deleted successfully, user_id:", user_id);
            res.json({ message: "User deleted successfully" });
        });
    } catch (error) {
        console.error("Error getting connection:", error);
        res.status(500).json({ message: "Database connection error", error: error.message });
    }
};

// Get user role for the current user (using req.user_id from middleware)
const getUserRoles = async (req, res) => {
    try {
        const user_id = req.user_id;
        if (!user_id) {
            console.error("User ID not provided in request.");
            return res.status(400).json({ error: "User ID not provided" });
        }
        
        const con = await db.pool.getConnection();
        const sql = `
            SELECT r.role_name
            FROM roles r
            INNER JOIN users u ON u.role_id = r.role_id
            WHERE u.user_id = ?
        `;
        con.query(sql, [user_id], (err, results) => {
            con.release(); // Release the connection
            if (err) {
                console.error("Database query error for user roles:", err);
                return res.status(500).json({ error: "Internal server error" });
            }
            if (results.length === 0) {
                console.error("User role not found for user_id:", user_id);
                return res.status(404).json({ error: "User role not found" });
            }
            console.log("Fetched user role for user_id:", user_id, results[0]);
            res.json(results[0]);
        });
    } catch (error) {
        console.error("Error in getUserRoles:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    updateUser,
    getAllRoles,
    getDepartment,
    getAllUsers,
    changeUserStatus,
    deleteUser,
    getUserRoles
};
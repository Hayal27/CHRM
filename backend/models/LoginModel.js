const db = require('./db');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
const useragent = require('useragent'); // npm install useragent
const axios = require('axios'); // npm install axios

// Secret key (as specified in your requirements)
const JWT_SECRET_KEY = 'hayaltamrat@27'; 

// Function to handle login

const MAX_ATTEMPTS = 5;
const BASE_LOCK_MINUTES = 10; // First lock is 10 minutes

// Helper to get browser info
function getBrowserInfo(req) {
    const agent = useragent.parse(req.headers['user-agent']);
    return agent.toString();
}

// Helper to get location info (using ip-api.com)
async function getLocation(ip) {
    try {
        if (ip === '::1' || ip === '127.0.0.1') return 'Localhost';
        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        if (response.data && response.data.status === 'success') {
            return `${response.data.city}, ${response.data.country}`;
        }
        return 'Unknown';
    } catch (err) {
        console.error('Error fetching location:', err);
        return 'Unknown';
    }
}

const getLogin = async (req, res) => {
    try {
        const { user_name, pass } = req.body;
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const browser = getBrowserInfo(req);
        const location = await getLocation(ip);

        if (!pass) {
            return res.status(400).json({ success: false, message: 'Password is required' });
        }

        const query = `
          SELECT u.*, e.*, u.status as user_status
          FROM users u
          LEFT JOIN employees e ON u.employee_id = e.employee_id
          WHERE u.user_name = ?
        `;
        const results = await db.query(query, [user_name]);

        if (results.length === 0) {
            // Log failed attempt with no user_id
            await db.query(
                'INSERT INTO login_attempts (user_id, attempt_time, success, ip_address, browser, location) VALUES (?, NOW(), ?, ?, ?, ?)',
                [null, 0, ip, browser, location]
            );
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        const user = results[0];

        // Check if account is locked
        if (user.lock_until && new Date(user.lock_until) > new Date()) {
            const minutes = Math.ceil((new Date(user.lock_until) - new Date()) / 60000);
            await db.query(
                'INSERT INTO login_attempts (user_id, attempt_time, success, ip_address, browser, location) VALUES (?, NOW(), ?, ?, ?, ?)',
                [user.user_id, 0, ip, browser, location]
            );
            return res.status(423).json({ success: false, message: `Account locked. Try again in ${minutes} minute(s).` });
        }

        if (!user.password) {
            return res.status(400).json({ success: false, message: 'User password not set' });
        }

        const passwordMatch = await bcrypt.compare(pass, user.password);

        if (passwordMatch && user.user_status === '1') {
            // Reset failed_attempts and lock_until
            await db.query('UPDATE users SET failed_attempts=0, lock_until=NULL, online_flag=? WHERE user_id=?', [1, user.user_id]);
            // Log success
            await db.query(
                'INSERT INTO login_attempts (user_id, attempt_time, success, ip_address, browser, location) VALUES (?, NOW(), ?, ?, ?, ?)',
                [user.user_id, 1, ip, browser, location]
            );
            // Generate a JWT token with a 400h expiration
            const token = jwt.sign({ user_id: user.user_id, role_id: user.role_id }, JWT_SECRET_KEY, { expiresIn: '400h' });
            return res.status(200).json({ success: true, token, user });
        } else {
            // Increment failed_attempts
            let failedAttempts = (user.failed_attempts || 0) + 1;
            let lockUntil = null;

            // Exponential backoff: lock for longer with each threshold breach
            if (failedAttempts >= MAX_ATTEMPTS) {
                // Calculate exponential lock time (10, 20, 40, etc. minutes)
                const lockMinutes = BASE_LOCK_MINUTES * Math.pow(2, Math.floor((failedAttempts - MAX_ATTEMPTS) / MAX_ATTEMPTS));
                lockUntil = new Date(Date.now() + lockMinutes * 60000);
            }

            await db.query(
                'UPDATE users SET failed_attempts = ?, lock_until = ? WHERE user_id = ?',
                [failedAttempts, lockUntil, user.user_id]
            );

            // Log the failed attempt
            await db.query(
                'INSERT INTO login_attempts (user_id, attempt_time, success, ip_address, browser, location) VALUES (?, NOW(), ?, ?, ?, ?)',
                [user.user_id, 0, ip, browser, location]
            );

            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error in login process:', error);
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};


// Function to handle logout
const logout = async (req, res) => {
    try {
        const id = req.params.user_id;

        // Update user's online_flag to 0 to indicate logout
        await db.query('UPDATE users SET online_flag=? WHERE user_id=?', [0, id]);
        
        console.log('Logout status updated successfully for user ID:', id);
        return res.status(200).send({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error updating logout status:', error);
        return res.status(500).send({ message: "Error updating logout status", error: error.message });
    }
};

// --- Analytics Functions ---

// Get login analytics (success/fail, by IP, browser, location, time)
const getLoginAnalytics = async (req, res) => {
    try {
        // Total attempts, success, fail
        const [summary] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(success=1) as success,
                SUM(success=0) as fail
            FROM login_attempts
        `);

        // Attempts by IP
        const attemptsByIP = await db.query(`
            SELECT ip_address, COUNT(*) as count
            FROM login_attempts
            GROUP BY ip_address
            ORDER BY count DESC
            LIMIT 10
        `);

        // Attempts by browser
        const attemptsByBrowser = await db.query(`
            SELECT browser, COUNT(*) as count
            FROM login_attempts
            GROUP BY browser
            ORDER BY count DESC
            LIMIT 10
        `);

        // Attempts by location
        const attemptsByLocation = await db.query(`
            SELECT location, COUNT(*) as count
            FROM login_attempts
            GROUP BY location
            ORDER BY count DESC
            LIMIT 10
        `);

        // Recent attempts with user_name
        const recentAttempts = await db.query(`
            SELECT la.user_id, u.user_name, la.attempt_time, la.success, la.ip_address, la.browser, la.location
            FROM login_attempts la
            LEFT JOIN users u ON la.user_id = u.user_id
            ORDER BY la.attempt_time DESC
            LIMIT 20
        `);

        res.json({
            summary: summary[0],
            attemptsByIP,
            attemptsByBrowser,
            attemptsByLocation,
            recentAttempts
        });
    } catch (error) {
        console.error('Error in getLoginAnalytics:', error);
        res.status(500).json({ success: false, message: 'Analytics error', error: error.message });
    }
};

// Get blocked users
const getBlockedUsersAnalytics = async (req, res) => {
    try {
        const blockedUsers = await db.query(`
            SELECT user_id, user_name, lock_until, failed_attempts
            FROM users
            WHERE lock_until IS NOT NULL AND lock_until > NOW()
        `);
        res.json({ blockedUsers });
    } catch (error) {
        console.error('Error in getBlockedUsersAnalytics:', error);
        res.status(500).json({ success: false, message: 'Blocked users analytics error', error: error.message });
    }
};

let transporter;
try {
    const nodemailer = require('nodemailer'); // npm install nodemailer
    // Configure your email transporter
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // e.g. 'youraddress@gmail.com'
            pass: process.env.EMAIL_PASS  // e.g. 'your-app-password'
        },
        tls: {
            rejectUnauthorized: false
        }
    });
} catch (err) {
    console.error('Error creating email transporter:', err);
}

// Request password reset (send OTP)
const requestPasswordReset = async (req, res) => {
    try {
        const { user_name } = req.body; // user_name is the email
        if (!user_name) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        // Check if user exists
        const users = await db.query('SELECT user_id FROM users WHERE user_name = ?', [user_name]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const user_id = users[0].user_id;

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in password_resets table (create this table if not exists)
        await db.query(
            'INSERT INTO password_resets (user_id, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE)) ON DUPLICATE KEY UPDATE otp=?, expires_at=DATE_ADD(NOW(), INTERVAL 10 MINUTE)',
            [user_id, otp, otp]
        );

        // Send OTP to email
        await transporter.sendMail({
            from: 'bereketeab550@gmail.com',
            to: user_name,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}`
        });

        res.json({ success: true, message: 'OTP sent to your email' });
    } catch (error) {
        console.error('Error in requestPasswordReset:', error);
        res.status(500).json({ success: false, message: 'Error sending OTP', error: error.message });
    }
};

// Reset password using OTP
const resetPassword = async (req, res) => {
    try {
        const { user_name, otp, new_password } = req.body;
        if (!user_name || !otp || !new_password) {
            return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
        }

        // Get user
        const users = await db.query('SELECT user_id FROM users WHERE user_name = ?', [user_name]);
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const user_id = users[0].user_id;

        // Check OTP
        const resets = await db.query(
            'SELECT * FROM password_resets WHERE user_id = ? AND otp = ? AND expires_at > NOW()',
            [user_id, otp]
        );
        if (resets.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update password
        await db.query('UPDATE users SET password = ?, failed_attempts = 0, lock_until = NULL WHERE user_id = ?', [hashedPassword, user_id]);

        // Delete used OTP
        await db.query('DELETE FROM password_resets WHERE user_id = ?', [user_id]);

        res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).json({ success: false, message: 'Error resetting password', error: error.message });
    }
};

module.exports = { 
    getLogin, 
    logout, 
    getLoginAnalytics, 
    getBlockedUsersAnalytics,
    requestPasswordReset,
    resetPassword
};
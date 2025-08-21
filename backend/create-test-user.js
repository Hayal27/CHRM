// Script to create a test user for login testing
const db = require('./models/db');
const bcrypt = require('bcrypt');

async function createTestUser() {
    try {
        console.log('🔧 Creating test user...');
        
        // Check if test user already exists
        const existingUser = await db.query('SELECT user_id FROM users WHERE user_name = ?', ['admin']);
        
        if (existingUser.length > 0) {
            console.log('✅ Test user already exists with user_id:', existingUser[0].user_id);
            return;
        }
        
        // Create test employee first
        const employeeResult = await db.query(
            'INSERT INTO employees (name, fname, lname, email, phone, sex, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['Test Admin', 'Test', 'Admin', 'admin@test.com', '1234567890', 'male', 'Active']
        );
        
        const employee_id = employeeResult.insertId;
        console.log('✅ Test employee created with ID:', employee_id);
        
        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 12);
        
        // Create test user
        const userResult = await db.query(
            'INSERT INTO users (employee_id, user_name, password, role_id, status) VALUES (?, ?, ?, ?, ?)',
            [employee_id, 'admin', hashedPassword, 1, '1'] // role_id 1 = admin
        );
        
        const user_id = userResult.insertId;
        console.log('✅ Test user created successfully!');
        console.log('📋 Login credentials:');
        console.log('   Username: admin');
        console.log('   Password: admin123');
        console.log('   User ID:', user_id);
        
    } catch (error) {
        console.error('❌ Error creating test user:', error.message);
        
        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.log('💡 Tip: Run the database migration script first:');
            console.log('   mysql -u root -p hrms < migration_script.sql');
        }
    }
}

createTestUser();

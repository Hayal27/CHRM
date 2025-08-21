const db = require('./models/db');
const bcrypt = require('bcrypt');

async function debugLogin() {
  try {
    console.log('🔍 Debugging login process...');
    
    const user_name = 'hayal@itp.it';
    const pass = 'itp@123';
    
    console.log('1. Searching for user:', user_name);
    const query = `
      SELECT u.*, e.*
      FROM users u 
      LEFT JOIN employees e ON u.employee_id = e.employee_id 
      WHERE u.user_name = ?
    `;
    const results = await db.query(query, [user_name]);
    
    if (results.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const user = results[0];
    console.log('2. User found:');
    console.log('   User ID:', user.user_id);
    console.log('   Status:', user.status, '(type:', typeof user.status, ')');
    console.log('   Failed attempts:', user.failed_attempts);
    console.log('   Lock until:', user.lock_until);
    console.log('   Has password:', !!user.password);
    
    console.log('3. Checking account lock...');
    if (user.lock_until && new Date(user.lock_until) > new Date()) {
      console.log('❌ Account is locked');
      return;
    }
    console.log('✅ Account not locked');
    
    console.log('4. Checking password...');
    if (!user.password) {
      console.log('❌ No password set');
      return;
    }
    
    const passwordMatch = await bcrypt.compare(pass, user.password);
    console.log('   Password match:', passwordMatch);
    
    console.log('5. Checking status...');
    console.log('   Status === "1":', user.status === '1');
    console.log('   Status == 1:', user.status == 1);
    
    console.log('6. Final check...');
    if (passwordMatch && user.status === '1') {
      console.log('✅ Login should succeed');
    } else {
      console.log('❌ Login should fail');
      console.log('   Password match:', passwordMatch);
      console.log('   Status check:', user.status === '1');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugLogin();

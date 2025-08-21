// Script to check all locked accounts
const db = require('./models/db');

async function checkLockedAccounts() {
    try {
        console.log('🔍 Checking for locked accounts...\n');
        
        // Get all users with failed attempts or locks
        const users = await db.query(`
            SELECT 
                user_id, 
                user_name, 
                failed_attempts, 
                lock_until,
                status,
                created_at
            FROM users 
            WHERE failed_attempts > 0 OR lock_until IS NOT NULL
            ORDER BY failed_attempts DESC, lock_until DESC
        `);
        
        if (users.length === 0) {
            console.log('✅ No accounts with failed attempts or locks found');
            return;
        }
        
        console.log(`📋 Found ${users.length} account(s) with issues:\n`);
        
        users.forEach((user, index) => {
            console.log(`${index + 1}. User: ${user.user_name}`);
            console.log(`   User ID: ${user.user_id}`);
            console.log(`   Status: ${user.status === '1' ? 'Active' : 'Inactive'}`);
            console.log(`   Failed Attempts: ${user.failed_attempts}`);
            
            if (user.lock_until) {
                const lockTime = new Date(user.lock_until);
                const now = new Date();
                
                if (lockTime > now) {
                    const minutes = Math.ceil((lockTime - now) / 60000);
                    console.log(`   🔒 LOCKED until: ${lockTime.toLocaleString()}`);
                    console.log(`   ⏰ Time remaining: ${minutes} minute(s)`);
                } else {
                    console.log(`   🔓 Lock expired: ${lockTime.toLocaleString()}`);
                }
            } else {
                console.log(`   🔓 Not currently locked`);
            }
            
            console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
            console.log('');
        });
        
        // Show unlock commands
        console.log('🔧 To unlock accounts, run:');
        users.forEach(user => {
            if (user.lock_until && new Date(user.lock_until) > new Date()) {
                console.log(`   node unlock-account.js "${user.user_name}"`);
            }
        });
        
    } catch (error) {
        console.error('❌ Error checking locked accounts:', error.message);
    }
}

checkLockedAccounts();

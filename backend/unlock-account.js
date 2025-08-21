// Script to unlock a locked user account
const db = require('./models/db');

async function unlockAccount(username) {
    try {
        console.log(`🔓 Unlocking account for: ${username}`);
        
        // Check if user exists and is locked
        const users = await db.query(
            'SELECT user_id, user_name, failed_attempts, lock_until FROM users WHERE user_name = ?',
            [username]
        );
        
        if (users.length === 0) {
            console.log('❌ User not found');
            return;
        }
        
        const user = users[0];
        console.log('📋 Current user status:');
        console.log('   User ID:', user.user_id);
        console.log('   Username:', user.user_name);
        console.log('   Failed Attempts:', user.failed_attempts);
        console.log('   Lock Until:', user.lock_until);
        
        if (user.lock_until && new Date(user.lock_until) > new Date()) {
            const minutes = Math.ceil((new Date(user.lock_until) - new Date()) / 60000);
            console.log(`⏰ Account is locked for ${minutes} more minute(s)`);
        } else if (user.failed_attempts > 0) {
            console.log('⚠️  Account has failed attempts but is not currently locked');
        } else {
            console.log('✅ Account is not locked');
            return;
        }
        
        // Reset failed attempts and remove lock
        await db.query(
            'UPDATE users SET failed_attempts = 0, lock_until = NULL WHERE user_id = ?',
            [user.user_id]
        );
        
        console.log('✅ Account unlocked successfully!');
        console.log('🔄 Failed attempts reset to 0');
        console.log('🔓 Lock removed');
        
    } catch (error) {
        console.error('❌ Error unlocking account:', error.message);
    }
}

// Get username from command line argument or use default
const username = process.argv[2] || 'hayal@itp.it';
unlockAccount(username);

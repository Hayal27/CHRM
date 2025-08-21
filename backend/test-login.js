// Test script to verify login endpoint
const axios = require('axios');

async function testLogin() {
    try {
        console.log('🧪 Testing login endpoint...');
        
        // Test 1: Check if server is running
        const healthCheck = await axios.get('http://localhost:5000/api');
        console.log('✅ Server health check:', healthCheck.data);
        
        // Test 2: Try login with test credentials
        const loginResponse = await axios.post('http://localhost:5000/login', {
            user_name: 'admin', // Replace with actual test username
            pass: 'password123' // Replace with actual test password
        });
        
        console.log('✅ Login test successful:', loginResponse.data);
        
    } catch (error) {
        console.error('❌ Login test failed:');
        console.error('Status:', error.response?.status);
        console.error('Message:', error.response?.data?.message || error.message);
        console.error('Full error:', error.response?.data || error.message);
    }
}

testLogin();

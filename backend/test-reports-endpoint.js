const axios = require('axios');

async function testReportsEndpoint() {
    try {
        // First, let's try to login to get a token
        console.log('🔐 Attempting to login...');
        const loginResponse = await axios.post('http://localhost:5001/login', {
            user_name: 'www', // Using the user from the database
            pass: 'password123' // Using 'pass' instead of 'password'
        });

        if (loginResponse.data.success) {
            const token = loginResponse.data.token;
            console.log('✅ Login successful, token obtained');

            // Now test the reports endpoint
            console.log('📊 Testing reports endpoint...');
            const reportsResponse = await axios.post('http://localhost:5001/api/education-office/reports/generate', {
                college_id: 1,
                report_type: 'comprehensive',
                include_inactive: false
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('✅ Reports endpoint response:', reportsResponse.data);
        } else {
            console.log('❌ Login failed:', loginResponse.data);
        }
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testReportsEndpoint();
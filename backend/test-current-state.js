// Test current state of enhanced employee registration
const axios = require('axios');

async function testCurrentState() {
    try {
        console.log('🧪 Testing Current Enhanced Employee Registration State...\n');

        // Get a valid token
        const loginResponse = await axios.post('http://localhost:5000/login', {
            user_name: 'hayal@itp.it',
            pass: 'itp@123'
        });

        if (!loginResponse.data.success) {
            throw new Error('Failed to login for testing');
        }

        const token = loginResponse.data.token;
        console.log('✅ Login successful, token obtained');

        // Test with JSON data (no file upload) - this should work
        console.log('📤 Testing JSON submission (no file)...');
        
        const employeeData = {
            employee_type: 'trainer',
            full_name: 'Test Current State Employee',
            fname: 'Test',
            lname: 'Current',
            sex: 'F',
            email: 'test.current@example.com',
            mobile: '+251-11-555-0127',
            college_id: 1,
            qualification_level: 'master',
            qualification_subject: 'Engineering',
            occupation_on_training: 'Mechanical Engineering Training', // Required for trainer
            citizen_address: '123 Current Street, Addis Ababa',
            position: 'Senior Trainer',
            dateOfJoining: '2024-04-01',
            create_user: true,
            user_name: 'test.current',
            password: 'TestPass123'
        };

        const response = await axios.post(
            'http://localhost:5000/api/employees/enhanced/add',
            employeeData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        console.log('📥 Response Status:', response.status);
        console.log('📥 Response Data:', JSON.stringify(response.data, null, 2));

        if (response.data.success) {
            console.log('✅ Current state test successful!');
            console.log(`🎉 Employee ID: ${response.data.employee_id}`);
            if (response.data.user_id) {
                console.log(`👤 User ID: ${response.data.user_id}`);
            }
        } else {
            console.log('❌ Current state test failed');
        }

    } catch (error) {
        console.error('❌ Test error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the test
testCurrentState();

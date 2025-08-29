// Simple test for enhanced employee registration without document
const axios = require('axios');

async function testSimpleEmployeeRegistration() {
    try {
        console.log('🧪 Testing Simple Enhanced Employee Registration...\n');

        // Get a valid token
        const loginResponse = await axios.post('http://localhost:5001/login', {
            user_name: 'hayal@itp.it',
            pass: 'itp@123'
        });

        if (!loginResponse.data.success) {
            throw new Error('Failed to login for testing');
        }

        const token = loginResponse.data.token;
        console.log('✅ Login successful, token obtained');

        // Test enhanced employee creation with JSON
        console.log('📤 Creating enhanced employee (JSON)...');
        
        const employeeData = {
            full_name: 'Test Simple Employee',
            fname: 'Test',
            lname: 'Simple',
            email: 'test.simple@example.com',
            mobile: '+251-11-555-0124',
            sex: 'F',
            employee_type: 'admin',
            college_id: 1,
            qualification_level: 'master',
            qualification_subject: 'Business Administration',
            employed_work_process: 'Administrative Management',
            citizen_address: '456 Simple Street, Addis Ababa',
            position: 'Admin Officer',
            dateOfJoining: '2024-02-01',
            create_user: true,
            user_name: 'test.simple',
            password: 'TestPass123'
        };

        const response = await axios.post(
            'http://localhost:5001/api/employees/enhanced/add',
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
            console.log('✅ Simple enhanced employee created successfully!');
            console.log(`🎉 Employee ID: ${response.data.employee_id}`);
            if (response.data.user_id) {
                console.log(`👤 User ID: ${response.data.user_id}`);
            }
        } else {
            console.log('❌ Simple enhanced employee creation failed');
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
testSimpleEmployeeRegistration();

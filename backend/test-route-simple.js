// Simple test to check if the route works without file upload
const axios = require('axios');

async function testRouteSimple() {
    try {
        console.log('🧪 Testing Enhanced Employee Route (No File)...\n');

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

        // Test with JSON data (no file upload)
        console.log('📤 Testing route with JSON data...');
        
        const employeeData = {
            employee_type: 'admin',
            full_name: 'Test Route Employee',
            fname: 'Test',
            lname: 'Route',
            sex: 'M',
            email: 'test.route@example.com',
            mobile: '+251-11-555-0126',
            college_id: 1,
            qualification_level: 'bachelor',
            qualification_subject: 'Computer Science',
            employed_work_process: 'System Administration',
            citizen_address: '123 Route Street, Addis Ababa',
            position: 'System Admin',
            dateOfJoining: '2024-03-15',
            create_user: true,
            user_name: 'test.route',
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
            console.log('✅ Route test successful!');
            console.log(`🎉 Employee ID: ${response.data.employee_id}`);
        } else {
            console.log('❌ Route test failed');
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
testRouteSimple();

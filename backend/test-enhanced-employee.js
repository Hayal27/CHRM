// Test script for enhanced employee registration with document upload
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

async function testEnhancedEmployeeRegistration() {
    try {
        console.log('🧪 Testing Enhanced Employee Registration...\n');

        // Create a test document file
        const testDocContent = 'This is a test document for employee registration';
        const testDocPath = path.join(__dirname, 'test-document.txt');
        fs.writeFileSync(testDocPath, testDocContent);

        // Create FormData
        const formData = new FormData();
        
        // Add employee data
        formData.append('full_name', 'Test Enhanced Employee');
        formData.append('fname', 'Test');
        formData.append('lname', 'Employee');
        formData.append('email', 'test.enhanced@example.com');
        formData.append('mobile', '+251-11-555-0123');
        formData.append('sex', 'male');
        formData.append('employee_type', 'trainer');
        formData.append('college_id', '1'); // Use existing college
        formData.append('qualification_level', 'bachelor');
        formData.append('qualification_subject', 'Computer Science');
        formData.append('citizen_address', '123 Test Street, Addis Ababa');
        formData.append('position', 'Senior Trainer');
        formData.append('dateOfJoining', '2024-01-15');
        formData.append('create_user', 'true');
        formData.append('user_name', 'test.enhanced');
        formData.append('password', 'TestPass123');

        // Add document file
        formData.append('document', fs.createReadStream(testDocPath));

        // Get a valid token (you'll need to replace this with actual login)
        const loginResponse = await axios.post('http://localhost:5000/login', {
            user_name: 'hayal@itp.it',
            pass: 'itp@123'
        });

        if (!loginResponse.data.success) {
            throw new Error('Failed to login for testing');
        }

        const token = loginResponse.data.token;
        console.log('✅ Login successful, token obtained');

        // Test enhanced employee creation
        console.log('📤 Creating enhanced employee with document...');
        
        const response = await axios.post(
            'http://localhost:5000/api/employees/enhanced/add',
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        console.log('📥 Response Status:', response.status);
        console.log('📥 Response Data:', JSON.stringify(response.data, null, 2));

        if (response.data.success) {
            console.log('✅ Enhanced employee created successfully!');
            console.log(`🎉 Employee ID: ${response.data.employee_id}`);
            if (response.data.user_id) {
                console.log(`👤 User ID: ${response.data.user_id}`);
            }
        } else {
            console.log('❌ Enhanced employee creation failed');
        }

        // Clean up test file
        fs.unlinkSync(testDocPath);
        console.log('🧹 Test file cleaned up');

    } catch (error) {
        console.error('❌ Test error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the test
testEnhancedEmployeeRegistration();

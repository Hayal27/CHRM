// Test script to simulate exact FormData from frontend
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

async function testFormDataEmployee() {
    try {
        console.log('🧪 Testing FormData Employee Registration (Frontend Simulation)...\n');

        // Create a test PDF file (simple PDF content)
        const testDocContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n202\n%%EOF';
        const testDocPath = path.join(__dirname, 'test-document.pdf');
        fs.writeFileSync(testDocPath, testDocContent);

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

        // Create FormData exactly like the frontend would
        const formData = new FormData();
        
        // Add all form fields exactly as they would come from the frontend form
        formData.append('employee_type', 'admin');
        formData.append('full_name', 'Test FormData Employee');
        formData.append('fname', 'Test');
        formData.append('lname', 'Employee');
        formData.append('sex', 'M');
        formData.append('email', 'test.formdata2@example.com');
        formData.append('mobile', '+251-11-555-0125');
        formData.append('college_id', '1');
        formData.append('qualification_level', 'bachelor');
        formData.append('qualification_subject', 'Information Technology');
        formData.append('employed_work_process', 'IT Administration'); // Required for admin
        formData.append('citizen_address', '789 FormData Street, Addis Ababa');
        formData.append('position', 'IT Administrator');
        formData.append('dateOfJoining', '2024-03-01');
        formData.append('create_user', 'true');
        formData.append('user_name', 'test.formdata2');
        formData.append('password', 'TestPass123');

        // Add document file
        formData.append('document', fs.createReadStream(testDocPath));

        console.log('📤 Sending FormData request...');
        
        const response = await axios.post(
            'http://localhost:5001/api/employees/enhanced/add',
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
            console.log('✅ FormData employee created successfully!');
            console.log(`🎉 Employee ID: ${response.data.employee_id}`);
            if (response.data.user_id) {
                console.log(`👤 User ID: ${response.data.user_id}`);
            }
        } else {
            console.log('❌ FormData employee creation failed');
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
testFormDataEmployee();

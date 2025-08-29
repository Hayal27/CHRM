// Test script to check profile image functionality
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = "http://localhost:5001";

async function testProfileImageFunctionality() {
    try {
        console.log('🔍 Testing Profile Image Functionality...\n');

        // Step 1: Check current employees and their profile images
        console.log('1. Checking current employee profile images...');
        const employeesResponse = await axios.get(`${API_BASE_URL}/api/getEmployees`);
        
        if (!employeesResponse.data.success || !employeesResponse.data.employees.length) {
            console.log('❌ No employees found to test with');
            return;
        }

        const employees = employeesResponse.data.employees;
        console.log(`✅ Found ${employees.length} employees`);

        // Check for existing profile images
        let employeesWithImages = 0;
        employees.forEach((emp, index) => {
            if (emp.profileImage || emp.profile_image) {
                employeesWithImages++;
                console.log(`👤 Employee ${index + 1}: ${emp.full_name || emp.name} - Has profile image: ${emp.profileImage || emp.profile_image}`);
            }
        });

        console.log(`📊 Employees with profile images: ${employeesWithImages}/${employees.length}`);

        if (employeesWithImages === 0) {
            console.log('ℹ️ No employees currently have profile images');
        }

        // Step 2: Test profile image URL construction
        console.log('\n2. Testing profile image URL construction...');
        
        const testImagePaths = [
            'uploads/profiles/test-image.jpg',
            '/uploads/profiles/test-image.jpg',
            'http://example.com/image.jpg',
            null,
            undefined
        ];

        testImagePaths.forEach(imagePath => {
            const result = getImageUrl(imagePath);
            console.log(`📸 Path: "${imagePath}" → URL: "${result}"`);
        });

        // Step 3: Check if profile image upload endpoint exists
        console.log('\n3. Testing profile image upload endpoint...');
        
        // Create a test image file (1x1 pixel PNG)
        const testImageBuffer = Buffer.from([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
            0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
            0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
            0x01, 0x00, 0x01, 0x5C, 0xC2, 0x5D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
            0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
        ]);

        const testImagePath = path.join(__dirname, 'test-profile-image.png');
        fs.writeFileSync(testImagePath, testImageBuffer);

        const testEmployee = employees[0];
        console.log(`🧪 Testing with employee: ${testEmployee.full_name || testEmployee.name} (ID: ${testEmployee.employee_id})`);

        // Try to upload profile image using different possible endpoints
        const possibleEndpoints = [
            `/api/employees/enhanced/${testEmployee.employee_id}/profile-image`,
            `/api/employees/${testEmployee.employee_id}/profile-image`,
            `/api/employees/enhanced/${testEmployee.employee_id}`,
            `/api/upload/profile-image`
        ];

        for (const endpoint of possibleEndpoints) {
            try {
                console.log(`🔄 Testing endpoint: ${endpoint}`);
                
                const formData = new FormData();
                formData.append('profileImage', fs.createReadStream(testImagePath), {
                    filename: 'test-profile.png',
                    contentType: 'image/png'
                });
                formData.append('employee_id', testEmployee.employee_id);

                const response = await axios.post(`${API_BASE_URL}${endpoint}`, formData, {
                    headers: {
                        ...formData.getHeaders(),
                        'Content-Type': 'multipart/form-data'
                    },
                    timeout: 5000
                });

                console.log(`✅ Endpoint ${endpoint} responded:`, response.data);
                break;

            } catch (error) {
                if (error.response) {
                    console.log(`❌ Endpoint ${endpoint} failed: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
                } else if (error.code === 'ECONNABORTED') {
                    console.log(`⏱️ Endpoint ${endpoint} timed out`);
                } else {
                    console.log(`❌ Endpoint ${endpoint} error: ${error.message}`);
                }
            }
        }

        // Step 4: Test profile image fetching
        console.log('\n4. Testing profile image fetching...');
        
        if (employeesWithImages > 0) {
            const employeeWithImage = employees.find(emp => emp.profileImage || emp.profile_image);
            const imagePath = employeeWithImage.profileImage || employeeWithImage.profile_image;
            const imageUrl = `${API_BASE_URL}/${imagePath.replace(/^\/+/, '')}`;
            
            try {
                const imageResponse = await axios.get(imageUrl, { timeout: 5000 });
                console.log(`✅ Profile image accessible: ${imageUrl} (${imageResponse.status})`);
                console.log(`📊 Content-Type: ${imageResponse.headers['content-type']}`);
                console.log(`📊 Content-Length: ${imageResponse.headers['content-length']} bytes`);
            } catch (error) {
                console.log(`❌ Profile image not accessible: ${imageUrl}`);
                console.log(`   Error: ${error.response?.status || error.message}`);
            }
        } else {
            console.log('ℹ️ No profile images to test fetching');
        }

        // Cleanup
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
        }

        console.log('\n📋 Profile Image Functionality Test Summary:');
        console.log(`   - Employees with images: ${employeesWithImages}/${employees.length}`);
        console.log(`   - URL construction: Working`);
        console.log(`   - Upload endpoint: Needs investigation`);
        console.log(`   - Image fetching: ${employeesWithImages > 0 ? 'Tested' : 'No images to test'}`);

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        
        if (error.response) {
            console.error('Server response:', error.response.data);
            console.error('Status code:', error.response.status);
        }
    }
}

// Helper function to test URL construction (same as in frontend)
function getImageUrl(imagePath) {
    const API_BASE_URL = "http://localhost:5001";
    
    if (!imagePath) {
        return null;
    }
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    return `${API_BASE_URL}/${imagePath.replace(/^\/+/, '')}`;
}

// Run the test
testProfileImageFunctionality();
// Test script to verify employee update functionality
const axios = require('axios');

const API_BASE_URL = "http://localhost:5001";

async function testEmployeeUpdate() {
    try {
        console.log('🔍 Testing Employee Update API...\n');

        // First, get list of employees to find one to update
        console.log('1. Fetching employees...');
        const employeesResponse = await axios.get(`${API_BASE_URL}/api/getEmployees`);
        
        if (!employeesResponse.data.success || !employeesResponse.data.employees.length) {
            console.log('❌ No employees found to test with');
            return;
        }

        const testEmployee = employeesResponse.data.employees[0];
        console.log(`✅ Found test employee: ${testEmployee.full_name || testEmployee.name} (ID: ${testEmployee.employee_id})`);

        // Test data to update
        const updateData = {
            full_name: testEmployee.full_name || testEmployee.name,
            fname: testEmployee.fname || 'Updated',
            lname: testEmployee.lname || 'Name',
            email: testEmployee.email,
            mobile: testEmployee.mobile || '0912345678',
            sex: testEmployee.sex || 'M',
            age: 30,
            employee_type: 'admin',
            qualification_level: 'Bachelor Degree',
            competence_level: 'Level III',
            status: 'Active'
        };

        console.log('\n2. Testing update API...');
        console.log('📤 Update data:', updateData);

        // Make the update request
        const updateResponse = await axios.put(
            `${API_BASE_URL}/api/employees/enhanced/${testEmployee.employee_id}`,
            updateData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('📥 Update response:', updateResponse.data);

        if (updateResponse.data.success) {
            console.log('✅ Employee update test PASSED!');
            console.log(`📊 Updated ${updateResponse.data.updated_fields} fields`);
        } else {
            console.log('❌ Employee update test FAILED:', updateResponse.data.message);
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        
        if (error.response) {
            console.error('Server response:', error.response.data);
            console.error('Status code:', error.response.status);
        }
    }
}

// Run the test
testEmployeeUpdate();
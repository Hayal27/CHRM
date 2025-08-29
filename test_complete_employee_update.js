// Complete test for employee update functionality
const axios = require('axios');

const API_BASE_URL = "http://localhost:5001";

async function testCompleteEmployeeUpdate() {
    try {
        console.log('🔍 Testing Complete Employee Update Flow...\n');

        // Step 1: Get employees
        console.log('1. Fetching employees...');
        const employeesResponse = await axios.get(`${API_BASE_URL}/api/getEmployees`);
        
        if (!employeesResponse.data.success || !employeesResponse.data.employees.length) {
            console.log('❌ No employees found to test with');
            return;
        }

        const testEmployee = employeesResponse.data.employees[0];
        console.log(`✅ Found test employee: ${testEmployee.full_name || testEmployee.name} (ID: ${testEmployee.employee_id})`);
        console.log('📋 Original data:', {
            name: testEmployee.full_name || testEmployee.name,
            email: testEmployee.email,
            mobile: testEmployee.mobile,
            employee_type: testEmployee.employee_type,
            age: testEmployee.age
        });

        // Step 2: Update employee with new data
        const updateData = {
            full_name: testEmployee.full_name || testEmployee.name,
            fname: 'Updated',
            lname: 'TestName',
            email: testEmployee.email,
            mobile: '0987654321', // Changed
            sex: testEmployee.sex || 'M',
            age: 35, // Changed
            employee_type: 'trainer', // Changed
            qualification_level: 'Master Degree', // Changed
            competence_level: 'Level IV', // Changed
            citizen_address: '123 Test Street, Test City', // New
            occupation_on_training: 'Software Development Training', // New for trainer
            status: 'Active'
        };

        console.log('\n2. Updating employee...');
        console.log('📤 Update data:', updateData);

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
            console.log('✅ Employee update SUCCESSFUL!');
            console.log(`📊 Updated ${updateResponse.data.updated_fields} fields`);
        } else {
            console.log('❌ Employee update FAILED:', updateResponse.data.message);
            return;
        }

        // Step 3: Verify the update by fetching the employee again
        console.log('\n3. Verifying update...');
        const verifyResponse = await axios.get(`${API_BASE_URL}/api/getEmployees`);
        
        if (verifyResponse.data.success) {
            const updatedEmployee = verifyResponse.data.employees.find(emp => emp.employee_id === testEmployee.employee_id);
            
            if (updatedEmployee) {
                console.log('✅ Employee found after update');
                console.log('📋 Updated data:', {
                    name: updatedEmployee.full_name || updatedEmployee.name,
                    fname: updatedEmployee.fname,
                    lname: updatedEmployee.lname,
                    email: updatedEmployee.email,
                    mobile: updatedEmployee.mobile,
                    employee_type: updatedEmployee.employee_type,
                    age: updatedEmployee.age,
                    qualification_level: updatedEmployee.qualification_level,
                    competence_level: updatedEmployee.competence_level,
                    citizen_address: updatedEmployee.citizen_address,
                    occupation_on_training: updatedEmployee.occupation_on_training
                });

                // Verify specific changes
                const verifications = [
                    { field: 'mobile', expected: '0987654321', actual: updatedEmployee.mobile },
                    { field: 'age', expected: 35, actual: updatedEmployee.age },
                    { field: 'employee_type', expected: 'trainer', actual: updatedEmployee.employee_type },
                    { field: 'qualification_level', expected: 'Master Degree', actual: updatedEmployee.qualification_level }
                ];

                console.log('\n4. Field verification:');
                let allVerified = true;
                verifications.forEach(({ field, expected, actual }) => {
                    const isMatch = String(actual) === String(expected);
                    console.log(`${isMatch ? '✅' : '❌'} ${field}: expected "${expected}", got "${actual}"`);
                    if (!isMatch) allVerified = false;
                });

                if (allVerified) {
                    console.log('\n🎉 ALL TESTS PASSED! Employee update functionality is working correctly.');
                } else {
                    console.log('\n⚠️ Some field verifications failed. Check the database schema and update logic.');
                }
            } else {
                console.log('❌ Could not find updated employee in the list');
            }
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
testCompleteEmployeeUpdate();
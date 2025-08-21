// Test script for education office API endpoints
const { createCollege, getAllColleges } = require('./controllers/educationOfficeController');

// Mock request and response objects for testing
function createMockReq(body, user = { user_id: 21, role_id: 1 }) {
    return {
        body: body,
        user: user,
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' }
    };
}

function createMockRes() {
    const res = {
        statusCode: 200,
        responseData: null,
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            this.responseData = data;
            console.log(`📤 Response [${this.statusCode}]:`, JSON.stringify(data, null, 2));
            return this;
        }
    };
    return res;
}

async function testEducationAPI() {
    console.log('🧪 Testing Education Office API endpoints...\n');

    try {
        // Test 1: Get existing colleges
        console.log('1️⃣ Testing GET colleges...');
        const getReq = createMockReq({});
        const getRes = createMockRes();
        
        await getAllColleges(getReq, getRes);
        
        if (getRes.statusCode === 200 && getRes.responseData.success) {
            console.log('✅ GET colleges test passed');
            console.log(`📊 Found ${getRes.responseData.colleges.length} colleges`);
        } else {
            console.log('❌ GET colleges test failed');
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 2: Create a new college
        console.log('2️⃣ Testing CREATE college...');
        const createReq = createMockReq({
            college_name: 'Test API College',
            college_code: 'TAC001',
            location: 'Test City',
            college_type: 'technical',
            contact_email: 'test@college.edu',
            contact_phone: '+251-11-999-8888',
            description: 'Test college created via API'
        });
        const createRes = createMockRes();
        
        await createCollege(createReq, createRes);
        
        if (createRes.statusCode === 201 && createRes.responseData.success) {
            console.log('✅ CREATE college test passed');
            console.log(`🎉 Created college with ID: ${createRes.responseData.college_id}`);
        } else {
            console.log('❌ CREATE college test failed');
        }

        console.log('\n' + '='.repeat(50) + '\n');

        // Test 3: Get colleges again to verify creation
        console.log('3️⃣ Testing GET colleges after creation...');
        const getReq2 = createMockReq({});
        const getRes2 = createMockRes();
        
        await getAllColleges(getReq2, getRes2);
        
        if (getRes2.statusCode === 200 && getRes2.responseData.success) {
            console.log('✅ GET colleges after creation test passed');
            console.log(`📊 Now found ${getRes2.responseData.colleges.length} colleges`);
            
            // Check if our test college exists
            const testCollege = getRes2.responseData.colleges.find(c => c.college_code === 'TAC001');
            if (testCollege) {
                console.log('🎯 Test college found in results:', testCollege.college_name);
            }
        } else {
            console.log('❌ GET colleges after creation test failed');
        }

        console.log('\n🎉 All tests completed!');

    } catch (error) {
        console.error('❌ Test error:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the tests
testEducationAPI();

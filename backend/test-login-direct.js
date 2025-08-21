// Direct test of the login function
const { getLogin } = require('./models/LoginModel');

// Mock request and response objects
const mockReq = {
  body: {
    user_name: 'hayal@itp.it',
    pass: 'itp@123'
  },
  ip: '127.0.0.1',
  headers: {
    'user-agent': 'test-agent'
  }
};

const mockRes = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    console.log('Response Status:', this.statusCode);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    return this;
  }
};

console.log('🧪 Testing login function directly...');
console.log('📤 Request:', { user_name: mockReq.body.user_name, pass: '[HIDDEN]' });

getLogin(mockReq, mockRes)
  .then(() => {
    console.log('✅ Login function completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Login function error:', error);
    process.exit(1);
  });

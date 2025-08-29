const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🧪 Testing login with admin credentials...');
    
    // Test login
    const loginResponse = await axios.post('http://localhost:5001/login', {
      user_name: 'www',
      pass: 'itp@123'
    });
    
    console.log('✅ Login successful!');
    console.log('Full login response:', JSON.stringify(loginResponse.data, null, 2));
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    const userId = user?.user_id;
    
    console.log('Extracted info:', {
      user_id: userId,
      user_name: user?.user_name,
      role_id: user?.role_id,
      token: token ? 'Present' : 'Missing'
    });
    
    if (!token) {
      console.log('❌ No token received from login');
      return;
    }
    
    // Test menu API
    console.log('\n🧪 Testing menu API...');
    const menuResponse = await axios.get(`http://localhost:5001/api/menu/user-menu/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Menu API successful! Found ${menuResponse.data.length} root menu items:`);
    
    // Display menu structure
    const displayMenu = (items, indent = '') => {
      items.forEach(item => {
        console.log(`${indent}- ${item.label} (${item.name})`);
        if (item.children && item.children.length > 0) {
          displayMenu(item.children, indent + '  ');
        }
      });
    };
    
    displayMenu(menuResponse.data);
    
    // Test admin-only endpoints
    console.log('\n🧪 Testing admin endpoints...');
    
    try {
      const rolesResponse = await axios.get('http://localhost:5001/api/menu/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Roles API: Found ${rolesResponse.data.length} roles`);
    } catch (error) {
      console.log('❌ Roles API failed:', error.response?.data?.error || error.message);
    }
    
    try {
      const usersResponse = await axios.get('http://localhost:5001/api/menu/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Users API: Found ${usersResponse.data.length} users`);
    } catch (error) {
      console.log('❌ Users API failed:', error.response?.data?.error || error.message);
    }
    
    try {
      const menuItemsResponse = await axios.get('http://localhost:5001/api/menu/menu-items', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Menu Items API: Found ${menuItemsResponse.data.length} menu items`);
    } catch (error) {
      console.log('❌ Menu Items API failed:', error.response?.data?.error || error.message);
    }
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Instructions for browser testing:');
    console.log('1. Open http://localhost:3001 in your browser');
    console.log('2. Login with:');
    console.log('   Username: www');
    console.log('   Password: itp@123');
    console.log('3. You should see the full admin menu with all items');
    console.log('4. Navigate to "Menu Management" to test the admin interface');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

testLogin();
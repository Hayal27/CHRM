const axios = require('axios');

const debugFrontendLogin = async () => {
  try {
    console.log('🧪 Debugging frontend login flow...');
    
    // Step 1: Login like the frontend does
    console.log('\n1️⃣ Testing login...');
    const loginResponse = await axios.post('http://localhost:5001/login', {
      user_name: 'www',
      pass: 'itp@123'
    });
    
    console.log('✅ Login successful!');
    console.log('Login response structure:');
    console.log('- success:', loginResponse.data.success);
    console.log('- token:', loginResponse.data.token ? 'Present' : 'Missing');
    console.log('- user.user_id:', loginResponse.data.user?.user_id);
    console.log('- user.role_id:', loginResponse.data.user?.role_id);
    console.log('- user.user_name:', loginResponse.data.user?.user_name);
    
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user?.user_id;
    
    // Step 2: Test menu API with the exact same data the frontend would use
    console.log('\n2️⃣ Testing menu API...');
    console.log(`Making request to: /api/menu/user-menu/${userId}`);
    console.log(`With token: ${token ? 'Present' : 'Missing'}`);
    
    try {
      const menuResponse = await axios.get(`http://localhost:5001/api/menu/user-menu/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Menu API successful!');
      console.log('Menu response:');
      console.log('- Status:', menuResponse.status);
      console.log('- Data length:', menuResponse.data.length);
      console.log('- First few items:', menuResponse.data.slice(0, 3).map(item => ({
        name: item.name,
        label: item.label,
        children_count: item.children?.length || 0
      })));
      
    } catch (menuError) {
      console.log('❌ Menu API failed!');
      console.log('Error status:', menuError.response?.status);
      console.log('Error message:', menuError.response?.data?.error || menuError.message);
      console.log('Error details:', menuError.response?.data);
    }
    
    // Step 3: Check if the user exists in database
    console.log('\n3️⃣ Checking user in database...');
    try {
      const userCheckResponse = await axios.get(`http://localhost:5001/api/menu/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const user = userCheckResponse.data.find(u => u.user_id === userId);
      if (user) {
        console.log('✅ User found in database:');
        console.log('- user_id:', user.user_id);
        console.log('- user_name:', user.user_name);
        console.log('- role_id:', user.role_id);
        console.log('- role_name:', user.role_name);
      } else {
        console.log('❌ User not found in users list');
      }
    } catch (error) {
      console.log('❌ Failed to check users:', error.response?.data?.error || error.message);
    }
    
    // Step 4: Check role permissions
    console.log('\n4️⃣ Checking role permissions...');
    try {
      const roleId = loginResponse.data.user?.role_id;
      const rolePermResponse = await axios.get(`http://localhost:5001/api/menu/role-permissions/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const viewableItems = rolePermResponse.data.filter(item => item.can_view);
      console.log(`✅ Role ${roleId} has view permissions for ${viewableItems.length} items`);
      console.log('Sample viewable items:', viewableItems.slice(0, 3).map(item => item.name));
      
    } catch (error) {
      console.log('❌ Failed to check role permissions:', error.response?.data?.error || error.message);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
};

debugFrontendLogin();
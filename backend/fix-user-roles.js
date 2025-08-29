const db = require('./models/db');

const fixUserRoles = async () => {
  try {
    console.log('🔧 Fixing user roles...');
    
    // Check users with null role_id
    const [usersWithNullRole] = await db.pool.execute(
      'SELECT user_id, user_name, employee_id FROM users WHERE role_id IS NULL'
    );
    
    console.log(`Found ${usersWithNullRole.length} users with null role_id`);
    
    for (const user of usersWithNullRole) {
      console.log(`Fixing user: ${user.user_name} (ID: ${user.user_id})`);
      
      // Check if this user has an employee record with a role
      if (user.employee_id) {
        const [employee] = await db.pool.execute(
          'SELECT role_id FROM employees WHERE employee_id = ?',
          [user.employee_id]
        );
        
        if (employee.length > 0 && employee[0].role_id) {
          // Update user role_id from employee record
          await db.pool.execute(
            'UPDATE users SET role_id = ? WHERE user_id = ?',
            [employee[0].role_id, user.user_id]
          );
          console.log(`  ✅ Updated user ${user.user_name} to role_id: ${employee[0].role_id}`);
        } else {
          // Assign default role (role 3 - Admin Staff)
          await db.pool.execute(
            'UPDATE users SET role_id = ? WHERE user_id = ?',
            [3, user.user_id]
          );
          console.log(`  ✅ Assigned default role_id: 3 to user ${user.user_name}`);
        }
      } else {
        // No employee record, assign default role
        await db.pool.execute(
          'UPDATE users SET role_id = ? WHERE user_id = ?',
          [3, user.user_id]
        );
        console.log(`  ✅ Assigned default role_id: 3 to user ${user.user_name}`);
      }
    }
    
    // Now ensure all roles have basic menu permissions
    console.log('\n🔧 Ensuring all roles have basic menu permissions...');
    
    const [allRoles] = await db.pool.execute('SELECT DISTINCT role_id FROM users WHERE role_id IS NOT NULL');
    const basicMenus = ['hr-dashboard', 'employee', 'attendance', 'leave', 'recruitment', 'training'];
    
    for (const roleRow of allRoles) {
      const roleId = roleRow.role_id;
      console.log(`Checking permissions for role ${roleId}...`);
      
      const [menuItems] = await db.pool.execute(
        `SELECT id FROM menu_items WHERE name IN (${basicMenus.map(() => '?').join(',')})`,
        basicMenus
      );
      
      for (const menuItem of menuItems) {
        // Insert permission if it doesn't exist
        await db.pool.execute(`
          INSERT IGNORE INTO role_menu_permissions 
          (role_id, menu_item_id, can_view, can_create, can_edit, can_delete) 
          VALUES (?, ?, 1, 0, 0, 0)
        `, [roleId, menuItem.id]);
      }
      
      console.log(`  ✅ Basic permissions ensured for role ${roleId}`);
    }
    
    // Special permissions for admin role (role_id = 1)
    const [adminUsers] = await db.pool.execute('SELECT user_id FROM users WHERE role_id = 1');
    if (adminUsers.length > 0) {
      console.log('\n🔧 Setting admin permissions...');
      const [allMenuItems] = await db.pool.execute('SELECT id FROM menu_items');
      
      for (const menuItem of allMenuItems) {
        await db.pool.execute(`
          INSERT INTO role_menu_permissions 
          (role_id, menu_item_id, can_view, can_create, can_edit, can_delete) 
          VALUES (1, ?, 1, 1, 1, 1)
          ON DUPLICATE KEY UPDATE 
          can_view = 1, can_create = 1, can_edit = 1, can_delete = 1
        `, [menuItem.id]);
      }
      console.log('  ✅ Admin permissions set');
    }
    
    console.log('\n✅ User roles and permissions fixed!');
    
    // Test the menu query again
    console.log('\n🧪 Testing menu query after fixes...');
    const [testUser] = await db.pool.execute('SELECT user_id, role_id FROM users LIMIT 1');
    
    if (testUser.length > 0) {
      const user = testUser[0];
      console.log(`Testing with user_id: ${user.user_id}, role_id: ${user.role_id}`);
      
      const query = `
        SELECT DISTINCT
          mi.id,
          mi.name,
          mi.label,
          mi.icon,
          mi.path,
          mi.parent_id,
          mi.sort_order,
          COALESCE(ump.can_view, rmp.can_view, 0) as can_view
        FROM menu_items mi
        LEFT JOIN role_menu_permissions rmp ON mi.id = rmp.menu_item_id AND rmp.role_id = ?
        LEFT JOIN user_menu_permissions ump ON mi.id = ump.menu_item_id AND ump.user_id = ?
        WHERE mi.is_active = 1 
          AND (COALESCE(ump.can_view, rmp.can_view, 0) = 1)
        ORDER BY mi.sort_order, mi.name
      `;
      
      const [results] = await db.pool.execute(query, [user.role_id, user.user_id]);
      console.log(`📊 User menu items found: ${results.length}`);
      
      if (results.length > 0) {
        console.log('✅ Menu query working! Sample items:');
        results.slice(0, 5).forEach(item => {
          console.log(`  - ${item.name}: ${item.label}`);
        });
      } else {
        console.log('❌ Still no menu items found');
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing user roles:', error);
  } finally {
    process.exit(0);
  }
};

fixUserRoles();
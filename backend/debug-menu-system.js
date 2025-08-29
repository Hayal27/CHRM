const db = require('./models/db');

const debugMenuSystem = async () => {
  try {
    console.log('🔍 Debugging Menu System...');
    
    // Check if menu_items table exists and has data
    try {
      const [menuItems] = await db.pool.execute('SELECT COUNT(*) as count FROM menu_items');
      console.log(`📊 Menu items count: ${menuItems[0].count}`);
      
      if (menuItems[0].count === 0) {
        console.log('⚠️  No menu items found. Initializing...');
        await initializeMenuItems();
      } else {
        console.log('✅ Menu items exist');
        
        // Show some sample menu items
        const [sampleItems] = await db.pool.execute('SELECT id, name, label, is_active FROM menu_items LIMIT 5');
        console.log('📋 Sample menu items:');
        sampleItems.forEach(item => {
          console.log(`  - ${item.name}: ${item.label} (active: ${item.is_active})`);
        });
      }
    } catch (error) {
      console.log('❌ Menu items table does not exist. Creating...');
      await createMenuTables();
      await initializeMenuItems();
    }
    
    // Check role permissions
    try {
      const [rolePerms] = await db.pool.execute('SELECT COUNT(*) as count FROM role_menu_permissions');
      console.log(`📊 Role permissions count: ${rolePerms[0].count}`);
      
      if (rolePerms[0].count === 0) {
        console.log('⚠️  No role permissions found. Initializing...');
        await initializeRolePermissions();
      }
    } catch (error) {
      console.log('❌ Role permissions table does not exist. Creating...');
      await createMenuTables();
      await initializeRolePermissions();
    }
    
    // Test user menu query for a specific user
    console.log('\n🧪 Testing user menu query...');
    const [users] = await db.pool.execute('SELECT user_id, role_id FROM users LIMIT 1');
    
    if (users.length > 0) {
      const testUser = users[0];
      console.log(`Testing with user_id: ${testUser.user_id}, role_id: ${testUser.role_id}`);
      
      const query = `
        SELECT DISTINCT
          mi.id,
          mi.name,
          mi.label,
          mi.icon,
          mi.path,
          mi.parent_id,
          mi.sort_order,
          COALESCE(ump.can_view, rmp.can_view, 0) as can_view,
          COALESCE(ump.can_create, rmp.can_create, 0) as can_create,
          COALESCE(ump.can_edit, rmp.can_edit, 0) as can_edit,
          COALESCE(ump.can_delete, rmp.can_delete, 0) as can_delete
        FROM menu_items mi
        LEFT JOIN role_menu_permissions rmp ON mi.id = rmp.menu_item_id AND rmp.role_id = ?
        LEFT JOIN user_menu_permissions ump ON mi.id = ump.menu_item_id AND ump.user_id = ?
        WHERE mi.is_active = 1 
          AND (COALESCE(ump.can_view, rmp.can_view, 0) = 1)
        ORDER BY mi.sort_order, mi.name
      `;
      
      const [results] = await db.pool.execute(query, [testUser.role_id, testUser.user_id]);
      console.log(`📊 User menu items found: ${results.length}`);
      
      if (results.length === 0) {
        console.log('⚠️  No menu items found for user. Checking permissions...');
        
        // Check if role has any permissions
        const [roleCheck] = await db.pool.execute(
          'SELECT COUNT(*) as count FROM role_menu_permissions WHERE role_id = ?',
          [testUser.role_id]
        );
        console.log(`📊 Role permissions for role ${testUser.role_id}: ${roleCheck[0].count}`);
        
        if (roleCheck[0].count === 0) {
          console.log('⚠️  No permissions found for this role. Adding default permissions...');
          await addDefaultPermissionsForRole(testUser.role_id);
        }
      } else {
        console.log('✅ User has menu access');
        results.slice(0, 3).forEach(item => {
          console.log(`  - ${item.name}: ${item.label} (can_view: ${item.can_view})`);
        });
      }
    } else {
      console.log('❌ No users found in database');
    }
    
    console.log('\n✅ Menu system debug completed');
    
  } catch (error) {
    console.error('❌ Error debugging menu system:', error);
  } finally {
    process.exit(0);
  }
};

const createMenuTables = async () => {
  console.log('🔧 Creating menu tables...');
  
  // Create menu_items table
  await db.pool.execute(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id int(11) NOT NULL AUTO_INCREMENT,
      name varchar(100) NOT NULL,
      label varchar(100) NOT NULL,
      icon varchar(50) DEFAULT NULL,
      path varchar(255) DEFAULT NULL,
      parent_id int(11) DEFAULT NULL,
      sort_order int(11) DEFAULT 0,
      is_active tinyint(1) DEFAULT 1,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (id),
      UNIQUE KEY name (name),
      KEY parent_id (parent_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // Create role_menu_permissions table
  await db.pool.execute(`
    CREATE TABLE IF NOT EXISTS role_menu_permissions (
      id int(11) NOT NULL AUTO_INCREMENT,
      role_id int(11) NOT NULL,
      menu_item_id int(11) NOT NULL,
      can_view tinyint(1) DEFAULT 1,
      can_create tinyint(1) DEFAULT 0,
      can_edit tinyint(1) DEFAULT 0,
      can_delete tinyint(1) DEFAULT 0,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (id),
      UNIQUE KEY role_menu_unique (role_id, menu_item_id),
      KEY role_id (role_id),
      KEY menu_item_id (menu_item_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);

  // Create user_menu_permissions table
  await db.pool.execute(`
    CREATE TABLE IF NOT EXISTS user_menu_permissions (
      id int(11) NOT NULL AUTO_INCREMENT,
      user_id int(11) NOT NULL,
      menu_item_id int(11) NOT NULL,
      can_view tinyint(1) DEFAULT 1,
      can_create tinyint(1) DEFAULT 0,
      can_edit tinyint(1) DEFAULT 0,
      can_delete tinyint(1) DEFAULT 0,
      created_at timestamp NOT NULL DEFAULT current_timestamp(),
      updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
      PRIMARY KEY (id),
      UNIQUE KEY user_menu_unique (user_id, menu_item_id),
      KEY user_id (user_id),
      KEY menu_item_id (menu_item_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);
  
  console.log('✅ Menu tables created');
};

const initializeMenuItems = async () => {
  console.log('🔧 Initializing menu items...');
  
  const menuItems = [
    // Main Dashboard
    { name: 'hr-dashboard', label: 'HR Dashboard', icon: 'DashboardOutlined', path: '/hrms/dashboard', parent_id: null, sort_order: 1 },

    // Core HR Group
    { name: 'core-hr', label: 'Core HR', icon: 'SolutionOutlined', path: null, parent_id: null, sort_order: 2 },
    { name: 'employee', label: 'Employee Profiles', icon: 'IdcardOutlined', path: '/hrms/employee', parent_id: 2, sort_order: 1 },
    { name: 'enhanced-employee-profile', label: 'Enhanced Employee Profile', icon: 'UserOutlined', path: '/hrms/employee/enhanced', parent_id: 2, sort_order: 2 },
    { name: 'department-management', label: 'Department Management', icon: 'ApartmentOutlined', path: '/hrms/employee/departments', parent_id: 2, sort_order: 3 },
    { name: 'role-management', label: 'Role Management', icon: 'SafetyOutlined', path: '/hrms/employee/roles', parent_id: 2, sort_order: 4 },
    { name: 'attendance', label: 'Attendance', icon: 'CalendarOutlined', path: '/hrms/attendance', parent_id: 2, sort_order: 6 },
    { name: 'leave', label: 'Leave Management', icon: 'FileTextOutlined', path: '/hrms/leave', parent_id: 2, sort_order: 7 },

    // Talent Management Group
    { name: 'talent', label: 'Talent Management', icon: 'RiseOutlined', path: null, parent_id: null, sort_order: 3 },
    { name: 'recruitment', label: 'Recruitment', icon: 'TeamOutlined', path: '/hrms/recruitment', parent_id: 9, sort_order: 1 },
    { name: 'training', label: 'Training', icon: 'ReadOutlined', path: '/hrms/training', parent_id: 9, sort_order: 3 },

    // Admin Only
    { name: 'settings', label: 'Settings', icon: 'SettingOutlined', path: '/settings', parent_id: null, sort_order: 6 },
    { name: 'menu-management', label: 'Menu Management', icon: 'MenuOutlined', path: '/admin/menu-management', parent_id: null, sort_order: 8 },
  ];

  for (const item of menuItems) {
    try {
      await db.pool.execute(
        'INSERT IGNORE INTO menu_items (name, label, icon, path, parent_id, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
        [item.name, item.label, item.icon, item.path, item.parent_id, item.sort_order]
      );
    } catch (error) {
      console.log(`⚠️  Error inserting ${item.name}:`, error.message);
    }
  }
  
  console.log('✅ Menu items initialized');
};

const initializeRolePermissions = async () => {
  console.log('🔧 Initializing role permissions...');
  
  // Get all menu items
  const [menuItems] = await db.pool.execute('SELECT id FROM menu_items');
  const menuItemIds = menuItems.map(item => item.id);
  
  // Admin (Role 1) - Full access to everything
  for (const menuItemId of menuItemIds) {
    await db.pool.execute(
      'INSERT IGNORE INTO role_menu_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, 1, 1, 1, 1)',
      [1, menuItemId]
    );
  }
  
  // Other roles - Basic access to common items
  const commonMenus = ['hr-dashboard', 'employee', 'attendance', 'leave', 'recruitment', 'training'];
  const [commonItems] = await db.pool.execute(
    `SELECT id FROM menu_items WHERE name IN (${commonMenus.map(() => '?').join(',')})`,
    commonMenus
  );
  
  // Roles 2, 3, 4, 5, 7, 8 - Access to common menus
  for (const roleId of [2, 3, 4, 5, 7, 8]) {
    for (const item of commonItems) {
      await db.pool.execute(
        'INSERT IGNORE INTO role_menu_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, 1, 0, 0, 0)',
        [roleId, item.id]
      );
    }
  }
  
  console.log('✅ Role permissions initialized');
};

const addDefaultPermissionsForRole = async (roleId) => {
  console.log(`🔧 Adding default permissions for role ${roleId}...`);
  
  // Get basic menu items
  const basicMenus = ['hr-dashboard', 'employee', 'attendance', 'leave'];
  const [menuItems] = await db.pool.execute(
    `SELECT id FROM menu_items WHERE name IN (${basicMenus.map(() => '?').join(',')})`,
    basicMenus
  );
  
  for (const item of menuItems) {
    await db.pool.execute(
      'INSERT IGNORE INTO role_menu_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, 1, 0, 0, 0)',
      [roleId, item.id]
    );
  }
  
  console.log(`✅ Default permissions added for role ${roleId}`);
};

// Run the debug
debugMenuSystem();
const mysql = require('mysql2/promise');
require('dotenv').config();

const initMenuSystem = async () => {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hrms'
    });

    console.log('Connected to database');

    // Create menu_items table
    await connection.execute(`
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
        KEY parent_id (parent_id),
        FOREIGN KEY (parent_id) REFERENCES menu_items (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    // Create role_menu_permissions table
    await connection.execute(`
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
        KEY menu_item_id (menu_item_id),
        FOREIGN KEY (role_id) REFERENCES roles (role_id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    // Create user_menu_permissions table
    await connection.execute(`
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
        KEY menu_item_id (menu_item_id),
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    console.log('Tables created successfully');

    // Check if menu items already exist
    const [existingItems] = await connection.execute('SELECT COUNT(*) as count FROM menu_items');
    if (existingItems[0].count > 0) {
      console.log('Menu items already exist, skipping initialization');
      return;
    }

    // Insert default menu items
    const menuItems = [
      // Main Dashboard
      { name: 'hr-dashboard', label: 'HR Dashboard', icon: 'DashboardOutlined', path: '/hrms/dashboard', parent_id: null, sort_order: 1 },

      // Core HR Group
      { name: 'core-hr', label: 'Core HR', icon: 'SolutionOutlined', path: null, parent_id: null, sort_order: 2 },
      { name: 'employee', label: 'Employee Profiles', icon: 'IdcardOutlined', path: '/hrms/employee', parent_id: 2, sort_order: 1 },
      { name: 'enhanced-employee-profile', label: 'Enhanced Employee Profile', icon: 'UserOutlined', path: '/hrms/employee/enhanced', parent_id: 2, sort_order: 2 },
      { name: 'department-management', label: 'Department Management', icon: 'ApartmentOutlined', path: '/hrms/employee/departments', parent_id: 2, sort_order: 3 },
      { name: 'role-management', label: 'Role Management', icon: 'SafetyOutlined', path: '/hrms/employee/roles', parent_id: 2, sort_order: 4 },
      { name: 'enhanced-employee-registration', label: 'Enhanced Employee Registration', icon: 'UserAddOutlined', path: '/enhanced-employee-registration', parent_id: 2, sort_order: 5 },
      { name: 'attendance', label: 'Attendance', icon: 'CalendarOutlined', path: '/hrms/attendance', parent_id: 2, sort_order: 6 },
      { name: 'leave', label: 'Leave Management', icon: 'FileTextOutlined', path: '/hrms/leave', parent_id: 2, sort_order: 7 },
      { name: 'payroll', label: 'Payroll', icon: 'MoneyCollectOutlined', path: '/hrms/payroll', parent_id: 2, sort_order: 8 },

      // Talent Management Group
      { name: 'talent', label: 'Talent Management', icon: 'RiseOutlined', path: null, parent_id: null, sort_order: 3 },
      { name: 'recruitment', label: 'Recruitment', icon: 'TeamOutlined', path: '/hrms/recruitment', parent_id: 11, sort_order: 1 },
      { name: 'onboarding', label: 'Onboarding', icon: 'UserOutlined', path: '/hrms/onboarding', parent_id: 11, sort_order: 2 },
      { name: 'training', label: 'Training', icon: 'ReadOutlined', path: '/hrms/training', parent_id: 11, sort_order: 3 },
      { name: 'performance', label: 'Performance', icon: 'LineChartOutlined', path: '/hrms/performance', parent_id: 11, sort_order: 4 },
      { name: 'promotion', label: 'Promotion/Transfer', icon: 'SwapOutlined', path: '/hrms/promotion', parent_id: 11, sort_order: 5 },

      // Employee Lifecycle Group
      { name: 'lifecycle', label: 'Employee Lifecycle', icon: 'UserDeleteOutlined', path: null, parent_id: null, sort_order: 4 },
      { name: 'disciplinary', label: 'Disciplinary', icon: 'WarningOutlined', path: '/hrms/disciplinary', parent_id: 17, sort_order: 1 },
      { name: 'resignation', label: 'Resignation/Termination', icon: 'UserDeleteOutlined', path: '/hrms/resignation', parent_id: 17, sort_order: 2 },
      { name: 'archival', label: 'Archival/Ex-Employee', icon: 'InboxOutlined', path: '/hrms/archival', parent_id: 17, sort_order: 3 },

      // Admin Only
      { name: 'employees-admin', label: 'Employees', icon: 'UserOutlined', path: '/employees', parent_id: null, sort_order: 5 },
      { name: 'settings', label: 'Settings', icon: 'SettingOutlined', path: '/settings', parent_id: null, sort_order: 6 },
      { name: 'menu-access', label: 'Menu Access Control', icon: 'SettingOutlined', path: '/admin/menu-access', parent_id: null, sort_order: 7 },
      { name: 'menu-management', label: 'Menu Management', icon: 'MenuOutlined', path: '/admin/menu-management', parent_id: null, sort_order: 8 },

      // User Management
      { name: 'user-management', label: 'User Management', icon: 'TeamOutlined', path: null, parent_id: null, sort_order: 9 },
      { name: 'users', label: 'Users', icon: 'UserOutlined', path: '/admin/users', parent_id: 25, sort_order: 1 },
      { name: 'user-register', label: 'Register User', icon: 'UserAddOutlined', path: '/admin/users/register', parent_id: 25, sort_order: 2 },

      // Role 3 Specific Menus
      { name: 'my-profiles', label: 'My Profiles', icon: 'IdcardOutlined', path: '/hrms/employees', parent_id: null, sort_order: 10 },
      { name: 'my-attendances', label: 'My Attendances', icon: 'CalendarOutlined', path: '/hrms/attendances', parent_id: null, sort_order: 11 },
      { name: 'my-leaves', label: 'My Leaves', icon: 'FileTextOutlined', path: '/hrms/leaves', parent_id: null, sort_order: 12 },
      { name: 'my-trainings', label: 'My Trainings', icon: 'ReadOutlined', path: '/hrms/trainings', parent_id: null, sort_order: 13 },
      { name: 'my-disciplinarys', label: 'My Disciplinarys', icon: 'WarningOutlined', path: '/hrms/disciplinarys', parent_id: null, sort_order: 14 },
      { name: 'my-resignations', label: 'My Resignations', icon: 'UserDeleteOutlined', path: '/hrms/resignations', parent_id: null, sort_order: 15 }
    ];

    // Insert menu items in order (parents first)
    for (const item of menuItems) {
      await connection.execute(
        'INSERT INTO menu_items (name, label, icon, path, parent_id, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
        [item.name, item.label, item.icon, item.path, item.parent_id, item.sort_order]
      );
    }

    console.log('Menu items inserted successfully');

    // Get all menu items for permission setup
    const [allMenuItems] = await connection.execute('SELECT id FROM menu_items');
    const menuItemIds = allMenuItems.map(item => item.id);

    // Insert default role permissions
    const rolePermissions = [
      // Admin (Role 1) - Full access to everything
      { role_id: 1, permissions: menuItemIds.map(id => ({ menu_item_id: id, can_view: 1, can_create: 1, can_edit: 1, can_delete: 1 })) },
      
      // Academician (Role 2) - Access to most HR functions
      { role_id: 2, permissions: menuItemIds.filter(id => {
        // Exclude admin-only items
        const excludeItems = ['employees-admin', 'settings', 'menu-access', 'menu-management', 'users', 'user-register', 'my-profiles', 'my-attendances', 'my-leaves', 'my-trainings', 'my-disciplinarys', 'my-resignations'];
        return !excludeItems.some(name => menuItems.find(item => item.name === name && item.parent_id === null));
      }).map(id => ({ menu_item_id: id, can_view: 1, can_create: 1, can_edit: 1, can_delete: 0 })) },
      
      // Admin Staff (Role 3) - Limited access to own records
      { role_id: 3, permissions: menuItemIds.filter(id => {
        const allowedItems = ['hr-dashboard', 'my-profiles', 'my-attendances', 'my-leaves', 'my-trainings', 'my-disciplinarys', 'my-resignations'];
        return allowedItems.some(name => menuItems.find(item => item.name === name));
      }).map(id => ({ menu_item_id: id, can_view: 1, can_create: 0, can_edit: 1, can_delete: 0 })) }
    ];

    // Insert role permissions
    for (const rolePermission of rolePermissions) {
      for (const perm of rolePermission.permissions) {
        await connection.execute(
          'INSERT INTO role_menu_permissions (role_id, menu_item_id, can_view, can_create, can_edit, can_delete) VALUES (?, ?, ?, ?, ?, ?)',
          [rolePermission.role_id, perm.menu_item_id, perm.can_view, perm.can_create, perm.can_edit, perm.can_delete]
        );
      }
    }

    console.log('Role permissions inserted successfully');
    console.log('Menu system initialized successfully!');

  } catch (error) {
    console.error('Error initializing menu system:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run the initialization
initMenuSystem();
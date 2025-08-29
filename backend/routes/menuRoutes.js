const express = require('express');
const router = express.Router();
const db = require('../models/db');
const authenticateToken = require('../middleware/verifyToken');

// Helper function to execute queries
const executeQuery = async (query, params = []) => {
  return await db.pool.execute(query, params);
};

// Get all menu items
router.get('/menu-items', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        mi.*,
        parent.name as parent_name
      FROM menu_items mi
      LEFT JOIN menu_items parent ON mi.parent_id = parent.id
      ORDER BY mi.sort_order, mi.name
    `;
    
    const [results] = await executeQuery(query);
    res.json(results);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Get menu items for a specific user (with permissions)
router.get('/user-menu/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Fetching menu for user ID: ${userId}`);
    
    // Get user's role
    const [userResult] = await executeQuery(
      'SELECT role_id, user_name FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (userResult.length === 0) {
      console.log(`User not found: ${userId}`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    let roleId = userResult[0].role_id;
    const userName = userResult[0].user_name;
    console.log(`User: ${userName}, Role ID: ${roleId}`);
    
    // Handle null role_id
    if (!roleId) {
      console.log(`User ${userName} has null role_id, assigning default role 3`);
      await executeQuery('UPDATE users SET role_id = 3 WHERE user_id = ?', [userId]);
      // Ensure basic permissions for role 3
      const basicMenus = ['hr-dashboard', 'employee', 'attendance', 'leave'];
      const [menuItems] = await executeQuery(
        `SELECT id FROM menu_items WHERE name IN (${basicMenus.map(() => '?').join(',')})`,
        basicMenus
      );
      
      for (const menuItem of menuItems) {
        await executeQuery(`
          INSERT IGNORE INTO role_menu_permissions 
          (role_id, menu_item_id, can_view, can_create, can_edit, can_delete) 
          VALUES (3, ?, 1, 0, 0, 0)
        `, [menuItem.id]);
      }
      
      // Use role 3 for the query
      roleId = 3;
    }
    
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
    
    const [results] = await executeQuery(query, [roleId, userId]);
    console.log(`Found ${results.length} menu items for user ${userName}`);
    
    // If no results and user is admin, ensure admin has all permissions
    if (results.length === 0 && roleId === 1) {
      console.log('Admin user has no menu items, fixing permissions...');
      const [allMenuItems] = await executeQuery('SELECT id FROM menu_items WHERE is_active = 1');
      
      for (const menuItem of allMenuItems) {
        await executeQuery(`
          INSERT INTO role_menu_permissions 
          (role_id, menu_item_id, can_view, can_create, can_edit, can_delete) 
          VALUES (1, ?, 1, 1, 1, 1)
          ON DUPLICATE KEY UPDATE 
          can_view = 1, can_create = 1, can_edit = 1, can_delete = 1
        `, [menuItem.id]);
      }
      
      // Re-run the query
      const [newResults] = await executeQuery(query, [roleId, userId]);
      console.log(`After fixing admin permissions: ${newResults.length} menu items`);
      results.length = 0;
      results.push(...newResults);
    }
    
    // Build hierarchical menu structure
    const menuMap = new Map();
    const rootItems = [];
    
    // First pass: create all items
    results.forEach(item => {
      menuMap.set(item.id, {
        ...item,
        children: []
      });
    });
    
    // Second pass: build hierarchy
    results.forEach(item => {
      if (item.parent_id) {
        const parent = menuMap.get(item.parent_id);
        if (parent) {
          parent.children.push(menuMap.get(item.id));
        }
      } else {
        rootItems.push(menuMap.get(item.id));
      }
    });
    
    console.log(`Returning ${rootItems.length} root menu items`);
    res.json(rootItems);
  } catch (error) {
    console.error('Error fetching user menu:', error);
    res.status(500).json({ error: 'Failed to fetch user menu' });
  }
});

// Create new menu item (Admin only)
router.post('/menu-items', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role_id !== 1) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    const { name, label, icon, path, parent_id, sort_order } = req.body;
    
    if (!name || !label) {
      return res.status(400).json({ error: 'Name and label are required' });
    }
    
    const query = `
      INSERT INTO menu_items (name, label, icon, path, parent_id, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await executeQuery(query, [
      name, label, icon || null, path || null, parent_id || null, sort_order || 0
    ]);
    
    res.status(201).json({
      message: 'Menu item created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Menu item with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create menu item' });
    }
  }
});

// Update menu item (Admin only)
router.put('/menu-items/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role_id !== 1) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    const { id } = req.params;
    const { name, label, icon, path, parent_id, sort_order, is_active } = req.body;
    
    const query = `
      UPDATE menu_items 
      SET name = ?, label = ?, icon = ?, path = ?, parent_id = ?, sort_order = ?, is_active = ?
      WHERE id = ?
    `;
    
    const [result] = await executeQuery(query, [
      name, label, icon || null, path || null, parent_id || null, 
      sort_order || 0, is_active !== undefined ? is_active : 1, id
    ]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json({ message: 'Menu item updated successfully' });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete menu item (Admin only)
router.delete('/menu-items/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role_id !== 1) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    const { id } = req.params;
    
    // Check if menu item has children
    const [children] = await executeQuery(
      'SELECT COUNT(*) as count FROM menu_items WHERE parent_id = ?',
      [id]
    );
    
    if (children[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete menu item with children. Delete children first.' 
      });
    }
    
    const [result] = await executeQuery('DELETE FROM menu_items WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// Get role permissions for all menu items
router.get('/role-permissions/:roleId', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role_id !== 1) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    const { roleId } = req.params;
    
    const query = `
      SELECT 
        mi.id,
        mi.name,
        mi.label,
        mi.parent_id,
        COALESCE(rmp.can_view, 0) as can_view,
        COALESCE(rmp.can_create, 0) as can_create,
        COALESCE(rmp.can_edit, 0) as can_edit,
        COALESCE(rmp.can_delete, 0) as can_delete
      FROM menu_items mi
      LEFT JOIN role_menu_permissions rmp ON mi.id = rmp.menu_item_id AND rmp.role_id = ?
      WHERE mi.is_active = 1
      ORDER BY mi.sort_order, mi.name
    `;
    
    const [results] = await executeQuery(query, [roleId]);
    res.json(results);
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    res.status(500).json({ error: 'Failed to fetch role permissions' });
  }
});

// Update role permissions
router.post('/role-permissions', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role_id !== 1) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    const { roleId, permissions } = req.body;
    
    if (!roleId || !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Role ID and permissions array are required' });
    }
    
    // Get connection for transaction
    const connection = await db.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Delete existing permissions for this role
      await connection.execute('DELETE FROM role_menu_permissions WHERE role_id = ?', [roleId]);
      
      // Insert new permissions
      for (const perm of permissions) {
        if (perm.can_view || perm.can_create || perm.can_edit || perm.can_delete) {
          await connection.execute(`
            INSERT INTO role_menu_permissions 
            (role_id, menu_item_id, can_view, can_create, can_edit, can_delete)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            roleId, perm.menu_item_id, 
            perm.can_view ? 1 : 0,
            perm.can_create ? 1 : 0,
            perm.can_edit ? 1 : 0,
            perm.can_delete ? 1 : 0
          ]);
        }
      }
      
      await connection.commit();
      res.json({ message: 'Role permissions updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating role permissions:', error);
    res.status(500).json({ error: 'Failed to update role permissions' });
  }
});

// Get user-specific permissions
router.get('/user-permissions/:userId', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin or requesting their own permissions
    if (req.user.role_id !== 1 && req.user.user_id !== parseInt(req.params.userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { userId } = req.params;
    
    const query = `
      SELECT 
        mi.id,
        mi.name,
        mi.label,
        mi.parent_id,
        COALESCE(ump.can_view, 0) as can_view,
        COALESCE(ump.can_create, 0) as can_create,
        COALESCE(ump.can_edit, 0) as can_edit,
        COALESCE(ump.can_delete, 0) as can_delete
      FROM menu_items mi
      LEFT JOIN user_menu_permissions ump ON mi.id = ump.menu_item_id AND ump.user_id = ?
      WHERE mi.is_active = 1
      ORDER BY mi.sort_order, mi.name
    `;
    
    const [results] = await executeQuery(query, [userId]);
    res.json(results);
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ error: 'Failed to fetch user permissions' });
  }
});

// Update user-specific permissions (Admin only)
router.post('/user-permissions', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role_id !== 1) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    const { userId, permissions } = req.body;
    
    if (!userId || !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'User ID and permissions array are required' });
    }
    
    // Get connection for transaction
    const connection = await db.pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Delete existing user permissions
      await connection.execute('DELETE FROM user_menu_permissions WHERE user_id = ?', [userId]);
      
      // Insert new permissions
      for (const perm of permissions) {
        if (perm.can_view || perm.can_create || perm.can_edit || perm.can_delete) {
          await connection.execute(`
            INSERT INTO user_menu_permissions 
            (user_id, menu_item_id, can_view, can_create, can_edit, can_delete)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            userId, perm.menu_item_id,
            perm.can_view ? 1 : 0,
            perm.can_create ? 1 : 0,
            perm.can_edit ? 1 : 0,
            perm.can_delete ? 1 : 0
          ]);
        }
      }
      
      await connection.commit();
      res.json({ message: 'User permissions updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating user permissions:', error);
    res.status(500).json({ error: 'Failed to update user permissions' });
  }
});

// Get all roles
router.get('/roles', authenticateToken, async (req, res) => {
  try {
    const [results] = await executeQuery(
      'SELECT role_id, role_name, status FROM roles ORDER BY role_name'
    );
    res.json(results);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// Get all users with their roles
router.get('/users', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role_id !== 1) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    const query = `
      SELECT 
        u.user_id,
        u.user_name,
        u.status,
        u.role_id,
        r.role_name,
        e.name as employee_name,
        e.email
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      LEFT JOIN employees e ON u.employee_id = e.employee_id
      ORDER BY u.user_name
    `;
    
    const [results] = await executeQuery(query);
    res.json(results);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
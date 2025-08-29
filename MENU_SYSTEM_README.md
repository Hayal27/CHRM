# Menu Privilege Management System

This document describes the comprehensive menu privilege management system implemented in the CHRM application.

## Overview

The system provides dynamic, role-based menu access control where administrators can:
- Create and manage menu items
- Set role-based permissions for menu access
- Override permissions for specific users
- Control CRUD operations (Create, Read, Update, Delete) for each menu item

## Database Structure

### Tables

1. **menu_items** - Stores all available menu items
   - `id` - Primary key
   - `name` - Unique identifier for the menu item
   - `label` - Display name
   - `icon` - Icon name (from Ant Design icons)
   - `path` - Route path
   - `parent_id` - For hierarchical menus
   - `sort_order` - Display order
   - `is_active` - Enable/disable menu item

2. **role_menu_permissions** - Role-based permissions
   - `role_id` - Foreign key to roles table
   - `menu_item_id` - Foreign key to menu_items table
   - `can_view` - View permission
   - `can_create` - Create permission
   - `can_edit` - Edit permission
   - `can_delete` - Delete permission

3. **user_menu_permissions** - User-specific permission overrides
   - `user_id` - Foreign key to users table
   - `menu_item_id` - Foreign key to menu_items table
   - `can_view` - View permission
   - `can_create` - Create permission
   - `can_edit` - Edit permission
   - `can_delete` - Delete permission

## API Endpoints

### Menu Items Management
- `GET /api/menu/menu-items` - Get all menu items
- `POST /api/menu/menu-items` - Create new menu item (Admin only)
- `PUT /api/menu/menu-items/:id` - Update menu item (Admin only)
- `DELETE /api/menu/menu-items/:id` - Delete menu item (Admin only)

### User Menu
- `GET /api/menu/user-menu/:userId` - Get user's accessible menu items with permissions

### Role Permissions
- `GET /api/menu/role-permissions/:roleId` - Get role permissions for all menu items
- `POST /api/menu/role-permissions` - Update role permissions (Admin only)

### User Permissions
- `GET /api/menu/user-permissions/:userId` - Get user-specific permissions
- `POST /api/menu/user-permissions` - Update user-specific permissions (Admin only)

### Utility Endpoints
- `GET /api/menu/roles` - Get all roles
- `GET /api/menu/users` - Get all users with role information (Admin only)

## Frontend Components

### DynamicSidebar
- Fetches user's menu items from API
- Renders hierarchical menu structure
- Handles navigation based on menu permissions

### MenuManagement (Admin Component)
- **Menu Items Tab**: Create, edit, delete menu items
- **Role Permissions Tab**: Set permissions for each role
- **User Permissions Tab**: Override permissions for specific users

## Permission Logic

1. **User menu access** is determined by:
   - User-specific permissions (if set) override role permissions
   - Role-based permissions (default)
   - Menu item must be active (`is_active = 1`)

2. **Permission hierarchy**:
   - User permissions > Role permissions > Default (no access)

3. **CRUD permissions**:
   - `can_view`: User can see the menu item
   - `can_create`: User can create new records in this module
   - `can_edit`: User can edit existing records
   - `can_delete`: User can delete records

## Default Role Permissions

### Admin (Role 1)
- Full access to all menu items
- Can manage menu system and permissions

### Academician (Role 2)
- Access to most HR functions
- Cannot access admin-only features (settings, menu management)
- Cannot delete records

### Admin Staff (Role 3)
- Limited access to personal records only
- Can view: HR Dashboard, My Profiles, My Attendances, My Leaves, My Trainings, My Disciplinary, My Resignations
- Can edit own records but cannot create or delete

### Other Roles (4-8)
- Can be configured through the admin interface
- Default permissions can be set via the Menu Management component

## Usage Instructions

### For Administrators

1. **Access Menu Management**:
   - Navigate to `/admin/menu-management`
   - Only available to users with Admin role (role_id = 1)

2. **Managing Menu Items**:
   - Add new menu items with name, label, icon, path
   - Set parent-child relationships for hierarchical menus
   - Control sort order and active status

3. **Setting Role Permissions**:
   - Select a role from the dropdown
   - Check/uncheck permissions for each menu item
   - Save changes to apply to all users with that role

4. **User-Specific Permissions**:
   - Select a user from the dropdown
   - Override role permissions for specific users
   - Useful for temporary access or special cases

### For Developers

1. **Adding New Menu Items**:
   ```javascript
   // Add to database via API or directly
   {
     name: 'new-feature',
     label: 'New Feature',
     icon: 'FeatureOutlined',
     path: '/new-feature',
     parent_id: null, // or parent menu ID
     sort_order: 10
   }
   ```

2. **Checking Permissions in Components**:
   ```javascript
   // The DynamicSidebar automatically handles menu visibility
   // For component-level permissions, you can fetch user permissions
   const userMenu = await axios.get(`/api/menu/user-menu/${userId}`);
   ```

3. **Adding New Routes**:
   - Add route to App.tsx with appropriate ProtectedRoute wrapper
   - Ensure menu item path matches the route path

## Security Features

1. **Authentication Required**: All menu API endpoints require valid JWT token
2. **Role-Based Access**: Admin-only endpoints check user role
3. **SQL Injection Protection**: All queries use parameterized statements
4. **Foreign Key Constraints**: Maintain data integrity
5. **Cascade Deletes**: Automatically clean up permissions when items are deleted

## Troubleshooting

### Common Issues

1. **Menu not showing**: Check if menu item is active and user has view permission
2. **Permission changes not reflecting**: Clear browser cache and re-login
3. **Database errors**: Ensure all foreign key relationships are valid

### Debugging

1. Check browser console for API errors
2. Verify JWT token is valid and not expired
3. Check database for correct permission entries
4. Ensure menu item paths match route definitions

## Future Enhancements

1. **Menu Item Templates**: Pre-defined menu structures for common roles
2. **Bulk Permission Management**: Apply permissions to multiple roles at once
3. **Permission History**: Track changes to permissions over time
4. **Menu Analytics**: Track menu usage and access patterns
5. **Dynamic Icons**: Upload custom icons for menu items
6. **Menu Themes**: Different menu layouts and styles
7. **Permission Inheritance**: Child menus inherit parent permissions
8. **Time-based Permissions**: Temporary access with expiration dates

## Installation and Setup

1. **Database Setup**: Run `node init-menu-system.js` to create tables and default data
2. **Backend**: Menu routes are automatically included in server.js
3. **Frontend**: DynamicSidebar is integrated into MainLayout
4. **Admin Access**: Login with admin role to access menu management

## Support

For issues or questions regarding the menu system:
1. Check this documentation
2. Review API endpoint responses for error messages
3. Check database constraints and foreign key relationships
4. Verify user roles and permissions in the database
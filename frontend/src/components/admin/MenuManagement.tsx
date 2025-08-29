import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Space,
  message,
  Popconfirm,
  Typography,
  Row,
  Col,
  Tabs,
  Checkbox,
  Tag,
  Tree,
  Divider,
  Badge,
  Tooltip,
  Avatar,
  Statistic,
  Progress,
  Alert,
  Empty,
  Spin,
  Drawer,
  Timeline,
  List
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  MenuOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  SettingOutlined,
  SafetyOutlined,
  BranchesOutlined,
  AppstoreOutlined,
  ReloadOutlined,
  ExportOutlined,
  ImportOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  FolderOutlined,
  FileOutlined,
  LockOutlined,
  UnlockOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import axios from 'axios';
import * as XLSX from 'xlsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Search } = Input;

interface MenuItem {
  id: number;
  name: string;
  label: string;
  icon?: string;
  path?: string;
  parent_id?: number;
  sort_order: number;
  is_active: boolean;
  parent_name?: string;
  created_at?: string;
  updated_at?: string;
  children?: MenuItem[];
}

interface Role {
  role_id: number;
  role_name: string;
  status: number;
}

interface User {
  user_id: number;
  user_name: string;
  employee_name: string;
  role_id: number;
  role_name: string;
  status: string;
}

interface Permission {
  id: number;
  name: string;
  label: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface MenuStats {
  totalMenus: number;
  activeMenus: number;
  inactiveMenus: number;
  parentMenus: number;
  childMenus: number;
}

const MenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [menuStats, setMenuStats] = useState<MenuStats>({
    totalMenus: 0,
    activeMenus: 0,
    inactiveMenus: 0,
    parentMenus: 0,
    childMenus: 0
  });
  const [form] = Form.useForm();
  
  // Filter states
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('sort_order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchMenuItems();
    fetchRoles();
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [menuItems, searchText, statusFilter, typeFilter, sortBy, sortOrder]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/menu/menu-items`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const menuData = Array.isArray(response.data) ? response.data : [];
      console.log('Menu items fetched:', menuData.length);
      setMenuItems(menuData);
      calculateStats(menuData);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      message.error('Failed to fetch menu items');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/menu/roles`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const rolesData = Array.isArray(response.data) ? response.data : [];
      console.log('Roles fetched:', rolesData.length);
      setRoles(rolesData);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/menu/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const usersData = Array.isArray(response.data) ? response.data : [];
      console.log('Users fetched:', usersData.length);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchRolePermissions = async (roleId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/menu/role-permissions/${roleId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const permissionsData = Array.isArray(response.data) ? response.data : [];
      console.log('Role permissions fetched:', permissionsData.length);
      setRolePermissions(permissionsData);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      message.error('Failed to fetch role permissions');
      setRolePermissions([]);
    }
  };

  const fetchUserPermissions = async (userId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/menu/user-permissions/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const permissionsData = Array.isArray(response.data) ? response.data : [];
      console.log('User permissions fetched:', permissionsData.length);
      setUserPermissions(permissionsData);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      message.error('Failed to fetch user permissions');
      setUserPermissions([]);
    }
  };

  const calculateStats = (data: MenuItem[]) => {
    const stats = {
      totalMenus: data.length,
      activeMenus: data.filter(item => item.is_active).length,
      inactiveMenus: data.filter(item => !item.is_active).length,
      parentMenus: data.filter(item => !item.parent_id).length,
      childMenus: data.filter(item => item.parent_id).length
    };
    setMenuStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...menuItems];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.label.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.path && item.path.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => 
        statusFilter === 'active' ? item.is_active : !item.is_active
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => 
        typeFilter === 'parent' ? !item.parent_id : !!item.parent_id
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof MenuItem];
      let bValue = b[sortBy as keyof MenuItem];
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredMenuItems(filtered);
  };

  const showAddModal = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      is_active: true,
      sort_order: 0
    });
    setModalVisible(true);
  };

  const showEditModal = (item: MenuItem) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setModalVisible(true);
  };

  const showMenuDetails = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setDrawerVisible(true);
  };

  const triggerSidebarRefresh = () => {
    // Trigger sidebar refresh for newly created/updated menus
    window.dispatchEvent(new CustomEvent('menuUpdated'));
    console.log('Menu update event dispatched');
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingItem) {
        await axios.put(`${API_BASE_URL}/api/menu/menu-items/${editingItem.id}`, values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        message.success('Menu item updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/api/menu/menu-items`, values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        message.success('Menu item created successfully');
      }
      
      setModalVisible(false);
      await fetchMenuItems(); // Refresh the list
      triggerSidebarRefresh(); // Refresh sidebar
    } catch (error) {
      console.error('Error saving menu item:', error);
      message.error('Failed to save menu item');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/menu/menu-items/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Menu item deleted successfully');
      await fetchMenuItems(); // Refresh the list
      triggerSidebarRefresh(); // Refresh sidebar
    } catch (error) {
      console.error('Error deleting menu item:', error);
      message.error('Failed to delete menu item');
    }
  };

  const handleRolePermissionChange = (menuItemId: number, permission: string, value: boolean) => {
    setRolePermissions(prev => 
      Array.isArray(prev) ? prev.map(item => 
        item.id === menuItemId 
          ? { ...item, [permission]: value }
          : item
      ) : []
    );
  };

  const handleUserPermissionChange = (menuItemId: number, permission: string, value: boolean) => {
    setUserPermissions(prev => 
      Array.isArray(prev) ? prev.map(item => 
        item.id === menuItemId 
          ? { ...item, [permission]: value }
          : item
      ) : []
    );
  };

  const saveRolePermissions = async () => {
    if (!selectedRole) return;
    
    try {
      const permissions = Array.isArray(rolePermissions) ? rolePermissions.map(item => ({
        menu_item_id: item.id,
        can_view: item.can_view,
        can_create: item.can_create,
        can_edit: item.can_edit,
        can_delete: item.can_delete
      })) : [];

      await axios.post(`${API_BASE_URL}/api/menu/role-permissions`, {
        roleId: selectedRole,
        permissions
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      message.success('Role permissions updated successfully');
      triggerSidebarRefresh(); // Refresh sidebar when permissions change
    } catch (error) {
      console.error('Error updating role permissions:', error);
      message.error('Failed to update role permissions');
    }
  };

  const saveUserPermissions = async () => {
    if (!selectedUser) return;
    
    try {
      const permissions = Array.isArray(userPermissions) ? userPermissions.map(item => ({
        menu_item_id: item.id,
        can_view: item.can_view,
        can_create: item.can_create,
        can_edit: item.can_edit,
        can_delete: item.can_delete
      })) : [];

      await axios.post(`${API_BASE_URL}/api/menu/user-permissions`, {
        userId: selectedUser,
        permissions
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      message.success('User permissions updated successfully');
      triggerSidebarRefresh(); // Refresh sidebar when permissions change
    } catch (error) {
      console.error('Error updating user permissions:', error);
      message.error('Failed to update user permissions');
    }
  };

  const exportToExcel = () => {
    const exportData = filteredMenuItems.map(item => ({
      'Name': item.name,
      'Label': item.label,
      'Icon': item.icon || '',
      'Path': item.path || '',
      'Parent': item.parent_name || 'Root',
      'Sort Order': item.sort_order,
      'Status': item.is_active ? 'Active' : 'Inactive',
      'Created': item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
      'Updated': item.updated_at ? new Date(item.updated_at).toLocaleDateString() : ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Menu Items');
    XLSX.writeFile(wb, 'menu-items.xlsx');
    message.success('Menu items exported successfully');
  };

  const resetFilters = () => {
    setSearchText('');
    setStatusFilter('all');
    setTypeFilter('all');
    setSortBy('sort_order');
    setSortOrder('asc');
  };

  const buildTreeData = (items: MenuItem[]): any[] => {
    const itemMap = new Map();
    const roots: any[] = [];

    // Create map of all items
    items.forEach(item => {
      itemMap.set(item.id, {
        key: item.id,
        title: (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>
              {item.parent_id ? <FileOutlined /> : <FolderOutlined />}
              <span style={{ marginLeft: 8 }}>{item.label}</span>
              <Tag color={item.is_active ? 'green' : 'red'} style={{ marginLeft: 8 }}>
                {item.is_active ? 'Active' : 'Inactive'}
              </Tag>
            </span>
            <Space>
              <Button size="small" icon={<EyeOutlined />} onClick={() => showMenuDetails(item)} />
              <Button size="small" icon={<EditOutlined />} onClick={() => showEditModal(item)} />
              <Popconfirm
                title="Delete this menu item?"
                onConfirm={() => handleDelete(item.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button size="small" icon={<DeleteOutlined />} danger />
              </Popconfirm>
            </Space>
          </div>
        ),
        children: [],
        data: item
      });
    });

    // Build tree structure
    items.forEach(item => {
      const node = itemMap.get(item.id);
      if (item.parent_id && itemMap.has(item.parent_id)) {
        itemMap.get(item.parent_id).children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const columns = [
    {
      title: 'Menu Item',
      key: 'menu',
      render: (record: MenuItem) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {record.parent_id ? (
            <FileOutlined style={{ color: '#1890ff', marginRight: 8 }} />
          ) : (
            <FolderOutlined style={{ color: '#52c41a', marginRight: 8 }} />
          )}
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.label}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.name}
            </Text>
          </div>
        </div>
      ),
      sorter: (a: MenuItem, b: MenuItem) => a.label.localeCompare(b.label),
    },
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path',
      render: (path: string) => (
        <Text code style={{ fontSize: '12px' }}>
          {path || 'No path'}
        </Text>
      ),
    },
    {
      title: 'Parent',
      dataIndex: 'parent_name',
      key: 'parent_name',
      render: (parent: string) => (
        parent ? (
          <Tag color="blue">{parent}</Tag>
        ) : (
          <Tag color="green">Root</Tag>
        )
      ),
    },
    {
      title: 'Order',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 80,
      sorter: (a: MenuItem, b: MenuItem) => a.sort_order - b.sort_order,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Badge
          status={active ? 'success' : 'error'}
          text={active ? 'Active' : 'Inactive'}
        />
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value: any, record: MenuItem) => record.is_active === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: MenuItem) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => showMenuDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              icon={<EditOutlined />} 
              size="small"
              type="primary"
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete this menu item?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button 
                icon={<DeleteOutlined />} 
                size="small" 
                danger
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  const permissionColumns = [
    {
      title: 'Menu Item',
      dataIndex: 'label',
      key: 'label',
      render: (text: string, record: Permission) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.name}
          </Text>
        </div>
      ),
    },
    {
      title: 'View',
      key: 'can_view',
      align: 'center' as const,
      render: (_: any, record: Permission) => (
        <Checkbox
          checked={record.can_view}
          onChange={(e) => handleRolePermissionChange(record.id, 'can_view', e.target.checked)}
        />
      )
    },
    {
      title: 'Create',
      key: 'can_create',
      align: 'center' as const,
      render: (_: any, record: Permission) => (
        <Checkbox
          checked={record.can_create}
          onChange={(e) => handleRolePermissionChange(record.id, 'can_create', e.target.checked)}
        />
      )
    },
    {
      title: 'Edit',
      key: 'can_edit',
      align: 'center' as const,
      render: (_: any, record: Permission) => (
        <Checkbox
          checked={record.can_edit}
          onChange={(e) => handleRolePermissionChange(record.id, 'can_edit', e.target.checked)}
        />
      )
    },
    {
      title: 'Delete',
      key: 'can_delete',
      align: 'center' as const,
      render: (_: any, record: Permission) => (
        <Checkbox
          checked={record.can_delete}
          onChange={(e) => handleRolePermissionChange(record.id, 'can_delete', e.target.checked)}
        />
      )
    }
  ];

  const userPermissionColumns = [
    {
      title: 'Menu Item',
      dataIndex: 'label',
      key: 'label',
      render: (text: string, record: Permission) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.name}
          </Text>
        </div>
      ),
    },
    {
      title: 'View',
      key: 'can_view',
      align: 'center' as const,
      render: (_: any, record: Permission) => (
        <Checkbox
          checked={record.can_view}
          onChange={(e) => handleUserPermissionChange(record.id, 'can_view', e.target.checked)}
        />
      )
    },
    {
      title: 'Create',
      key: 'can_create',
      align: 'center' as const,
      render: (_: any, record: Permission) => (
        <Checkbox
          checked={record.can_create}
          onChange={(e) => handleUserPermissionChange(record.id, 'can_create', e.target.checked)}
        />
      )
    },
    {
      title: 'Edit',
      key: 'can_edit',
      align: 'center' as const,
      render: (_: any, record: Permission) => (
        <Checkbox
          checked={record.can_edit}
          onChange={(e) => handleUserPermissionChange(record.id, 'can_edit', e.target.checked)}
        />
      )
    },
    {
      title: 'Delete',
      key: 'can_delete',
      align: 'center' as const,
      render: (_: any, record: Permission) => (
        <Checkbox
          checked={record.can_delete}
          onChange={(e) => handleUserPermissionChange(record.id, 'can_delete', e.target.checked)}
        />
      )
    }
  ];

  // Ensure all data sources are arrays
  const safeMenuItems = Array.isArray(filteredMenuItems) ? filteredMenuItems : [];
  const safeRoles = Array.isArray(roles) ? roles : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeRolePermissions = Array.isArray(rolePermissions) ? rolePermissions : [];
  const safeUserPermissions = Array.isArray(userPermissions) ? userPermissions : [];
  const parentMenuItems = Array.isArray(menuItems) ? menuItems.filter(item => !item.parent_id) : [];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Section */}
      <Row gutter={[0, 24]}>
        <Col span={24}>
          <Card className="header-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
            <Row align="middle" justify="space-between">
              <Col>
                <Title level={2} style={{ color: 'white', margin: 0 }}>
                  <MenuOutlined style={{ marginRight: 12 }} />
                  Menu Management System
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0' }}>
                  Manage your application menu structure, permissions, and access control
                </Paragraph>
              </Col>
              <Col>
                <Space size="large">
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={fetchMenuItems}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white' }}
                  >
                    Refresh
                  </Button>
                  <Button 
                    icon={<ExportOutlined />} 
                    onClick={exportToExcel}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white' }}
                  >
                    Export
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={showAddModal}
                    size="large"
                    style={{ background: '#52c41a', border: 'none' }}
                  >
                    Add Menu Item
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Statistics Cards */}
        <Col span={24}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6} lg={4} xl={4}>
              <Card>
                <Statistic
                  title="Total Menus"
                  value={menuStats.totalMenus}
                  prefix={<AppstoreOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4} xl={4}>
              <Card>
                <Statistic
                  title="Active Menus"
                  value={menuStats.activeMenus}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4} xl={4}>
              <Card>
                <Statistic
                  title="Inactive Menus"
                  value={menuStats.inactiveMenus}
                  prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4} xl={4}>
              <Card>
                <Statistic
                  title="Parent Menus"
                  value={menuStats.parentMenus}
                  prefix={<FolderOutlined style={{ color: '#722ed1' }} />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4} xl={4}>
              <Card>
                <Statistic
                  title="Child Menus"
                  value={menuStats.childMenus}
                  prefix={<FileOutlined style={{ color: '#fa8c16' }} />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4} xl={4}>
              <Card>
                <div style={{ textAlign: 'center' }}>
                  <Text strong>Menu Health</Text>
                  <Progress
                    type="circle"
                    size={60}
                    percent={Math.round((menuStats.activeMenus / Math.max(menuStats.totalMenus, 1)) * 100)}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </Col>
        
        {/* Main Content */}
        <Col span={24}>
          <Tabs defaultActiveKey="menu-items" size="large">
            <TabPane 
              tab={
                <span>
                  <MenuOutlined />
                  Menu Items
                  <Badge count={menuStats.totalMenus} style={{ marginLeft: 8 }} />
                </span>
              } 
              key="menu-items"
            >
              <Card>
                {/* Advanced Filters */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <Search
                      placeholder="Search menus..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      allowClear
                      prefix={<SearchOutlined />}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={4} lg={3}>
                    <Select
                      placeholder="Status"
                      value={statusFilter}
                      onChange={setStatusFilter}
                      style={{ width: '100%' }}
                    >
                      <Option value="all">All Status</Option>
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={4} lg={3}>
                    <Select
                      placeholder="Type"
                      value={typeFilter}
                      onChange={setTypeFilter}
                      style={{ width: '100%' }}
                    >
                      <Option value="all">All Types</Option>
                      <Option value="parent">Parent</Option>
                      <Option value="child">Child</Option>
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={4} lg={3}>
                    <Select
                      placeholder="Sort By"
                      value={sortBy}
                      onChange={setSortBy}
                      style={{ width: '100%' }}
                    >
                      <Option value="sort_order">Order</Option>
                      <Option value="label">Label</Option>
                      <Option value="name">Name</Option>
                      <Option value="created_at">Created</Option>
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={2} lg={2}>
                    <Button
                      icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={2} lg={2}>
                    <Button
                      icon={<FilterOutlined />}
                      onClick={resetFilters}
                      title="Reset Filters"
                    />
                  </Col>
                </Row>

                {/* Results Info */}
                <Alert
                  message={`Showing ${safeMenuItems.length} of ${menuStats.totalMenus} menu items`}
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                {/* Menu Items Table */}
                <Table
                  columns={columns}
                  dataSource={safeMenuItems}
                  rowKey="id"
                  loading={loading}
                  pagination={{ 
                    pageSize: 10, 
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                  }}
                  scroll={{ x: 800 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No menu items found"
                      />
                    )
                  }}
                />
              </Card>
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <BranchesOutlined />
                  Tree View
                </span>
              } 
              key="tree-view"
            >
              <Card title="Menu Hierarchy" extra={
                <Button icon={<ReloadOutlined />} onClick={fetchMenuItems}>
                  Refresh
                </Button>
              }>
                {menuItems.length > 0 ? (
                  <Tree
                    treeData={buildTreeData(menuItems)}
                    defaultExpandAll
                    showLine={{ showLeafIcon: false }}
                  />
                ) : (
                  <Empty description="No menu items to display" />
                )}
              </Card>
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <TeamOutlined />
                  Role Permissions
                  <Badge count={safeRoles.length} style={{ marginLeft: 8 }} />
                </span>
              } 
              key="role-permissions"
            >
              <Card>
                <Row gutter={16}>
                  <Col span={8}>
                    <Title level={4}>Select Role</Title>
                    <Select
                      placeholder="Choose a role to manage permissions"
                      style={{ width: '100%', marginBottom: 16 }}
                      onChange={(value) => {
                        setSelectedRole(value);
                        fetchRolePermissions(value);
                      }}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {safeRoles.map(role => (
                        <Option key={role.role_id} value={role.role_id}>
                          <Avatar size="small" icon={<SafetyOutlined />} style={{ marginRight: 8 }} />
                          {role.role_name}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={16}>
                    {selectedRole && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <Title level={4}>Permissions for {safeRoles.find(r => r.role_id === selectedRole)?.role_name}</Title>
                          <Button type="primary" onClick={saveRolePermissions}>
                            Save Permissions
                          </Button>
                        </div>
                        <Table
                          columns={permissionColumns}
                          dataSource={safeRolePermissions}
                          rowKey="id"
                          pagination={false}
                          scroll={{ y: 400 }}
                        />
                      </>
                    )}
                  </Col>
                </Row>
              </Card>
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <UserOutlined />
                  User Permissions
                  <Badge count={safeUsers.length} style={{ marginLeft: 8 }} />
                </span>
              } 
              key="user-permissions"
            >
              <Card>
                <Row gutter={16}>
                  <Col span={8}>
                    <Title level={4}>Select User</Title>
                    <Select
                      placeholder="Choose a user to manage permissions"
                      style={{ width: '100%', marginBottom: 16 }}
                      onChange={(value) => {
                        setSelectedUser(value);
                        fetchUserPermissions(value);
                      }}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {safeUsers.map(user => (
                        <Option key={user.user_id} value={user.user_id}>
                          <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }} />
                          {user.employee_name} ({user.user_name}) - {user.role_name}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={16}>
                    {selectedUser && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                          <Title level={4}>Permissions for {safeUsers.find(u => u.user_id === selectedUser)?.employee_name}</Title>
                          <Button type="primary" onClick={saveUserPermissions}>
                            Save Permissions
                          </Button>
                        </div>
                        <Table
                          columns={userPermissionColumns}
                          dataSource={safeUserPermissions}
                          rowKey="id"
                          pagination={false}
                          scroll={{ y: 400 }}
                        />
                      </>
                    )}
                  </Col>
                </Row>
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>

      {/* Add/Edit Menu Item Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <MenuOutlined style={{ marginRight: 8 }} />
            {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </div>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Menu Name (Unique Identifier)"
                rules={[
                  { required: true, message: 'Please enter menu name' },
                  { pattern: /^[a-z0-9-_]+$/, message: 'Only lowercase letters, numbers, hyphens and underscores allowed' }
                ]}
              >
                <Input placeholder="e.g., hr-dashboard" prefix={<SettingOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="label"
                label="Display Label"
                rules={[{ required: true, message: 'Please enter display label' }]}
              >
                <Input placeholder="e.g., HR Dashboard" prefix={<MenuOutlined />} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="icon"
                label="Icon (Ant Design Icon Name)"
              >
                <Input placeholder="e.g., DashboardOutlined" prefix={<AppstoreOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="path"
                label="Route Path"
              >
                <Input placeholder="e.g., /hrms/dashboard" prefix={<BranchesOutlined />} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="parent_id"
                label="Parent Menu"
              >
                <Select placeholder="Select parent menu (optional)" allowClear>
                  {parentMenuItems.map(item => (
                    <Option key={item.id} value={item.id}>
                      <FolderOutlined style={{ marginRight: 8 }} />
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sort_order"
                label="Sort Order"
                rules={[{ required: true, message: 'Please enter sort order' }]}
              >
                <Input type="number" placeholder="0" min={0} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="is_active"
            label="Status"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren={<CheckCircleOutlined />} 
              unCheckedChildren={<CloseCircleOutlined />}
            />
          </Form.Item>
          
          <Divider />
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingItem ? 'Update Menu Item' : 'Create Menu Item'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Menu Details Drawer */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            Menu Item Details
          </div>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={500}
      >
        {selectedMenuItem && (
          <div>
            <Card size="small" style={{ marginBottom: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <Avatar 
                  size={64} 
                  icon={selectedMenuItem.parent_id ? <FileOutlined /> : <FolderOutlined />}
                  style={{ 
                    backgroundColor: selectedMenuItem.is_active ? '#52c41a' : '#ff4d4f',
                    marginBottom: 16 
                  }}
                />
                <Title level={4} style={{ margin: 0 }}>
                  {selectedMenuItem.label}
                </Title>
                <Text type="secondary">{selectedMenuItem.name}</Text>
                <div style={{ marginTop: 8 }}>
                  <Badge
                    status={selectedMenuItem.is_active ? 'success' : 'error'}
                    text={selectedMenuItem.is_active ? 'Active' : 'Inactive'}
                  />
                </div>
              </div>
            </Card>

            <List size="small">
              <List.Item>
                <List.Item.Meta
                  avatar={<BranchesOutlined />}
                  title="Route Path"
                  description={selectedMenuItem.path || 'No path specified'}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<AppstoreOutlined />}
                  title="Icon"
                  description={selectedMenuItem.icon || 'No icon specified'}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<FolderOutlined />}
                  title="Parent Menu"
                  description={selectedMenuItem.parent_name || 'Root level menu'}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  avatar={<SortAscendingOutlined />}
                  title="Sort Order"
                  description={selectedMenuItem.sort_order}
                />
              </List.Item>
              {selectedMenuItem.created_at && (
                <List.Item>
                  <List.Item.Meta
                    avatar={<CalendarOutlined />}
                    title="Created"
                    description={new Date(selectedMenuItem.created_at).toLocaleString()}
                  />
                </List.Item>
              )}
              {selectedMenuItem.updated_at && (
                <List.Item>
                  <List.Item.Meta
                    avatar={<CalendarOutlined />}
                    title="Last Updated"
                    description={new Date(selectedMenuItem.updated_at).toLocaleString()}
                  />
                </List.Item>
              )}
            </List>

            <Divider />

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setDrawerVisible(false)}>
                Close
              </Button>
              <Button type="primary" onClick={() => {
                setDrawerVisible(false);
                showEditModal(selectedMenuItem);
              }}>
                Edit Menu Item
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default MenuManagement;
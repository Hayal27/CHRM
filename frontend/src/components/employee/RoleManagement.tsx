import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Space, 
  Popconfirm, 
  message, 
  Typography,
  Row,
  Col,
  Checkbox,
  Divider,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  LockOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  user_count: number;
  is_system_role: boolean;
  created_at: string;
}

// Define all possible permissions
const allPermissions = {
  'Employee Management': [
    'view_employees',
    'create_employees',
    'edit_employees',
    'delete_employees',
  ],
  'Department Management': [
    'view_departments',
    'create_departments',
    'edit_departments',
    'delete_departments',
  ],
  'Recruitment': [
    'view_vacancies',
    'create_vacancies',
    'edit_vacancies',
    'delete_vacancies',
    'view_applications',
    'process_applications',
    'schedule_interviews',
  ],
  'Attendance': [
    'view_attendance',
    'record_attendance',
    'edit_attendance',
    'view_reports',
  ],
  'Leave Management': [
    'view_leave',
    'request_leave',
    'approve_leave',
    'reject_leave',
  ],
  'Payroll': [
    'view_payroll',
    'process_payroll',
    'edit_salary',
  ],
  'System Settings': [
    'view_settings',
    'edit_settings',
    'manage_roles',
  ],
};

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/roles', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setRoles(response.data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      message.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = () => {
    setEditingRole(null);
    setSelectedPermissions([]);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setSelectedPermissions(role.permissions || []);
    form.setFieldsValue({
      name: role.name,
      description: role.description,
    });
    setModalVisible(true);
  };

  const handleDeleteRole = async (id: number) => {
    try {
      await axios.delete(`/api/roles/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Role deleted successfully');
      fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      message.error('Failed to delete role');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const roleData = {
        ...values,
        permissions: selectedPermissions
      };
      
      if (editingRole) {
        await axios.put(`/api/roles/${editingRole.id}`, roleData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        message.success('Role updated successfully');
      } else {
        await axios.post('/api/roles', roleData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        message.success('Role created successfully');
      }
      setModalVisible(false);
      fetchRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      message.error('Failed to save role');
    }
  };

  const handlePermissionChange = (category: string, checkedValues: string[]) => {
    // Get all permissions from other categories that are currently selected
    const otherPermissions = Object.keys(allPermissions)
      .filter(key => key !== category)
      .flatMap(key => {
        const categoryPerms = allPermissions[key as keyof typeof allPermissions];
        return categoryPerms.filter(perm => selectedPermissions.includes(perm));
      });
    
    // Combine with newly checked permissions from this category
    setSelectedPermissions([...otherPermissions, ...checkedValues]);
  };

  const columns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Role) => (
        <Space>
          <Text strong>{text}</Text>
          {record.is_system_role && <Tag color="blue">System</Tag>}
        </Space>
      )
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Users',
      dataIndex: 'user_count',
      key: 'user_count',
      render: (count: number) => count || 0
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <div>
          {permissions && permissions.length > 0 ? (
            <span>{permissions.length} permissions</span>
          ) : (
            <Text type="secondary">No permissions</Text>
          )}
        </div>
      )
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Role) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEditRole(record)}
            disabled={record.is_system_role}
          />
          <Popconfirm
            title="Delete this role?"
            description="Users with this role will need to be reassigned. This action cannot be undone."
            onConfirm={() => handleDeleteRole(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={record.is_system_role}
          >
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
              disabled={record.is_system_role}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[0, 24]}>
        <Col span={24}>
          <Title level={2}>Role Management</Title>
          <Text type="secondary">
            Create and manage user roles and permissions
          </Text>
        </Col>
        
        <Col span={24}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Roles</span>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAddRole}
                >
                  Add Role
                </Button>
              </div>
            }
          >
            <Table
              columns={columns}
              dataSource={roles}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={editingRole ? 'Edit Role' : 'Add Role'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Role Name"
            rules={[{ required: true, message: 'Please enter role name' }]}
          >
            <Input 
              placeholder="e.g., HR Manager, Department Head" 
              prefix={<SafetyOutlined />}
            />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter role description' }]}
          >
            <Input.TextArea 
              rows={2} 
              placeholder="Brief description of this role's responsibilities"
            />
          </Form.Item>
          
          <Divider orientation="left">Permissions</Divider>
          
          {Object.entries(allPermissions).map(([category, permissions]) => (
            <div key={category} style={{ marginBottom: '16px' }}>
              <Title level={5}>{category}</Title>
              <Checkbox.Group
                options={permissions.map(perm => ({
                  label: perm.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                  value: perm
                }))}
                value={permissions.filter(perm => selectedPermissions.includes(perm))}
                onChange={(checkedValues: string[]) => handlePermissionChange(category, checkedValues)}
              />
            </div>
          ))}
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <Button onClick={() => setModalVisible(false)} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" icon={<LockOutlined />}>
                {editingRole ? 'Update Role' : 'Create Role'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoleManagement;
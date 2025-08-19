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
  Col
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

interface Department {
  id: number;
  name: string;
  description: string;
  manager_id?: number;
  manager_name?: string;
  employee_count: number;
  created_at: string;
}

interface Manager {
  id: number;
  name: string;
  email: string;
  position: string;
}

const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDepartments();
    fetchManagers();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/departments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      message.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await axios.get('/api/employees', {
        params: { position: 'manager' },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setManagers(response.data || []);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    form.setFieldsValue({
      name: department.name,
      description: department.description,
      manager_id: department.manager_id
    });
    setModalVisible(true);
  };

  const handleDeleteDepartment = async (id: number) => {
    try {
      await axios.delete(`/api/departments/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      message.error('Failed to delete department');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingDepartment) {
        await axios.put(`/api/departments/${editingDepartment.id}`, values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        message.success('Department updated successfully');
      } else {
        await axios.post('/api/departments', values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        message.success('Department created successfully');
      }
      setModalVisible(false);
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      message.error('Failed to save department');
    }
  };

  const columns = [
    {
      title: 'Department Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Manager',
      dataIndex: 'manager_name',
      key: 'manager_name',
      render: (text: string) => text || 'Not assigned'
    },
    {
      title: 'Employees',
      dataIndex: 'employee_count',
      key: 'employee_count',
      render: (count: number) => count || 0
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
      render: (_: any, record: Department) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEditDepartment(record)}
          />
          <Popconfirm
            title="Delete this department?"
            description="All employees will need to be reassigned. This action cannot be undone."
            onConfirm={() => handleDeleteDepartment(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
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
          <Title level={2}>Department Management</Title>
          <Text type="secondary">
            Create and manage departments for your organization
          </Text>
        </Col>
        
        <Col span={24}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Departments</span>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAddDepartment}
                >
                  Add Department
                </Button>
              </div>
            }
          >
            <Table
              columns={columns}
              dataSource={departments}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={editingDepartment ? 'Edit Department' : 'Add Department'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Department Name"
            rules={[{ required: true, message: 'Please enter department name' }]}
          >
            <Input placeholder="e.g., Engineering, Marketing, HR" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter department description' }]}
          >
            <Input.TextArea rows={4} placeholder="Brief description of the department's responsibilities" />
          </Form.Item>
          
          <Form.Item
            name="manager_id"
            label="Department Manager"
          >
            <select className="ant-select-selection-search-input">
              <option value="">Select a manager (optional)</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} - {manager.position}
                </option>
              ))}
            </select>
          </Form.Item>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingDepartment ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;
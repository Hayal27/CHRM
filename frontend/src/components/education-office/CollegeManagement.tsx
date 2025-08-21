import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  message, 
  Modal, 
  Form, 
  Input, 
  Select,
  Popconfirm,
  Tag,
  Typography
} from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  PlusOutlined,
  BookOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';

const { Title } = Typography;
const { Option } = Select;

interface College {
  college_id: number;
  college_name: string;
  college_code: string;
  location: string;
  college_type: string;
  contact_phone: string;
  contact_email: string;
  address: string;
  established_year: number;
  status: string;
  employee_count: number;
  trainer_count: number;
  admin_count: number;
}

interface CollegeManagementProps {
  onRefresh: () => void;
}

const CollegeManagement: React.FC<CollegeManagementProps> = ({ onRefresh }) => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(`${API_BASE_URL}/api/education-office/admin/colleges`, config);
      if (response.data.success) {
        setColleges(response.data.colleges);
      }
    } catch (error) {
      console.error('Error fetching colleges:', error);
      message.error('Failed to load colleges');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (college: College) => {
    setEditingCollege(college);
    form.setFieldsValue(college);
    setModalVisible(true);
  };

  const handleDelete = async (college_id: number) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.delete(`${API_BASE_URL}/api/education-office/admin/colleges/${college_id}`, config);
      if (response.data.success) {
        message.success('College deleted successfully');
        fetchColleges();
        onRefresh();
      }
    } catch (error: any) {
      console.error('Error deleting college:', error);
      message.error(error.response?.data?.message || 'Failed to delete college');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (editingCollege) {
        // Update existing college
        const response = await axios.put(
          `${API_BASE_URL}/api/education-office/admin/colleges/${editingCollege.college_id}`,
          values,
          config
        );
        if (response.data.success) {
          message.success('College updated successfully');
        }
      } else {
        // Create new college
        const response = await axios.post(`${API_BASE_URL}/api/education-office/admin/create-college`, values, config);
        if (response.data.success) {
          message.success('College created successfully');
        }
      }

      setModalVisible(false);
      setEditingCollege(null);
      form.resetFields();
      fetchColleges();
      onRefresh();
    } catch (error: any) {
      console.error('Error saving college:', error);
      message.error(error.response?.data?.message || 'Failed to save college');
    }
  };

  const columns = [
    {
      title: 'College Name',
      dataIndex: 'college_name',
      key: 'college_name',
      fixed: 'left' as const,
      width: 200,
    },
    {
      title: 'Code',
      dataIndex: 'college_code',
      key: 'college_code',
      width: 100,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      width: 150,
    },
    {
      title: 'Type',
      dataIndex: 'college_type',
      key: 'college_type',
      width: 120,
      render: (type: string) => (
        <Tag color="blue" style={{ textTransform: 'capitalize' }}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      width: 200,
      render: (record: College) => (
        <div>
          <div>{record.contact_phone}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.contact_email}</div>
        </div>
      ),
    },
    {
      title: 'Employees',
      key: 'employees',
      width: 120,
      align: 'center' as const,
      render: (record: College) => (
        <div>
          <div><strong>{record.employee_count || 0}</strong></div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            T: {record.trainer_count || 0} | A: {record.admin_count || 0}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 120,
      render: (record: College) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Are you sure you want to delete this college?"
            onConfirm={() => handleDelete(record.college_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <Space>
            <BookOutlined />
            <Title level={4} style={{ margin: 0 }}>College Management</Title>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCollege(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Add College
          </Button>
        }
      >
        <Table
          dataSource={colleges}
          columns={columns}
          rowKey="college_id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingCollege ? 'Edit College' : 'Add New College'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingCollege(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="college_name"
            label="College Name"
            rules={[{ required: true, message: 'Please enter college name' }]}
          >
            <Input placeholder="Enter college name" />
          </Form.Item>

          <Form.Item
            name="college_code"
            label="College Code"
          >
            <Input placeholder="Enter college code" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
          >
            <Input placeholder="Enter location" />
          </Form.Item>

          <Form.Item
            name="college_type"
            label="College Type"
            initialValue="technical"
          >
            <Select>
              <Option value="technical">Technical College</Option>
              <Option value="vocational">Vocational Training Institute</Option>
              <Option value="university">University</Option>
              <Option value="institute">Institute</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="contact_phone"
            label="Contact Phone"
          >
            <Input placeholder="Enter contact phone" />
          </Form.Item>

          <Form.Item
            name="contact_email"
            label="Contact Email"
            rules={[{ type: 'email', message: 'Please enter valid email' }]}
          >
            <Input placeholder="Enter contact email" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
          >
            <Input.TextArea rows={3} placeholder="Enter college address" />
          </Form.Item>

          <Form.Item
            name="established_year"
            label="Established Year"
          >
            <Input type="number" placeholder="Enter established year" />
          </Form.Item>

          {editingCollege && (
            <Form.Item
              name="status"
              label="Status"
            >
              <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
                <Option value="suspended">Suspended</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCollege ? 'Update' : 'Create'} College
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingCollege(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CollegeManagement;

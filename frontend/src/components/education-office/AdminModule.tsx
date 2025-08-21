import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Form, 
  Input, 
  Select, 
  message, 
  Modal,
  Space,
  Typography,
  Divider
} from 'antd';
import { 
  UserAddOutlined, 
  PlusOutlined, 
  BookOutlined,
  SettingOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';

const { Title, Text } = Typography;
const { Option } = Select;

interface AdminModuleProps {
  onRefresh: () => void;
}

interface Role {
  role_id: number;
  role_name: string;
  description: string;
}

interface College {
  college_id: number;
  college_name: string;
  college_code: string;
}

interface Department {
  department_id: number;
  name: string;
}

const AdminModule: React.FC<AdminModuleProps> = ({ onRefresh }) => {
  const [userForm] = Form.useForm();
  const [collegeForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [collegeModalVisible, setCollegeModalVisible] = useState(false);

  useEffect(() => {
    fetchFormData();
  }, []);

  const fetchFormData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch admin roles
      const rolesResponse = await axios.get(`${API_BASE_URL}/api/education-office/roles/admin`, config);
      if (rolesResponse.data.success) {
        setRoles(rolesResponse.data.roles);
      }

      // Fetch colleges
      const collegesResponse = await axios.get(`${API_BASE_URL}/api/education-office/admin/colleges`, config);
      if (collegesResponse.data.success) {
        setColleges(collegesResponse.data.colleges);
      }

      // Fetch departments
      const departmentsResponse = await axios.get(`${API_BASE_URL}/api/admin/departments`, config);
      if (departmentsResponse.data.success) {
        setDepartments(departmentsResponse.data.departments);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
      message.error('Failed to load form data');
    }
  };

  const handleCreateUser = async (values: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.post(`${API_BASE_URL}/api/education-office/admin/create-user`, values, config);
      
      if (response.data.success) {
        message.success('Admin user created successfully!');
        userForm.resetFields();
        setUserModalVisible(false);
        onRefresh();
      } else {
        message.error(response.data.message || 'Failed to create user');
      }
    } catch (error: any) {
      console.error('Error creating user:', error);
      message.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollege = async (values: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.post(`${API_BASE_URL}/api/education-office/admin/create-college`, values, config);
      
      if (response.data.success) {
        message.success('College created successfully!');
        collegeForm.resetFields();
        setCollegeModalVisible(false);
        onRefresh();
        fetchFormData(); // Refresh colleges list
      } else {
        message.error(response.data.message || 'Failed to create college');
      }
    } catch (error: any) {
      console.error('Error creating college:', error);
      message.error(error.response?.data?.message || 'Failed to create college');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={3}>Admin Module</Title>
      <Text type="secondary">
        Create administrator users and manage technical colleges
      </Text>

      <Divider />

      <Row gutter={[24, 24]}>
        {/* Create Admin User Section */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <UserAddOutlined />
                User Management
              </Space>
            }
            extra={
              <Button 
                type="primary" 
                icon={<UserAddOutlined />}
                onClick={() => setUserModalVisible(true)}
              >
                Create Admin User
              </Button>
            }
          >
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <UserAddOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
              <Title level={4}>Create Administrator Users</Title>
              <Text type="secondary">
                Create users with Administrator or Education Office Head roles
              </Text>
              <br />
              <Button 
                type="primary" 
                size="large"
                icon={<UserAddOutlined />}
                onClick={() => setUserModalVisible(true)}
                style={{ marginTop: '16px' }}
              >
                Create New User
              </Button>
            </div>
          </Card>
        </Col>

        {/* Create College Section */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BookOutlined />
                College Management
              </Space>
            }
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setCollegeModalVisible(true)}
              >
                Create College
              </Button>
            }
          >
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <BookOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
              <Title level={4}>Manage Technical Colleges</Title>
              <Text type="secondary">
                Create and manage technical colleges in the system
              </Text>
              <br />
              <Button 
                type="primary" 
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setCollegeModalVisible(true)}
                style={{ marginTop: '16px' }}
              >
                Create New College
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Create User Modal */}
      <Modal
        title="Create Administrator User"
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleCreateUser}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="user_name"
                label="Username"
                rules={[{ required: true, message: 'Please enter username' }]}
              >
                <Input placeholder="Enter username" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please enter password' },
                  { min: 8, message: 'Password must be at least 8 characters' }
                ]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="full_name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter full name' }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role_id"
                label="Role"
                rules={[{ required: true, message: 'Please select role' }]}
              >
                <Select placeholder="Select role">
                  {roles.map(role => (
                    <Option key={role.role_id} value={role.role_id}>
                      {role.role_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="college_id"
                label="College"
              >
                <Select placeholder="Select college" allowClear>
                  {colleges.map(college => (
                    <Option key={college.college_id} value={college.college_id}>
                      {college.college_name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="department_id"
                label="Department"
              >
                <Select placeholder="Select department" allowClear>
                  {departments.map(dept => (
                    <Option key={dept.department_id} value={dept.department_id}>
                      {dept.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create User
              </Button>
              <Button onClick={() => setUserModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create College Modal */}
      <Modal
        title="Create Technical College"
        open={collegeModalVisible}
        onCancel={() => setCollegeModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={collegeForm}
          layout="vertical"
          onFinish={handleCreateCollege}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="college_name"
                label="College Name"
                rules={[{ required: true, message: 'Please enter college name' }]}
              >
                <Input placeholder="Enter college name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="college_code"
                label="College Code"
              >
                <Input placeholder="Enter college code" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Location"
              >
                <Input placeholder="Enter location" />
              </Form.Item>
            </Col>
            <Col span={12}>
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
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contact_phone"
                label="Contact Phone"
              >
                <Input placeholder="Enter contact phone" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contact_email"
                label="Contact Email"
                rules={[{ type: 'email', message: 'Please enter valid email' }]}
              >
                <Input placeholder="Enter contact email" />
              </Form.Item>
            </Col>
          </Row>

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

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create College
              </Button>
              <Button onClick={() => setCollegeModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminModule;

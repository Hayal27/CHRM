import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Card, Table, Button, Modal, Form, Input, DatePicker, Select, Space, Popconfirm, message, Spin, Row, Col, Statistic, Avatar, Upload } from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, BarChartOutlined, 
  UploadOutlined, UserOutlined, EyeOutlined, UnorderedListOutlined, UserSwitchOutlined,
  MailOutlined, CalendarOutlined, PhoneOutlined
} from '@ant-design/icons';
import { employeeService } from '../../services/employeeService';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { Bar } from '@ant-design/charts';
import Axios from "axios";

const { Title } = Typography;
const { Option } = Select;

// 1. Employee interface
interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  dateOfJoining: string;
  status: 'Active' | 'Inactive';
  profileImage?: string; // URL or base64
  phone?: string;
  sex?: string;
  supervisor?: string;
}

// Extend Employee interface for registration fields
interface EmployeeFormData extends Employee {
  fname?: string;
  lname?: string;
  role_id?: string;
  department_id?: string;
  supervisor_id?: string;
}

// Add missing types for Role and Department
interface Role {
  role_id: number;
  role_name: string;
}

interface Department {
  department_id: number;
  name: string;
}

const EmployeeProfileDashboard: React.FC = () => {
  // 6. State for data and modal
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({ name: '', department: '', status: '' });
  const [search, setSearch] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  // Add registration states
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [modalType, setModalType] = useState<"success" | "error">("success");
  const [showModalFeedback, setShowModalFeedback] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Fetch employees from backend
  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the correct endpoint for fetching all employees
      const response = await Axios.get("http://localhost:5000/api/getEmployees");
      let data = response.data.employees ?? response.data;
      // Convert status '1' to 'Active', '0' or falsy to 'Inactive'
      data = Array.isArray(data)
        ? data.map((e: any) => ({
            ...e,
            status: e.status === '1'
              ? 'Active'
              : (!e.status || e.status === '0')
                ? 'Inactive'
                : e.status
          }))
        : [];
      setEmployees(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line
  }, [filters, search]);

  // Fetch roles, departments on mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await Axios.get("http://localhost:5000/api/roles");
        setRoles(response.data);
      } catch (error) {
        // ignore error
      }
    };
    const fetchDepartments = async () => {
      try {
        const response = await Axios.get("http://localhost:5000/api/departments");
        setDepartments(response.data);
      } catch (error) {
        // ignore error
      }
    };
    fetchRoles();
    fetchDepartments();
  }, []);

  // KPI calculations
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'Active').length;
  const inactiveEmployees = employees.filter(e => e.status === 'Inactive').length;

  // Chart data
  const departmentData = useMemo(() => {
    const deptMap: Record<string, number> = {};
    employees.forEach(e => {
      deptMap[e.department] = (deptMap[e.department] || 0) + 1;
    });
    return Object.entries(deptMap).map(([department, count]) => ({ department, count }));
  }, [employees]);

  // 7. Add/Edit logic
  const showAddModal = () => {
    setEditingEmployee(null);
    setImageUrl(undefined);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (record: Employee) => {
    setEditingEmployee(record);
    setImageUrl(record.profileImage);
    form.setFieldsValue({
      ...record,
      dateOfJoining: dayjs(record.dateOfJoining),
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await employeeService.deleteEmployee(id);
      message.success('Employee deleted');
      fetchEmployees();
    } catch {
      message.error('Failed to delete employee');
    }
  };

  // Update handleModalOk to send all registration fields
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      // Map status to backend expected value: 'Active' => '1', 'Inactive' => '0'
      const mappedStatus = values.status === 'Active' ? '1' : '0';
      const newEmployee: EmployeeFormData = {
        ...values,
        id: editingEmployee ? editingEmployee.id : undefined,
        dateOfJoining: values.dateOfJoining.format('YYYY-MM-DD'),
        profileImage: imageUrl,
        status: mappedStatus,
      };
      // Registration API call
      try {
        const response = await Axios.post("http://localhost:5000/api/addEmployee", newEmployee);
        if (response.data.message) {
          setModalType("success");
          setModalMessage(response.data.message);
        } else {
          setModalType("success");
          setModalMessage("Employee SUCCESSFULLY Registered");
        }
      } catch (error) {
        setModalType("error");
        setModalMessage("An error occurred during registration.");
      }
      setShowModalFeedback(true);

      // Also update local list if needed
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee.id, newEmployee);
        message.success('Employee updated');
      } else {
        await employeeService.createEmployee(newEmployee);
        message.success('Employee added');
      }
      setModalVisible(false);
      form.resetFields();
      setImageUrl(undefined);
      fetchEmployees();
    } catch (err: any) {
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setImageUrl(undefined);
  };

  // Export to CSV
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(employees);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, 'employees.xlsx');
  };

  // Image upload handler (base64 for demo, replace with backend upload if needed)
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }
    const reader = new FileReader();
    reader.onload = e => {
      setImageUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    return false; // Prevent upload
  };

  // 3. Table columns
  const columns = [
    {
      title: 'Profile',
      dataIndex: 'profileImage',
      key: 'profileImage',
      render: (img: string | undefined, record: Employee) => (
        <Avatar src={img} icon={<UserOutlined />} alt={record.name} />
      ),
    },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    { title: 'Position', dataIndex: 'position', key: 'position' },
    { title: 'Date of Joining', dataIndex: 'dateOfJoining', key: 'dateOfJoining', render: (date: string) => dayjs(date).format('YYYY-MM-DD') },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => <span style={{ color: status === 'Active' ? 'green' : 'red' }}>{status}</span> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Employee) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => showEditModal(record)} />
          <Popconfirm title="Delete this employee?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Unique departments for filter dropdown
  const departmentOptions = Array.from(new Set(employees.map(e => e.department)));

  // Card view for employees
  const renderCardView = () => (
    <Row gutter={[16, 16]}>
      {employees.map(emp => (
        <Col xs={24} sm={12} md={8} lg={6} key={emp.id}>
          <Card
            hoverable
            actions={[
              <EyeOutlined key="view" onClick={() => setSelectedEmployee(emp)} />,
              <EditOutlined key="edit" onClick={() => showEditModal(emp)} />,
              <DeleteOutlined key="delete" onClick={() => handleDelete(emp.id)} />
            ]}
          >
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <Avatar src={emp.profileImage} icon={<UserOutlined />} size={64} />
              <div>
                <strong>{emp.name}</strong>
                <div>{emp.position}</div>
                <div>{emp.department}</div>
                <div style={{ color: emp.status === 'Active' ? 'green' : 'red' }}>{emp.status}</div>
              </div>
            </Space>
          </Card>
        </Col>
      ))}
    </Row>
  );

  // Detailed view modal
  const renderDetailModal = () => (
    <Modal
      open={!!selectedEmployee}
      onCancel={() => setSelectedEmployee(null)}
      footer={[
        <Button key="close" onClick={() => setSelectedEmployee(null)}>
          Close
        </Button>
      ]}
      title={
        <Space>
          <UserSwitchOutlined style={{ color: "#1890ff", fontSize: 22 }} />
          <span style={{ fontWeight: 600 }}>Employee Details</span>
        </Space>
      }
      centered
      width={500}
    >
      {selectedEmployee && (
        <div style={{ textAlign: "center" }}>
          <Avatar
            src={selectedEmployee.profileImage}
            icon={<UserOutlined />}
            size={96}
            style={{ marginBottom: 16, border: "2px solid #1890ff" }}
          />
          <Title level={3} style={{ marginBottom: 0 }}>
            {selectedEmployee.name}
          </Title>
          <div style={{ marginBottom: 8, color: "#888" }}>
            <UserOutlined style={{ marginRight: 6, color: "#1890ff" }} />
            <span style={{ fontWeight: 500 }}>{selectedEmployee.position}</span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <BarChartOutlined style={{ marginRight: 6, color: "#52c41a" }} />
            <span>{selectedEmployee.department}</span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <MailOutlined style={{ marginRight: 6, color: "#faad14" }} />
            <span>{selectedEmployee.email}</span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <CalendarOutlined style={{ marginRight: 6, color: "#722ed1" }} />
            <span>
              Joined: {dayjs(selectedEmployee.dateOfJoining).format('YYYY-MM-DD')}
            </span>
          </div>
          <div style={{ marginBottom: 8 }}>
            <UserSwitchOutlined style={{ marginRight: 6, color: "#1890ff" }} />
            <span>
              Status: <span style={{ color: selectedEmployee.status === 'Active' ? 'green' : 'red', fontWeight: 600 }}>
                {selectedEmployee.status}
              </span>
            </span>
          </div>
          {/* Add more professional info if available */}
          {/* Example: Phone, Gender, Supervisor */}
          {selectedEmployee['phone'] && (
            <div style={{ marginBottom: 8 }}>
              <PhoneOutlined style={{ marginRight: 6, color: "#13c2c2" }} />
              <span>{selectedEmployee['phone']}</span>
            </div>
          )}
          {selectedEmployee['sex'] && (
            <div style={{ marginBottom: 8 }}>
              <UserOutlined style={{ marginRight: 6, color: "#eb2f96" }} />
              <span>{selectedEmployee['sex'] === 'M' ? 'Male' : 'Female'}</span>
            </div>
          )}
          {selectedEmployee['supervisor'] && (
            <div style={{ marginBottom: 8 }}>
              <UserSwitchOutlined style={{ marginRight: 6, color: "#1890ff" }} />
              <span>Supervisor: {selectedEmployee['supervisor']}</span>
            </div>
          )}
        </div>
      )}
    </Modal>
  );

  // Add view toggle buttons above table/card
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Employee Profiles</Title>
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<UnorderedListOutlined />}
          type={viewMode === 'table' ? 'primary' : 'default'}
          onClick={() => setViewMode('table')}
        >
          Table View
        </Button>
        <Button
          icon={<EyeOutlined />}
          type={viewMode === 'card' ? 'primary' : 'default'}
          onClick={() => setViewMode('card')}
        >
          Card View
        </Button>
      </Space>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}><Statistic title="Total Employees" value={totalEmployees} /></Col>
        <Col xs={24} sm={8}><Statistic title="Active Employees" value={activeEmployees} valueStyle={{ color: 'green' }} /></Col>
        <Col xs={24} sm={8}><Statistic title="Inactive Employees" value={inactiveEmployees} valueStyle={{ color: 'red' }} /></Col>
      </Row>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={4} style={{ marginBottom: 8 }}>
            <Input placeholder="Search by name/email" allowClear value={search} onChange={e => setSearch(e.target.value)} />
          </Col>
          <Col xs={24} sm={12} md={4} style={{ marginBottom: 8 }}>
            <Select placeholder="Department" allowClear style={{ width: '100%' }} value={filters.department || undefined} onChange={val => setFilters(f => ({ ...f, department: val || '' }))}>
              {departmentOptions.map(dep => <Option key={dep} value={dep}>{dep}</Option>)}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4} style={{ marginBottom: 8 }}>
            <Select placeholder="Status" allowClear style={{ width: '100%' }} value={filters.status || undefined} onChange={val => setFilters(f => ({ ...f, status: val || '' }))}>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4} style={{ marginBottom: 8 }}>
            <Button icon={<DownloadOutlined />} onClick={handleExport} block>Export</Button>
          </Col>
          <Col xs={24} sm={12} md={4} style={{ marginBottom: 8 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal} block>Add Employee</Button>
          </Col>
        </Row>
      </Card>
      <Card style={{ marginBottom: 24 }}>
        <BarChartOutlined /> Employees by Department
        <Bar
          data={departmentData}
          xField="count"
          yField="department"
          seriesField="department"
          legend={false}
          height={250}
          color={({ department }: { department: string }) => department === 'HR' ? '#1890ff' : '#52c41a'}
        />
      </Card>
      <Card>
        {loading ? <Spin style={{ width: '100%', margin: '40px 0' }} /> : error ? <div style={{ color: 'red' }}>{error}</div> : (
          viewMode === 'table' ? (
            <Table
              columns={[
                ...columns,
                {
                  title: '',
                  key: 'view',
                  render: (_: any, record: Employee) => (
                    <Button
                      icon={<EyeOutlined />}
                      size="small"
                      onClick={() => setSelectedEmployee(record)}
                    />
                  ),
                }
              ]}
              dataSource={employees}
              rowKey="id"
              pagination={{ pageSize: 8 }}
              locale={{ emptyText: 'No employees found.' }}
            />
          ) : (
            renderCardView()
          )
        )}
      </Card>
      {renderDetailModal()}
      <Modal
        title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingEmployee ? 'Update' : 'Add'}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'Active' }}
        >
          <Form.Item label="Profile Image">
            <Upload
              name="profile"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={beforeUpload}
              accept="image/*"
            >
              {imageUrl ? <Avatar src={imageUrl} size={64} /> : <div><UploadOutlined /><div style={{ marginTop: 8 }}>Upload</div></div>}
            </Upload>
          </Form.Item>
          <Form.Item name="fname" label="First Name" rules={[{ required: true, message: 'Please enter first name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lname" label="Last Name" rules={[{ required: true, message: 'Please enter last name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Please enter phone' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sex" label="Sex" rules={[{ required: true, message: 'Please select sex' }]}>
            <Select>
              <Option value="M">Male</Option>
              <Option value="F">Female</Option>
            </Select>
          </Form.Item>
          <Form.Item name="name" label="User Name" rules={[{ required: true, message: 'Please enter user name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="department_id" label="Department" rules={[{ required: true, message: 'Please select department' }]}>
            <Select>
              <Option value="">Select Department</Option>
              {departments.map(dep => (
                <Option key={dep.department_id} value={dep.department_id}>{dep.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="role_id" label="Role" rules={[{ required: true, message: 'Please select role' }]}>
            <Select>
              <Option value="">Select a role</Option>
              {roles.map(role => (
                <Option key={role.role_id} value={role.role_id}>{role.role_name}</Option>
              ))}
            </Select>
          </Form.Item>
          {/* Uncomment for supervisor selection if needed
          <Form.Item name="supervisor_id" label="Supervisor">
            <Select>
              <Option value="">Select a supervisor (Optional)</Option>
              {supervisors.map(sup => (
                <Option key={sup.employee_id} value={sup.employee_id}>{sup.name}</Option>
              ))}
            </Select>
          </Form.Item>
          */}
          <Form.Item name="position" label="Position" rules={[{ required: true, message: 'Please enter position' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="dateOfJoining" label="Date of Joining" rules={[{ required: true, message: 'Please select date' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      {/* Modal feedback for registration */}
      {showModalFeedback && (
        <Modal
          open={showModalFeedback}
          onCancel={() => setShowModalFeedback(false)}
          footer={[
            <Button key="close" onClick={() => setShowModalFeedback(false)}>
              Close
            </Button>
          ]}
        >
          <Title level={4}>{modalType === "success" ? "Success" : "Error"}</Title>
          <div>{modalMessage}</div>
        </Modal>
      )}
    </div>
  );
};

export default EmployeeProfileDashboard;

// If you want to avoid the 404 error, make sure your backend has a route for /api/employees
// Or update employeeService to use the correct backend endpoint (e.g., /api/getEmployees)

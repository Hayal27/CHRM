import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  message, 
  Space, 
  Popconfirm, 
  Typography, 
  Row, 
  Col,
  Avatar,
  Tabs,
  Tag,
  Tooltip,
  Drawer,
  Divider,
  Radio,
  Statistic,
  Progress,
  Alert,
  Empty,
  Badge,
  List,
  Upload,
  Image,
  InputNumber,
  Checkbox
} from 'antd';
import { 
  UserOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  IdcardOutlined,
  CalendarOutlined,
  SafetyOutlined,
  ReloadOutlined,
  BarChartOutlined,
  PieChartOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  UploadOutlined,
  CameraOutlined,
  FileOutlined,
  EyeOutlined,
  DownloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateLeftOutlined,
  RotateRightOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import ImgCrop from 'antd-img-crop';
import EnhancedEmployeeRegistration from './EnhancedEmployeeRegistration';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface Employee {
  employee_id: number;
  id: number;
  full_name: string;
  name: string;
  fname?: string;
  lname?: string;
  sex?: string;
  email: string;
  mobile?: string;
  phone?: string;
  citizen_address?: string;
  department_id?: number;
  department_name?: string;
  role_id?: number;
  role_name?: string;
  position?: string;
  dateOfJoining?: string;
  date_of_joining?: string;
  status: 'Active' | 'Inactive';
  profileImage?: string;
  profile_image?: string;
  employee_type?: string;
  age?: number;
  qualification_level?: string;
  qualification_subject?: string;
  competence_level?: string;
  competence_occupation?: string;
  occupation_on_training?: string;
  employed_work_process?: string;
  document_path?: string;
  year_of_birth?: number;
  year_of_employment?: number;
  year_of_upgrading?: number;
  college_id?: number;
}

interface Department {
  department_id: number;
  name: string;
}

interface Role {
  role_id: number;
  role_name: string;
}

interface EmployeeStats {
  total_employees: number;
  active_employees: number;
  inactive_employees: number;
  by_role: Array<{
    role_name: string;
    count: number;
  }>;
  by_department: Array<{
    department_name: string;
    count: number;
  }>;
}

const EnhancedEmployeeProfile: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [statistics, setStatistics] = useState<EmployeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [form] = Form.useForm();
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [documentPreviewVisible, setDocumentPreviewVisible] = useState(false);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
  
  // Filter states
  const [searchText, setSearchText] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<number | undefined>(undefined);
  const [roleFilter, setRoleFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [employeeTypeFilter, setEmployeeTypeFilter] = useState<string | undefined>(undefined);
  
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchRoles();
  }, []);

  useEffect(() => {
    applyFilters();
    calculateStatistics();
  }, [employees, searchText, departmentFilter, roleFilter, statusFilter, employeeTypeFilter]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/getEmployees`);
      
      if (response.data.success) {
        setEmployees(response.data.employees || []);
      } else {
        setEmployees([]);
        message.error('Failed to load employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      message.error('Failed to load employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/departments`);
      setDepartments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/roles`);
      setRoles(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      setRoles([]);
    }
  };

  const calculateStatistics = () => {
    if (employees.length > 0) {
      const stats = {
        total_employees: employees.length,
        active_employees: employees.filter(emp => emp.status === 'Active').length,
        inactive_employees: employees.filter(emp => emp.status === 'Inactive').length,
        by_role: [] as Array<{ role_name: string; count: number }>,
        by_department: [] as Array<{ department_name: string; count: number }>
      };

      // Calculate role statistics
      const roleStats = employees.reduce((acc: any, emp) => {
        const roleName = emp.role_name || 'Unassigned';
        acc[roleName] = (acc[roleName] || 0) + 1;
        return acc;
      }, {});

      stats.by_role = Object.entries(roleStats).map(([role_name, count]) => ({
        role_name,
        count: count as number
      }));

      // Calculate department statistics
      const deptStats = employees.reduce((acc: any, emp) => {
        const deptName = emp.department_name || 'Unassigned';
        acc[deptName] = (acc[deptName] || 0) + 1;
        return acc;
      }, {});

      stats.by_department = Object.entries(deptStats).map(([department_name, count]) => ({
        department_name,
        count: count as number
      }));

      setStatistics(stats);
    }
  };

  const applyFilters = () => {
    let filtered = [...employees];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(emp =>
        emp.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        emp.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        emp.mobile?.toLowerCase().includes(searchText.toLowerCase()) ||
        emp.phone?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Department filter
    if (departmentFilter) {
      filtered = filtered.filter(emp => emp.department_id === departmentFilter);
    }

    // Role filter
    if (roleFilter) {
      filtered = filtered.filter(emp => emp.role_id === roleFilter);
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }

    // Employee type filter
    if (employeeTypeFilter) {
      filtered = filtered.filter(emp => emp.employee_type === employeeTypeFilter);
    }

    setFilteredEmployees(filtered);
  };

  const showAddModal = () => {
    setAddModalVisible(true);
  };

  const showEditModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setUploadedImage(null);
    setUploadedDocument(null);
    form.setFieldsValue({
      ...employee,
      dateOfJoining: employee.dateOfJoining ? dayjs(employee.dateOfJoining) : undefined,
    });
    setModalVisible(true);
  };

  const showEmployeeDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDrawerVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      message.info('Delete functionality will be implemented soon');
    } catch (error) {
      console.error('Error deleting employee:', error);
      message.error('Failed to delete employee');
    }
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleDocumentUpload = (file: File) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      message.error('Please upload a PDF, JPEG, or PNG file');
      return false;
    }

    if (file.size > maxSize) {
      message.error('File size must be less than 5MB');
      return false;
    }

    setUploadedDocument(file);
    message.success('Document uploaded successfully');
    return false;
  };

  const handleSubmit = async (values: any) => {
    if (!editingEmployee) {
      message.error("No employee selected for editing");
      return;
    }

    try {
      setLoading(true);
      console.log("🔄 Submitting employee update:", values);
      console.log("📝 Editing employee ID:", editingEmployee.employee_id);
      console.log("🖼️ Uploaded image:", uploadedImage ? "Yes" : "No");
      
      // Step 1: Update employee data
      const updateData = { ...values };
      
      // Handle date formatting
      if (updateData.dateOfJoining && updateData.dateOfJoining.format) {
        updateData.dateOfJoining = updateData.dateOfJoining.format("YYYY-MM-DD");
      }

      // Add employee ID for reference
      updateData.employee_id = editingEmployee.employee_id;

      console.log("📤 Sending update data:", updateData);

      // Make API call to update employee basic data
      const response = await axios.put(
        `${API_BASE_URL}/api/employees/enhanced/${editingEmployee.employee_id}`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      console.log("📥 Update response:", response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || "Update failed");
      }

      // Step 2: Upload profile image if provided
      if (uploadedImage) {
        try {
          console.log("🖼️ Uploading profile image...");
          
          // Convert base64 to blob
          const imageResponse = await fetch(uploadedImage);
          const imageBlob = await imageResponse.blob();
          
          // Create form data for image upload
          const formData = new FormData();
          formData.append("profileImage", imageBlob, "profile.jpg");

          const imageUploadResponse = await axios.post(
            `${API_BASE_URL}/api/employees/enhanced/${editingEmployee.employee_id}/profile-image`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data"
              }
            }
          );

          console.log("📥 Image upload response:", imageUploadResponse.data);

          if (imageUploadResponse.data.success) {
            console.log("✅ Profile image uploaded successfully");
            message.success("Employee and profile image updated successfully");
          } else {
            console.warn("⚠️ Profile image upload failed:", imageUploadResponse.data.message);
            message.warning("Employee updated but profile image upload failed");
          }

        } catch (imageError: any) {
          console.error("❌ Profile image upload error:", imageError);
          message.warning("Employee updated but profile image upload failed");
        }
      } else {
        message.success("Employee updated successfully");
      }
      
      // Step 3: Refresh the employee list to show updated data
      await fetchEmployees();
      
      // Step 4: Close modal and reset form
      setModalVisible(false);
      form.resetFields();
      setUploadedImage(null);
      setUploadedDocument(null);
      setEditingEmployee(null);
      
    } catch (error: any) {
      console.error("❌ Error updating employee:", error);
      
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || "Server error occurred";
        message.error(`Failed to update employee: ${errorMessage}`);
        console.error("Server error details:", error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        message.error("No response from server. Please check your connection.");
        console.error("Network error:", error.request);
      } else {
        // Something else happened
        message.error(`Failed to update employee: ${error.message}`);
        console.error("Update error:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  // Helper function to construct full image URL
  const getImageUrl = (imagePath: string | undefined) => {
    console.log("🖼️ Processing image path:", imagePath);
    if (!imagePath) {
      console.log("❌ No image path provided");
      return null;
    }
    if (imagePath.startsWith("http")) {
      console.log("✅ Image path is already full URL:", imagePath);
      return imagePath;
    }
    const fullUrl = `${API_BASE_URL}/${imagePath.replace(/^\/+/g, "")}`;
    console.log("🔗 Constructed image URL:", fullUrl);
    return fullUrl;
  };

  // Helper function to construct full document URL
  const getDocumentUrl = (documentPath: string | undefined) => {
    console.log("📄 Processing document path:", documentPath);
    if (!documentPath) {
      console.log("❌ No document path provided");
      return null;
    }
    if (documentPath.startsWith("http")) {
      console.log("✅ Document path is already full URL:", documentPath);
      return documentPath;
    }
    const fullUrl = `${API_BASE_URL}/${documentPath.replace(/^\/+/g, "")}`;
    console.log("🔗 Constructed document URL:", fullUrl);
    return fullUrl;
  };

  const handleImagePreview = (url: string) => {
    const fullUrl = getImageUrl(url);
    if (fullUrl) {
      setImagePreviewUrl(fullUrl);
      setImagePreviewVisible(true);
    }
  };

  const handleDocumentPreview = (url: string) => {
    const fullUrl = getDocumentUrl(url);
    if (fullUrl) {
      setDocumentPreviewUrl(fullUrl);
      setDocumentPreviewVisible(true);
    }
  };

  const downloadDocument = (url: string, filename: string) => {
    const fullUrl = getDocumentUrl(url);
    if (fullUrl) {
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Export to Excel
  const handleExport = () => {
    const exportData = filteredEmployees.map(emp => ({
      'Full Name': emp.full_name || emp.name,
      'Email': emp.email,
      'Phone': emp.mobile || emp.phone || '',
      'Department': emp.department_name || '',
      'Position': emp.position || '',
      'Role': emp.role_name || '',
      'Employee Type': emp.employee_type || '',
      'Joining Date': emp.dateOfJoining ? new Date(emp.dateOfJoining).toLocaleDateString() : '',
      'Status': emp.status,
      'Qualification': emp.qualification_level || '',
      'Competence': emp.competence_level || ''
    }));
    
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, 'employees.xlsx');
    message.success('Employee data exported successfully');
  };

  // Reset filters
  const resetFilters = () => {
    setSearchText('');
    setDepartmentFilter(undefined);
    setRoleFilter(undefined);
    setStatusFilter(undefined);
    setEmployeeTypeFilter(undefined);
  };

  const columns = [
    {
      title: 'Employee',
      key: 'employee',
      render: (record: Employee) => {
        const profileImagePath = record.profileImage || record.profile_image;
        const profileImageUrl = getImageUrl(profileImagePath);
        
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={profileImageUrl}
              icon={<UserOutlined />}
              size={40}
              style={{ marginRight: '12px', cursor: profileImageUrl ? 'pointer' : 'default' }}
              onClick={() => profileImagePath && handleImagePreview(profileImagePath)}
            />
            <div>
              <div style={{ fontWeight: 'bold' }}>{record.full_name || record.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {record.position || 'No position'} 
                {record.employee_type && (
                  <Tag size="small" color="blue" style={{ marginLeft: 4 }}>
                    {record.employee_type}
                  </Tag>
                )}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (record: Employee) => (
        <div>
          <div><MailOutlined style={{ marginRight: '8px' }} />{record.email}</div>
          <div><PhoneOutlined style={{ marginRight: '8px' }} />{record.mobile || record.phone || 'N/A'}</div>
        </div>
      )
    },
    {
      title: 'Department',
      dataIndex: 'department_name',
      key: 'department_name',
      render: (text: string) => text || 'Not assigned'
    },
    {
      title: 'Role',
      dataIndex: 'role_name',
      key: 'role_name',
      render: (text: string) => text || 'Not assigned'
    },
    {
      title: 'Joining Date',
      key: 'dateOfJoining',
      render: (record: Employee) => {
        const date = record.dateOfJoining || record.date_of_joining;
        return date ? new Date(date).toLocaleDateString() : 'N/A';
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={status === 'Active' ? 'success' : 'error'}
          text={status}
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Employee) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              icon={<InfoCircleOutlined />} 
              size="small"
              onClick={() => showEmployeeDetails(record)}
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
              title="Delete this employee?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(record.employee_id)}
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

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Section */}
      <Row gutter={[0, 24]}>
        <Col span={24}>
          <Card style={{ background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)', border: 'none' }}>
            <Row align="middle" justify="space-between">
              <Col>
                <Title level={2} style={{ color: 'white', margin: 0 }}>
                  <UserOutlined style={{ marginRight: 12 }} />
                  Employee Management System
                </Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.8)', margin: '8px 0 0 0' }}>
                  Comprehensive employee profiles, analytics, and management
                </Paragraph>
              </Col>
              <Col>
                <Space size="large">
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={() => {
                      fetchEmployees();
                      fetchDepartments();
                      fetchRoles();
                    }}
                    style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white' }}
                  >
                    Refresh
                  </Button>
                  <Button 
                    icon={<ExportOutlined />} 
                    onClick={handleExport}
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
                    Add Employee
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Statistics Cards */}
        {statistics && (
          <Col span={24}>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Employees"
                    value={statistics.total_employees || 0}
                    prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Active Employees"
                    value={statistics.active_employees || 0}
                    prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Inactive Employees"
                    value={statistics.inactive_employees || 0}
                    prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <Text strong>Active Rate</Text>
                    <Progress
                      type="circle"
                      size={60}
                      percent={Math.round(((statistics.active_employees || 0) / Math.max(statistics.total_employees || 1, 1)) * 100)}
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
        )}
        
        {/* Main Content */}
        <Col span={24}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
            <TabPane 
              tab={
                <span>
                  <UserOutlined />
                  Employee List
                  <Badge count={filteredEmployees.length} style={{ marginLeft: 8 }} />
                </span>
              } 
              key="list"
            >
              <Card>
                {/* Advanced Filters */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col xs={24} sm={12} md={6}>
                    <Input
                      placeholder="Search employees..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      prefix={<SearchOutlined />}
                      allowClear
                    />
                  </Col>
                  <Col xs={24} sm={12} md={4}>
                    <Select
                      placeholder="Department"
                      value={departmentFilter}
                      onChange={setDepartmentFilter}
                      style={{ width: '100%' }}
                      allowClear
                    >
                      {departments.map(dept => (
                        <Option key={dept.department_id} value={dept.department_id}>
                          {dept.name}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={4}>
                    <Select
                      placeholder="Role"
                      value={roleFilter}
                      onChange={setRoleFilter}
                      style={{ width: '100%' }}
                      allowClear
                    >
                      {roles.map(role => (
                        <Option key={role.role_id} value={role.role_id}>
                          {role.role_name}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={3}>
                    <Select
                      placeholder="Status"
                      value={statusFilter}
                      onChange={setStatusFilter}
                      style={{ width: '100%' }}
                      allowClear
                    >
                      <Option value="Active">Active</Option>
                      <Option value="Inactive">Inactive</Option>
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={3}>
                    <Select
                      placeholder="Type"
                      value={employeeTypeFilter}
                      onChange={setEmployeeTypeFilter}
                      style={{ width: '100%' }}
                      allowClear
                    >
                      <Option value="trainer">Trainer</Option>
                      <Option value="admin">Admin</Option>
                    </Select>
                  </Col>
                  <Col xs={24} sm={12} md={2}>
                    <Button 
                      icon={<FilterOutlined />} 
                      onClick={resetFilters}
                      title="Reset Filters"
                    />
                  </Col>
                </Row>

                {/* Results Info */}
                <Alert
                  message={`Showing ${filteredEmployees.length} of ${employees.length} employees`}
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />

                {/* Employee Table */}
                <Table
                  columns={columns}
                  dataSource={filteredEmployees}
                  rowKey="employee_id"
                  loading={loading}
                  pagination={{ 
                    pageSize: 10, 
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} employees`
                  }}
                  scroll={{ x: 800 }}
                  locale={{
                    emptyText: (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No employees found"
                      />
                    )
                  }}
                />
              </Card>
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <BarChartOutlined />
                  Analytics
                </span>
              } 
              key="analytics"
            >
              <Row gutter={16}>
                <Col xs={24} lg={12}>
                  <Card title="Employees by Role" extra={<TrophyOutlined />}>
                    {statistics?.by_role && statistics.by_role.length > 0 ? (
                      <List
                        dataSource={statistics.by_role}
                        renderItem={(item) => (
                          <List.Item>
                            <List.Item.Meta
                              title={item.role_name || 'Unassigned'}
                              description={`${item.count} employees`}
                            />
                            <Progress 
                              percent={Math.round((item.count / (statistics.total_employees || 1)) * 100)} 
                              size="small" 
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty description="No role data available" />
                    )}
                  </Card>
                </Col>
                
                <Col xs={24} lg={12}>
                  <Card title="Employees by Department" extra={<PieChartOutlined />}>
                    {statistics?.by_department && statistics.by_department.length > 0 ? (
                      <List
                        dataSource={statistics.by_department}
                        renderItem={(item) => (
                          <List.Item>
                            <List.Item.Meta
                              title={item.department_name || 'Unassigned'}
                              description={`${item.count} employees`}
                            />
                            <Progress 
                              percent={Math.round((item.count / (statistics.total_employees || 1)) * 100)} 
                              size="small" 
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty description="No department data available" />
                    )}
                  </Card>
                </Col>
              </Row>
            </TabPane>
          </Tabs>
        </Col>
      </Row>

      {/* Add Employee Modal - Using EnhancedEmployeeRegistration */}
      <Modal
        title="Add New Employee"
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
        width={1000}
        style={{ top: 20 }}
      >
        <EnhancedEmployeeRegistration />
      </Modal>

      {/* Edit Employee Modal with Comprehensive Features */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <EditOutlined style={{ marginRight: 8 }} />
            Edit Employee - {editingEmployee?.full_name || editingEmployee?.name}
          </div>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setUploadedImage(null);
          setUploadedDocument(null);
        }}
        footer={null}
        width={900}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Tabs defaultActiveKey="personal" size="large">
            {/* Personal Information Tab */}
            <TabPane 
              tab={
                <span>
                  <UserOutlined />
                  Personal Info
                </span>
              } 
              key="personal"
            >
              <Row gutter={16}>
                <Col span={24} style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    {(() => {
                      const existingImagePath = editingEmployee?.profileImage || editingEmployee?.profile_image;
                      const existingImageUrl = getImageUrl(existingImagePath);
                      const displaySrc = uploadedImage || existingImageUrl;
                      
                      return (
                        <Avatar
                          src={displaySrc}
                          icon={<UserOutlined />}
                          size={120}
                          style={{ border: '4px solid #f0f0f0' }}
                        />
                      );
                    })()}
                    <ImgCrop
                      rotationSlider
                      aspectSlider
                      showGrid
                      quality={0.8}
                      modalTitle="Crop Profile Picture"
                      modalWidth={600}
                    >
                      <Upload
                        beforeUpload={handleImageUpload}
                        showUploadList={false}
                        accept="image/*"
                      >
                        <Button
                          icon={<CameraOutlined />}
                          shape="circle"
                          size="large"
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            background: '#1890ff',
                            color: 'white',
                            border: '2px solid white'
                          }}
                        />
                      </Upload>
                    </ImgCrop>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary">Click camera icon to upload/crop profile picture</Text>
                  </div>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="fname"
                    label="First Name"
                    rules={[{ required: true, message: 'Please enter first name' }]}
                  >
                    <Input placeholder="First name" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="lname"
                    label="Last Name"
                    rules={[{ required: true, message: 'Please enter last name' }]}
                  >
                    <Input placeholder="Last name" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="full_name"
                    label="Full Name"
                    rules={[{ required: true, message: 'Please enter full name' }]}
                  >
                    <Input placeholder="Full name" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="sex"
                    label="Gender"
                    rules={[{ required: true, message: 'Please select gender' }]}
                  >
                    <Select placeholder="Select gender">
                      <Option value="M">Male</Option>
                      <Option value="F">Female</Option>
                      <Option value="other">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="age"
                    label="Age"
                  >
                    <InputNumber min={18} max={70} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="year_of_birth"
                    label="Year of Birth"
                  >
                    <InputNumber min={1950} max={2010} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Please enter email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="Email address" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="mobile"
                    label="Mobile Phone"
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="Mobile number" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="citizen_address"
                label="Address"
              >
                <Input.TextArea rows={3} placeholder="Full address" />
              </Form.Item>
            </TabPane>

            {/* Employment Information Tab */}
            <TabPane 
              tab={
                <span>
                  <TeamOutlined />
                  Employment
                </span>
              } 
              key="employment"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="employee_type"
                    label="Employee Type"
                    rules={[{ required: true, message: 'Please select employee type' }]}
                  >
                    <Select placeholder="Select employee type">
                      <Option value="trainer">Trainer</Option>
                      <Option value="admin">Administrative Staff</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    label="Status"
                    rules={[{ required: true, message: 'Please select status' }]}
                  >
                    <Radio.Group>
                      <Radio value="Active">Active</Radio>
                      <Radio value="Inactive">Inactive</Radio>
                    </Radio.Group>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
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
                <Col span={12}>
                  <Form.Item
                    name="role_id"
                    label="Role"
                  >
                    <Select placeholder="Select role" allowClear>
                      {roles.map(role => (
                        <Option key={role.role_id} value={role.role_id}>
                          {role.role_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="position"
                    label="Position"
                  >
                    <Input placeholder="Job position" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="dateOfJoining"
                    label="Date of Joining"
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="year_of_employment"
                    label="Year of Employment"
                  >
                    <InputNumber min={1990} max={2030} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>

            {/* Professional Information Tab */}
            <TabPane 
              tab={
                <span>
                  <TrophyOutlined />
                  Professional
                </span>
              } 
              key="professional"
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="qualification_level"
                    label="Qualification Level"
                  >
                    <Input placeholder="e.g., Bachelor's, Master's" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="qualification_subject"
                    label="Qualification Subject"
                  >
                    <Input placeholder="e.g., Computer Science" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="competence_level"
                    label="Competence Level"
                  >
                    <Select placeholder="Select competence level" allowClear>
                      <Option value="Level I">Level I</Option>
                      <Option value="Level II">Level II</Option>
                      <Option value="Level III">Level III</Option>
                      <Option value="Level IV">Level IV</Option>
                      <Option value="Level V">Level V</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="competence_occupation"
                    label="Competence Occupation"
                  >
                    <Input placeholder="Competence occupation" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="year_of_upgrading"
                    label="Year of Upgrading"
                  >
                    <InputNumber min={1990} max={2030} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="occupation_on_training"
                label="Occupation on Training (for Trainers)"
              >
                <Input placeholder="Training specialization" />
              </Form.Item>

              <Form.Item
                name="employed_work_process"
                label="Work Process (for Admin Staff)"
              >
                <Input placeholder="Administrative responsibilities" />
              </Form.Item>
            </TabPane>

            {/* Documents Tab */}
            <TabPane 
              tab={
                <span>
                  <FileOutlined />
                  Documents
                </span>
              } 
              key="documents"
            >
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="Upload Document"
                  >
                    <Upload
                      beforeUpload={handleDocumentUpload}
                      maxCount={1}
                      accept=".pdf,.jpg,.jpeg,.png"
                      fileList={uploadedDocument ? [{
                        uid: '1',
                        name: uploadedDocument.name,
                        status: 'done' as const,
                        url: URL.createObjectURL(uploadedDocument)
                      }] : []}
                      onRemove={() => setUploadedDocument(null)}
                    >
                      <Button icon={<UploadOutlined />} size="large">
                        Upload Document (PDF, JPG, PNG)
                      </Button>
                    </Upload>
                    <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                      Upload employee ID, certificate, or other identification document (Max 5MB)
                    </div>
                  </Form.Item>
                </Col>
              </Row>

              {editingEmployee?.document_path && (
                <Card title="Current Document" size="small">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FileOutlined style={{ fontSize: '24px', marginRight: '12px', color: '#1890ff' }} />
                      <div>
                        <div style={{ fontWeight: 'bold' }}>Employee Document</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {editingEmployee.document_path.split('/').pop()}
                        </div>
                      </div>
                    </div>
                    <Space>
                      <Button 
                        icon={<EyeOutlined />} 
                        onClick={() => handleDocumentPreview(editingEmployee.document_path!)}
                      >
                        Preview
                      </Button>
                      <Button 
                        icon={<DownloadOutlined />} 
                        onClick={() => downloadDocument(editingEmployee.document_path!, 'employee-document')}
                      >
                        Download
                      </Button>
                    </Space>
                  </div>
                </Card>
              )}
            </TabPane>
          </Tabs>
          
          <div style={{ marginTop: 24, textAlign: 'right', borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                setUploadedImage(null);
                setUploadedDocument(null);
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                Update Employee
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Enhanced Employee Details Drawer with Document Display */}
      <Drawer
        title={null}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={700}
        styles={{
          body: { padding: 0 }
        }}
      >
        {selectedEmployee && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header Section with Gradient Background */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '32px 24px',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background Pattern */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200px',
                height: '200px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                transform: 'translate(50%, -50%)'
              }} />
              
              <Row align="middle" gutter={24}>
                <Col>
                  <div style={{ position: 'relative' }}>
                    {(() => {
                      const profileImagePath = selectedEmployee.profileImage || selectedEmployee.profile_image;
                      const profileImageUrl = getImageUrl(profileImagePath);
                      
                      return (
                        <Avatar
                          src={profileImageUrl}
                          icon={<UserOutlined />}
                          size={120}
                          style={{ 
                            border: '4px solid rgba(255,255,255,0.3)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                            cursor: profileImageUrl ? 'pointer' : 'default'
                          }}
                          onClick={() => profileImagePath && handleImagePreview(profileImagePath)}
                        />
                      );
                    })()}
                    <div style={{
                      position: 'absolute',
                      bottom: -5,
                      right: -5,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: selectedEmployee.status === 'Active' ? '#52c41a' : '#ff4d4f',
                      border: '3px solid white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </Col>
                <Col flex={1}>
                  <Title level={2} style={{ color: 'white', margin: 0, fontSize: '28px' }}>
                    {selectedEmployee.full_name || selectedEmployee.name}
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', display: 'block', marginTop: '4px' }}>
                    {selectedEmployee.position || 'No position assigned'}
                  </Text>
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Tag color="rgba(255,255,255,0.2)" style={{ 
                      color: 'white', 
                      border: '1px solid rgba(255,255,255,0.3)',
                      background: 'rgba(255,255,255,0.1)'
                    }}>
                      ID: {selectedEmployee.employee_id}
                    </Tag>
                    {selectedEmployee.employee_type && (
                      <Tag color="rgba(255,255,255,0.2)" style={{ 
                        color: 'white', 
                        border: '1px solid rgba(255,255,255,0.3)',
                        background: 'rgba(255,255,255,0.1)'
                      }}>
                        {selectedEmployee.employee_type.toUpperCase()}
                      </Tag>
                    )}
                    <Tag color={selectedEmployee.status === 'Active' ? 'success' : 'error'}>
                      {selectedEmployee.status}
                    </Tag>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Content Section */}
            <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
              <Tabs defaultActiveKey="personal" size="large">
                {/* Personal Information Tab */}
                <TabPane 
                  tab={
                    <span>
                      <UserOutlined />
                      Personal Info
                    </span>
                  } 
                  key="personal"
                >
                  <Row gutter={[24, 16]}>
                    <Col xs={24} sm={12}>
                      <Card size="small" style={{ height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                          <UserOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                          <Text strong>Basic Information</Text>
                        </div>
                        <div style={{ lineHeight: '2' }}>
                          <p><Text type="secondary">First Name:</Text> <Text strong>{selectedEmployee.fname || 'Not provided'}</Text></p>
                          <p><Text type="secondary">Last Name:</Text> <Text strong>{selectedEmployee.lname || 'Not provided'}</Text></p>
                          <p><Text type="secondary">Full Name:</Text> <Text strong>{selectedEmployee.full_name || selectedEmployee.name}</Text></p>
                          <p><Text type="secondary">Gender:</Text> <Text strong>{selectedEmployee.sex === 'M' ? 'Male' : selectedEmployee.sex === 'F' ? 'Female' : selectedEmployee.sex || 'Not specified'}</Text></p>
                          <p><Text type="secondary">Age:</Text> <Text strong>{selectedEmployee.age || 'Not provided'}</Text></p>
                          <p><Text type="secondary">Year of Birth:</Text> <Text strong>{selectedEmployee.year_of_birth || 'Not provided'}</Text></p>
                        </div>
                      </Card>
                    </Col>
                    
                    <Col xs={24} sm={12}>
                      <Card size="small" style={{ height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                          <MailOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                          <Text strong>Contact Details</Text>
                        </div>
                        <div style={{ lineHeight: '2' }}>
                          <p><Text type="secondary">Email:</Text> <Text strong copyable>{selectedEmployee.email}</Text></p>
                          <p><Text type="secondary">Mobile:</Text> <Text strong copyable>{selectedEmployee.mobile || 'Not provided'}</Text></p>
                          <p><Text type="secondary">Phone:</Text> <Text strong copyable>{selectedEmployee.phone || 'Not provided'}</Text></p>
                          <p><Text type="secondary">Address:</Text> <Text strong>{selectedEmployee.citizen_address || 'Not provided'}</Text></p>
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </TabPane>

                {/* Employment Information Tab */}
                <TabPane 
                  tab={
                    <span>
                      <TeamOutlined />
                      Employment
                    </span>
                  } 
                  key="employment"
                >
                  <Row gutter={[24, 16]}>
                    <Col xs={24} sm={12}>
                      <Card size="small" style={{ height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                          <TeamOutlined style={{ color: '#722ed1', marginRight: '8px' }} />
                          <Text strong>Organization Details</Text>
                        </div>
                        <div style={{ lineHeight: '2' }}>
                          <p><Text type="secondary">Employee ID:</Text> <Text strong>{selectedEmployee.employee_id}</Text></p>
                          <p><Text type="secondary">Department:</Text> <Text strong>{selectedEmployee.department_name || 'Not assigned'}</Text></p>
                          <p><Text type="secondary">Role:</Text> <Text strong>{selectedEmployee.role_name || 'Not assigned'}</Text></p>
                          <p><Text type="secondary">Position:</Text> <Text strong>{selectedEmployee.position || 'Not specified'}</Text></p>
                          <p><Text type="secondary">Employee Type:</Text> <Text strong>{selectedEmployee.employee_type || 'Not specified'}</Text></p>
                        </div>
                      </Card>
                    </Col>
                    
                    <Col xs={24} sm={12}>
                      <Card size="small" style={{ height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                          <CalendarOutlined style={{ color: '#fa8c16', marginRight: '8px' }} />
                          <Text strong>Employment Timeline</Text>
                        </div>
                        <div style={{ lineHeight: '2' }}>
                          <p><Text type="secondary">Date of Joining:</Text> <Text strong>{selectedEmployee.dateOfJoining ? new Date(selectedEmployee.dateOfJoining).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          }) : 'Not provided'}</Text></p>
                          <p><Text type="secondary">Year of Employment:</Text> <Text strong>{selectedEmployee.year_of_employment || 'Not provided'}</Text></p>
                          <p><Text type="secondary">Employment Status:</Text> 
                            <Badge 
                              status={selectedEmployee.status === 'Active' ? 'success' : 'error'} 
                              text={selectedEmployee.status}
                              style={{ marginLeft: '8px' }}
                            />
                          </p>
                          {selectedEmployee.dateOfJoining && (
                            <p><Text type="secondary">Years of Service:</Text> <Text strong>
                              {Math.floor((new Date().getTime() - new Date(selectedEmployee.dateOfJoining).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} years
                            </Text></p>
                          )}
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </TabPane>

                {/* Professional Information Tab */}
                <TabPane 
                  tab={
                    <span>
                      <TrophyOutlined />
                      Professional
                    </span>
                  } 
                  key="professional"
                >
                  <Row gutter={[24, 16]}>
                    <Col xs={24} sm={12}>
                      <Card size="small" style={{ height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                          <TrophyOutlined style={{ color: '#faad14', marginRight: '8px' }} />
                          <Text strong>Qualifications</Text>
                        </div>
                        <div style={{ lineHeight: '2' }}>
                          <p><Text type="secondary">Qualification Level:</Text> <Text strong>{selectedEmployee.qualification_level || 'Not provided'}</Text></p>
                          <p><Text type="secondary">Qualification Subject:</Text> <Text strong>{selectedEmployee.qualification_subject || 'Not provided'}</Text></p>
                          <p><Text type="secondary">Year of Upgrading:</Text> <Text strong>{selectedEmployee.year_of_upgrading || 'Not provided'}</Text></p>
                          <p><Text type="secondary">Competence Level:</Text> <Text strong>{selectedEmployee.competence_level || 'Not provided'}</Text></p>
                          <p><Text type="secondary">Competence Occupation:</Text> <Text strong>{selectedEmployee.competence_occupation || 'Not provided'}</Text></p>
                        </div>
                      </Card>
                    </Col>
                    
                    <Col xs={24} sm={12}>
                      <Card size="small" style={{ height: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                          <SafetyOutlined style={{ color: '#13c2c2', marginRight: '8px' }} />
                          <Text strong>Specializations</Text>
                        </div>
                        <div style={{ lineHeight: '2' }}>
                          {selectedEmployee.occupation_on_training && (
                            <p><Text type="secondary">Training Occupation:</Text> <Text strong>{selectedEmployee.occupation_on_training}</Text></p>
                          )}
                          {selectedEmployee.employed_work_process && (
                            <p><Text type="secondary">Work Process:</Text> <Text strong>{selectedEmployee.employed_work_process}</Text></p>
                          )}
                          {!selectedEmployee.occupation_on_training && !selectedEmployee.employed_work_process && (
                            <Empty 
                              image={Empty.PRESENTED_IMAGE_SIMPLE} 
                              description="No specialization data available"
                              style={{ margin: '20px 0' }}
                            />
                          )}
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </TabPane>

                {/* Documents Tab */}
                <TabPane 
                  tab={
                    <span>
                      <FileOutlined />
                      Documents
                    </span>
                  } 
                  key="documents"
                >
                  <Row gutter={[24, 16]}>
                    <Col span={24}>
                      <Card size="small">
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                          <FileOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                          <Text strong>Employee Documents</Text>
                        </div>
                        
                        {selectedEmployee.document_path ? (
                          <div style={{ 
                            border: '1px solid #f0f0f0', 
                            borderRadius: '8px', 
                            padding: '16px',
                            background: '#fafafa'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <FileOutlined style={{ fontSize: '32px', marginRight: '16px', color: '#1890ff' }} />
                                <div>
                                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Employee Document</div>
                                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                    {selectedEmployee.document_path.split('/').pop()}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                                    Click to preview or download
                                  </div>
                                </div>
                              </div>
                              <Space direction="vertical" size="small">
                                <Button 
                                  icon={<EyeOutlined />} 
                                  onClick={() => handleDocumentPreview(selectedEmployee.document_path!)}
                                  type="primary"
                                  size="small"
                                >
                                  Preview
                                </Button>
                                <Button 
                                  icon={<DownloadOutlined />} 
                                  onClick={() => downloadDocument(selectedEmployee.document_path!, 'employee-document')}
                                  size="small"
                                >
                                  Download
                                </Button>
                              </Space>
                            </div>
                          </div>
                        ) : (
                          <Empty 
                            image={Empty.PRESENTED_IMAGE_SIMPLE} 
                            description="No documents uploaded"
                            style={{ margin: '40px 0' }}
                          />
                        )}
                      </Card>
                    </Col>
                  </Row>
                </TabPane>

                {/* System Information Tab */}
                <TabPane 
                  tab={
                    <span>
                      <InfoCircleOutlined />
                      System Info
                    </span>
                  } 
                  key="system"
                >
                  <Card size="small">
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                      <InfoCircleOutlined style={{ color: '#1890ff', marginRight: '8px' }} />
                      <Text strong>System & Database Information</Text>
                    </div>
                    <Row gutter={[24, 16]}>
                      <Col xs={24} sm={12}>
                        <div style={{ lineHeight: '2' }}>
                          <p><Text type="secondary">Employee ID:</Text> <Text strong>{selectedEmployee.employee_id}</Text></p>
                          <p><Text type="secondary">Internal ID:</Text> <Text strong>{selectedEmployee.id}</Text></p>
                          <p><Text type="secondary">Department ID:</Text> <Text strong>{selectedEmployee.department_id || 'Not assigned'}</Text></p>
                          <p><Text type="secondary">Role ID:</Text> <Text strong>{selectedEmployee.role_id || 'Not assigned'}</Text></p>
                          <p><Text type="secondary">College ID:</Text> <Text strong>{selectedEmployee.college_id || 'Not assigned'}</Text></p>
                        </div>
                      </Col>
                      <Col xs={24} sm={12}>
                        <div style={{ lineHeight: '2' }}>
                          <p><Text type="secondary">Profile Image:</Text> <Text strong>{selectedEmployee.profileImage || selectedEmployee.profile_image ? 'Available' : 'Not uploaded'}</Text></p>
                          <p><Text type="secondary">Document:</Text> <Text strong>{selectedEmployee.document_path ? 'Available' : 'Not uploaded'}</Text></p>
                          <p><Text type="secondary">Record Status:</Text> <Text strong>{selectedEmployee.status}</Text></p>
                          <p><Text type="secondary">Employee Type:</Text> <Text strong>{selectedEmployee.employee_type || 'Not specified'}</Text></p>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </TabPane>
              </Tabs>
            </div>

            {/* Footer Actions */}
            <div style={{ 
              padding: '16px 24px', 
              borderTop: '1px solid #f0f0f0',
              background: '#fafafa',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Employee ID: {selectedEmployee.employee_id} • Last updated: {new Date().toLocaleDateString()}
                </Text>
              </div>
              <Space>
                <Button onClick={() => setDrawerVisible(false)}>
                  Close
                </Button>
                <Button type="primary" onClick={() => {
                  setDrawerVisible(false);
                  showEditModal(selectedEmployee);
                }}>
                  Edit Employee
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Drawer>

      {/* Image Preview Modal */}
      <Modal
        open={imagePreviewVisible}
        title="Profile Picture"
        footer={null}
        onCancel={() => setImagePreviewVisible(false)}
        width={600}
        centered
      >
        <Image
          src={imagePreviewUrl}
          alt="Profile Picture"
          style={{ width: '100%' }}
          preview={{
            toolbarRender: (
              _,
              {
                transform: { scale },
                actions: { onFlipY, onFlipX, onRotateLeft, onRotateRight, onZoomOut, onZoomIn },
              },
            ) => (
              <Space size={12} className="toolbar-wrapper">
                <Button icon={<ZoomInOutlined />} onClick={onZoomIn} />
                <Button icon={<ZoomOutOutlined />} onClick={onZoomOut} />
                <Button icon={<RotateLeftOutlined />} onClick={onRotateLeft} />
                <Button icon={<RotateRightOutlined />} onClick={onRotateRight} />
                <Button onClick={onFlipX}>Flip X</Button>
                <Button onClick={onFlipY}>Flip Y</Button>
              </Space>
            ),
          }}
        />
      </Modal>

      {/* Document Preview Modal */}
      <Modal
        open={documentPreviewVisible}
        title="Document Preview"
        footer={[
          <Button key="download" icon={<DownloadOutlined />} onClick={() => downloadDocument(documentPreviewUrl, 'document')}>
            Download
          </Button>,
          <Button key="close" onClick={() => setDocumentPreviewVisible(false)}>
            Close
          </Button>
        ]}
        onCancel={() => setDocumentPreviewVisible(false)}
        width={800}
        centered
      >
        {documentPreviewUrl.toLowerCase().includes('.pdf') ? (
          <iframe
            src={documentPreviewUrl}
            style={{ width: '100%', height: '600px', border: 'none' }}
            title="Document Preview"
          />
        ) : (
          <Image
            src={documentPreviewUrl}
            alt="Document"
            style={{ width: '100%' }}
          />
        )}
      </Modal>
    </div>
  );
};

export default EnhancedEmployeeProfile;
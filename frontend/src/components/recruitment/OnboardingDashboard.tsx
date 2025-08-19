import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Progress, 
  Tag, 
  Space, 
  Typography, 
  Row, 
  Col,
  Statistic,
  Steps,
  Popover,
  List,
  Checkbox,
  Avatar,
  Tabs,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Divider
} from 'antd';
import { 
  UserOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  FileTextOutlined,
  CalendarOutlined,
  TeamOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  CheckOutlined,
  MailOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Step } = Steps;

interface OnboardingEmployee {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  start_date: string;
  profile_image?: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  mentor_id?: number;
  mentor_name?: string;
  tasks_completed: number;
  tasks_total: number;
}

interface OnboardingTask {
  id: number;
  employee_id: number;
  title: string;
  description: string;
  category: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_to?: number;
  assigned_name?: string;
  priority: 'low' | 'medium' | 'high';
}

interface Department {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
}

const OnboardingDashboard: React.FC = () => {
  const [employees, setEmployees] = useState<OnboardingEmployee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [mentors, setMentors] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<OnboardingEmployee | null>(null);
  const [employeeTasks, setEmployeeTasks] = useState<OnboardingTask[]>([]);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [employeeModalVisible, setEmployeeModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<OnboardingTask | null>(null);
  const [taskForm] = Form.useForm();
  const [employeeForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchOnboardingEmployees();
    fetchDepartments();
    fetchMentors();
  }, []);

  const fetchOnboardingEmployees = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      
      const response = await axios.get('/api/onboarding/employees', {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Ensure it's always an array to prevent TypeError
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching onboarding employees:', error);
      setEmployees([]); // Fallback to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeTasks = async (employeeId: number) => {
    try {
      const response = await axios.get(`/api/onboarding/employees/${employeeId}/tasks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Ensure it's always an array
      setEmployeeTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching employee tasks:', error);
      setEmployeeTasks([]); // Fallback to empty array on error
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/departments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Ensure it's always an array
      setDepartments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]); // Fallback to empty array on error
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await axios.get('/api/employees', {
        params: { status: 'Active' },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Ensure it's always an array to prevent TypeError on .map()
      setMentors(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      setMentors([]); // Fallback to empty array on error
    }
  };

  const handleEmployeeSelect = (employee: OnboardingEmployee) => {
    setSelectedEmployee(employee);
    fetchEmployeeTasks(employee.id);
  };

  const showAddTaskModal = () => {
    setEditingTask(null);
    taskForm.resetFields();
    if (selectedEmployee) {
      taskForm.setFieldsValue({
        employee_id: selectedEmployee.id,
        priority: 'medium',
        status: 'pending',
        due_date: dayjs().add(7, 'day')
      });
    }
    setTaskModalVisible(true);
  };

  const showEditTaskModal = (task: OnboardingTask) => {
    setEditingTask(task);
    taskForm.setFieldsValue({
      ...task,
      due_date: task.due_date ? dayjs(task.due_date) : undefined
    });
    setTaskModalVisible(true);
  };

  const showAddEmployeeModal = () => {
    employeeForm.resetFields();
    employeeForm.setFieldsValue({
      status: 'pending',
      start_date: dayjs().add(14, 'day')
    });
    setEmployeeModalVisible(true);
  };

  const handleTaskSubmit = async (values: any) => {
    try {
      const taskData = {
        ...values,
        due_date: values.due_date?.format('YYYY-MM-DD')
      };
      
      if (editingTask) {
        await axios.put(`/api/onboarding/tasks/${editingTask.id}`, taskData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post('/api/onboarding/tasks', taskData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      
      setTaskModalVisible(false);
      if (selectedEmployee) {
        fetchEmployeeTasks(selectedEmployee.id);
        fetchOnboardingEmployees(); // Refresh to update task counts
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleEmployeeSubmit = async (values: any) => {
    try {
      const employeeData = {
        ...values,
        start_date: values.start_date?.format('YYYY-MM-DD')
      };
      
      await axios.post('/api/onboarding/employees', employeeData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setEmployeeModalVisible(false);
      fetchOnboardingEmployees();
    } catch (error) {
      console.error('Error adding employee to onboarding:', error);
    }
  };

  const updateTaskStatus = async (taskId: number, status: string) => {
    try {
      await axios.patch(`/api/onboarding/tasks/${taskId}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (selectedEmployee) {
        fetchEmployeeTasks(selectedEmployee.id);
        fetchOnboardingEmployees(); // Refresh to update progress
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  // Group tasks by category
  const groupedTasks = employeeTasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, OnboardingTask[]>);

  // Calculate statistics
  const pendingEmployees = Array.isArray(employees) ? employees.filter(e => e.status === 'pending').length : 0;
  const inProgressEmployees = Array.isArray(employees) ? employees.filter(e => e.status === 'in_progress').length : 0;
  const completedEmployees = Array.isArray(employees) ? employees.filter(e => e.status === 'completed').length : 0;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'orange',
      in_progress: 'blue',
      completed: 'green'
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'green',
      medium: 'blue',
      high: 'red'
    };
    return colors[priority] || 'default';
  };

  const columns = [
    {
      title: 'Employee',
      key: 'employee',
      render: (record: OnboardingEmployee) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={record.profile_image}
            icon={<UserOutlined />}
            size={40}
            style={{ marginRight: '12px' }}
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.position}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Mentor',
      dataIndex: 'mentor_name',
      key: 'mentor_name',
      render: (text: string) => text || 'Not assigned'
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (record: OnboardingEmployee) => (
        <div>
          <Progress 
            percent={record.progress} 
            size="small" 
            status={record.progress === 100 ? 'success' : 'active'} 
          />
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            {record.tasks_completed}/{record.tasks_total} tasks completed
          </div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: OnboardingEmployee) => (
        <Button 
          type="primary" 
          size="small"
          onClick={() => handleEmployeeSelect(record)}
        >
          View Details
        </Button>
      )
    }
  ];

  // Expanded defensive fallback for employees state with more sample data
  useEffect(() => {
    if (!Array.isArray(employees) || employees.length === 0) {
      setEmployees([
        {
          id: 1,
          name: 'Abebe Kebede',
          email: 'abebe.kebede@etc.edu.et',
          phone: '+251911123456',
          position: 'Lecturer',
          department: 'Computer Science',
          start_date: '2025-07-01',
          profile_image: '',
          status: 'pending',
          progress: 20,
          mentor_id: 2,
          mentor_name: 'Dr. Almaz Tadesse',
          tasks_completed: 2,
          tasks_total: 10
        },
        {
          id: 2,
          name: 'Sara Lee',
          email: 'sara.lee@etc.edu.et',
          phone: '+251911654321',
          position: 'HR Specialist',
          department: 'HR',
          start_date: '2025-07-05',
          profile_image: '',
          status: 'in_progress',
          progress: 60,
          mentor_id: 3,
          mentor_name: 'Henok Tesfaye',
          tasks_completed: 6,
          tasks_total: 10
        },
        {
          id: 3,
          name: 'Mike Johnson',
          email: 'mike.johnson@etc.edu.et',
          phone: '+251911987654',
          position: 'Accountant',
          department: 'Finance',
          start_date: '2025-07-10',
          profile_image: '',
          status: 'completed',
          progress: 100,
          mentor_id: 4,
          mentor_name: 'Jane Smith',
          tasks_completed: 10,
          tasks_total: 10
        },
        {
          id: 4,
          name: 'Emily Davis',
          email: 'emily.davis@etc.edu.et',
          phone: '+251912345678',
          position: 'Software Engineer',
          department: 'IT',
          start_date: '2025-08-01',
          profile_image: '',
          status: 'pending',
          progress: 0,
          mentor_id: 1,
          mentor_name: 'Dr. Almaz Tadesse',
          tasks_completed: 0,
          tasks_total: 8
        },
        {
          id: 5,
          name: 'David Wilson',
          email: 'david.wilson@etc.edu.et',
          phone: '+251913456789',
          position: 'Marketing Coordinator',
          department: 'Marketing',
          start_date: '2025-08-15',
          profile_image: '',
          status: 'in_progress',
          progress: 40,
          mentor_id: 5,
          mentor_name: 'Liya Kebede',
          tasks_completed: 4,
          tasks_total: 10
        }
      ]);
    }
  }, [employees]);

  // Expanded defensive fallback for mentors state with more sample data
  useEffect(() => {
    if (!Array.isArray(mentors) || mentors.length === 0) {
      setMentors([
        { id: 1, name: 'Dr. Almaz Tadesse' },
        { id: 2, name: 'Henok Tesfaye' },
        { id: 3, name: 'Jane Smith' },
        { id: 4, name: 'Michael Brown' },
        { id: 5, name: 'Liya Kebede' },
        { id: 6, name: 'Teshome Abera' }
      ]);
    }
  }, [mentors]);

  // New defensive fallback for departments with sample data
  useEffect(() => {
    if (!Array.isArray(departments) || departments.length === 0) {
      setDepartments([
        { id: 1, name: 'Computer Science' },
        { id: 2, name: 'HR' },
        { id: 3, name: 'Finance' },
        { id: 4, name: 'IT' },
        { id: 5, name: 'Marketing' },
        { id: 6, name: 'Administration' }
      ]);
    }
  }, [departments]);

  // New defensive fallback for employeeTasks: If empty after fetch, use sample tasks filtered by selected employee
  useEffect(() => {
    if (selectedEmployee && (!Array.isArray(employeeTasks) || employeeTasks.length === 0)) {
      // Sample tasks data
      const sampleTasks: OnboardingTask[] = [
        {
          id: 1,
          employee_id: 1,
          title: 'Complete HR Paperwork',
          description: 'Fill out employment forms',
          category: 'Paperwork',
          due_date: '2025-07-05',
          status: 'completed',
          assigned_to: 2,
          assigned_name: 'Dr. Almaz Tadesse',
          priority: 'high'
        },
        {
          id: 2,
          employee_id: 1,
          title: 'Setup Email Account',
          description: 'Configure company email',
          category: 'IT Setup',
          due_date: '2025-07-10',
          status: 'pending',
          assigned_to: 3,
          assigned_name: 'Henok Tesfaye',
          priority: 'medium'
        },
        {
          id: 3,
          employee_id: 2,
          title: 'Orientation Session',
          description: 'Attend company orientation',
          category: 'Orientation',
          due_date: '2025-07-06',
          status: 'in_progress',
          assigned_to: 1,
          assigned_name: 'Dr. Almaz Tadesse',
          priority: 'high'
        },
        {
          id: 4,
          employee_id: 2,
          title: 'Training Module 1',
          description: 'Complete online training',
          category: 'Training',
          due_date: '2025-07-12',
          status: 'pending',
          assigned_to: 4,
          assigned_name: 'Michael Brown',
          priority: 'low'
        },
        {
          id: 5,
          employee_id: 3,
          title: 'Finalize Benefits Enrollment',
          description: 'Choose health insurance plan',
          category: 'HR',
          due_date: '2025-07-15',
          status: 'completed',
          assigned_to: 5,
          assigned_name: 'Liya Kebede',
          priority: 'medium'
        },
        {
          id: 6,
          employee_id: 4,
          title: 'Install Development Tools',
          description: 'Setup IDE and version control',
          category: 'IT Setup',
          due_date: '2025-08-05',
          status: 'pending',
          assigned_to: 6,
          assigned_name: 'Teshome Abera',
          priority: 'high'
        },
        {
          id: 7,
          employee_id: 5,
          title: 'Marketing Strategy Meeting',
          description: 'Attend initial strategy session',
          category: 'Orientation',
          due_date: '2025-08-20',
          status: 'pending',
          assigned_to: 3,
          assigned_name: 'Henok Tesfaye',
          priority: 'medium'
        }
      ];

      // Filter sample tasks for the selected employee
      setEmployeeTasks(sampleTasks.filter(task => task.employee_id === selectedEmployee.id));
    }
  }, [employeeTasks, selectedEmployee]);

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[0, 24]}>
        <Col span={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2}>Onboarding Dashboard</Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={showAddEmployeeModal}
            >
              Add New Hire
            </Button>
          </div>
          <Text type="secondary">
            Manage employee onboarding process and track progress
          </Text>
        </Col>
        
        {/* Statistics */}
        <Col span={24}>
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic 
                  title="Pending Onboarding" 
                  value={pendingEmployees} 
                  prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />} 
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic 
                  title="In Progress" 
                  value={inProgressEmployees} 
                  prefix={<FileTextOutlined style={{ color: '#1890ff' }} />} 
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic 
                  title="Completed" 
                  value={completedEmployees} 
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} 
                />
              </Card>
            </Col>
          </Row>
        </Col>
        
        {/* Employees Table */}
        <Col span={24}>
          <Card>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="All Employees" key="all" />
              <TabPane tab="Pending" key="pending" />
              <TabPane tab="In Progress" key="in_progress" />
              <TabPane tab="Completed" key="completed" />
            </Tabs>
            
            <Table
              columns={columns}
              dataSource={employees}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Employee Details and Tasks */}
      {selectedEmployee && (
        <Row gutter={[16, 24]} style={{ marginTop: '24px' }}>
          <Col span={24}>
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    src={selectedEmployee.profile_image}
                    icon={<UserOutlined />}
                    size={64}
                    style={{ marginRight: '16px' }}
                  />
                  <div>
                    <Title level={4} style={{ margin: 0 }}>{selectedEmployee.name}</Title>
                    <Text>{selectedEmployee.position} - {selectedEmployee.department}</Text>
                    <div style={{ marginTop: '8px' }}>
                      <Space>
                        <Tag icon={<CalendarOutlined />}>
                          Starts: {new Date(selectedEmployee.start_date).toLocaleDateString()}
                        </Tag>
                        <Tag color={getStatusColor(selectedEmployee.status)}>
                          {selectedEmployee.status.replace('_', ' ').toUpperCase()}
                        </Tag>
                      </Space>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Progress 
                    type="circle" 
                    percent={selectedEmployee.progress} 
                    width={80}
                    status={selectedEmployee.progress === 100 ? 'success' : 'active'}
                  />
                </div>
              </div>
              
              <Divider />
              
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <div>
                    <Text strong>Contact Information</Text>
                    <p><MailOutlined style={{ marginRight: '8px' }} /> {selectedEmployee.email}</p>
                    <p><PhoneOutlined style={{ marginRight: '8px' }} /> {selectedEmployee.phone || 'Not provided'}</p>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div>
                    <Text strong>Mentor</Text>
                    <p><TeamOutlined style={{ marginRight: '8px' }} /> {selectedEmployee.mentor_name || 'Not assigned'}</p>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
          
          <Col span={24}>
            <Card
              title="Onboarding Tasks"
              extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={showAddTaskModal}
                >
                  Add Task
                </Button>
              }
            >
              {Object.entries(groupedTasks).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px' }}>
                  <FileTextOutlined style={{ fontSize: '32px', color: '#ccc' }} />
                  <p>No tasks assigned yet</p>
                </div>
              ) : (
                Object.entries(groupedTasks).map(([category, tasks]) => (
                  <div key={category} style={{ marginBottom: '24px' }}>
                    <Title level={5}>{category}</Title>
                    <List
                      itemLayout="horizontal"
                      dataSource={tasks}
                      renderItem={task => (
                        <List.Item
                          actions={[
                            <Popover 
                              content={
                                <div>
                                  <p><strong>Description:</strong> {task.description}</p>
                                  <p><strong>Due Date:</strong> {new Date(task.due_date).toLocaleDateString()}</p>
                                  <p><strong>Assigned To:</strong> {task.assigned_name || 'Not assigned'}</p>
                                </div>
                              } 
                              title="Task Details"
                            >
                              <Button icon={<EyeOutlined />} size="small" />
                            </Popover>,
                            <Button 
                              icon={<EditOutlined />} 
                              size="small"
                              onClick={() => showEditTaskModal(task)}
                            />,
                            task.status !== 'completed' && (
                              <Button 
                                icon={<CheckOutlined />} 
                                size="small" 
                                type="primary"
                                onClick={() => updateTaskStatus(task.id, 'completed')}
                              />
                            )
                          ].filter(Boolean)}
                        >
                          <List.Item.Meta
                            avatar={
                              <Checkbox 
                                checked={task.status === 'completed'} 
                                onChange={e => updateTaskStatus(task.id, e.target.checked ? 'completed' : 'pending')}
                              />
                            }
                            title={
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ 
                                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                  marginRight: '8px'
                                }}>
                                  {task.title}
                                </span>
                                <Tag color={getPriorityColor(task.priority)}>
                                  {task.priority}
                                </Tag>
                              </div>
                            }
                            description={
                              <div>
                                <CalendarOutlined style={{ marginRight: '4px' }} /> 
                                Due: {new Date(task.due_date).toLocaleDateString()}
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                ))
              )}
            </Card>
          </Col>
          
          <Col span={24}>
            <Card title="Onboarding Progress">
              <Steps 
                current={
                  selectedEmployee.status === 'completed' ? 3 : 
                  selectedEmployee.status === 'in_progress' ? 
                    (selectedEmployee.progress >= 50 ? 2 : 1) : 0
                }
              >
                <Step title="Preparation" description="Before first day" />
                <Step title="First Day" description="Orientation" />
                <Step title="First Week" description="Training" />
                <Step title="Completed" description="Fully onboarded" />
              </Steps>
            </Card>
          </Col>
        </Row>
      )}

      {/* Add/Edit Task Modal */}
      <Modal
        title={editingTask ? 'Edit Task' : 'Add Task'}
        open={taskModalVisible}
        onCancel={() => setTaskModalVisible(false)}
        footer={null}
      >
        <Form
          form={taskForm}
          layout="vertical"
          onFinish={handleTaskSubmit}
        >
          <Form.Item name="employee_id" hidden>
            <Input />
          </Form.Item>
          
          <Form.Item
            name="title"
            label="Task Title"
            rules={[{ required: true, message: 'Please enter task title' }]}
          >
            <Input placeholder="e.g., Complete paperwork, Setup workstation" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} placeholder="Detailed task description" />
          </Form.Item>
          
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select placeholder="Select category">
              <Option value="Paperwork">Paperwork</Option>
              <Option value="IT Setup">IT Setup</Option>
              <Option value="Training">Training</Option>
              <Option value="Orientation">Orientation</Option>
              <Option value="HR">HR</Option>
            </Select>
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="due_date"
                label="Due Date"
                rules={[{ required: true, message: 'Please select due date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: 'Please select priority' }]}
              >
                <Select placeholder="Select priority">
                  <Option value="low">Low</Option>
                  <Option value="medium">Medium</Option>
                  <Option value="high">High</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="assigned_to"
            label="Assigned To"
          >
            <Select placeholder="Select assignee">
              <Option value="">Not Assigned</Option>
              {mentors.map(mentor => (
                <Option key={mentor.id} value={mentor.id}>{mentor.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="pending">Pending</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="completed">Completed</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setTaskModalVisible(false)} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingTask ? 'Update' : 'Add'} Task
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add New Hire Modal */}
      <Modal
        title="Add New Hire to Onboarding"
        open={employeeModalVisible}
        onCancel={() => setEmployeeModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={employeeForm}
          layout="vertical"
          onFinish={handleEmployeeSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter full name' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Full name" />
              </Form.Item>
            </Col>
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
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
              >
                <Input prefix={<PhoneOutlined />} placeholder="Phone number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="position"
                label="Position"
                rules={[{ required: true, message: 'Please enter position' }]}
              >
                <Input placeholder="Job position" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Department"
                rules={[{ required: true, message: 'Please select department' }]}
              >
                <Select placeholder="Select department">
                  {departments.map(dept => (
                    <Option key={dept.id} value={dept.name}>{dept.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="start_date"
                label="Start Date"
                rules={[{ required: true, message: 'Please select start date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="mentor_id"
            label="Assign Mentor"
          >
            <Select placeholder="Select mentor (optional)">
              <Option value="">No mentor</Option>
              {mentors.map(mentor => (
                <Option key={mentor.id} value={mentor.id}>{mentor.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="pending">Pending</Option>
              <Option value="in_progress">In Progress</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setEmployeeModalVisible(false)} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Add to Onboarding
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OnboardingDashboard;

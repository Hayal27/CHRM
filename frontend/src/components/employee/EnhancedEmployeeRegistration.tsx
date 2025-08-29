import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  message,
  Steps,
  App,
  Space,
  Typography,
  Divider,
  Checkbox,
  InputNumber,
  Upload
} from 'antd';
import {
  UserAddOutlined,
  TeamOutlined,
  BookOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  UploadOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;

interface Role {
  role_id: number;
  role_name: string;
}

interface Department {
  department_id: number;
  name: string;
}

interface College {
  college_id: number;
  college_name: string;
}

interface Employee {
  employee_id: number;
  name: string;
}

const EnhancedEmployeeRegistration: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message: messageApi } = App.useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [employeeType, setEmployeeType] = useState<'trainer' | 'admin'>('admin');
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<any>({}); // Store all form data across steps
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);

  useEffect(() => {
    fetchFormData();
  }, []);

  
  // Function to calculate age from birth year
  const calculateAge = (birthYear: number) => {
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  };

  // Handle year of birth change and auto-calculate age
  const handleYearOfBirthChange = (value: number | null) => {
    if (value) {
      const age = calculateAge(value);
      setCalculatedAge(age);
      // Update the form field
      form.setFieldsValue({ age: age });
    } else {
      setCalculatedAge(null);
      form.setFieldsValue({ age: null });
    }
  };

  const fetchFormData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch roles
      const rolesResponse = await axios.get(`${API_BASE_URL}/api/admin/roles`, config);
      if (rolesResponse.data.success) {
        setRoles(rolesResponse.data.roles);
      }

      // Fetch departments
      const departmentsResponse = await axios.get(`${API_BASE_URL}/api/admin/departments`, config);
      if (departmentsResponse.data.success) {
        setDepartments(departmentsResponse.data.departments);
      }

      // Fetch colleges from education office
      const collegesResponse = await axios.get(`${API_BASE_URL}/api/education-office/admin/colleges`, config);
      if (collegesResponse.data.success) {
        setColleges(collegesResponse.data.colleges);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
      messageApi.error('Failed to load form data');
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

            // Combine all form data from all steps
      const allFormData = {
        ...formData,
        ...values
      };

      // Ensure employee_type is a valid string
      const validEmployeeType = typeof employeeType === 'string' && ['trainer', 'admin'].includes(employeeType) 
        ? employeeType 
        : 'admin';

      // Remove any duplicate employee_type and use the validated value
      delete allFormData.employee_type;
      allFormData.employee_type = validEmployeeType;

      // Debug: Log form values
      console.log('🔍 Final form data:', allFormData);
      console.log('🔍 Employee type:', employeeType);
      console.log('🔍 Employee type type:', typeof employeeType);
      console.log('🔍 Validated employee type:', validEmployeeType);
      console.log('🔍 Employee type JSON:', JSON.stringify(employeeType));
      console.log('🔍 Document file:', documentFile);

      let requestData;
      let config;

      if (documentFile) {
        // Use FormData if document is uploaded
        const formDataObj = new FormData();

                // Add all form fields to FormData (excluding employee_type to avoid duplication)
        Object.keys(allFormData).forEach(key => {
          if (key === 'employee_type') {
            // Skip employee_type here, we'll add it separately
            return;
          }
          if (key === 'dateOfJoining' && allFormData[key]) {
            formDataObj.append(key, allFormData[key].format('YYYY-MM-DD'));
          } else if (allFormData[key] !== undefined && allFormData[key] !== null) {
            formDataObj.append(key, allFormData[key]);
          }
        });

        // Add employee type only once
        formDataObj.append('employee_type', validEmployeeType);

        // Add document file
        formDataObj.append('document', documentFile);

        requestData = formDataObj;
        config = {
          headers: {
            Authorization: `Bearer ${token}`
            // Don't set Content-Type for FormData - axios will set it automatically with boundary
          }
        };
      } else {
        // Use JSON if no document
        const employeeData = {
          ...allFormData,
          employee_type: validEmployeeType,
          dateOfJoining: allFormData.dateOfJoining?.format('YYYY-MM-DD')
        };

        requestData = employeeData;
        config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };
      }

      const response = await axios.post(`${API_BASE_URL}/api/employees/enhanced/add`, requestData, config);
      
      if (response.data.success) {
        messageApi.success(`${validEmployeeType.charAt(0).toUpperCase() + validEmployeeType.slice(1)} employee created successfully!`);
        form.resetFields();
        setCurrentStep(0);
        setDocumentFile(null);
        setFormData({});
      } else {
        messageApi.error(response.data.message || 'Failed to create employee');
      }
    } catch (error: any) {
      console.error('Error creating employee:', error);
      messageApi.error(error.response?.data?.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = (file: File) => {
    // Validate file type and size
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      messageApi.error('Please upload a PDF, JPEG, or PNG file');
      return false;
    }

    if (file.size > maxSize) {
      messageApi.error('File size must be less than 5MB');
      return false;
    }

    setDocumentFile(file);
    messageApi.success('Document uploaded successfully');
    return false; // Prevent default upload behavior
  };

  const nextStep = () => {
    form.validateFields().then((values) => {
      // Save current step data to formData state
      setFormData(prev => ({ ...prev, ...values }));
      setCurrentStep(currentStep + 1);
    }).catch(() => {
      messageApi.error('Please fill in all required fields');
    });
  };

  const prevStep = () => {
    // Save current step data before going back
    const currentValues = form.getFieldsValue();
    setFormData(prev => ({ ...prev, ...currentValues }));
    setCurrentStep(currentStep - 1);
  };

  // Load saved data when step changes
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      form.setFieldsValue(formData);
    }
  }, [currentStep, formData, form]);

  const renderPersonalInfoStep = () => (
    <Card title="Personal Information">
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item
            
            label="Employee Type"
            rules={[{ required: true, message: 'Please select employee type' }]}
          >
            <Select 
              value={employeeType} 
              onChange={setEmployeeType}
              size="large"
            >
              <Option value="trainer">Trainer</Option>
              <Option value="admin">Administrative Staff</Option>
            </Select>
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
        <Col span={6}>
          <Form.Item
            name="fname"
            label="First Name"
          >
            <Input placeholder="First name" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name="lname"
            label="Last Name"
          >
            <Input placeholder="Last name" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="sex"
            label="Sex"
            rules={[{ required: true, message: 'Please select sex' }]}
          >
            <Select placeholder="Select sex">
              <Option value="M">Male</Option>
              <Option value="F">Female</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="age"
            label="Age (Auto-calculated)"
          >
            <InputNumber 
              min={18} 
              max={70} 
              placeholder="Auto-calculated from birth year" 
              style={{ width: '100%' }} 
              disabled={calculatedAge !== null}
              value={calculatedAge}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="year_of_birth"
            label="Year of Birth"
          >
            <InputNumber 
              min={1950} 
              max={2010} 
              placeholder="Year of birth" 
              style={{ width: '100%' }} 
              onChange={handleYearOfBirthChange}
            />
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
              { type: 'email', message: 'Please enter valid email' }
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="mobile"
            label="Mobile"
          >
            <Input placeholder="Enter mobile number" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="citizen_address"
        label="Citizen Address"
      >
        <Input.TextArea rows={3} placeholder="Enter citizen address" />
      </Form.Item>
    </Card>
  );

  const renderQualificationStep = () => (
    <Card title="Qualification & Employment Information">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="year_of_employment"
            label="Year of Employment"
          >
            <InputNumber min={1990} max={2030} placeholder="Year of employment" style={{ width: '100%' }} />
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
            name="qualification_level"
            label="Qualification Level"
          >
            <Input placeholder="e.g.C, B, A, PhD" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="qualification_subject"
            label="Qualification Subject"
          >
            <Input placeholder="e.g., Computer Science, Engineering, IT" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="year_of_upgrading"
            label="Year of Upgrading"
          >
            <InputNumber min={1990} max={2030} placeholder="Year" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
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
        <Col span={8}>
          <Form.Item
            name="competence_occupation"
            label="Competence Occupation"
          >
            <Input placeholder="Competence occupation" />
          </Form.Item>
        </Col>
      </Row>

      {/* Type-specific fields */}
      {employeeType === 'trainer' && (
        <Form.Item
          name="occupation_on_training"
          label="Occupation on Training"
          rules={[{ required: true, message: 'Please enter occupation on training' }]}
        >
          <Input placeholder="Enter occupation on training" />
        </Form.Item>
      )}

      {employeeType === 'admin' && (
        <Form.Item
          name="employed_work_process"
          label="Employed Work Process"
          rules={[{ required: true, message: 'Please enter employed work process' }]}
        >
          <Input placeholder="Enter employed work process" />
        </Form.Item>
      )}
    </Card>
  );

  const renderSystemInfoStep = () => (
    <Card title="System & Organizational Information">
      <Row gutter={16}>
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
        <Col span={12}>
          <Form.Item
            name="department_id"
            label="Ocopation"
          >
            <Select placeholder="Select Ocopation" allowClear>
              {departments.map(dept => (
                <Option key={dept.department_id} value={dept.department_id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
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
            label="Employee Document (Optional)"
          >
            <Upload
              beforeUpload={handleDocumentUpload}
              maxCount={1}
              accept=".pdf,.jpg,.jpeg,.png"
              fileList={documentFile ? [{
                uid: '1',
                name: documentFile.name,
                status: 'done' as const,
                url: URL.createObjectURL(documentFile)
              }] : []}
              onRemove={() => setDocumentFile(null)}
            >
              <Button icon={<UploadOutlined />}>
                Upload Document (PDF, JPG, PNG)
              </Button>
            </Upload>
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              Optional: Upload employee ID, certificate, or other identification document (Max 5MB)
            </div>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="position"
        label="Position"
      >
        <Input placeholder="Enter position/job title" />
      </Form.Item>

      <Divider>User Account Creation</Divider>

      <Form.Item name="create_user" valuePropName="checked">
        <Checkbox>Create user account for this employee</Checkbox>
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="user_name"
            label="Username"
          >
            <Input placeholder="Username (defaults to email)" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="password"
            label="Password"
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const steps = [
    {
      title: 'Personal Info',
      content: renderPersonalInfoStep(),
      icon: <UserAddOutlined />
    },
    {
      title: 'Qualification',
      content: renderQualificationStep(),
      icon: <BookOutlined />
    },
    {
      title: 'System Info',
      content: renderSystemInfoStep(),
      icon: <TeamOutlined />
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Enhanced Employee Registration</Title>
      <Text type="secondary">
        Register new {employeeType} with comprehensive information
      </Text>

      <Divider />

      <Steps current={currentStep} style={{ marginBottom: '24px' }}>
        {steps.map((step, index) => (
          <Step key={index} title={step.title} icon={step.icon} />
        ))}
      </Steps>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ employee_type: 'admin', create_user: true, password: 'Hrm@123' }}
      >
        {steps[currentStep].content}

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Space>
            {currentStep > 0 && (
              <Button icon={<ArrowLeftOutlined />} onClick={prevStep}>
                Previous
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" icon={<ArrowRightOutlined />} onClick={nextStep}>
                Next
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={<SaveOutlined />}
                size="large"
              >
                Create Employee
              </Button>
            )}
          </Space>
        </div>
      </Form>
    </div>
  );
};

const EnhancedEmployeeRegistrationWithApp: React.FC = () => (
  <App>
    <EnhancedEmployeeRegistration />
  </App>
);

export default EnhancedEmployeeRegistrationWithApp;
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Input, 
  Select, 
  Tag, 
  List, 
  Divider, 
  Modal, 
  Form,
  Space,
  Alert,
  Spin
} from 'antd';
import { 
  SearchOutlined, 
  EnvironmentOutlined, 
  DollarOutlined, 
  CalendarOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import axios from 'axios';
import SignUpPage from '../../pages/SignUpPage';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface JobVacancy {
  id: number;
  title: string;
  department: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  salary_range?: string;
  location?: string;
  employment_type?: string;
  experience_level?: string;
  education_required?: string;
  skills_required?: string;
  deadline?: string;
  status: string;
  created_at: string;
}

const CareerPage: React.FC = () => {
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<JobVacancy | null>(null);
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [signUpModalVisible, setSignUpModalVisible] = useState(false);
  const [applying, setApplying] = useState(false);
  const [form] = Form.useForm();

  // Fetch job vacancies
  useEffect(() => {
    fetchVacancies();
  }, [searchText, departmentFilter, locationFilter]);

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      // Only fetch active vacancies for public view
      const params = {
        status: 'active',
        search: searchText || undefined,
        department: departmentFilter || undefined,
        location: locationFilter || undefined
      };
      
      const response = await axios.get('http://localhost:5000/api/public-vacancies', { params });
      setVacancies(response.data.vacancies || []);
    } catch (error) {
      console.error('Error fetching vacancies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique departments and locations for filters
  const departments = Array.from(new Set(vacancies.map(job => job.department)));
  const locations = Array.from(new Set(vacancies.map(job => job.location).filter(Boolean)));

  // Handle job application
  const handleApply = (job: JobVacancy) => {
    setSelectedJob(job);
    
    // Check if user is logged in (has token)
    const token = localStorage.getItem('token');
    if (!token) {
      setLoginModalVisible(true);
    } else {
      setApplyModalVisible(true);
    }
  };

  const submitApplication = async (values: any) => {
    if (!selectedJob) return;
    
    try {
      setApplying(true);
      const applicationData = {
        ...values,
        vacancy_id: selectedJob.id
      };
      
      const token = localStorage.getItem('token');
      await axios.post('/api/recruitment/applications', applicationData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Handle CV upload if provided
      if (values.cv_file) {
        const formData = new FormData();
        formData.append('cv', values.cv_file.file);
        
        await axios.post(`/api/recruitment/applications/${applicationData.id}/cv`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      setApplyModalVisible(false);
      Modal.success({
        title: 'Application Submitted',
        content: 'Your application has been submitted successfully. You can track your application status in your account.'
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      Modal.error({
        title: 'Application Failed',
        content: 'There was an error submitting your application. Please try again.'
      });
    } finally {
      setApplying(false);
      form.resetFields();
    }
  };

  // Add handler for sign up success
  const handleSignUpSuccess = () => {
    setSignUpModalVisible(false);
    setLoginModalVisible(false);
    setApplyModalVisible(true); // Redirect to application steps/modal
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <Title>Career Opportunities</Title>
        <Paragraph>
          Join our team and be part of something great. We offer competitive salaries, 
          excellent benefits, and opportunities for professional growth.
        </Paragraph>
      </div>

      {/* Search and Filter Section */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={8}>
            <Input 
              placeholder="Search jobs..." 
              prefix={<SearchOutlined />} 
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by department"
              style={{ width: '100%' }}
              value={departmentFilter || undefined}
              onChange={value => setDepartmentFilter(value)}
              allowClear
            >
              {departments.map(dept => (
                <Option key={dept} value={dept}>{dept}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by location"
              style={{ width: '100%' }}
              value={locationFilter || undefined}
              onChange={value => setLocationFilter(value)}
              allowClear
            >
              {locations.map(loc => (
                <Option key={loc} value={loc}>{loc}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Job Listings */}
      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>Loading job opportunities...</div>
          </div>
        ) : vacancies.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <FileTextOutlined style={{ fontSize: '48px', color: '#ccc' }} />
            <div style={{ marginTop: '16px' }}>No job vacancies found. Please try different search criteria.</div>
          </div>
        ) : (
          <List
            itemLayout="vertical"
            size="large"
            dataSource={vacancies}
            renderItem={job => (
              <List.Item
                key={job.id}
                actions={[
                  <Space key="location">
                    <EnvironmentOutlined /> {job.location || 'Remote'}
                  </Space>,
                  <Space key="salary">
                    <DollarOutlined /> {job.salary_range || 'Competitive'}
                  </Space>,
                  <Space key="deadline">
                    <CalendarOutlined /> Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Open until filled'}
                  </Space>
                ]}
                extra={
                  <Button type="primary" onClick={() => handleApply(job)}>
                    Apply Now
                  </Button>
                }
              >
                <List.Item.Meta
                  title={<Title level={4}>{job.title}</Title>}
                  description={
                    <Space>
                      <Tag color="blue">{job.department}</Tag>
                      <Tag color="green">{job.employment_type || 'Full-time'}</Tag>
                      <Tag color="purple">{job.experience_level || 'Mid-level'}</Tag>
                    </Space>
                  }
                />
                <Paragraph ellipsis={{ rows: 3 }}>
                  {job.description}
                </Paragraph>
                <Button type="link" onClick={() => setSelectedJob(job)}>View Details</Button>
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* Job Details Modal */}
      <Modal
        title={selectedJob?.title}
        open={!!selectedJob && !applyModalVisible}
        onCancel={() => setSelectedJob(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedJob(null)}>
            Close
          </Button>,
          <Button key="apply" type="primary" onClick={() => handleApply(selectedJob!)}>
            Apply Now
          </Button>
        ]}
        width={800}
      >
        {selectedJob && (
          <>
            <div style={{ marginBottom: '16px' }}>
              <Space>
                <Tag color="blue">{selectedJob.department}</Tag>
                <Tag color="green">{selectedJob.employment_type || 'Full-time'}</Tag>
                <Tag color="purple">{selectedJob.experience_level || 'Mid-level'}</Tag>
              </Space>
            </div>
            
            <Paragraph>
              <strong>Location:</strong> {selectedJob.location || 'Remote'}
            </Paragraph>
            <Paragraph>
              <strong>Salary Range:</strong> {selectedJob.salary_range || 'Competitive'}
            </Paragraph>
            <Paragraph>
              <strong>Application Deadline:</strong> {selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString() : 'Open until filled'}
            </Paragraph>
            
            <Divider />
            
            <Title level={5}>Job Description</Title>
            <Paragraph>{selectedJob.description}</Paragraph>
            
            {selectedJob.responsibilities && (
              <>
                <Title level={5}>Responsibilities</Title>
                <Paragraph>{selectedJob.responsibilities}</Paragraph>
              </>
            )}
            
            {selectedJob.requirements && (
              <>
                <Title level={5}>Requirements</Title>
                <Paragraph>{selectedJob.requirements}</Paragraph>
              </>
            )}
            
            {selectedJob.education_required && (
              <>
                <Title level={5}>Education</Title>
                <Paragraph>{selectedJob.education_required}</Paragraph>
              </>
            )}
            
            {selectedJob.skills_required && (
              <>
                <Title level={5}>Skills</Title>
                <Paragraph>{selectedJob.skills_required}</Paragraph>
              </>
            )}
          </>
        )}
      </Modal>

      {/* Login Prompt Modal */}
      <Modal
        title="Login Required"
        open={loginModalVisible}
        onCancel={() => setLoginModalVisible(false)}
        footer={null}
      >
        <Alert
          message="Authentication Required"
          description="You need to login or create an account to apply for this position."
          type="info"
          showIcon
        />
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Button type="primary" onClick={() => window.location.href = '/applicant_login'} style={{ marginRight: 8 }}>
            Login
          </Button>
          <Button onClick={() => setSignUpModalVisible(true)}>
            Sign Up
          </Button>
        </div>
      </Modal>

      {/* Sign Up Modal */}
      <Modal
        title="Sign Up"
        open={signUpModalVisible}
        onCancel={() => setSignUpModalVisible(false)}
        footer={null}
        width={450}
      >
        <SignUpPage onSuccess={handleSignUpSuccess} />
      </Modal>

      {/* Application Form Modal */}
      <Modal
        title={`Apply for ${selectedJob?.title}`}
        open={applyModalVisible}
        onCancel={() => setApplyModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={submitApplication}
        >
          <Form.Item
            name="full_name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Your full name" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Your email address" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please enter your phone number' }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="Your phone number" />
          </Form.Item>
          
          <Form.Item
            name="address"
            label="Address"
          >
            <Input placeholder="Your address" />
          </Form.Item>
          
          <Form.Item
            name="expected_salary"
            label="Expected Salary (optional)"
          >
            <Input prefix={<DollarOutlined />} placeholder="Your expected salary" type="number" />
          </Form.Item>
          
          <Form.Item
            name="availability_date"
            label="Availability Date (optional)"
          >
            <Input placeholder="When you can start (e.g., Immediately, 2 weeks notice)" />
          </Form.Item>
          
          <Form.Item
            name="cover_letter"
            label="Cover Letter"
            rules={[{ required: true, message: 'Please provide a cover letter' }]}
          >
            <TextArea rows={5} placeholder="Why you are interested in this position and what makes you a good fit" />
          </Form.Item>
          
          <Form.Item
            name="cv_file"
            label="Resume/CV"
            rules={[{ required: true, message: 'Please upload your resume/CV' }]}
          >
            <input type="file" accept=".pdf,.doc,.docx" />
          </Form.Item>
          
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setApplyModalVisible(false)} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={applying}>
                Submit Application
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CareerPage;
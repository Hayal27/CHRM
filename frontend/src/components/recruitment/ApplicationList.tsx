import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Input, 
  Select, 
  message,
  Tooltip,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  EyeOutlined, 
  DownloadOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { recruitmentService } from '../../services/recruitmentService';
import dayjs from 'dayjs';
import axios from 'axios'; // Added axios import

const { Option } = Select;

interface JobApplication {
  id: number;
  vacancy_id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  cover_letter: string;
  cv_path: string;
  expected_salary: number;
  availability_date: string;
  status: string;
  created_at: string;
  job_title: string;
  department: string;
  applicant_name: string;
}

const ApplicationList: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await recruitmentService.getApplications({
        status: statusFilter,
        vacancy_id: departmentFilter ? undefined : undefined
      });
      // Ensure we have an array of applications, even if the response is empty
      // Axios response structure: response.data contains the API response
      // Make sure we're getting an array, even if API returns an object
      let applicationsData = [];
      if (response && response.data) {
        // Check if response.data is an array
        if (Array.isArray(response.data)) {
          applicationsData = response.data;
        } 
        // Check if response.data.applications is an array
        else if (response.data.applications && Array.isArray(response.data.applications)) {
          applicationsData = response.data.applications;
        }
        // If it's some other structure, log it for debugging
        else {
          console.log('Unexpected API response structure:', response.data);
        }
      }
      setApplications(applicationsData);
    } catch (error) {
      message.error('Failed to fetch applications');
      // Set applications to empty array if there's an error
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: number, newStatus: string) => {
    try {
      // Since updateApplicationStatus doesn't exist in the service, we'll implement it here
      // This would typically call an API endpoint to update the status
      await axios.put(`/api/recruitment/applications/${applicationId}/status`, { status: newStatus }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      message.success('Application status updated successfully');
      fetchApplications();
    } catch (error) {
      message.error('Failed to update application status');
    }
  };

  const handleScheduleInterview = async () => {
    try {
      // This would typically open an interview scheduling modal
      message.info('Interview scheduling feature will be implemented');
    } catch (error) {
      message.error('Failed to schedule interview');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'orange',
      reviewed: 'blue',
      shortlisted: 'cyan',
      interview_scheduled: 'purple',
      interviewed: 'geekblue',
      offer_sent: 'magenta',
      hired: 'green',
      rejected: 'red',
      on_hold: 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusActions = (record: JobApplication) => {
    const actions = [];
    
    if (record.status === 'pending') {
      actions.push(
        <Button 
          key="review" 
          size="small" 
          onClick={() => handleStatusUpdate(record.id, 'reviewed')}
        >
          Mark Reviewed
        </Button>
      );
    }
    
    if (record.status === 'reviewed') {
      actions.push(
        <Button 
          key="shortlist" 
          size="small" 
          type="primary"
          onClick={() => handleStatusUpdate(record.id, 'shortlisted')}
        >
          Shortlist
        </Button>
      );
    }
    
    if (record.status === 'shortlisted') {
      actions.push(
        <Button 
          key="interview" 
          size="small" 
          type="primary"
          icon={<CalendarOutlined />}
          onClick={() => handleScheduleInterview()}
        >
          Schedule Interview
        </Button>
      );
    }
    
    if (record.status === 'interviewed') {
      actions.push(
        <Button 
          key="offer" 
          size="small" 
          type="primary"
          onClick={() => handleStatusUpdate(record.id, 'offer_sent')}
        >
          Send Offer
        </Button>
      );
    }
    
    return actions;
  };

  const columns = [
    {
      title: 'Applicant',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (text: string, record: JobApplication) => (
        <div>
          <div><strong>{text}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
        </div>
      )
    },
    {
      title: 'Position',
      dataIndex: 'job_title',
      key: 'job_title',
      render: (text: string, record: JobApplication) => (
        <div>
          <div>{text}</div>
          <Tag color="blue">{record.department}</Tag>
        </div>
      )
    },
    {
      title: 'Expected Salary',
      dataIndex: 'expected_salary',
      key: 'expected_salary',
      render: (salary: number) => `$${salary?.toLocaleString() || 'N/A'}`
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
      title: 'Applied',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: JobApplication) => (
        <Space direction="vertical" size="small">
          <Space>
            <Tooltip title="View Details">
              <Button 
                type="text" 
                size="small"
                icon={<EyeOutlined />} 
                onClick={() => {
                  setSelectedApplication(record);
                  setModalVisible(true);
                }}
              />
            </Tooltip>
            {record.cv_path && (
              <Tooltip title="Download CV">
                <Button 
                  type="text" 
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => window.open(record.cv_path, '_blank')}
                />
              </Tooltip>
            )}
          </Space>
          <Space>
            {getStatusActions(record)}
          </Space>
        </Space>
      )
    }
  ];

  const applicationStats = {
    total: Array.isArray(applications) ? applications.length : 0,
    pending: Array.isArray(applications) ? applications.filter(app => app?.status === 'pending').length : 0,
    shortlisted: Array.isArray(applications) ? applications.filter(app => app?.status === 'shortlisted').length : 0,
    interviewed: Array.isArray(applications) ? applications.filter(app => app?.status === 'interviewed').length : 0,
    hired: Array.isArray(applications) ? applications.filter(app => app?.status === 'hired').length : 0
  };

  return (
    <div>
      <Card title="Job Applications">
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Total Applications"
                value={applicationStats.total}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Pending Review"
                value={applicationStats.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Shortlisted"
                value={applicationStats.shortlisted}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Hired"
                value={applicationStats.hired}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={8}>
            <Input
              placeholder="Search applications..."
              prefix={<FileTextOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
            >
              <Option value="pending">Pending</Option>
              <Option value="reviewed">Reviewed</Option>
              <Option value="shortlisted">Shortlisted</Option>
              <Option value="interview_scheduled">Interview Scheduled</Option>
              <Option value="interviewed">Interviewed</Option>
              <Option value="offer_sent">Offer Sent</Option>
              <Option value="hired">Hired</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by department"
              style={{ width: '100%' }}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              allowClear
            >
              <Option value="Engineering">Engineering</Option>
              <Option value="Marketing">Marketing</Option>
              <Option value="Sales">Sales</Option>
              <Option value="HR">HR</Option>
              <Option value="Finance">Finance</Option>
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Button onClick={fetchApplications} block>
              Refresh
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={applications}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number, range: [number, number]) => 
              `${range[0]}-${range[1]} of ${total} applications`
          }}
        />
      </Card>

      <Modal
        title="Application Details"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedApplication(null);
        }}
        footer={null}
        width={800}
      >
        {selectedApplication && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <h4>Applicant Information</h4>
                <p><strong>Name:</strong> {selectedApplication.full_name}</p>
                <p><strong>Email:</strong> {selectedApplication.email}</p>
                <p><strong>Phone:</strong> {selectedApplication.phone}</p>
                <p><strong>Address:</strong> {selectedApplication.address}</p>
              </Col>
              <Col span={12}>
                <h4>Position Details</h4>
                <p><strong>Job Title:</strong> {selectedApplication.job_title}</p>
                <p><strong>Department:</strong> {selectedApplication.department}</p>
                <p><strong>Expected Salary:</strong> ${selectedApplication.expected_salary?.toLocaleString()}</p>
                <p><strong>Availability:</strong> {dayjs(selectedApplication.availability_date).format('MMM DD, YYYY')}</p>
              </Col>
            </Row>
            
            <div style={{ marginTop: '16px' }}>
              <h4>Cover Letter</h4>
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {selectedApplication.cover_letter}
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <h4>Application Status</h4>
              <Tag color={getStatusColor(selectedApplication.status)}>
                {selectedApplication.status.replace('_', ' ').toUpperCase()}
              </Tag>
            </div>

            {selectedApplication.cv_path && (
              <div style={{ marginTop: '16px' }}>
                <h4>CV/Resume</h4>
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => window.open(selectedApplication.cv_path, '_blank')}
                >
                  Download CV
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApplicationList;
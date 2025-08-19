import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Table, 
  Button, 
  Space,
  Typography,
  Divider,
  Tag,
  Avatar,
  List,
  Badge
} from 'antd';
import { 
  UserOutlined, 
  FileTextOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import JobVacancyForm from './JobVacancyForm';
import ApplicationList from './ApplicationList';
import InterviewScheduler from './InterviewScheduler';
import RecruitmentAnalytics from './RecruitmentAnalytics';

const { Title, Text } = Typography;

interface RecruitmentStats {
  total_applications: number;
  applications_by_status: Array<{ status: string; count: number }>;
  interviews_scheduled: number;
  hiring_decisions: Array<{ decision: string; count: number }>;
  vacancies_by_department: Array<{ department: string; count: number }>;
}

const RecruitmentDashboard: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState<RecruitmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [recentApplications, setRecentApplications] = useState<Array<{ id: number; name: string; position: string; status: string; date: string }>>([]);

  useEffect(() => {
    // Add detailed sample data for demonstration
    setStats({
      total_applications: 120,
      applications_by_status: [
        { status: 'pending', count: 30 },
        { status: 'shortlisted', count: 25 },
        { status: 'interviewed', count: 20 },
        { status: 'hired', count: 10 },
        { status: 'rejected', count: 35 }
      ],
      interviews_scheduled: 18,
      hiring_decisions: [
        { decision: 'hired', count: 10 },
        { decision: 'rejected', count: 35 },
        { decision: 'on_hold', count: 5 }
      ],
      vacancies_by_department: [
        { department: 'IT', count: 8 },
        { department: 'HR', count: 4 },
        { department: 'Finance', count: 3 },
        { department: 'Marketing', count: 2 }
      ]
    });
    setRecentApplications([
      {
        id: 1,
        name: 'John Doe',
        position: 'Software Engineer',
        status: 'shortlisted',
        date: '2025-07-15'
      },
      {
        id: 2,
        name: 'Jane Smith',
        position: 'Product Manager',
        status: 'interviewed',
        date: '2025-07-14'
      },
      {
        id: 3,
        name: 'Mike Johnson',
        position: 'UX Designer',
        status: 'pending',
        date: '2025-07-13'
      },
      {
        id: 4,
        name: 'Sara Lee',
        position: 'HR Specialist',
        status: 'hired',
        date: '2025-07-12'
      },
      {
        id: 5,
        name: 'Henok Tesfaye',
        position: 'Finance Analyst',
        status: 'rejected',
        date: '2025-07-11'
      }
    ]);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'orange',
      shortlisted: 'blue',
      interviewed: 'purple',
      hired: 'green',
      rejected: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <FileTextOutlined /> },
    { key: 'vacancies', label: 'Job Vacancies', icon: <UserOutlined /> },
    { key: 'applications', label: 'Applications', icon: <FileTextOutlined /> },
    { key: 'interviews', label: 'Interviews', icon: <CalendarOutlined /> },
    { key: 'analytics', label: 'Analytics', icon: <CheckCircleOutlined /> }
  ];

  const renderOverview = () => (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Applications"
              value={stats?.total_applications || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Interviews Scheduled"
              value={stats?.interviews_scheduled || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hired Candidates"
              value={stats?.hiring_decisions?.find(d => d.decision === 'hired')?.count || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Vacancies"
              value={stats?.vacancies_by_department?.reduce((sum, dept) => sum + dept.count, 0) || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Applications by Status" size="small">
            {stats?.applications_by_status?.map((item, index) => (
              <div key={index} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Badge color={getStatusColor(item.status)} text={getStatusText(item.status)} />
                  <span>{item.count}</span>
                </div>
                <Progress 
                  percent={Math.round((item.count / (stats?.total_applications || 1)) * 100)} 
                  size="small" 
                  showInfo={false}
                />
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Hiring Decisions" size="small">
            {stats?.hiring_decisions?.map((item, index) => (
              <div key={index} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <Badge color={getStatusColor(item.decision)} text={item.decision.toUpperCase()} />
                  <span>{item.count}</span>
                </div>
                <Progress 
                  percent={Math.round((item.count / (stats?.hiring_decisions?.reduce((sum, d) => sum + d.count, 0) || 1)) * 100)} 
                  size="small" 
                  showInfo={false}
                />
              </div>
            ))}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card title="Vacancies by Department" size="small">
            <Row gutter={[16, 16]}>
              {stats?.vacancies_by_department?.map((item, index) => (
                <Col xs={12} sm={8} md={6} key={index}>
                  <Card size="small">
                    <Statistic
                      title={item.department}
                      value={item.count}
                      valueStyle={{ fontSize: '18px' }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'vacancies':
        return <JobVacancyForm />;
      case 'applications':
        return <ApplicationList />;
      case 'interviews':
        return <InterviewScheduler />;
      case 'analytics':
        return <RecruitmentAnalytics />;
      default:
        return renderOverview();
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ 
        marginBottom: '24px',
        color: isDarkMode ? '#fff' : '#000'
      }}>
        Recruitment Dashboard
      </Title>

      <div style={{ marginBottom: '24px' }}>
        <Space>
          {tabs.map(tab => (
            <Button
              key={tab.key}
              type={activeTab === tab.key ? 'primary' : 'default'}
              icon={tab.icon}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <ClockCircleOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          <p>Loading recruitment data...</p>
        </div>
      ) : (
        renderContent()
      )}

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            size="small"
            style={{ 
              background: isDarkMode ? '#1f1f1f' : '#fff',
              borderColor: isDarkMode ? '#303030' : '#f0f0f0'
            }}
          >
            <Statistic
              title="Total Vacancies"
              value={stats?.vacancies_by_department?.reduce((sum, dept) => sum + dept.count, 0) || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            size="small"
            style={{ 
              background: isDarkMode ? '#1f1f1f' : '#fff',
              borderColor: isDarkMode ? '#303030' : '#f0f0f0'
            }}
          >
            <Statistic
              title="Active Applications"
              value={stats?.total_applications || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            size="small"
            style={{ 
              background: isDarkMode ? '#1f1f1f' : '#fff',
              borderColor: isDarkMode ? '#303030' : '#f0f0f0'
            }}
          >
            <Statistic
              title="Pending Interviews"
              value={stats?.interviews_scheduled || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            size="small"
            style={{ 
              background: isDarkMode ? '#1f1f1f' : '#fff',
              borderColor: isDarkMode ? '#303030' : '#f0f0f0'
            }}
          >
            <Statistic
              title="Hired This Month"
              value={stats?.hiring_decisions?.find(d => d.decision === 'hired')?.count || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card 
            title="Application Progress"
            style={{ 
              background: isDarkMode ? '#1f1f1f' : '#fff',
              borderColor: isDarkMode ? '#303030' : '#f0f0f0'
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text style={{ color: isDarkMode ? '#ccc' : '#666' }}>Applications Reviewed</Text>
                <Text style={{ color: isDarkMode ? '#ccc' : '#666' }}>75%</Text>
              </div>
              <Progress percent={75} strokeColor="#1890ff" />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text style={{ color: isDarkMode ? '#ccc' : '#666' }}>Interviews Completed</Text>
                <Text style={{ color: isDarkMode ? '#ccc' : '#666' }}>60%</Text>
              </div>
              <Progress percent={60} strokeColor="#52c41a" />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text style={{ color: isDarkMode ? '#ccc' : '#666' }}>Offers Sent</Text>
                <Text style={{ color: isDarkMode ? '#ccc' : '#666' }}>40%</Text>
              </div>
              <Progress percent={40} strokeColor="#faad14" />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="Quick Actions"
            style={{ 
              background: isDarkMode ? '#1f1f1f' : '#fff',
              borderColor: isDarkMode ? '#303030' : '#f0f0f0'
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                block
                style={{ height: '40px' }}
              >
                Create New Vacancy
              </Button>
              <Button 
                icon={<CalendarOutlined />} 
                block
                style={{ height: '40px' }}
              >
                Schedule Interview
              </Button>
              <Button 
                icon={<FileTextOutlined />} 
                block
                style={{ height: '40px' }}
              >
                Review Applications
              </Button>
              <Button 
                icon={<UserOutlined />} 
                block
                style={{ height: '40px' }}
              >
                Generate Reports
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Applications Table */}
      <Card 
        title="Recent Applications"
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            View All
          </Button>
        }
        style={{ 
          background: isDarkMode ? '#1f1f1f' : '#fff',
          borderColor: isDarkMode ? '#303030' : '#f0f0f0'
        }}
      >
        <Table
          columns={[
            {
              title: 'Applicant',
              dataIndex: 'name',
              key: 'name',
              render: (text: string, record: any) => (
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{text}</div>
                    <div style={{ fontSize: '12px', color: isDarkMode ? '#ccc' : '#666' }}>
                      {record.position}
                    </div>
                  </div>
                </Space>
              )
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                  {getStatusText(status)}
                </Tag>
              )
            },
            {
              title: 'Applied Date',
              dataIndex: 'date',
              key: 'date',
              render: (date: string) => (
                <Text style={{ color: isDarkMode ? '#ccc' : '#666' }}>
                  {new Date(date).toLocaleDateString()}
                </Text>
              )
            },
            {
              title: 'Actions',
              key: 'actions',
              render: () => (
                <Space>
                  <Button type="text" icon={<EyeOutlined />} size="small" />
                  <Button type="text" icon={<EditOutlined />} size="small" />
                  <Button type="text" icon={<DeleteOutlined />} size="small" danger />
                </Space>
              )
            }
          ]}
          dataSource={recentApplications}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
        />
      </Card>

      {/* Theme Demo Section */}
      <Divider style={{ margin: '32px 0' }} />
      <Card 
        title="Dark Theme Features"
        style={{ 
          background: isDarkMode ? '#1f1f1f' : '#fff',
          borderColor: isDarkMode ? '#303030' : '#f0f0f0'
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card 
              size="small" 
              title="Current Theme"
              style={{ 
                background: isDarkMode ? '#262626' : '#fafafa',
                borderColor: isDarkMode ? '#434343' : '#d9d9d9'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <ClockCircleOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                <div style={{ marginTop: '8px', color: isDarkMode ? '#ccc' : '#666' }}>
                  {isDarkMode ? 'Dark Mode Active' : 'Light Mode Active'}
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card 
              size="small" 
              title="Theme Benefits"
              style={{ 
                background: isDarkMode ? '#262626' : '#fafafa',
                borderColor: isDarkMode ? '#434343' : '#d9d9d9'
              }}
            >
              <List
                size="small"
                dataSource={[
                  'Reduced eye strain',
                  'Better contrast',
                  'Modern appearance',
                  'System preference support'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Text style={{ color: isDarkMode ? '#ccc' : '#666' }}>
                      ✓ {item}
                    </Text>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card 
              size="small" 
              title="Theme Stats"
              style={{ 
                background: isDarkMode ? '#262626' : '#fafafa',
                borderColor: isDarkMode ? '#434343' : '#d9d9d9'
              }}
            >
              <Statistic
                title="Theme Usage"
                value={isDarkMode ? 'Dark' : 'Light'}
                valueStyle={{ color: isDarkMode ? '#1890ff' : '#52c41a' }}
              />
              <div style={{ marginTop: '16px' }}>
                <Badge 
                  status={isDarkMode ? 'processing' : 'success'} 
                  text={isDarkMode ? 'Dark Mode' : 'Light Mode'} 
                />
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default RecruitmentDashboard;
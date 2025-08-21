import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Button, 
  Table, 
  Select, 
  Space, 
  Typography, 
  Tabs,
  message,
  Spin
} from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  BookOutlined, 
  BarChartOutlined,
  PlusOutlined,
  FileTextOutlined,
  SettingOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import AdminModule from './AdminModule';
import OfficeModule from './OfficeModule';
import CollegeManagement from './CollegeManagement';
import EmployeeReports from './EmployeeReports';

const { Title } = Typography;
const { TabPane } = Tabs;

interface College {
  college_id: number;
  college_name: string;
  college_code: string;
  location: string;
  college_type: string;
  employee_count: number;
  trainer_count: number;
  admin_count: number;
  status: string;
}

interface Statistics {
  total_colleges: number;
  total_employees: number;
  total_trainers: number;
  total_admins: number;
  active_colleges: number;
}

const EducationOfficeDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [colleges, setColleges] = useState<College[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total_colleges: 0,
    total_employees: 0,
    total_trainers: 0,
    total_admins: 0,
    active_colleges: 0
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch colleges data
      const collegesResponse = await axios.get(`${API_BASE_URL}/api/education-office/admin/colleges`, config);
      if (collegesResponse.data.success) {
        setColleges(collegesResponse.data.colleges);
        
        // Calculate statistics
        const stats = collegesResponse.data.colleges.reduce((acc: Statistics, college: College) => {
          acc.total_colleges += 1;
          acc.total_employees += college.employee_count || 0;
          acc.total_trainers += college.trainer_count || 0;
          acc.total_admins += college.admin_count || 0;
          if (college.status === 'active') acc.active_colleges += 1;
          return acc;
        }, {
          total_colleges: 0,
          total_employees: 0,
          total_trainers: 0,
          total_admins: 0,
          active_colleges: 0
        });
        
        setStatistics(stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const overviewContent = (
    <div>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Colleges"
              value={statistics.total_colleges}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Employees"
              value={statistics.total_employees}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Trainers"
              value={statistics.total_trainers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Admin Staff"
              value={statistics.total_admins}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Colleges Overview Table */}
      <Card 
        title="Colleges Overview" 
        extra={
          <Space>
            <Button onClick={handleRefresh} loading={loading}>
              Refresh
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={colleges}
          rowKey="college_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
          columns={[
            {
              title: 'College Name',
              dataIndex: 'college_name',
              key: 'college_name',
              fixed: 'left',
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
                <span style={{ textTransform: 'capitalize' }}>{type}</span>
              ),
            },
            {
              title: 'Total Employees',
              dataIndex: 'employee_count',
              key: 'employee_count',
              width: 120,
              align: 'center',
            },
            {
              title: 'Trainers',
              dataIndex: 'trainer_count',
              key: 'trainer_count',
              width: 100,
              align: 'center',
            },
            {
              title: 'Admin Staff',
              dataIndex: 'admin_count',
              key: 'admin_count',
              width: 100,
              align: 'center',
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              width: 100,
              render: (status: string) => (
                <span 
                  style={{ 
                    color: status === 'active' ? '#52c41a' : '#ff4d4f',
                    textTransform: 'capitalize'
                  }}
                >
                  {status}
                </span>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Education Office Dashboard</Title>
        <p>Manage colleges, users, and generate comprehensive employee reports</p>
      </div>

      <Spin spinning={loading}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          type="card"
          size="large"
        >
          <TabPane 
            tab={
              <span>
                <BarChartOutlined />
                Overview
              </span>
            } 
            key="overview"
          >
            {overviewContent}
          </TabPane>

          <TabPane 
            tab={
              <span>
                <SettingOutlined />
                Admin Module
              </span>
            } 
            key="admin"
          >
            <AdminModule onRefresh={handleRefresh} />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <FileTextOutlined />
                Office Module
              </span>
            } 
            key="office"
          >
            <OfficeModule colleges={colleges} />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <BookOutlined />
                College Management
              </span>
            } 
            key="colleges"
          >
            <CollegeManagement onRefresh={handleRefresh} />
          </TabPane>

          <TabPane 
            tab={
              <span>
                <TeamOutlined />
                Employee Reports
              </span>
            } 
            key="reports"
          >
            <EmployeeReports colleges={colleges} />
          </TabPane>
        </Tabs>
      </Spin>
    </div>
  );
};

export default EducationOfficeDashboard;

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  DatePicker, 
  Select, 
  Button,
  List,
  Avatar,
  Tag
} from 'antd';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  UserAddOutlined, 
  FileTextOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { recruitmentService } from '../../services/recruitmentService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface AnalyticsData {
  total_applications: number;
  applications_by_status: Array<{ status: string; count: number }>;
  interviews_scheduled: number;
  hiring_decisions: Array<{ decision: string; count: number }>;
  vacancies_by_department: Array<{ department: string; count: number }>;
}

const RecruitmentAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string>('');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, departmentFilter]);

  const fetchAnalytics = async () => {
    try {
      const params: any = {};
      
      if (dateRange) {
        params.date_range = `${dateRange[0].format('YYYY-MM-DD')},${dateRange[1].format('YYYY-MM-DD')}`;
      }
      
      if (departmentFilter) {
        params.department = departmentFilter;
      }

      const response = await recruitmentService.getAnalytics(params);
      setAnalytics(response.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: '#faad14',
      reviewed: '#1890ff',
      shortlisted: '#13c2c2',
      interview_scheduled: '#722ed1',
      interviewed: '#eb2f96',
      offer_sent: '#f5222d',
      hired: '#52c41a',
      rejected: '#ff4d4f',
      on_hold: '#d9d9d9'
    };
    return colors[status] || '#d9d9d9';
  };

  const getDecisionColor = (decision: string) => {
    const colors: { [key: string]: string } = {
      hired: '#52c41a',
      rejected: '#ff4d4f',
      on_hold: '#faad14'
    };
    return colors[decision] || '#d9d9d9';
  };

  const applicationStatusData = analytics?.applications_by_status?.map(item => ({
    name: item.status.replace('_', ' ').toUpperCase(),
    value: item.count,
    color: getStatusColor(item.status)
  })) || [];

  const hiringDecisionData = analytics?.hiring_decisions?.map(item => ({
    name: item.decision.toUpperCase(),
    value: item.count,
    color: getDecisionColor(item.decision)
  })) || [];

  const departmentData = analytics?.vacancies_by_department?.map(item => ({
    name: item.department,
    value: item.count
  })) || [];

  const timeSeriesData = [
    { month: 'Jan', applications: 45, interviews: 20, hires: 8 },
    { month: 'Feb', applications: 52, interviews: 25, hires: 12 },
    { month: 'Mar', applications: 38, interviews: 18, hires: 6 },
    { month: 'Apr', applications: 65, interviews: 30, hires: 15 },
    { month: 'May', applications: 48, interviews: 22, hires: 10 },
    { month: 'Jun', applications: 72, interviews: 35, hires: 18 }
  ];

  return (
    <div>
      <Card title="Recruitment Analytics Dashboard">
        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['Start Date', 'End Date']}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            />
          </Col>
          <Col xs={24} sm={8}>
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
            <Button onClick={fetchAnalytics} block>
              Refresh
            </Button>
          </Col>
        </Row>

        {/* Key Metrics */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Total Applications"
                value={analytics?.total_applications || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Interviews Scheduled"
                value={analytics?.interviews_scheduled || 0}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Hired Candidates"
                value={analytics?.hiring_decisions?.find(d => d.decision === 'hired')?.count || 0}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Active Vacancies"
                value={analytics?.vacancies_by_department?.reduce((sum, dept) => sum + dept.count, 0) || 0}
                prefix={<UserAddOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} lg={12}>
            <Card title="Applications by Status" size="small">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={applicationStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {applicationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Hiring Decisions" size="small">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={hiringDecisionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {hiringDecisionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24}>
            <Card title="Vacancies by Department" size="small">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card title="Recruitment Trends (Last 6 Months)" size="small">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="applications" stroke="#8884d8" />
                  <Line type="monotone" dataKey="interviews" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="hires" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Detailed Statistics */}
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24} lg={12}>
            <Card title="Application Status Breakdown" size="small">
              {analytics?.applications_by_status?.map((item, index) => (
                <div key={index} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>{item.status.replace('_', ' ').toUpperCase()}</span>
                    <span>{item.count}</span>
                  </div>
                  <Progress 
                    percent={Math.round((item.count / (analytics?.total_applications || 1)) * 100)} 
                    size="small" 
                    showInfo={false}
                    strokeColor={getStatusColor(item.status)}
                  />
                </div>
              ))}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Hiring Decision Breakdown" size="small">
              {analytics?.hiring_decisions?.map((item, index) => (
                <div key={index} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>{item.decision.toUpperCase()}</span>
                    <span>{item.count}</span>
                  </div>
                  <Progress 
                    percent={Math.round((item.count / (analytics?.hiring_decisions?.reduce((sum, d) => sum + d.count, 0) || 1)) * 100)} 
                    size="small" 
                    showInfo={false}
                    strokeColor={getDecisionColor(item.decision)}
                  />
                </div>
              ))}
            </Card>
          </Col>
        </Row>

        {/* Department Performance */}
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24}>
            <Card title="Department Performance" size="small">
              <List
                dataSource={analytics?.vacancies_by_department || []}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<TeamOutlined />} />}
                      title={item.department}
                      description={`${item.count} active vacancies`}
                    />
                    <div>
                      <Tag color="blue">{item.count} Vacancies</Tag>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default RecruitmentAnalytics;
import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Select, 
  Space, 
  message, 
  Typography,
  Row,
  Col,
  Statistic,
  Tag
} from 'antd';
import { 
  FileTextOutlined, 
  DownloadOutlined, 
  TeamOutlined,
  UserOutlined,
  SettingOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

interface College {
  college_id: number;
  college_name: string;
  college_code: string;
}

interface EmployeeReportsProps {
  colleges: College[];
}

interface Employee {
  employee_id: number;
  full_name: string;
  employee_type: string;
  sex: string;
  age: number;
  year_of_birth: number;
  year_of_employment: number;
  qualification_level: string;
  qualification_subject: string;
  competence_level: string;
  competence_occupation: string;
  mobile: string;
  email: string;
  occupation_on_training?: string;
  employed_work_process?: string;
  status: string;
}

const EmployeeReports: React.FC<EmployeeReportsProps> = ({ colleges }) => {
  const [loading, setLoading] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<number | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    trainers: 0,
    admins: 0,
    active: 0
  });

  const fetchEmployees = async (collegeId: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(`/api/education-office/employees/${collegeId}`, config);
      if (response.data.success) {
        setEmployees(response.data.employees);
        
        // Calculate statistics
        const stats = response.data.employees.reduce((acc: any, emp: Employee) => {
          acc.total += 1;
          if (emp.employee_type === 'trainer') acc.trainers += 1;
          if (emp.employee_type === 'admin') acc.admins += 1;
          if (emp.status === 'active') acc.active += 1;
          return acc;
        }, { total: 0, trainers: 0, admins: 0, active: 0 });
        
        setStatistics(stats);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      message.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleCollegeChange = (collegeId: number) => {
    setSelectedCollege(collegeId);
    fetchEmployees(collegeId);
  };

  const handleDownloadReport = async (reportType: string = 'comprehensive') => {
    if (!selectedCollege) {
      message.warning('Please select a college first');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.post('/api/education-office/reports/generate', {
        college_id: selectedCollege,
        report_type: reportType,
        include_inactive: false
      }, config);

      if (response.data.success) {
        // Convert data to CSV
        const headers = Object.keys(response.data.data[0] || {});
        const csvContent = [
          headers.join(','),
          ...response.data.data.map((row: any) => 
            headers.map(header => `"${row[header] || ''}"`).join(',')
          )
        ].join('\n');

        // Download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${reportType}_report_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        message.success('Report downloaded successfully!');
      }
    } catch (error: any) {
      console.error('Error downloading report:', error);
      message.error(error.response?.data?.message || 'Failed to download report');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'full_name',
      key: 'full_name',
      fixed: 'left' as const,
      width: 200,
    },
    {
      title: 'Type',
      dataIndex: 'employee_type',
      key: 'employee_type',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'trainer' ? 'blue' : 'green'}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Sex',
      dataIndex: 'sex',
      key: 'sex',
      width: 80,
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      width: 80,
    },
    {
      title: 'Year of Employment',
      dataIndex: 'year_of_employment',
      key: 'year_of_employment',
      width: 150,
    },
    {
      title: 'Qualification',
      key: 'qualification',
      width: 200,
      render: (record: Employee) => (
        <div>
          <div><strong>{record.qualification_level}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.qualification_subject}
          </div>
        </div>
      ),
    },
    {
      title: 'Competence',
      key: 'competence',
      width: 200,
      render: (record: Employee) => (
        <div>
          <div><strong>{record.competence_level}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.competence_occupation}
          </div>
        </div>
      ),
    },
    {
      title: 'Specific Role',
      key: 'specific_role',
      width: 200,
      render: (record: Employee) => (
        <div>
          {record.employee_type === 'trainer' 
            ? record.occupation_on_training 
            : record.employed_work_process
          }
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      width: 200,
      render: (record: Employee) => (
        <div>
          <div>{record.mobile}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>Employee Reports</Title>
      <Text type="secondary">
        View and download detailed employee information by college
      </Text>

      <Card style={{ marginTop: '16px', marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Select
              placeholder="Select a college"
              style={{ width: '100%' }}
              onChange={handleCollegeChange}
              size="large"
            >
              {colleges.map(college => (
                <Option key={college.college_id} value={college.college_id}>
                  {college.college_name} ({college.college_code})
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={16}>
            <Space>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadReport('comprehensive')}
                disabled={!selectedCollege}
              >
                Download Comprehensive Report
              </Button>
              <Button 
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadReport('trainer_details')}
                disabled={!selectedCollege}
              >
                Trainer Report
              </Button>
              <Button 
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadReport('admin_details')}
                disabled={!selectedCollege}
              >
                Admin Report
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {selectedCollege && (
        <>
          {/* Statistics */}
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Total Employees"
                  value={statistics.total}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Trainers"
                  value={statistics.trainers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Admin Staff"
                  value={statistics.admins}
                  prefix={<SettingOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Active"
                  value={statistics.active}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Employee Table */}
          <Card
            title={
              <Space>
                <FileTextOutlined />
                Employee Details
              </Space>
            }
          >
            <Table
              dataSource={employees}
              columns={columns}
              rowKey="employee_id"
              loading={loading}
              scroll={{ x: 1500 }}
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default EmployeeReports;

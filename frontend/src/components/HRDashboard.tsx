import React from 'react';
import { Card, Row, Col, Button, Typography, Space } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const modules = [
  { path: '/hrms/recruitment', label: 'Recruitment' },
  { path: '/hrms/onboarding', label: 'Onboarding' },
  { path: '/hrms/employee', label: 'Employee Profiles' },
  { path: '/hrms/attendance', label: 'Attendance' },
  { path: '/hrms/leave', label: 'Leave Management' },
  { path: '/hrms/payroll', label: 'Payroll' },
  { path: '/hrms/performance', label: 'Performance' },
  { path: '/hrms/training', label: 'Training' },
  { path: '/hrms/promotion', label: 'Promotion/Transfer' },
  { path: '/hrms/disciplinary', label: 'Disciplinary' },
  { path: '/hrms/resignation', label: 'Resignation/Termination' },
  { path: '/hrms/archival', label: 'Archival/Ex-Employee' },
];

const HRDashboard: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>HR Dashboard</Title>
      <Text type="secondary">Welcome to the HR Management System. Select a module to get started.</Text>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {modules.map((mod) => (
          <Col xs={24} sm={12} md={8} lg={6} key={mod.path}>
            <Card>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={4}>{mod.label}</Title>
                <Link to={mod.path}>
                  <Button type="primary" block>
                    Go to {mod.label}
                  </Button>
                </Link>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default HRDashboard;

import React from 'react';
import { Card } from 'antd';
import EmployeeProfileDetails from '../components/employee/EmployeeProfileDetails.tsx';

const EmployeeProfilePage: React.FC = () => (
  <Card title="My Profiles">
    <EmployeeProfileDetails />
  </Card>
);

export default EmployeeProfilePage;

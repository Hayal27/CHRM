import React from 'react';
import { Card } from 'antd';
import ResignationDetails from '../components/resignation/ResignationDetails.tsx';

const ResignationPage: React.FC = () => (
  <Card title="Resignation/Termination">
    <ResignationDetails />
  </Card>
);

export default ResignationPage;

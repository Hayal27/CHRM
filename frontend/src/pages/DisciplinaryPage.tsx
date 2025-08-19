import React from 'react';
import { Card } from 'antd';
import DisciplinaryDetails from '../components/disciplinary/DisciplinaryDetails.tsx';

const DisciplinaryPage: React.FC = () => (
  <Card title="Disciplinary">
    <DisciplinaryDetails />
  </Card>
);

export default DisciplinaryPage;

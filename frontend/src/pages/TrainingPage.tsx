import React from 'react';
import { Card } from 'antd';
import TrainingDetails from '../components/training/TrainingDetails.tsx';

const TrainingPage: React.FC = () => (
  <Card title="Training">
    <TrainingDetails />
  </Card>
);

export default TrainingPage;

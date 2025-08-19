import React from 'react';

const trainings = [
  { id: 1, employee: 'Mark Lee', topic: 'React Basics', date: '2025-07-18', status: 'Completed' },
  { id: 2, employee: 'Jane Smith', topic: 'Leadership', date: '2025-07-22', status: 'Scheduled' },
];

const EmployeeTrainingPage: React.FC = () => (
  <div style={{ maxWidth: 700, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: '2rem' }}>
    <h2 style={{ marginBottom: '1.5rem', color: '#1890ff' }}>Employee Training Sessions</h2>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#f5f6fa' }}>
          <th style={{ padding: '0.75rem', textAlign: 'left' }}>Employee</th>
          <th>Topic</th>
          <th>Date</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {trainings.map(row => (
          <tr key={row.id}>
            <td style={{ padding: '0.75rem' }}>{row.employee}</td>
            <td>{row.topic}</td>
            <td>{row.date}</td>
            <td>{row.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default EmployeeTrainingPage;

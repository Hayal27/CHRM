import React from 'react';

const resignations = [
  { id: 1, employee: 'Jane Smith', date: '2025-07-15', reason: 'Personal', status: 'Accepted' },
  { id: 2, employee: 'Mark Lee', date: '2025-07-20', reason: 'Career Change', status: 'Pending' },
];

const EmployeeResignationPage: React.FC = () => (
  <div style={{ maxWidth: 700, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: '2rem' }}>
    <h2 style={{ marginBottom: '1.5rem', color: '#1890ff' }}>Employee Resignations</h2>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#f5f6fa' }}>
          <th style={{ padding: '0.75rem', textAlign: 'left' }}>Employee</th>
          <th>Date</th>
          <th>Reason</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {resignations.map(row => (
          <tr key={row.id}>
            <td style={{ padding: '0.75rem' }}>{row.employee}</td>
            <td>{row.date}</td>
            <td>{row.reason}</td>
            <td>{row.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default EmployeeResignationPage;

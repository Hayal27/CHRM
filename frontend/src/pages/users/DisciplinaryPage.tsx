import React from 'react';

const disciplinaryActions = [
  { id: 1, employee: 'John Doe', date: '2025-07-05', issue: 'Late Attendance', action: 'Warning' },
  { id: 2, employee: 'Jane Smith', date: '2025-07-10', issue: 'Unprofessional Conduct', action: 'Suspension' },
];

const EmployeeDisciplinaryPage: React.FC = () => (
  <div style={{ maxWidth: 700, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: '2rem' }}>
    <h2 style={{ marginBottom: '1.5rem', color: '#1890ff' }}>Disciplinary Actions</h2>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#f5f6fa' }}>
          <th style={{ padding: '0.75rem', textAlign: 'left' }}>Employee</th>
          <th>Date</th>
          <th>Issue</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {disciplinaryActions.map(row => (
          <tr key={row.id}>
            <td style={{ padding: '0.75rem' }}>{row.employee}</td>
            <td>{row.date}</td>
            <td>{row.issue}</td>
            <td>{row.action}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default EmployeeDisciplinaryPage;

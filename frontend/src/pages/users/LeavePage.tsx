import React from 'react';

const leaveRequests = [
  { id: 1, employee: 'John Doe', type: 'Annual', from: '2025-07-01', to: '2025-07-10', status: 'Approved' },
  { id: 2, employee: 'Jane Smith', type: 'Sick', from: '2025-07-12', to: '2025-07-14', status: 'Pending' },
];

const EmployeeLeavePage: React.FC = () => (
  <div style={{ maxWidth: 700, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: '2rem' }}>
    <h2 style={{ marginBottom: '1.5rem', color: '#1890ff' }}>Employee Leave Requests</h2>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#f5f6fa' }}>
          <th style={{ padding: '0.75rem', textAlign: 'left' }}>Employee</th>
          <th>Type</th>
          <th>From</th>
          <th>To</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {leaveRequests.map(row => (
          <tr key={row.id}>
            <td style={{ padding: '0.75rem' }}>{row.employee}</td>
            <td>{row.type}</td>
            <td>{row.from}</td>
            <td>{row.to}</td>
            <td>{row.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default EmployeeLeavePage;

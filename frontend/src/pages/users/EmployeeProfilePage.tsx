import React from 'react';

const profile = {
  name: 'John Doe',
  position: 'Software Engineer',
  department: 'IT',
  email: 'john.doe@company.com',
  phone: '+1 555-1234',
};

const EmployeeEmployeeProfilePage: React.FC = () => (
  <div style={{ maxWidth: 500, margin: '2rem auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: '2rem' }}>
    <h2 style={{ marginBottom: '1.5rem', color: '#1890ff' }}>Employee Profile</h2>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1890ff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
        JD
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 20 }}>{profile.name}</div>
        <div style={{ color: '#888' }}>{profile.position} - {profile.department}</div>
        <div>Email: {profile.email}</div>
        <div>Phone: {profile.phone}</div>
      </div>
    </div>
  </div>
);

export default EmployeeEmployeeProfilePage;

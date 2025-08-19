import React from 'react';
import { Descriptions, Tag, Avatar, Divider } from 'antd';

const sampleProfile = {
  employeeId: 'ETC-2025-001',
  name: 'Abebe Kebede',
  gender: 'Male',
  dob: '1985-03-21',
  status: 'Active',
  position: 'Lecturer',
  department: 'Computer Science',
  college: 'Ethiopian Poly Technical College',
  manager: 'Dr. Almaz Tadesse',
  joiningDate: '2012-09-01',
  contractType: 'Permanent',
  employeeType: 'Academic',
  grade: 'Senior',
  salary: '15,000 ETB',
  email: 'abebe.kebede@etc.edu.et',
  phone: '+251 911 123456',
  address: 'Bole, Addis Ababa, Ethiopia',
  emergencyContact: {
    name: 'Mulu Kebede',
    relation: 'Wife',
    phone: '+251 911 654321',
  },
  skills: ['Teaching', 'Research', 'Python', 'Data Science', 'Curriculum Development', 'Amharic', 'English'],
  education: 'M.Sc. Computer Science, Addis Ababa University',
  experience: '13 years',
  nationality: 'Ethiopian',
  maritalStatus: 'Married',
  religion: 'Orthodox Christian',
  bloodType: 'O+',
  tinNumber: '100-200-300',
  bankAccount: 'Awash Bank - 0123456789',
  photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  awards: ['Best Lecturer 2022', 'Research Grant Winner 2023'],
  publications: [
    'Machine Learning for Ethiopian Languages',
    'ICT in Technical Education',
  ],
  trainings: ['Pedagogy Training', 'ICT for Education', 'Leadership Workshop'],
  languages: ['Amharic', 'English', 'Oromo'],
  membership: ['Ethiopian Teachers Association', 'IEEE'],
  dependents: [
    { name: 'Kidist Kebede', relation: 'Daughter', age: 8 },
    { name: 'Kebede Abebe', relation: 'Son', age: 5 },
  ],
};

const EmployeeProfileDetails: React.FC = () => (
  <div>
    <Avatar src={sampleProfile.photoUrl} size={96} style={{ marginBottom: 16 }} />
    <Descriptions title="Employee Profile - Ethiopian Poly Technical College" bordered column={2} size="middle">
      <Descriptions.Item label="Employee ID">{sampleProfile.employeeId}</Descriptions.Item>
      <Descriptions.Item label="Status">
        <Tag color={sampleProfile.status === 'Active' ? 'green' : 'red'}>{sampleProfile.status}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Name">{sampleProfile.name}</Descriptions.Item>
      <Descriptions.Item label="Gender">{sampleProfile.gender}</Descriptions.Item>
      <Descriptions.Item label="Date of Birth">{sampleProfile.dob}</Descriptions.Item>
      <Descriptions.Item label="Nationality">{sampleProfile.nationality}</Descriptions.Item>
      <Descriptions.Item label="Religion">{sampleProfile.religion}</Descriptions.Item>
      <Descriptions.Item label="Blood Type">{sampleProfile.bloodType}</Descriptions.Item>
      <Descriptions.Item label="Marital Status">{sampleProfile.maritalStatus}</Descriptions.Item>
      <Descriptions.Item label="College">{sampleProfile.college}</Descriptions.Item>
      <Descriptions.Item label="Department">{sampleProfile.department}</Descriptions.Item>
      <Descriptions.Item label="Position">{sampleProfile.position}</Descriptions.Item>
      <Descriptions.Item label="Grade">{sampleProfile.grade}</Descriptions.Item>
      <Descriptions.Item label="Manager">{sampleProfile.manager}</Descriptions.Item>
      <Descriptions.Item label="Joining Date">{sampleProfile.joiningDate}</Descriptions.Item>
      <Descriptions.Item label="Contract Type">{sampleProfile.contractType}</Descriptions.Item>
      <Descriptions.Item label="Employee Type">{sampleProfile.employeeType}</Descriptions.Item>
      <Descriptions.Item label="Salary">{sampleProfile.salary}</Descriptions.Item>
      <Descriptions.Item label="TIN Number">{sampleProfile.tinNumber}</Descriptions.Item>
      <Descriptions.Item label="Bank Account">{sampleProfile.bankAccount}</Descriptions.Item>
      <Descriptions.Item label="Email">{sampleProfile.email}</Descriptions.Item>
      <Descriptions.Item label="Phone">{sampleProfile.phone}</Descriptions.Item>
      <Descriptions.Item label="Address" span={2}>{sampleProfile.address}</Descriptions.Item>
      <Descriptions.Item label="Emergency Contact Name">{sampleProfile.emergencyContact.name}</Descriptions.Item>
      <Descriptions.Item label="Emergency Contact Relation">{sampleProfile.emergencyContact.relation}</Descriptions.Item>
      <Descriptions.Item label="Emergency Contact Phone" span={2}>{sampleProfile.emergencyContact.phone}</Descriptions.Item>
      <Descriptions.Item label="Skills">
        {sampleProfile.skills.map(skill => (
          <Tag key={skill} color="blue" style={{ marginBottom: 4 }}>{skill}</Tag>
        ))}
      </Descriptions.Item>
      <Descriptions.Item label="Languages">
        {sampleProfile.languages.map(lang => (
          <Tag key={lang} color="purple" style={{ marginBottom: 4 }}>{lang}</Tag>
        ))}
      </Descriptions.Item>
      <Descriptions.Item label="Education" span={2}>{sampleProfile.education}</Descriptions.Item>
      <Descriptions.Item label="Experience">{sampleProfile.experience}</Descriptions.Item>
      <Descriptions.Item label="Awards">
        {sampleProfile.awards.map(award => (
          <Tag key={award} color="gold" style={{ marginBottom: 4 }}>{award}</Tag>
        ))}
      </Descriptions.Item>
      <Descriptions.Item label="Membership">
        {sampleProfile.membership.map(m => (
          <Tag key={m} color="cyan" style={{ marginBottom: 4 }}>{m}</Tag>
        ))}
      </Descriptions.Item>
      <Descriptions.Item label="Trainings">
        {sampleProfile.trainings.map(training => (
          <Tag key={training} color="green" style={{ marginBottom: 4 }}>{training}</Tag>
        ))}
      </Descriptions.Item>
      <Descriptions.Item label="Publications" span={2}>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {sampleProfile.publications.map(pub => (
            <li key={pub}>{pub}</li>
          ))}
        </ul>
      </Descriptions.Item>
      <Descriptions.Item label="Dependents" span={2}>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {sampleProfile.dependents.map(dep => (
            <li key={dep.name}>{dep.name} ({dep.relation}, Age: {dep.age})</li>
          ))}
        </ul>
      </Descriptions.Item>
    </Descriptions>
    <Divider />
    <Tag color="blue">Ethiopian Poly Technical College Employee Profile - {new Date().getFullYear()}</Tag>
  </div>
);

export default EmployeeProfileDetails;

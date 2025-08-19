import React from 'react';
import { Timeline, Card, Tag, Descriptions, Divider } from 'antd';

const disciplinaryData = {
  employee: {
    id: 'ETC-2025-001',
    name: 'Abebe Kebede',
    department: 'Computer Science',
    position: 'Lecturer',
    manager: 'Dr. Almaz Tadesse',
    status: 'Active',
  },
  records: [
    {
      date: '2025-06-15',
      event: 'Warning issued for late attendance',
      type: 'Warning',
      issuedBy: 'HR Department',
      actionTaken: 'Verbal warning and counseling',
      remarks: 'Employee was late 3 times in a month.',
      severity: 'Low',
      document: 'warning_letter_june2025.pdf',
    },
    {
      date: '2025-07-05',
      event: 'Verbal notice for missing deadline',
      type: 'Verbal Notice',
      issuedBy: 'Department Head',
      actionTaken: 'Verbal notice and follow-up',
      remarks: 'Missed project submission deadline.',
      severity: 'Medium',
      document: 'verbal_notice_july2025.pdf',
    },
    {
      date: '2025-07-15',
      event: 'Written warning for unprofessional conduct',
      type: 'Written Warning',
      issuedBy: 'Dean',
      actionTaken: 'Written warning, required training',
      remarks: 'Unprofessional behavior in staff meeting.',
      severity: 'High',
      document: 'written_warning_july2025.pdf',
    },
  ],
};

const DisciplinaryDetails: React.FC = () => (
  <Card title="Disciplinary Record - Detailed" bordered style={{ marginBottom: 24 }}>
    <Descriptions title="Employee Info" bordered size="small" column={2}>
      <Descriptions.Item label="Employee ID">{disciplinaryData.employee.id}</Descriptions.Item>
      <Descriptions.Item label="Status">
        <Tag color={disciplinaryData.employee.status === 'Active' ? 'green' : 'red'}>{disciplinaryData.employee.status}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="Name">{disciplinaryData.employee.name}</Descriptions.Item>
      <Descriptions.Item label="Department">{disciplinaryData.employee.department}</Descriptions.Item>
      <Descriptions.Item label="Position">{disciplinaryData.employee.position}</Descriptions.Item>
      <Descriptions.Item label="Manager">{disciplinaryData.employee.manager}</Descriptions.Item>
    </Descriptions>
    <Divider />
    <Timeline>
      {disciplinaryData.records.map((item, idx) => (
        <Timeline.Item key={idx} color={item.severity === 'High' ? 'red' : item.severity === 'Medium' ? 'orange' : 'blue'}>
          <Card size="small" title={<span>{item.date}: <Tag color="purple">{item.type}</Tag></span>} bordered={false}>
            <p><strong>Event:</strong> {item.event}</p>
            <p><strong>Issued By:</strong> {item.issuedBy}</p>
            <p><strong>Action Taken:</strong> {item.actionTaken}</p>
            <p><strong>Remarks:</strong> {item.remarks}</p>
            <p><strong>Severity:</strong> <Tag color={item.severity === 'High' ? 'red' : item.severity === 'Medium' ? 'orange' : 'blue'}>{item.severity}</Tag></p>
            <p><strong>Document:</strong> <a href={`#/${item.document}`}>{item.document}</a></p>
          </Card>
        </Timeline.Item>
      ))}
    </Timeline>
    <Divider />
    <Tag color="blue">Ethiopian Poly Technical College Disciplinary Record - {new Date().getFullYear()}</Tag>
  </Card>
);

export default DisciplinaryDetails;

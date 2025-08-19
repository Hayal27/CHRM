import React from 'react';
import { Table, Tag, Card, Descriptions, Divider, Statistic, Row, Col } from 'antd';

const leaveSummary = {
  employeeId: 'ETC-2025-001',
  name: 'Abebe Kebede',
  department: 'Computer Science',
  position: 'Lecturer',
  totalLeaves: 24,
  usedLeaves: 8,
  remainingLeaves: 16,
  sickLeaves: 3,
  annualLeaves: 5,
  emergencyLeaves: 0,
  status: 'Active',
};

const data = [
  { key: 1, type: 'Annual', from: '2025-07-10', to: '2025-07-12', status: 'Approved', days: 3, reason: 'Family vacation', appliedOn: '2025-07-01', approver: 'Dr. Almaz Tadesse', remarks: 'Approved on time', document: 'annual_leave_approval.pdf' },
  { key: 2, type: 'Sick', from: '2025-07-15', to: '2025-07-16', status: 'Pending', days: 2, reason: 'Flu', appliedOn: '2025-07-14', approver: 'HR Department', remarks: 'Awaiting medical certificate', document: 'sick_leave_request.pdf' },
  { key: 3, type: 'Annual', from: '2025-06-20', to: '2025-06-22', status: 'Rejected', days: 3, reason: 'Personal', appliedOn: '2025-06-10', approver: 'Dean', remarks: 'Insufficient leave balance', document: 'annual_leave_rejection.pdf' },
  { key: 4, type: 'Emergency', from: '2025-05-05', to: '2025-05-05', status: 'Approved', days: 1, reason: 'Family emergency', appliedOn: '2025-05-04', approver: 'HR Department', remarks: 'Emergency leave granted', document: 'emergency_leave_approval.pdf' },
];

const columns = [
  { title: 'Type', dataIndex: 'type', key: 'type', render: (type: string) => <Tag color={type === 'Annual' ? 'blue' : type === 'Sick' ? 'volcano' : type === 'Emergency' ? 'red' : 'purple'}>{type}</Tag> },
  { title: 'From', dataIndex: 'from', key: 'from' },
  { title: 'To', dataIndex: 'to', key: 'to' },
  { title: 'Days', dataIndex: 'days', key: 'days' },
  { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => {
      let color = 'green';
      if (status === 'Pending') color = 'orange';
      else if (status === 'Rejected') color = 'red';
      return <Tag color={color}>{status}</Tag>;
    }
  },
  { title: 'Reason', dataIndex: 'reason', key: 'reason' },
  { title: 'Applied On', dataIndex: 'appliedOn', key: 'appliedOn' },
  { title: 'Approver', dataIndex: 'approver', key: 'approver' },
  { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' },
  { title: 'Document', dataIndex: 'document', key: 'document', render: (doc: string) => <a href={`#/${doc}`}>{doc}</a> },
];

const LeaveDetails: React.FC = () => (
  <Card title="Leave Details - Ethiopian Poly Technical College" bordered>
    <Descriptions title="Employee Leave Summary" bordered size="small" column={2}>
      <Descriptions.Item label="Employee ID">{leaveSummary.employeeId}</Descriptions.Item>
      <Descriptions.Item label="Name">{leaveSummary.name}</Descriptions.Item>
      <Descriptions.Item label="Department">{leaveSummary.department}</Descriptions.Item>
      <Descriptions.Item label="Position">{leaveSummary.position}</Descriptions.Item>
      <Descriptions.Item label="Status">
        <Tag color={leaveSummary.status === 'Active' ? 'green' : 'red'}>{leaveSummary.status}</Tag>
      </Descriptions.Item>
    </Descriptions>
    <Divider />
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={6}><Statistic title="Total Leaves" value={leaveSummary.totalLeaves} /></Col>
      <Col span={6}><Statistic title="Used Leaves" value={leaveSummary.usedLeaves} valueStyle={{ color: 'blue' }} /></Col>
      <Col span={6}><Statistic title="Remaining Leaves" value={leaveSummary.remainingLeaves} valueStyle={{ color: 'green' }} /></Col>
      <Col span={6}><Statistic title="Sick Leaves" value={leaveSummary.sickLeaves} valueStyle={{ color: 'volcano' }} /></Col>
    </Row>
    <Table dataSource={data} columns={columns} pagination={false} bordered size="small" />
    <Divider />
    <Tag color="blue">Ethiopian Poly Technical College Leave Record - {new Date().getFullYear()}</Tag>
  </Card>
);

export default LeaveDetails;

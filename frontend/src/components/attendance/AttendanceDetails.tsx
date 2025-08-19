import React from 'react';
import { Table, Tag, Card, Descriptions, Divider, Statistic, Row, Col } from 'antd';

const attendanceSummary = {
  employeeId: 'ETC-2025-001',
  name: 'Abebe Kebede',
  department: 'Computer Science',
  position: 'Lecturer',
  month: 'July 2025',
  totalDays: 18,
  present: 15,
  absent: 2,
  late: 1,
  holidays: 2,
  status: 'Good',
};

const data = [
  { key: 1, date: '2025-07-01', status: 'Present', checkIn: '08:05', checkOut: '17:00', remarks: '', type: 'Regular' },
  { key: 2, date: '2025-07-02', status: 'Absent', checkIn: '', checkOut: '', remarks: 'Sick leave', type: 'Leave' },
  { key: 3, date: '2025-07-03', status: 'Present', checkIn: '08:10', checkOut: '17:05', remarks: 'Late arrival', type: 'Regular' },
  { key: 4, date: '2025-07-04', status: 'Present', checkIn: '08:00', checkOut: '17:00', remarks: '', type: 'Regular' },
  { key: 5, date: '2025-07-05', status: 'Holiday', checkIn: '', checkOut: '', remarks: 'National Holiday', type: 'Holiday' },
  { key: 6, date: '2025-07-06', status: 'Present', checkIn: '08:03', checkOut: '17:02', remarks: '', type: 'Regular' },
  { key: 7, date: '2025-07-07', status: 'Present', checkIn: '08:00', checkOut: '17:00', remarks: '', type: 'Regular' },
  { key: 8, date: '2025-07-08', status: 'Absent', checkIn: '', checkOut: '', remarks: 'Personal leave', type: 'Leave' },
  { key: 9, date: '2025-07-09', status: 'Present', checkIn: '08:00', checkOut: '17:00', remarks: '', type: 'Regular' },
  { key: 10, date: '2025-07-10', status: 'Present', checkIn: '08:00', checkOut: '17:00', remarks: '', type: 'Regular' },
  { key: 11, date: '2025-07-11', status: 'Present', checkIn: '08:00', checkOut: '17:00', remarks: '', type: 'Regular' },
  { key: 12, date: '2025-07-12', status: 'Present', checkIn: '08:00', checkOut: '17:00', remarks: '', type: 'Regular' },
  { key: 13, date: '2025-07-13', status: 'Present', checkIn: '08:00', checkOut: '17:00', remarks: '', type: 'Regular' },
  { key: 14, date: '2025-07-14', status: 'Present', checkIn: '08:00', checkOut: '17:00', remarks: '', type: 'Regular' },
  { key: 15, date: '2025-07-15', status: 'Present', checkIn: '08:00', checkOut: '17:00', remarks: '', type: 'Regular' },
  { key: 16, date: '2025-07-16', status: 'Present', checkIn: '08:00', checkOut: '17:00', remarks: '', type: 'Regular' },
  { key: 17, date: '2025-07-17', status: 'Present', checkIn: '08:00', checkOut: '17:00', remarks: '', type: 'Regular' },
  { key: 18, date: '2025-07-18', status: 'Present', checkIn: '08:00', checkOut: '17:00', remarks: '', type: 'Regular' },
];

const columns = [
  { title: 'Date', dataIndex: 'date', key: 'date' },
  { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => {
      let color = 'green';
      if (status === 'Absent') color = 'red';
      else if (status === 'Late') color = 'orange';
      else if (status === 'Holiday') color = 'blue';
      return <Tag color={color}>{status}</Tag>;
    }
  },
  { title: 'Check-In', dataIndex: 'checkIn', key: 'checkIn' },
  { title: 'Check-Out', dataIndex: 'checkOut', key: 'checkOut' },
  { title: 'Type', dataIndex: 'type', key: 'type', render: (type: string) => <Tag color={type === 'Regular' ? 'green' : type === 'Leave' ? 'volcano' : 'blue'}>{type}</Tag> },
  { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' },
];

const AttendanceDetails: React.FC = () => (
  <Card title="Attendance Details - July 2025" bordered>
    <Descriptions title="Employee Attendance Summary" bordered size="small" column={2}>
      <Descriptions.Item label="Employee ID">{attendanceSummary.employeeId}</Descriptions.Item>
      <Descriptions.Item label="Name">{attendanceSummary.name}</Descriptions.Item>
      <Descriptions.Item label="Department">{attendanceSummary.department}</Descriptions.Item>
      <Descriptions.Item label="Position">{attendanceSummary.position}</Descriptions.Item>
      <Descriptions.Item label="Month">{attendanceSummary.month}</Descriptions.Item>
      <Descriptions.Item label="Status">
        <Tag color={attendanceSummary.status === 'Good' ? 'green' : 'red'}>{attendanceSummary.status}</Tag>
      </Descriptions.Item>
    </Descriptions>
    <Divider />
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={6}><Statistic title="Total Days" value={attendanceSummary.totalDays} /></Col>
      <Col span={6}><Statistic title="Present" value={attendanceSummary.present} valueStyle={{ color: 'green' }} /></Col>
      <Col span={6}><Statistic title="Absent" value={attendanceSummary.absent} valueStyle={{ color: 'red' }} /></Col>
      <Col span={6}><Statistic title="Late" value={attendanceSummary.late} valueStyle={{ color: 'orange' }} /></Col>
    </Row>
    <Table dataSource={data} columns={columns} pagination={false} bordered size="small" />
    <Divider />
    <Tag color="blue">Ethiopian Poly Technical College Attendance Record - {new Date().getFullYear()}</Tag>
  </Card>
);

export default AttendanceDetails;

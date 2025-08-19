import React from 'react';
import { Card, Tag, Descriptions, Divider, Timeline, Statistic, Row, Col, Table } from 'antd';

const trainingSummary = {
  employeeId: 'ETC-2025-001',
  name: 'Abebe Kebede',
  department: 'Computer Science',
  position: 'Lecturer',
  totalTrainings: 6,
  completed: 4,
  scheduled: 2,
  status: 'Active',
};

const trainings = [
  {
    title: 'React Basics',
    date: '2025-07-20',
    status: 'Completed',
    type: 'Technical',
    duration: '2 days',
    organizer: 'ICT Center',
    certificate: true,
    remarks: 'Excellent performance',
    document: 'react_basics_certificate.pdf',
  },
  {
    title: 'Ant Design UI',
    date: '2025-07-25',
    status: 'Scheduled',
    type: 'Technical',
    duration: '1 day',
    organizer: 'ICT Center',
    certificate: false,
    remarks: 'To be attended',
    document: '',
  },
  {
    title: 'Pedagogy Training',
    date: '2025-06-10',
    status: 'Completed',
    type: 'Professional',
    duration: '3 days',
    organizer: 'HR Department',
    certificate: true,
    remarks: 'Certificate awarded',
    document: 'pedagogy_training_certificate.pdf',
  },
  {
    title: 'Leadership Workshop',
    date: '2025-05-15',
    status: 'Completed',
    type: 'Professional',
    duration: '1 day',
    organizer: 'Dean Office',
    certificate: true,
    remarks: 'Participated actively',
    document: 'leadership_workshop_certificate.pdf',
  },
  {
    title: 'Data Science Bootcamp',
    date: '2025-04-20',
    status: 'Completed',
    type: 'Technical',
    duration: '5 days',
    organizer: 'ICT Center',
    certificate: true,
    remarks: 'Top performer',
    document: 'data_science_bootcamp_certificate.pdf',
  },
  {
    title: 'Safety Awareness',
    date: '2025-08-10',
    status: 'Scheduled',
    type: 'General',
    duration: '1 day',
    organizer: 'HR Department',
    certificate: false,
    remarks: 'Mandatory for all staff',
    document: '',
  },
];

const TrainingDetails: React.FC = () => (
  <Card title="Training Details - Ethiopian Poly Technical College" bordered>
    <Descriptions title="Employee Training Summary" bordered size="small" column={2}>
      <Descriptions.Item label="Employee ID">{trainingSummary.employeeId}</Descriptions.Item>
      <Descriptions.Item label="Name">{trainingSummary.name}</Descriptions.Item>
      <Descriptions.Item label="Department">{trainingSummary.department}</Descriptions.Item>
      <Descriptions.Item label="Position">{trainingSummary.position}</Descriptions.Item>
      <Descriptions.Item label="Status">
        <Tag color={trainingSummary.status === 'Active' ? 'green' : 'red'}>{trainingSummary.status}</Tag>
      </Descriptions.Item>
    </Descriptions>
    <Divider />
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={8}><Statistic title="Total Trainings" value={trainingSummary.totalTrainings} /></Col>
      <Col span={8}><Statistic title="Completed" value={trainingSummary.completed} valueStyle={{ color: 'green' }} /></Col>
      <Col span={8}><Statistic title="Scheduled" value={trainingSummary.scheduled} valueStyle={{ color: 'blue' }} /></Col>
    </Row>
    <Table
      dataSource={trainings.map((t, idx) => ({ ...t, key: idx }))}
      columns={[
        { title: 'Title', dataIndex: 'title', key: 'title' },
        { title: 'Date', dataIndex: 'date', key: 'date' },
        { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={status === 'Completed' ? 'green' : 'blue'}>{status}</Tag> },
        { title: 'Type', dataIndex: 'type', key: 'type', render: (type: string) => <Tag color={type === 'Technical' ? 'geekblue' : type === 'Professional' ? 'purple' : 'volcano'}>{type}</Tag> },
        { title: 'Duration', dataIndex: 'duration', key: 'duration' },
        { title: 'Organizer', dataIndex: 'organizer', key: 'organizer' },
        { title: 'Certificate', dataIndex: 'certificate', key: 'certificate', render: (cert: boolean, record: any) => cert ? <a href={`#/${record.document}`}>Download</a> : <Tag color="red">No</Tag> },
        { title: 'Remarks', dataIndex: 'remarks', key: 'remarks' },
      ]}
      pagination={false}
      bordered
      size="small"
    />
    <Divider />
    <Timeline>
      {trainings.map((item, idx) => (
        <Timeline.Item key={idx} color={item.status === 'Completed' ? 'green' : 'blue'}>
          <strong>{item.date}</strong>: {item.title} (<Tag color={item.status === 'Completed' ? 'green' : 'blue'}>{item.status}</Tag>)
        </Timeline.Item>
      ))}
    </Timeline>
    <Divider />
    <Tag color="blue">Ethiopian Poly Technical College Training Record - {new Date().getFullYear()}</Tag>
  </Card>
);

export default TrainingDetails;

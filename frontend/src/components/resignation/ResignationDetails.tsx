import React, { useState } from 'react';
import { Descriptions, Tag, Card, Divider, Timeline, Button, Modal, Form, Input, DatePicker } from 'antd';

const resignationData = {
  employeeId: 'ETC-2025-001',
  name: 'Abebe Kebede',
  department: 'Computer Science',
  position: 'Lecturer',
  manager: 'Dr. Almaz Tadesse',
  status: 'Pending Approval',
  resignationDate: '2025-08-01',
  lastWorkingDay: '2025-08-31',
  reason: 'Personal',
  appliedOn: '2025-07-18',
  remarks: 'Submitted formal resignation letter.',
  documents: ['resignation_letter.pdf', 'exit_interview_form.pdf'],
  approvalTimeline: [
    { date: '2025-07-18', event: 'Resignation submitted', by: 'Abebe Kebede', status: 'Pending' },
    { date: '2025-07-19', event: 'Manager review', by: 'Dr. Almaz Tadesse', status: 'Pending' },
    { date: '2025-07-20', event: 'HR review', by: 'HR Department', status: 'Pending' },
  ],
  exitInterview: {
    scheduled: true,
    date: '2025-08-15',
    interviewer: 'HR Manager',
    feedback: 'To be completed',
  },
};

const ResignationDetails: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleOpenModal = () => setModalVisible(true);
  const handleCloseModal = () => setModalVisible(false);

  const handleSubmit = (values: any) => {
    // Here you would send resignation data to backend
    Modal.success({
      title: 'Resignation Submitted',
      content: `Your resignation for ${values.resignationDate.format('YYYY-MM-DD')} has been submitted.`,
    });
    setModalVisible(false);
    form.resetFields();
  };

  return (
    
    
    <Card title="Resignation Details - Ethiopian Poly Technical College" bordered>
    
          <Button type="primary" onClick={handleOpenModal} style={{ marginBottom: 16 }}>
        Submit Resignation
      </Button>
    
      <Descriptions title="Employee Info" bordered size="small" column={2}>
        <Descriptions.Item label="Employee ID">{resignationData.employeeId}</Descriptions.Item>
        <Descriptions.Item label="Name">{resignationData.name}</Descriptions.Item>
        <Descriptions.Item label="Department">{resignationData.department}</Descriptions.Item>
        <Descriptions.Item label="Position">{resignationData.position}</Descriptions.Item>
        <Descriptions.Item label="Manager">{resignationData.manager}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={resignationData.status === 'Pending Approval' ? 'orange' : resignationData.status === 'Approved' ? 'green' : 'red'}>{resignationData.status}</Tag>
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <Descriptions title="Resignation Info" bordered size="small" column={2}>
        <Descriptions.Item label="Resignation Date">{resignationData.resignationDate}</Descriptions.Item>
        <Descriptions.Item label="Last Working Day">{resignationData.lastWorkingDay}</Descriptions.Item>
        <Descriptions.Item label="Reason">{resignationData.reason}</Descriptions.Item>
        <Descriptions.Item label="Applied On">{resignationData.appliedOn}</Descriptions.Item>
        <Descriptions.Item label="Remarks" span={2}>{resignationData.remarks}</Descriptions.Item>
        <Descriptions.Item label="Documents" span={2}>
          {resignationData.documents.map(doc => (
            <a key={doc} href={`#/${doc}`} style={{ marginRight: 8 }}>{doc}</a>
          ))}
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <Descriptions title="Exit Interview" bordered size="small" column={2}>
        <Descriptions.Item label="Scheduled">{resignationData.exitInterview.scheduled ? <Tag color="blue">Yes</Tag> : <Tag color="red">No</Tag>}</Descriptions.Item>
        <Descriptions.Item label="Date">{resignationData.exitInterview.date}</Descriptions.Item>
        <Descriptions.Item label="Interviewer">{resignationData.exitInterview.interviewer}</Descriptions.Item>
        <Descriptions.Item label="Feedback" span={2}>{resignationData.exitInterview.feedback}</Descriptions.Item>
      </Descriptions>
      <Divider />
      <Timeline>
        {resignationData.approvalTimeline.map((item, idx) => (
          <Timeline.Item key={idx} color={item.status === 'Pending' ? 'orange' : item.status === 'Approved' ? 'green' : 'red'}>
            <strong>{item.date}</strong>: {item.event} (<em>{item.by}</em>) <Tag color={item.status === 'Pending' ? 'orange' : item.status === 'Approved' ? 'green' : 'red'}>{item.status}</Tag>
          </Timeline.Item>
        ))}
      </Timeline>
      <Divider />

      <Modal
        title="Submit Resignation"
        visible={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="resignationDate" label="Resignation Date" rules={[{ required: true, message: 'Please select resignation date' }]}> 
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="lastWorkingDay" label="Last Working Day" rules={[{ required: true, message: 'Please select last working day' }]}> 
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="Reason" rules={[{ required: true, message: 'Please enter reason' }]}> 
            <Input.TextArea rows={3} placeholder="Reason for resignation" />
          </Form.Item>
          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea rows={2} placeholder="Any additional remarks" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Submit</Button>
          </Form.Item>
        </Form>
      </Modal>
      <Tag color="blue">Ethiopian Poly Technical College Resignation Record - {new Date().getFullYear()}</Tag>
    </Card>
  );
};

export default ResignationDetails;

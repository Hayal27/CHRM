import React, { useState } from 'react';
import { Card, Button, Modal, Form, Input, DatePicker, Select, message } from 'antd';
import LeaveDetails from '../components/leave/LeaveDetails.tsx';

const { Option } = Select;

const LeavePage: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleOpenModal = () => setModalVisible(true);
  const handleCloseModal = () => setModalVisible(false);

  const handleSubmit = (values: any) => {
    // Here you would send leave data to backend
    message.success(`Leave request for ${values.type} from ${values.from.format('YYYY-MM-DD')} to ${values.to.format('YYYY-MM-DD')} submitted.`);
    setModalVisible(false);
    form.resetFields();
  };

  return (
    <Card title="Leave Management">
      <Button type="primary" onClick={handleOpenModal} style={{ marginBottom: 16 }}>
        Submit Leave Request
      </Button>
      <Modal
        title="Submit Leave Request"
        visible={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="type" label="Leave Type" rules={[{ required: true, message: 'Please select leave type' }]}> 
            <Select placeholder="Select leave type">
              <Option value="Annual">Annual</Option>
              <Option value="Sick">Sick</Option>
              <Option value="Emergency">Emergency</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item name="from" label="From" rules={[{ required: true, message: 'Please select start date' }]}> 
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="to" label="To" rules={[{ required: true, message: 'Please select end date' }]}> 
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label="Reason" rules={[{ required: true, message: 'Please enter reason' }]}> 
            <Input.TextArea rows={3} placeholder="Reason for leave" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>Submit</Button>
          </Form.Item>
        </Form>
      </Modal>
      <LeaveDetails />
    </Card>
  );
};

export default LeavePage;

import React, { useState } from 'react';
import { Typography, Card, Table, Button, Modal, Form, Input, DatePicker, Select, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

interface TrainingSession {
  id: number;
  title: string;
  trainer: string;
  date: string;
  status: 'Scheduled' | 'Completed';
  feedback: string;
}

const initialTrainings: TrainingSession[] = [
  { id: 1, title: 'React Basics', trainer: 'Alice Brown', date: '2024-07-20', status: 'Scheduled', feedback: '' },
  { id: 2, title: 'Leadership Skills', trainer: 'Bob Lee', date: '2024-06-15', status: 'Completed', feedback: 'Very useful.' },
];

const TrainingDashboard: React.FC = () => {
  const [trainings, setTrainings] = useState<TrainingSession[]>(initialTrainings);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTraining, setEditingTraining] = useState<TrainingSession | null>(null);
  const [form] = Form.useForm();

  const showAddModal = () => {
    setEditingTraining(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (record: TrainingSession) => {
    setEditingTraining(record);
    form.setFieldsValue({ ...record, date: dayjs(record.date) });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setTrainings(prev => prev.filter(t => t.id !== id));
    message.success('Training deleted');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const newTraining: TrainingSession = {
        ...values,
        id: editingTraining ? editingTraining.id : Date.now(),
        date: values.date.format('YYYY-MM-DD'),
      };
      if (editingTraining) {
        setTrainings(prev => prev.map(t => t.id === editingTraining.id ? newTraining : t));
        message.success('Training updated');
      } else {
        setTrainings(prev => [...prev, newTraining]);
        message.success('Training added');
      }
      setModalVisible(false);
      form.resetFields();
    } catch {}
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Trainer', dataIndex: 'trainer', key: 'trainer' },
    { title: 'Date', dataIndex: 'date', key: 'date', render: (date: string) => dayjs(date).format('YYYY-MM-DD') },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => <span style={{ color: status === 'Completed' ? 'green' : 'orange' }}>{status}</span> },
    { title: 'Feedback', dataIndex: 'feedback', key: 'feedback' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TrainingSession) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => showEditModal(record)} />
          <Popconfirm title="Delete this training?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Training & Development</Title>
      <Card style={{ marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Training
        </Button>
      </Card>
      <Card>
        <Table
          columns={columns}
          dataSource={trainings}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </Card>
      <Modal
        title={editingTraining ? 'Edit Training' : 'Add Training'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingTraining ? 'Update' : 'Add'}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'Scheduled' }}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Please enter training title' }]}> <Input /> </Form.Item>
          <Form.Item name="trainer" label="Trainer" rules={[{ required: true, message: 'Please enter trainer name' }]}> <Input /> </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please select date' }]}> <DatePicker style={{ width: '100%' }} /> </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}> <Select> <Option value="Scheduled">Scheduled</Option> <Option value="Completed">Completed</Option> </Select> </Form.Item>
          <Form.Item name="feedback" label="Feedback"> <Input.TextArea rows={2} /> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TrainingDashboard;

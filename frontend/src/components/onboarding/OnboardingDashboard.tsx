import React, { useState, useEffect } from 'react';
import { Typography, Card, Table, Button, Modal, Form, Input, DatePicker, Select, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

interface NewHire {
  id: number;
  name: string;
  email: string;
  position: string;
  startDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

const initialNewHires: NewHire[] = [
  { id: 1, name: 'Alice Brown', email: 'alice.brown@example.com', position: 'Designer', startDate: '2024-07-01', status: 'Pending' },
  { id: 2, name: 'Bob Lee', email: 'bob.lee@example.com', position: 'QA Engineer', startDate: '2024-07-10', status: 'Completed' },
];

const OnboardingDashboard: React.FC = () => {
  const [newHires, setNewHires] = useState<NewHire[]>(initialNewHires);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHire, setEditingHire] = useState<NewHire | null>(null);
  const [form] = Form.useForm();

  const showAddModal = () => {
    setEditingHire(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (record: NewHire) => {
    setEditingHire(record);
    form.setFieldsValue({ ...record, startDate: dayjs(record.startDate) });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setNewHires(prev => prev.filter(h => h.id !== id));
    message.success('New hire deleted');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const newHire: NewHire = {
        ...values,
        id: editingHire ? editingHire.id : Date.now(),
        startDate: values.startDate.format('YYYY-MM-DD'),
      };
      if (editingHire) {
        setNewHires(prev => prev.map(h => h.id === editingHire.id ? newHire : h));
        message.success('New hire updated');
      } else {
        setNewHires(prev => [...prev, newHire]);
        message.success('New hire added');
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
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Position', dataIndex: 'position', key: 'position' },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate', render: (date: string) => dayjs(date).format('YYYY-MM-DD') },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => <span style={{ color: status === 'Completed' ? 'green' : 'orange' }}>{status}</span> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: NewHire) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => showEditModal(record)} />
          <Popconfirm title="Delete this new hire?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Defensive fallback for employees state
  useEffect(() => {
    if (!Array.isArray(newHires)) {
      setNewHires([
        {
          id: 1,
          name: 'Abebe Kebede',
          email: 'abebe.kebede@etc.edu.et',
          position: 'Lecturer',
          startDate: '2025-07-01',
          status: 'Pending',
        },
        {
          id: 2,
          name: 'Sara Lee',
          email: 'sara.lee@etc.edu.et',
          position: 'HR Specialist',
          startDate: '2025-07-05',
          status: 'In Progress',
        },
        {
          id: 3,
          name: 'Mike Johnson',
          email: 'mike.johnson@etc.edu.et',
          position: 'Accountant',
          startDate: '2025-07-10',
          status: 'Completed',
        },
      ]);
    }
  }, [newHires]);

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Onboarding</Title>
      <Card style={{ marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add New Hire
        </Button>
      </Card>
      <Card>
        <Table
          columns={columns}
          dataSource={newHires}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </Card>
      <Modal
        title={editingHire ? 'Edit New Hire' : 'Add New Hire'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingHire ? 'Update' : 'Add'}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'Pending' }}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter name' }]}> <Input /> </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}> <Input /> </Form.Item>
          <Form.Item name="position" label="Position" rules={[{ required: true, message: 'Please enter position' }]}> <Input /> </Form.Item>
          <Form.Item name="startDate" label="Start Date" rules={[{ required: true, message: 'Please select date' }]}> <DatePicker style={{ width: '100%' }} /> </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}> <Select> <Option value="Pending">Pending</Option> <Option value="In Progress">In Progress</Option> <Option value="Completed">Completed</Option> </Select> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OnboardingDashboard;

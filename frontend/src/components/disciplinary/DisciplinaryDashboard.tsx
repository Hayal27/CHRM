import React, { useState } from 'react';
import { Typography, Card, Table, Button, Modal, Form, Input, DatePicker, Select, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

interface DisciplinaryAction {
  id: number;
  employee: string;
  date: string;
  type: 'Warning' | 'Suspension' | 'Termination';
  description: string;
  status: 'Open' | 'Closed';
}

const initialActions: DisciplinaryAction[] = [
  { id: 1, employee: 'John Doe', date: '2024-07-01', type: 'Warning', description: 'Late attendance', status: 'Closed' },
  { id: 2, employee: 'Jane Smith', date: '2024-06-20', type: 'Suspension', description: 'Policy violation', status: 'Open' },
];

const DisciplinaryDashboard: React.FC = () => {
  const [actions, setActions] = useState<DisciplinaryAction[]>(initialActions);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAction, setEditingAction] = useState<DisciplinaryAction | null>(null);
  const [form] = Form.useForm();

  const showAddModal = () => {
    setEditingAction(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (record: DisciplinaryAction) => {
    setEditingAction(record);
    form.setFieldsValue({ ...record, date: dayjs(record.date) });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setActions(prev => prev.filter(a => a.id !== id));
    message.success('Action deleted');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const newAction: DisciplinaryAction = {
        ...values,
        id: editingAction ? editingAction.id : Date.now(),
        date: values.date.format('YYYY-MM-DD'),
      };
      if (editingAction) {
        setActions(prev => prev.map(a => a.id === editingAction.id ? newAction : a));
        message.success('Action updated');
      } else {
        setActions(prev => [...prev, newAction]);
        message.success('Action added');
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
    { title: 'Employee', dataIndex: 'employee', key: 'employee' },
    { title: 'Date', dataIndex: 'date', key: 'date', render: (date: string) => dayjs(date).format('YYYY-MM-DD') },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => <span style={{ color: status === 'Closed' ? 'green' : 'orange' }}>{status}</span> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: DisciplinaryAction) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => showEditModal(record)} />
          <Popconfirm title="Delete this action?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Disciplinary Actions</Title>
      <Card style={{ marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Action
        </Button>
      </Card>
      <Card>
        <Table
          columns={columns}
          dataSource={actions}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </Card>
      <Modal
        title={editingAction ? 'Edit Action' : 'Add Action'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingAction ? 'Update' : 'Add'}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'Open', type: 'Warning' }}
        >
          <Form.Item name="employee" label="Employee" rules={[{ required: true, message: 'Please enter employee name' }]}> <Input /> </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please select date' }]}> <DatePicker style={{ width: '100%' }} /> </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}> <Select> <Option value="Warning">Warning</Option> <Option value="Suspension">Suspension</Option> <Option value="Termination">Termination</Option> </Select> </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Please enter description' }]}> <Input.TextArea rows={2} /> </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}> <Select> <Option value="Open">Open</Option> <Option value="Closed">Closed</Option> </Select> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DisciplinaryDashboard;

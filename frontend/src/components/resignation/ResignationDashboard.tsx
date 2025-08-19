import React, { useState } from 'react';
import { Typography, Card, Table, Button, Modal, Form, Input, DatePicker, Select, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

interface ResignationRecord {
  id: number;
  employee: string;
  date: string;
  type: 'Resignation' | 'Termination';
  reason: string;
  status: 'Pending' | 'Completed';
}

const initialResignations: ResignationRecord[] = [
  { id: 1, employee: 'John Doe', date: '2024-07-10', type: 'Resignation', reason: 'Personal reasons', status: 'Pending' },
  { id: 2, employee: 'Jane Smith', date: '2024-06-30', type: 'Termination', reason: 'Policy violation', status: 'Completed' },
];

const ResignationDashboard: React.FC = () => {
  const [resignations, setResignations] = useState<ResignationRecord[]>(initialResignations);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingResignation, setEditingResignation] = useState<ResignationRecord | null>(null);
  const [form] = Form.useForm();

  const showAddModal = () => {
    setEditingResignation(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (record: ResignationRecord) => {
    setEditingResignation(record);
    form.setFieldsValue({ ...record, date: dayjs(record.date) });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setResignations(prev => prev.filter(r => r.id !== id));
    message.success('Record deleted');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const newResignation: ResignationRecord = {
        ...values,
        id: editingResignation ? editingResignation.id : Date.now(),
        date: values.date.format('YYYY-MM-DD'),
      };
      if (editingResignation) {
        setResignations(prev => prev.map(r => r.id === editingResignation.id ? newResignation : r));
        message.success('Record updated');
      } else {
        setResignations(prev => [...prev, newResignation]);
        message.success('Record added');
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
    { title: 'Reason', dataIndex: 'reason', key: 'reason' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => <span style={{ color: status === 'Completed' ? 'green' : 'orange' }}>{status}</span> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ResignationRecord) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => showEditModal(record)} />
          <Popconfirm title="Delete this record?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Resignation / Termination</Title>
      <Card style={{ marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Resignation
        </Button>
      </Card>
      <Card>
        <Table
          columns={columns}
          dataSource={resignations}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </Card>
      <Modal
        title={editingResignation ? 'Edit Record' : 'Add Resignation'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingResignation ? 'Update' : 'Add'}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'Pending', type: 'Resignation' }}
        >
          <Form.Item name="employee" label="Employee" rules={[{ required: true, message: 'Please enter employee name' }]}> <Input /> </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please select date' }]}> <DatePicker style={{ width: '100%' }} /> </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}> <Select> <Option value="Resignation">Resignation</Option> <Option value="Termination">Termination</Option> </Select> </Form.Item>
          <Form.Item name="reason" label="Reason" rules={[{ required: true, message: 'Please enter reason' }]}> <Input.TextArea rows={2} /> </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}> <Select> <Option value="Pending">Pending</Option> <Option value="Completed">Completed</Option> </Select> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ResignationDashboard;

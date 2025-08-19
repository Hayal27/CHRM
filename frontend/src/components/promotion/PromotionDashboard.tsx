import React, { useState } from 'react';
import { Typography, Card, Table, Button, Modal, Form, Input, DatePicker, Select, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

interface PromotionRequest {
  id: number;
  employee: string;
  type: 'Promotion' | 'Transfer';
  from: string;
  to: string;
  effectiveDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
}

const initialPromotions: PromotionRequest[] = [
  { id: 1, employee: 'John Doe', type: 'Promotion', from: 'Junior Dev', to: 'Senior Dev', effectiveDate: '2024-08-01', status: 'Pending', reason: 'Excellent performance' },
  { id: 2, employee: 'Jane Smith', type: 'Transfer', from: 'HR', to: 'Finance', effectiveDate: '2024-07-15', status: 'Approved', reason: 'Department need' },
];

const PromotionDashboard: React.FC = () => {
  const [promotions, setPromotions] = useState<PromotionRequest[]>(initialPromotions);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionRequest | null>(null);
  const [form] = Form.useForm();

  const showAddModal = () => {
    setEditingPromotion(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (record: PromotionRequest) => {
    setEditingPromotion(record);
    form.setFieldsValue({ ...record, effectiveDate: dayjs(record.effectiveDate) });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
    message.success('Request deleted');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const newPromotion: PromotionRequest = {
        ...values,
        id: editingPromotion ? editingPromotion.id : Date.now(),
        effectiveDate: values.effectiveDate.format('YYYY-MM-DD'),
      };
      if (editingPromotion) {
        setPromotions(prev => prev.map(p => p.id === editingPromotion.id ? newPromotion : p));
        message.success('Request updated');
      } else {
        setPromotions(prev => [...prev, newPromotion]);
        message.success('Request added');
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
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'From', dataIndex: 'from', key: 'from' },
    { title: 'To', dataIndex: 'to', key: 'to' },
    { title: 'Effective Date', dataIndex: 'effectiveDate', key: 'effectiveDate', render: (date: string) => dayjs(date).format('YYYY-MM-DD') },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => <span style={{ color: status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'orange' }}>{status}</span> },
    { title: 'Reason', dataIndex: 'reason', key: 'reason' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PromotionRequest) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => showEditModal(record)} />
          <Popconfirm title="Delete this request?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Promotion / Transfer</Title>
      <Card style={{ marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Promotion/Transfer
        </Button>
      </Card>
      <Card>
        <Table
          columns={columns}
          dataSource={promotions}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </Card>
      <Modal
        title={editingPromotion ? 'Edit Request' : 'Add Promotion/Transfer'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingPromotion ? 'Update' : 'Add'}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'Pending', type: 'Promotion' }}
        >
          <Form.Item name="employee" label="Employee" rules={[{ required: true, message: 'Please enter employee name' }]}> <Input /> </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}> <Select> <Option value="Promotion">Promotion</Option> <Option value="Transfer">Transfer</Option> </Select> </Form.Item>
          <Form.Item name="from" label="From" rules={[{ required: true, message: 'Please enter current position/department' }]}> <Input /> </Form.Item>
          <Form.Item name="to" label="To" rules={[{ required: true, message: 'Please enter new position/department' }]}> <Input /> </Form.Item>
          <Form.Item name="effectiveDate" label="Effective Date" rules={[{ required: true, message: 'Please select date' }]}> <DatePicker style={{ width: '100%' }} /> </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}> <Select> <Option value="Pending">Pending</Option> <Option value="Approved">Approved</Option> <Option value="Rejected">Rejected</Option> </Select> </Form.Item>
          <Form.Item name="reason" label="Reason" rules={[{ required: true, message: 'Please enter reason' }]}> <Input /> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PromotionDashboard;

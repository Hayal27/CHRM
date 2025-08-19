import React, { useState } from 'react';
import { Typography, Card, Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Rate } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

interface PerformanceReview {
  id: number;
  employee: string;
  period: string;
  reviewer: string;
  rating: number;
  comments: string;
  status: 'Completed' | 'Pending';
}

const initialReviews: PerformanceReview[] = [
  { id: 1, employee: 'John Doe', period: '2024 Q2', reviewer: 'Jane Smith', rating: 4, comments: 'Great work!', status: 'Completed' },
  { id: 2, employee: 'Jane Smith', period: '2024 Q2', reviewer: 'John Doe', rating: 5, comments: 'Excellent leadership.', status: 'Pending' },
];

const PerformanceDashboard: React.FC = () => {
  const [reviews, setReviews] = useState<PerformanceReview[]>(initialReviews);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReview, setEditingReview] = useState<PerformanceReview | null>(null);
  const [form] = Form.useForm();

  const showAddModal = () => {
    setEditingReview(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (record: PerformanceReview) => {
    setEditingReview(record);
    form.setFieldsValue({ ...record });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    message.success('Review deleted');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const newReview: PerformanceReview = {
        ...values,
        id: editingReview ? editingReview.id : Date.now(),
      };
      if (editingReview) {
        setReviews(prev => prev.map(r => r.id === editingReview.id ? newReview : r));
        message.success('Review updated');
      } else {
        setReviews(prev => [...prev, newReview]);
        message.success('Review added');
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
    { title: 'Period', dataIndex: 'period', key: 'period' },
    { title: 'Reviewer', dataIndex: 'reviewer', key: 'reviewer' },
    { title: 'Rating', dataIndex: 'rating', key: 'rating', render: (rating: number) => <Rate disabled value={rating} /> },
    { title: 'Comments', dataIndex: 'comments', key: 'comments' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => <span style={{ color: status === 'Completed' ? 'green' : 'orange' }}>{status}</span> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PerformanceReview) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => showEditModal(record)} />
          <Popconfirm title="Delete this review?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Performance Management</Title>
      <Card style={{ marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Review
        </Button>
      </Card>
      <Card>
        <Table
          columns={columns}
          dataSource={reviews}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </Card>
      <Modal
        title={editingReview ? 'Edit Review' : 'Add Review'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingReview ? 'Update' : 'Add'}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'Pending', rating: 3 }}
        >
          <Form.Item name="employee" label="Employee" rules={[{ required: true, message: 'Please enter employee name' }]}> <Input /> </Form.Item>
          <Form.Item name="period" label="Period" rules={[{ required: true, message: 'Please enter period' }]}> <Input placeholder="e.g. 2024 Q2" /> </Form.Item>
          <Form.Item name="reviewer" label="Reviewer" rules={[{ required: true, message: 'Please enter reviewer name' }]}> <Input /> </Form.Item>
          <Form.Item name="rating" label="Rating" rules={[{ required: true, message: 'Please rate' }]}> <Rate /> </Form.Item>
          <Form.Item name="comments" label="Comments"> <Input.TextArea rows={2} /> </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}> <Select> <Option value="Pending">Pending</Option> <Option value="Completed">Completed</Option> </Select> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PerformanceDashboard;

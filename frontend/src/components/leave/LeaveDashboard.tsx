import React, { useState } from 'react';
import { Typography, Card, Table, Button, Modal, Form, Input, DatePicker, Select, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

interface LeaveRequest {
  id: number;
  employee: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
}

const initialLeaves: LeaveRequest[] = [
  { id: 1, employee: 'John Doe', leaveType: 'Annual', startDate: '2024-07-10', endDate: '2024-07-15', status: 'Pending', reason: 'Vacation' },
  { id: 2, employee: 'Jane Smith', leaveType: 'Sick', startDate: '2024-07-05', endDate: '2024-07-07', status: 'Approved', reason: 'Flu' },
];

const LeaveDashboard: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>(initialLeaves);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveRequest | null>(null);
  const [form] = Form.useForm();

  const showAddModal = () => {
    setEditingLeave(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (record: LeaveRequest) => {
    setEditingLeave(record);
    form.setFieldsValue({ ...record, startDate: dayjs(record.startDate), endDate: dayjs(record.endDate) });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setLeaves(prev => prev.filter(l => l.id !== id));
    message.success('Leave request deleted');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const newLeave: LeaveRequest = {
        ...values,
        id: editingLeave ? editingLeave.id : Date.now(),
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
      };
      if (editingLeave) {
        setLeaves(prev => prev.map(l => l.id === editingLeave.id ? newLeave : l));
        message.success('Leave updated');
      } else {
        setLeaves(prev => [...prev, newLeave]);
        message.success('Leave applied');
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
    { title: 'Leave Type', dataIndex: 'leaveType', key: 'leaveType' },
    { title: 'Start Date', dataIndex: 'startDate', key: 'startDate', render: (date: string) => dayjs(date).format('YYYY-MM-DD') },
    { title: 'End Date', dataIndex: 'endDate', key: 'endDate', render: (date: string) => dayjs(date).format('YYYY-MM-DD') },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => <span style={{ color: status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'orange' }}>{status}</span> },
    { title: 'Reason', dataIndex: 'reason', key: 'reason' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: LeaveRequest) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => showEditModal(record)} />
          <Popconfirm title="Delete this leave request?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Leave Management</Title>
      <Card style={{ marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Apply Leave
        </Button>
      </Card>
      <Card>
        <Table
          columns={columns}
          dataSource={leaves}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </Card>
      <Modal
        title={editingLeave ? 'Edit Leave' : 'Apply Leave'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingLeave ? 'Update' : 'Apply'}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'Pending' }}
        >
          <Form.Item name="employee" label="Employee" rules={[{ required: true, message: 'Please enter employee name' }]}> <Input /> </Form.Item>
          <Form.Item name="leaveType" label="Leave Type" rules={[{ required: true, message: 'Please enter leave type' }]}> <Input /> </Form.Item>
          <Form.Item name="startDate" label="Start Date" rules={[{ required: true, message: 'Please select start date' }]}> <DatePicker style={{ width: '100%' }} /> </Form.Item>
          <Form.Item name="endDate" label="End Date" rules={[{ required: true, message: 'Please select end date' }]}> <DatePicker style={{ width: '100%' }} /> </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}> <Select> <Option value="Pending">Pending</Option> <Option value="Approved">Approved</Option> <Option value="Rejected">Rejected</Option> </Select> </Form.Item>
          <Form.Item name="reason" label="Reason" rules={[{ required: true, message: 'Please enter reason' }]}> <Input /> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LeaveDashboard;

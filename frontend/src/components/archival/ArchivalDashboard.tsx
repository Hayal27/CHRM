import React, { useState } from 'react';
import { Typography, Card, Table, Button, Modal, Form, Input, DatePicker, Select, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

interface ExEmployeeRecord {
  id: number;
  name: string;
  department: string;
  exitDate: string;
  reason: string;
  rehireEligible: 'Yes' | 'No';
}

const initialExEmployees: ExEmployeeRecord[] = [
  { id: 1, name: 'John Doe', department: 'Engineering', exitDate: '2023-12-31', reason: 'Resigned', rehireEligible: 'Yes' },
  { id: 2, name: 'Jane Smith', department: 'HR', exitDate: '2024-01-15', reason: 'Terminated', rehireEligible: 'No' },
];

const ArchivalDashboard: React.FC = () => {
  const [exEmployees, setExEmployees] = useState<ExEmployeeRecord[]>(initialExEmployees);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExEmployee, setEditingExEmployee] = useState<ExEmployeeRecord | null>(null);
  const [form] = Form.useForm();

  const showAddModal = () => {
    setEditingExEmployee(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (record: ExEmployeeRecord) => {
    setEditingExEmployee(record);
    form.setFieldsValue({ ...record, exitDate: dayjs(record.exitDate) });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setExEmployees(prev => prev.filter(e => e.id !== id));
    message.success('Record deleted');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const newExEmployee: ExEmployeeRecord = {
        ...values,
        id: editingExEmployee ? editingExEmployee.id : Date.now(),
        exitDate: values.exitDate.format('YYYY-MM-DD'),
      };
      if (editingExEmployee) {
        setExEmployees(prev => prev.map(e => e.id === editingExEmployee.id ? newExEmployee : e));
        message.success('Record updated');
      } else {
        setExEmployees(prev => [...prev, newExEmployee]);
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
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    { title: 'Exit Date', dataIndex: 'exitDate', key: 'exitDate', render: (date: string) => dayjs(date).format('YYYY-MM-DD') },
    { title: 'Reason', dataIndex: 'reason', key: 'reason' },
    { title: 'Rehire Eligible', dataIndex: 'rehireEligible', key: 'rehireEligible', render: (val: string) => <span style={{ color: val === 'Yes' ? 'green' : 'red' }}>{val}</span> },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ExEmployeeRecord) => (
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
      <Title level={2}>Archival / Ex-Employee</Title>
      <Card style={{ marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Ex-Employee
        </Button>
      </Card>
      <Card>
        <Table
          columns={columns}
          dataSource={exEmployees}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </Card>
      <Modal
        title={editingExEmployee ? 'Edit Record' : 'Add Ex-Employee'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingExEmployee ? 'Update' : 'Add'}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ rehireEligible: 'Yes' }}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter name' }]}> <Input /> </Form.Item>
          <Form.Item name="department" label="Department" rules={[{ required: true, message: 'Please enter department' }]}> <Input /> </Form.Item>
          <Form.Item name="exitDate" label="Exit Date" rules={[{ required: true, message: 'Please select date' }]}> <DatePicker style={{ width: '100%' }} /> </Form.Item>
          <Form.Item name="reason" label="Reason" rules={[{ required: true, message: 'Please enter reason' }]}> <Input.TextArea rows={2} /> </Form.Item>
          <Form.Item name="rehireEligible" label="Rehire Eligible" rules={[{ required: true }]}> <Select> <Option value="Yes">Yes</Option> <Option value="No">No</Option> </Select> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ArchivalDashboard;

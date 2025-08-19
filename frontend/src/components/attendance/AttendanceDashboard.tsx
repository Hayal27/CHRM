import React, { useState } from 'react';
import { Typography, Card, Table, Button, Modal, Form, Input, DatePicker, Select, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

interface AttendanceRecord {
  id: number;
  employee: string;
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
  clockIn: string;
  clockOut: string;
}

const initialAttendance: AttendanceRecord[] = [
  { id: 1, employee: 'John Doe', date: '2024-07-01', status: 'Present', clockIn: '09:00', clockOut: '18:00' },
  { id: 2, employee: 'Jane Smith', date: '2024-07-01', status: 'Leave', clockIn: '', clockOut: '' },
];

const AttendanceDashboard: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [form] = Form.useForm();

  const showAddModal = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (record: AttendanceRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({ ...record, date: dayjs(record.date) });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setAttendance(prev => prev.filter(r => r.id !== id));
    message.success('Attendance record deleted');
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const newRecord: AttendanceRecord = {
        ...values,
        id: editingRecord ? editingRecord.id : Date.now(),
        date: values.date.format('YYYY-MM-DD'),
      };
      if (editingRecord) {
        setAttendance(prev => prev.map(r => r.id === editingRecord.id ? newRecord : r));
        message.success('Attendance updated');
      } else {
        setAttendance(prev => [...prev, newRecord]);
        message.success('Attendance added');
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
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => <span style={{ color: status === 'Present' ? 'green' : status === 'Leave' ? 'orange' : 'red' }}>{status}</span> },
    { title: 'Clock In', dataIndex: 'clockIn', key: 'clockIn' },
    { title: 'Clock Out', dataIndex: 'clockOut', key: 'clockOut' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AttendanceRecord) => (
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
      <Title level={2}>Attendance</Title>
      <Card style={{ marginBottom: 24 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Add Record
        </Button>
      </Card>
      <Card>
        <Table
          columns={columns}
          dataSource={attendance}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </Card>
      <Modal
        title={editingRecord ? 'Edit Attendance' : 'Add Attendance'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingRecord ? 'Update' : 'Add'}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'Present' }}
        >
          <Form.Item name="employee" label="Employee" rules={[{ required: true, message: 'Please enter employee name' }]}> <Input /> </Form.Item>
          <Form.Item name="date" label="Date" rules={[{ required: true, message: 'Please select date' }]}> <DatePicker style={{ width: '100%' }} /> </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}> <Select> <Option value="Present">Present</Option> <Option value="Absent">Absent</Option> <Option value="Leave">Leave</Option> </Select> </Form.Item>
          <Form.Item name="clockIn" label="Clock In"> <Input /> </Form.Item>
          <Form.Item name="clockOut" label="Clock Out"> <Input /> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AttendanceDashboard;

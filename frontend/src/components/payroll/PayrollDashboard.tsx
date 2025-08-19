import React, { useState, useMemo } from 'react';
import { Typography, Card, Table, Button, Modal, Form, Input, DatePicker, Select, Space, Popconfirm, message, Spin, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DownloadOutlined, BarChartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { Bar } from '@ant-design/charts';
// import { payrollService } from '../../services/payrollService'; // Uncomment when backend is ready

const { Title } = Typography;
const { Option } = Select;

interface PayrollRecord {
  id: number;
  employee: string;
  month: string;
  amount: number;
  status: 'Paid' | 'Unpaid';
  paymentDate?: string;
}

// Mock data for demo; replace with backend data
const initialPayroll: PayrollRecord[] = [
  { id: 1, employee: 'John Doe', month: '2024-06', amount: 3000, status: 'Paid', paymentDate: '2024-06-30' },
  { id: 2, employee: 'Jane Smith', month: '2024-06', amount: 3200, status: 'Unpaid' },
  { id: 3, employee: 'Mike Johnson', month: '2024-05', amount: 2800, status: 'Paid', paymentDate: '2024-05-31' },
];

const PayrollDashboard: React.FC = () => {
  const [payroll, setPayroll] = useState<PayrollRecord[]>(initialPayroll);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PayrollRecord | null>(null);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({ employee: '', month: '', status: '' });
  const [search, setSearch] = useState('');

  // Uncomment and use when backend is ready
  // const fetchPayroll = async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const params: any = {};
  //     if (filters.employee) params.employee = filters.employee;
  //     if (filters.month) params.month = filters.month;
  //     if (filters.status) params.status = filters.status;
  //     if (search) params.search = search;
  //     const res = await payrollService.getPayroll(params);
  //     const data = res.data.payroll ?? res.data;
  //     setPayroll(Array.isArray(data) ? data : []);
  //   } catch (err: any) {
  //     setError(err?.response?.data?.error || 'Failed to load payroll records');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchPayroll();
  //   // eslint-disable-next-line
  // }, [filters, search]);

  // KPIs
  const totalPayroll = payroll.reduce((sum, p) => sum + p.amount, 0);
  const paidPayroll = payroll.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
  const unpaidPayroll = payroll.filter(p => p.status === 'Unpaid').reduce((sum, p) => sum + p.amount, 0);

  // Chart data
  const payrollByMonth = useMemo(() => {
    const monthMap: Record<string, number> = {};
    payroll.forEach(p => {
      monthMap[p.month] = (monthMap[p.month] || 0) + p.amount;
    });
    return Object.entries(monthMap).map(([month, amount]) => ({ month, amount }));
  }, [payroll]);

  // Add/Edit logic
  const showAddModal = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (record: PayrollRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      paymentDate: record.paymentDate ? dayjs(record.paymentDate) : undefined,
    });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setPayroll(prev => prev.filter(p => p.id !== id));
    message.success('Payroll record deleted');
    // Uncomment for backend: await payrollService.deletePayroll(id); fetchPayroll();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const newRecord: PayrollRecord = {
        ...values,
        id: editingRecord ? editingRecord.id : Date.now(),
        paymentDate: values.paymentDate ? values.paymentDate.format('YYYY-MM-DD') : undefined,
      };
      if (editingRecord) {
        setPayroll(prev => prev.map(p => p.id === editingRecord.id ? newRecord : p));
        message.success('Payroll updated');
        // Uncomment for backend: await payrollService.updatePayroll(editingRecord.id, newRecord); fetchPayroll();
      } else {
        setPayroll(prev => [...prev, newRecord]);
        message.success('Payroll added');
        // Uncomment for backend: await payrollService.createPayroll(newRecord); fetchPayroll();
      }
      setModalVisible(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err?.response?.data?.error || 'Failed to save payroll record');
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  // Export to CSV
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(payroll);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payroll');
    XLSX.writeFile(wb, 'payroll.xlsx');
  };

  // Table columns
  const columns = [
    { title: 'Employee', dataIndex: 'employee', key: 'employee' },
    { title: 'Month', dataIndex: 'month', key: 'month' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (amt: number) => `$${amt.toLocaleString()}` },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => <span style={{ color: status === 'Paid' ? 'green' : 'orange' }}>{status}</span> },
    { title: 'Payment Date', dataIndex: 'paymentDate', key: 'paymentDate', render: (date: string) => date ? dayjs(date).format('YYYY-MM-DD') : '-' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PayrollRecord) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => showEditModal(record)} />
          <Popconfirm title="Delete this record?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Unique employees and months for filter dropdowns
  const employeeOptions = Array.from(new Set(payroll.map(p => p.employee)));
  const monthOptions = Array.from(new Set(payroll.map(p => p.month)));

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Payroll Management</Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}><Statistic title="Total Payroll" value={`$${totalPayroll.toLocaleString()}`} /></Col>
        <Col xs={24} sm={8}><Statistic title="Paid" value={`$${paidPayroll.toLocaleString()}`} valueStyle={{ color: 'green' }} /></Col>
        <Col xs={24} sm={8}><Statistic title="Unpaid" value={`$${unpaidPayroll.toLocaleString()}`} valueStyle={{ color: 'orange' }} /></Col>
      </Row>
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={4} style={{ marginBottom: 8 }}>
            <Input placeholder="Search by employee" allowClear value={search} onChange={e => setSearch(e.target.value)} />
          </Col>
          <Col xs={24} sm={12} md={4} style={{ marginBottom: 8 }}>
            <Select placeholder="Employee" allowClear style={{ width: '100%' }} value={filters.employee || undefined} onChange={val => setFilters(f => ({ ...f, employee: val || '' }))}>
              {employeeOptions.map(emp => <Option key={emp} value={emp}>{emp}</Option>)}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4} style={{ marginBottom: 8 }}>
            <Select placeholder="Month" allowClear style={{ width: '100%' }} value={filters.month || undefined} onChange={val => setFilters(f => ({ ...f, month: val || '' }))}>
              {monthOptions.map(month => <Option key={month} value={month}>{month}</Option>)}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4} style={{ marginBottom: 8 }}>
            <Select placeholder="Status" allowClear style={{ width: '100%' }} value={filters.status || undefined} onChange={val => setFilters(f => ({ ...f, status: val || '' }))}>
              <Option value="Paid">Paid</Option>
              <Option value="Unpaid">Unpaid</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4} style={{ marginBottom: 8 }}>
            <Button icon={<DownloadOutlined />} onClick={handleExport} block>Export</Button>
          </Col>
          <Col xs={24} sm={12} md={4} style={{ marginBottom: 8 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal} block>Add Payroll</Button>
          </Col>
        </Row>
      </Card>
      <Card style={{ marginBottom: 24 }}>
        <BarChartOutlined /> Payroll by Month
        <Bar
          data={payrollByMonth}
          xField="amount"
          yField="month"
          seriesField="month"
          legend={false}
          height={250}
          color={({ month }: { month: string }) => month === dayjs().format('YYYY-MM') ? '#1890ff' : '#52c41a'}
        />
      </Card>
      <Card>
        {loading ? <Spin style={{ width: '100%', margin: '40px 0' }} /> : error ? <div style={{ color: 'red' }}>{error}</div> : (
          <Table
            columns={columns}
            dataSource={payroll.filter(p =>
              (!filters.employee || p.employee === filters.employee) &&
              (!filters.month || p.month === filters.month) &&
              (!filters.status || p.status === filters.status) &&
              (!search || p.employee.toLowerCase().includes(search.toLowerCase()))
            )}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            locale={{ emptyText: 'No payroll records found.' }}
          />
        )}
      </Card>
      <Modal
        title={editingRecord ? 'Edit Payroll' : 'Add Payroll'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingRecord ? 'Update' : 'Add'}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'Unpaid' }}
        >
          <Form.Item name="employee" label="Employee" rules={[{ required: true, message: 'Please enter employee name' }]}> <Input /> </Form.Item>
          <Form.Item name="month" label="Month" rules={[{ required: true, message: 'Please enter month (YYYY-MM)' }]}> <Input placeholder="YYYY-MM" /> </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Please enter amount' }]}> <Input type="number" min={0} /> </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}> <Select> <Option value="Paid">Paid</Option> <Option value="Unpaid">Unpaid</Option> </Select> </Form.Item>
          <Form.Item name="paymentDate" label="Payment Date"> <DatePicker style={{ width: '100%' }} /> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PayrollDashboard;

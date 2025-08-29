import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  message,
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  Select,
  Modal,
  Form,
  Input,
  InputNumber,
  Alert,
  Spin,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  BankOutlined,
  ShopOutlined,
  TeamOutlined,
  TrophyOutlined,
  CalendarOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExportOutlined
} from '@ant-design/icons';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const { Title, Text } = Typography;
const { Option } = Select;

interface College {
  college_id: number;
  college_name: string;
  college_code: string;
  location?: string;
  college_type?: string;
  status?: string;
}

interface Enterprise {
  id: number;
  enterprise_name: string;
  year_of_establishment: number;
  zone: string;
  woreda_city: string;
  sub_city: string;
  kebele: string;
  sector: string;
  sub_sector?: string;
  trade_licence_id: string;
  maturity_level: 'Startup' | 'Growth' | 'Mature' | 'Decline';
  live_operators_male: number;
  live_operators_female: number;
  live_operators_total: number;
  assessed_competent_operators_male: number;
  assessed_competent_operators_female: number;
  assessed_competent_operators_total: number;
  phone_no?: string;
  college_id?: number;
  college_name?: string;
  college_code?: string;
  created_at?: string;
}

interface EnterpriseDataModuleProps {
  colleges: College[];
}

const EnterpriseDataModule: React.FC<EnterpriseDataModuleProps> = ({ colleges }) => {
  const [loading, setLoading] = useState(false);
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [filteredEnterprises, setFilteredEnterprises] = useState<Enterprise[]>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    startup: 0,
    growth: 0,
    mature: 0,
    thisYear: 0
  });
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    sector: '',
    maturity_level: '',
    zone: ''
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEnterprise, setEditingEnterprise] = useState<Enterprise | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchEnterprises();
  }, []);

  useEffect(() => {
    if (selectedCollegeId) {
      fetchEnterprisesByCollege(selectedCollegeId);
    } else {
      fetchEnterprises();
    }
  }, [selectedCollegeId]);

  useEffect(() => {
    applyFilters();
  }, [enterprises, filters]);

  const fetchEnterprises = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(`${API_BASE_URL}/api/education-office/enterprises`, config);
      if (response.data.success) {
        setEnterprises(response.data.enterprises);
        calculateStatistics(response.data.enterprises);
      }
    } catch (error) {
      console.error('Error fetching enterprises:', error);
      message.error('Failed to load enterprises');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnterprisesByCollege = async (collegeId: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(`${API_BASE_URL}/api/education-office/enterprises?college_id=${collegeId}`, config);
      if (response.data.success) {
        setEnterprises(response.data.enterprises);
        calculateStatistics(response.data.enterprises);
      }
    } catch (error) {
      console.error('Error fetching enterprises by college:', error);
      message.error('Failed to load enterprises for selected college');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (data: Enterprise[]) => {
    const currentYear = new Date().getFullYear();
    const stats = {
      total: data.length,
      startup: data.filter(e => e.maturity_level === 'Startup').length,
      growth: data.filter(e => e.maturity_level === 'Growth').length,
      mature: data.filter(e => e.maturity_level === 'Mature').length,
      thisYear: data.filter(e => e.year_of_establishment === currentYear).length
    };
    setStatistics(stats);
  };

  const applyFilters = () => {
    let filtered = [...enterprises];

    if (filters.sector) {
      filtered = filtered.filter(e => 
        e.sector.toLowerCase().includes(filters.sector.toLowerCase()) ||
        (e.sub_sector && e.sub_sector.toLowerCase().includes(filters.sector.toLowerCase()))
      );
    }

    if (filters.maturity_level) {
      filtered = filtered.filter(e => e.maturity_level === filters.maturity_level);
    }

    if (filters.zone) {
      filtered = filtered.filter(e => 
        e.zone.toLowerCase().includes(filters.zone.toLowerCase())
      );
    }

    setFilteredEnterprises(filtered);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      sector: '',
      maturity_level: '',
      zone: ''
    });
    setSelectedCollegeId(null);
  };

  const handleCreate = () => {
    setEditingEnterprise(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (enterprise: Enterprise) => {
    setEditingEnterprise(enterprise);
    form.setFieldsValue(enterprise);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`${API_BASE_URL}/api/education-office/enterprises/${id}`, config);
      message.success('Enterprise deleted successfully');
      fetchEnterprises();
    } catch (error) {
      console.error('Error deleting enterprise:', error);
      message.error('Failed to delete enterprise');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Calculate totals
      const live_operators_total = (values.live_operators_male || 0) + (values.live_operators_female || 0);
      const assessed_competent_operators_total = (values.assessed_competent_operators_male || 0) + (values.assessed_competent_operators_female || 0);

      const enterpriseData = {
        ...values,
        live_operators_total,
        assessed_competent_operators_total
      };

      if (editingEnterprise) {
        await axios.put(`${API_BASE_URL}/api/education-office/enterprises/${editingEnterprise.id}`, enterpriseData, config);
        message.success('Enterprise updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/api/education-office/enterprises`, enterpriseData, config);
        message.success('Enterprise created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      fetchEnterprises();
    } catch (error: any) {
      console.error('Error saving enterprise:', error);
      message.error(error.response?.data?.message || 'Failed to save enterprise');
    }
  };

  const handleDownloadReport = async () => {
    try {
      const dataToExport = filteredEnterprises.length > 0 ? filteredEnterprises : enterprises;
      
      const headers = [
        'SN', 'Enterprise Name', 'Year of Establishment', 'Zone', 'Woreda/City', 'Sub City', 'Kebele',
        'Sector', 'Sub Sector', 'Trade License ID', 'Maturity Level', 'Live Operators (Male)',
        'Live Operators (Female)', 'Live Operators (Total)', 'Assessed Competent Operators (Male)',
        'Assessed Competent Operators (Female)', 'Assessed Competent Operators (Total)', 'Phone No',
        'College Name'
      ];
      
      const csvContent = [
        headers.join(','),
        ...dataToExport.map((enterprise, index) => [
          index + 1,
          `"${enterprise.enterprise_name}"`,
          enterprise.year_of_establishment,
          `"${enterprise.zone}"`,
          `"${enterprise.woreda_city}"`,
          `"${enterprise.sub_city}"`,
          `"${enterprise.kebele}"`,
          `"${enterprise.sector}"`,
          `"${enterprise.sub_sector || ''}"`,
          `"${enterprise.trade_licence_id}"`,
          `"${enterprise.maturity_level}"`,
          enterprise.live_operators_male,
          enterprise.live_operators_female,
          enterprise.live_operators_total,
          enterprise.assessed_competent_operators_male,
          enterprise.assessed_competent_operators_female,
          enterprise.assessed_competent_operators_total,
          `"${enterprise.phone_no || ''}"`,
          `"${enterprise.college_name || 'Not Associated'}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      const selectedCollege = colleges.find(c => c.college_id === selectedCollegeId);
      const fileName = selectedCollege 
        ? `enterprise_data_${selectedCollege.college_name.replace(/\s+/g, '_')}_${Date.now()}.csv`
        : `enterprise_data_all_colleges_${Date.now()}.csv`;
      
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success('Report downloaded successfully!');
    } catch (error: any) {
      console.error('Error downloading report:', error);
      message.error('Failed to download report');
    }
  };

  const columns = [
    {
      title: 'SN',
      key: 'sn',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Enterprise Name',
      dataIndex: 'enterprise_name',
      key: 'enterprise_name',
      width: 200,
      render: (text: string, record: Enterprise) => (
        <div>
          <div><strong>{text}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.sector} • {record.zone}
          </div>
        </div>
      ),
    },
    {
      title: 'Year Est.',
      dataIndex: 'year_of_establishment',
      key: 'year_of_establishment',
      width: 100,
      align: 'center' as const,
    },
    {
      title: 'Maturity Level',
      dataIndex: 'maturity_level',
      key: 'maturity_level',
      width: 120,
      render: (level: string) => {
        const colors = {
          'Startup': 'blue',
          'Growth': 'green',
          'Mature': 'gold',
          'Decline': 'red'
        };
        return (
          <Tag color={colors[level as keyof typeof colors]}>
            {level}
          </Tag>
        );
      },
    },
    {
      title: 'Location',
      key: 'location',
      width: 150,
      render: (record: Enterprise) => (
        <div>
          <div>{record.woreda_city}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.sub_city}
          </div>
        </div>
      ),
    },
    {
      title: 'Operators',
      key: 'operators',
      width: 120,
      render: (record: Enterprise) => (
        <div>
          <div>Live: {record.live_operators_total}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Competent: {record.assessed_competent_operators_total}
          </div>
        </div>
      ),
    },
    {
      title: 'College',
      dataIndex: 'college_name',
      key: 'college_name',
      width: 150,
      render: (text: string) => text || <Text type="secondary">Not Associated</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (record: Enterprise) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this enterprise?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    }
  ];

  const displayData = filteredEnterprises.length > 0 ? filteredEnterprises : enterprises;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={3}>
          <ShopOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Enterprise Data Management
        </Title>
        <Text type="secondary">
          Manage enterprise data with college associations and comprehensive reporting
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Enterprises"
              value={statistics.total}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Startup"
              value={statistics.startup}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Growth/Mature"
              value={statistics.growth + statistics.mature}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="This Year"
              value={statistics.thisYear}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* College Filter */}
      <Card 
        title={
          <Space>
            <BankOutlined />
            Filter by College (from Colleges Database)
          </Space>
        } 
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Select
              placeholder="Select College (All colleges by default)"
              style={{ width: '100%' }}
              value={selectedCollegeId}
              onChange={setSelectedCollegeId}
              allowClear
              showSearch
              filterOption={(input, option) =>
                option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
              }
            >
              {colleges.map(college => (
                <Option key={college.college_id} value={college.college_id}>
                  <Space>
                    <BankOutlined />
                    {college.college_name}
                    {college.college_code && <Text type="secondary">({college.college_code})</Text>}
                  </Space>
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={16}>
            <Text type="secondary">
              {selectedCollegeId 
                ? `Showing enterprises for ${colleges.find(c => c.college_id === selectedCollegeId)?.college_name || 'selected college'}`
                : 'Showing all enterprises from all colleges in the database'
              }
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Additional Filters */}
      <Card 
        title={
          <Space>
            <FilterOutlined />
            Additional Filters
          </Space>
        } 
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Select
              placeholder="Filter by Sector"
              style={{ width: '100%' }}
              value={filters.sector || undefined}
              onChange={(value) => handleFilterChange('sector', value)}
              allowClear
            >
              <Option value="Technology">Technology</Option>
              <Option value="Manufacturing">Manufacturing</Option>
              <Option value="Healthcare">Healthcare</Option>
              <Option value="Agriculture">Agriculture</Option>
              <Option value="Education">Education</Option>
              <Option value="Construction">Construction</Option>
              <Option value="Trade">Trade</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="Filter by Maturity Level"
              style={{ width: '100%' }}
              value={filters.maturity_level || undefined}
              onChange={(value) => handleFilterChange('maturity_level', value)}
              allowClear
            >
              <Option value="Startup">Startup</Option>
              <Option value="Growth">Growth</Option>
              <Option value="Mature">Mature</Option>
              <Option value="Decline">Decline</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="Filter by Zone"
              style={{ width: '100%' }}
              value={filters.zone || undefined}
              onChange={(value) => handleFilterChange('zone', value)}
              allowClear
            >
              <Option value="Addis Ababa">Addis Ababa</Option>
              <Option value="Oromia">Oromia</Option>
              <Option value="Amhara">Amhara</Option>
              <Option value="SNNPR">SNNPR</Option>
              <Option value="Tigray">Tigray</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Button onClick={clearFilters} style={{ width: '100%' }}>
              Clear All Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <Card
        title={`Enterprise Data (${displayData.length} records)`}
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchEnterprises}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadReport}
            >
              Download Report
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Add Enterprise
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={displayData}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} enterprises`
          }}
          size="small"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingEnterprise ? 'Edit Enterprise' : 'Add New Enterprise'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="enterprise_name"
                label="Enterprise Name"
                rules={[{ required: true, message: 'Please enter enterprise name' }]}
              >
                <Input placeholder="Enter enterprise name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="year_of_establishment"
                label="Year of Establishment"
                rules={[{ required: true, message: 'Please enter year of establishment' }]}
              >
                <InputNumber
                  placeholder="Enter year"
                  min={1900}
                  max={new Date().getFullYear()}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="zone"
                label="Zone"
                rules={[{ required: true, message: 'Please enter zone' }]}
              >
                <Input placeholder="Enter zone" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="woreda_city"
                label="Woreda/City"
                rules={[{ required: true, message: 'Please enter woreda/city' }]}
              >
                <Input placeholder="Enter woreda/city" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sub_city"
                label="Sub City"
                rules={[{ required: true, message: 'Please enter sub city' }]}
              >
                <Input placeholder="Enter sub city" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="kebele"
                label="Kebele"
                rules={[{ required: true, message: 'Please enter kebele' }]}
              >
                <Input placeholder="Enter kebele" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sector"
                label="Sector"
                rules={[{ required: true, message: 'Please select sector' }]}
              >
                <Select placeholder="Select sector">
                  <Option value="Technology">Technology</Option>
                  <Option value="Manufacturing">Manufacturing</Option>
                  <Option value="Healthcare">Healthcare</Option>
                  <Option value="Agriculture">Agriculture</Option>
                  <Option value="Education">Education</Option>
                  <Option value="Construction">Construction</Option>
                  <Option value="Trade">Trade</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sub_sector"
                label="Sub Sector"
              >
                <Input placeholder="Enter sub sector" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="trade_licence_id"
                label="Trade License ID"
                rules={[{ required: true, message: 'Please enter trade license ID' }]}
              >
                <Input placeholder="Enter trade license ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maturity_level"
                label="Maturity Level"
                rules={[{ required: true, message: 'Please select maturity level' }]}
              >
                <Select placeholder="Select maturity level">
                  <Option value="Startup">Startup</Option>
                  <Option value="Growth">Growth</Option>
                  <Option value="Mature">Mature</Option>
                  <Option value="Decline">Decline</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="live_operators_male"
                label="Live Operators (Male)"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="live_operators_female"
                label="Live Operators (Female)"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="phone_no"
                label="Phone Number"
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="assessed_competent_operators_male"
                label="Assessed Competent Operators (Male)"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="assessed_competent_operators_female"
                label="Assessed Competent Operators (Female)"
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="college_id"
                label="Associated College"
              >
                <Select
                  placeholder="Select college (optional)"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
                  }
                >
                  {colleges.map(college => (
                    <Option key={college.college_id} value={college.college_id}>
                      {college.college_name} ({college.college_code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingEnterprise ? 'Update' : 'Create'} Enterprise
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EnterpriseDataModule;
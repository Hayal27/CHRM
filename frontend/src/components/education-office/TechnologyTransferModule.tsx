import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  Modal,
  Space,
  message,
  Typography,
  Row,
  Col,
  Statistic,
  Tag,
  Descriptions,
  Drawer,
  Divider,
  Badge
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  DownloadOutlined,
  ExperimentOutlined,
  ToolOutlined,
  TrophyOutlined,
  CalendarOutlined,
  PhoneOutlined,
  BankOutlined,
  TeamOutlined,
  FilterOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface College {
  college_id: number;
  college_name: string;
  college_code: string;
  location?: string;
  college_type?: string;
  status?: string;
}

interface TechnologyTransfer {
  id: number;
  technology_name: string;
  sector: string;
  identified_value_chain: string;
  technology_type: string;
  year_of_transfer: number;
  transferred_enterprise_name: string;
  transferred_enterprise_phone: string;
  enterprise_sector: string;
  wealth: string;
  college_name: string;
  college_id: number;
  technology_developer_name: string;
  technology_developer_phone: string;
  created_at?: string;
  updated_at?: string;
}

interface TechnologyTransferModuleProps {
  colleges?: College[];
}

const TechnologyTransferModule: React.FC<TechnologyTransferModuleProps> = ({ colleges: propColleges }) => {
  const [loading, setLoading] = useState(false);
  const [technologies, setTechnologies] = useState<TechnologyTransfer[]>([]);
  const [colleges, setColleges] = useState<College[]>(propColleges || []);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTechnology, setSelectedTechnology] = useState<TechnologyTransfer | null>(null);
  const [editingTechnology, setEditingTechnology] = useState<TechnologyTransfer | null>(null);
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [statistics, setStatistics] = useState({
    total: 0,
    manufacturing: 0,
    service: 0,
    thisYear: 0
  });

  useEffect(() => {
    if (!propColleges || propColleges.length === 0) {
      fetchColleges();
    }
    fetchTechnologies();
  }, []);

  useEffect(() => {
    if (selectedCollegeId) {
      fetchTechnologiesByCollege(selectedCollegeId);
    } else {
      fetchTechnologies();
    }
  }, [selectedCollegeId]);

  const fetchColleges = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(`${API_BASE_URL}/api/education-office/admin/colleges`, config);
      if (response.data.success) {
        setColleges(response.data.colleges);
      }
    } catch (error) {
      console.error('Error fetching colleges:', error);
      message.error('Failed to load colleges');
    }
  };

  const fetchTechnologies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(`${API_BASE_URL}/api/education-office/technology-transfers`, config);
      if (response.data.success) {
        setTechnologies(response.data.technologies);
        calculateStatistics(response.data.technologies);
      }
    } catch (error) {
      console.error('Error fetching technologies:', error);
      message.error('Failed to load technology transfers');
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnologiesByCollege = async (collegeId: number) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(`${API_BASE_URL}/api/education-office/technology-transfers?college_id=${collegeId}`, config);
      if (response.data.success) {
        setTechnologies(response.data.technologies);
        calculateStatistics(response.data.technologies);
      }
    } catch (error) {
      console.error('Error fetching technologies by college:', error);
      message.error('Failed to load technology transfers for selected college');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (data: TechnologyTransfer[]) => {
    const currentYear = new Date().getFullYear();
    const stats = {
      total: data.length,
      manufacturing: data.filter(t => t.technology_type.toLowerCase().includes('manufacturing')).length,
      service: data.filter(t => t.technology_type.toLowerCase().includes('service')).length,
      thisYear: data.filter(t => t.year_of_transfer === currentYear).length
    };
    setStatistics(stats);
  };

  const handleSubmit = async (values: any) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const payload = {
        ...values,
        year_of_transfer: values.year_of_transfer ? dayjs(values.year_of_transfer).year() : new Date().getFullYear()
      };

      if (editingTechnology) {
        await axios.put(`${API_BASE_URL}/api/education-office/technology-transfers/${editingTechnology.id}`, payload, config);
        message.success('Technology transfer updated successfully');
      } else {
        await axios.post(`${API_BASE_URL}/api/education-office/technology-transfers`, payload, config);
        message.success('Technology transfer registered successfully');
      }

      setModalVisible(false);
      setEditingTechnology(null);
      form.resetFields();
      
      // Refresh the appropriate data based on current filter
      if (selectedCollegeId) {
        fetchTechnologiesByCollege(selectedCollegeId);
      } else {
        fetchTechnologies();
      }
    } catch (error: any) {
      console.error('Error saving technology transfer:', error);
      message.error(error.response?.data?.message || 'Failed to save technology transfer');
    }
  };

  const handleEdit = (technology: TechnologyTransfer) => {
    setEditingTechnology(technology);
    form.setFieldsValue({
      ...technology,
      year_of_transfer: technology.year_of_transfer ? dayjs().year(technology.year_of_transfer) : null
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`${API_BASE_URL}/api/education-office/technology-transfers/${id}`, config);
      message.success('Technology transfer deleted successfully');
      
      // Refresh the appropriate data based on current filter
      if (selectedCollegeId) {
        fetchTechnologiesByCollege(selectedCollegeId);
      } else {
        fetchTechnologies();
      }
    } catch (error: any) {
      console.error('Error deleting technology transfer:', error);
      message.error(error.response?.data?.message || 'Failed to delete technology transfer');
    }
  };

  const handleView = (technology: TechnologyTransfer) => {
    setSelectedTechnology(technology);
    setDrawerVisible(true);
  };

  const handleDownloadReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const url = selectedCollegeId 
        ? `${API_BASE_URL}/api/education-office/technology-transfers/report?college_id=${selectedCollegeId}`
        : `${API_BASE_URL}/api/education-office/technology-transfers/report`;

      const response = await axios.get(url, config);
      if (response.data.success) {
        // Convert data to CSV
        const headers = [
          'SN', 'Name of Technology', 'Sector', 'Identified Value Chain', 'Type of Technology',
          'Year of Transfer', 'Transferred Enterprise Name', 'Enterprise Phone', 'The Sector of Enterprise', 
          'Wealth', 'Name of College', 'Technology Developer Name', 'Developer Phone'
        ];
        
        const csvContent = [
          headers.join(','),
          ...response.data.technologies.map((tech: TechnologyTransfer, index: number) => [
            index + 1,
            `"${tech.technology_name}"`,
            `"${tech.sector}"`,
            `"${tech.identified_value_chain}"`,
            `"${tech.technology_type}"`,
            tech.year_of_transfer,
            `"${tech.transferred_enterprise_name}"`,
            `"${tech.transferred_enterprise_phone}"`,
            `"${tech.enterprise_sector}"`,
            `"${tech.wealth}"`,
            `"${tech.college_name}"`,
            `"${tech.technology_developer_name}"`,
            `"${tech.technology_developer_phone}"`
          ].join(','))
        ].join('\n');

        // Download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        
        const fileName = selectedCollegeId 
          ? `technology_transfers_${colleges.find(c => c.college_id === selectedCollegeId)?.college_name?.replace(/\s+/g, '_')}_${Date.now()}.csv`
          : `technology_transfers_all_colleges_${Date.now()}.csv`;
        
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        message.success('Report downloaded successfully!');
      }
    } catch (error: any) {
      console.error('Error downloading report:', error);
      message.error(error.response?.data?.message || 'Failed to download report');
    }
  };

  const renderTechnologyDetails = () => {
    if (!selectedTechnology) return null;

    return (
      <div>
        <Descriptions title="Technology Information" bordered column={2} size="small">
          <Descriptions.Item label="Technology Name" span={2}>
            <strong>{selectedTechnology.technology_name}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Sector">
            {selectedTechnology.sector}
          </Descriptions.Item>
          <Descriptions.Item label="Technology Type">
            <Tag color={selectedTechnology.technology_type.toLowerCase().includes('manufacturing') ? 'blue' : 'green'}>
              {selectedTechnology.technology_type}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Value Chain" span={2}>
            {selectedTechnology.identified_value_chain}
          </Descriptions.Item>
          <Descriptions.Item label="Year of Transfer">
            <Badge count={selectedTechnology.year_of_transfer} style={{ backgroundColor: '#52c41a' }} />
          </Descriptions.Item>
          <Descriptions.Item label="Wealth">
            {selectedTechnology.wealth}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Descriptions title="Enterprise Information" bordered column={2} size="small">
          <Descriptions.Item label="Transferred Enterprise">
            <strong>{selectedTechnology.transferred_enterprise_name}</strong>
          </Descriptions.Item>
          <Descriptions.Item label={<><PhoneOutlined /> Enterprise Phone</>}>
            {selectedTechnology.transferred_enterprise_phone}
          </Descriptions.Item>
          <Descriptions.Item label="Enterprise Sector">
            {selectedTechnology.enterprise_sector}
          </Descriptions.Item>
          <Descriptions.Item label={<><BankOutlined /> College</>}>
            <Tag color="blue">{selectedTechnology.college_name}</Tag>
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Descriptions title="Developer Information" bordered column={2} size="small">
          <Descriptions.Item label={<><TeamOutlined /> Technology Developer</>}>
            <strong>{selectedTechnology.technology_developer_name}</strong>
          </Descriptions.Item>
          <Descriptions.Item label={<><PhoneOutlined /> Developer Phone</>}>
            {selectedTechnology.technology_developer_phone}
          </Descriptions.Item>
        </Descriptions>
      </div>
    );
  };

  const columns = [
    {
      title: 'SN',
      key: 'sn',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Technology Name',
      dataIndex: 'technology_name',
      key: 'technology_name',
      width: 200,
      render: (text: string, record: TechnologyTransfer) => (
        <div>
          <div><strong>{text}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.sector}
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'technology_type',
      key: 'technology_type',
      width: 120,
      render: (type: string) => (
        <Tag color={type.toLowerCase().includes('manufacturing') ? 'blue' : 'green'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Year',
      dataIndex: 'year_of_transfer',
      key: 'year_of_transfer',
      width: 80,
      align: 'center' as const,
      render: (year: number) => (
        <Badge count={year} style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Enterprise',
      key: 'enterprise',
      width: 180,
      render: (record: TechnologyTransfer) => (
        <div>
          <div><strong>{record.transferred_enterprise_name}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <PhoneOutlined /> {record.transferred_enterprise_phone}
          </div>
        </div>
      ),
    },
    {
      title: 'College',
      dataIndex: 'college_name',
      key: 'college_name',
      width: 150,
      render: (collegeName: string) => (
        <Tag color="blue">{collegeName}</Tag>
      ),
    },
    {
      title: 'Developer',
      key: 'developer',
      width: 180,
      render: (record: TechnologyTransfer) => (
        <div>
          <div><strong>{record.technology_developer_name}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <PhoneOutlined /> {record.technology_developer_phone}
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (record: TechnologyTransfer) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            title="View Details"
          />
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit"
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            title="Delete"
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={3}>Technology Transfer Management</Title>
        <Text type="secondary">
          Register and manage transferred manufacturing/service technologies from colleges database
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Transfers"
              value={statistics.total}
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Manufacturing"
              value={statistics.manufacturing}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Service"
              value={statistics.service}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
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
            <FilterOutlined />
            Filter by College
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
                ? `Showing technology transfers for ${colleges.find(c => c.college_id === selectedCollegeId)?.college_name || 'selected college'}`
                : 'Showing all technology transfers from all colleges in the database'
              }
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Main Content */}
      <Card
        title={
          <Space>
            <ExperimentOutlined />
            {`Technology Transfers ${selectedCollegeId ? `- ${colleges.find(c => c.college_id === selectedCollegeId)?.college_name || ''}` : '(All Colleges)'}`}
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingTechnology(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Register Technology
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadReport}
              type="default"
            >
              Download Report
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={technologies}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transfers`
          }}
          size="small"
        />
      </Card>

      {/* Registration/Edit Modal */}
      <Modal
        title={
          <Space>
            {editingTechnology ? <EditOutlined /> : <PlusOutlined />}
            {editingTechnology ? 'Edit Technology Transfer' : 'Register Technology Transfer'}
          </Space>
        }
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTechnology(null);
          form.resetFields();
        }}
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
                name="technology_name"
                label="Name of Technology"
                rules={[{ required: true, message: 'Please enter technology name' }]}
              >
                <Input placeholder="Enter technology name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sector"
                label="Sector"
                rules={[{ required: true, message: 'Please enter sector' }]}
              >
                <Input placeholder="Enter sector" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="identified_value_chain"
            label="Identified Value Chain"
            rules={[{ required: true, message: 'Please enter value chain' }]}
          >
            <TextArea rows={2} placeholder="Describe the identified value chain" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="technology_type"
                label="Type of Technology"
                rules={[{ required: true, message: 'Please select technology type' }]}
              >
                <Select placeholder="Select technology type">
                  <Option value="Manufacturing">Manufacturing</Option>
                  <Option value="Product/Service">Product/Service</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="year_of_transfer"
                label="Year of Transfer"
                rules={[{ required: true, message: 'Please select year' }]}
              >
                <DatePicker picker="year" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="transferred_enterprise_name"
                label="Transferred Enterprise Name"
                rules={[{ required: true, message: 'Please enter enterprise name' }]}
              >
                <Input placeholder="Enter enterprise name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="transferred_enterprise_phone"
                label="Enterprise Phone No"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="enterprise_sector"
                label="The Sector of Enterprise"
                rules={[{ required: true, message: 'Please enter enterprise sector' }]}
              >
                <Input placeholder="Enter enterprise sector" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="wealth"
                label="Wealth"
                rules={[{ required: true, message: 'Please enter wealth information' }]}
              >
                <Input placeholder="Enter wealth information" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="college_id"
            label={
              <Space>
                <BankOutlined />
                Name of College (from Colleges Database)
              </Space>
            }
            rules={[{ required: true, message: 'Please select college from the database' }]}
          >
            <Select 
              placeholder="Select college from database"
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
                    {college.location && <Text type="secondary">- {college.location}</Text>}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="technology_developer_name"
                label="The Name of Technology Developer"
                rules={[{ required: true, message: 'Please enter developer name' }]}
              >
                <Input placeholder="Enter developer name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="technology_developer_phone"
                label="Developer Phone No"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingTechnology ? 'Update' : 'Register'} Technology Transfer
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingTechnology(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Details Drawer */}
      <Drawer
        title={
          <Space>
            <ExperimentOutlined />
            Technology Transfer Details
          </Space>
        }
        width={800}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        {renderTechnologyDetails()}
      </Drawer>
    </div>
  );
};

export default TechnologyTransferModule;
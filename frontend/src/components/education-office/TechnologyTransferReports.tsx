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


    DatePicker,
  Alert
} from 'antd';
import {
  DownloadOutlined,
  ExperimentOutlined,
  ToolOutlined,
  TrophyOutlined,
  CalendarOutlined,
  EyeOutlined,
  LinkOutlined,
  BankOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

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
  technology_type: string;
  year_of_transfer: number;
  transferred_enterprise_name: string;
  transferred_enterprise_phone: string;
  enterprise_sector: string;
  college_name: string;
  college_id: number;
  technology_developer_name: string;
  created_at?: string;
}

interface TechnologyTransferReportsProps {
  colleges: College[];
}

const TechnologyTransferReports: React.FC<TechnologyTransferReportsProps> = ({ colleges }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [technologies, setTechnologies] = useState<TechnologyTransfer[]>([]);
  const [filteredTechnologies, setFilteredTechnologies] = useState<TechnologyTransfer[]>([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    manufacturing: 0,
    service: 0,
    thisYear: 0
  });
  const [filters, setFilters] = useState({
    college_id: null as number | null,
    sector: '',
    type: '',
    year: null as any,
    dateRange: null as any
  });
  const [selectedCollegeId, setSelectedCollegeId] = useState<number | null>(null);

  useEffect(() => {
    fetchTechnologies();
  }, []);

  useEffect(() => {
    if (selectedCollegeId) {
      fetchTechnologiesByCollege(selectedCollegeId);
    } else {
      fetchTechnologies();
    }
  }, [selectedCollegeId]);

  useEffect(() => {
    applyFilters();
  }, [technologies, filters]);

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

  const applyFilters = () => {
    let filtered = [...technologies];

    if (filters.sector) {
      filtered = filtered.filter(t => 
        t.sector.toLowerCase().includes(filters.sector.toLowerCase()) ||
        t.enterprise_sector.toLowerCase().includes(filters.sector.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter(t => 
        t.technology_type.toLowerCase().includes(filters.type.toLowerCase())
      );
    }

    if (filters.year) {
      filtered = filtered.filter(t => t.year_of_transfer === dayjs(filters.year).year());
    }

    if (filters.dateRange && filters.dateRange.length === 2) {
      const [start, end] = filters.dateRange;
      filtered = filtered.filter(t => {
        const transferYear = t.year_of_transfer;
        return transferYear >= dayjs(start).year() && transferYear <= dayjs(end).year();
      });
    }

    setFilteredTechnologies(filtered);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      college_id: null,
      sector: '',
      type: '',
      year: null,
      dateRange: null
    });
    setSelectedCollegeId(null);
  };

  const handleDownloadReport = async () => {
    try {
      const dataToExport = filteredTechnologies.length > 0 ? filteredTechnologies : technologies;
      
      const headers = [
        'SN', 'Name of Technology', 'Sector', 'Type of Technology',
        'Year of Transfer', 'Transferred Enterprise', 'Enterprise Phone', 'Enterprise Sector',
        'College Name', 'Technology Developer'
      ];
      
      const csvContent = [
        headers.join(','),
        ...dataToExport.map((tech, index) => [
          index + 1,
          `"${tech.technology_name}"`,
          `"${tech.sector}"`,
          `"${tech.technology_type}"`,
          tech.year_of_transfer,
          `"${tech.transferred_enterprise_name}"`,
          `"${tech.transferred_enterprise_phone}"`,
          `"${tech.enterprise_sector}"`,
          `"${tech.college_name}"`,
          `"${tech.technology_developer_name}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `technology_transfers_report_${Date.now()}.csv`);
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

  const navigateToFullManagement = () => {
    navigate('/technology-transfer');
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
    },
    {
      title: 'Enterprise',
      key: 'enterprise',
      width: 180,
      render: (record: TechnologyTransfer) => (
        <div>
          <div><strong>{record.transferred_enterprise_name}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.enterprise_sector}
          </div>
        </div>
      ),
    },
    {
      title: 'College',
      dataIndex: 'college_name',
      key: 'college_name',
      width: 150,
    },
    {
      title: 'Developer',
      dataIndex: 'technology_developer_name',
      key: 'technology_developer_name',
      width: 150,
    }
  ];

  const displayData = filteredTechnologies.length > 0 ? filteredTechnologies : technologies;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={3}>Technology Transfer Reports</Title>
        <Text type="secondary">
          View and analyze technology transfer data with filtering and export capabilities
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
                ? `Showing technology transfers for ${colleges.find(c => c.college_id === selectedCollegeId)?.college_name || 'selected college'}`
                : 'Showing all technology transfers from all colleges in the database'
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
            </Select>
          </Col>
          <Col span={6}>
            <Select
              placeholder="Filter by Type"
              style={{ width: '100%' }}
              value={filters.type || undefined}
              onChange={(value) => handleFilterChange('type', value)}
              allowClear
            >
              <Option value="Manufacturing">Manufacturing</Option>
              <Option value="Product/Service">Product/Service</Option>
            </Select>
          </Col>
          <Col span={6}>
            <DatePicker
              picker="year"
              placeholder="Filter by Year"
              style={{ width: '100%' }}
              value={filters.year}
              onChange={(value) => handleFilterChange('year', value)}
            />
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
        title={`Technology Transfer Reports (${displayData.length} records)`}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<LinkOutlined />}
              onClick={navigateToFullManagement}
            >
              Full Management
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadReport}
            >
              Download Report
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={displayData}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transfers`
          }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default TechnologyTransferReports;
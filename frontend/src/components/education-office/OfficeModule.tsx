import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  Form, 
  Select, 
  DatePicker, 
  message, 
  Table,
  Space,
  Typography,
  Divider,
  Checkbox,
  Spin,
  Tag
} from 'antd';
import { 
  FileTextOutlined, 
  DownloadOutlined, 
  EyeOutlined,
  TeamOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface OfficeModuleProps {
  colleges: Array<{
    college_id: number;
    college_name: string;
    college_code: string;
  }>;
}

interface ReportData {
  report_id: number;
  data: any[];
  total_records: number;
  college_name?: string;
  report_type: string;
}

const OfficeModule: React.FC<OfficeModuleProps> = ({ colleges }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const handleGenerateReport = async (values: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const reportPayload = {
        college_id: values.college_id,
        report_type: values.report_type || 'comprehensive',
        period_start: values.period?.[0]?.format('YYYY-MM-DD'),
        period_end: values.period?.[1]?.format('YYYY-MM-DD'),
        include_inactive: values.include_inactive || false
      };

      const response = await axios.post(`${API_BASE_URL}/api/education-office/reports/generate`, reportPayload, config);
      
      if (response.data.success) {
        const selectedCollege = colleges.find(c => c.college_id === values.college_id);
        setReportData({
          ...response.data,
          college_name: selectedCollege?.college_name
        });
        setPreviewVisible(true);
        message.success('Report generated successfully!');
      } else {
        message.error(response.data.message || 'Failed to generate report');
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      message.error(error.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!reportData) return;

    try {
      // Convert data to CSV format
      const headers = Object.keys(reportData.data[0] || {});
      const csvContent = [
        headers.join(','),
        ...reportData.data.map(row => 
          headers.map(header => `"${row[header] || ''}"`).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `employee_report_${reportData.college_name}_${dayjs().format('YYYY-MM-DD')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading report:', error);
      message.error('Failed to download report');
    }
  };

  const getReportColumns = () => {
    if (!reportData?.data || reportData.data.length === 0) return [];

    const firstRow = reportData.data[0];
    return Object.keys(firstRow).map(key => ({
      title: key,
      dataIndex: key,
      key: key,
      width: 150,
      ellipsis: true,
      render: (text: any) => text || '-'
    }));
  };

  return (
    <div>
      <Title level={3}>Education Office Module</Title>
      <Text type="secondary">
        Generate comprehensive employee information reports based on college
      </Text>

      <Divider />

      <Row gutter={[24, 24]}>
        {/* Report Generation Form */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <FileTextOutlined />
                Generate Report
              </Space>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleGenerateReport}
            >
              <Form.Item
                name="college_id"
                label="Select College"
                rules={[{ required: true, message: 'Please select a college' }]}
              >
                <Select placeholder="Choose college">
                  {colleges.map(college => (
                    <Option key={college.college_id} value={college.college_id}>
                      {college.college_name} ({college.college_code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="report_type"
                label="Report Type"
                initialValue="comprehensive"
              >
                <Select>
                  <Option value="comprehensive">Comprehensive Report</Option>
                  <Option value="trainer_details">Trainer Details Only</Option>
                  <Option value="admin_details">Admin Details Only</Option>
                  <Option value="employee_summary">Employee Summary</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="period"
                label="Report Period (Optional)"
              >
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item name="include_inactive" valuePropName="checked">
                <Checkbox>Include inactive employees</Checkbox>
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<FileTextOutlined />}
                  block
                >
                  Generate Report
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Report Information */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <TeamOutlined />
                Report Information
              </Space>
            }
          >
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <FileTextOutlined style={{ fontSize: '64px', color: '#1890ff', marginBottom: '24px' }} />
              <Title level={4}>Employee Information Reports</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                Generate detailed reports with the following information:
              </Text>
              
              <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                <Col span={12}>
                  <Card size="small" title="For Trainers">
                    <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
                      <li>Trainer Full Name</li>
                      <li>Sex, Age, Year of Birth</li>
                      <li>Year of Employment</li>
                      <li>Qualification Level & Subject</li>
                      <li>Year of Upgrading</li>
                      <li>Competence Level & Occupation</li>
                      <li>Occupation on Training</li>
                      <li>Mobile, Address, Email</li>
                    </ul>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="For Admin Staff">
                    <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
                      <li>Employee Full Name</li>
                      <li>Sex, Age, Year of Birth</li>
                      <li>Year of Employment</li>
                      <li>Qualification Level & Subject</li>
                      <li>Competence Level & Occupation</li>
                      <li>Employed Work Process</li>
                      <li>Citizen Address</li>
                      <li>Mobile, Email</li>
                    </ul>
                  </Card>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Report Preview Modal/Section */}
      {previewVisible && reportData && (
        <Card
          title={
            <Space>
              <EyeOutlined />
              Report Preview - {reportData.college_name}
              <Tag color="blue">{reportData.report_type}</Tag>
            </Space>
          }
          extra={
            <Space>
              <Button 
                icon={<DownloadOutlined />}
                onClick={handleDownloadReport}
              >
                Download CSV
              </Button>
              <Button onClick={() => setPreviewVisible(false)}>
                Close
              </Button>
            </Space>
          }
          style={{ marginTop: '24px' }}
        >
          <div style={{ marginBottom: '16px' }}>
            <Text strong>Total Records: </Text>
            <Text>{reportData.total_records}</Text>
          </div>
          
          <Table
            dataSource={reportData.data}
            columns={getReportColumns()}
            rowKey={(record, index) => index}
            scroll={{ x: 1200, y: 400 }}
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </Card>
      )}
    </div>
  );
};

export default OfficeModule;

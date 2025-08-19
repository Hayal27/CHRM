import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  TimePicker,
  message,
  Tooltip,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { recruitmentService } from '../../services/recruitmentService';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface Interview {
  id: number;
  application_id: number;
  interview_date: string;
  interview_time: string;
  interview_type: string;
  location: string;
  interviewer_id: number;
  notes: string;
  status: string;
  created_at: string;
  applicant_name: string;
  applicant_email: string;
  job_title: string;
  interviewer_name: string;
}

const InterviewScheduler: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  useEffect(() => {
    fetchInterviews();
  }, []);

  // Add sample data fallback for interviews
  useEffect(() => {
    if (!interviews || typeof interviews.length === 'undefined') {
      setInterviews([
        {
          id: 1,
          application_id: 101,
          interview_date: '2025-07-20',
          interview_time: '14:00:00',
          interview_type: 'in_person',
          location: 'Conference Room A',
          interviewer_id: 5,
          notes: 'Technical interview focusing on coding skills',
          status: 'scheduled',
          created_at: '2025-07-10',
          applicant_name: 'John Doe',
          applicant_email: 'john.doe@example.com',
          job_title: 'Software Engineer',
          interviewer_name: 'Jane Smith'
        },
        {
          id: 2,
          application_id: 102,
          interview_date: '2025-07-22',
          interview_time: '10:00:00',
          interview_type: 'video',
          location: 'Zoom',
          interviewer_id: 6,
          notes: 'Panel interview',
          status: 'completed',
          created_at: '2025-07-12',
          applicant_name: 'Sara Lee',
          applicant_email: 'sara.lee@example.com',
          job_title: 'Product Manager',
          interviewer_name: 'Henok Tesfaye'
        }
      ]);
    }
  }, [interviews]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await recruitmentService.getInterviews({
        status: statusFilter,
        date: dateFilter
      });
      setInterviews(response.interviews);
    } catch (error) {
      message.error('Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async (values: any) => {
    try {
      const interviewData = {
        ...values,
        interview_date: values.interview_date.format('YYYY-MM-DD'),
        interview_time: values.interview_time.format('HH:mm:ss')
      };

      await recruitmentService.scheduleInterview(interviewData);
      message.success('Interview scheduled successfully');
      setScheduleModalVisible(false);
      form.resetFields();
      fetchInterviews();
    } catch (error) {
      message.error('Failed to schedule interview');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      scheduled: 'blue',
      completed: 'green',
      cancelled: 'red',
      rescheduled: 'orange'
    };
    return colors[status] || 'default';
  };

  const getInterviewTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      phone: 'cyan',
      video: 'purple',
      in_person: 'blue',
      technical: 'orange',
      panel: 'magenta'
    };
    return colors[type] || 'default';
  };

  const interviewColumns = [
    {
      title: 'Candidate',
      dataIndex: 'applicant_name',
      key: 'applicant_name',
      render: (text: string, record: Interview) => (
        <div>
          <div><strong>{text}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.applicant_email}</div>
        </div>
      )
    },
    {
      title: 'Position',
      dataIndex: 'job_title',
      key: 'job_title'
    },
    {
      title: 'Interview Type',
      dataIndex: 'interview_type',
      key: 'interview_type',
      render: (type: string) => (
        <Tag color={getInterviewTypeColor(type)}>
          {type.replace('_', ' ').toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Date & Time',
      key: 'datetime',
      render: (_: unknown, record: Interview) => (
        <div>
          <div>{dayjs(record.interview_date).format('MMM DD, YYYY')}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {dayjs(record.interview_time, 'HH:mm:ss').format('hh:mm A')}
          </div>
        </div>
      )
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: 'Interviewer',
      dataIndex: 'interviewer_name',
      key: 'interviewer_name'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Interview) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              size="small"
              icon={<EyeOutlined />} 
              onClick={() => setScheduleModalVisible(true)}
            />
          </Tooltip>
          {record.status === 'scheduled' && (
            <Tooltip title="Submit Evaluation">
              <Button 
                type="primary" 
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => setScheduleModalVisible(true)}
              >
                Evaluate
              </Button>
            </Tooltip>
          )}
        </Space>
      )
    }
  ];

  // Defensive fallback for interviews state
  const interviewStats = {
    total: Array.isArray(interviews) ? interviews.length : 0,
    scheduled: Array.isArray(interviews) ? interviews.filter(i => i.status === 'scheduled').length : 0,
    completed: Array.isArray(interviews) ? interviews.filter(i => i.status === 'completed').length : 0,
    cancelled: Array.isArray(interviews) ? interviews.filter(i => i.status === 'cancelled').length : 0
  };

  return (
    <div>
      <Card title="Interview Management">
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Total Interviews"
                value={interviewStats.total}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Scheduled"
                value={interviewStats.scheduled}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Completed"
                value={interviewStats.completed}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic
                title="Cancelled"
                value={interviewStats.cancelled}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={8}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
            >
              <Option value="scheduled">Scheduled</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
              <Option value="rescheduled">Rescheduled</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <DatePicker
              placeholder="Filter by date"
              style={{ width: '100%' }}
              onChange={(date) => setDateFilter(date?.format('YYYY-MM-DD') || '')}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => setScheduleModalVisible(true)}
              block
            >
              Schedule Interview
            </Button>
          </Col>
        </Row>

        <Table
          columns={interviewColumns}
          dataSource={interviews}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} interviews`
          }}
        />
      </Card>

      {/* Schedule Interview Modal */}
      <Modal
        title="Schedule Interview"
        open={scheduleModalVisible}
        onCancel={() => {
          setScheduleModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleScheduleInterview}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="application_id"
                label="Application ID"
                rules={[{ required: true, message: 'Please enter application ID' }]}
              >
                <Input placeholder="Enter application ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="interview_type"
                label="Interview Type"
                rules={[{ required: true, message: 'Please select interview type' }]}
              >
                <Select placeholder="Select interview type">
                  <Option value="phone">Phone</Option>
                  <Option value="video">Video</Option>
                  <Option value="in_person">In Person</Option>
                  <Option value="technical">Technical</Option>
                  <Option value="panel">Panel</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="interview_date"
                label="Interview Date"
                rules={[{ required: true, message: 'Please select interview date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="interview_time"
                label="Interview Time"
                rules={[{ required: true, message: 'Please select interview time' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="Location"
                rules={[{ required: true, message: 'Please enter location' }]}
              >
                <Input placeholder="e.g., Conference Room A" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="interviewer_id"
                label="Interviewer ID"
                rules={[{ required: true, message: 'Please enter interviewer ID' }]}
              >
                <Input placeholder="Enter interviewer ID" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea rows={3} placeholder="Additional notes for the interview..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Schedule Interview
              </Button>
              <Button onClick={() => {
                setScheduleModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InterviewScheduler;
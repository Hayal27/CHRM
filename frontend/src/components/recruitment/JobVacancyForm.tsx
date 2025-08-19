import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  Card, 
  Row, 
  Col, 
  Table, 
  Space, 
  Modal, 
  message,
  Tag,
  Tooltip,
  Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { recruitmentService } from '../../services/recruitmentService';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface JobVacancy {
  id: number;
  title: string;
  department: string;
  description: string;
  requirements: string;
  responsibilities: string;
  salary_range: string;
  location: string;
  employment_type: string;
  experience_level: string;
  education_required: string;
  skills_required: string;
  deadline: string;
  status: string;
  created_at: string;
  application_count: number;
}

const JobVacancyForm: React.FC = () => {
  const [form] = Form.useForm();
  const [vacancies, setVacancies] = useState<JobVacancy[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<JobVacancy | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      const response = await recruitmentService.getVacancies({
        search: searchText,
        status: statusFilter,
        department: departmentFilter
      });
      setVacancies(response.data.vacancies);
    } catch (error) {
      message.error('Failed to fetch job vacancies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const formData = {
        ...values,
        deadline: values.deadline?.format('YYYY-MM-DD')
      };

      if (editingVacancy) {
        await recruitmentService.updateVacancy(editingVacancy.id, formData);
        message.success('Job vacancy updated successfully');
      } else {
        await recruitmentService.createVacancy(formData);
        message.success('Job vacancy created successfully');
      }

      setModalVisible(false);
      form.resetFields();
      setEditingVacancy(null);
      fetchVacancies();
    } catch (error) {
      message.error('Failed to save job vacancy');
    }
  };

  const handleEdit = (record: JobVacancy) => {
    setEditingVacancy(record);
    form.setFieldsValue({
      ...record,
      deadline: record.deadline ? dayjs(record.deadline) : null
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await recruitmentService.updateVacancy(id, { status: 'closed' });
      message.success('Job vacancy closed successfully');
      fetchVacancies();
    } catch (error) {
      message.error('Failed to close job vacancy');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      active: 'green',
      inactive: 'orange',
      closed: 'red'
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: 'Salary Range',
      dataIndex: 'salary_range',
      key: 'salary_range'
    },
    {
      title: 'Applications',
      dataIndex: 'application_count',
      key: 'application_count',
      render: (count: number) => <Tag color="cyan">{count}</Tag>
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
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: JobVacancy) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to close this vacancy?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card title="Job Vacancies Management">
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={8}>
            <Input
              placeholder="Search vacancies..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={fetchVacancies}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="closed">Closed</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by department"
              style={{ width: '100%' }}
              value={departmentFilter}
              onChange={setDepartmentFilter}
              allowClear
            >
              <Option value="Engineering">Engineering</Option>
              <Option value="Marketing">Marketing</Option>
              <Option value="Sales">Sales</Option>
              <Option value="HR">HR</Option>
              <Option value="Finance">Finance</Option>
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingVacancy(null);
                form.resetFields();
                setModalVisible(true);
              }}
              block
            >
              Add Vacancy
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={vacancies}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} vacancies`
          }}
        />
      </Card>

      <Modal
        title={editingVacancy ? 'Edit Job Vacancy' : 'Create Job Vacancy'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingVacancy(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            employment_type: 'full_time',
            experience_level: 'mid',
            status: 'active'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Job Title"
                rules={[{ required: true, message: 'Please enter job title' }]}
              >
                <Input placeholder="e.g., Software Engineer" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Department"
                rules={[{ required: true, message: 'Please select department' }]}
              >
                <Select placeholder="Select department">
                  <Option value="Engineering">Engineering</Option>
                  <Option value="Marketing">Marketing</Option>
                  <Option value="Sales">Sales</Option>
                  <Option value="HR">HR</Option>
                  <Option value="Finance">Finance</Option>
                </Select>
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
                <Input placeholder="e.g., New York, NY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="salary_range"
                label="Salary Range"
                rules={[{ required: true, message: 'Please enter salary range' }]}
              >
                <Input placeholder="e.g., $60,000 - $80,000" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="employment_type"
                label="Employment Type"
                rules={[{ required: true, message: 'Please select employment type' }]}
              >
                <Select>
                  <Option value="full_time">Full Time</Option>
                  <Option value="part_time">Part Time</Option>
                  <Option value="contract">Contract</Option>
                  <Option value="internship">Internship</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="experience_level"
                label="Experience Level"
                rules={[{ required: true, message: 'Please select experience level' }]}
              >
                <Select>
                  <Option value="entry">Entry Level</Option>
                  <Option value="mid">Mid Level</Option>
                  <Option value="senior">Senior Level</Option>
                  <Option value="executive">Executive Level</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Job Description"
            rules={[{ required: true, message: 'Please enter job description' }]}
          >
            <TextArea rows={4} placeholder="Describe the role and responsibilities..." />
          </Form.Item>

          <Form.Item
            name="requirements"
            label="Requirements"
            rules={[{ required: true, message: 'Please enter requirements' }]}
          >
            <TextArea rows={3} placeholder="List the requirements for this position..." />
          </Form.Item>

          <Form.Item
            name="responsibilities"
            label="Responsibilities"
            rules={[{ required: true, message: 'Please enter responsibilities' }]}
          >
            <TextArea rows={3} placeholder="List the key responsibilities..." />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="education_required"
                label="Education Required"
              >
                <Input placeholder="e.g., Bachelor's Degree" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="skills_required"
                label="Skills Required"
              >
                <Input placeholder="e.g., JavaScript, React, Node.js" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="deadline"
            label="Application Deadline"
            rules={[{ required: true, message: 'Please select deadline' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingVacancy ? 'Update Vacancy' : 'Create Vacancy'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingVacancy(null);
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

export default JobVacancyForm;
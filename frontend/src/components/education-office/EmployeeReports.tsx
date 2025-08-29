import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Select, 
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
  Progress,
  Tabs,
  Badge,
  Input,
  Checkbox,
  Radio,
  Modal,
  Alert,
  List,
  Avatar,
  Cascader
} from 'antd';
import { 
  FileTextOutlined, 
  DownloadOutlined, 
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  BookOutlined,
  CalendarOutlined,
  PieChartOutlined,
  BarChartOutlined,
  ManOutlined,
  WomanOutlined,
  ApartmentOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExportOutlined,
  GlobalOutlined,
  LineChartOutlined,
  RiseOutlined,
  FallOutlined,
  SearchOutlined,
  ClearOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  DashboardOutlined,
  FundOutlined
} from '@ant-design/icons';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import axios from 'axios';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

const { Title, Text } = Typography;
const { Option } = Select;

interface College {
  college_id: number;
  college_name: string;
  college_code: string;
}

interface EmployeeReportsProps {
  colleges: College[];
}

interface Employee {
  employee_id: number;
  full_name: string;
  fname?: string;
  lname?: string;
  employee_type: string;
  sex: string;
  age: number;
  year_of_birth: number;
  year_of_employment: number;
  qualification_level: string;
  qualification_subject: string;
  year_of_upgrading?: number;
  competence_level: string;
  competence_occupation: string;
  citizen_address?: string;
  mobile: string;
  email: string;
  occupation_on_training?: string;
  employed_work_process?: string;
  position?: string;
  dateOfJoining?: string;
  status: string;
  college_name?: string;
  college_code?: string;
  department_name?: string;
  role_name?: string;
  user_status?: string;
}

interface QualificationGenderData {
  department: string;
  totalEmployees: number;
  qualifications: {
    [key: string]: {
      qualification: string;
      total: number;
      male: number;
      female: number;
      other: number;
      percentage: number;
    };
  };
  genderBreakdown: {
    male: number;
    female: number;
    other: number;
  };
}

interface AnalyticsData {
  genderByDepartment: any[];
  qualificationByDepartment: any[];
  qualificationGenderByDepartment: QualificationGenderData[];
  ageDistribution: any[];
  employmentTrends: any[];
  departmentComparison: any[];
  collegeComparison: any[];
  experienceDistribution: any[];
  statusDistribution: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

const EmployeeReports: React.FC<EmployeeReportsProps> = ({ colleges }) => {
  const [loading, setLoading] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<number | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'overall' | 'college' | 'department'>('overall');
  const [searchText, setSearchText] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [reportFormat, setReportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    genderByDepartment: [],
    qualificationByDepartment: [],
    qualificationGenderByDepartment: [],
    ageDistribution: [],
    employmentTrends: [],
    departmentComparison: [],
    collegeComparison: [],
    experienceDistribution: [],
    statusDistribution: []
  });

  const [statistics, setStatistics] = useState({
    total: 0,
    trainers: 0,
    admins: 0,
    active: 0,
    inactive: 0,
    male: 0,
    female: 0,
    avgAge: 0,
    departments: 0,
    avgExperience: 0
  });

  // Load data on component mount
  useEffect(() => {
    fetchAllEmployees();
  }, []);

  // Update analytics when data changes
  useEffect(() => {
    if (allEmployees.length > 0) {
      calculateAnalytics();
    }
  }, [allEmployees, selectedCollege, selectedDepartment, viewMode]);

  // Fetch all employees
  const fetchAllEmployees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch from all colleges
      const allEmployeesData: Employee[] = [];
      for (const college of colleges) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/education-office/employees/${college.college_id}`, config);
          if (response.data.success) {
            const employeesWithCollege = response.data.employees.map((emp: Employee) => ({
              ...emp,
              college_name: college.college_name,
              college_code: college.college_code
            }));
            allEmployeesData.push(...employeesWithCollege);
          }
        } catch (error) {
          console.warn(`Failed to fetch employees for college ${college.college_name}`);
        }
      }
      
      setAllEmployees(allEmployeesData);
      setFilteredEmployees(allEmployeesData);
    } catch (error) {
      console.error('Error fetching all employees:', error);
      message.error('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate comprehensive analytics
  const calculateAnalytics = () => {
    let dataToAnalyze = allEmployees;

    // Filter based on view mode
    if (viewMode === 'college' && selectedCollege) {
      const selectedCollegeName = colleges.find(c => c.college_id === selectedCollege)?.college_name;
      dataToAnalyze = allEmployees.filter(emp => emp.college_name === selectedCollegeName);
    } else if (viewMode === 'department' && selectedCollege && selectedDepartment) {
      const selectedCollegeName = colleges.find(c => c.college_id === selectedCollege)?.college_name;
      dataToAnalyze = allEmployees.filter(emp => 
        emp.college_name === selectedCollegeName && emp.department_name === selectedDepartment
      );
    }

    // Calculate statistics
    const stats = {
      total: dataToAnalyze.length,
      trainers: dataToAnalyze.filter(emp => emp.employee_type === 'trainer').length,
      admins: dataToAnalyze.filter(emp => emp.employee_type === 'admin').length,
      active: dataToAnalyze.filter(emp => emp.status === 'Active' || emp.status === 'active').length,
      inactive: dataToAnalyze.filter(emp => emp.status !== 'Active' && emp.status !== 'active').length,
      male: dataToAnalyze.filter(emp => emp.sex === 'M').length,
      female: dataToAnalyze.filter(emp => emp.sex === 'F').length,
      avgAge: Math.round(dataToAnalyze.reduce((sum, emp) => sum + emp.age, 0) / dataToAnalyze.length) || 0,
      departments: new Set(dataToAnalyze.map(emp => emp.department_name).filter(Boolean)).size,
      avgExperience: Math.round(dataToAnalyze.reduce((sum, emp) => sum + (new Date().getFullYear() - emp.year_of_employment), 0) / dataToAnalyze.length) || 0
    };
    setStatistics(stats);

    // Gender by Department Analysis
    const genderByDept = {};
    dataToAnalyze.forEach(emp => {
      const dept = emp.department_name || 'Unassigned';
      if (!genderByDept[dept]) {
        genderByDept[dept] = { department: dept, male: 0, female: 0, total: 0 };
      }
      genderByDept[dept].total++;
      if (emp.sex === 'M') genderByDept[dept].male++;
      if (emp.sex === 'F') genderByDept[dept].female++;
    });

    // Qualification by Department Analysis with Gender Distribution
    const qualByDept = {};
    const qualGenderByDept: { [key: string]: QualificationGenderData } = {};
    
    dataToAnalyze.forEach(emp => {
      const dept = emp.department_name || 'Unassigned';
      const qual = emp.qualification_level || 'Not Specified';
      const gender = emp.sex === 'M' ? 'Male' : emp.sex === 'F' ? 'Female' : 'Other';
      
      // Overall qualification by department
      const key = `${dept}-${qual}`;
      if (!qualByDept[key]) {
        qualByDept[key] = { department: dept, qualification: qual, count: 0, male: 0, female: 0, other: 0 };
      }
      qualByDept[key].count++;
      if (gender === 'Male') qualByDept[key].male++;
      else if (gender === 'Female') qualByDept[key].female++;
      else qualByDept[key].other++;

      // Department-wise qualification and gender breakdown
      if (!qualGenderByDept[dept]) {
        qualGenderByDept[dept] = {
          department: dept,
          totalEmployees: 0,
          qualifications: {},
          genderBreakdown: { male: 0, female: 0, other: 0 }
        };
      }
      
      qualGenderByDept[dept].totalEmployees++;
      qualGenderByDept[dept].genderBreakdown[gender.toLowerCase()]++;
      
      if (!qualGenderByDept[dept].qualifications[qual]) {
        qualGenderByDept[dept].qualifications[qual] = {
          qualification: qual,
          total: 0,
          male: 0,
          female: 0,
          other: 0,
          percentage: 0
        };
      }
      
      qualGenderByDept[dept].qualifications[qual].total++;
      qualGenderByDept[dept].qualifications[qual][gender.toLowerCase()]++;
    });

    // Calculate percentages for qualifications within each department
    Object.keys(qualGenderByDept).forEach(dept => {
      const deptData = qualGenderByDept[dept];
      Object.keys(deptData.qualifications).forEach(qual => {
        const qualData = deptData.qualifications[qual];
        qualData.percentage = Math.round((qualData.total / deptData.totalEmployees) * 100);
      });
    });

    // Age Distribution
    const ageGroups = {
      '20-30': 0, '31-40': 0, '41-50': 0, '51-60': 0, '60+': 0
    };
    dataToAnalyze.forEach(emp => {
      if (emp.age >= 20 && emp.age <= 30) ageGroups['20-30']++;
      else if (emp.age >= 31 && emp.age <= 40) ageGroups['31-40']++;
      else if (emp.age >= 41 && emp.age <= 50) ageGroups['41-50']++;
      else if (emp.age >= 51 && emp.age <= 60) ageGroups['51-60']++;
      else if (emp.age > 60) ageGroups['60+']++;
    });

    // Employment Trends (by year)
    const employmentTrends = {};
    dataToAnalyze.forEach(emp => {
      const year = emp.year_of_employment;
      if (year && year > 1990) {
        employmentTrends[year] = (employmentTrends[year] || 0) + 1;
      }
    });

    // Department Comparison
    const deptComparison = {};
    dataToAnalyze.forEach(emp => {
      const dept = emp.department_name || 'Unassigned';
      if (!deptComparison[dept]) {
        deptComparison[dept] = {
          department: dept,
          total: 0,
          trainers: 0,
          admins: 0,
          male: 0,
          female: 0,
          avgAge: 0,
          ages: []
        };
      }
      deptComparison[dept].total++;
      if (emp.employee_type === 'trainer') deptComparison[dept].trainers++;
      if (emp.employee_type === 'admin') deptComparison[dept].admins++;
      if (emp.sex === 'M') deptComparison[dept].male++;
      if (emp.sex === 'F') deptComparison[dept].female++;
      deptComparison[dept].ages.push(emp.age);
    });

    // Calculate average ages for departments
    Object.keys(deptComparison).forEach(dept => {
      const ages = deptComparison[dept].ages;
      deptComparison[dept].avgAge = Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length);
      delete deptComparison[dept].ages;
    });

    // College Comparison (if viewing overall)
    const collegeComparison = {};
    if (viewMode === 'overall') {
      dataToAnalyze.forEach(emp => {
        const college = emp.college_name || 'Unknown';
        if (!collegeComparison[college]) {
          collegeComparison[college] = {
            college,
            total: 0,
            trainers: 0,
            admins: 0,
            male: 0,
            female: 0,
            departments: new Set()
          };
        }
        collegeComparison[college].total++;
        if (emp.employee_type === 'trainer') collegeComparison[college].trainers++;
        if (emp.employee_type === 'admin') collegeComparison[college].admins++;
        if (emp.sex === 'M') collegeComparison[college].male++;
        if (emp.sex === 'F') collegeComparison[college].female++;
        if (emp.department_name) collegeComparison[college].departments.add(emp.department_name);
      });

      // Convert departments Set to count
      Object.keys(collegeComparison).forEach(college => {
        collegeComparison[college].departmentCount = collegeComparison[college].departments.size;
        delete collegeComparison[college].departments;
      });
    }

    // Experience Distribution
    const experienceGroups = {
      '0-5 years': 0,
      '6-10 years': 0,
      '11-20 years': 0,
      '20+ years': 0
    };
    dataToAnalyze.forEach(emp => {
      const experience = new Date().getFullYear() - emp.year_of_employment;
      if (experience <= 5) experienceGroups['0-5 years']++;
      else if (experience <= 10) experienceGroups['6-10 years']++;
      else if (experience <= 20) experienceGroups['11-20 years']++;
      else experienceGroups['20+ years']++;
    });

    // Status Distribution
    const statusDist = {
      Active: dataToAnalyze.filter(emp => emp.status === 'Active' || emp.status === 'active').length,
      Inactive: dataToAnalyze.filter(emp => emp.status !== 'Active' && emp.status !== 'active').length
    };

    setAnalyticsData({
      genderByDepartment: Object.values(genderByDept),
      qualificationByDepartment: Object.values(qualByDept),
      qualificationGenderByDepartment: Object.values(qualGenderByDept),
      ageDistribution: Object.keys(ageGroups).map(key => ({ ageGroup: key, count: ageGroups[key] })),
      employmentTrends: Object.keys(employmentTrends).map(year => ({ year: parseInt(year), count: employmentTrends[year] })).sort((a, b) => a.year - b.year),
      departmentComparison: Object.values(deptComparison),
      collegeComparison: Object.values(collegeComparison),
      experienceDistribution: Object.keys(experienceGroups).map(key => ({ experience: key, count: experienceGroups[key] })),
      statusDistribution: Object.keys(statusDist).map(key => ({ status: key, count: statusDist[key] }))
    });
  };

  // Handle view mode changes
  const handleViewModeChange = (mode: 'overall' | 'college' | 'department') => {
    setViewMode(mode);
    if (mode === 'overall') {
      setSelectedCollege(null);
      setSelectedDepartment(null);
    } else if (mode === 'college') {
      setSelectedDepartment(null);
    }
  };

  // Handle college selection
  const handleCollegeChange = (collegeId: number) => {
    setSelectedCollege(collegeId);
    if (viewMode === 'college') {
      setSelectedDepartment(null);
    }
  };

  // Handle department selection
  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department);
  };

  // Get available departments for selected college
  const getAvailableDepartments = () => {
    if (!selectedCollege) return [];
    const selectedCollegeName = colleges.find(c => c.college_id === selectedCollege)?.college_name;
    const collegeDepartments = allEmployees
      .filter(emp => emp.college_name === selectedCollegeName)
      .map(emp => emp.department_name)
      .filter(Boolean);
    return [...new Set(collegeDepartments)];
  };

  // Advanced filtering
  const applyFilters = (data: Employee[]) => {
    let filtered = [...data];

    if (searchText) {
      filtered = filtered.filter(emp => 
        emp.full_name.toLowerCase().includes(searchText.toLowerCase()) ||
        emp.employee_id.toString().includes(searchText) ||
        emp.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        emp.mobile?.includes(searchText)
      );
    }

    if (!includeInactive) {
      filtered = filtered.filter(emp => emp.status === 'Active' || emp.status === 'active');
    }

    return filtered;
  };

  // Enhanced report generation
  const handleAdvancedDownloadReport = async (reportType: string, format: string = 'csv') => {
    let dataToExport = allEmployees;

    // Filter based on view mode
    if (viewMode === 'college' && selectedCollege) {
      const selectedCollegeName = colleges.find(c => c.college_id === selectedCollege)?.college_name;
      dataToExport = allEmployees.filter(emp => emp.college_name === selectedCollegeName);
    } else if (viewMode === 'department' && selectedCollege && selectedDepartment) {
      const selectedCollegeName = colleges.find(c => c.college_id === selectedCollege)?.college_name;
      dataToExport = allEmployees.filter(emp => 
        emp.college_name === selectedCollegeName && emp.department_name === selectedDepartment
      );
    }

    const filteredData = applyFilters(dataToExport);

    if (filteredData.length === 0) {
      message.warning('No data to export with current filters');
      return;
    }

    try {
      const headers = [
        'Employee ID', 'Full Name', 'Type', 'Gender', 'Age', 'Year of Employment',
        'Qualification Level', 'Qualification Subject', 'Competence Level', 'Competence Occupation',
        'Mobile', 'Email', 'Status', 'College', 'Department', 'Position'
      ];

      const csvContent = [
        headers.join(','),
        ...filteredData.map((emp: Employee) => [
          emp.employee_id,
          `"${emp.full_name}"`,
          emp.employee_type,
          emp.sex === 'M' ? 'Male' : emp.sex === 'F' ? 'Female' : emp.sex,
          emp.age,
          emp.year_of_employment || '',
          `"${emp.qualification_level || ''}"`,
          `"${emp.qualification_subject || ''}"`,
          `"${emp.competence_level || ''}"`,
          `"${emp.competence_occupation || ''}"`,
          emp.mobile || '',
          emp.email || '',
          emp.status,
          `"${emp.college_name || ''}"`,
          `"${emp.department_name || ''}"`,
          `"${emp.position || ''}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportType}_${viewMode}_report_${Date.now()}.${format}`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success(`${format.toUpperCase()} report downloaded successfully!`);
    } catch (error: any) {
      console.error('Error downloading report:', error);
      message.error('Failed to download report');
    }
  };

  // Render employee details
  const renderEmployeeDetails = () => {
    if (!selectedEmployee) return null;

    return (
      <div>
        <Descriptions title="Personal Information" bordered column={2} size="small">
          <Descriptions.Item label="Full Name" span={2}>
            <strong>{selectedEmployee.full_name}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Employee Type">
            <Tag color={selectedEmployee.employee_type === 'trainer' ? 'blue' : 'green'}>
              {selectedEmployee.employee_type?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Gender">
            {selectedEmployee.sex === 'M' ? 'Male' : selectedEmployee.sex === 'F' ? 'Female' : selectedEmployee.sex}
          </Descriptions.Item>
          <Descriptions.Item label="Age">
            {selectedEmployee.age} years
          </Descriptions.Item>
          <Descriptions.Item label="Year of Employment">
            {selectedEmployee.year_of_employment || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={selectedEmployee.status === 'Active' ? 'green' : 'red'}>
              {selectedEmployee.status?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="College">
            {selectedEmployee.college_name || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Department">
            {selectedEmployee.department_name || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Position">
            {selectedEmployee.position || 'N/A'}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Descriptions title="Contact Information" bordered column={2} size="small">
          <Descriptions.Item label={<><PhoneOutlined /> Mobile</>}>
            {selectedEmployee.mobile || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label={<><MailOutlined /> Email</>}>
            {selectedEmployee.email || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label={<><HomeOutlined /> Address</> } span={2}>
            {selectedEmployee.citizen_address || 'N/A'}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Descriptions title="Qualification & Competence" bordered column={2} size="small">
          <Descriptions.Item label="Qualification Level">
            {selectedEmployee.qualification_level || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Qualification Subject">
            {selectedEmployee.qualification_subject || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Competence Level">
            {selectedEmployee.competence_level || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Competence Occupation" span={2}>
            {selectedEmployee.competence_occupation || 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      </div>
    );
  };

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'full_name',
      key: 'full_name',
      fixed: 'left' as const,
      width: 200,
      render: (text: string, record: Employee) => (
        <div>
          <div><strong>{text}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            ID: {record.employee_id}
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'employee_type',
      key: 'employee_type',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'trainer' ? 'blue' : 'green'}>
          {type?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Gender',
      dataIndex: 'sex',
      key: 'sex',
      width: 80,
      render: (sex: string) => (
        <Tag color={sex === 'M' ? '#1890ff' : '#ff69b4'}>
          {sex === 'M' ? 'Male' : sex === 'F' ? 'Female' : sex}
        </Tag>
      ),
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      width: 80,
      sorter: (a: Employee, b: Employee) => a.age - b.age,
    },
    {
      title: 'Department',
      dataIndex: 'department_name',
      key: 'department_name',
      width: 150,
      render: (dept: string) => dept || 'Unassigned',
    },
    {
      title: 'Qualification',
      dataIndex: 'qualification_level',
      key: 'qualification_level',
      width: 150,
      render: (qual: string) => qual || 'Not Specified',
    },
    {
      title: 'College',
      dataIndex: 'college_name',
      key: 'college_name',
      width: 150,
      render: (college: string) => college || 'Unknown',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (record: Employee) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedEmployee(record);
            setDrawerVisible(true);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={3}>
          <DashboardOutlined style={{ marginRight: 8 }} />
          Comprehensive Employee Analytics Dashboard
        </Title>
        <Text type="secondary">
          Advanced analytics with detailed breakdowns by college, department, gender, qualifications, and more
        </Text>
      </div>

      {/* Control Panel */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <div>
              <Text strong>View Mode:</Text>
              <Radio.Group
                value={viewMode}
                onChange={(e) => handleViewModeChange(e.target.value)}
                style={{ marginLeft: 8 }}
              >
                <Radio.Button value="overall">
                  <GlobalOutlined /> Overall
                </Radio.Button>
                <Radio.Button value="college">
                  <BookOutlined /> College
                </Radio.Button>
                <Radio.Button value="department">
                  <ApartmentOutlined /> Department
                </Radio.Button>
              </Radio.Group>
            </div>
          </Col>
          
          {(viewMode === 'college' || viewMode === 'department') && (
            <Col span={6}>
              <Select
                placeholder="Select a college"
                style={{ width: '100%' }}
                onChange={handleCollegeChange}
                value={selectedCollege}
                showSearch
                filterOption={(input, option) =>
                  option?.children?.toString().toLowerCase().includes(input.toLowerCase())
                }
              >
                {colleges.map(college => (
                  <Option key={college.college_id} value={college.college_id}>
                    {college.college_name}
                  </Option>
                ))}
              </Select>
            </Col>
          )}

          {viewMode === 'department' && selectedCollege && (
            <Col span={6}>
              <Select
                placeholder="Select a department"
                style={{ width: '100%' }}
                onChange={handleDepartmentChange}
                value={selectedDepartment}
                showSearch
              >
                {getAvailableDepartments().map(dept => (
                  <Option key={dept} value={dept}>
                    {dept}
                  </Option>
                ))}
              </Select>
            </Col>
          )}
          
          <Col span={6}>
            <Space>
              <Button 
                icon={<ReloadOutlined />}
                onClick={fetchAllEmployees}
                loading={loading}
              >
                Refresh
              </Button>
              <Button 
                icon={<ExportOutlined />}
                onClick={() => setReportModalVisible(true)}
                type="primary"
              >
                Export Report
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics Overview */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={3}>
          <Card>
            <Statistic
              title="Total Employees"
              value={statistics.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="Trainers"
              value={statistics.trainers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="Admin Staff"
              value={statistics.admins}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="Male"
              value={statistics.male}
              prefix={<ManOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="Female"
              value={statistics.female}
              prefix={<WomanOutlined />}
              valueStyle={{ color: '#ff69b4' }}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="Active"
              value={statistics.active}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="Avg Age"
              value={statistics.avgAge}
              suffix="years"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="Departments"
              value={statistics.departments}
              prefix={<ApartmentOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Analytics Dashboard */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        {/* Dashboard Tab */}
        <Tabs.TabPane 
          tab={
            <span>
              <DashboardOutlined />
              Analytics Dashboard
            </span>
          } 
          key="dashboard"
        >
          <Row gutter={16}>
            {/* Gender by Department Chart */}
            <Col span={12}>
              <Card title="Gender Distribution by Department" extra={<PieChartOutlined />}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.genderByDepartment}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="male" fill="#1890ff" name="Male" />
                    <Bar dataKey="female" fill="#ff69b4" name="Female" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Age Distribution Chart */}
            <Col span={12}>
              <Card title="Age Distribution" extra={<BarChartOutlined />}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.ageDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ ageGroup, count, percent }) => `${ageGroup}: ${count} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.ageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 16 }}>
            {/* Department Comparison */}
            <Col span={12}>
              <Card title="Department Comparison" extra={<ApartmentOutlined />}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.departmentComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#8884d8" name="Total" />
                    <Bar dataKey="trainers" fill="#82ca9d" name="Trainers" />
                    <Bar dataKey="admins" fill="#ffc658" name="Admins" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            {/* Experience Distribution */}
            <Col span={12}>
              <Card title="Experience Distribution" extra={<FundOutlined />}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.experienceDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ experience, count, percent }) => `${experience}: ${count} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.experienceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Employment Trends */}
          {analyticsData.employmentTrends.length > 0 && (
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card title="Employment Trends Over Years" extra={<LineChartOutlined />}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.employmentTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} name="New Hires" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          )}

          {/* College Comparison (if overall view) */}
          {viewMode === 'overall' && analyticsData.collegeComparison.length > 0 && (
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card title="College Comparison" extra={<BookOutlined />}>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analyticsData.collegeComparison}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="college" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="total" fill="#8884d8" name="Total Employees" />
                      <Bar dataKey="trainers" fill="#82ca9d" name="Trainers" />
                      <Bar dataKey="admins" fill="#ffc658" name="Admins" />
                      <Bar dataKey="male" fill="#1890ff" name="Male" />
                      <Bar dataKey="female" fill="#ff69b4" name="Female" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          )}
        </Tabs.TabPane>

        {/* Qualification & Gender Analysis Tab */}
        <Tabs.TabPane 
          tab={
            <span>
              <TrophyOutlined />
              Qualification & Gender Analysis
            </span>
          } 
          key="qualification-gender"
        >
          <Row gutter={16}>
            {/* Department-wise Qualification and Gender Breakdown */}
            {analyticsData.qualificationGenderByDepartment.map((deptData, index) => (
              <Col span={24} key={deptData.department} style={{ marginBottom: 16 }}>
                <Card 
                  title={`${deptData.department} Department - ${deptData.totalEmployees} Employees`}
                  extra={
                    <Space>
                      <Tag color="blue">Male: {deptData.genderBreakdown.male}</Tag>
                      <Tag color="pink">Female: {deptData.genderBreakdown.female}</Tag>
                      {deptData.genderBreakdown.other > 0 && <Tag color="green">Other: {deptData.genderBreakdown.other}</Tag>}
                    </Space>
                  }
                >
                  <Row gutter={16}>
                    {/* Gender Distribution Chart for Department */}
                    <Col span={8}>
                      <div style={{ textAlign: "center", marginBottom: 16 }}>
                        <Title level={5}>Gender Distribution</Title>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: "Male", value: deptData.genderBreakdown.male, fill: "#1890ff" },
                                { name: "Female", value: deptData.genderBreakdown.female, fill: "#ff69b4" },
                                ...(deptData.genderBreakdown.other > 0 ? [{ name: "Other", value: deptData.genderBreakdown.other, fill: "#52c41a" }] : [])
                              ]}
                              cx="50%"
                              cy="50%"
                              outerRadius={60}
                              dataKey="value"
                              label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                            />
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </Col>

                    {/* Qualification Breakdown Chart */}
                    <Col span={16}>
                      <div style={{ marginBottom: 16 }}>
                        <Title level={5}>Qualification Breakdown with Gender Distribution</Title>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={Object.values(deptData.qualifications)}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="qualification" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <RechartsTooltip />
                            <Legend />
                            <Bar dataKey="male" fill="#1890ff" name="Male" />
                            <Bar dataKey="female" fill="#ff69b4" name="Female" />
                            {deptData.genderBreakdown.other > 0 && <Bar dataKey="other" fill="#52c41a" name="Other" />}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </Col>
                  </Row>

                  {/* Detailed Qualification Table */}
                  <Divider />
                  <Title level={5}>Detailed Qualification Analysis</Title>
                  <Table
                    dataSource={Object.values(deptData.qualifications)}
                    columns={[
                      { 
                        title: "Qualification Level", 
                        dataIndex: "qualification", 
                        key: "qualification",
                        width: 200
                      },
                      { 
                        title: "Total", 
                        dataIndex: "total", 
                        key: "total",
                        sorter: (a, b) => a.total - b.total,
                        render: (value, record) => (
                          <Badge count={value} style={{ backgroundColor: "#52c41a" }} />
                        )
                      },
                      { 
                        title: "Percentage", 
                        dataIndex: "percentage",
                        key: "percentage",
                        render: (_, record) => (
                          <Progress 
                            percent={record.percentage} 
                            size="small" 
                            format={percent => `${percent}%`}
                          />
                        )
                      },
                      { 
                        title: "Male", 
                        dataIndex: "male", 
                        key: "male",
                        render: (value, record) => (
                          <div>
                            <Badge count={value} style={{ backgroundColor: "#1890ff" }} />
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              ({record.total > 0 ? Math.round((value / record.total) * 100) : 0}%)
                            </div>
                          </div>
                        )
                      },
                      { 
                        title: "Female", 
                        dataIndex: "female", 
                        key: "female",
                        render: (value, record) => (
                          <div>
                            <Badge count={value} style={{ backgroundColor: "#ff69b4" }} />
                            <div style={{ fontSize: "12px", color: "#666" }}>
                              ({record.total > 0 ? Math.round((value / record.total) * 100) : 0}%)
                            </div>
                          </div>
                        )
                      }
                    ]}
                    pagination={false}
                    size="small"
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Tabs.TabPane>

        {/* Detailed Reports Tab */}
        <Tabs.TabPane 
          tab={
            <span>
              <FileTextOutlined />
              Detailed Reports
            </span>
          } 
          key="reports"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Card title="Gender Analysis by Department">
                <Table
                  dataSource={analyticsData.genderByDepartment}
                  columns={[
                    { title: 'Department', dataIndex: 'department', key: 'department' },
                    { title: 'Total', dataIndex: 'total', key: 'total', sorter: (a, b) => a.total - b.total },
                    { 
                      title: 'Male', 
                      dataIndex: 'male', 
                      key: 'male',
                      render: (value, record) => (
                        <span>
                          {value} ({record.total > 0 ? Math.round((value / record.total) * 100) : 0}%)
                        </span>
                      )
                    },
                    { 
                      title: 'Female', 
                      dataIndex: 'female', 
                      key: 'female',
                      render: (value, record) => (
                        <span>
                          {value} ({record.total > 0 ? Math.round((value / record.total) * 100) : 0}%)
                        </span>
                      )
                    }
                  ]}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>

            <Col span={12}>
              <Card title="Department Statistics">
                <Table
                  dataSource={analyticsData.departmentComparison}
                  columns={[
                    { title: 'Department', dataIndex: 'department', key: 'department' },
                    { title: 'Total', dataIndex: 'total', key: 'total', sorter: (a, b) => a.total - b.total },
                    { title: 'Trainers', dataIndex: 'trainers', key: 'trainers' },
                    { title: 'Admins', dataIndex: 'admins', key: 'admins' },
                    { title: 'Avg Age', dataIndex: 'avgAge', key: 'avgAge', render: (age) => `${age} yrs` }
                  ]}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          </Row>

          {viewMode === 'overall' && analyticsData.collegeComparison.length > 0 && (
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card title="College Comparison Report">
                  <Table
                    dataSource={analyticsData.collegeComparison}
                    columns={[
                      { title: 'College', dataIndex: 'college', key: 'college', width: 200 },
                      { title: 'Total', dataIndex: 'total', key: 'total', sorter: (a, b) => a.total - b.total },
                      { title: 'Trainers', dataIndex: 'trainers', key: 'trainers' },
                      { title: 'Admins', dataIndex: 'admins', key: 'admins' },
                      { title: 'Male', dataIndex: 'male', key: 'male' },
                      { title: 'Female', dataIndex: 'female', key: 'female' },
                      { title: 'Departments', dataIndex: 'departmentCount', key: 'departmentCount' }
                    ]}
                    pagination={false}
                    size="small"
                    scroll={{ x: 800 }}
                  />
                </Card>
              </Col>
            </Row>
          )}
        </Tabs.TabPane>

        {/* Employee List Tab */}
        <Tabs.TabPane 
          tab={
            <span>
              <TeamOutlined />
              Employee List ({statistics.total})
            </span>
          } 
          key="employees"
        >
          <Card
            title={`Employee List - ${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View`}
            extra={
              <Space>
                <Input.Search
                  placeholder="Search employees..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 200 }}
                />
                <Checkbox
                  checked={includeInactive}
                  onChange={(e) => setIncludeInactive(e.target.checked)}
                >
                  Include Inactive
                </Checkbox>
              </Space>
            }
          >
            <Table
              dataSource={applyFilters(
                viewMode === 'overall' ? allEmployees :
                viewMode === 'college' && selectedCollege ? 
                  allEmployees.filter(emp => emp.college_name === colleges.find(c => c.college_id === selectedCollege)?.college_name) :
                viewMode === 'department' && selectedCollege && selectedDepartment ?
                  allEmployees.filter(emp => 
                    emp.college_name === colleges.find(c => c.college_id === selectedCollege)?.college_name &&
                    emp.department_name === selectedDepartment
                  ) : []
              )}
              columns={columns}
              rowKey="employee_id"
              loading={loading}
              scroll={{ x: 1200 }}
              pagination={{ 
                pageSize: 15,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} employees`
              }}
              size="small"
            />
          </Card>
        </Tabs.TabPane>
      </Tabs>

      {/* Export Report Modal */}
      <Modal
        title="Export Report"
        open={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        onOk={() => {
          handleAdvancedDownloadReport('comprehensive', reportFormat);
          setReportModalVisible(false);
        }}
        width={500}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Report Format:</Text>
            <Radio.Group
              value={reportFormat}
              onChange={(e) => setReportFormat(e.target.value)}
              style={{ marginLeft: 16 }}
            >
              <Radio value="csv">CSV</Radio>
              <Radio value="excel">Excel</Radio>
              <Radio value="pdf">PDF</Radio>
            </Radio.Group>
          </div>

          <Alert
            message="Export Information"
            description={`This will export ${statistics.total} employees from the current ${viewMode} view in ${reportFormat.toUpperCase()} format.`}
            type="info"
            showIcon
          />
        </Space>
      </Modal>

      {/* Employee Details Drawer */}
      <Drawer
        title={
          <Space>
            <InfoCircleOutlined />
            Employee Details: {selectedEmployee?.full_name}
          </Space>
        }
        width={800}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ paddingBottom: 80 }}
      >
        {renderEmployeeDetails()}
      </Drawer>
    </div>
  );
};

export default EmployeeReports;
import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  UserOutlined,
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  CalendarOutlined,
  SettingOutlined,
  SolutionOutlined,
  IdcardOutlined,
  MoneyCollectOutlined,
  RiseOutlined,
  ReadOutlined,
  SwapOutlined,
  UserDeleteOutlined,
  LineChartOutlined,
  WarningOutlined,
  InboxOutlined,
  BankOutlined,
  ExperimentOutlined,
  DatabaseOutlined,
  UserAddOutlined,
  ApartmentOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../Auth/AuthContext';

// Define menu item type
type MenuItem = {
  key: string;
  icon: React.ReactNode;
  label: string;
  children?: MenuItem[];
};

const { Sider } = Layout;
const { Title } = Typography;

interface SidebarProps {
  collapsed: boolean;
  onMenuClick: (key: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onMenuClick }) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get user role ID
  const userRoleId = user?.role_id ? Number(user.role_id) : null;

  // Grouped menu items by functionality
  const getMenuItems = (): MenuItem[] => {
    const items: MenuItem[] = [];

    // Analytics & Dashboard (always visible)
    items.push({
      key: 'hr-dashboard',
      icon: <DashboardOutlined />, 
      label: 'HR Dashboard',
    });

    // Core HR
    const coreHR: MenuItem[] = [
      { key: 'employee', icon: <IdcardOutlined />, label: 'Employee Profiles' },
      { key: 'enhanced-employee-profile', icon: <UserOutlined />, label: 'Enhanced Employee Profile' },
      { key: 'department-management', icon: <ApartmentOutlined />, label: 'Department Management' },
      { key: 'role-management', icon: <SafetyOutlined />, label: 'Role Management' },
      { key: 'enhanced-employee-registration', icon: <UserAddOutlined />, label: 'Enhanced Employee Registration' },
      { key: 'attendance', icon: <CalendarOutlined />, label: 'Attendance' },
      { key: 'leave', icon: <FileTextOutlined />, label: 'Leave Management' },
      { key: 'payroll', icon: <MoneyCollectOutlined />, label: 'Payroll' },
    ];

    // Talent Management
    const talent: MenuItem[] = [
      { key: 'recruitment', icon: <TeamOutlined />, label: 'Recruitment' },
      { key: 'onboarding', icon: <UserOutlined />, label: 'Onboarding' },
      { key: 'training', icon: <ReadOutlined />, label: 'Training' },
      { key: 'performance', icon: <LineChartOutlined />, label: 'Performance' },
      { key: 'promotion', icon: <SwapOutlined />, label: 'Promotion/Transfer' },
    ];

    // Employee Lifecycle
    const lifecycle: MenuItem[] = [
      { key: 'disciplinary', icon: <WarningOutlined />, label: 'Disciplinary' },
      { key: 'resignation', icon: <UserDeleteOutlined />, label: 'Resignation/Termination' },
      { key: 'archival', icon: <InboxOutlined />, label: 'Archival/Ex-Employee' },
    ];

    // --- Role 3: Only allow specific menus ---
    if (userRoleId === 3) {
      items.push(
        {
          key: 'core-hr',
          icon: <SolutionOutlined />,
          label: 'Core HR',
          children: [
            { key: 'employees', icon: <IdcardOutlined />, label: 'My Profiles' },
            { key: 'attendances', icon: <CalendarOutlined />, label: 'My Attendances' },
            { key: 'leaves', icon: <FileTextOutlined />, label: 'My Leaves' },
          ],
        },
        {
          key: 'talent',
          icon: <RiseOutlined />,
          label: 'Training',
          children: [
            { key: 'trainings', icon: <ReadOutlined />, label: 'My Trainings' },
          ],
        },
        {
          key: 'lifecycle',
          icon: <UserDeleteOutlined />,
          label: 'Employee Lifecycle',
          children: [
            { key: 'disciplinarys', icon: <WarningOutlined />, label: 'My Disciplinarys' },
            { key: 'resignations', icon: <UserDeleteOutlined />, label: 'My Resignations' },
          ],
        }
      );
      return items;
    }

    // Only show HRMS modules for roles 1,2,3
    if (userRoleId && [1, 2, 3].includes(userRoleId)) {
      items.push(
        {
          key: 'core-hr',
          icon: <SolutionOutlined />,
          label: 'Core HR',
          children: coreHR,
        },
        {
          key: 'talent',
          icon: <RiseOutlined />,
          label: 'Talent Management',
          children: talent,
        },
        {
          key: 'lifecycle',
          icon: <UserDeleteOutlined />,
          label: 'Employee Lifecycle',
          children: lifecycle,
        }
      );
    }

    // Employees - only for admin (1)
    if (userRoleId === 1) {
      items.push({
        key: 'employees',
        icon: <UserOutlined />,
        label: 'Employees',
      });
      // Add Menu Access Control for admin
      items.push({
        key: 'menu-access',
        icon: <SettingOutlined />,
        label: 'Menu Access Control',
      });
    }

    // Settings - only for admin (1)
    if (userRoleId === 1) {
      items.push({
        key: 'settings',
        icon: <SettingOutlined />,
        label: 'Settings',
      });
    }

    return items;
  };

  const menuItems = getMenuItems();

  const handleMenuClick = ({ key }: { key: string }) => {
    onMenuClick(key);
    switch (key) {
      case 'hr-dashboard':
        navigate('/hrms/dashboard');
        break;
      case 'recruitment':
        navigate('/hrms/recruitment');
        break;
      case 'onboarding':
        navigate('/hrms/onboarding');
        break;
      case 'employee':
        navigate('/hrms/employee');
        break;
      case 'enhanced-employee-profile':
        navigate('/hrms/employee/enhanced');
        break;
      case 'department-management':
        navigate('/hrms/employee/departments');
        break;
      case 'role-management':
        navigate('/hrms/employee/roles');
        break;
      case 'enhanced-employee-registration':
        navigate('/enhanced-employee-registration');
        break;
      case 'attendance':
        navigate('/hrms/attendance');
        break;
      case 'leave':
        navigate('/hrms/leave');
        break;
      case 'payroll':
        navigate('/hrms/payroll');
        break;
      case 'performance':
        navigate('/hrms/performance');
        break;
      case 'training':
        navigate('/hrms/training');
        break;
      case 'promotion':
        navigate('/hrms/promotion');
        break;
      case 'disciplinary':
        navigate('/hrms/disciplinary');
        break;
      case 'resignation':
        navigate('/hrms/resignation');
        break;
      case 'archival':
        navigate('/hrms/archival');
        break;
      case 'employees':
        navigate('/hrms/employees');
        break;
      case 'attendances':
        navigate('/hrms/attendances');
        break;
      case 'leaves':
        navigate('/hrms/leaves');
        break;
      case 'trainings':
        navigate('/hrms/trainings');
        break;
      case 'disciplinarys':
        navigate('/hrms/disciplinarys');
        break;
      case 'resignations':
        navigate('/hrms/resignations');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'menu-access':
        navigate('/admin/menu-access');
        break;
      default:
        navigate('/hrms/dashboard');
    }
  };

  // Determine selected key based on current location
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/hrms/dashboard') return 'hr-dashboard';
    if (path === '/hrms/recruitment') return 'recruitment';
    if (path === '/hrms/onboarding') return 'onboarding';
    if (path === '/hrms/employee') return 'employee';
    if (path === '/hrms/employee/enhanced') return 'enhanced-employee-profile';
    if (path === '/hrms/employee/departments') return 'department-management';
    if (path === '/hrms/employee/roles') return 'role-management';
    if (path === '/enhanced-employee-registration') return 'enhanced-employee-registration';
    if (path === '/hrms/attendance') return 'attendance';
    if (path === '/hrms/leave') return 'leave';
    if (path === '/hrms/payroll') return 'payroll';
    if (path === '/hrms/performance') return 'performance';
    if (path === '/hrms/training') return 'training';
    if (path === '/hrms/promotion') return 'promotion';
    if (path === '/hrms/disciplinary') return 'disciplinary';
    if (path === '/hrms/resignation') return 'resignation';
    if (path === '/hrms/archival') return 'archival';
    if (path === '/employees') return 'employees';
    if (path === '/settings') return 'settings';
    if (path === '/hrms/employees') return 'employees';
    if (path === '/hrms/attendances') return 'attendances';
    if (path === '/hrms/leaves') return 'leaves';
    if (path === '/hrms/trainings') return 'trainings';
    if (path === '/hrms/disciplinarys') return 'disciplinarys';
    if (path === '/hrms/resignations') return 'resignations';
    return 'hr-dashboard';
  };

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      theme={isDarkMode ? 'dark' : 'light'}
    >
      <div style={{ 
        height: 64, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderBottom: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`
      }}>
        <Title 
          level={collapsed ? 4 : 3} 
          style={{ 
            margin: 0, 
            color: '#1890ff',
            fontSize: collapsed ? '16px' : '20px'
          }}
        >
          {collapsed ? 'HR' : 'HR System'}
        </Title>
      </div>
      <Menu
        theme={isDarkMode ? 'dark' : 'light'}
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
};

export default Sidebar;
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Spin } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import * as Icons from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../Auth/AuthContext';
import axios from 'axios';

const { Sider } = Layout;
const { Title } = Typography;

interface MenuItem {
  id: number;
  name: string;
  label: string;
  icon?: string;
  path?: string;
  parent_id?: number;
  sort_order: number;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  children: MenuItem[];
}

interface DynamicSidebarProps {
  collapsed: boolean;
  onMenuClick: (key: string) => void;
}

const DynamicSidebar: React.FC<DynamicSidebarProps> = ({ collapsed, onMenuClick }) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserMenu = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
      const response = await axios.get(`${API_BASE_URL}/api/menu/user-menu/${user?.user_id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Ensure response.data is an array
      const menuData = Array.isArray(response.data) ? response.data : [];
      console.log('Fetched menu data:', menuData);
      setMenuItems(menuData);
    } catch (error) {
      console.error('Error fetching user menu:', error);
      // Fallback to default menu if API fails
      const fallbackMenu = [
        {
          id: 1,
          name: 'hr-dashboard',
          label: 'HR Dashboard',
          icon: 'DashboardOutlined',
          path: '/hrms/dashboard',
          parent_id: undefined,
          sort_order: 1,
          can_view: true,
          can_create: false,
          can_edit: false,
          can_delete: false,
          children: []
        }
      ];
      setMenuItems(fallbackMenu);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.user_id) {
      fetchUserMenu();
    } else {
      // If no user, set loading to false and show fallback menu
      setLoading(false);
    }
  }, [user?.user_id]);

  // Listen for menu updates from MenuManagement
  useEffect(() => {
    const handleMenuUpdate = () => {
      if (user?.user_id) {
        console.log('Menu update event received, refreshing menu...');
        fetchUserMenu();
      }
    };

    window.addEventListener('menuUpdated', handleMenuUpdate);
    return () => {
      window.removeEventListener('menuUpdated', handleMenuUpdate);
    };
  }, [user?.user_id]);

  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? React.createElement(IconComponent) : null;
  };

  const convertToAntdMenuItems = (items: MenuItem[]): any[] => {
    // Ensure items is an array
    if (!Array.isArray(items)) {
      console.warn('convertToAntdMenuItems received non-array:', items);
      return [];
    }

    return items.map(item => {
      const menuItem: any = {
        key: item.name,
        icon: getIcon(item.icon),
        label: item.label,
      };

      if (item.children && Array.isArray(item.children) && item.children.length > 0) {
        menuItem.children = convertToAntdMenuItems(item.children);
      }

      return menuItem;
    });
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    onMenuClick(key);
    
    // Find the menu item to get its path
    const findMenuItem = (items: MenuItem[], targetKey: string): MenuItem | null => {
      for (const item of items) {
        if (item.name === targetKey) {
          return item;
        }
        if (item.children) {
          const found = findMenuItem(item.children, targetKey);
          if (found) return found;
        }
      }
      return null;
    };

    const menuItem = findMenuItem(menuItems, key);
    if (menuItem?.path) {
      navigate(menuItem.path);
    } else {
      // Fallback navigation for items without paths
      switch (key) {
        case 'hr-dashboard':
          navigate('/hrms/dashboard');
          break;
        case 'settings':
          navigate('/settings');
          break;
        case 'menu-access':
          navigate('/admin/menu-access');
          break;
        case 'menu-management':
          navigate('/admin/menu-management');
          break;
        default:
          navigate('/hrms/dashboard');
      }
    }
  };

  const getSelectedKey = () => {
    const path = location.pathname;
    
    // Find menu item by path
    const findByPath = (items: MenuItem[], targetPath: string): string | null => {
      for (const item of items) {
        if (item.path === targetPath) {
          return item.name;
        }
        if (item.children) {
          const found = findByPath(item.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };

    const selectedKey = findByPath(menuItems, path);
    return selectedKey || 'hr-dashboard';
  };

  if (loading) {
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
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      </Sider>
    );
  }

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
        items={convertToAntdMenuItems(menuItems)}
        onClick={handleMenuClick}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
};

export default DynamicSidebar;
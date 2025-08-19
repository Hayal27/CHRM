import { Layout, Button, Avatar, Dropdown, Typography, Tag } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../Auth/AuthContext';
import { useNavigate } from 'react-router-dom';

// Role names mapping
const getRoleName = (roleId: number): string => {
  const roleNames: { [key: number]: string } = {
    1: 'Administrator',
    2: 'HR Manager',
    3: 'Employee ',
    4: 'Employee',
    5: 'Deputy Manager',
    6: 'Agent',
    7: 'Casher',
    8: 'Other'
  };
  return roleNames[roleId] || 'Unknown Role';
};
import ThemeToggle from '../shared/ThemeToggle';


const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed, onCollapse }) => {
  const { isDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  return (
    <AntHeader 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        // zIndex: 1000,
        padding: '0 24px', 
        background: isDarkMode ? '#001529' : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button
          type="text"
          icon={collapsed ? '☰' : '✕'}
          onClick={() => onCollapse(!collapsed)}
          style={{
            fontSize: '16px',
            width: 64,
            height: 64,
          }}
        />
        {/* Logo and system name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: 8 }}>
          {/* <img
            src="/assets/img/logo/ITP.png"
            alt="Wing Logo"
            style={{ height: 40, marginBottom: 2 }}
          />
         */}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <ThemeToggle />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <Text style={{ color: isDarkMode ? '#fff' : '#666', fontSize: '14px' }}>
            Welcome, {user?.name || 'Admin'}
          </Text>
          {user?.role_id && (
            <Tag 
              color="blue" 
              style={{ marginTop: '2px', fontSize: '11px' }}
            >
              {getRoleName(Number(user.role_id))}
            </Tag>
          )}
        </div>
<Dropdown
  menu={{
    items: [
      { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
      { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Logout' }
    ],
    onClick: handleUserMenuClick
  }}
  placement="bottomRight"
  trigger={["click"]}
  getPopupContainer={() => document.body}
>
  <Button
    type="text"
    style={{ padding: 0, background: 'none', border: 'none', boxShadow: 'none' }}
    icon={
      <Avatar
        style={{ backgroundColor: 'red', cursor: 'pointer' }}
        icon={<UserOutlined />}
      />
    }
  />
</Dropdown>
      </div>
    </AntHeader>
  );
};

export default Header;

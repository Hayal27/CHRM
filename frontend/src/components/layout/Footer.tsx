import React from 'react';
import { Layout, Typography, Space, Divider } from 'antd';
import { HeartOutlined, GithubOutlined, LinkedinOutlined } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

const Footer: React.FC = () => {
  const { isDarkMode } = useTheme();

  const currentYear = new Date().getFullYear();

  return (
    <AntFooter 
      style={{ 
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        height: 64,
        textAlign: 'center',
        background: isDarkMode ? '#001529' : '#f0f2f5',
        borderTop: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
        padding: '16px 24px'
      }}
    >
      <Space direction="vertical" size="small">
        <div>
          <Text style={{ color: isDarkMode ? '#ccc' : '#666' }}>
            HR  Managment System © {currentYear} Made with{' '}
            <HeartOutlined style={{ color: '#ff4d4f' }} /> Wing technology
          </Text>
        </div>
        
        <Divider style={{ margin: '8px 0', borderColor: isDarkMode ? '#303030' : '#f0f0f0' }} />
        
        <Space size="large">
          <Link 
            href="https://github.com/hayal27" 
            target="_blank"
            style={{ color: isDarkMode ? '#1890ff' : '#1890ff' }}
          >
            <GithubOutlined /> GitHub
          </Link>
          <Link 
            href="https://linkedin.com/in/hayal-tamrat" 
            target="_blank"
            style={{ color: isDarkMode ? '#1890ff' : '#1890ff' }}
          >
            <LinkedinOutlined /> LinkedIn
          </Link>
          <Text style={{ color: isDarkMode ? '#ccc' : '#666' }}>
            Version 1.0.0
          </Text>
        </Space>
        
        <Text style={{ fontSize: '12px', color: isDarkMode ? '#999' : '#999' }}>
          Built with React, TypeScript, and Ant Design
        </Text>
      </Space>
    </AntFooter>
  );
};

export default Footer; 
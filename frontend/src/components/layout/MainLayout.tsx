import React, { useState } from 'react';
import { Layout } from 'antd';
import { useTheme } from '../../contexts/ThemeContext';
import Header from './Header';
import DynamicSidebar from './DynamicSidebar';
import Footer from './Footer';
import { useAuth } from '../Auth/AuthContext';

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { isDarkMode } = useTheme();
  const {  } = useAuth();
  
  const handleMenuClick = (key: string) => {
    // Menu click is now handled in the Sidebar component
    console.log('Menu clicked:', key);
  };

  const handleCollapse = (collapsed: boolean) => {
    setCollapsed(collapsed);
  };

  // Height calculations for fixed header/footer (64px each)
  const headerHeight = 64;
  const footerHeight = 64;

  return (
    <Layout style={{ minHeight: '100vh', flexDirection: 'row' }}>
      {/* Sidebar: fixed height, scrollable */}
      <div style={{
        height: `calc(100vh - ${footerHeight}px)`,
        position: 'fixed',
        top: headerHeight,
        left: 0,
        bottom: footerHeight,
        overflowY: 'auto',
        width: collapsed ? 80 : 220,
        transition: 'width 0.2s',
        background: isDarkMode ? '#001529' : '#fff',
        borderRight: `1px solid ${isDarkMode ? '#303030' : '#f0f0f0'}`,
      }}>
        <DynamicSidebar 
          collapsed={collapsed}
          onMenuClick={handleMenuClick}
        />
      </div>
      
      {/* Main content area: margin-left for sidebar, scrollable content */}
      <Layout style={{
        marginLeft: collapsed ? 80 : 220,
        minHeight: '100vh',
        background: isDarkMode ? '#141414' : 'white',
        transition: 'margin-left 0.2s',
      }}>
        <Header 
          collapsed={collapsed}
          onCollapse={handleCollapse}
        />
        <div style={{
          marginTop: headerHeight,
          marginBottom: footerHeight,
          overflowY: 'auto',
          padding: 4,
        }}>
          <Content style={{
            // background: isDarkMode ? '#141414' : '#fff',
            borderRadius: 8,
            minHeight: 280,
            height: '100%',
          }}>
            {children}
          </Content>
        </div>
        <Footer />
      </Layout>
    </Layout>
  );
};

export default MainLayout;
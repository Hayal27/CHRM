import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDarkMode ? '#141414' : '#f0f2f5'
    }}>
      <Result
        status="403"
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={[
          <Button 
            type="primary" 
            key="dashboard"
            onClick={() => navigate('/')}
            style={{ marginRight: 8 }}
          >
            Go to Dashboard
          </Button>,
          <Button 
            key="back"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        ]}
      />
    </div>
  );
};

export default UnauthorizedPage; 
import React from 'react';
import { Spin } from 'antd';
import { useTheme } from '../../contexts/ThemeContext';

interface LoadingSpinnerProps {
  size?: 'small' | 'default' | 'large';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'large', 
  text = 'Loading...' 
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: isDarkMode ? '#141414' : '#f0f2f5',
      color: isDarkMode ? '#fff' : '#000'
    }}>
      <Spin size={size} />
      <div style={{ 
        marginTop: '16px', 
        fontSize: '16px',
        color: isDarkMode ? '#ccc' : '#666'
      }}>
        {text}
      </div>
    </div>
  );
};

export default LoadingSpinner; 
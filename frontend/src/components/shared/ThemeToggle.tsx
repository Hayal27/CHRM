import React from 'react';
import { Switch, Tooltip } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  size?: 'small' | 'default';
  showTooltip?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  size = 'default', 
  showTooltip = true 
}) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const toggle = (
    <Switch
      size={size}
      checked={isDarkMode}
      onChange={toggleTheme}
      checkedChildren={<BulbFilled />}
      unCheckedChildren={<BulbOutlined />}
    />
  );

  if (showTooltip) {
    return (
      <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
        {toggle}
      </Tooltip>
    );
  }

  return toggle;
};

export default ThemeToggle; 
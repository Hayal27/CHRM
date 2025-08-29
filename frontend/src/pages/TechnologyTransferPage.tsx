import React, { useState, useEffect } from 'react';
import { Typography, Spin, message, Alert } from 'antd';
import { BankOutlined } from '@ant-design/icons';
import TechnologyTransferModule from '../components/education-office/TechnologyTransferModule';
import axios from 'axios';

const { Title } = Typography;

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

interface College {
  college_id: number;
  college_name: string;
  college_code: string;
  location?: string;
  college_type?: string;
  status?: string;
  employee_count?: number;
  trainer_count?: number;
  admin_count?: number;
}

const TechnologyTransferPage: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCollegesFromDatabase();
  }, []);

  const fetchCollegesFromDatabase = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(`${API_BASE_URL}/api/education-office/admin/colleges`, config);
      
      if (response.data.success) {
        setColleges(response.data.colleges);
        console.log(`✅ Loaded ${response.data.colleges.length} colleges from database`);
      } else {
        throw new Error(response.data.message || 'Failed to fetch colleges');
      }
    } catch (error: any) {
      console.error('❌ Error fetching colleges from database:', error);
      
      let errorMessage = 'Failed to load colleges from database';
      
      if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please login again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to view colleges.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchCollegesFromDatabase();
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Title level={3}>Loading Technology Transfer Management</Title>
          <p>Fetching colleges from database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Database Connection Error"
          description={
            <div>
              <p>{error}</p>
              <p>
                <strong>Possible solutions:</strong>
              </p>
              <ul>
                <li>Check if the backend server is running</li>
                <li>Verify database connection</li>
                <li>Ensure you are logged in with proper permissions</li>
                <li>Check if the colleges table exists in the database</li>
              </ul>
            </div>
          }
          type="error"
          showIcon
          action={
            <button 
              onClick={handleRetry}
              style={{
                background: '#ff4d4f',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <BankOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Technology Transfer Management
        </Title>
        <p>
          Complete management system for transferred manufacturing/service technologies
          {colleges.length > 0 && (
            <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
              {' '}• {colleges.length} colleges loaded from database
            </span>
          )}
        </p>
        
        {colleges.length === 0 && (
          <Alert
            message="No Colleges Found"
            description="No colleges are available in the database. Please add colleges first before managing technology transfers."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
      </div>
      
      <TechnologyTransferModule colleges={colleges} />
    </div>
  );
};

export default TechnologyTransferPage;
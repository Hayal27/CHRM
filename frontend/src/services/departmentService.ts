import axios from 'axios';

const API_BASE = '/api/departments';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Department {
  id: number;
  name: string;
  description: string;
  manager_id?: number;
  manager_name?: string;
  employee_count: number;
  created_at: string;
}

export const departmentService = {
  getDepartments: (params?: any) => axios.get(API_BASE, { params, headers: getAuthHeaders() }),
  createDepartment: (data: Partial<Department>) => axios.post(API_BASE, data, { headers: getAuthHeaders() }),
  updateDepartment: (id: number, data: Partial<Department>) => axios.put(`${API_BASE}/${id}`, data, { headers: getAuthHeaders() }),
  deleteDepartment: (id: number) => axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeaders() }),
  getDepartment: (id: number) => axios.get(`${API_BASE}/${id}`, { headers: getAuthHeaders() }),
  
  // Get employees in a department
  getDepartmentEmployees: (departmentId: number) => 
    axios.get(`${API_BASE}/${departmentId}/employees`, { headers: getAuthHeaders() }),
    
  // Assign manager to department
  assignManager: (departmentId: number, managerId: number) => 
    axios.post(`${API_BASE}/${departmentId}/manager`, { manager_id: managerId }, { headers: getAuthHeaders() }),
};

export default departmentService; 
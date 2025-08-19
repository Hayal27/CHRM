import axios from 'axios';

const API_BASE = '/api/employees';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface EmployeeParams { [key: string]: any; }
export interface EmployeeData { [key: string]: any; }

export const employeeService = {
  getEmployees: (params: EmployeeParams): Promise<any> => axios.get(`${API_BASE}`, { params, headers: getAuthHeaders() }),
  createEmployee: (data: EmployeeData): Promise<any> => axios.post(`${API_BASE}`, data, { headers: getAuthHeaders() }),
  updateEmployee: (id: number, data: EmployeeData): Promise<any> => axios.put(`${API_BASE}/${id}`, data, { headers: getAuthHeaders() }),
  deleteEmployee: (id: number): Promise<any> => axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeaders() }),
};
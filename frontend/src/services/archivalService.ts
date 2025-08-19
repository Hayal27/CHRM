import axios from 'axios';

const API_BASE = '/api/archival';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface ExEmployeeParams { [key: string]: any; }
export interface ExEmployeeData { [key: string]: any; }

export const archivalService = {
  getExEmployees: (params: ExEmployeeParams): Promise<any> => axios.get(`${API_BASE}`, { params, headers: getAuthHeaders() }),
  createExEmployee: (data: ExEmployeeData): Promise<any> => axios.post(`${API_BASE}`, data, { headers: getAuthHeaders() }),
  updateExEmployee: (id: number, data: ExEmployeeData): Promise<any> => axios.put(`${API_BASE}/${id}`, data, { headers: getAuthHeaders() }),
  deleteExEmployee: (id: number): Promise<any> => axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeaders() }),
};
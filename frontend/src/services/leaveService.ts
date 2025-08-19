import axios from 'axios';

const API_BASE = '/api/leave';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface LeaveParams { [key: string]: any; }
export interface LeaveData { [key: string]: any; }

export const leaveService = {
  getLeaves: (params: LeaveParams): Promise<any> => axios.get(`${API_BASE}`, { params, headers: getAuthHeaders() }),
  createLeave: (data: LeaveData): Promise<any> => axios.post(`${API_BASE}`, data, { headers: getAuthHeaders() }),
  updateLeave: (id: number, data: LeaveData): Promise<any> => axios.put(`${API_BASE}/${id}`, data, { headers: getAuthHeaders() }),
  deleteLeave: (id: number): Promise<any> => axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeaders() }),
};
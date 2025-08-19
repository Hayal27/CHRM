import axios from 'axios';

const API_BASE = '/api/resignation';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface ResignationParams { [key: string]: any; }
export interface ResignationData { [key: string]: any; }

export const resignationService = {
  getResignations: (params: ResignationParams): Promise<any> => axios.get(`${API_BASE}`, { params, headers: getAuthHeaders() }),
  createResignation: (data: ResignationData): Promise<any> => axios.post(`${API_BASE}`, data, { headers: getAuthHeaders() }),
  updateResignation: (id: number, data: ResignationData): Promise<any> => axios.put(`${API_BASE}/${id}`, data, { headers: getAuthHeaders() }),
  deleteResignation: (id: number): Promise<any> => axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeaders() }),
};
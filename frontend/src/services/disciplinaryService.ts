import axios from 'axios';

const API_BASE = '/api/disciplinary';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface DisciplinaryParams { [key: string]: any; }
export interface DisciplinaryData { [key: string]: any; }

export const disciplinaryService = {
  getActions: (params: DisciplinaryParams): Promise<any> => axios.get(`${API_BASE}`, { params, headers: getAuthHeaders() }),
  createAction: (data: DisciplinaryData): Promise<any> => axios.post(`${API_BASE}`, data, { headers: getAuthHeaders() }),
  updateAction: (id: number, data: DisciplinaryData): Promise<any> => axios.put(`${API_BASE}/${id}`, data, { headers: getAuthHeaders() }),
  deleteAction: (id: number): Promise<any> => axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeaders() }),
};
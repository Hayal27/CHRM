import axios from 'axios';

const API_BASE = '/api/training';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface TrainingParams { [key: string]: any; }
export interface TrainingData { [key: string]: any; }

export const trainingService = {
  getTrainings: (params: TrainingParams): Promise<any> => axios.get(`${API_BASE}`, { params, headers: getAuthHeaders() }),
  createTraining: (data: TrainingData): Promise<any> => axios.post(`${API_BASE}`, data, { headers: getAuthHeaders() }),
  updateTraining: (id: number, data: TrainingData): Promise<any> => axios.put(`${API_BASE}/${id}`, data, { headers: getAuthHeaders() }),
  deleteTraining: (id: number): Promise<any> => axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeaders() }),
};
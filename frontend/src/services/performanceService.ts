import axios from 'axios';

const API_BASE = '/api/performance';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface PerformanceParams { [key: string]: any; }
export interface PerformanceData { [key: string]: any; }

export const performanceService = {
  getReviews: (params: PerformanceParams): Promise<any> => axios.get(`${API_BASE}`, { params, headers: getAuthHeaders() }),
  createReview: (data: PerformanceData): Promise<any> => axios.post(`${API_BASE}`, data, { headers: getAuthHeaders() }),
  updateReview: (id: number, data: PerformanceData): Promise<any> => axios.put(`${API_BASE}/${id}`, data, { headers: getAuthHeaders() }),
  deleteReview: (id: number): Promise<any> => axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeaders() }),
};
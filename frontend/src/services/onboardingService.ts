import axios from 'axios';

const API_BASE = '/api/onboarding';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface OnboardingParams { [key: string]: any; }
export interface OnboardingData { [key: string]: any; }

export const onboardingService = {
  getNewHires: (params: OnboardingParams): Promise<any> => axios.get(`${API_BASE}`, { params, headers: getAuthHeaders() }),
  createNewHire: (data: OnboardingData): Promise<any> => axios.post(`${API_BASE}`, data, { headers: getAuthHeaders() }),
  updateNewHire: (id: number, data: OnboardingData): Promise<any> => axios.put(`${API_BASE}/${id}`, data, { headers: getAuthHeaders() }),
  deleteNewHire: (id: number): Promise<any> => axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeaders() }),
};
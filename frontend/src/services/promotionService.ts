import axios from 'axios';

const API_BASE = '/api/promotion';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface PromotionParams { [key: string]: any; }
export interface PromotionData { [key: string]: any; }

export const promotionService = {
  getPromotions: (params: PromotionParams): Promise<any> => axios.get(`${API_BASE}`, { params, headers: getAuthHeaders() }),
  createPromotion: (data: PromotionData): Promise<any> => axios.post(`${API_BASE}`, data, { headers: getAuthHeaders() }),
  updatePromotion: (id: number, data: PromotionData): Promise<any> => axios.put(`${API_BASE}/${id}`, data, { headers: getAuthHeaders() }),
  deletePromotion: (id: number): Promise<any> => axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeaders() }),
};
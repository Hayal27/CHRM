import axios from 'axios';

const API_BASE = '/api/attendance';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface AttendanceParams { [key: string]: any; }
export interface AttendanceData { [key: string]: any; }

export const attendanceService = {
  getAttendance: (params: AttendanceParams): Promise<any> => axios.get(`${API_BASE}`, { params, headers: getAuthHeaders() }),
  createAttendance: (data: AttendanceData): Promise<any> => axios.post(`${API_BASE}`, data, { headers: getAuthHeaders() }),
  updateAttendance: (id: number, data: AttendanceData): Promise<any> => axios.put(`${API_BASE}/${id}`, data, { headers: getAuthHeaders() }),
  deleteAttendance: (id: number): Promise<any> => axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeaders() }),
};
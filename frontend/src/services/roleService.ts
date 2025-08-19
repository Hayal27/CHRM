import axios from 'axios';

const API_BASE = '/api/roles';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  user_count: number;
  is_system_role: boolean;
  created_at: string;
}

export const roleService = {
  getRoles: (params?: any) => axios.get(API_BASE, { params, headers: getAuthHeaders() }),
  createRole: (data: Partial<Role>) => axios.post(API_BASE, data, { headers: getAuthHeaders() }),
  updateRole: (id: number, data: Partial<Role>) => axios.put(`${API_BASE}/${id}`, data, { headers: getAuthHeaders() }),
  deleteRole: (id: number) => axios.delete(`${API_BASE}/${id}`, { headers: getAuthHeaders() }),
  getRole: (id: number) => axios.get(`${API_BASE}/${id}`, { headers: getAuthHeaders() }),
  
  // Get users with a specific role
  getRoleUsers: (roleId: number) => 
    axios.get(`${API_BASE}/${roleId}/users`, { headers: getAuthHeaders() }),
    
  // Get all permissions
  getPermissions: () => 
    axios.get(`${API_BASE}/permissions`, { headers: getAuthHeaders() }),
    
  // Assign role to user
  assignRoleToUser: (userId: number, roleId: number) => 
    axios.post(`/api/users/${userId}/role`, { role_id: roleId }, { headers: getAuthHeaders() }),
};

export default roleService; 
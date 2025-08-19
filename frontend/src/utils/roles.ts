// Role IDs
export const ROLES = {
  ADMIN: 1,
  MANAGER: 2,
  SUPERVISOR: 3,
  EMPLOYEE: 4,
} as const;

// Role names for display
export const ROLE_NAMES = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.SUPERVISOR]: 'Supervisor',
  [ROLES.EMPLOYEE]: 'Employee',
} as const;

// Role-based permissions
export const PERMISSIONS = {
  // Admin permissions (role_id: 1)
  [ROLES.ADMIN]: {
    canAccessRecruitment: true,
    canManageVacancies: true,
    canViewApplications: true,
    canScheduleInterviews: true,
    canViewAnalytics: true,
    canManageEmployees: true,
    canAccessSettings: true,
    canManageUsers: true,
    canViewAllData: true,
  },
  
  // Manager permissions (role_id: 2)
  [ROLES.MANAGER]: {
    canAccessRecruitment: true,
    canManageVacancies: true,
    canViewApplications: true,
    canScheduleInterviews: true,
    canViewAnalytics: true,
    canManageEmployees: false,
    canAccessSettings: false,
    canManageUsers: false,
    canViewAllData: false,
  },
  
  // Supervisor permissions (role_id: 3)
  [ROLES.SUPERVISOR]: {
    canAccessRecruitment: true,
    canManageVacancies: false,
    canViewApplications: true,
    canScheduleInterviews: true,
    canViewAnalytics: false,
    canManageEmployees: false,
    canAccessSettings: false,
    canManageUsers: false,
    canViewAllData: false,
  },
  
  // Employee permissions (role_id: 4)
  [ROLES.EMPLOYEE]: {
    canAccessRecruitment: false,
    canManageVacancies: false,
    canViewApplications: false,
    canScheduleInterviews: false,
    canViewAnalytics: false,
    canManageEmployees: false,
    canAccessSettings: false,
    canManageUsers: false,
    canViewAllData: false,
  },
} as const;

// Helper function to check if user has permission
export const hasPermission = (userRoleId: number, permission: keyof typeof PERMISSIONS[1]): boolean => {
  const rolePermissions = PERMISSIONS[userRoleId as keyof typeof PERMISSIONS];
  return rolePermissions ? rolePermissions[permission] : false;
};

// Helper function to get role name
export const getRoleName = (roleId: number): string => {
  return ROLE_NAMES[roleId as keyof typeof ROLE_NAMES] || 'Unknown Role';
};

// Helper function to check if user is admin
export const isAdmin = (roleId: number): boolean => {
  return roleId === ROLES.ADMIN;
};

// Helper function to check if user is manager or higher
export const isManagerOrHigher = (roleId: number): boolean => {
  return roleId <= ROLES.MANAGER;
};

// Helper function to check if user is supervisor or higher
export const isSupervisorOrHigher = (roleId: number): boolean => {
  return roleId <= ROLES.SUPERVISOR;
}; 
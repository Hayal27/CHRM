// MenuAccessControl.ts
// Toggle menu access for each role (admin, HrAdmin, Employee)

export type RoleKey = 'admin' | 'hrAdmin' | 'employee';
export type MenuKey =
  | 'hr-dashboard'
  | 'employee'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'recruitment'
  | 'onboarding'
  | 'training'
  | 'performance'
  | 'promotion'
  | 'disciplinary'
  | 'resignation'
  | 'archival'
  | 'employees'
  | 'settings';

export const menuAccess: Record<RoleKey, Partial<Record<MenuKey, boolean>>> = {
  admin: {
    'hr-dashboard': true,
    employee: true,
    attendance: true,
    leave: true,
    payroll: true,
    recruitment: true,
    onboarding: true,
    training: true,
    performance: true,
    promotion: true,
    disciplinary: true,
    resignation: true,
    archival: true,
    employees: true,
    settings: true,
  },
  hrAdmin: {
    'hr-dashboard': true,
    employee: true,
    attendance: true,
    leave: true,
    payroll: true,
    recruitment: true,
    onboarding: true,
    training: true,
    performance: true,
    promotion: true,
    disciplinary: true,
    resignation: true,
    archival: true,
    employees: false,
    settings: false,
  },
  employee: {
    'hr-dashboard': true,
    employee: true,
    attendance: true,
    leave: true,
    payroll: false,
    recruitment: false,
    onboarding: false,
    training: true,
    performance: false,
    promotion: false,
    disciplinary: true,
    resignation: true,
    archival: false,
    employees: false,
    settings: false,
  },
};

// Usage example:
// menuAccess['admin']['settings'] === true // allowed
// menuAccess['employee']['payroll'] === false // not allowed

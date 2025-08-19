import React from 'react';
import { Card, Switch, Table } from 'antd';
import { menuAccess, RoleKey, MenuKey } from '../admin/MenuAccessControl';

const roles: RoleKey[] = ['admin', 'hrAdmin', 'employee'];
const menuKeys: MenuKey[] = [
  'hr-dashboard', 'employee', 'attendance', 'leave', 'payroll', 'recruitment', 'onboarding', 'training', 'performance', 'promotion', 'disciplinary', 'resignation', 'archival', 'employees', 'settings',
];

// Dummy state for toggling (replace with backend integration as needed)
const getInitialAccess = () => JSON.parse(JSON.stringify(menuAccess));

const MenuAccessControlPage: React.FC = () => {
  const [access, setAccess] = React.useState(getInitialAccess());

  const handleToggle = (role: RoleKey, menu: MenuKey) => {
    setAccess((prev: any) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [menu]: !prev[role][menu],
      },
    }));
  };

  return (
    <Card title="Menu Access Control" style={{ margin: 24 }}>
      <Table
        dataSource={menuKeys.map((menu) => ({ key: menu, menu }))}
        columns={[
          { title: 'Menu', dataIndex: 'menu', key: 'menu' },
          ...roles.map((role) => ({
            title: role,
            key: role,
            render: (_: any, record: any) => (
              <Switch
                checked={!!access[role][record.menu]}
                onChange={() => handleToggle(role, record.menu)}
              />
            ),
          })),
        ]}
        pagination={false}
      />
    </Card>
  );
};

export default MenuAccessControlPage;

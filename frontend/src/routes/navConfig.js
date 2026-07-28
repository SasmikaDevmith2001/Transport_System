/**
 * Central nav definition. Each item can declare required permission(s);
 * DashboardLayout filters this list based on the current user so the
 * sidebar reflects role-based access.
 */
export const navConfig = [
  { label: 'Dashboard', path: '/', icon: 'Dashboard' },
  { label: 'Users', path: '/users', icon: 'People', permission: 'users:read' },
];

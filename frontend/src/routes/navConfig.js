/**
 * Central nav definition. Each item can declare required permission(s);
 * DashboardLayout filters this list based on the current user so the
 * sidebar reflects role-based access.
 */
export const navConfig = [
  { label: 'Dashboard', path: '/', icon: 'Dashboard' },
  { label: 'Trips', path: '/trips', icon: 'LocalShipping', permission: 'trips:read' },
  { label: 'Customers', path: '/customers', icon: 'Business', permission: 'customers:read' },
  { label: 'Drivers', path: '/drivers', icon: 'Badge', permission: 'drivers:read' },
  { label: 'Users', path: '/users', icon: 'People', permission: 'users:read' },
];

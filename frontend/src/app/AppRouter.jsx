import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../routes/ProtectedRoute';
import LoginPage from '../features/auth/pages/LoginPage';
import UnauthorizedPage from '../features/auth/pages/UnauthorizedPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import UsersListPage from '../features/users/pages/UsersListPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />

          <Route element={<ProtectedRoute permissions={['users:read']} />}>
            <Route path="/users" element={<UsersListPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

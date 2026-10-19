// src/components/ProtectedRoute.jsx - route guard for /admin.
// Not logged in -> /login. Logged in but not admin -> home page.
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function ProtectedRoute({ children, adminOnly = true }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default ProtectedRoute;

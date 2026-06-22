import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';
import { toast } from 'react-hot-toast';

/**
 * Role-Based Access Control route guard
 * @param {Array} allowedRoles - List of authorized roles (e.g. ['admin', 'teacher'])
 */
const RoleGuard = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <Loader fullPage={true} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    // Redirect to home/respective default page if unauthorized
    toast.error("Unauthorized access to this section.");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleGuard;

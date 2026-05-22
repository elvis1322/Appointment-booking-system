import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  
    allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (allowedRoles?.length) {
        const hasRole = user?.roles.some((role) => allowedRoles.includes(role));
        if (!hasRole) return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;

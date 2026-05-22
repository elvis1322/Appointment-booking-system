import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const GuestRoute = () => {
    const { user, isAuthenticated } = useAuth();

    if (isAuthenticated && user) {
        const isAdmin = user.roles.includes('Admin');
        return <Navigate to={isAdmin ? '/admin/users' : '/profile'} replace />;
    }

    return <Outlet />;
};

export default GuestRoute;

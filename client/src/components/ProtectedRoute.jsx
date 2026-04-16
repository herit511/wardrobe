import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { token, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', inset: 0, background: '#FFF5EC', zIndex: 9999 }}>
                <div style={{ color: '#E87040', fontStyle: 'italic', fontSize: '1.2rem' }}>Loading Wardrobe...</div>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;

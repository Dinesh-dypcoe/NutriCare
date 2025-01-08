import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
    const location = useLocation();
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    console.log('Protected Route Check:', { token, userRole, requiredRole: role });

    if (!token) {
        // Redirect to login if not authenticated
        console.log('No token found, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (role && role !== userRole) {
        // Redirect to appropriate dashboard if role doesn't match
        console.log('Role mismatch, redirecting to appropriate dashboard');
        switch (userRole) {
            case 'manager':
                return <Navigate to="/manager/dashboard" replace />;
            case 'pantry':
                return <Navigate to="/pantry/dashboard" replace />;
            case 'delivery':
                return <Navigate to="/delivery/dashboard" replace />;
            default:
                return <Navigate to="/login" replace />;
        }
    }

    return children;
};

export default ProtectedRoute; 
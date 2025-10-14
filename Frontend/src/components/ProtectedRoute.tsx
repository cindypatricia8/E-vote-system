import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const ProtectedRoute: React.FC = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    // If a user IS logged in, show the protected page
    if (user) {
        return <Outlet />;
    }

    // If no user is logged in, redirect them to the login page
    return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
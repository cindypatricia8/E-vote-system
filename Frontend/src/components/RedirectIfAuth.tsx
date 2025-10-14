import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const RedirectIfAuth: React.FC = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>; 
    }

    // If a user IS logged in, redirect them to their dashboard
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    // If no user is logged in, show the child component (e.g., Login or SignUp page)
    return <Outlet />;
};

export default RedirectIfAuth;
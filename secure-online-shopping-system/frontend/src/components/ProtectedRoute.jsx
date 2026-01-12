import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
    const { currentUser, userRole, loading } = useAuth();

    if (loading) {
        return <div className="p-4 text-center">Loading...</div>; // Simple loading state
    }

    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    if (adminOnly && userRole !== 'admin') {
        return <Navigate to="/" />; // Or to an unauthorized page
    }

    return children;
}

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white"><p>Loading...</p></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (profile && allowedRoles && !allowedRoles.includes(profile.role)) {
    // If user is logged in but doesn't have the required role,
    // redirect them to a generic page or their respective dashboard
    return <Navigate to={profile.role === 'candidate' ? '/candidate/dashboard' : profile.role === 'recruiter' ? '/recruiter/dashboard' : '/'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
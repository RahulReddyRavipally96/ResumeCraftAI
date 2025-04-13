import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Login from './Login';

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // If still loading auth state, show nothing
  if (loading) return null;
  
  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Otherwise show login page
  return <Login />;
};

export default Index;

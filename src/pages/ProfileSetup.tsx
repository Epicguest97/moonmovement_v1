import React from 'react';
import ProfileSetupForm from '@/components/profile/ProfileSetupForm';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ProfileSetup = () => {
  const { user, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <ProfileSetupForm />;
};

export default ProfileSetup;
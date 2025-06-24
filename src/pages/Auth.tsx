import React, { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

const Auth = () => {
  const [showLogin, setShowLogin] = useState(true);

  const toggleForm = () => {
    setShowLogin(!showLogin);
  };

  return (
    <>
      {showLogin ? (
        <LoginForm onSwitchToSignup={toggleForm} />
      ) : (
        <SignupForm onSwitchToLogin={toggleForm} />
      )}
    </>
  );
};

export default Auth;

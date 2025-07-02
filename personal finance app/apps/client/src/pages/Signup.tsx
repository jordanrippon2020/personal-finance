import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { SignupForm } from '../components/auth/SignupForm';

export const Signup: React.FC = () => {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking your budget with smart insights"
    >
      <SignupForm />
    </AuthLayout>
  );
};
import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';

export const ForgotPassword: React.FC = () => {
  return (
    <AuthLayout
      title="Reset Password"
      subtitle="We'll help you get back into your account"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
};
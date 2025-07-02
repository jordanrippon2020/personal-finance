import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { resetPasswordSchema, type ResetPasswordFormData } from '../../lib/validations';
import { formatAuthError } from '../../lib/utils';

export const ForgotPasswordForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const { error } = await resetPassword(data.email);
      
      if (error) {
        toast.error(formatAuthError(error));
      } else {
        setIsSubmitted(true);
        toast.success('Password reset email sent!');
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Check your email</h3>
          <p className="text-gray-400">
            We've sent a password reset link to your email address. 
            Click the link in the email to reset your password.
          </p>
        </div>
        
        <div className="text-sm text-gray-400">
          <p>Didn't receive the email? Check your spam folder or</p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="text-primary-400 hover:text-primary-300 underline"
          >
            try again
          </button>
        </div>
        
        <Link
          to="/login"
          className="inline-flex items-center text-primary-400 hover:text-primary-300 
                   transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to sign in
        </Link>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Forgot your password?</h3>
        <p className="text-gray-400 text-sm">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            {...register('email')}
            type="email"
            id="email"
            autoComplete="email"
            className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white 
                     placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                     transition-colors duration-200"
            placeholder="Enter your email"
          />
        </div>
        {errors.email && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-400"
          >
            {errors.email.message}
          </motion.p>
        )}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center py-3 px-4 border border-transparent 
                 rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 
                 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed 
                 transition-colors duration-200"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          'Send reset link'
        )}
      </motion.button>

      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-gray-400 hover:text-gray-300 
                   transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to sign in
        </Link>
      </div>
    </form>
  );
};
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AuthError } from '@supabase/supabase-js';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAuthError(error: AuthError | null): string {
  if (!error) return '';
  
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Invalid email or password. Please try again.';
    case 'Email not confirmed':
      return 'Please check your email and click the confirmation link.';
    case 'Too many requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'User already registered':
      return 'An account with this email already exists.';
    case 'Weak password':
      return 'Password is too weak. Please choose a stronger password.';
    case 'Email rate limit exceeded':
      return 'Too many emails sent. Please wait before requesting another.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
}

export function getInitials(email: string): string {
  return email.split('@')[0].slice(0, 2).toUpperCase();
}
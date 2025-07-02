# Authentication System

This document describes the authentication system implementation for the Budget Tracker application.

## Overview

The authentication system is built with:
- **Supabase** for backend authentication
- **React Context API** for state management
- **React Hook Form** + **Zod** for form validation
- **Tailwind CSS** for styling
- **Framer Motion** for animations

## Components

### Core Components

1. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Manages authentication state globally
   - Provides sign up, sign in, sign out, and password reset functions
   - Handles session management and user state

2. **ProtectedRoute** (`src/components/auth/ProtectedRoute.tsx`)
   - Wrapper component for protected pages
   - Redirects unauthenticated users to login
   - Shows loading state during authentication checks

### UI Components

1. **AuthLayout** (`src/components/auth/AuthLayout.tsx`)
   - Consistent layout for all authentication pages
   - Dark theme with purple accent color
   - Animated welcome message and branding

2. **LoginForm** (`src/components/auth/LoginForm.tsx`)
   - Email/password login form
   - Form validation with Zod schema
   - Loading states and error handling
   - "Remember me" and "Forgot password" links

3. **SignupForm** (`src/components/auth/SignupForm.tsx`)
   - User registration form
   - Password strength indicator
   - Password confirmation validation
   - Terms of service checkbox

4. **ForgotPasswordForm** (`src/components/auth/ForgotPasswordForm.tsx`)
   - Password reset request form
   - Success state with instructions
   - Email validation

### Pages

1. **Login** (`src/pages/Login.tsx`)
2. **Signup** (`src/pages/Signup.tsx`)
3. **ForgotPassword** (`src/pages/ForgotPassword.tsx`)
4. **Dashboard** (`src/pages/Dashboard.tsx`) - Protected demo page

## Configuration

### Environment Variables

Create a `.env` file in the client directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup

The Supabase client is configured in `src/lib/supabase.ts` with:
- Auto token refresh
- Session persistence
- URL session detection

## Validation Schemas

Form validation is handled by Zod schemas in `src/lib/validations.ts`:

- **loginSchema**: Email and password validation
- **signupSchema**: Email, password, and confirmation validation with strength requirements
- **resetPasswordSchema**: Email validation for password reset

## Error Handling

- User-friendly error messages via `formatAuthError` utility
- Toast notifications for success/error states
- Form field validation with real-time feedback

## Features

- ✅ Email/password authentication
- ✅ User registration with email verification
- ✅ Password reset functionality
- ✅ Protected routes
- ✅ Session persistence
- ✅ Mobile-first responsive design
- ✅ Dark theme with purple accent
- ✅ Smooth animations
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications

## Usage

The authentication system is automatically initialized in `App.tsx`. Users are redirected to appropriate pages based on their authentication status:

- Unauthenticated users → Login page
- Authenticated users → Dashboard
- Protected routes → Require authentication

## Type Safety

All components are built with TypeScript and use shared types from `@budget-tracker/shared-types` for consistency across the application.
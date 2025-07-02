# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
**Automated Budget Tracker** - A web application that automatically categorizes and tracks expenses with minimal user intervention using AI-powered categorization. The core philosophy is maximum automation - users should set it up once and never need to manually maintain it.

## Current State
✅ **Project Foundation Complete**
- Monorepo structure set up with pnpm workspaces
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Express + TypeScript + Supabase integration
- Shared types package for cross-stack type safety
- Database schema with RLS policies
- AI service integration with OpenAI

## Technology Stack
### Frontend (`apps/client/`)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (fast development experience)
- **Styling**: Tailwind CSS with dark mode + custom purple theme
- **State Management**: React Query/TanStack Query (for API state)
- **Animations**: Framer Motion (smooth user feedback)
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation
- **UI Components**: Lucide React icons, custom components

### Backend (`apps/server/`)
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with middleware
- **Database**: Supabase (PostgreSQL + built-in auth)
- **AI Integration**: OpenAI API (GPT-3.5-turbo)
- **Security**: Helmet, CORS, rate limiting, RLS
- **Validation**: Zod schemas
- **Logging**: Winston

### Shared (`packages/shared-types/`)
- **Types**: Database models, API interfaces, utilities
- **Build**: tsup for dual CJS/ESM builds
- **Utils**: Currency formatting, validation helpers

### Development Tools
- **Package Manager**: pnpm with workspaces
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Testing**: Vitest (configured but not implemented yet)

## Project Structure
```
├── apps/
│   ├── client/                 # React frontend
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── pages/          # Route components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── services/       # API client functions
│   │   │   └── utils/          # Frontend utilities
│   │   ├── public/             # Static assets
│   │   └── index.html          # Entry point
│   │
│   └── server/                 # Express backend
│       ├── src/
│       │   ├── routes/         # API route handlers
│       │   ├── middleware/     # Auth, error handling
│       │   ├── services/       # Business logic (AI, etc.)
│       │   └── utils/          # Backend utilities
│       └── logs/               # Application logs
│
├── packages/
│   └── shared-types/           # Shared TypeScript definitions
│       └── src/
│           ├── database.ts     # DB model types
│           ├── api.ts          # API request/response types
│           └── utils.ts        # Shared utility functions
│
├── supabase/
│   └── migrations/             # Database schema migrations
│
└── Root configuration files
```

## Key Features Implementation Status

### ✅ Phase 1: Foundation (COMPLETE)
1. **Project Setup**
   - Monorepo with pnpm workspaces
   - TypeScript configuration across all packages
   - ESLint, Prettier, and development tooling

2. **Database Schema**
   - `transactions` table with RLS policies
   - `category_rules` table for learning system  
   - `user_settings` table for preferences
   - Optimized indexes and triggers

3. **Backend API**
   - Authentication middleware with Supabase
   - Transaction CRUD endpoints
   - AI categorization service
   - Learning system for merchant rules
   - Dashboard insights endpoint

4. **AI Integration**
   - OpenAI GPT-3.5-turbo for categorization
   - Fallback categorization system
   - Confidence scoring
   - Cost optimization through rule caching

### 🚧 Phase 2: Frontend Implementation (NEXT)
1. **Authentication Flow**
   - Login/signup components
   - Protected routes
   - User context management

2. **Transaction Management**
   - Add transaction form
   - Transaction list with pagination
   - Category correction interface
   - Mobile-first responsive design

3. **Dashboard**
   - Spending overview cards
   - Category breakdown charts
   - Insights and anomaly alerts

### 📋 Phase 3: Advanced Features (PLANNED)
1. **CSV Import**
   - File upload with parsing
   - Bulk categorization
   - Import progress tracking

2. **Enhanced Analytics**
   - Spending trends over time
   - Category comparisons
   - Export functionality

## Database Schema
### Main Tables
- **transactions**: Core transaction data with AI confidence scores
- **category_rules**: Learning system for merchant→category mappings
- **user_settings**: User preferences and configuration

### Key Features
- Row Level Security (RLS) for data isolation
- Optimized indexes for performance
- Automatic timestamp updates
- Analytics view for reporting

## API Endpoints
```
Authentication: Bearer token in Authorization header

GET    /api/transactions              # List with pagination
POST   /api/transactions              # Create new transaction
PUT    /api/transactions/:id          # Update transaction
DELETE /api/transactions/:id          # Delete transaction
POST   /api/transactions/categorize   # Get AI categorization
POST   /api/transactions/bulk-import  # CSV import (planned)

GET    /api/insights/dashboard        # Dashboard data
```

## Commands
```bash
# Development
pnpm dev              # Start both frontend (5173) and backend (3001)
pnpm dev:client       # Start frontend only
pnpm dev:server       # Start backend only

# Building
pnpm build            # Build all packages
pnpm build:client     # Build frontend for production
pnpm build:server     # Build backend for production

# Testing
pnpm test             # Run all tests
pnpm test:coverage    # Generate coverage report

# Database
pnpm db:migrate       # Run Supabase migrations
pnpm db:seed          # Seed with demo data
pnpm db:reset         # Reset database to clean state

# Code Quality
pnpm lint             # Run ESLint across all packages
pnpm format           # Run Prettier across all packages
pnpm typecheck        # Run TypeScript compiler checks
```

## Environment Setup
1. Copy `.env.example` to `.env`
2. Set up Supabase project and get credentials
3. Get OpenAI API key
4. Run `pnpm install` to install dependencies
5. Run database migration: `pnpm db:migrate`
6. Start development: `pnpm dev`

## Development Guidelines
### Financial Data Handling
- **Always use integer cents** for monetary values (no floating point)
- Validate amounts with `validateAmount()` utility
- Format currency with `formatCurrency()` utility
- Use Zod schemas for API validation

### UI/UX Principles
- **Mobile-first design** with large touch targets
- **One-tap interactions** wherever possible
- **Optimistic updates** for immediate feedback
- **Dark mode default** with purple accent (#8B5CF6)
- **Smooth animations** using Framer Motion

### AI Integration
- **Confidence-based decisions**: Use rules over AI when confidence > 0.8
- **Cost optimization**: Cache merchant rules to reduce API calls
- **Fallback system**: Keyword-based categorization when AI fails
- **Learning system**: Update rules based on user corrections

### Security
- **RLS policies** enforce data isolation
- **Input validation** with Zod on all endpoints
- **Rate limiting** to prevent abuse
- **No sensitive data** in logs or client-side code

## Troubleshooting
### Common Issues
1. **pnpm not found**: Use `npx pnpm` instead of global installation
2. **Supabase connection errors**: Check environment variables
3. **OpenAI API errors**: Verify API key and rate limits
4. **Build errors**: Check TypeScript types in shared package

### Performance Optimization
- Use React Query for intelligent caching
- Implement infinite scroll for large transaction lists
- Optimize database queries with proper indexes
- Monitor AI API usage and costs

## Next Steps for Development
1. **Implement authentication components** in client
2. **Create transaction form** with real-time AI categorization
3. **Build transaction list** with infinite scroll
4. **Add dashboard charts** using a charting library
5. **Implement CSV import** functionality
6. **Add unit tests** for critical business logic
7. **Performance testing** with larger datasets

## File Location Quick Reference
- **Database schema**: `supabase/migrations/001_initial_schema.sql`
- **API routes**: `apps/server/src/routes/`
- **Shared types**: `packages/shared-types/src/`
- **AI service**: `apps/server/src/services/aiService.ts`
- **Environment**: `.env.example` (copy to `.env`)
- **Styling**: `apps/client/src/index.css` (Tailwind config)
# Automated Budget Tracker

A web application that automatically categorizes and tracks expenses with minimal user intervention using AI-powered categorization.

## 🎯 Core Philosophy

**Maximum Automation** - Users should set it up once and never need to manually maintain it. The app learns from user behavior and gets smarter over time.

## ✨ Features

- **AI-Powered Categorization**: Automatic expense categorization using OpenAI
- **Learning System**: Remembers user corrections and improves over time
- **Zero-Maintenance Dashboard**: Auto-updating insights and spending breakdowns
- **CSV Import**: Bulk transaction import with smart parsing
- **Anomaly Detection**: Identifies unusual spending patterns
- **Mobile-First Design**: Optimized for touch interactions

## 🛠 Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Framer Motion for animations
- React Query for state management
- React Router v6 for navigation

### Backend
- Node.js with TypeScript
- Express.js framework
- Supabase (PostgreSQL + Auth)
- OpenAI API for categorization

### Development
- pnpm for package management
- ESLint + Prettier for code quality
- Monorepo structure with shared types

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Supabase account
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase and OpenAI credentials.

4. Set up the database:
   - Create a new Supabase project
   - Run the migration: `pnpm db:migrate`

5. Start the development servers:
   ```bash
   pnpm dev
   ```

This will start both the frontend (port 5173) and backend (port 3001) servers.

## 📁 Project Structure

```
├── apps/
│   ├── client/          # React frontend
│   └── server/          # Express backend
├── packages/
│   └── shared-types/    # Shared TypeScript definitions
├── supabase/
│   └── migrations/      # Database schema
└── docs/               # Documentation
```

## 🎛 Available Scripts

```bash
# Development
pnpm dev              # Start both frontend and backend
pnpm dev:client       # Start frontend only
pnpm dev:server       # Start backend only

# Building
pnpm build            # Build all packages
pnpm build:client     # Build frontend
pnpm build:server     # Build backend

# Testing & Quality
pnpm test             # Run tests
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier
pnpm typecheck        # TypeScript type checking

# Database
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed with sample data
pnpm db:reset         # Reset database
```

## 📊 Database Schema

### Core Tables
- `transactions`: User transactions with AI categorization
- `category_rules`: Learning system for merchant→category mappings
- `user_settings`: User preferences and configuration

### Security
- Row Level Security (RLS) enabled
- Users can only access their own data
- Secure API authentication via Supabase

## 🤖 AI Categorization

The app uses OpenAI's GPT-3.5-turbo to automatically categorize transactions based on:
- Merchant name
- Transaction amount
- Optional description

### Learning System
- Remembers user corrections
- Builds merchant→category rules
- Reduces AI API calls over time
- Improves accuracy through usage

## 🎨 UI/UX Principles

- **Mobile-First**: All interactions designed for touch
- **One-Tap Actions**: Minimal clicks for common tasks
- **Optimistic Updates**: Immediate UI feedback
- **Dark Mode Default**: Reduces eye strain
- **Smooth Animations**: All transitions use Framer Motion

## 🔒 Security

- Secure authentication via Supabase
- Row-level security on all tables
- API rate limiting
- Input validation with Zod
- No sensitive data in logs

## 📈 Roadmap

### Phase 1 (Current)
- [x] Project setup and architecture
- [x] Basic transaction management
- [x] AI categorization
- [x] Learning system
- [ ] Dashboard and insights

### Phase 2
- [ ] CSV import functionality
- [ ] Advanced analytics
- [ ] Mobile PWA features
- [ ] Notification system

### Phase 3 (Future)
- [ ] Bank API integration
- [ ] Automated transaction sync
- [ ] Budget planning tools
- [ ] Multi-currency support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Setup and Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Initialize database
npm run db:migrate
npm run db:seed
```

### Common Development Tasks
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report

# Code quality
npm run lint            # Run ESLint
npm run lint:fix        # Auto-fix linting issues
npm run type-check      # TypeScript type checking
npm run format          # Format code with Prettier

# Database operations
npm run db:migrate      # Run migrations
npm run db:migrate:dev  # Create migration from schema changes
npm run db:seed         # Seed database
npm run db:reset        # Reset and reseed database
npm run db:studio       # Open Prisma Studio GUI
```

## Architecture Overview

### Core Technologies
- **Frontend**: Next.js 14 (App Router) with React 18 and TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Node.js API routes with Prisma ORM
- **Database**: PostgreSQL with Redis caching
- **Authentication**: NextAuth.js with JWT tokens
- **State Management**: React Query for server state, Zustand for client state

### Project Structure

```
src/
├── app/                 # Next.js App Router pages and layouts
│   ├── api/            # API routes
│   ├── (auth)/         # Authentication pages
│   ├── dashboard/      # Main application pages
│   └── layout.tsx      # Root layout
├── components/         # Reusable React components
│   ├── ui/            # Base UI components (buttons, inputs, etc.)
│   ├── charts/        # Data visualization components
│   ├── forms/         # Form components with validation
│   └── layouts/       # Layout components
├── lib/               # Core utilities and libraries
│   ├── api/          # API client functions
│   ├── auth/         # Authentication utilities
│   ├── db/           # Database utilities
│   └── utils/        # General utilities
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
└── services/          # External service integrations
    ├── plaid/        # Bank connection service
    └── email/        # Email notification service
```

### Key Design Patterns

1. **API Routes**: All API endpoints follow RESTful conventions in `src/app/api/`
2. **Database Access**: Use Prisma client through service layers, never directly in components
3. **Authentication**: Protected routes use middleware in `middleware.ts`
4. **Error Handling**: Centralized error handling with custom error classes
5. **Data Fetching**: React Query for all data fetching with proper error boundaries

### Database Schema

The application uses Prisma ORM with PostgreSQL. Key models include:
- `User`: User accounts and profiles
- `Account`: Bank/financial accounts linked via Plaid
- `Transaction`: Financial transactions with categories
- `Budget`: Monthly budgets with category allocations
- `Goal`: Financial goals with progress tracking
- `Bill`: Recurring bills and subscriptions

### API Integration Points

1. **Plaid API**: Bank account linking and transaction sync
   - Configuration in `services/plaid/`
   - Webhook handling in `api/webhooks/plaid/`

2. **Authentication**: NextAuth.js configuration
   - Provider setup in `lib/auth/`
   - Session management via JWT

3. **Email Service**: Transactional emails
   - Templates in `services/email/templates/`
   - Queue processing for notifications

### Testing Strategy

- **Unit Tests**: Jest for utilities and hooks
- **Component Tests**: React Testing Library
- **API Tests**: Supertest for API routes
- **E2E Tests**: Playwright for critical user flows

Run specific test suites:
```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Environment Variables

Required environment variables (see `.env.example`):
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `NEXTAUTH_SECRET`: Authentication secret
- `PLAID_CLIENT_ID`: Plaid API credentials
- `PLAID_SECRET`: Plaid API secret
- `NEXT_PUBLIC_APP_URL`: Application URL

### Performance Considerations

1. **Database Queries**: Use Prisma's `include` and `select` to minimize queries
2. **Caching**: Redis caching for frequently accessed data
3. **Image Optimization**: Next.js Image component for all images
4. **Code Splitting**: Dynamic imports for large components
5. **API Response**: Pagination for large data sets

### Security Best Practices

1. **Input Validation**: Zod schemas for all user inputs
2. **SQL Injection**: Prisma parameterized queries
3. **XSS Protection**: React's built-in escaping
4. **CSRF**: NextAuth.js CSRF tokens
5. **Rate Limiting**: API route rate limiting with Redis
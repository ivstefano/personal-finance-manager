# Personal Finance Manager

A modern, comprehensive personal finance management application that helps you track spending, manage budgets, and achieve your financial goals with confidence.

## Features

### Budget Management
- **Smart Budgeting**: Create flexible monthly budgets with customizable categories
- **Real-time Tracking**: Monitor spending as it happens with automatic transaction categorization
- **Budget Insights**: Get alerts when approaching budget limits and suggestions for optimization
- **Rollover Support**: Carry over unused budget amounts to the next month

### Transaction Tracking
- **Bank Sync**: Securely connect all your bank accounts and credit cards
- **Automatic Categorization**: AI-powered transaction categorization with learning capabilities
- **Manual Entry**: Add cash transactions and off-platform expenses
- **Receipt Scanning**: Capture and attach receipts to transactions

### Financial Goals
- **Goal Setting**: Set and track short-term and long-term financial goals
- **Progress Visualization**: Visual progress bars and milestone celebrations
- **Savings Plans**: Automated savings recommendations based on spending patterns
- **Goal Categories**: Emergency fund, vacation, debt payoff, retirement, and custom goals

### Reports & Analytics
- **Spending Analysis**: Detailed breakdowns by category, merchant, and time period
- **Income vs Expenses**: Clear visualization of cash flow trends
- **Custom Reports**: Build personalized reports with drag-and-drop widgets
- **Export Options**: Download reports in PDF, CSV, or Excel formats

### Bill Management
- **Bill Calendar**: Never miss a payment with visual bill timeline
- **Recurring Transactions**: Automatic tracking of subscriptions and regular payments
- **Payment Reminders**: Customizable notifications for upcoming bills
- **Bill Analysis**: Identify opportunities to reduce recurring expenses

### Investment Tracking
- **Portfolio Overview**: Track investment accounts and performance
- **Net Worth Calculation**: Automatic calculation including assets and liabilities
- **Investment Goals**: Set and monitor investment targets
- **Market Updates**: Real-time market data integration

## Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Next.js 14** for server-side rendering and optimal performance
- **Tailwind CSS** for responsive, modern UI design
- **Recharts** for interactive data visualizations
- **React Query** for efficient data fetching and caching

### Backend
- **Node.js** with Express.js for API development
- **PostgreSQL** for reliable data storage
- **Redis** for caching and session management
- **Prisma ORM** for type-safe database queries

### Security & Integration
- **Plaid API** for secure bank connections
- **OAuth 2.0** for authentication
- **JWT** for secure session management
- **AES-256** encryption for sensitive data

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL 14+
- Redis 6+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/personal-finance-manager.git
cd personal-finance-manager
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the database:
```bash
npm run db:migrate
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
personal-finance-manager/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/        # React components
│   ├── lib/              # Utility functions and libraries
│   ├── api/              # API routes
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   └── styles/           # Global styles
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── tests/                # Test files
└── config/               # Configuration files
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact our support team at support@example.com
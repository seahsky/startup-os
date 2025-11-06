# Invoicing Web App

A full-featured invoicing system built with Next.js 14, tRPC, and PostgreSQL + FerretDB.

## Features

- **Document Types**: Quotations, Invoices, Credit Notes, Debit Notes
- **PDF Export**: Customizable templates with 3 layouts (Standard, Modern, Minimal)
- **Payment Tracking**: Record payments, partial payments, overdue detection
- **Type-Safe API**: Full TypeScript coverage with tRPC and Zod validation
- **Flexible Database**: MongoDB-style documents on PostgreSQL via FerretDB

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **API**: tRPC with React Query
- **Database**: PostgreSQL + FerretDB (MongoDB API)
- **PDF**: @react-pdf/renderer
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Start the database services:

```bash
npm run docker:up
```

3. Copy environment variables:

```bash
cp .env.example .env
```

4. Seed the database (optional):

```bash
npm run db:seed
```

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
├── server/          # tRPC routers and services
│   ├── db/          # Database connection
│   ├── routers/     # tRPC routers
│   └── services/    # Business logic
├── lib/             # Utilities and types
└── hooks/           # Custom React hooks
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers
- `npm run db:seed` - Seed database with sample data

## Documentation

See the `/docs` folder for detailed documentation on:
- Database schema
- API endpoints
- Component usage
- PDF templates

## License

MIT

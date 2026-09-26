# Talent Organiser Monorepo

Turborepo and pnpm workspaces monorepo containing the Next.js frontend, NestJS backend API, and shared types.

## Monorepo Layout

```text
.
├── apps/
│   ├── web/               # Next.js 15 frontend (@talent/web)
│   └── api/               # NestJS 12 backend (@talent/api)
├── packages/
│   └── types/             # Shared TypeScript types & contracts (@talent/types)
├── package.json           # Monorepo root scripts & dev dependencies
├── pnpm-workspace.yaml    # Workspace definition
└── turbo.json             # Turborepo task pipeline
```

## Getting Started

### Prerequisites
- Node.js >= 20
- pnpm >= 9

### Install Dependencies
```bash
pnpm install
```

### Run Both Apps Concurrently
```bash
pnpm dev
```
- **Next.js Web**: `http://localhost:3000` (or `3001` if port 3000 is occupied)
- **NestJS API**: `http://localhost:3000/api/v1` (Swagger docs at `/docs`)

### Run Individual Apps
```bash
# Run only Next.js frontend
pnpm dev:web

# Run only NestJS backend
pnpm dev:api
```

### Build Everything
```bash
pnpm build
```

### Run Tests & Linting
```bash
# Run tests across all packages
pnpm test

# Run Oxlint across all packages
pnpm lint
```

### Database & Prisma (API)
```bash
# Generate Prisma Client
pnpm prisma:generate

# Run DB Migrations
pnpm prisma:migrate

# Open Prisma Studio
pnpm prisma:studio

# Seed Database
pnpm prisma:seed
```

## Shared Packages
- **`@talent/types`**: Shared interfaces (e.g. `Talent`, `Group`, `Venue`, `Schedule`, `DutySwapRequest`, etc.) imported by both `@talent/web` and `@talent/api`.

# Talent Organizer backend

Application source files were generated with the NestJS CLI. Prisma's schema and configuration are generated with the Prisma CLI. No application implementation was handwritten.

## Run locally

Use Node.js 24.18 or a compatible supported release.

```sh
npm ci
PORT=3001 npm run start:dev
```

Port 3001 keeps this backend separate from the Next.js frontend's default port 3000.

## Generated structure

- REST resources: talents, groups, venues, schedules, duties, inventory, users, roles.
- Each resource includes a module, controller, service, create/update DTOs, entity placeholder, and generated tests.
- Auth: empty module, service, and controller.
- Prisma: empty Nest module and service, plus Prisma's PostgreSQL configuration and schema.

The resource services return generated placeholder strings. DTOs and entities are empty. Authentication, authorization, persistence, database models, migrations, and frontend API integration are not implemented. The generated PrismaService is not yet a Prisma Client wrapper. The app can start without a database.

## Generate more resources

```sh
npx nest generate resource contracts --type rest --crud
```

Nest registers the generated module in AppModule automatically. Other building blocks can be generated separately:

```sh
npx nest generate module notifications
npx nest generate service notifications
npx nest generate controller notifications
```

## Prisma

Prisma CLI, Client, and the PostgreSQL adapter use stable version 7.10.0. The CLI is pinned because npm's latest CLI tag pointed to an 8.0 release candidate during setup.

Initialization command:

```sh
npx prisma init --datasource-provider postgresql --output ../src/generated/prisma
```

This Prisma release generates prisma7.config.ts, which loads DATABASE_URL from .env. Set DATABASE_URL to your PostgreSQL connection string before database operations. The initializer's example URL is not a provisioned database. Do not commit credentials.

```sh
npx prisma validate
npx prisma generate
```

The initialized schema has no application models. Defining models and wiring Prisma into the generated services is the next implementation phase. Only run migrations after models and a development database are configured:

```sh
npx prisma migrate dev --name init
```

## Checks

```sh
npm run build
npm test
npm run test:e2e
npm run lint
```

Generated tests check basic scaffolding, not application workflows. Generated resource stubs produce unused-parameter lint warnings until implemented.

Verified during setup: build, 20 unit tests, one HTTP e2e test, schema validation, and Prisma Client generation passed. Lint completed with 16 unused-parameter warnings and no errors. The HTTP test required local port access outside the execution sandbox.

npm reported nine dependency advisories (two low, one moderate, six high) after installation; dependency remediation is outstanding. Prisma's optional agent-skills download failed in the network-restricted sandbox; Prisma initialization and Client generation succeeded independently.

References: [NestJS CLI](https://docs.nestjs.com/cli/usages), [Prisma with NestJS](https://docs.prisma.io/docs/guides/frameworks/nestjs).

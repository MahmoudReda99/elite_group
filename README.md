# Elite Group

Production-oriented freight forwarding MVP for Elite Group, built with Angular, NestJS, PostgreSQL, Prisma, JWT authentication, role-based dashboards, public schedules, quote/contact intake, and internal shipment tracking.

## Stack

- Angular 20 app in `apps/web`
- NestJS API in `apps/api`
- Prisma ORM with PostgreSQL
- Docker Compose for local development
- JWT authentication with `ADMIN` and `OPERATOR` roles

## Quick Start

1. Copy `.env.example` to `.env` if running outside Docker.
2. Start the full stack:

```powershell
npm run dev
```

The frontend runs on `http://localhost:4200` and the API runs on `http://localhost:3000`.

## Demo Users

Seeded demo accounts use the password `Elite@2026!`.

- Admin: `admin@elitegroup.local`
- Operator: `operator@elitegroup.local`

## Useful Commands

```powershell
npm run db:up
npm run prisma:migrate
npm run prisma:seed
npm run build
npm run test
```

## Future CSV/Excel Import

The v1 schedule board is manual-entry first. Future monthly schedule imports should map CSV/Excel columns into the existing freight service fields: origin/destination country and port, cargo type, container type, vessel, voyage, ETD, ETA, schedule month, valid date range, ocean freight, THC, currency, free time notes, remarks, and publish status.

# Fullstack Restaurant Operations Dashboard

A small full-stack restaurant operations product built for the Odyssey fullstack developer assignment. The project focuses on a contract-first backend, generated frontend API hooks, reusable dashboard UI primitives, and a polished web dashboard experience.

## Stack

- pnpm workspaces
- Turborepo
- Expo, React Native Web, and Expo Router
- Hono on a Cloudflare Workers style runtime
- Neon PostgreSQL
- Drizzle ORM and drizzle-zod
- `@hono/zod-openapi` OpenAPI contracts
- Orval-generated API client and React Query hooks
- Shared UI primitives in `packages/shared`

## Repository Structure

```text
apps/dashboard        Expo dashboard web app
services/backend      Hono backend service
packages/shared       Reusable UI primitives and design tokens
packages/types        Shared constants and types
packages/api-client   Generated Orval client and hooks
docs                  Assignment and project planning notes
```

## Prerequisites

- Node.js compatible with the installed Expo and Wrangler versions
- pnpm 10+
- A PostgreSQL database URL, such as Neon

## Environment Setup

Create a local `.env` file from the example file:

```bash
cp .env.example .env
```

Set the required values:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
AUTH_SECRET=replace-with-a-long-random-secret
EXPO_PUBLIC_API_BASE_URL=http://localhost:8787
```

Local secret files are ignored by git. Do not commit `.env` or `services/backend/.dev.vars`.

## Install

```bash
pnpm install
```

## Database

Generate migrations when schema changes:

```bash
pnpm db:generate
```

Apply migrations:

```bash
pnpm db:migrate
```

Seed demo data:

```bash
pnpm db:seed
```

The seed includes a demo user, menu categories, menu items, customers, orders across statuses, order items, and ordering settings.

## Run Locally

Start the backend:

```bash
pnpm dev:backend
```

Start the dashboard:

```bash
pnpm dev:dashboard
```

Default local URLs:

- Dashboard: `http://localhost:8081`
- Backend: `http://localhost:8787`

## Demo Login

After seeding, use the demo account configured by the seed script:

```text
Email: demo@ody.local
Password: password123
```

## API Contract Generation

The frontend client is generated from the backend OpenAPI contract:

```bash
pnpm gen:contract
```

Do not manually edit generated API files under `packages/api-client/src/generated`.

## Quality Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
```

Current tests include backend service tests for menu, customer, and order flows, plus frontend pure-logic tests for order formatters, opening-hours helpers, and settings dirty-state behavior.

## Architecture Notes

The intended contract flow is:

```text
Drizzle schema -> drizzle-zod / Zod schemas -> Hono OpenAPI routes -> Orval -> generated frontend types and hooks
```

Frontend screens consume generated hooks from `@ody/api-client`. Backend route handlers stay thin and delegate business behavior to service files under `services/backend/src/services`.

Shared UI primitives live in `packages/shared`, including tokens, surfaces, headers, buttons, text fields, search inputs, navigation tabs, segmented buttons, select pills, multi-select filters, toggles, metric cards, status badges, state cards, modal frames, drawer frames, toast cards, a toast provider, and table cells.

## Implemented Product Areas

- Auth login, registration, logout, and current-user session flow
- Home summary dashboard
- Orders list, search, filters, create order flow, detail drawer, valid status actions, and CSV export
- Menu categories, item management, availability, archive behavior, and product details
- CRM customer list, customer detail, recent orders, create/edit flow, and CSV export
- Settings for ordering controls, opening hours, notifications, restaurant profile, and save feedback
- UI Library route showing tokens, typography, spacing, surfaces, reusable components, and component states

## Tradeoffs and Incomplete Areas

- The dashboard targets web first. Native readiness was considered but not optimized deeply.
- Shared primitives are built on React Native primitives to keep the implementation focused and consistent with Expo Web. Unused UI framework dependencies were removed to avoid a misleading stack.
- Global toast feedback is implemented for key create, update, export, save, and error flows. Advanced notification persistence and audit history are out of scope.
- The project does not include OAuth, email verification, password reset, payments, inventory, multi-location management, or advanced permissions.
- Frontend tests cover important pure logic. Full component rendering and browser E2E tests remain future scope.

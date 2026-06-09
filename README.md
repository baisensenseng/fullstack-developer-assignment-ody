<div align="center">
  <img src="./apps/dashboard/assets/sidebar/human.svg" alt="Ody Restaurant Dashboard" width="96" height="96" />

  <h1>Ody Restaurant Operations Dashboard</h1>
  <p>Full-stack restaurant operations dashboard for orders, menu management, CRM, settings, design system review, and contract-first API workflows.</p>

  <p>
    <a href="./docs/fullstack_developer_assignment_ody.md"><strong>Assignment</strong></a>
    ·
    <a href="./docs/development_flow.md"><strong>Development Flow</strong></a>
    ·
    <a href="./docs/technical_decisions.md"><strong>Technical Decisions</strong></a>
    ·
    <a href="./.env.example"><strong>Environment Template</strong></a>
    ·
    <a href="https://ody-dashboard.pages.dev"><strong>Live Demo</strong></a>
  </p>

  <p>
    <img alt="Expo" src="https://img.shields.io/badge/Expo-Web-000020?style=for-the-badge&logo=expo&logoColor=white" />
    <img alt="React Native" src="https://img.shields.io/badge/React_Native-Web-61DAFB?style=for-the-badge&logo=react&logoColor=111111" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
    <img alt="pnpm" src="https://img.shields.io/badge/pnpm-Workspace-F69220?style=for-the-badge&logo=pnpm&logoColor=white" />
  </p>
  <p>
    <img alt="Hono" src="https://img.shields.io/badge/Hono-API-E36002?style=for-the-badge" />
    <img alt="Cloudflare Workers" src="https://img.shields.io/badge/Cloudflare_Workers-Runtime-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" />
    <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
    <img alt="Drizzle" src="https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge" />
  </p>
  <p>
    <img alt="OpenAPI" src="https://img.shields.io/badge/OpenAPI-Generated-6BA539?style=for-the-badge&logo=openapiinitiative&logoColor=white" />
    <img alt="Orval" src="https://img.shields.io/badge/Orval-Client_&_Hooks-111111?style=for-the-badge" />
    <img alt="React Query" src="https://img.shields.io/badge/React_Query-Data_Fetching-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" />
    <img alt="Turborepo" src="https://img.shields.io/badge/Turborepo-Monorepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white" />
  </p>
</div>

## Overview

Ody Restaurant Operations Dashboard is a small full-stack product slice built for the Odyssey fullstack developer assignment. It demonstrates a backend-backed restaurant dashboard with a contract-first API, generated frontend hooks, reusable design system primitives, and realistic daily operations workflows.

The dashboard targets web through Expo and React Native Web. The backend uses Hono with Cloudflare Workers style constraints, PostgreSQL on Neon, Drizzle ORM, drizzle-zod, OpenAPI generation, Orval-generated API clients, and React Query on the frontend.

## Table of Contents

- [Product Scope](#product-scope)
- [Implementation Status](#implementation-status)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Core Modules](#core-modules)
- [API Contract Flow](#api-contract-flow)
- [Environment Variables](#environment-variables)
- [Quick Start](#quick-start)
- [Live Deployment](#live-deployment)
- [Demo Login](#demo-login)
- [Available Scripts](#available-scripts)
- [Validation](#validation)
- [Tradeoffs and Incomplete Areas](#tradeoffs-and-incomplete-areas)
- [Documentation](#documentation)

## Screenshots

### Login

![Login screen](docs/screenshots/login.png)

### Dashboard Home

![Dashboard home](docs/screenshots/home.png)

### Orders Workspace

![Orders workspace](docs/screenshots/orders.png)

### Menu Management

![Menu management](docs/screenshots/menu.png)

### CRM Workspace

![CRM workspace](docs/screenshots/crm.png)

### Settings

![Settings screen](docs/screenshots/settings.png)

### UI Library

![UI library](docs/screenshots/ui-library.png)

## Product Scope

| Area | Capability |
| --- | --- |
| Home | KPI summary, revenue, pending orders, recent orders, popular items, and operating status |
| Orders | Backend-backed order list, search, filters, detail drawer, create order flow, valid status actions, item counts, and CSV export |
| Menu | Categories, item table, prices, descriptions, SKU, prep station, dietary tags, availability, archive behavior, create/edit flows |
| CRM | Customer list, search, spend, order count, customer detail drawer, recent orders, create/edit flow, and CSV export |
| Settings | Service availability, auto-accept, prep time, opening hours editor, notifications, restaurant profile, save/reset feedback |
| Auth | Register, login, logout, current user, protected dashboard routes, hashed password storage |
| UI Library | Tokens, typography, spacing, surfaces, reusable components, component states, dialogs, drawer, toast, and sidebar navigation |
| Feedback | Loading, empty, error, success, warning, disabled, active, focus, hover, and global toast feedback patterns |

## Implementation Status

| Item | Current status |
| --- | --- |
| Dashboard runtime | Expo Web app under `apps/dashboard` |
| Backend runtime | Hono app under `services/backend`, runnable with Wrangler |
| Database | PostgreSQL with Drizzle schema, migrations, and seed data |
| API contract | OpenAPI generated by backend and consumed by Orval |
| Frontend data | Generated React Query hooks from `@ody/api-client` |
| Design system | Shared tokens and primitives under `packages/shared` |
| Tests | Backend service tests and frontend pure-logic tests |
| Documentation | README, assignment source, development flow, and technical decisions |
| Deployment | Local-first assignment delivery; production deployment is not required by the assignment |

## Tech Stack

| Layer | Stack |
| --- | --- |
| Monorepo | pnpm workspaces, Turborepo |
| Dashboard | Expo, React Native Web, Expo Router, React, TypeScript |
| Data fetching | React Query through Orval-generated hooks |
| Shared UI | React Native primitives, lucide-react-native icons, centralized design tokens |
| Backend | Hono, `@hono/zod-openapi`, Cloudflare Workers style runtime |
| Database | Neon PostgreSQL, Drizzle ORM, drizzle-zod |
| Contract | OpenAPI JSON, Orval-generated client and hooks |
| Auth | JWT with hashed password storage |
| Quality gates | TypeScript strict checks, targeted backend tests, frontend logic tests |

## Architecture

```mermaid
flowchart TD
  User["Reviewer / dashboard user"] --> Dashboard["apps/dashboard Expo Web"]
  Dashboard --> SharedUI["packages/shared UI primitives and tokens"]
  Dashboard --> Hooks["packages/api-client generated hooks"]
  Hooks --> API["services/backend Hono OpenAPI routes"]
  API --> Auth["Auth validation"]
  API --> Services["Backend service layer"]
  Services --> Drizzle["Drizzle ORM queries"]
  Drizzle --> DB[("Neon PostgreSQL")]
  Schema["Drizzle schema"] --> Zod["drizzle-zod / Zod schemas"]
  Zod --> OpenAPI["Hono OpenAPI spec"]
  OpenAPI --> Orval["Orval generation"]
  Orval --> Hooks
```

## Project Structure

```text
.
├── README.md                         # Project overview and local setup
├── AGENTS.md                         # Project agent rules and scope constraints
├── docs/
│   ├── fullstack_developer_assignment_ody.md
│   ├── development_flow.md
│   └── technical_decisions.md
├── apps/dashboard/                   # Expo Router dashboard web app
│   ├── app/                          # Route entries
│   ├── assets/                       # Auth and sidebar visual assets
│   └── src/
│       ├── lib/                      # Auth storage and Query provider
│       └── screens/                  # Auth and dashboard screens
├── services/backend/                 # Hono backend service
│   ├── drizzle/                      # Drizzle migrations and snapshots
│   ├── openapi.json                  # Generated OpenAPI contract
│   └── src/
│       ├── db/                       # Database client, schema, seed
│       ├── routes/                   # Hono OpenAPI route registration
│       ├── scripts/                  # Contract generation script
│       └── services/                 # Business logic and backend tests
├── packages/shared/                  # Design tokens and reusable UI primitives
├── packages/types/                   # Shared app-level constants and types
└── packages/api-client/              # Orval-generated API client and hooks
```

## Core Modules

| Module | Entry files | Responsibility |
| --- | --- | --- |
| Backend app | `services/backend/src/app.ts`, `services/backend/src/index.ts` | Hono app creation, route registration, Worker export |
| Database | `services/backend/src/db/schema.ts`, `services/backend/src/db/seed.ts` | Tables, migrations, demo data |
| Auth service | `services/backend/src/routes/auth.ts`, `services/backend/src/services/auth-service.ts` | Register, login, logout, current user, JWT handling |
| Orders | `services/backend/src/routes/orders.ts`, `services/backend/src/services/order-service.ts`, `apps/dashboard/src/screens/dashboard/OrdersScreen.tsx` | Order creation, list, filters, detail, status actions |
| Menu | `services/backend/src/routes/menu.ts`, `services/backend/src/services/menu-service.ts`, `apps/dashboard/src/screens/dashboard/MenuScreen.tsx` | Category and item management |
| CRM | `services/backend/src/routes/customers.ts`, `services/backend/src/services/customer-service.ts`, `apps/dashboard/src/screens/dashboard/CrmScreen.tsx` | Customer list, detail, spend, recent orders |
| Settings | `services/backend/src/routes/settings.ts`, `services/backend/src/services/settings-service.ts`, `apps/dashboard/src/screens/dashboard/SettingsScreen.tsx` | Ordering settings and restaurant profile |
| Home summary | `services/backend/src/routes/summary.ts`, `apps/dashboard/src/screens/dashboard/HomeScreen.tsx` | KPIs, recent orders, popular items, operating status |
| UI Library | `apps/dashboard/src/screens/dashboard/UiLibraryScreen.tsx`, `packages/shared/src/components/*` | Component and token presentation |
| Generated client | `packages/api-client/src/generated/ody-api.ts` | Generated API functions, types, and hooks |

## API Contract Flow

```text
Drizzle schema -> drizzle-zod / Zod schemas -> Hono OpenAPI routes -> OpenAPI JSON -> Orval -> generated frontend hooks
```

Contract rules used in this repository:

- persisted data starts from Drizzle schema
- route contracts are defined through `@hono/zod-openapi`
- frontend screens call APIs through generated hooks from `@ody/api-client`
- generated files under `packages/api-client/src/generated` should not be manually edited
- order totals and state transitions are enforced by backend services

## Environment Variables

Use `.env.example` as the local template.

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string, usually from Neon |
| `AUTH_SECRET` | Yes | Long random secret used to sign auth tokens |
| `EXPO_PUBLIC_API_BASE_URL` | Yes | Dashboard API base URL, usually `http://localhost:8787` |

Local secret files are ignored by git:

- `.env`
- `.env.local`
- `services/backend/.dev.vars`

Do not commit database URLs, tokens, API keys, or local secret files.

## Quick Start

### Prerequisites

- Node.js compatible with the installed Expo and Wrangler versions
- pnpm 10+
- PostgreSQL database URL, such as Neon

### Local setup

```bash
pnpm install
cp .env.example .env
```

Fill `.env` with local values:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
AUTH_SECRET=replace-with-a-long-random-secret
EXPO_PUBLIC_API_BASE_URL=http://localhost:8787
```

Wrangler local development also reads `services/backend/.dev.vars`:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
AUTH_SECRET=replace-with-a-long-random-secret
```

### Database setup

```bash
pnpm db:migrate
pnpm db:seed
```

### Run locally

Start the backend:

```bash
pnpm dev:backend
```

Start the dashboard:

```bash
pnpm dev:dashboard
```

Default local URLs:

| App | URL |
| --- | --- |
| Dashboard | `http://localhost:8081` |
| Backend | `http://localhost:8787` |

## Live Deployment

| Service | URL |
| --- | --- |
| Dashboard | https://ody-dashboard.pages.dev |
| API | https://ody-backend.605835802.workers.dev |

## Demo Login

After seeding, use the demo account:

```text
Email: demo@ody.local
Password: password123
```

## Available Scripts

| Command | Description |
| --- | --- |
| `pnpm dev:dashboard` | Start the Expo dashboard web app |
| `pnpm dev:backend` | Start the Hono backend with Wrangler on port 8787 |
| `pnpm gen:contract` | Generate backend OpenAPI JSON and Orval frontend client |
| `pnpm db:generate` | Generate Drizzle migrations from schema changes |
| `pnpm db:migrate` | Apply Drizzle migrations |
| `pnpm db:seed` | Seed demo data |
| `pnpm typecheck` | Run TypeScript checks across the monorepo |
| `pnpm lint` | Run package lint scripts, currently TypeScript checks |
| `pnpm test` | Run backend service tests and frontend logic tests |

## Validation

Current validation commands:

```bash
pnpm typecheck
pnpm lint
pnpm test
```

Current test coverage includes:

| Area | Coverage |
| --- | --- |
| Backend menu service | category and item creation, duplicate names, invalid categories, invalid prices, availability and archive behavior |
| Backend customer service | create, update, list metrics, search, detail, missing customer behavior |
| Backend order service | create order, server-side total calculation, reject unavailable item, valid and invalid transitions, item snapshot preservation |
| Frontend order logic | status labels, status tones, CSV escaping/export format, filter toggling |
| Frontend settings logic | opening-hours parse/format, settings clone, dirty-state detection |

## Tradeoffs and Incomplete Areas

- The dashboard targets web first. Native readiness is a bonus and was not deeply optimized.
- The shared design system uses React Native primitives directly. Unused UI framework dependencies were removed to keep the declared stack honest.
- Global toast feedback is implemented for key create, update, export, save, reset, help, and error flows. Persistent notification history is out of scope.
- The project does not include OAuth, email verification, password reset, payments, inventory, multi-location management, delivery integrations, or advanced permissions.
- Frontend tests focus on important pure logic. Component rendering tests and browser E2E tests remain future scope.
- Production deployment is not required by the provided assignment. The repository is designed for local review through the README workflow.

## Documentation

| Document | Purpose |
| --- | --- |
| [`docs/fullstack_developer_assignment_ody.md`](./docs/fullstack_developer_assignment_ody.md) | Original assignment source |
| [`docs/development_flow.md`](./docs/development_flow.md) | Scope and implementation flow derived from the assignment |
| [`docs/technical_decisions.md`](./docs/technical_decisions.md) | Stack, architecture, tradeoff, and implementation decisions |
| [`AGENTS.md`](./AGENTS.md) | Project-specific implementation and review rules |

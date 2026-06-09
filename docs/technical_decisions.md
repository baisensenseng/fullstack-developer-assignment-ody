# Technical Decisions

This document records implementation decisions made for the Fullstack Developer Assignment Ody project. The original assignment remains the source of truth for external requirements.

## Stack Decisions

The project uses the required stack: pnpm workspaces, Turborepo, Expo, React Native Web, Expo Router, Hono, Cloudflare Workers style backend design, PostgreSQL, Drizzle ORM, drizzle-zod, OpenAPI, Orval, and React Query.

The project does not use Next.js, NestJS, Prisma, tRPC, Supabase, Firebase, or handwritten frontend API DTOs because those choices conflict with the assignment requirements. Unused UI framework dependencies were removed so the declared stack reflects the actual implementation.

## Contract Flow

The contract flow is:

```text
Drizzle schema -> drizzle-zod / Zod schemas -> Hono OpenAPI routes -> Orval -> generated frontend types and hooks
```

Frontend code should consume generated hooks and generated response types. Shared app-level constants that are not API DTOs live in `packages/types`. Generated files must not be edited manually.

## Backend Layering

Routes should authenticate requests, validate inputs, call services, and return typed responses. Business rules belong in service files under `services/backend/src/services`.

## Data Model

Core persisted entities are users, menu categories, menu items, customers, orders, order items, and ordering settings.

Order items store item name and unit price snapshots to preserve historical order accuracy when menu prices later change.

## Order Rules

Order creation validates customer data or customer ID, validates menu item existence, rejects unavailable menu items, merges repeated items, and calculates totals on the server.

Status updates are action-based. The client cannot freely set an arbitrary order status.

Supported states are pending, accepted, preparing, ready, completed, and cancelled. Supported actions are accept, start preparing, mark ready, complete, and cancel.

## Frontend Decisions

The dashboard uses shared tokens and React Native based shared components from `packages/shared`. Inputs use black focus borders. Auth pages use a split layout with a visual panel. The sidebar only includes project-relevant navigation. Shared UI primitives include surface cards, surface headers, buttons, text fields, search inputs, navigation tabs, segmented buttons, select pills, multi-select filters, toggles, metric cards, status badges, state cards, and table cells.

Orders uses backend-backed list queries, shared status tabs, shared search and multi-select filters, item counts, a detail drawer, a create order modal, a multi-item cart, new customer creation, and valid action buttons.

## Auth Decision

Auth is included as a product-realism bonus. It includes register, login, logout, current user, protected dashboard routes, and hashed password storage. It does not include OAuth, passkeys, password reset, email verification, multi-role permissions, or multi-tenant organization logic.

## Seed Decision

Seed data should make the dashboard useful immediately after setup. It should include a demo user, categories, menu items, customers, orders across different statuses, order items, and ordering settings.

## Documentation Decision

Project planning documents live in `docs/`. The three tracked planning documents are the original assignment, development flow, and technical decisions.

## Current Implementation Notes

- Auth is implemented.
- Sidebar and auth layouts are implemented.
- Shared tokens and reusable UI primitives are implemented.
- Home summary is implemented with generated hooks.
- Orders is implemented as a backend-backed vertical slice with generated hooks.
- Menu is implemented with categories, items, availability, item details, and category management.
- CRM is implemented with customer list, detail drawer, recent orders, create and edit flows, and CSV export.
- Settings is implemented with ordering controls, opening hours, notifications, restaurant profile, and save feedback.
- UI Library is implemented with tokens, typography, spacing, surfaces, reusable components, and component states.
- Backend service tests cover menu, customer, and order service behavior. Frontend tests cover order formatters, opening-hours helpers, and settings dirty-state behavior.
- README is implemented with local setup, seed, architecture, and tradeoff notes.

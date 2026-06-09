# Development Flow

This document records the project execution plan derived from the original assignment. It is an analysis document, not a replacement for the assignment requirements.

## Goal

Build a restaurant operations dashboard that demonstrates full-stack execution, type safety, UX quality, and backend business rules.

## Required Stack

- pnpm workspaces and Turborepo.
- Expo, React Native Web, and Expo Router.
- Hono on a Cloudflare Workers style backend.
- PostgreSQL with Drizzle ORM and drizzle-zod.
- OpenAPI generated from Hono routes.
- Orval-generated frontend client and React Query hooks.

## Repository Structure

- `apps/dashboard`: dashboard web app.
- `services/backend`: Hono backend service.
- `packages/shared`: reusable UI primitives, design tokens, and shared utilities.
- `packages/types`: shared TypeScript types and constants.
- `packages/api-client`: generated Orval client and hooks.

## Development Order

1. Monorepo setup.
2. Database schema and seed data.
3. Backend route and service layers.
4. OpenAPI generation.
5. Orval client generation.
6. Auth vertical slice.
7. Orders vertical slice.
8. Menu vertical slice.
9. CRM vertical slice.
10. Settings vertical slice.
11. UI Library page.
12. Tests, documentation, and polish.

## Orders Scope

Orders should include a backend-backed list, status filters, search and filter controls, detail drawer, create order modal, valid state actions, loading states, empty states, error states, mutation loading, and mutation feedback.

The implemented Orders flow should use generated hooks and backend services. It should not rely on static mock data or handwritten DTOs.

## Home Scope

Home should show summary KPIs, revenue, pending orders, popular items, recent orders, ordering status, loading state, empty state, and error state.

## Menu Scope

Menu should include categories, menu items, prices, availability status, create and edit flows, and availability toggles.

## CRM Scope

CRM should include customer list, order count, total spend, recent orders, and customer detail.

## Settings Scope

Settings should include prep time, auto-accept, service availability, opening hours, save actions, loading states, and feedback.

## UI Library Scope

The UI Library should show tokens, typography, spacing, surfaces, reusable components, and component states including default, focus, active, disabled, loading, error, success, and warning.

## Quality Rules

- Keep API contracts generated from backend schemas.
- Use generated frontend hooks for API calls.
- Keep business logic out of route components where practical.
- Keep UI primitives reusable.
- Include clear loading, empty, error, and success states.
- Keep all repository text in English.

# Project Agent Instructions

## Project Scope

- This repository implements a restaurant operations dashboard for the Fullstack Developer Assignment Ody challenge.
- The project goal is a small full-stack product slice that demonstrates frontend quality, backend design, type safety, architecture, UX, and execution speed.
- This project is not a full POS system, delivery platform, customer-facing ordering app, multi-tenant SaaS, payment system, inventory platform, or complex permission system.
- Source assignment document: `docs/fullstack_developer_assignment_ody.md`.
- Development flow document: `docs/development_flow.md`.
- Technical decisions document: `docs/technical_decisions.md`.

## Language Rule

- Repository code, comments, documentation, commit messages, and visible product copy must be written in English.
- Do not add Chinese text to any source file, configuration file, generated file, Markdown document, or inline comment.

## Source of Truth

- Frontend app: `apps/dashboard`.
- Backend service: `services/backend`.
- Shared UI and utilities: `packages/shared`.
- Shared types and constants: `packages/types`.
- Generated Orval API client and hooks: `packages/api-client`.
- Backend business logic: `services/backend/src/services`.
- Backend routes: `services/backend/src/routes`.
- Frontend routes: `apps/dashboard/app`.
- Frontend screens and hooks: `apps/dashboard/src/screens`.

## Required Stack

Use these technologies:

- pnpm workspaces.
- Turborepo.
- Expo + React Native Web.
- Expo Router.
- Hono on Cloudflare Workers style runtime.
- PostgreSQL on Neon.
- Drizzle ORM.
- drizzle-zod.
- `@hono/zod-openapi` for OpenAPI generation.
- Orval for generated frontend client and React Query hooks.
- React Query.

Do not replace the required stack with Next.js, NestJS, Prisma, tRPC, Supabase, Firebase, or handwritten frontend DTOs.

## Vertical Slice Rule

Build features as end-to-end vertical slices:

1. Drizzle schema.
2. Service logic.
3. Hono route and OpenAPI schema.
4. Generated Orval client and hooks.
5. Frontend UI using generated hooks.
6. Loading, empty, error, and success states.
7. Verification.

Do not build static mock pages first and add the API later. Do not use raw fetch as the primary data path. Do not manually edit generated Orval files.

## Frontend Rules

- Use shared project primitives from `packages/shared` whenever practical.
- Keep business screens modular and readable.
- Focus borders for inputs, search fields, and form controls must be black unless the control is in an error state.
- Web clickable controls should show pointer cursor when applicable.
- Reusable UI and token decisions belong in `packages/shared`.

Required dashboard pages:

- Home.
- Orders.
- Menu.
- CRM.
- Settings.
- UI Library.
- Login and Register for the minimum auth loop.

Page responsibilities:

- Home: KPIs, revenue, pending orders, popular items, recent orders, and operating status.
- Orders: order list, filters, detail drawer, create order flow, and status actions.
- CRM: customer list, order count, spend, recent orders, and customer detail.
- Menu: categories, menu items, prices, availability, create/edit flows.
- Settings: prep time, auto-accept, service availability, opening hours, and save feedback.
- UI Library: tokens, typography, spacing, surfaces, reusable components, and component states.

## Backend Rules

- Use Hono with Cloudflare Workers style constraints.
- Define routes and OpenAPI contracts with `@hono/zod-openapi`.
- Keep route handlers thin: request validation, auth, service call, response mapping.
- Put business logic in `services/backend/src/services`.
- Keep persistence definitions in Drizzle schema and service-layer queries.
- Return clear typed request and response shapes.
- Use consistent error response objects.

## Database Rules

- Use Neon PostgreSQL as the primary database.
- `DATABASE_URL` must stay in local `.env` or `.env.local` only.
- Drizzle schema is the persistence source of truth.
- Do not use Prisma.
- Do not use Supabase or Firebase as backend replacements.

Core tables:

- `users`.
- `menu_categories`.
- `menu_items`.
- `customers`.
- `orders`.
- `order_items`.
- `ordering_settings`.

Order totals must be calculated on the server. `order_items` must store item name and price snapshots so historical orders are not affected by later menu price changes.

## Order Business Rules

The server must validate required fields, reject invalid payloads, reject unavailable menu items, calculate totals, enforce valid state transitions, and return typed request/response shapes.

Order state updates must be action-based. Do not expose a loose client-controlled status field update.

Recommended states:

- `pending`.
- `accepted`.
- `preparing`.
- `ready`.
- `completed`.
- `cancelled`.

Recommended actions:

- `accept`.
- `start_preparing`.
- `mark_ready`.
- `complete`.
- `cancel`.

Invalid transitions must be rejected by the backend.

## Auth Rules

Login and registration are bonus scope but must not reduce delivery quality for the core ordering system and type-safety chain.

Auth must include register, login, logout, current user, protected dashboard routes, hashed password storage, and generated API hooks. Do not add OAuth, passkeys, email verification, password reset, multi-role permissions, multi-tenant organization logic, or member invitations unless explicitly requested.

## API Contract Rules

- The backend must output an OpenAPI spec.
- `packages/api-client` must be generated by Orval.
- `apps/dashboard` must call backend APIs through generated clients/hooks.
- Operation IDs should be clear and readable.
- If API types need to change, update schema/routes and regenerate the client. Do not edit generated files manually.

## Seed Rules

Provide seed or bootstrap data that lets reviewers run the project locally and inspect meaningful states.

Seed data should include a demo user, menu categories, menu items, customers, orders, order items, and ordering settings. It should cover pending, accepted, preparing, ready, completed, and cancelled orders.

## Environment Rules

- Do not print full tokens, API keys, secrets, or database connection strings in terminal output, docs, or commit messages.
- `.env.example` may include variable names and placeholder descriptions only.
- If command output includes secrets, filter it before showing the user.
- If a real database connection string was exposed during the conversation, remind the user to rotate the database password before publishing.

## Verification Rules

Run the smallest useful verification command for the change scope.

Common checks:

- Frontend-only changes: `pnpm --filter @ody/dashboard typecheck`.
- Backend-only changes: `pnpm --filter @ody/backend typecheck`.
- Contract changes: `pnpm gen:contract`, then relevant type checks.
- Broad changes: `pnpm typecheck` and `pnpm lint`.

Do not automatically start the project after code changes. If startup is required, check for an existing local instance first and do not open a browser automatically.

## Git Rules

- Do not commit by default.
- Only run `git commit` when explicitly asked.
- Do not push by default.
- Only push, deploy, or publish when explicitly asked.
- Commit messages must use Conventional Commits and English text.
- Before any commit or push, inspect changes with `git status` and `git diff`.

## Documentation Rules

- Architecture and scope live in `docs/development_flow.md` and `docs/technical_decisions.md`.
- If technical decisions change, update `docs/technical_decisions.md`.
- If development scope or MVP changes, update `docs/development_flow.md`.
- Do not add unrelated Markdown files.
- The final deliverable should include local run instructions, seed instructions, architecture notes, and tradeoffs.

## Current Progress Notes

- Auth login/register is implemented.
- Login/register visual layout and floating label inputs are implemented.
- Dashboard sidebar, sidebar footer panels, and global toast feedback are implemented.
- Design tokens and component-level tokens are implemented.
- Home summary is implemented with backend `/summary`, generated hooks, KPIs, recent orders, popular items, ordering status, loading, empty, and error states.
- Orders vertical slice is implemented with backend-backed list, filters, details, create order, item count, multi-item cart, new customer creation, status actions, CSV export, and generated hooks.
- Menu is implemented with category management, item management, availability, archive behavior, and generated hooks.
- CRM is implemented with list, detail drawer, create/edit flow, order history, spend data, CSV export, and generated hooks.
- Settings is implemented with ordering controls, opening hours editor, notifications, restaurant profile, save/reset feedback, and generated hooks.
- UI Library is implemented with tokens, typography, spacing, surfaces, reusable components, component states, sidebar navigation, dialogs, drawers, and toast feedback.

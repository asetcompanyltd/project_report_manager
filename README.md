# Project Report Manager

A multi-project status report manager. Each project keeps its own independent phases, site
detail sections, next steps, notes, saved versions, and change history — same app, same
schema, isolated data per project. Originally a single-file HTML tool (kept for reference at
[legacy/WTP_Report_Manager.html](legacy/WTP_Report_Manager.html)), now a full-stack Next.js app
backed by a relational database (Turso/libSQL-compatible).

## Stack

- **Next.js (App Router, TypeScript)** — React frontend and API routes in one codebase.
- **Drizzle ORM + `@libsql/client`** — same client works against a local SQLite file in dev
  and a Turso `libsql://` database in production; only the `DATABASE_URL` env var changes.
- **zod** for request validation, **@tanstack/react-query** for the projects list,
  **bcryptjs** + **jose** (JWT cookie) for auth.
- **Tailwind CSS v4 + Radix UI (Dialog/AlertDialog/DropdownMenu/Tooltip) + lucide-react** — the
  design system: a sidebar + top bar app shell, a shared set of UI primitives in
  `src/components/ui/*`, and a promise-based `useConfirm()` hook replacing native
  `window.confirm()` dialogs everywhere.

## Getting started (local dev)

Double-click **`start.bat`** — it checks for Node/npm, installs dependencies, creates
`.env.local` from `.env.example` (defaults to a local SQLite file, so no setup is required),
runs pending DB migrations, starts the dev server, and opens the app in your browser.

Or manually:

```bash
npm install
npm run db:migrate   # applies schema migrations to local.db
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000), register an account, and create a
project.

To load sample content instead of starting empty, run `npm run db:seed` — this creates one
project explicitly named **"Demo Project"** (never seeded automatically) with the original
Upper Ruvu WTP sample data, and prints the demo login it creates.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run a production build |
| `npm run preview` | Build + start, to sanity-check a production build locally |
| `npm run db:generate` | Generate a new Drizzle migration from `src/db/schema.ts` |
| `npm run db:migrate` | Apply migrations to whatever `DATABASE_URL` points at |
| `npm run db:seed` | Create the opt-in "Demo Project" with sample data |

## Environment variables

See `.env.example`. `DATABASE_URL` / `DATABASE_AUTH_TOKEN` point at Turso in production;
`AUTH_SECRET` signs session cookies. None of these are hardcoded anywhere in source.

## Deploying

Deploy to Vercel as a standard Next.js app (API routes become serverless functions
automatically). Point `DATABASE_URL`/`DATABASE_AUTH_TOKEN` at a real Turso database and set
`AUTH_SECRET` in the Vercel project's environment variables, then run `npm run db:migrate`
against that database (locally, with `DATABASE_URL` temporarily pointed at it, or via a CI
step) before first use.

## Data isolation

Every project-scoped table traces back to a `project_id` via foreign keys. Every API route
resolves that `project_id` and checks the requesting user's `project_members` role **before**
reading or writing anything — never only filtered in the UI. See `src/lib/authz.ts` and
`src/lib/resource-scope.ts`.

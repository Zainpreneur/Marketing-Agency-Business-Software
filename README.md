# Northstar — Marketing Agency Business Application

A full-stack business management platform for a marketing agency: clients (CRM),
campaigns, tasks, invoicing/billing, and team management — with authentication,
role-based permissions, and a dashboard with charts.

## Tech stack

- **Framework:** Next.js 16 (App Router, React 19, TypeScript)
- **Database:** SQLite via Prisma ORM (swap the datasource for Postgres/MySQL in production)
- **Auth:** NextAuth.js v5 (credentials/email+password, JWT sessions)
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Mutations:** Next.js Server Actions (no separate REST layer needed) — the
  NextAuth route handler (`/api/auth/*`) is the one true API route

## Features

- **Auth & roles** — email/password sign-up and sign-in. The first account
  created becomes an **Admin**; admins can invite teammates and assign
  **Admin / Manager / Employee** roles.
- **Dashboard** — KPIs (clients, active campaigns, outstanding revenue, tasks
  due soon), a revenue trend chart, a campaign-status breakdown chart, upcoming
  tasks, and a recent activity feed.
- **Clients (CRM)** — company/contact details, status pipeline (Lead → Active →
  Paused → Churned), account owner, notes, search & filtering.
- **Campaigns** — linked to a client, channel (Social, SEO, PPC, Email,
  Content, Branding, PR, Events…), status, budget vs. spend tracking, manager,
  start/end dates.
- **Tasks** — a Kanban-style board (To Do / In Progress / In Review / Done),
  priority levels, due dates, assignees, and threaded comments on each task.
- **Invoicing** — client invoices with multiple line items, tax, auto-computed
  totals, status tracking (Draft/Sent/Paid/Overdue/Cancelled), and a
  print-friendly invoice view.
- **Team** — manage teammates and roles (Admin only), personal profile and
  password management for every user.

## Getting started

```bash
npm install

# Configure environment
cp .env.example .env
# edit .env — set a real AUTH_SECRET for anything beyond local dev

# Create the SQLite database and tables
npm run db:push

# Seed demo data (a few clients, campaigns, tasks, invoices, and 3 users)
npm run db:seed

npm run dev
```

Visit `http://localhost:3000` and sign in with a seeded account:

| Role     | Email                       | Password      |
| -------- | ---------------------------- | -------------- |
| Admin    | `admin@northstar.agency`    | `password123`  |
| Manager  | `manager@northstar.agency`  | `password123`  |
| Employee | `employee@northstar.agency` | `password123`  |

Or register a brand-new account at `/register` — the first account ever
created on a fresh database automatically becomes an Admin.

## Scripts

| Command            | Description                              |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Start the dev server                      |
| `npm run build`     | Production build                          |
| `npm run start`     | Run the production build                  |
| `npm run lint`      | Lint the codebase                         |
| `npm run db:push`   | Sync the Prisma schema to the database    |
| `npm run db:seed`   | Populate demo data                        |
| `npm run db:studio` | Open Prisma Studio to browse the database |

## Project structure

```
prisma/schema.prisma      Data model (User, Client, Campaign, Task, Invoice…)
prisma/seed.ts            Demo data seed script
src/app/(app)/…            Authenticated app pages (dashboard, clients, campaigns, tasks, invoices, team, profile)
src/app/login, /register   Public auth pages
src/app/api/auth/…         NextAuth route handler
src/lib/actions/…          Server Actions (create/update/delete for every resource)
src/lib/auth.ts            NextAuth configuration
src/lib/prisma.ts          Prisma client singleton
src/components/…           Shared UI components and per-resource forms
```

## Notes for production

- Switch `prisma/schema.prisma`'s `datasource` from SQLite to Postgres/MySQL
  and set `DATABASE_URL` accordingly.
- Set a strong, random `AUTH_SECRET` and the correct `NEXTAUTH_URL`.
- Run `npx prisma migrate deploy` (with a proper migration history) instead of
  `db push` once you're past local prototyping.

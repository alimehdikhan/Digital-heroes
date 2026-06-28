# Digital Heroes

A subscription-driven web platform that combines golf performance tracking, monthly prize draws, and charitable giving. Built as a full-stack training assignment for [Digital Heroes](https://digitalheroes.co.in) — golf scores become draw entries, subscriptions fuel prize pools, and every member supports a verified charity.

**Live app:** [https://digital-heroes-indol.vercel.app/](https://digital-heroes-indol.vercel.app/)  
**Repository:** [github.com/alimehdikhan/Digital-heroes](https://github.com/alimehdikhan/Digital-heroes)

---

## Table of Contents

- [Live Application](#live-application)
- [Features](#features)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Demo & Test Credentials](#demo--test-credentials)
- [Available Scripts](#available-scripts)
- [Application Routes](#application-routes)
- [Business Logic](#business-logic)
- [Admin Panel](#admin-panel)
- [Payments (Razorpay)](#payments-razorpay)
- [Email Notifications](#email-notifications)
- [Deployment](#deployment)
- [Testing](#testing)
- [Scalability & Extras](#scalability--extras)

---

## Live Application

| Page | URL |
|------|-----|
| Homepage | [digital-heroes-indol.vercel.app](https://digital-heroes-indol.vercel.app/) |
| Pricing / Subscribe | [/pricing](https://digital-heroes-indol.vercel.app/pricing) |
| Login | [/login](https://digital-heroes-indol.vercel.app/login) |
| Register | [/register](https://digital-heroes-indol.vercel.app/register) |
| Charities Directory | [/charities](https://digital-heroes-indol.vercel.app/charities) |
| Draw Rules | [/rules](https://digital-heroes-indol.vercel.app/rules) |
| Draw History | [/draw-history](https://digital-heroes-indol.vercel.app/draw-history) |
| User Dashboard | [/dashboard](https://digital-heroes-indol.vercel.app/dashboard) |
| Admin Console | [/admin](https://digital-heroes-indol.vercel.app/admin) |

---

## Features

### Subscriptions & Payments
- Monthly and yearly plans with Razorpay Checkout
- Subscription lifecycle: active, cancelled, past due, grace period
- Real-time subscription check on protected routes (middleware)
- Dev-mode payment simulation when Razorpay test keys are absent

### Score Management
- Stableford scores (1–45) with date validation
- Rolling window of 5 scores per user (DB trigger + app logic)
- One score per date; edit and delete supported
- Subscription required to submit scores

### Draw & Reward Engine
- Three prize tiers: 5-match (40%), 4-match (35%), 3-match (25%)
- **Random** and **Algorithmic** draw modes (most/least frequent score weighting)
- Admin simulate → execute → publish workflow
- Jackpot rollover when no 5-match winner
- Automated monthly cron on the 1st of each month
- Per-user charity deductions from prize pool

### Charity System
- Charity selection at registration (minimum 10% contribution)
- Adjustable charity percentage on profile
- Charity directory with search and filter
- Individual charity profiles with images and events
- Featured charity on homepage
- Independent one-off donations (not tied to subscription)

### Winner Verification
- Winners upload score proof (screenshot)
- Admin approve / reject submissions
- Payout tracking: pending → paid

### User Dashboard
- Subscription status and renewal date
- Score entry and management
- Charity selection and contribution %
- Draw participation summary and countdown
- Winnings ledger with payout status
- In-app notifications

### Admin Dashboard
- User and subscription management
- Score editing
- Draw configuration, simulation, and publishing
- Charity CRUD with media and events
- Winner verification and payout marking
- Reports and analytics (Recharts)

### UI / UX
- Modern dark-luxury aesthetic (not traditional golf styling)
- Framer Motion animations and micro-interactions
- Mobile-first responsive design
- Prominent subscribe CTA across marketing pages

---

## User Roles

| Role | Access |
|------|--------|
| **Public visitor** | Homepage, charities, rules, draw history, pricing |
| **Registered subscriber** | Dashboard, scores, draws, profile, notifications, proofs |
| **Administrator** | Full admin panel — users, draws, charities, scores, reports |
| **Super admin** | Same UI as admin + DB-level access to audit logs and organizations (set manually in Supabase) |

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS, shadcn/ui, Framer Motion |
| Database & Auth | Supabase (PostgreSQL, RLS, SSR cookies) |
| Payments | Razorpay (subscriptions + one-off donations) |
| Email | Resend |
| Charts | Recharts |
| Validation | Zod, React Hook Form |
| Hosting | Vercel |
| E2E Tests | Playwright |

---

## Project Structure

```
├── app/
│   ├── (marketing)/     # Public pages — home, charities, pricing, rules
│   ├── (auth)/          # Login, register, password reset
│   ├── (app)/           # Authenticated user area + admin panel
│   ├── actions/         # Server actions (auth, draw, scores, admin…)
│   └── api/             # API routes (webhooks, cron, REST endpoints)
├── components/          # UI components and layout
├── lib/
│   ├── draw/            # Draw engine, prizes, algorithmic/random modes
│   ├── supabase/        # Client, server, and admin Supabase helpers
│   └── razorpay/        # Razorpay SDK client
├── supabase/
│   ├── migrations/      # SQL migrations (run in order)
│   └── seed.sql         # Sample charity data
├── scripts/
│   └── seed-demo-users.mjs   # PRD demo account seeder
├── digital-heroes-tests/     # Playwright E2E suite
├── types/               # TypeScript types
└── validators/          # Zod schemas
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) project
- [Razorpay](https://razorpay.com) test keys (optional for local dev — payments simulate without them)

### 1. Clone & install

```bash
git clone https://github.com/alimehdikhan/Digital-heroes.git
cd Digital-heroes
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in all required variables — see [Environment Variables](#environment-variables).

### 3. Set up the database

Run all migrations in the Supabase SQL Editor — see [Database Setup](#database-setup).

### 4. Seed data

```bash
# Sample charities (via SQL editor)
# Run supabase/seed.sql

# PRD demo accounts (subscriber + admin)
npm run seed:demo
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server only — never expose to client) |
| `NEXT_PUBLIC_SITE_URL` | Yes | App URL (`http://localhost:3000` locally, `https://digital-heroes-indol.vercel.app` in production) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Prod | Razorpay public key (`rzp_test_…` or `rzp_live_…`) |
| `RAZORPAY_KEY_SECRET` | Prod | Razorpay secret key |
| `RAZORPAY_WEBHOOK_SECRET` | Prod | Webhook signature secret from Razorpay dashboard |
| `RAZORPAY_PLAN_MONTHLY` | Prod | Razorpay subscription plan ID (monthly) |
| `RAZORPAY_PLAN_YEARLY` | Prod | Razorpay subscription plan ID (yearly) |
| `RESEND_API_KEY` | Optional | Resend API key for transactional email |
| `RESEND_FROM_EMAIL` | Optional | Sender address (defaults to Resend onboarding address) |
| `CRON_SECRET` | Prod | Bearer token securing `/api/cron/draw` |

> **Local dev tip:** Omit `RAZORPAY_KEY_ID` or set it to `dummy_key` to auto-simulate successful subscriptions without hitting the Razorpay API.

---

## Database Setup

Execute every file in `supabase/migrations/` **in numerical order** via the Supabase SQL Editor:

```
001_init_profiles.sql
002_scores.sql
003_charities.sql
004_draws.sql
005_winner_proofs.sql
006_organizations.sql
007_audit_logs.sql
008_rls_policies.sql
009_functions_triggers.sql
010_notifications.sql
011_add_supported_charity.sql
012_campaigns.sql
013_sub_start_date.sql
014_update_participants.sql
015_add_charity_percentage.sql
016_charity_events.sql
016_create_proofs_bucket.sql
017_payout_status.sql
018_razorpay.sql
018_scores_update_rls.sql
019_scalability.sql
020_adversarial_fixes.sql
```

Then run `supabase/seed.sql` for sample charity records.

---

## Demo & Test Credentials

PRD-mandated evaluator accounts. Seed them after migrations:

```bash
npm run seed:demo
```

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| **Subscriber** | `hero@digitalheroes.test` | `Hero1234!` | Active subscription, 5 pre-seeded scores |
| **Administrator** | `admin@digitalheroes.test` | `Admin1234!` | Full access to `/admin` |

Login: [https://digital-heroes-indol.vercel.app/login](https://digital-heroes-indol.vercel.app/login)

### Promote any user to admin manually

1. Register at `/register`
2. Supabase → Table Editor → `profiles` → set `role` to `admin`
3. Refresh the app — **Admin Console** appears in the nav

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript check |
| `npm run seed:demo` | Create PRD demo accounts in Supabase |
| `npm run db:types` | Regenerate Supabase TypeScript types (local CLI) |

---

## Application Routes

### Public (marketing)
| Route | Purpose |
|-------|---------|
| `/` | Landing page with jackpot, featured charity, how-it-works |
| `/pricing` | Monthly / yearly subscription plans |
| `/charities` | Charity directory with search |
| `/charities/[id]` | Charity profile, events, donate |
| `/rules` | Draw rules and eligibility |
| `/draw-history` | Past draw results |
| `/contact` | Contact page |
| `/terms`, `/privacy` | Legal pages |

### Auth
| Route | Purpose |
|-------|---------|
| `/login` | Sign in |
| `/register` | Sign up with charity selection |
| `/forgot-password` | Password reset request |
| `/reset-password` | Set new password |

### Subscriber (auth + subscription required for scores/draws)
| Route | Purpose |
|-------|---------|
| `/dashboard` | Main hub — jackpot, scores, winnings, charity |
| `/scores` | Enter and manage Stableford scores |
| `/draws` | Draw participation and results |
| `/profile` | Account settings, subscription, charity % |
| `/notifications` | System notifications |
| `/proofs/[id]` | Winner proof upload |

### Admin
| Route | Purpose |
|-------|---------|
| `/admin` | Command center — metrics, winner approvals |
| `/admin/users` | User and subscription management |
| `/admin/scores` | Edit user scores |
| `/admin/draws` | Simulate, execute, publish draws |
| `/admin/charities` | Charity CRUD, events, images |
| `/admin/organizations` | Corporate / team accounts |
| `/admin/campaigns` | Campaign module (future-ready) |
| `/admin/reports` | Analytics and charity totals |

### API
| Route | Purpose |
|-------|---------|
| `/api/webhooks/razorpay` | Payment and subscription webhooks |
| `/api/cron/draw` | Monthly automated draw (Vercel cron) |
| `/api/scores` | Score CRUD |
| `/api/subscriptions` | Subscription status |
| `/api/charities` | Charity data |
| `/api/draw` | Draw data |

---

## Business Logic

### Scores
- Range: 1–45 (Stableford)
- Max 5 scores per user (oldest auto-removed on insert)
- One score per calendar date
- Displayed newest-first

### Draw eligibility
- Active subscription required
- User must have **5 latest scores** on record
- Each monthly draw matches those 5 numbers against 5 winning numbers

### Prize pool
```
Total pool = sum of active subscribers' monthly fees
Charity    = sum of each user's individual charity % × their fee
Distributable = total pool − charity total

Jackpot (5-match) = 40% of distributable + any rollover
Silver  (4-match) = 35% of distributable
Bronze  (3-match) = 25% of distributable
```

- Prizes split equally among winners in the same tier
- If no 5-match winner → jackpot rolls over to next month

### Draw modes
| Mode | Behaviour |
|------|-----------|
| **Random** | 5 numbers drawn uniformly from 1–45 |
| **Algorithmic** | ~3 numbers from most-frequent scores, ~2 from least-frequent scores across all participants |

### Draw workflow (admin)
1. **Simulate** — preview winning numbers and winners (creates `in_progress` record)
2. **Execute** — lock results, notify winners by email + in-app notification
3. **Publish** — mark draw `completed`, notify all users

---

## Admin Panel

Access: `/admin` (requires `admin` or `super_admin` role)

| Section | Capabilities |
|---------|-------------|
| **Command Center** | Revenue, active users, jackpot, charity totals, pending proof approvals |
| **Users** | Search, edit name/role/subscription status/plan |
| **Scores** | View and edit any user's scores |
| **Draws** | Toggle random/algorithmic, simulate, execute, publish |
| **Charities** | Add/edit/delete, upload hero images, manage events |
| **Teams** | Organization and corporate account management |
| **Campaigns** | Campaign module scaffolding |
| **Reports** | User growth, financial charts, charity contribution table |

---

## Payments (Razorpay)

- **Subscriptions:** Monthly (`RAZORPAY_PLAN_MONTHLY`) and yearly (`RAZORPAY_PLAN_YEARLY`) via Razorpay Subscriptions API
- **Donations:** One-off orders via Razorpay Orders API (`DonateButton` on charity pages)
- **Webhooks:** `subscription.activated`, `subscription.charged`, `subscription.cancelled`, `payment.failed`, `order.paid`
- **Multi-currency pricing:** INR (default), USD, EUR, GBP — configured in `lib/pricing.ts`

Production webhook URL:
```
https://digital-heroes-indol.vercel.app/api/webhooks/razorpay
```

---

## Email Notifications

Powered by [Resend](https://resend.com) (`lib/email.ts`). Sent for:

- Subscription activated / renewed / cancelled
- Draw winner alerts
- Draw results published
- Winner proof approved / rejected
- Independent donation receipts

Requires `RESEND_API_KEY` in production. Emails are skipped gracefully when the key is absent.

---

## Deployment

**Stack:** Vercel (frontend + API) + Supabase (database + auth + storage)

### Vercel

1. Import [github.com/alimehdikhan/Digital-heroes](https://github.com/alimehdikhan/Digital-heroes)
2. Add all environment variables from [Environment Variables](#environment-variables)
3. Set `NEXT_PUBLIC_SITE_URL=https://digital-heroes-indol.vercel.app`
4. Deploy — build command `npm run build` (configured in `vercel.json`)

### Supabase

1. Create a **new** Supabase project (per PRD assignment requirements)
2. Run all migrations from `supabase/migrations/`
3. Create storage bucket `winner-proofs` (private) — migration `016_create_proofs_bucket.sql` handles policies
4. Run `npm run seed:demo` against the production Supabase credentials

### Vercel Cron

`vercel.json` schedules an automated draw on the **1st of every month**:

```
GET /api/cron/draw
Authorization: Bearer {CRON_SECRET}
```

Set `CRON_SECRET` in Vercel environment variables.

---

## Testing

### Playwright E2E suite

Located in `digital-heroes-tests/`. Tests run against the live deployment by default.

```bash
cd digital-heroes-tests
npm install
npx playwright test
```

Override target URL:
```bash
BASE_URL=http://localhost:3000 npx playwright test
```

| Test file | Coverage |
|-----------|----------|
| `01-public-pages.spec.ts` | Homepage, charities, rules, pricing |
| `02-auth.spec.ts` | Login, register, logout |
| `03-dashboard-scores.spec.ts` | Dashboard, score entry |
| `04-subscription-draw-charity.spec.ts` | Subscriptions, draws, charity |
| `05-admin-panel.spec.ts` | Admin access and panels |
| `06-responsive-errors-performance.spec.ts` | Mobile layout, error pages |

### PRD checklist coverage

- [x] User signup & login
- [x] Subscription flow (monthly and yearly)
- [x] Score entry — 5-score rolling logic
- [x] Draw system logic and simulation
- [x] Charity selection and contribution calculation
- [x] Winner verification flow and payout tracking
- [x] User dashboard — all modules
- [x] Admin panel — full usability
- [x] Data accuracy across modules
- [x] Responsive design (desktop + mobile)
- [x] Error handling and edge cases

---

## Scalability & Extras

Built beyond core PRD requirements for future growth:

| Feature | Location |
|---------|----------|
| Multi-currency pricing | `lib/pricing.ts` |
| Corporate / team accounts | `/admin/organizations` |
| Campaign module | `/admin/campaigns` |
| Audit logs | `audit_logs` table (super_admin read) |
| Rate limiting | `lib/rate-limiter.ts` |
| Webhook idempotency | `app/api/webhooks/razorpay/route.ts` |
| API routes for mobile | `/api/scores`, `/api/draw`, `/api/charities` |

---

## License

Private — built for the Digital Heroes full-stack training selection process.

**Issued by:** [Digital Heroes](https://digitalheroes.co.in) · PRD v1.0 · March 2026
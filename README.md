# Digital Heroes

Digital Heroes is a premium, subscription-driven web application where golf scores become a lottery ticket for charitable impact and monthly jackpots. Built with a modern, high-end "dark luxury" aesthetic, it operates on a secure Supabase backend with an algorithmic draw engine.

## 🚀 Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS, shadcn/ui, Framer Motion
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, SSR Auth)
- **Payments**: Razorpay Checkout & Webhooks
- **Analytics**: Recharts
- **Validation**: Zod & React Hook Form

## 🛠️ Project Setup & Installation

### 1. Clone & Install
```bash
git clone <repository-url>
cd "web heroes"
npm install
```

### 2. Environment Configuration
Copy the provided `.env.example` file to create your local environment file:
```bash
cp .env.example .env.local
```
Fill in the `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` from your Supabase dashboard. Add your Razorpay test keys.

### 3. Database Initialization (Supabase)
This project uses raw SQL migrations to build the necessary tables, triggers, and RLS policies. 

If you are setting up a fresh Supabase project:
1. Navigate to the SQL Editor in your Supabase Dashboard.
2. Execute the migration files located in `/supabase/migrations/` in chronological order:
   - `001_init_profiles.sql`
   - `002_scores.sql`
   - `003_charities.sql`
   - `004_draws.sql`
   - `005_winner_proofs.sql`
   - `006_foreign_keys.sql`
   - `007_audit_logs.sql`
   - `008_roles_rls.sql`
   - `009_rpc_functions.sql`
   - `010_notifications.sql`
   
### 4. Seeding Initial Data
For the platform to function correctly during local testing (specifically the registration and charities directory), you must ensure there is at least one active charity in the database. 
You can use the provided Supabase CLI or SQL editor to run a seed script, or manually insert an active charity:
```sql
INSERT INTO charities (name, description, is_active, total_contributed) 
VALUES ('Test Charity', 'A default charity for testing', TRUE, 0);
```

### 5. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 👑 Demo & Admin Access

To access the Admin Command Center:
1. Sign up for a new account through the application UI (`/register`).
2. Go to your Supabase Dashboard -> Table Editor -> `profiles`.
3. Locate your newly created user.
4. Change the `role` column from `user` to `admin`.
5. Refresh the application. You will now see the **Admin Console** tab in the navigation bar.

## 🧪 Local QA & Testing
- **Subscriptions**: If `RAZORPAY_KEY_ID` is omitted or contains a Razorpay test prefix (e.g. `rzp_test_`), the application will automatically intercept the payment gateway and simulate a successful subscription. This unblocks local QA testing of the Score Management systems for standard users.

## 🏗️ Deployment to Vercel

This application is fully prepared for Vercel deployment.

1. Push your code to GitHub.
2. Create a new project in Vercel and import the repository.
3. In the Vercel project settings, add the Environment Variables matching your `.env.local` file.
4. Set the Build Command to `npm run build` and Output Directory to `.next` (Vercel defaults).
5. Deploy.

**Important Production Notes:**
- Ensure you swap your Razorpay Test keys for Razorpay Live keys in the Vercel environment variables.
- Configure your Razorpay Webhook endpoint in the Razorpay Dashboard to point to `https://<your-domain>/api/webhooks/razorpay` and update the `RAZORPAY_WEBHOOK_SECRET` in Vercel.

## 📊 Business Logic Highlights
- **Score Management**: Users can only log Stableford scores between 1-45. Only one score per date is allowed. A Supabase trigger automatically enforces a rolling maximum of 5 scores per user.
- **Draw Engine**: The Algorithmic Vault (`/admin/draws`) matches users' 5 active scores against a randomly generated 5-number sequence. 
  - 5 Matches: 40% (Jackpot)
  - 4 Matches: 35% (Silver)
  - 3 Matches: 25% (Bronze)
- **Jackpot Rollover**: If no 5-match is found, the 40% allocation automatically rolls over to the next month's pool.
- **Winner Verification**: Winners must upload proof of their score. Admins review and authorize payouts via the dashboard.

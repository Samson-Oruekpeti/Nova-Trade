NovaTrade
A full-stack investment platform built with Next.js and Supabase, supporting user portfolio management, deposits/withdrawals, and admin oversight.
Features
	•	Role-based authentication — separate flows and permissions for regular users and admins
	•	Portfolio tracking — real-time holdings view for each user
	•	Deposit & withdrawal flows — end-to-end request and processing pipeline
	•	Admin dashboard — manage users, review transactions, monitor platform activity
	•	Row-Level Security (RLS) — Supabase policies enforce data access at the database level, not just the UI
Tech Stack
	•	Framework: Next.js
	•	Database & Auth: Supabase (Postgres, RLS, Auth)
	•	Hosting: Vercel
Getting Started
Clone the repo and install dependencies:
git clone https://github.com/Samson-Oruekpeti/novatrade.git
cd novatrade
npm install
Set up your environment variables (see .env.example):
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
Run the dev server:
npm run dev
Open http://localhost:3000 to view it locally.
Security Notes
This app handles financial data. RLS policies are enforced on all user-facing tables, and server-side checks guard any route touching deposits, withdrawals, or admin actions. The service role key is never exposed to the client.
Status
Actively developed. not yet open for external contributions.

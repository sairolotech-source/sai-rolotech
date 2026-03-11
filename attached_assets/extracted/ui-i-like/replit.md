# Sai Rolotech Industrial Ecosystem Platform

## Overview
A comprehensive mobile-first business platform for Sai Rolotech, an industrial roll forming machine manufacturer based in Delhi, India. The platform covers machine catalogs, ROI/GST/EMI calculators, support tickets, AMC plans, a quotation portal, ISO QMS, supplier directory, operator training, chatbot, admin panel, and more.

## Architecture
- **Frontend**: React + Vite + TypeScript, TailwindCSS, Shadcn/ui components, Wouter routing, TanStack Query v5
- **Backend**: Express.js + TypeScript, Passport.js session auth, PostgreSQL via Drizzle ORM
- **Database**: PostgreSQL with 25+ tables (Drizzle schema in `shared/schema.ts`)
- **Auth**: Session-based with email OTP verification, 2FA support, device restriction, admin approval flow

## Key Files
- `shared/schema.ts` - Complete data model (25+ tables with Drizzle + Zod schemas)
- `server/routes.ts` - All API routes (~1300 lines)
- `server/storage.ts` - Database CRUD operations (~768 lines)
- `server/auth.ts` - Authentication (register, login, 2FA, device management, admin approval)
- `server/seed.ts` - Database seeding with sample data
- `server/email.ts` - Nodemailer OTP emails (falls back to console if SMTP not configured)
- `server/firebase-storage.ts` - Firebase Storage for file uploads (optional)
- `client/src/App.tsx` - Full routing, chatbot, bottom nav, splash screen
- `client/src/pages/` - 29 page components
- `client/src/hooks/use-auth.ts` - Auth hook for frontend

## Theme
- Primary color: Indigo (`--primary: 239 84% 67%`)
- Font: Inter
- Mobile-first design with card-based UI, bottom navigation, horizontal quick-action scrolling

## User Roles
- **Buyer**: Standard user, can browse catalog, use calculators, submit service requests
- **Vendor**: Supplier directory participant
- **Admin**: Full access to admin panel, user management, content management
- **Sub-admin**: Limited admin access

## Admin Credentials (Seed)
- Username: `admin`
- Password: `admin123`

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection (auto-provisioned by Replit)
- `SESSION_SECRET` - Express session secret
- `SMTP_USER` / `SMTP_PASS` - Optional, for email OTP (falls back to console logging)
- `FIREBASE_SERVICE_ACCOUNT` - Optional, for file uploads to Firebase Storage

## Running
- Workflow: `npm run dev` starts Express + Vite on port 5000
- Database schema pushed via `npx drizzle-kit push`
- PostgreSQL sequence: `quotation_seq` for quotation numbering

## Key Dependencies
- express, passport, passport-local, express-session, connect-pg-simple
- drizzle-orm, drizzle-zod, @neondatabase/serverless
- nodemailer, multer, firebase-admin
- @tanstack/react-query, wouter, lucide-react
- @supabase/supabase-js (optional, not actively used)

## Frontend Routes
`/`, `/catalog`, `/directory`, `/roi`, `/gst`, `/subsidies`, `/service`, `/tools`, `/coil-rate`, `/contact`, `/auth`, `/admin`, `/visit`, `/suppliers`, `/supplier/:id`, `/support`, `/amc`, `/quotation`, `/emi`, `/terms`, `/privacy`, `/documents`, `/inspection`, `/machine-health`, `/quote-compare`, `/training`

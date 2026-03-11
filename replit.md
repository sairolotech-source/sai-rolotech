# Sai Rolotech Industrial Ecosystem

## Overview

Full-stack B2B web app for Sai Rolotech — an industrial roll forming machine manufacturer based in Mundka, New Delhi. Built as a comprehensive ecosystem with machine catalog, admin panel, quotations, AMC plans, supplier directory, support tickets, calculators, and more.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + Framer Motion
- **API framework**: Express 5 + Passport.js (local auth) + express-session
- **Database**: PostgreSQL + Drizzle ORM + drizzle-zod
- **Validation**: Zod v3, drizzle-zod
- **Build**: esbuild (CJS bundle for API)
- **Routing**: wouter (frontend)

## Structure

```text
workspace/
├── artifacts/
│   ├── api-server/          # Express API server (port 8080)
│   │   └── src/
│   │       ├── app.ts           # Express app + CORS + auth setup
│   │       ├── auth.ts          # Passport.js local auth + session
│   │       ├── storage.ts       # DB storage layer (Drizzle)
│   │       ├── db.ts            # Re-exports from @workspace/db
│   │       └── routes/
│   │           ├── health.ts    # Health check
│   │           └── sai-rolotech.ts  # All Sai Rolotech routes
│   └── sai-rolotech/        # React frontend (Vite dev server)
│       └── src/
│           ├── App.tsx          # Main app with routing + chatbot + nav
│           ├── index.css        # Tailwind v4 + indigo theme CSS vars
│           ├── lib/
│           │   ├── schema.ts    # Frontend TypeScript types + Zod schemas
│           │   └── queryClient.ts  # TanStack Query client + apiRequest
│           ├── hooks/
│           │   └── use-auth.ts  # Auth hook (login/register/logout)
│           └── pages/           # 25+ page components
├── lib/
│   ├── db/                  # Drizzle ORM schema + DB connection
│   │   └── src/
│   │       ├── index.ts         # DB connection + schema exports
│   │       └── schema/
│   │           └── index.ts     # All 25+ Drizzle table definitions
│   ├── api-spec/            # OpenAPI spec
│   ├── api-client-react/    # Generated React Query hooks
│   └── api-zod/             # Generated Zod schemas
└── scripts/                 # Utility scripts
```

## Database Tables (25+ tables)

- `users` — authentication and user management (includes `warningCount`, `isFrozen`, `machineSpecialization` for moderation)
- `otp_codes` — email OTP verification
- `products` — machine catalog (new & used)
- `posts` — community feed posts (includes `userId`, `youtubeUrl`, `reportCount` for community/moderation)
- `post_reports` — tracks individual user reports on posts (prevents duplicate reports)
- `dealers` — dealer/distributor directory
- `operators` — operator job board
- `leads` — CRM lead management
- `lead_scoring` — AI lead scoring
- `service_requests` — service requests
- `subsidies` — government subsidy programs
- `spare_parts` — spare parts catalog
- `appointments` — factory visit bookings
- `supplier_profiles` — B2B supplier directory
- `reviews` — supplier reviews & ratings
- `support_tickets` — customer support ticketing
- `amc_plans` — AMC service plans
- `amc_subscriptions` — AMC subscriptions
- `machine_documents` — technical documents & manuals
- `inspections` — machine quality inspections
- `iso_documents` — ISO 9001 document management
- `iso_audits` — ISO audit records
- `capas` — Corrective & Preventive Actions
- `quotations` — machine quotations
- `app_settings` — global app configuration
- `market_prices` — live coil/material market rates
- `machine_health_checks` — machine health monitoring
- `quotation_comparisons` — quotation comparison tool
- `banners` — home page banner carousel

## Auth System

- Passport.js local strategy (username + password)
- express-session with PostgreSQL session store (connect-pg-simple)
- Roles: `admin`, `sub_admin`, `buyer`, `vendor`
- Admin user: username=`admin`, password=`Admin@123`

## API Routes

All routes under `/api/`:
- `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me`
- `/settings` — app settings (GET public, PATCH admin)
- `/products` — machine catalog
- `/dealers` — dealer directory
- `/suppliers`, `/suppliers/:id`, `/suppliers/:id/reviews`
- `/leads`, `/lead-scoring` — CRM
- `/service-requests` — service
- `/appointments` — factory visits
- `/support-tickets` — support
- `/amc-plans`, `/amc-subscriptions` — AMC
- `/quotations`, `/quotations/access/:code` — quotations
- `/documents`, `/inspections`, `/iso-documents`, `/iso-audits`, `/capas`
- `/market-prices`, `/machine-health`, `/banners`
- `/posts`, `/reviews`, `/operators`, `/subsidies`
- `/visitor-count` — in-memory visitor counter
- `/upload/:folder` — file upload (admin only)
- `/admin/users` — user management

## Frontend Pages (25+)

- `/` — Home (splash, hero, quick actions, market rates, social feed)
- `/catalog` — Machine catalog with filters
- `/directory` — Dealer & operator directory
- `/suppliers` — Supplier directory
- `/supplier/:id` — Supplier profile with reviews
- `/service` — Service request form
- `/support` — Support ticket system
- `/amc` — AMC plans & subscription
- `/quotation` — Quotation generator (admin)
- `/visit` — Factory visit booking
- `/documents` — Technical documents
- `/inspection` — Machine QC inspection
- `/machine-health` — Machine health monitor
- `/quote-compare` — Quotation comparison tool
- `/training` — Operator training guide
- `/coil-rate` — Live coil market rates
- `/roi` — ROI calculator
- `/gst` — GST calculator
- `/emi` — EMI calculator
- `/subsidies` — Government subsidy programs
- `/tools` — All calculators & tools
- `/contact` — Contact & lead form
- `/auth` — Login / Register
- `/admin` — Admin panel

## Features

- Splash screen on launch
- Built-in chatbot (FAQ-based, no external API)
- WhatsApp floating button
- Bottom navigation bar
- Announcement banner (configurable)
- Maintenance mode (configurable)
- Dark mode support (CSS variables)
- Fully mobile-first responsive design
- Indigo color theme

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (required)
- `SESSION_SECRET` — Express session secret (optional, has fallback)
- `PORT` — Port for each service (auto-assigned by Replit)
- `BASE_PATH` — Base path for Vite (auto-assigned by Replit)

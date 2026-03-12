# Sai Rolotech Industrial Ecosystem

## Overview

This project is a full-stack B2B web application designed for Sai Rolotech, an industrial roll forming machine manufacturer. It serves as a comprehensive digital ecosystem, aiming to streamline various business operations and enhance customer and vendor interactions. Key capabilities include a machine catalog, administrative tools, quotation generation, Annual Maintenance Contract (AMC) plans, a supplier directory, customer support ticketing, various business calculators, and a community business feed. The platform seeks to centralize business processes, improve efficiency, and foster a more connected industrial community.

## User Preferences

No specific user preferences were provided in the original `replit.md` file.

## System Architecture

The application is built as a monorepo using `pnpm workspaces`.

```text
workspace/
├── artifacts/
│   ├── api-server/          # Express API server (port 8080)
│   │   └── src/
│   │       ├── app.ts           # Express app + CORS + auth setup
│   │       ├── auth.ts          # Session-based auth (scrypt password hashing)
│   │       ├── storage.ts       # DB storage layer (Firestore)
│   │       ├── db.ts            # Re-exports from @workspace/db
│   │       └── routes/
│   │           ├── health.ts    # Health check
│   │           └── sai-rolotech.ts  # All Sai Rolotech routes
│   └── sai-rolotech/        # React frontend (Vite dev server)
│       └── src/
│           ├── App.tsx          # Main app with routing + chatbot + nav
│           ├── index.css        # Tailwind v4 + indigo theme CSS vars
│           ├── lib/
│           │   ├── firebase.ts  # Firebase client SDK init (uses @workspace/firebase-client)
│           │   ├── firebase-services.ts  # Firebase Performance Monitoring, Remote Config, Analytics
│           │   ├── google-config.ts  # GA4, GTM, Search Console IDs (edit here to configure)
│           │   ├── google-analytics.ts  # GA4 + GTM init, event tracking, consent-aware
│           │   ├── schema.ts    # Frontend TypeScript types + Zod schemas
│           │   └── queryClient.ts  # TanStack Query client + apiRequest
│           ├── hooks/
│           │   └── use-auth.ts  # Auth hook (login/register/logout)
│           └── pages/           # 25+ page components (including vendor-portal.tsx, video-call-booking.tsx)
├── lib/
│   ├── db/                  # Firebase Admin SDK (Firestore + Auth + Storage)
│   │   └── src/
│   │       ├── index.ts         # Firebase Admin init + exports (firestore, firebaseAuth, firebaseStorage)
│   │       └── schema/
│   │           └── index.ts     # TypeScript interfaces for all 25+ collections
│   ├── firebase-client/     # Shared Firebase client SDK (web + iOS/Expo ready)
│   │   └── src/
│   │       ├── index.ts         # Main entry: createFirebaseServices()
│   │       ├── config.ts        # Config helper (supports VITE_ and EXPO_PUBLIC_ env vars)
│   │       ├── auth.ts          # Firebase Auth helpers (login, register, logout, onAuthChanged)
│   │       ├── firestore.ts     # Firestore client helpers
│   │       └── storage.ts       # Firebase Storage helpers (upload, download, delete)
│   ├── integrations-gemini-ai/  # Google Gemini AI SDK client (@google/genai)
│   ├── api-spec/            # OpenAPI spec
│   ├── api-client-react/    # Generated React Query hooks
│   └── api-zod/             # Generated Zod schemas
└── scripts/                 # Utility scripts
```

**Technical Stack:**
- **Node.js:** v24
- **TypeScript:** v5.9
- **Frontend:** React 19 with Vite, styled using Tailwind CSS v4, and animations with Framer Motion. Routing is handled by `wouter`.
- **Backend API:** Express 5, designed to be stateless with token-based authentication.
- **Database:** Firebase Firestore, accessed via the `firebase-admin` SDK on the server.
- **Authentication:** Firebase Auth for client-side (SDK) and server-side (ID token verification). Supports username/password with scrypt hashing as a fallback for non-email users. Custom tokens are issued for Firebase client auth synchronization.
- **Storage:** Firebase Storage, used for file uploads via `firebase-admin` on the server and Firebase client SDK on the frontend.
- **Validation:** Zod v3.
- **Build Tools:** `esbuild` for CJS bundle for the API.

- `users` — authentication and user management
- `otpCodes` — email OTP verification
- `products` — machine catalog (new & used)
- `posts` — community feed posts
- `postReports` — tracks individual user reports on posts
- `dealers` — dealer/distributor directory
- `operators` — operator job board
- `leads` — CRM lead management
- `leadScoring` — AI lead scoring
- `serviceRequests` — service requests
- `subsidies` — government subsidy programs
- `spareParts` — spare parts catalog
- `appointments` — factory visit bookings
- `supplierProfiles` — B2B supplier directory
- `reviews` — supplier reviews & ratings
- `supportTickets` — customer support ticketing
- `amcPlans` — AMC service plans
- `amcSubscriptions` — AMC subscriptions
- `machineDocuments` — technical documents & manuals
- `inspections` — machine quality inspections
- `isoDocuments` — ISO 9001 document management
- `isoAudits` — ISO audit records
- `capas` — Corrective & Preventive Actions
- `quotations` — machine quotations
- `appSettings` — global app configuration (single doc: "default")
- `marketPrices` — live coil/material market rates
- `machineHealthChecks` — machine health monitoring
- `quotationComparisons` — quotation comparison tool
- `banners` — home page banner carousel
- `followupReminders` — lead follow-up reminders
- `audit_logs` — security audit log (event type, user, IP, device, metadata)
- `active_sessions` — tracked active user sessions (sid, user, IP, device)
- `broadcast_posts` — admin broadcast posts to suppliers/buyers with Meta Graph API social media publishing
- `broadcast_notification_prefs` — user opt-in/opt-out for broadcast notifications
- `broadcast_notifications` — tracks notification delivery per user per broadcast
- `appDownloads` — app download counters (iOS/Android, single doc: "counters")
- `investments` — ad spend / investment tracking per platform
- `assemblyTasks` — production tasks assigned to assembly heads
- `pushSubscriptions` — Web Push API subscription tokens per user
- `manufacturers` — Near Me manufacturer finder directory
- `machineOrders` — machine order tracking (ordered → in_production → dispatched → delivered)
- `productionWorkflows` — production workflow stages per job
- `jobWorks` — outsourced job work tracking
- `materialRequests` — material requests from engineers to admin
- `engineerNotes` — notes/comments on any entity by engineers
- `job_applications` — job applications from careers page

**Core System Design:**
- **Monorepo Structure:** Divided into `artifacts` (API server and React frontend), `lib` (shared utilities like Firebase Admin SDK, Firebase client SDK, API specifications, generated clients), and `scripts`.
- **Data Model:** Utilizes over 25 Firestore collections for various functionalities, including user management, product catalogs, CRM, service requests, supplier profiles, support, AMC, documents, and audit logs.
- **Security:** A 7-layer security system is implemented, featuring Firebase Auth ID token verification, scrypt password hashing, role-based access (`admin`, `sub_admin`, `buyer`, `vendor`), rate limiting, brute-force protection with account locking, 2FA via email OTP, security headers (`helmet.js`), audit logging, suspicious login detection, and active session management with an admin security dashboard.
- **API Design:** All API routes are prefixed with `/api/` and cover a wide range of functionalities from authentication and user management to product catalogs, CRM, support, and administrative tasks.
- **Frontend Design:** Features a mobile-first responsive design with an Indigo color theme, dark mode support, a splash screen, an integrated chatbot, WhatsApp floating button, bottom navigation, and announcement banners. Page components are lazy-loaded with `React.lazy()` and `Suspense` for performance.
- **Performance:** Optimizations include lazy loading, code splitting, React Query tuning, image optimization (WebP conversion via `sharp`), Firestore batch writes, and background scheduling for maintenance.
- **Notification & Consent:** DPDPA 2023 compliant system with a consent popup, category-based preferences (Push, Marketing, Analytics), a privacy notice, a user preference center, and admin tools for consent management. Uses Web Push with `web-push` library.
- **Vendor Portal:** A dedicated portal for vendors to manage materials, upload bills against POs.
- **Quotation Approval System:** Admin-side tracking and approval workflow for chatbot-issued quotations, with configurable thresholds for automatic flagging requiring approval.

## External Dependencies

- Firebase Auth ID token verification on server (stateless, no sessions)
- Client uses Firebase Auth SDK for email/password login & registration
- Server issues custom tokens for username-based (non-email) logins so client can sync with Firebase Auth
- Password hashing via scrypt (server-side fallback for username/password users)
- Every API request includes `Authorization: Bearer <Firebase ID token>` header
- Roles: `admin`, `sub_admin`, `buyer`, `vendor`, `assembly_head`, `engineer`
- Admin user: username=`admin`, password=`Admin@123`
- **Rate Limiting**: express-rate-limit on auth routes (30 req/15 min)
- **Brute-force Protection**: Account locks for 15 minutes after 5 failed login attempts
- **2FA Email OTP**: Optional per-user 2FA with 6-digit OTP (10-min expiry)
- **Security Headers**: helmet.js (HSTS, CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- **Audit Logging**: All sensitive events logged to `audit_logs` table
- **Suspicious Login Detection**: New device fingerprint or unusual hour (11pm-5am) triggers alert
- **Active Session Management**: Sessions tracked in `active_sessions` table with admin revoke capability
- **Admin Security Dashboard**: Security tab in admin panel with audit logs, active sessions, locked accounts, failed login stats

## API Routes

All routes under `/api/`:
- `/auth/register`, `/auth/login`, `/auth/logout`, `/auth/me`, `/auth/verify-2fa`, `/auth/toggle-2fa`
- `/auth/my-sessions` — user's own active sessions (GET, DELETE)
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
- `/manufacturers` — Near Me manufacturer finder (GET public, POST/PUT/DELETE admin)
- `/manufacturer-leads` — lead capture from manufacturer contact (POST public)
- `/posts`, `/reviews`, `/operators`, `/subsidies`
- `/broadcast-posts` — public broadcast feed (server-side audience enforcement)
- `/broadcast-posts/:id/view` — increment view count
- `/broadcast-notification-pref` — user notification toggle
- `/broadcast-notifications/unread`, `/count`, `/read-all`, `/:id/read` — notification delivery
- `/admin/broadcast-posts` — CRUD for broadcast posts (admin only, with Zod validation)
- `/admin/meta-settings` — Meta Graph API token management (admin only)
- `/job-applications` — job application submission (POST)
- `/visitor-count` — in-memory visitor counter
- `/upload/:folder` — file upload (admin only)
- `/admin/users` — user management
- `/admin/security/summary` — security dashboard summary (super admin)
- `/admin/security/audit-logs` — filterable audit logs (super admin)
- `/admin/security/active-sessions` — active session list (super admin)
- `/admin/security/sessions/:id` — revoke session (super admin, DELETE)
- `/admin/security/locked-accounts` — locked account list (super admin)
- `/admin/security/unlock-account/:userId` — unlock account (super admin)
- `/leads/pabbly-webhook` — public POST endpoint for Pabbly Connect lead capture
- `/track/download?platform=ios|android` — public auto-increment download counter
- `/admin/app-downloads` — GET/POST download counts (admin)
- `/admin/investments` — CRUD for ad spend tracking (admin)
- `/admin/lead-analytics` — aggregated lead analytics data (admin)
- `/admin/dashboard` — dashboard summary stats (admin)
- `/admin/analytics` — full analytics with quotation/support data (admin)

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
- `/near-me` — Near Me manufacturer finder (search, filter, contact)
- `/manufacturer/:id` — Individual manufacturer profile page
- `/jobs` — Jobs & Careers portal
- `/coil-rate` — Live coil market rates
- `/roi` — ROI calculator
- `/gst` — GST calculator
- `/emi` — EMI calculator
- `/subsidies` — Government subsidy programs
- `/tools` — All calculators & tools
- `/contact` — Contact & lead form
- `/auth` — Login / Register
- `/admin` — Admin panel (includes Broadcast tab)
- `/broadcasts` — Broadcast feed for users

## Firebase Client Library (@workspace/firebase-client)

Shared library for web and mobile (iOS/Expo) Firebase integration:
- **Web (Vite)**: Uses `VITE_FIREBASE_*` env vars via `import.meta.env`
- **Mobile (Expo)**: Uses `EXPO_PUBLIC_FIREBASE_*` env vars automatically
- Exports: `createFirebaseServices()`, `getFirebaseConfig()`, auth/firestore/storage helpers
- To use in a new Expo app: add `@workspace/firebase-client` as dependency and call `createFirebaseServices(getFirebaseConfig(process.env))`

## Environment Variables

### Required (Firebase)
- `FIREBASE_SERVICE_ACCOUNT_KEY` — Firebase service account JSON (server-side, for firebase-admin)
- `VITE_FIREBASE_API_KEY` — Firebase Web API Key (client-side)
- `VITE_FIREBASE_AUTH_DOMAIN` — Firebase Auth Domain (client-side)
- `VITE_FIREBASE_PROJECT_ID` — Firebase Project ID (client-side)
- `VITE_FIREBASE_STORAGE_BUCKET` — Firebase Storage Bucket (client-side)
- `VITE_FIREBASE_MESSAGING_SENDER_ID` — Firebase Messaging Sender ID (client-side)
- `VITE_FIREBASE_APP_ID` — Firebase App ID (client-side)

### For future Expo/iOS app (same values, different prefix)
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

### Other
- `PORT` — Port for each service (auto-assigned by Replit)
- `BASE_PATH` — Base path for Vite (auto-assigned by Replit)

## Performance Optimization

- **Lazy loading**: All 28+ page components use `React.lazy()` + `Suspense` with a spinner fallback
- **Code splitting**: Vite `manualChunks` splits vendor bundles
- **React Query tuning**: `staleTime` = 5 min, `gcTime` = 24 hours
- **Image optimization**: Uploaded images auto-compressed to WebP via `sharp`
- **Firestore batch writes**: Bulk operations use batched writes (max 500 per batch)
- **Background scheduler**: `node-cron` daily job for maintenance tasks

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

## Notification & Consent System (DPDPA Compliant)

- **Consent Popup**: Shown after login for users who haven't consented (all 3 categories required)
- **Categories**: Push Notifications, Marketing & Promotions, Analytics & Personalization
- **Privacy Notice**: DPDPA 2023 compliant at `/privacy` with Grievance Officer, data retention, user rights
- **Preference Center**: `/settings/notifications` for users to manage/withdraw consent anytime
- **Admin Consents Tab**: View consent stats, recent activity, send test notifications, export records
- **Service Worker**: `public/sw.js` for Web Push notification handling
- **DB Tables**: `user_consents` (consent records with IP, timestamp, version), `notification_subscriptions` (push endpoints)
- **API Routes**: `GET/POST/PUT /api/consent`, `POST/DELETE /api/push-subscribe`, `GET /api/admin/consent-stats`, `GET /api/admin/consents/export`, `POST /api/admin/send-notification`
- **Web Push**: Uses `web-push` library with VAPID keys for real push notification delivery

## Vendor Portal & Quotation Approval System

- **Vendor Portal** (`/vendor-portal`): Category-organized dashboard (Materials, Bills, Orders, Account) with usage-based auto-sort (localStorage). Vendors see their own materials (received/pending), upload bills (PDF/image) against PO numbers.
- **Admin Quotation Tracker** (Admin > Quotations tab): Table of all chatbot-issued quotes with search, date/discount filters, and full-detail view.
- **Admin Approval Workflow** (Admin > Approvals tab): Quotes with discount > threshold or price > threshold auto-flagged as "pending_approval". Admin can Approve/Reject with notes.
- **Admin Vendor Bills** (Admin > Vendor Bills tab): Review/verify/reject uploaded vendor bills.
- **Threshold Settings** (Admin > Settings > Advanced): Configure discount % threshold and price threshold for auto-flagging.
- **Schema additions**: `VendorMaterial`, `VendorBill` interfaces; `Quotation` extended with `approvalStatus`, `approvalNote`, `flaggedReason`; `AppSettings` extended with `approvalDiscountThreshold`, `approvalPriceThreshold`.
- **API Routes**: `/api/vendor/materials`, `/api/vendor/bills` (vendor-protected), `/api/admin/vendor-materials`, `/api/admin/vendor-bills`, `/api/admin/quotations-tracker`, `/api/admin/pending-approvals`, `/api/admin/quotations/:id/approve`, `/api/admin/quotations/:id/reject`.

## Video Call Support Booking

- **User Booking Page** (`/video-call`): Users can book video call support sessions for machine problems. Form captures name, phone, email, machine type, problem description, and preferred time slot. Booking confirmation shows meeting link (Jitsi Meet).
- **My Bookings**: Users can view their upcoming and past bookings and cancel confirmed ones.
- **Admin Video Calls Tab** (Admin > Video Calls): Admin can create/manage available time slots (date, time, engineer, max bookings) and view/manage all bookings (complete/cancel).
- **Tools Entry**: "Video Call Support" button added in Services & Support section of Tools page.
- **Schema**: `VideoCallSlot` (date, time range, engineer, capacity), `VideoCallBooking` (user info, machine problem, slot, status, meeting link).
- **API Routes**: `/api/video-call-slots` (public available), `/api/admin/video-call-slots` (CRUD), `/api/video-call-bookings` (user auth-protected), `/api/admin/video-call-bookings` (admin).
- **Meeting Links**: Auto-generated Jitsi Meet links on booking confirmation.

## Environment Variables

- `VAPID_PUBLIC_KEY` — VAPID public key for Web Push notifications (optional)
- `VAPID_PRIVATE_KEY` — VAPID private key for Web Push notifications (optional)
- `PORT` — Port for each service (auto-assigned by Replit)
- `BASE_PATH` — Base path for Vite (auto-assigned by Replit)

- **Firebase Ecosystem:**
    - Firebase Firestore (Database)
    - Firebase Authentication (User authentication and authorization)
    - Firebase Storage (File storage)
    - Firebase Admin SDK (Server-side interaction with Firebase services)
    - Firebase Client SDK (Client-side interaction with Firebase services)
- **Meta Graph API:** Used for social media publishing in broadcast posts.
- **`web-push` library:** For sending Web Push notifications.
- **`sharp`:** Image processing library for optimization (WebP conversion).
- **`node-cron`:** For background task scheduling.
- **`express-rate-limit`:** For API rate limiting.
- **`helmet.js`:** For setting security-related HTTP headers.


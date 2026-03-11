# Sai Rolotech — Complete UI & App Structure Blueprint

Use this document to replicate the same UI, layout, styling, component patterns, and app architecture in any new project.

---

## 1. TECH STACK

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18 + TypeScript |
| Build Tool | Vite |
| CSS Framework | TailwindCSS + Shadcn/ui |
| Routing | Wouter (lightweight React router) |
| Data Fetching | TanStack React Query v5 |
| Animation | Framer Motion |
| Icons | Lucide React + react-icons/si |
| Backend | Express.js + TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Passport.js (session-based) |
| Session Store | connect-pg-simple (PostgreSQL) |
| Validation | Zod + drizzle-zod |
| Email | Nodemailer |
| File Uploads | Multer + Firebase Storage |

---

## 2. PROJECT FOLDER STRUCTURE

```
project-root/
├── client/
│   ├── index.html
│   ├── public/
│   │   └── images/                  # Static images (hero, machines, parts)
│   └── src/
│       ├── App.tsx                  # Root: Providers, Router, SplashScreen, ChatBot, BottomNav, WhatsApp, Header
│       ├── main.tsx                 # React entry point
│       ├── index.css                # Tailwind + CSS variables (theme)
│       ├── hooks/
│       │   ├── use-auth.ts          # Auth hook (login, register, logout, user state)
│       │   └── use-toast.ts         # Toast notification hook
│       ├── lib/
│       │   ├── queryClient.ts       # TanStack Query config, apiRequest helper, getQueryFn
│       │   └── utils.ts             # cn() classname utility
│       ├── components/
│       │   ├── image-upload.tsx      # Single & multi image upload components
│       │   └── ui/                   # Shadcn/ui components (40+ components)
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── badge.tsx
│       │       ├── input.tsx
│       │       ├── label.tsx
│       │       ├── select.tsx
│       │       ├── textarea.tsx
│       │       ├── tabs.tsx
│       │       ├── dialog.tsx
│       │       ├── form.tsx
│       │       ├── skeleton.tsx
│       │       ├── toaster.tsx
│       │       ├── toast.tsx
│       │       ├── tooltip.tsx
│       │       ├── table.tsx
│       │       ├── progress.tsx
│       │       ├── switch.tsx
│       │       ├── separator.tsx
│       │       ├── scroll-area.tsx
│       │       ├── sheet.tsx
│       │       ├── accordion.tsx
│       │       ├── alert.tsx
│       │       ├── avatar.tsx
│       │       ├── calendar.tsx
│       │       ├── carousel.tsx
│       │       ├── chart.tsx
│       │       ├── checkbox.tsx
│       │       ├── dropdown-menu.tsx
│       │       ├── hover-card.tsx
│       │       ├── popover.tsx
│       │       ├── radio-group.tsx
│       │       ├── slider.tsx
│       │       └── ... (40+ total)
│       └── pages/                    # All page components (29 pages)
│           ├── home.tsx              # 858 lines — hero, quick actions, banners, dealers, market rates, social feed
│           ├── catalog.tsx           # 566 lines — category grid, product cards, product detail, image gallery
│           ├── admin.tsx             # 2205 lines — tabbed admin panel (dashboard, products, leads, users, settings, etc.)
│           ├── auth.tsx              # 479 lines — login, register, email OTP verify, 2FA verify, approval pending
│           ├── quotation.tsx         # 882 lines — multi-step quotation builder
│           ├── quote-portal.tsx      # 1081 lines — admin quotation management
│           ├── iso-docs.tsx          # 872 lines — ISO QMS document control, audit tracking, CAPA
│           ├── operator-training.tsx # 718 lines — training guides per machine category
│           ├── amc-plans.tsx         # 493 lines — AMC tier comparison, subscription form
│           ├── inspection.tsx        # 492 lines — quality inspection checklist form
│           ├── supplier-profile.tsx  # 487 lines — supplier detail, reviews, ratings
│           ├── support-ticket.tsx    # 475 lines — support ticket creation form
│           ├── visit-booking.tsx     # 398 lines — factory visit appointment booking
│           ├── documents.tsx         # 336 lines — document upload/management
│           ├── machine-health.tsx    # 331 lines — machine health check form with scoring
│           ├── quote-compare.tsx     # 290 lines — side-by-side quotation comparison tool
│           ├── roi-calculator.tsx    # 266 lines — ROI calculator for machines
│           ├── service.tsx           # 248 lines — service request form
│           ├── emi-calculator.tsx    # 219 lines — EMI/loan calculator
│           ├── contact.tsx           # 216 lines — contact info, map, social links
│           ├── suppliers.tsx         # 214 lines — supplier directory listing
│           ├── directory.tsx         # 207 lines — industry directory
│           ├── subsidies.tsx         # 169 lines — government subsidy listings
│           ├── privacy.tsx           # 155 lines — privacy policy
│           ├── tools.tsx             # 126 lines — tools hub with grid navigation
│           ├── gst-calculator.tsx    # 125 lines — GST calculator
│           ├── coil-rate.tsx         # 109 lines — coil rate tracker
│           ├── terms.tsx             # 90 lines — terms & conditions
│           └── not-found.tsx         # 21 lines — 404 page
├── server/
│   ├── index.ts                     # Express app setup, middleware, server start
│   ├── routes.ts                    # All API routes (~1312 lines)
│   ├── storage.ts                   # Database CRUD operations (~768 lines)
│   ├── auth.ts                      # Auth routes (register, login, 2FA, device management)
│   ├── db.ts                        # Drizzle database connection
│   ├── seed.ts                      # Database seeding (~905 lines of sample data)
│   ├── email.ts                     # Nodemailer OTP email sending
│   ├── firebase-storage.ts          # Firebase Storage file upload/delete
│   ├── supabase.ts                  # Supabase client (optional)
│   ├── vite.ts                      # Vite dev server integration
│   └── static.ts                    # Static file serving for production
├── shared/
│   └── schema.ts                    # Drizzle ORM schema (625 lines, 25+ tables)
├── tailwind.config.ts               # Tailwind configuration with theme
├── drizzle.config.ts                # Drizzle Kit config
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript config
└── package.json                     # Dependencies
```

---

## 3. COLOR THEME (CSS VARIABLES)

### Primary: Indigo (`239 84% 67%`)

```css
:root {
  --primary: 239 84% 67%;           /* Indigo — main brand color */
  --primary-foreground: 0 0% 100%;  /* White text on primary */
  --background: 0 0% 100%;          /* White background */
  --foreground: 0 0% 9%;            /* Near-black text */
  --card: 0 0% 98%;                 /* Slightly off-white cards */
  --card-foreground: 0 0% 9%;
  --card-border: 0 0% 94%;
  --border: 0 0% 90%;
  --muted: 220 14% 94%;
  --muted-foreground: 220 9% 45%;
  --accent: 220 14% 96%;
  --destructive: 0 84% 60%;         /* Red for errors/danger */
  --ring: 239 84% 67%;              /* Focus ring = primary */
  --input: 220 13% 80%;
  --secondary: 220 14% 93%;
  --secondary-foreground: 220 9% 9%;
  --radius: 0.5rem;
  --font-sans: Inter, system-ui, sans-serif;
}
```

### Dark Mode

```css
.dark {
  --primary: 239 84% 67%;           /* Same indigo in dark mode */
  --background: 0 0% 7%;            /* Near-black */
  --foreground: 0 0% 98%;           /* Near-white text */
  --card: 0 0% 9%;
  --muted: 220 10% 17%;
  --muted-foreground: 220 10% 65%;
  --border: 0 0% 16%;
  --input: 220 10% 25%;
}
```

### Gradient Palette Used Across App

| Context | Gradient |
|---------|----------|
| Splash Screen | `from-indigo-600 via-indigo-700 to-indigo-900` |
| Rolling Shutter category | `from-indigo-600 to-blue-700` |
| False Ceiling category | `from-emerald-600 to-teal-700` |
| Door & Window category | `from-amber-600 to-orange-700` |
| Roofing category | `from-slate-700 to-zinc-800` |
| Structural category | `from-violet-600 to-purple-700` |
| Solar category | `from-sky-600 to-cyan-700` |
| Drywall category | `from-rose-600 to-pink-700` |
| Dealer banner | `from-slate-900 via-slate-800 to-zinc-900` |
| GP Coil dealer accent | `amber-400 / amber-500` |

### Quick Action Icon Colors

Each quick action button uses a soft color background with matching text:
- `bg-primary/10 text-primary` (Machines)
- `bg-indigo-500/10 text-indigo-600` (Suppliers)
- `bg-red-500/10 text-red-600` (Support)
- `bg-purple-500/10 text-purple-600` (AMC)
- `bg-cyan-500/10 text-cyan-600` (Visit)
- `bg-amber-500/10 text-amber-600` (Service)
- `bg-rose-500/10 text-rose-600` (Quotation)
- `bg-emerald-500/10 text-emerald-600` (ROI Calc)
- `bg-sky-500/10 text-sky-600` (Documents)
- `bg-teal-500/10 text-teal-600` (QC Check)
- `bg-orange-500/10 text-orange-600` (Market)
- `bg-green-500/10 text-green-600` (Health)
- `bg-violet-500/10 text-violet-600` (Compare)
- `bg-pink-500/10 text-pink-600` (Training)

---

## 4. LAYOUT SYSTEM

### Mobile-First Container

```tsx
<div className="min-h-screen bg-background max-w-lg mx-auto relative">
  {/* AnnouncementBar (conditional) */}
  <AppHeader />
  <main>
    <Router />
  </main>
  <BottomNav />
  <ChatBot />
  <WhatsAppButton />
</div>
```

- **Max width**: `max-w-lg` (512px) — centered on larger screens
- **All content** lives inside this container for mobile-first feel
- **Bottom padding**: Pages use `pb-24` to clear the bottom nav

### Page Template Pattern

Every page follows this structure:

```tsx
export default function PageName() {
  return (
    <div className="pb-24 px-4 pt-4">
      {/* Back button + Title header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Page Title</h1>
          <p className="text-xs text-muted-foreground">Subtitle</p>
        </div>
      </div>

      {/* Page content */}
      <Card>
        <CardContent className="pt-6">
          {/* Content here */}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 5. COMPONENT PATTERNS

### 5.1 App Header (Home page only)

```tsx
<header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between gap-1">
  <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
      S
    </div>
    <div>
      <h1 className="text-sm font-bold leading-none">Sai Rolotech</h1>
      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">Industrial Ecosystem</p>
    </div>
  </div>
  <div className="flex items-center gap-1.5">
    {/* Admin & Profile buttons */}
  </div>
</header>
```

### 5.2 Bottom Navigation (Fixed)

```tsx
<nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t safe-area-bottom">
  <div className="max-w-lg mx-auto flex items-center justify-around gap-2 px-2 py-2">
    {tabs.map((tab) => (
      <button className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-md transition-all ${
        isActive ? "text-primary" : "text-muted-foreground"
      }`}>
        <tab.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : ""}`} />
        <span className="text-[10px] font-medium">{tab.label}</span>
      </button>
    ))}
  </div>
</nav>
```

Bottom nav tabs: Home, Machines, Tools, Contact

### 5.3 Splash Screen (Animated)

```
- Full-screen overlay: bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900
- Logo: White "S" in rounded square with backdrop blur
- Title: "Sai Rolotech" (white, bold)
- Subtitle: "Industrial Ecosystem" (uppercase, tracking-[0.3em])
- Loading dots: 3 animated dots (pulse)
- Duration: 2.4 seconds, tap to skip
- Uses Framer Motion for spring animations
```

### 5.4 Hero Section

```
- Rounded image container with gradient overlay
- Image: Full-width, h-56 sm:h-72, object-cover
- Gradient: bg-gradient-to-t from-black/80 via-black/40 to-transparent
- Content at bottom: Label (uppercase, tracking-widest) + Title + Subtitle
- CTA Buttons: Primary "Explore Machines" + Outline "Contact Us"
```

### 5.5 Quick Actions (Horizontal Scroll)

```tsx
<div className="flex gap-3 px-4 mb-6 overflow-x-auto scrollbar-hide">
  {actions.map((action) => (
    <button className="flex flex-col items-center gap-2 p-3 rounded-md bg-card border border-card-border transition-all min-w-[72px] shrink-0">
      <div className={`w-10 h-10 rounded-md flex items-center justify-center ${action.color}`}>
        <action.icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-medium text-foreground">{action.label}</span>
    </button>
  ))}
</div>
```

### 5.6 Banner Carousel (Auto-rotating)

```
- Auto-rotates every 4 seconds
- AnimatePresence with slide left/right transitions
- Gradient backgrounds (configurable per banner)
- Title, subtitle, CTA button, Call Now button
- Dot indicators at bottom right
```

### 5.7 ChatBot (Floating)

```
- FAB button: fixed bottom-[72px] right-3, w-12 h-12, rounded-full, bg-primary
- Chat window: fixed bottom-[88px] right-3, max-w-[340px]
  - Header: bg-primary with bot name + status
  - Messages area: h-[300px] overflow-y-auto
  - User messages: bg-primary text-primary-foreground rounded-br-sm
  - Bot messages: bg-card border rounded-bl-sm
  - Input bar with send button
  - Quick reply chips: scrollable row of pill buttons
- Framer Motion spring animation on open/close
```

### 5.8 WhatsApp Button (Floating)

```
- FAB: fixed bottom-[72px] left-3, w-12 h-12, rounded-full, bg-[#25D366]
- WhatsApp SVG icon
- Opens wa.me link with pre-filled message
```

### 5.9 Card-Based Content

```tsx
<Card className="p-4">
  <div className="flex items-center gap-2 mb-3">
    <Icon className="w-4 h-4 text-primary" />
    <h3 className="text-sm font-bold">Section Title</h3>
  </div>
  {/* Content */}
</Card>
```

### 5.10 Form Pattern

```tsx
<Card>
  <CardContent className="pt-6">
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Field Name</Label>
        <Input value={value} onChange={...} placeholder="..." />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Submit
      </Button>
    </form>
  </CardContent>
</Card>
```

### 5.11 Loading States

```tsx
// Spinner
<div className="flex items-center justify-center min-h-screen">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
</div>

// Skeleton
<Skeleton className="h-6 w-48 mb-3" />
<div className="flex gap-4">
  <Skeleton className="h-20 flex-1" />
  <Skeleton className="h-20 flex-1" />
</div>
```

### 5.12 Admin Panel (Tabbed)

```
- Horizontal scrollable tab bar at top
- Each tab: { id, label, icon, superOnly? }
- Tab content renders below
- Dashboard tab: stat cards in grid
- Each tab manages its own CRUD with inline forms
- Uses useMutation + invalidateQueries pattern
```

### 5.13 Auth Flow (Multi-Step)

```
Steps: login → register → verify-email (OTP) → pending-approval → verify-2fa
- Each step is a different card view within the same page
- OTP input: 6-digit code field
- Role selector: buyer / vendor (Select component)
- State selector: Indian states dropdown
- Show/hide password toggle
```

---

## 6. DATA FETCHING PATTERNS

### Query Pattern

```tsx
const { data, isLoading } = useQuery<Type[]>({
  queryKey: ["/api/endpoint"],
});
```

No `queryFn` needed — default fetcher is configured in `queryClient.ts`.

### Mutation Pattern

```tsx
const mutation = useMutation({
  mutationFn: async (data: InputType) => {
    const res = await apiRequest("POST", "/api/endpoint", data);
    return res.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["/api/endpoint"] });
    toast({ title: "Success!" });
  },
  onError: (err: Error) => {
    toast({ title: "Error", description: err.message, variant: "destructive" });
  },
});
```

### Auth Query (special — returns null on 401)

```tsx
const { data: user, isLoading } = useQuery<AuthUser | null>({
  queryKey: ["/api/auth/me"],
  queryFn: getQueryFn({ on401: "returnNull" }),
  staleTime: 5 * 60 * 1000,
  retry: false,
});
```

---

## 7. ROUTING STRUCTURE

### Frontend Routes (Wouter)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | Home | Landing page with hero, quick actions, banners, social feed |
| `/catalog` | Catalog | Machine category browser + product detail |
| `/directory` | Directory | Industry directory listing |
| `/roi` | ROICalculator | ROI calculator |
| `/gst` | GSTCalculator | GST calculator |
| `/subsidies` | Subsidies | Government subsidy listings |
| `/service` | Service | Service request form |
| `/tools` | Tools | Tools hub grid |
| `/coil-rate` | CoilRate | Coil rate tracker |
| `/contact` | Contact | Contact info page |
| `/auth` | Auth | Login/Register/OTP/2FA flow |
| `/admin` | Admin | Admin panel (tabbed) |
| `/visit` | VisitBooking | Factory visit booking |
| `/suppliers` | Suppliers | Supplier directory |
| `/supplier/:id` | SupplierProfilePage | Individual supplier profile |
| `/support` | SupportTicketPage | Support ticket form |
| `/amc` | AmcPlansPage | AMC plan comparison |
| `/quotation` | QuotationPage | Quotation builder |
| `/emi` | EMICalculator | EMI calculator |
| `/terms` | Terms | Terms & conditions |
| `/privacy` | Privacy | Privacy policy |
| `/documents` | DocumentsPage | Document management |
| `/inspection` | InspectionPage | Quality inspection form |
| `/machine-health` | MachineHealthPage | Machine health check |
| `/quote-compare` | QuoteComparePage | Quotation comparison tool |
| `/training` | OperatorTrainingPage | Operator training guides |

### API Routes (Backend)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/logout` | Auth | Logout |
| GET | `/api/auth/me` | Auth | Current user |
| POST | `/api/auth/verify-email` | Public | Verify email OTP |
| POST | `/api/auth/verify-2fa` | Public | Verify 2FA code |
| POST | `/api/auth/resend-otp` | Public | Resend OTP |
| GET | `/api/products` | Public | List products |
| GET | `/api/products/:id` | Public | Product detail |
| GET | `/api/leads` | Public | List leads |
| POST | `/api/leads` | Public | Submit lead/inquiry |
| GET | `/api/service-requests` | Public | List service requests |
| POST | `/api/service-requests` | Public | Submit service request |
| GET | `/api/appointments` | Public | List appointments |
| POST | `/api/appointments` | Public | Book appointment |
| GET | `/api/dealers` | Public | List dealers |
| GET | `/api/posts` | Public | List social posts |
| GET | `/api/settings` | Public | App settings |
| GET | `/api/banners` | Public | Active banners |
| GET | `/api/market-prices` | Public | Latest market prices |
| GET | `/api/spare-parts` | Public | Spare parts catalog |
| GET | `/api/subsidies` | Public | Government subsidies |
| GET | `/api/suppliers` | Public | Supplier directory |
| GET | `/api/suppliers/:id` | Public | Supplier profile |
| GET | `/api/amc-plans` | Public | AMC plan list |
| POST | `/api/amc-subscribe` | Public | AMC subscription |
| GET | `/api/support-tickets` | Public | Support tickets |
| POST | `/api/support-tickets` | Public | Create ticket |
| GET | `/api/visitor-count` | Public | Visitor counter |
| POST | `/api/visitor-count` | Public | Increment visitor |
| GET | `/api/iso-documents` | Public | ISO documents |
| GET | `/api/iso-audits` | Public | ISO audits |
| GET | `/api/capas` | Public | CAPAs |
| GET | `/api/health-checks` | Public | Machine health checks |
| POST | `/api/health-checks` | Public | Submit health check |
| POST | `/api/quotation-compare` | Public | Compare quotations |
| POST | `/api/upload/:folder` | Admin | Upload file |
| POST | `/api/admin/*` | Admin | All admin CRUD routes |
| GET | `/api/admin/analytics` | Admin | Dashboard analytics |

---

## 8. DATABASE SCHEMA (25+ Tables)

### Core Tables

| Table | Key Fields |
|-------|-----------|
| `users` | id, username, password, email, name, phone, role (buyer/vendor/admin/sub_admin), isVerified, isApproved, isEmailVerified, twoFactorEnabled, allowedDevices[], lastDeviceFingerprint |
| `products` | id, name, category, subcategory, model, description, specifications (jsonb), features[], images[], price, stations, profileType, automation |
| `leads` | id, name, phone, email, interest, message, source, status (new/contacted/converted/lost), notes |
| `service_requests` | id, name, phone, machineType, issue, urgency, preferredDate, status |
| `appointments` | id, name, phone, email, company, purpose, preferredDate, preferredTime, status |

### Business Tables

| Table | Key Fields |
|-------|-----------|
| `quotations` | id, quotationNumber (SR-YYYY-NNNN), clientName, items (jsonb), subtotal, gstAmount, grandTotal, status, validUntil |
| `support_tickets` | id, ticketNumber, name, phone, machineModel, issueType, priority, description, status |
| `amc_plans` | id, name, tier (basic/standard/premium), visitsPerYear, price1Year, price2Year, features[], phoneSupport, emergencySupport |
| `amc_subscriptions` | id, planId, name, phone, email, machineModel, startDate, endDate, status |
| `spare_parts` | id, name, price, image, category, compatibility |

### Directory & Supplier Tables

| Table | Key Fields |
|-------|-----------|
| `supplier_profiles` | id, companyName, ownerName, gstNo, businessType, specialization, rating, isPremium, isVerified, isTopRated |
| `reviews` | id, supplierId, reviewerName, rating, comment, isVerifiedBuyer, isApproved |
| `dealers` | id, name, phone, location, state, rating, dailyRate, rateGauge, gstNo, isGstVerified, isFrozen |

### ISO QMS Tables

| Table | Key Fields |
|-------|-----------|
| `iso_documents` | id, documentNumber, title, category, version, status, fileUrl |
| `iso_audits` | id, auditNumber, auditType, auditorName, department, status, findings, nonConformities |
| `capas` | id, capaNumber, type (corrective/preventive/both), source, description, rootCause, status, effectiveness |

### Market & Analytics Tables

| Table | Key Fields |
|-------|-----------|
| `market_prices` | id, material (gp_coil/cr_coil/steel), price, previousPrice, trend (up/down/stable), prediction, upChance, downChance, region |
| `machine_health_checks` | id, operatorName, machineModel, noiseLevel, vibration, oilLeakage, productionAccuracy, overallScore |
| `quotation_comparisons` | id, quotation1, quotation2 (jsonb), comparisonResult (jsonb), score1, score2 |
| `banners` | id, title, subtitle, buttonText, buttonLink, bgColor, isActive, order |
| `visitor_counter` | total_visits, unique_visits, today_visits |

### Auth Tables

| Table | Key Fields |
|-------|-----------|
| `otp_codes` | id, userId, email, code, purpose (email_verify/login_2fa), expiresAt, isUsed |
| `app_settings` | id (default), companyName, whatsappNumber, chatbotEnabled, splashScreenEnabled, maintenanceMode, announcementText, etc. |

### ID Convention
All tables use UUID primary keys: `varchar("id").primaryKey().default(sql\`gen_random_uuid()\`)`

---

## 9. AUTHENTICATION FLOW

```
1. REGISTER → creates user (isApproved=false, isEmailVerified=false)
   → sends OTP to email
   → redirects to "verify-email" step

2. VERIFY EMAIL → validates OTP code
   → sets isEmailVerified=true
   → shows "pending admin approval" message

3. ADMIN APPROVAL → admin approves user in admin panel
   → sets isApproved=true
   → sends approval notification email

4. LOGIN → checks credentials
   → if !isEmailVerified → shows "verify email" error
   → if !isApproved → shows "pending approval" error
   → if allowedDevices set → checks device fingerprint
   → if twoFactorEnabled → sends 2FA OTP, redirects to "verify-2fa"
   → otherwise → creates session, returns user

5. 2FA VERIFY → validates 2FA OTP
   → creates session, returns user
```

### Session Config
- Store: PostgreSQL (connect-pg-simple)
- Cookie: 30 days, httpOnly, secure in production, sameSite: lax
- Passport.js LocalStrategy

---

## 10. STYLING RULES & CONVENTIONS

### Typography Scale

| Usage | Classes |
|-------|---------|
| Page title | `text-xl font-bold` |
| Section heading | `text-sm font-bold` |
| Card title | `text-sm font-semibold` |
| Body text | `text-sm` |
| Small text | `text-xs` |
| Tiny text | `text-[10px]` or `text-[11px]` |
| Micro text | `text-[9px]` or `text-[8px]` |
| Uppercase label | `text-xs uppercase tracking-widest text-muted-foreground` |

### Spacing

| Context | Class |
|---------|-------|
| Page padding | `px-4 pt-4 pb-24` |
| Section gap | `mb-4` or `mb-6` |
| Card padding | `p-3` or `p-4` |
| Form spacing | `space-y-4` |
| Icon size | `w-4 h-4` (standard), `w-5 h-5` (nav), `w-3 h-3` (inline) |

### Border Radius

| Element | Class |
|---------|-------|
| Cards | `rounded-md` or `rounded-lg` |
| Buttons | `rounded-md` |
| Badges | default from Shadcn |
| Icons in colored bg | `rounded-md` |
| FABs | `rounded-full` |

### Interactive Elements

All interactive elements must have `data-testid` attributes:
- Buttons: `data-testid="button-{action}-{target}"`
- Inputs: `data-testid="input-{field}"`
- Links: `data-testid="link-{target}"`
- Dynamic: `data-testid="card-{type}-${id}"`

### Elevation System (CSS)

The app uses a custom elevation system for hover/active states:
- `.hover-elevate` — subtle brightness on hover
- `.active-elevate-2` — stronger brightness on active
- `.toggle-elevate` / `.toggle-elevated` — toggle state backgrounds
- Uses `::before` (toggle layer) and `::after` (hover/active layer)

---

## 11. ANIMATION PATTERNS (Framer Motion)

### Page/Section Entry

```tsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

### Carousel Slide

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentIndex}
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -30 }}
    transition={{ duration: 0.3 }}
  >
```

### Spring Pop (buttons, FABs)

```tsx
<motion.button
  whileTap={{ scale: 0.9 }}
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring", delay: 0.5 }}
>
```

### Chat Window

```tsx
initial={{ opacity: 0, y: 20, scale: 0.9 }}
animate={{ opacity: 1, y: 0, scale: 1 }}
exit={{ opacity: 0, y: 20, scale: 0.9 }}
transition={{ type: "spring", stiffness: 300, damping: 25 }}
```

### Progress Bar Fill

```tsx
<motion.div
  className="h-2 rounded-full bg-green-500"
  initial={{ width: 0 }}
  animate={{ width: `${percentage}%` }}
  transition={{ duration: 0.8, ease: "easeOut" }}
/>
```

---

## 12. SPECIAL UI COMPONENTS

### Dealer Rate Gauge (SVG)

Custom SVG gauge showing rate from 0-120:
- Semi-circle arc with colored needle
- Color coding: GREEN (≤55) → AMBER (≤70) → ORANGE (≤85) → RED (>85)
- Labels: LOW / MID / HIGH / PEAK
- Smooth needle rotation via CSS transform transition

### Market Price Cards

- Grid layout (2 columns)
- Each card: material name, current price in ₹, trend badge (UP/DOWN/STABLE), previous price with % change
- Prediction section: progress bars for up/down chance percentages

### Social Feed (Instagram-style)

- Image posts with carousel (swipeable images)
- Heart/Like button with count
- Share button
- Author name + timestamp
- "Aur Dekhein" (See More) expansion

### Quotation Builder

- Multi-step form
- Line items with quantity × rate calculations
- Auto GST calculation (18%)
- Grand total computation
- PDF-ready quotation number format: SR-YYYY-NNNN

---

## 13. ADMIN PANEL STRUCTURE

### Tabs

| Tab | Features |
|-----|----------|
| Dashboard | Stat cards (total products, leads, tickets, etc.), pending counts |
| Analytics | Conversion rates, lead distribution charts, revenue tracking |
| Leads | Lead table, status management (new/contacted/converted/lost) |
| Service | Service request management |
| Appointments | Visit booking management |
| Products | CRUD with image upload, category management |
| Posts | Social feed post management |
| Dealers | Dealer management with freeze/unfreeze |
| Banners | Banner CRUD with gradient selector |
| Market | Market price updates (GP Coil, CR Coil, Steel) |
| Users | User approval, 2FA toggle, device management (super admin only) |
| Settings | App settings toggle, company info, chatbot config (super admin only) |

### Admin Tab Navigation Pattern

```tsx
const tabs = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "leads", label: "Leads", icon: MessageSquare },
  ...
];

<div className="flex gap-2 overflow-x-auto px-4 mb-4 scrollbar-hide">
  {tabs.map((tab) => (
    <button className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
      activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-card border text-muted-foreground"
    }`}>
      <tab.icon className="w-3.5 h-3.5" />
      {tab.label}
    </button>
  ))}
</div>
```

---

## 14. BACKEND PATTERNS

### Express Server Setup

```typescript
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
setupAuth(app);           // Session + Passport + auth routes
await seedDatabase();      // Initial data seeding
await registerRoutes(httpServer, app);  // API routes
// Error handler
// Vite dev server (development) or static serving (production)
httpServer.listen(5000);
```

### Storage Layer Pattern

```typescript
// Interface-style class with all CRUD methods
class DatabaseStorage {
  async getProducts(): Promise<Product[]> { ... }
  async getProduct(id: string): Promise<Product | undefined> { ... }
  async createProduct(product: InsertProduct): Promise<Product> { ... }
  async updateProduct(id: string, data: Partial<Product>): Promise<Product | undefined> { ... }
  async deleteProduct(id: string): Promise<boolean> { ... }
  // ... similar pattern for all 25+ tables
}
export const storage = new DatabaseStorage();
```

### Route Pattern

```typescript
app.get("/api/products", async (_req, res) => {
  const products = await storage.getProducts();
  res.json(products);
});

app.post("/api/admin/products", requireAdmin, async (req, res) => {
  const parsed = insertProductSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: parsed.error.message });
  const product = await storage.createProduct(parsed.data);
  res.status(201).json(product);
});
```

### Auth Middleware

```typescript
export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Authentication required" });
  next();
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Authentication required" });
  if (req.user!.role !== "admin" && req.user!.role !== "sub_admin") return res.status(403).json({ message: "Admin access required" });
  next();
};
```

---

## 15. SEED DATA STRUCTURE

The seed creates sample data for all tables:
- 1 admin user (username: admin, password: admin123)
- 6 products across categories
- 4 dealers with rates
- 4 social posts with images
- 5 government subsidies
- 6 spare parts
- 5 supplier profiles with reviews
- 3 AMC plans (Basic/Standard/Premium)
- App settings with defaults

---

## 16. KEY DEPENDENCIES (package.json)

### Frontend
```
@tanstack/react-query, wouter, framer-motion, lucide-react, react-icons
@radix-ui/* (all Shadcn/ui primitives)
react-hook-form, @hookform/resolvers, zod
tailwindcss, tailwindcss-animate, @tailwindcss/typography
```

### Backend
```
express, express-session, connect-pg-simple
passport, passport-local
drizzle-orm, @neondatabase/serverless, drizzle-zod, drizzle-kit
nodemailer, multer, firebase-admin
zod, crypto (built-in)
```

### Dev
```
typescript, tsx, vite, @vitejs/plugin-react
@types/express, @types/passport, @types/express-session
@types/nodemailer, @types/multer
esbuild
```

---

## 17. ENVIRONMENT VARIABLES

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| SESSION_SECRET | Yes | Express session secret |
| SMTP_USER | No | Gmail/SMTP username for OTP emails |
| SMTP_PASS | No | Gmail/SMTP app password |
| SMTP_HOST | No | SMTP host (default: smtp.gmail.com) |
| SMTP_PORT | No | SMTP port (default: 587) |
| FIREBASE_SERVICE_ACCOUNT | No | Firebase service account JSON for file uploads |

---

## 18. HOW TO REPLICATE IN A NEW PROJECT

1. **Set up Vite + React + TypeScript project**
2. **Install all dependencies** from Section 16
3. **Copy the folder structure** from Section 2
4. **Set up Tailwind** with the CSS variables from Section 3
5. **Create the database schema** using Drizzle (Section 8)
6. **Set up Express backend** with the patterns from Section 14
7. **Implement auth** following Section 9
8. **Build pages** following the page template pattern (Section 4)
9. **Add global components**: Header, BottomNav, ChatBot, WhatsApp (Section 5)
10. **Set up data fetching** with TanStack Query (Section 6)
11. **Add animations** with Framer Motion (Section 11)
12. **Seed the database** with initial data (Section 15)
13. **Configure environment variables** (Section 17)

---

---

## 19. CATALOG CATEGORIES (Complete Reference)

### 7 Machine Categories with Visual Config

| # | Category Name | Icon (Lucide) | Gradient | Description |
|---|--------------|---------------|----------|-------------|
| 1 | Rolling Shutter | `Layers` | `from-indigo-600 to-blue-700` | Shutter Patti, Guide Rail machines |
| 2 | False Ceiling | `Grid3X3` | `from-emerald-600 to-teal-700` | POP, Gypsum, T-Grid machines |
| 3 | Door & Window | `Box` | `from-amber-600 to-orange-700` | Door Frame, Window Section |
| 4 | Roofing & Cladding | `Factory` | `from-slate-700 to-zinc-800` | Trapezoidal, Corrugated Sheet |
| 5 | Structural | `Cog` | `from-violet-600 to-purple-700` | C-Purlin, Z-Purlin machines |
| 6 | Solar & Infrastructure | `Zap` | `from-sky-600 to-cyan-700` | Solar Channel, Guard Rail |
| 7 | Drywall & Partition | `Layers` | `from-rose-600 to-pink-700` | C-Channel, Stud machines |

### Category Grid Layout
- Grid: `grid-cols-3 gap-2`
- Shows first 6 categories by default, "Show All" button for remaining
- Each card: gradient icon badge (9×9 rounded-lg) + name + desc + machine count badge
- Selected: `border-primary bg-primary/5 shadow-md`

### Sub-Categories by Category

**Rolling Shutter:**
- Shutter Patti — profiles: Round Type, Ribbed Type, Perforated, Flat Type
- Guide Rail — profiles: U-Channel Guide

**False Ceiling:**
- POP Channel — profiles: Ceiling Channel, Perimeter Channel, Intermediate Channel, Angle Channel
- Main Channel — profiles: Main Channel, Furring Channel
- T-Grid — profiles: Main Tee, Cross Tee
- Multi Profile — profiles: POP + Main + Furring + T-Grid + Angle
- Gypsum Channel — profiles: Ceiling, Perimeter, Intermediate, Angle Channel

**Door & Window:**
- Door Frame — Steel Door Chaukhat
- Window Section — Window Z-Section

**Roofing & Cladding:**
- Trapezoidal Sheet — Trapezoidal Roofing Profile
- Corrugated Sheet — Corrugated Wave Profile

**Structural:**
- Z-Purlin — Z-Section Purlin
- C-Purlin — C-Section Purlin

**Solar & Infrastructure:**
- Solar Structure — Solar Mounting Channel
- Guard Rail — W-Beam Guard Rail

**Drywall & Partition:**
- C-Channel / Stud — C-Channel + Stud + Track
- Partition Section — Partition Wall Section

### Sub-Category Info Map

```tsx
const SUBCATEGORY_INFO: Record<string, { desc: string; machineTypes: string[]; profiles: string[] }> = {
  "Gypsum Channel": {
    desc: "Gypsum false ceiling system ke 4 profiles",
    machineTypes: ["Single Machine", "2-in-1 Machine", "4-in-1 Machine"],
    profiles: ["Ceiling Channel", "Perimeter Channel", "Intermediate Channel", "Angle Channel"],
  },
  "POP Channel": {
    desc: "POP false ceiling system ke profiles",
    machineTypes: ["Single Machine", "2-in-1 Machine", "3-in-1 Machine"],
    profiles: ["Main Channel", "Cross Channel", "Angle Channel"],
  },
  "Multi Profile": {
    desc: "Multiple profiles in one machine",
    machineTypes: ["3-in-1 Machine"],
    profiles: ["Main + Cross + Angle Channel"],
  },
  "Shutter Patti": {
    desc: "Rolling shutter strip forming",
    machineTypes: ["Single Machine"],
    profiles: ["Round Type", "Ribbed Type", "Perforated", "Flat Type"],
  },
};
```

### Catalog Page Flow

```
1. Default view: Category Grid (3-col) + Used Machines section
2. User taps category → shows subcategory sections with products in 2-col grid
3. Back button returns to category grid
4. Search bar: filters products by name/category/subCategory/profileType/description
5. Product card tap → full Product Detail page (sticky header, gallery, specs, WhatsApp CTA)
```

### Product Card Layout

```
┌──────────────────────────┐
│ [Image 4:3 ratio]        │
│  ┌USED┐       ┌Model┐   │
│  └────┘       └─────┘   │
├──────────────────────────┤
│ Product Name (11px bold) │
│ ┌MachineType┐ ┌Auto┐    │
│ Profile: Flat + Curving  │
│ ₹8.95L           Delhi   │
└──────────────────────────┘
```

---

## 20. TOOLS PAGE (Complete Reference)

### 5 Tool Categories × 2-Column Grid

```
Tools & Resources
────────────────────────────────
BUSINESS TOOLS
┌─────────────┐ ┌─────────────┐
│ 📈 ROI      │ │ 🧮 GST     │
│ Calculator   │ │ Calculator  │
├─────────────┤ ├─────────────┤
│ 💰 EMI      │ │ ₹ Coil     │
│ Calculator   │ │ Rate        │
└─────────────┘ └─────────────┘

QUOTATION & SALES
┌─────────────┐ ┌─────────────┐
│ 📋 Quotation│ │ ⚖️ Compare │
│              │ │ Quotes      │
├─────────────┤ └─────────────┘
│ 📄 Subsidies│
└─────────────┘

MACHINE & QUALITY
┌─────────────┐ ┌─────────────┐
│ 💚 Health   │ │ 📖 Training │
│ Score        │ │ Guide       │
├─────────────┤ ├─────────────┤
│ ✅ QC       │ │ 📁 Documents│
│ Inspection   │ │              │
└─────────────┘ └─────────────┘

SERVICES & SUPPORT
┌─────────────┐ ┌─────────────┐
│ 🔧 Service  │ │ 🎧 Support │
│ Request      │ │ Ticket      │
├─────────────┤ ├─────────────┤
│ 📅 Factory  │ │ 🛡️ AMC     │
│ Visit        │ │ Plans       │
└─────────────┘ └─────────────┘

DIRECTORY
┌─────────────┐ ┌─────────────┐
│ 👥 Dealers  │ │ 🏢 Suppliers│
└─────────────┘ └─────────────┘
```

### Complete Tool Definitions

| # | Category | Tool Label | Path | Icon (Lucide) | Color |
|---|----------|-----------|------|---------------|-------|
| 1 | Business Tools | ROI Calculator | `/roi` | `TrendingUp` | `bg-emerald-500/10 text-emerald-600` |
| 2 | Business Tools | GST Calculator | `/gst` | `Calculator` | `bg-violet-500/10 text-violet-600` |
| 3 | Business Tools | EMI Calculator | `/emi` | `Banknote` | `bg-teal-500/10 text-teal-600` |
| 4 | Business Tools | Coil Rate | `/coil-rate` | `IndianRupee` | `bg-amber-500/10 text-amber-600` |
| 5 | Quotation & Sales | Quotation | `/quotation` | `FileSpreadsheet` | `bg-rose-500/10 text-rose-600` |
| 6 | Quotation & Sales | Compare Quotes | `/quote-compare` | `Scale` | `bg-violet-500/10 text-violet-600` |
| 7 | Quotation & Sales | Subsidies | `/subsidies` | `FileText` | `bg-blue-500/10 text-blue-600` |
| 8 | Machine & Quality | Health Score | `/machine-health` | `Activity` | `bg-green-500/10 text-green-600` |
| 9 | Machine & Quality | Training Guide | `/training` | `BookOpen` | `bg-pink-500/10 text-pink-600` |
| 10 | Machine & Quality | QC Inspection | `/inspection` | `ClipboardCheck` | `bg-teal-500/10 text-teal-600` |
| 11 | Machine & Quality | Documents | `/documents` | `FolderOpen` | `bg-sky-500/10 text-sky-600` |
| 12 | Services & Support | Service Request | `/service` | `Wrench` | `bg-orange-500/10 text-orange-600` |
| 13 | Services & Support | Support Ticket | `/support` | `Headphones` | `bg-red-500/10 text-red-600` |
| 14 | Services & Support | Factory Visit | `/visit` | `CalendarCheck` | `bg-cyan-500/10 text-cyan-600` |
| 15 | Services & Support | AMC Plans | `/amc` | `Shield` | `bg-purple-500/10 text-purple-600` |
| 16 | Directory | Dealers | `/directory` | `Users` | `bg-pink-500/10 text-pink-600` |
| 17 | Directory | Suppliers | `/suppliers` | `Building2` | `bg-indigo-500/10 text-indigo-600` |

### Tool Card Layout

```tsx
<Card className="p-3 cursor-pointer hover-elevate active:scale-[0.98]">
  <div className="flex items-center gap-2.5">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tool.color}`}>
      <tool.icon className="w-4.5 h-4.5" />
    </div>
    <p className="text-xs font-semibold leading-tight">{tool.label}</p>
  </div>
</Card>
```

### Bottom CTA Card (Expert Help)

```
┌─────────────────────────────────────────┐
│ 📞 Need Expert Help?                    │
│    Machine consultation & support       │
│                    [Call Now] [WhatsApp] │
└─────────────────────────────────────────┘
bg: bg-primary/5 border-primary/10
```

---

## 21. FONTS & TYPOGRAPHY (Complete Reference)

### Font Stack

```css
--font-sans: Inter, system-ui, sans-serif;     /* Primary body font */
--font-serif: Georgia, serif;                   /* Not used in app */
--font-mono: JetBrains Mono, monospace;         /* Code/technical text */
```

### Font Loading

Fonts are loaded via Google Fonts CDN in `client/index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Typography Usage Map

| Element | Font Weight | Size Class | Extra Classes |
|---------|------------|------------|---------------|
| Splash title | `font-bold` | `text-2xl` | `text-white` |
| Splash subtitle | `font-medium` | `text-xs` | `text-white/70 uppercase tracking-[0.3em]` |
| Header brand name | `font-bold` | `text-sm` | `leading-none` |
| Header tagline | `font-medium` | `text-[10px]` | `uppercase tracking-widest text-muted-foreground` |
| Hero title | `font-bold` | `text-2xl sm:text-3xl` | `text-white leading-tight` |
| Hero subtitle | — | `text-sm` | `text-white/80` |
| Hero label | `font-semibold` | `text-xs` | `text-primary-foreground/70 uppercase tracking-widest` |
| Page title | `font-bold` | `text-xl` | — |
| Section heading | `font-bold` | `text-sm` | — |
| Category group label | `font-semibold` | `text-[11px]` | `uppercase tracking-wider text-muted-foreground` |
| Card title | `font-semibold` or `font-bold` | `text-xs` or `text-[11px]` | `leading-tight` |
| Product price | `font-bold` | `text-sm` or `text-lg` | `text-primary` |
| Body text | — | `text-sm` | `leading-relaxed` |
| Form label | — | `text-[10px]` | `Label component` |
| Input text | — | `text-xs` | — |
| Badge text | — | `text-[8px]` to `text-xs` | — |
| Quick action label | `font-medium` | `text-xs` | `text-foreground` |
| Bottom nav label | `font-medium` | `text-[10px]` | — |
| Footer text | — | `text-[10px]` | `text-muted-foreground` |
| Gauge value | `font-bold` | `text-lg` | dynamic color |
| Dealer rate | `font-bold` | `text-lg` | `text-amber-400` |
| Prediction text | — | `text-[10px]` | `italic text-muted-foreground` |

### Weight Distribution
- `font-bold` (700): Titles, headings, prices, brand name
- `font-semibold` (600): Card titles, tool labels, group labels
- `font-medium` (500): Nav labels, quick action labels, subtle emphasis
- Default (400): Body text, descriptions, form inputs

---

## 22. BANNER SYSTEM (Complete Reference)

### Banner Data Model

```typescript
banners = pgTable("banners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  buttonText: text("button_text"),
  buttonLink: text("button_link"),
  bgColor: text("bg_color"),                // Gradient class key
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Available Banner Gradients

Banners are managed through admin panel. Available gradient options:

| Key | Tailwind Classes |
|-----|-----------------|
| `from-blue-600 to-cyan-600` | Blue to Cyan |
| `from-emerald-600 to-teal-600` | Green to Teal |
| `from-indigo-600 to-purple-600` | Indigo to Purple (default) |
| `from-orange-500 to-red-500` | Orange to Red |
| `from-slate-700 to-slate-900` | Slate Dark |
| `from-amber-600 to-orange-700` | Amber to Orange |
| `from-zinc-700 to-neutral-900` | Zinc Dark |
| `from-teal-600 to-cyan-700` | Teal to Cyan |
| `from-violet-600 to-purple-800` | Violet Deep |
| `from-rose-600 to-pink-800` | Rose to Pink |
| `from-sky-600 to-blue-800` | Sky to Blue |
| `from-red-600 to-rose-800` | Red to Rose |

### Banner Carousel Behavior
- Auto-rotates every 4 seconds
- AnimatePresence slide animation (x: 30 → 0 → -30)
- Each banner shows: title, subtitle, phone number, CTA button, Call Now button
- Dot indicators: `w-1.5 h-1.5 rounded-full` (active: `bg-white w-4`)
- Fetched from `/api/banners` (only active, sorted by order)
- Created/managed exclusively via Admin Panel → Banners tab

### Banner Card Layout

```
┌─────────────────────────────────────────┐
│ [Gradient Background]                    │
│                                          │
│ Banner Title (sm font-bold)              │
│ Subtitle text (xs white/80)              │
│ 📞 +91 9090-486-262                      │
│                                          │
│ [CTA Button]  [Call Now]     ● ○ ○       │
└─────────────────────────────────────────┘
```

---

## 23. HOME PAGE SECTION ORDER (Top to Bottom)

```
┌──────────────────────────────────────┐
│ AppHeader (sticky top, z-40)         │
│  [S] Sai Rolotech                    │
│      INDUSTRIAL ECOSYSTEM    [👤][⚙]│
├──────────────────────────────────────┤
│                                      │
│ 1. HeroSection                       │
│    ┌────────────────────────────┐    │
│    │ [Machine Hero Image]       │    │
│    │ ───gradient overlay───     │    │
│    │ INDUSTRIAL ECOSYSTEM       │    │
│    │ Sai Rolotech               │    │
│    │ Roll Forming Machines...   │    │
│    │ [Explore] [Contact Us]     │    │
│    └────────────────────────────┘    │
│                                      │
│ 2. BannerCarousel (auto-rotate 4s)   │
│    ┌────────────────────────────┐    │
│    │ [Gradient BG]              │    │
│    │ Banner Title               │    │
│    │ Subtitle                   │    │
│    │ 📞 +91 9090-486-262        │    │
│    │ [CTA] [Call Now]    ●○○    │    │
│    └────────────────────────────┘    │
│                                      │
│ 3. GPCoilDealerBanner (auto 5s)      │
│    ┌────────────────────────────┐    │
│    │ [Dark gradient bg]         │    │
│    │ GP COIL DEALER [VERIFIED]  │    │
│    │ Dealer Name                │    │
│    │ Location / Phone / GST     │    │
│    │         [SVG Gauge] ₹72.50 │    │
│    │ [WhatsApp] [Call]  ●○○○    │    │
│    └────────────────────────────┘    │
│                                      │
│ 4. QuickActions (horizontal scroll)  │
│    ◄ [Machines][Suppliers][Support]  │
│      [AMC][Visit][Service][...]  ►   │
│    (14 items, min-w-72px each)       │
│                                      │
│ 5. DailyRateTracker                  │
│    ┌────────────────────────────┐    │
│    │ Market Prices (grid 2-col) │    │
│    │ GP Coil ₹74.50  CR ₹82.00 │    │
│    │ ▲ trend %   ▼ trend %      │    │
│    │ Prediction bars (up/down)  │    │
│    └────────────────────────────┘    │
│                                      │
│ 6. OperatorRegistration              │
│    ┌────────────────────────────┐    │
│    │ Machine Operator Reg Form  │    │
│    │ Name, Phone, Aadhaar       │    │
│    │ Experience, Machine Type   │    │
│    │ Salary, Address, City      │    │
│    │ [Register Operator]        │    │
│    └────────────────────────────┘    │
│                                      │
│ 7. VisitorCounter                    │
│    ┌────────────────────────────┐    │
│    │ 👁 Total Visitors: 12,345  │    │
│    │                Today: 45 🟢│    │
│    └────────────────────────────┘    │
│                                      │
│ 8. Social Feed ("Latest Updates")    │
│    ┌────────────────────────────┐    │
│    │ [S] Author ✓    2h ago     │    │
│    │ [Post Image 4:3]           │    │
│    │ ❤ 452  🔗 Share            │    │
│    │ Caption text...            │    │
│    └────────────────────────────┘    │
│    (repeat for each post)            │
│                                      │
│ 9. Footer                            │
│    M/S Sai Rolotech                  │
│    [Terms] [Privacy] [Contact]       │
│                                      │
├──────────────────────────────────────┤
│ BottomNav (fixed, z-50)              │
│ [Home] [Machines] [Tools] [Contact]  │
└──────────────────────────────────────┘
│ ChatBot FAB (bottom-[72px] right-3)  │
│ WhatsApp FAB (bottom-[72px] left-3)  │
```

### 14 Quick Actions (Exact Order)

| # | Icon | Label | Path | Color |
|---|------|-------|------|-------|
| 1 | `Factory` | Machines | `/catalog` | `bg-primary/10 text-primary` |
| 2 | `Building2` | Suppliers | `/suppliers` | `bg-indigo-500/10 text-indigo-600` |
| 3 | `Headphones` | Support | `/support` | `bg-red-500/10 text-red-600` |
| 4 | `Shield` | AMC | `/amc` | `bg-purple-500/10 text-purple-600` |
| 5 | `CalendarCheck` | Visit | `/visit` | `bg-cyan-500/10 text-cyan-600` |
| 6 | `Wrench` | Service | `/service` | `bg-amber-500/10 text-amber-600` |
| 7 | `FileSpreadsheet` | Quotation | `/quotation` | `bg-rose-500/10 text-rose-600` |
| 8 | `Calculator` | ROI Calc | `/roi` | `bg-emerald-500/10 text-emerald-600` |
| 9 | `FolderOpen` | Documents | `/documents` | `bg-sky-500/10 text-sky-600` |
| 10 | `ClipboardCheck` | QC Check | `/inspection` | `bg-teal-500/10 text-teal-600` |
| 11 | `TrendingUp` | Market | `/coil-rate` | `bg-orange-500/10 text-orange-600` |
| 12 | `Activity` | Health | `/machine-health` | `bg-green-500/10 text-green-600` |
| 13 | `Scale` | Compare | `/quote-compare` | `bg-violet-500/10 text-violet-600` |
| 14 | `BookOpen` | Training | `/training` | `bg-pink-500/10 text-pink-600` |

---

## 24. SEED DATA — COMPLETE PRODUCT CATALOG

### New Machines (16 products)

| # | Name | Category | SubCategory | MachineType | Automation | Model | Price (Lakh) |
|---|------|----------|-------------|-------------|------------|-------|-------------|
| 1 | Shutter Patti Roll Forming Machine | Rolling Shutter | Shutter Patti | Single Machine | Fully Automatic | Advance | 8.95 |
| 2 | Shutter Patti 2-in-1 Heavy Duty | Rolling Shutter | Shutter Patti | Two in One Machine | Fully Automatic | Advance | 18.00 |
| 3 | Shutter Patti Basic Economy | Rolling Shutter | Shutter Patti | Single Machine | Semi-Automatic | Basic | 2.80 |
| 4 | Shutter Guide Rail Machine | Rolling Shutter | Guide Rail | Single Machine | Fully Automatic | Medium | 6.50 |
| 5 | POP Channel High-Speed Line | False Ceiling | POP Channel | Single Machine | Fully Automatic | Advance | 13.50 |
| 6 | Main Channel & Furring 2-in-1 | False Ceiling | Main Channel | Two in One Machine | Fully Automatic | Advance | 16.00 |
| 7 | T-Grid Automatic Production Line | False Ceiling | T-Grid | Single Machine | Fully Automatic | Advance | 15.50 |
| 8 | False Ceiling 10-Profile Setup | False Ceiling | Multi Profile | Multi Profile Setup | Fully Automatic | Advance | 45.00 |
| 9 | C-Channel & Stud 3-in-1 | Drywall & Partition | C-Channel / Stud | Three in One Machine | Semi-Automatic | Medium | 11.00 |
| 10 | Partition Section Machine | Drywall & Partition | Partition Section | Single Machine | Semi-Automatic | Basic | 5.50 |
| 11 | Z-Purlin Roll Forming Machine | Structural | Z-Purlin | Single Machine | Fully Automatic | Advance | 22.00 |
| 12 | C-Purlin Roll Forming Machine | Structural | C-Purlin | Single Machine | Fully Automatic | Advance | 25.00 |
| 13 | Door Frame Roll Forming Machine | Door & Window | Door Frame | Single Machine | Fully Automatic | Medium | 12.00 |
| 14 | Window Section Machine | Door & Window | Window Section | Single Machine | Semi-Automatic | Medium | 8.50 |
| 15 | Roofing Sheet Machine (Trapezoidal) | Roofing & Cladding | Trapezoidal Sheet | Single Machine | Fully Automatic | Advance | 18.00 |
| 16 | Corrugated Sheet Machine | Roofing & Cladding | Corrugated Sheet | Single Machine | Fully Automatic | Medium | 10.00 |
| 17 | Solar Panel Mounting Channel Machine | Solar & Infrastructure | Solar Structure | Single Machine | Fully Automatic | Medium | 9.50 |
| 18 | Highway Guard Rail Machine | Solar & Infrastructure | Guard Rail | Single Machine | Fully Automatic | Advance | 55.00 |

### Used Machines (3 products)

| # | Name | Category | Condition | Location | Year | Price (Lakh) |
|---|------|----------|-----------|----------|------|-------------|
| 1 | 2021 POP Channel Machine | False Ceiling | Excellent | Ghaziabad, UP | 2021 | 5.50 |
| 2 | 2019 Shutter Patti Semi-Auto | Rolling Shutter | Good | Delhi | 2019 | 3.20 |
| 3 | 2022 C-Channel Machine | Drywall & Partition | Excellent | Noida, UP | 2022 | 4.80 |

### Seed Dealers (4)

| Name | Location | State | Daily Rate (₹/kg) | Rating |
|------|----------|-------|-------------------|--------|
| Aggarwal Steel Traders | Loha Mandi, Delhi | Delhi | 72.50 | 4.8 (156) |
| Sharma Iron & Steel | Mundka, Delhi | Delhi | 73.00 | 4.5 (89) |
| Gupta Steels Pvt Ltd | Ghaziabad, UP | Uttar Pradesh | 71.80 | 4.6 (203) |
| Rajdhani Metal Corporation | Faridabad, Haryana | Haryana | 74.00 | 4.3 (67) |

### Seed Supplier Profiles (5)

| Company | Owner | Type | City | Rating | Badges |
|---------|-------|------|------|--------|--------|
| Sai Rolotech Industries | Vipin Gupta | Manufacturer | New Delhi | 4.8 | Premium, Verified, TopRated |
| Bharat Roll Forming | Rakesh Sharma | Manufacturer | New Delhi | 4.5 | Verified |
| Gupta Engineering Works | Amit Gupta | Manufacturer | Noida | 4.2 | — |
| Rajdhani Industrial Solutions | Sunil Aggarwal | Trader | Faridabad | 3.8 | — |
| Maharashtra Steel Machines Pvt Ltd | Pravin Patil | Manufacturer | Pune | 4.6 | Premium, Verified, TopRated |

### Seed AMC Plans (3 tiers)

| Plan | Tier | Visits/Year | 1-Year Price | 2-Year Price | Key Features |
|------|------|-------------|-------------|-------------|--------------|
| Basic AMC | basic | 2 | ₹15,000 | ₹25,000 | Phone support, 10% spare discount |
| Standard AMC | standard | 4 | ₹25,000 | ₹42,000 | Priority support, 48hr response, training |
| Premium AMC | premium | 4 | ₹45,000 | ₹78,000 | 24/7 emergency, all labor free, dedicated partner |

---

## 25. GP COIL DEALER BANNER (Detailed)

### Visual Layout

```
┌─────────────────────────────────────────┐
│ ┌amber glow─────────────────────────┐   │
│ │  bg: from-slate-900 via-slate-800 │   │
│ │      to-zinc-900                  │   │
│ │                                   │   │
│ │ [Store] GP COIL DEALER [VERIFIED] │   │
│ │         Today's Rate with Gauge   │   │
│ │                                   │   │
│ │ ┌─LEFT──────────┐ ┌─RIGHT────┐   │   │
│ │ │ Dealer Name    │ │ SVG      │   │   │
│ │ │ 📍 Location    │ │ Gauge    │   │   │
│ │ │ 📞 Phone       │ │ ₹72.50  │   │   │
│ │ │ 🛡 GST No.     │ │ /kg     │   │   │
│ │ │ ⭐ 4.8 (156)   │ │ [LOW]   │   │   │
│ │ └────────────────┘ └──────────┘   │   │
│ │                                   │   │
│ │ [WhatsApp] [Call Now]    ●○○○     │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Rate Gauge SVG Details

```
Semi-circle (10,50) to (90,50) with radius 40
Sections: GREEN (≤55) → AMBER (≤70) → ORANGE (≤85) → RED (>85)
Needle: rotates from -90° to +90° based on rate/maxRate
Center dot: r=4, color matches section
Labels: LOW / MID / HIGH / PEAK
```

### Dealer Banner Auto-Rotation
- Cycles through active dealers every 5 seconds
- Only shows dealers with `isActive=true` and `dailyRate > 0`
- AnimatePresence with slide animation

---

*This document covers the complete UI structure, styling patterns, component architecture, data flow, and backend patterns used in the Sai Rolotech Industrial Ecosystem Platform.*

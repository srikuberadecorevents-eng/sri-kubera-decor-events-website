# Sri Kubera Decor & Events — Web Application & Admin Panel

Production-ready web application and complete, responsive administrative panel for **Sri Kubera Decor & Events** — stage decoration and event styling studio based in Puducherry, India.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router, Turbopack, React 19, TypeScript) |
| Styling | Tailwind CSS v4 (Emerald `#0B4A3A`, Gold `#C9A24B`, Warm Ivory `#FAF6EC`) |
| Admin UI | Responsive Shell, Desktop Sidebar, Mobile Bottom Bar (< 768px), Drag-and-Drop (`@dnd-kit`) |
| Image Pipeline | `browser-image-compression` (client resize) + Sharp (server magic bytes, EXIF strip, dual WebP variants) |
| Database & Auth | Supabase (PostgreSQL, Row Level Security, Realtime badges, Storage) |
| Proxy / Security | `src/proxy.ts` (Next.js 16 proxy), 12-hour inactivity sign-out, server-side `is_admin()` checks |
| Notifications | Resend (email alerts for new enquiries and requirement leads) |
| PDF Receipts | jsPDF |
| Hosting | Netlify (Serverless) |

---

## 2. Project Folder Structure

```
kubera-decor/
├── .github/
│   └── workflows/
│       └── ci-cd.yml                # Automated CI/CD pipeline (lint, typecheck, build, deploy)
├── public/                          # Static assets, hero images, icons
├── scripts/
│   ├── optimize-images.mjs          # Script to compress and generate WebP image variants
│   └── qa-runner.js                 # Playwright automated QA verification script
├── src/
│   ├── app/                         # App Router (routes, layouts, templates, and handlers only)
│   │   ├── actions/                 # Server actions (e.g. revalidate.ts)
│   │   ├── admin/                   # Admin panel routes
│   │   │   ├── 403/                 # Forbidden access page
│   │   │   ├── activity/            # Administrative activity log
│   │   │   ├── calendar/            # Event calendar and date clash views
│   │   │   ├── categories/          # Category management
│   │   │   ├── customers/           # Customer directory and history
│   │   │   ├── designs/             # Design catalog management
│   │   │   ├── enquiries/           # Booking enquiry pipeline
│   │   │   ├── gallery/             # Photo gallery manager
│   │   │   ├── login/               # Dedicated admin login
│   │   │   ├── media/               # Centralized media library
│   │   │   ├── requirements/        # Custom lead management
│   │   │   ├── services/            # Service catalog manager
│   │   │   ├── settings/            # Business & account settings
│   │   │   ├── site-content/        # Hero slides, proprietor info, stats
│   │   │   ├── testimonials/        # Customer review management
│   │   │   ├── users/               # User permissions
│   │   │   ├── layout.tsx           # Admin shell wrapper with auth check
│   │   │   └── page.tsx             # Admin dashboard with KPIs
│   │   ├── api/                     # Route handlers
│   │   │   ├── admin/upload/        # Secure server-side image upload handler
│   │   │   ├── enquiry/             # Customer enquiry submission endpoint
│   │   │   ├── receipt/[id]/        # PDF receipt generator endpoint
│   │   │   ├── requirements/        # Post requirement lead endpoint
│   │   │   └── upload/              # Public upload endpoint
│   │   ├── auth/callback/           # Supabase OAuth and auth callback handler
│   │   ├── about/                   # About Us page
│   │   ├── contact/                 # Contact Us page
│   │   ├── dashboard/               # Customer dashboard
│   │   ├── enquiries/               # Customer enquiry lookup & tracker
│   │   ├── gallery/                 # Public portfolio & design showcase
│   │   ├── login/                   # Customer login page
│   │   ├── profile/                 # Customer profile page
│   │   ├── services/                # Services overview page
│   │   ├── signup/                  # Customer registration page
│   │   ├── error.tsx                # Route-level error boundary
│   │   ├── global-error.tsx         # Root error boundary
│   │   ├── globals.css              # Global styles and design system variables
│   │   ├── layout.tsx               # Root layout with header, footer, providers
│   │   ├── loading.tsx              # Root loading state
│   │   ├── not-found.tsx            # Custom 404 page
│   │   ├── page.tsx                 # Public homepage
│   │   └── template.tsx             # Page entrance transition wrapper
│   ├── components/                  # Modular React UI components
│   │   ├── admin/                   # Administrative interface components
│   │   │   ├── AdminLayoutShell.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── DesignForm.tsx
│   │   │   ├── Drawer.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── EnquiryDetailClient.tsx
│   │   │   ├── EnquiryStatusForm.tsx
│   │   │   ├── FormField.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── RealtimeBadgesProvider.tsx
│   │   │   └── Skeleton.tsx
│   │   ├── layout/                  # Persistent layout components
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   └── WhatsAppButton.tsx
│   │   ├── providers/               # Context and state providers
│   │   │   └── PageTransitionProvider.tsx
│   │   ├── sections/                # Full-page feature sections and interactive page clients
│   │   │   ├── ContactClient.tsx
│   │   │   ├── DynamicPostRequirement.tsx
│   │   │   ├── EnquiriesClient.tsx
│   │   │   ├── HeroSlideshow.tsx
│   │   │   └── PostRequirementSection.tsx
│   │   └── ui/                      # Reusable atom/molecule UI components
│   │       ├── CopyButton.tsx
│   │       ├── DesignCard.tsx
│   │       ├── DynamicSignupPromptModal.tsx
│   │       ├── GalleryEnquireButton.tsx
│   │       ├── HeroCounter.tsx
│   │       ├── ImageLightboxModal.tsx
│   │       ├── OccasionCard.tsx
│   │       ├── ResponsiveImage.tsx
│   │       ├── SignupPromptModal.tsx
│   │       └── StatusBadge.tsx
│   ├── data/                        # Static datasets and manifest fallbacks
│   │   ├── imageManifest.json
│   │   ├── imageManifest.ts
│   │   └── initialDesigns.ts
│   ├── lib/                         # Utility libraries and services
│   │   ├── supabase/
│   │   │   ├── client.ts            # Supabase browser client
│   │   │   └── server.ts            # Supabase server client with cookies
│   │   ├── admin.ts                 # Admin verification utilities
│   │   ├── clientImageUpload.ts     # Client-side image compression utility
│   │   └── notifications.ts         # Resend notification dispatch utility
│   ├── types/                       # Shared TypeScript definitions
│   │   └── index.ts
│   └── proxy.ts                     # Next.js 16 network proxy and session watcher
├── supabase/
│   └── migrations/                  # Version-controlled database migrations
│       ├── 001_initial_schema.sql
│       ├── 002_rls_security_audit.sql
│       └── 003_admin_schema_and_rls.sql
├── netlify.toml                     # Netlify build and redirect configuration
├── package.json                     # Project manifest and npm scripts
└── tsconfig.json                    # TypeScript compiler options and @/* aliases
```

---

## 3. Environment Variables

Create a `.env.local` file in the project root with the following variables:

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase Project URL | `https://xyzcompany.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase Public Anonymous Key | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase Service Role Key (Server only, bypasses RLS for admin operations) | `eyJhbGciOi...` |
| `RESEND_API_KEY` | Optional | Resend API Key for dispatching email notifications | `re_1234567890abcdef` |
| `RESEND_FROM` | Optional | Sender identity for transactional emails | `Sri Kubera Decor <notifications@srikuberadecor.com>` |
| `RESEND_FROM_EMAIL` | Optional | Sender email address verified in Resend | `notifications@srikuberadecor.com` |
| `NOTIFY_EMAIL` | Optional | Target admin inbox for incoming enquiries | `saravanan@srikuberadecorevents.in` |
| `NEXT_PUBLIC_APP_URL` | Optional | Base URL of the application | `http://localhost:3000` (dev) / `https://srikuberadecorevents.in` (prod) |
| `NEXT_PUBLIC_BUSINESS_WHATSAPP` | Optional | WhatsApp contact number with country code | `917373876879` |
| `NEXT_PUBLIC_BUSINESS_PHONE` | Optional | Primary business phone number | `7373876879` |
| `NEXT_PUBLIC_BUSINESS_PHONE_2` | Optional | Secondary business phone number | `9486064769` |

> Note: Never commit `.env.local` or any file containing secret keys to version control.

---

## 4. Setup and Installation

### Prerequisites
- Node.js 20 or higher
- npm 10 or higher
- Supabase account with an active project

### Step 1: Clone and Install
```bash
git clone https://github.com/your-username/kubera-decor.git
cd kubera-decor
npm install
```

### Step 2: Configure Environment Variables
Copy or create `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase URL, anon key, service role key, and notification credentials.

### Step 3: Run Database Migrations
1. Open the [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor**.
3. In sequence, execute the migration files found in `supabase/migrations/`:
   - `001_initial_schema.sql` (Tables, profiles, bookings, categories, designs)
   - `002_seed_designs.sql` (Initial stage designs catalog seed)
   - `003_admin_schema_and_rls.sql` (Admin dashboard tables, media library, activity log, RLS anti-escalation)
   - `004_replace_birthday_designs.sql` (Updated birthday celebration catalog)
   - `005_restructure_categories.sql` (Refined category hierarchy)
   - `006_requirement_prompt_dismissed.sql` (Lead tracking and prompt dismissal column)
   - `007_gate_designs_rls.sql` (RLS policy restricting design queries)
   - `008_whatsapp_enquiries.sql` (WhatsApp enquiry tracking schema)
   - `009_fix_customer_profiles_and_enquiries.sql` (Customer profile trigger, backfill & RLS fix)

### Step 4: Storage Bucket Setup
1. In Supabase Dashboard, navigate to **Storage**.
2. Ensure a public bucket named `design-images` exists.
3. Configure bucket policies to allow authenticated admin uploads and public read access.

### Step 5: Admin User Creation
1. Go to **Authentication > Users** in Supabase and create a user (e.g., `admin@gmail.com`).
2. In the **SQL Editor**, grant the administrator role:
   ```sql
   -- Promote existing profile:
   UPDATE public.profiles
   SET role = 'admin'
   WHERE id IN (
     SELECT id FROM auth.users WHERE email = 'admin@gmail.com'
   );

   -- Idempotent upsert (if profile does not exist yet):
   INSERT INTO public.profiles (id, name, email, phone, role)
   SELECT 
     id,
     COALESCE(raw_user_meta_data->>'name', 'System Admin'),
     email,
     COALESCE(raw_user_meta_data->>'phone', '917373876879'),
     'admin'
   FROM auth.users
   WHERE email = 'admin@gmail.com'
   ON CONFLICT (id) DO UPDATE
   SET role = 'admin';
   ```
3. Verify admin access by signing in at `/admin/login`.

---

## 5. Available Scripts & How to Run

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server with Turbopack at `http://localhost:3000` |
| `npm run build` | Builds the production bundle and validates static page generation |
| `npm run start` | Serves the production build locally |
| `npm run lint` | Runs ESLint to check for code quality and convention issues |
| `npm run typecheck` | Runs `tsc --noEmit` to verify TypeScript types without emitting files |
| `npm run optimize-images` | Runs the automated script to generate responsive WebP variants for local photos |
| `npm run qa` | Runs the automated Playwright test suite against key routes |

---

## 6. How to Deploy

### Option A: Netlify (Recommended)

1. **Link Repository**:
   - In Netlify, click **Add new site > Import an existing project**.
   - Select your Git repository.
2. **Build Configuration**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Next.js Runtime: Netlify Next.js Plugin (`@netlify/plugin-nextjs`) is automatically detected.
3. **Set Environment Variables**:
   - In Netlify under **Site configuration > Environment variables**, add all variables specified in Section 3.
4. **Deploy**:
   - Trigger a manual deployment or push to the `main` branch.

### Option B: GitHub Actions Automated CI/CD

The repository includes a ready-to-run GitHub Actions workflow in `.github/workflows/ci-cd.yml`:
1. Add `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` to GitHub Repository Secrets (**Settings > Secrets and variables > Actions**).
2. Add public variables (`NEXT_PUBLIC_*`) to GitHub Repository Variables.
3. On every push to `main`, the workflow will:
   - Install dependencies cleanly (`npm ci`)
   - Check code quality (`npm run lint`)
   - Verify TypeScript integrity (`npm run typecheck`)
   - Execute production build (`npm run build`)
   - Deploy directly to Netlify production upon green checks.

---

## 7. Image Pipeline & Optimization

1. **Client-Side Compression (`browser-image-compression`)**:
   - Large camera photos (up to 15 MB) are pre-compressed directly in the browser to under 1.5 MB before upload.
2. **Server Security (`/api/admin/upload`)**:
   - Validates user admin role and verifies binary magic bytes for JPEG, PNG, and WebP.
   - Enforces 6 MB body limit to comply with serverless function constraints.
3. **Sharp Processing**:
   - Strips EXIF metadata (GPS, camera tags) for client privacy.
   - Generates two WebP variants:
     - **Card variant**: 800 px wide, 78% quality (lists, catalog cards).
     - **Full variant**: 1600 px wide, 80% quality (modal lightboxes, zoom views).

---

## 8. Quality Assurance & Guidelines

- **Zero Emoji Policy**: All icons in the user interface and admin panel are strictly rendered using `lucide-react`.
- **Responsive Architecture**: Desktop navigation bar with dropdowns; mobile bottom navigation bar on screens under 768 px.
- **Form UX**: Touch-target safe inputs (`min-h-[44px]`), font size >= 16px to prevent iOS auto-zoom, and instant user feedback via toast notifications.
- **Security**: Inactivity timeout at 12 hours, server-side role validation, strict PostgreSQL Row Level Security (RLS).

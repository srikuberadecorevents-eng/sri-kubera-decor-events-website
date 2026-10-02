# Sri Kubera Decor & Events

Production-ready web application for **Sri Kubera Decor & Events** — a stage decoration business based in Puducherry, India.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Forms | React Hook Form + Zod |
| Icons | lucide-react |
| Toasts | react-hot-toast |
| Email | Resend |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email + password) |
| Storage | Supabase Storage |
| Image processing | Sharp (WebP conversion) |
| PDF | jsPDF |
| Hosting | Netlify |
| CI/CD | GitHub Actions |

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/kubera-decor.git
cd kubera-decor
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the **SQL Editor**, run the full contents of:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
   This creates all tables, RLS policies, storage buckets, and seed data.

3. In **Storage**, verify that three buckets exist:
   - `design-images` (public)
   - `business-assets` (public)
   - `receipts` (private)

### 3. Create environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard -> Settings -> API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard -> Settings -> API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard -> Settings -> API |
| `RESEND_API_KEY` | resend.com -> API Keys |
| `RESEND_FROM_EMAIL` | Your verified sender domain on Resend |
| `NEXT_PUBLIC_BUSINESS_WHATSAPP` | Business WhatsApp number with country code (e.g. `917373876879`) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local, your domain for production |

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Creating the Admin Account

The admin account must be created directly in Supabase.

1. In the Supabase dashboard, go to **Authentication -> Users** and create a new user.
2. After creation, run this SQL in the SQL Editor (replace the email):

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

---

## Deploying to Netlify

1. Push the repository to GitHub.
2. In [Netlify](https://app.netlify.com), click **New site -> Import from Git** and select the repository.
3. Build settings are already configured in `netlify.toml`.
4. Go to **Site configuration -> Environment variables** and add all variables from `.env.example` with production values.
5. Deploy. Netlify will automatically redeploy on every push to `main`.

---

## GitHub Actions

| Workflow | Trigger | Purpose |
|---|---|---|
| `ci.yml` | Push/PR to `main` | Lint + build check |
| `supabase-keepalive.yml` | Every Monday 09:00 UTC | Prevents Supabase free-tier pause |

Add all environment variables as **repository secrets** in GitHub -> Settings -> Secrets.

---

## Project Structure

```
src/
  app/
    gallery/          # Public gallery + design detail + enquiry flow
    services/         # Public services page
    about/            # Public about page
    contact/          # Public contact page
    login/ signup/    # Auth pages
    dashboard/        # Customer dashboard
    enquiries/        # Customer enquiries
    profile/          # Customer profile
    admin/            # Admin panel
    api/
      enquiry/        # POST: create enquiry, generate ID, send email
      upload/         # POST: image upload with Sharp WebP conversion
      receipt/[id]/   # GET: generate and download PDF receipt
  components/
    layout/           # Header, Footer, WhatsAppButton
    ui/               # DesignCard, StatusBadge
  lib/supabase/       # Browser and server Supabase clients
  types/              # TypeScript interfaces
  middleware.ts       # Auth + role route protection
```

---

## Branding

- **Primary:** Deep navy `#1F3A5F`
- **Accent:** Muted gold `#C9A227`
- **Background:** Warm cream `#F9F5EC`
- **Fonts:** Georgia (headings), Inter (body)

---

## Business Contact

**Sri Kubera Decor & Events**
Proprietor: Saravanan
Phone: 7373876879 / 9486064769
Address: No. 80, Manjini Nagar, Bachanai Madam Street, Muthiyal Pettai, Puducherry

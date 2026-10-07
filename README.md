# Sri Kubera Decor & Events — Web Application & Admin Panel

Production-ready web application and complete, responsive administrative panel for **Sri Kubera Decor & Events** — stage decoration and event styling studio based in Puducherry, India.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router, Turbopack, TypeScript) |
| Styling | Tailwind CSS v4 (Emerald `#0B4A3A`, Gold `#C9A24B`, Warm Ivory `#FAF6EC`) |
| Admin UI | Responsive Shell, Desktop Sidebar, Mobile Bottom Bar (< 768px), Drag-and-Drop (`@dnd-kit`) |
| Image Pipeline | `browser-image-compression` (client resize) + Sharp (server magic bytes, EXIF strip, dual WebP variants) |
| Database & Auth | Supabase (PostgreSQL, Row Level Security, Realtime badges, Storage) |
| Proxy / Security | `src/proxy.ts` (Next.js 16 proxy), 12-hour inactivity sign-out, server-side `is_admin()` checks |
| Notifications | Resend (email alerts for new enquiries and requirement leads) |
| PDF Receipts | jsPDF |
| Hosting | Netlify (Serverless) |

---

## 2. Setting Up Supabase & Running Database Migrations

1. Go to your [Supabase Dashboard](https://supabase.com).
2. Open the **SQL Editor**.
3. In sequence, run:
   - `supabase/migrations/001_initial_schema.sql` (if starting on a fresh database)
   - `supabase/migrations/002_rls_security_audit.sql`
   - `supabase/migrations/003_admin_schema_and_rls.sql` (**Critical for Admin Panel**)

### What `003_admin_schema_and_rls.sql` creates:
- `is_admin()` helper function with `security definer`.
- Schema alterations for `categories`, `designs`, `bookings`, `services`, and `business_settings`.
- Dedicated tables:
  - `media`: Central photo library tracking dual WebP variants (`path_card`, `path_full`, dimensions, bytes).
  - `design_images`: Many-to-many relationship between designs and media photos with sort orders and cover flags.
  - `booking_private`: Column-level privacy holding internal notes and quoted prices visible strictly to admin.
  - `booking_status_history`: Complete audit trail of customer booking status transitions.
  - `requirements`: Leads captured from the public "Post Your Requirement" form.
  - `testimonials`: Genuine customer reviews with star ratings and publish toggles.
  - `site_content`: Dynamic key-value store for hero slides, proprietor info, real stats, and announcement banners.
  - `activity_log`: Read-only chronological audit log of admin mutations.
- Strict Row Level Security (RLS) policies on every table.
- High-performance indexes for status and dates.
- Realtime publication on `bookings` and `requirements` for live badge counters in the navigation.

---

## 3. Creating and Promoting the Admin Account

The admin panel is completely protected. There is no public registration for admin accounts.

### Step 1: Create the User in Supabase
In Supabase Dashboard, navigate to **Authentication -> Users** and click **Add User** (Create User with Email & Password).

### Step 2: Promote User to Admin via SQL
Run the following SQL statement in the Supabase SQL Editor (replace with the user's email):

```sql
-- Promote user to admin role
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'saravanan@srikuberadecor.com';

-- Verify the admin status
SELECT id, email, role, full_name
FROM public.profiles
WHERE role = 'admin';
```

Once promoted, the user can navigate to `/admin/login` and access the full administration system. Non-admin users attempting to access `/admin/*` are automatically blocked and redirected to the `/admin/403` forbidden page.

---

## 4. How the Image Pipeline Works (Serverless & Phone-Friendly)

Netlify Serverless functions enforce a strict request body payload limit (~6 MB). To prevent mobile uploads from failing or timing out:

1. **Client-Side Compression (`browser-image-compression`)**:
   - When the business owner selects large camera photos (e.g. 5 MB to 15 MB) from a phone, `clientImageUpload.ts` compresses and resizes them in the browser.
   - Longest edge is capped at 1920 px, targeting ~1.5 MB per file.
   - Files are uploaded one by one with a real-time progress bar.
2. **Server Security & Magic Bytes Verification (`/api/admin/upload`)**:
   - The route handler verifies that the calling user has `role = 'admin'` using Supabase Auth.
   - Verifies real file magic bytes (JPEG `FF D8 FF`, PNG `89 50 4E`, WebP `RIFF...WEBP`). Rejects spoofed extensions.
   - Max serverless body limit guarded at 6 MB.
3. **Sharp Processing (Dual WebP Generation & Privacy Stripping)**:
   - Sharp rotates images according to EXIF orientation.
   - Completely strips all metadata (including GPS coordinates, camera model, and device info).
   - Generates two WebP files:
     - **Card variant**: 800 px wide, 78% quality (used in admin lists, public grids, occasion tiles).
     - **Full variant**: 1600 px wide, 80% quality (used in design detail view and lightboxes).
4. **Storage & Media Library**:
   - Stored in the `design-images` public bucket.
   - A row is inserted into the `media` table tracking file paths, dimensions, and total byte size.

---

## 5. Resend Email Notifications Setup

When a customer submits a booking enquiry or posts a requirement lead, an email notification is automatically dispatched to the business owner:

1. Sign up at [Resend](https://resend.com) and create an API Key.
2. Add your sending domain (e.g. `notifications@srikuberadecor.com`) and verify DNS records.
   *(Note: Resend allows testing with `onboarding@resend.dev` to the registered account email before domain verification).*
3. Add the following variables to `.env.local` (and Netlify Environment Variables):
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
   RESEND_FROM=Sri Kubera Decor <notifications@srikuberadecor.com>
   RESEND_FROM_EMAIL=notifications@srikuberadecor.com
   NOTIFY_EMAIL=saravanan@srikuberadecor.com
   ```
4. In the Admin Panel under **Settings -> Business Information**, you can update the **Admin Notification Email** at any time.

---

## 6. Admin Panel Modules Overview

The admin panel is located at `/admin` and organized for quick phone and desktop operation:

- **Dashboard (`/admin`)**:
  - Live KPI cards: Published designs, pending enquiries, confirmed events this month, new requirements, total customers.
  - "Needs Attention" list highlighting pending enquiries > 24 hours and uncontacted leads.
  - Upcoming events calendar preview for the next 7 days.
  - Inline lightweight SVG chart of enquiries over the last 30 days.
  - Storage allocation meter (used vs 1 GB free Supabase tier) with 70% and 90% warnings.
- **Designs (`/admin/designs`)**:
  - Filter by category and status (Draft, Published, Archived).
  - Multi-photo upload with drag-and-drop reordering, cover photo selection, and alt text.
  - Auto-generated URL slugs, inclusion tags with quick suggestions, and rupee price with "Price on request" toggle.
  - Live preview card showing the exact rendering on the public site.
  - Soft archive with restore support; guarded hard delete preventing deletion if booking enquiries exist.
- **Media Library (`/admin/media`)**:
  - Photo grid showing usage counts across designs. Filter by "All" or "Unused".
  - Safe deletion preventing accidental deletion of photos currently in use.
- **Categories (`/admin/categories`)**:
  - Add, edit, activate/deactivate, and drag-and-drop reorder.
  - Safeguarded deletion requiring reassignment of existing designs to another category first.
- **Enquiries (`/admin/enquiries`)**:
  - Search by enquiry ID, customer name, or phone number.
  - Filter by status, date range, and category.
  - Detail page with visual status stepper (`pending` -> `contacted` -> `confirmed` -> `rejected`), customer notes, internal private notes (`booking_private`), date clash alerts, and quick WhatsApp/Call links.
  - UTF-8 with BOM CSV export for Microsoft Excel.
- **Calendar (`/admin/calendar`)**:
  - Custom month grid showing confirmed events by `event_date`.
  - Date clash indicators and side drawer displaying daily schedules.
- **Requirements (`/admin/requirements`)**:
  - Lead management for submissions from the public "Post Your Requirement" section.
  - Workflow status (`new` -> `contacted` -> `converted` -> `closed`), internal follow-up notes, and quick WhatsApp/Call actions.
- **Customers (`/admin/customers`)**:
  - Customer directory with search and enquiry history timeline.
- **Services (`/admin/services`)**:
  - Manage public service offerings with Lucide icons, descriptions, and drag-and-drop ordering.
- **Testimonials (`/admin/testimonials`)**:
  - Authentic customer reviews management. Only published reviews display on the public website.
- **Site Content (`/admin/site-content`)**:
  - Manage 1 to 5 hero carousel slides with headline, subheadline, and image from media library.
  - About text and proprietor name.
  - Real stats (events done, years in business, happy customers). Hidden if left empty.
  - Header announcement bar toggle and text.
- **Settings (`/admin/settings`)**:
  - Business phone, WhatsApp, address, working hours, tagline, Google Maps link, and notification email.
  - Admin account password change and global sign-out.
- **Activity Log (`/admin/activity`)**:
  - Audit trail of administrative actions.

---

## 7. Quality Assurance & Security Checklist

- [x] Zero emoji policy: all icons use `lucide-react`.
- [x] 12-hour inactivity sign-out enforced via cookie timestamps in `src/proxy.ts`.
- [x] Strict Row Level Security: customer profiles and booking private data cannot be queried by unauthorized visitors.
- [x] Mobile icon-safe inputs: `pl-10`, `pr-10`, minimum height 44 px, font size >= 16 px to prevent iOS safari auto-zoom.
- [x] Mobile bottom navigation bar for screens under 768 px.
- [x] Excel-compatible CSV exports with UTF-8 BOM encoding.
- [x] Instant cache revalidation (`revalidatePath`) on all admin mutations.

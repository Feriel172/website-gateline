# Admin Page Implementation

## ✅ Completed

- [x] **Migration**: Created `supabase/migrations/003_add_order_status.sql`
  - Added `status` column (DEFAULT `'en attente'`)
  - CHECK constraint for valid statuses
  - Index on status column

- [x] **API – List Orders**: Created `app/api/admin/orders/route.ts`
  - `GET` endpoint fetches all orders ordered by `created_at DESC`
  - Protected by `x-admin-key` header matching `ADMIN_PASSWORD`

- [x] **API – Update Status**: Created `app/api/admin/orders/[id]/route.ts`
  - `PATCH` endpoint updates order status
  - Validates status is one of: `en attente`, `confirmée`, `annulé`
  - Protected by `x-admin-key` header

- [x] **Admin Page**: Created `app/admin/page.tsx`
  - Password gate authentication (verifies via API call)
  - Dashboard summary cards (total, pending, confirmed, cancelled, revenue)
  - Desktop: Full table view with sortable columns
  - Mobile/Tablet: Card-based layout
  - Clickable status badges with dropdown to change status
  - Loading skeleton, empty state, error state
  - Session persistence via `sessionStorage`
  - Refresh & logout buttons

- [x] **Environment Variable**: Added `ADMIN_PASSWORD` to `.env.local`

- [x] **Email Notification**: Created `lib/email.ts`
  - Sends an email to the shop owner on every new order
  - Uses the Resend REST API via `fetch` (no extra dependency)
  - Called from `app/api/checkout/route.ts` inside `after()`, so a slow or
    failing email provider never delays or breaks a checkout
  - No-ops with a warning when `RESEND_API_KEY` / `ORDER_NOTIFICATION_TO` are unset

## 📧 Email notification setup

1. Create a free account at [resend.com](https://resend.com) and copy an API key
2. Fill in `.env`:
   ```
   RESEND_API_KEY=re_...
   ORDER_NOTIFICATION_TO=medram90@gmail.com   # comma-separated for several recipients
   ```
3. Sender: the default `onboarding@resend.dev` only delivers to the address that
   owns the Resend account. To send from your own domain, verify it in Resend and set
   `ORDER_NOTIFICATION_FROM=Gatelin <commandes@votre-domaine.com>`
4. On Vercel, add the same variables under Project → Settings → Environment Variables

## 🔧 Usage

1. Run the Supabase migration:
   ```bash
   # Apply migration via Supabase CLI or Supabase dashboard SQL editor
   ```

2. Access the admin page at `/admin`

3. Login with the password: `4qhdvUH3uXf9w*c`


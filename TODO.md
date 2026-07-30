# Add Order Statuses: "ne répond pas" and "injoignable/éteint"

## Steps

- [x] 1. Read and understand all relevant files
- [x] 2. Get user approval on plan
- [x] 3. Update `supabase/migrations/003_add_order_status.sql` — CHECK constraint
- [x] 4. Update `app/api/admin/orders/[id]/route.ts` — VALID_STATUSES
- [x] 5. Update `app/admin/page.tsx`:
  - [x] 5a. Order type status union
  - [x] 5b. STATUS_CONFIG with new entries
  - [x] 5c. VALID_STATUSES array
  - [x] 5d. Fix indentation issues

**Completed.** All 3 files have been updated to support the two new order statuses.


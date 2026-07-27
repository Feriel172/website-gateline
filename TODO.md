# Security Audit Fixes

## Steps
- [x] Step 1: Create plan and get approval
- [x] Step 2: Create `app/api/checkout/route.ts` — server-side API route with validation
- [x] Step 3: Create `lib/supabase/admin.ts` — admin client with service role key
- [x] Step 4: Update `app/checkout/page.tsx` — call API instead of direct Supabase insert
- [x] Step 5: Update `next.config.mjs` — add security headers, fix TypeScript config
- [x] Step 6: Update `supabase/migrations/001_create_orders_table.sql` — improve RLS policies
- [x] Step 7: Create `supabase/migrations/002_security_fixes.sql` — additional security policies

## ⚠️ Manual Steps Required
1. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
   Get it from Supabase Dashboard > Settings > API > Project API keys > `service_role` (secret)

2. Run both SQL migrations in Supabase Dashboard SQL Editor:
   - First run `supabase/migrations/001_create_orders_table.sql`
   - Then run `supabase/migrations/002_add_rate_limiting.sql`

3. Restart the dev server after adding the environment variable:
   ```bash
   npm run dev
   ```


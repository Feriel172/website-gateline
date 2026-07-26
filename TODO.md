# Fix "Ajouter au panier" Button & Checkout

## Steps
- [x] Step 1: Analyze the issue — identified files related to cart functionality
- [x] Step 2: Fix `app/product/[id]/page.tsx` — add `addItem` call
- [x] Step 3: Fix `app/shop/page.tsx` — add `addItem` call
- [x] Step 4: Install Supabase packages (`@supabase/supabase-js`, `@supabase/ssr`)
- [x] Step 5: Create `.env.local` with Supabase credentials
- [x] Step 6: Create `lib/supabase/client.ts` — Supabase client utility
- [x] Step 7: Update `components/boty/cart-drawer.tsx` — navigate to `/checkout`
- [x] Step 8: Create `app/checkout/page.tsx` — checkout form with validation and Supabase integration
- [x] Step 9: Fix `app/checkout/page.tsx` — add `bureau` field to Supabase insert
- [x] Step 10: Create `supabase/migrations/001_create_orders_table.sql` — SQL to create `orders` table

## ⚠️ Manual Step Required
Run the SQL migration in your Supabase Dashboard:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Open **SQL Editor**
4. Paste and execute the contents of `supabase/migrations/001_create_orders_table.sql`


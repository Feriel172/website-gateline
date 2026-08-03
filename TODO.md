# Arabic Version (RTL) Task

## Steps
1. [x] Add Arabic font (Cairo/Tajawal) to `app/layout.tsx`
2. [x] Create `components/boty/header-ar.tsx` (Arabic header)
3. [x] Create `components/boty/footer-ar.tsx` (Arabic footer)
4. [x] Create `components/boty/cart-drawer-ar.tsx` (Arabic RTL cart drawer)
5. [x] Create `app/shop/Ar/page.tsx` (Arabic shop page)
6. [x] Create `app/product/[id]/Ar/page.tsx` (Arabic product page)
7. [x] Create `app/checkout/Ar/page.tsx` (Arabic checkout page)
8. [x] Verify routes and RTL rendering (all routes return 200)

## Fixes
- [x] Fixed `lib/email.ts` parsing error (corrupted HTML entity on line 48)
- [x] Fixed checkout 500 error: removed `promo_code`/`discount` columns from insert since migration 004 was not applied to the database (verified checkout now returns 200)

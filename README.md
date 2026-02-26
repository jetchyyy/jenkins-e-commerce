# Digital Bookstore (React + Express + Supabase + Stripe)

Production-oriented e-commerce app for selling protected digital books (PDF/EPUB) with strict ownership checks.

## Stack
- Frontend: React + Vite + TypeScript + Tailwind + TanStack Query + Zustand
- Backend: Node.js + Express + TypeScript + Zod
- Database/Auth/Storage: Supabase (Postgres + Auth + private Storage)
- Payments: Stripe (`PAYMENT_MODE=stripe`) or mock flow (`PAYMENT_MODE=mock`)

## Folder Structure
- `/Users/kateramzel.caquilala/Documents/New project/frontend`
- `/Users/kateramzel.caquilala/Documents/New project/backend`

## Critical Security Modules
- JWT auth middleware: `/Users/kateramzel.caquilala/Documents/New project/backend/src/middleware/auth.ts`
- Superadmin bootstrap: `/Users/kateramzel.caquilala/Documents/New project/backend/src/modules/auth/bootstrapSuperadmin.ts`
- Signed URL download endpoint: `/Users/kateramzel.caquilala/Documents/New project/backend/src/modules/library/library.service.ts`
- Stripe webhook handler: `/Users/kateramzel.caquilala/Documents/New project/backend/src/modules/checkout/stripe.webhook.ts`

## 1. Create Supabase Project
1. Create a new Supabase project.
2. In Storage, create bucket `books-private` and keep it **private**.
3. Copy project URL, anon key, and service role key.

## 2. Apply Schema + Policies
Run in Supabase SQL editor in this order:
1. `/Users/kateramzel.caquilala/Documents/New project/backend/supabase/migrations/001_init.sql`
2. `/Users/kateramzel.caquilala/Documents/New project/backend/supabase/policies.sql`
3. Optional seed: `/Users/kateramzel.caquilala/Documents/New project/backend/supabase/seed.sql`

## 3. Configure Environment
### Backend
Copy `.env` from:
- `/Users/kateramzel.caquilala/Documents/New project/backend/.env.example`

Required values:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYMENT_MODE=stripe` with `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`
- or `PAYMENT_MODE=mock`

### Frontend
Copy `.env` from:
- `/Users/kateramzel.caquilala/Documents/New project/frontend/.env.example`

Required values:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL=http://localhost:4000`

## 4. Run Apps
### Backend
```bash
cd /Users/kateramzel.caquilala/Documents/New project/backend
npm install
npm run dev
```

On first startup, backend bootstraps default superadmin if missing and logs credentials.

### Frontend
```bash
cd /Users/kateramzel.caquilala/Documents/New project/frontend
npm install
npm run dev
```

## 5. Stripe Webhook (Stripe mode)
Forward Stripe events locally:
```bash
stripe listen --forward-to http://localhost:4000/api/checkout/webhook
```
Use returned webhook secret as `STRIPE_WEBHOOK_SECRET`.

## 6. Test Purchase & Library Access
1. Register/login as customer.
2. Browse books and add to cart.
3. Checkout:
   - Mock mode: checkout completes immediately and order/library are created.
   - Stripe mode: create PaymentIntent, complete payment in Stripe client flow, webhook marks order paid.
4. Open Library and generate secure download link.
5. Verify non-owner cannot access `/api/library/:bookId/download`.

## API Endpoints
### Public
- `GET /api/books`
- `GET /api/books/:id`
- `POST /api/books/:id/view`

### Auth Required
- `POST /api/checkout/create-intent`
- `POST /api/checkout/mock/complete` (mock mode only)
- `GET /api/library`
- `GET /api/library/:bookId/download`
- `GET /api/orders`

### Superadmin
- `POST /api/admin/books`
- `PUT /api/admin/books/:id`
- `POST /api/admin/books/:id/upload`
- `GET /api/admin/analytics`
- `GET /api/admin/orders`

### System
- Startup auto-bootstrap superadmin
- `POST /api/auth/system/bootstrap` (requires `x-bootstrap-token`)

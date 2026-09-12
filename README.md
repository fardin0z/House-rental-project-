# ToletZoo

Bengali-language house rental web app for Bangladesh. Tenants browse verified rentals, contact landlords directly, and subscribe for premium info. Landlords post listings. Admins moderate everything.

- **Live:** https://toletzoo.com
- **Stack:** Next.js 16 (App Router) · Supabase (Postgres + Auth + Storage + Realtime) · Mapbox · AamarPay · Tailwind v4 · next-intl · Vercel
- **Client handover doc:** [HANDOVER.md](./HANDOVER.md)

---

## Local development

```bash
git clone <repo-url>
cd basavara_nextjs
npm install
cp .env.example .env.local   # fill in values (see below)
npm run dev
```

Open http://localhost:3000.

### Scripts

```bash
npm run dev          # dev server (Turbopack)
npm run build        # production build
npm run start        # serve the built app
npx tsc --noEmit     # type check
npx eslint           # lint
```

---

## Environment variables

Copy this into `.env.local` and fill in real values. All `NEXT_PUBLIC_*` keys are safe to expose to the browser. `SUPABASE_SECRET_KEY` and `AAMARPAY_*` are server-only.

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJh...
SUPABASE_SECRET_KEY=eyJh...

# Canonical site URL (used for OG, sitemap, canonical tags)
NEXT_PUBLIC_SITE_URL=http://localhost:3000   # https://toletzoo.com in production

# Mapbox (free tier covers 50k loads + 100k geocodes/month)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...

# AamarPay — sandbox values shown; swap to live when merchant is approved
AAMARPAY_STORE_ID=aamarpaytest
AAMARPAY_SIGNATURE_KEY=dbb74894e82415a2f7ff0ec3a97e4183
AAMARPAY_BASE_URL=https://sandbox.aamarpay.com

# Phone OTP — SMS.NET.BD delivers the code, Supabase generates and verifies it
SMS_NET_BD_API_KEY=
SMS_NET_BD_SENDER_ID=            # leave empty on a non-masking plan
SMS_NET_BD_BRAND_NAME=ToletZoo   # inserted into the SMS body (non-masking policy)
SUPABASE_SEND_SMS_HOOK_SECRET=   # from Supabase → Auth → Hooks → Send SMS
```

---

## Database setup (fresh Supabase project)

1. **Apply migrations.** Either:
   - Supabase CLI: `supabase link --project-ref YOUR_REF && supabase db push`, or
   - Paste each file in `supabase/migrations/` into the SQL Editor in order (`0001` through `0018`)

2. **Enable the JWT role claim hook** (required for role-based routing):
   - Supabase Dashboard → Authentication → Hooks → Add hook
   - "Customize Access Token (JWT) Claims" → Postgres Function → `public.custom_access_token_hook` → Enable

3. **Auth settings** (Authentication → Providers):
   - **Email**: enable, turn **Confirm email ON**. Set custom SMTP (Resend) under Authentication → Emails → SMTP Settings so verification mail is not capped at 2/hour.
   - **Phone**: enable, turn **Confirm phone ON**. The Twilio fields can hold placeholder values; the Send SMS hook below overrides them. Raise **SMS OTP Expiry** to `300` seconds.
   - **Send SMS hook** (Authentication → Hooks → Send SMS): enable, type **HTTPS**, URL `https://toletzoo.com/api/auth/send-sms`. Copy the generated secret into `SUPABASE_SEND_SMS_HOOK_SECRET` on Vercel. Supabase generates and verifies the OTP; this hook only delivers it through SMS.NET.BD.
   - **URL Configuration**: Site URL `https://toletzoo.com`; Redirect URLs `https://toletzoo.com/**` and `http://localhost:3000/**`.

4. **Storage buckets**:

   | Bucket | Public? | For |
   |---|---|---|
   | `nid-documents` | Private | ID verification scans |
   | `listing-images` | Public | Property photos + videos |
   | `chat-attachments` | Private | Chat file attachments |

   Enable **Image Transformations** in Storage → Settings (used by the public render endpoint for thumbnails).

5. **Seed first admin**: edit the email in `supabase/scripts/make-admin.sql`, then run it in the SQL Editor.

6. **Regenerate types** after any schema change:
   ```bash
   supabase gen types typescript --linked > types/database.types.ts
   ```

---

## Deployment (Vercel)

1. Import the repo into Vercel. Framework preset: **Next.js**.
2. Add all env vars from above. In production, set `NEXT_PUBLIC_SITE_URL=https://toletzoo.com`.
3. Push to `main` → auto-deploy. PRs → preview deploys.

### Domain

Canonical host is `https://toletzoo.com` (no www). Setup:

- Vercel → Domains → add `toletzoo.com` (Production) and `www.toletzoo.com` (redirect → `toletzoo.com`, 308 Permanent)
- Namecheap → Advanced DNS:
  - A record `@` → `216.198.79.1` (or whatever Vercel shows)
  - CNAME `www` → the value Vercel gives (usually `*.vercel-dns-017.com`)

The www → apex redirect is handled at the Vercel edge. `proxy.ts` is a backup that also enforces canonical host + HTTPS — see `lib/seo/site.ts` for the canonical helper.

### AamarPay webhook

Configure the webhook URL in the AamarPay merchant dashboard:

```
https://toletzoo.com/api/aamarpay/webhook
```

---

## Project layout

```
app/
├── (admin)/admin/        # Admin panel — guarded by requireRole('admin')
├── (app)/                # Authed shell — tenant/landlord pages
├── (auth)/               # Public auth pages (login, signup, reset)
├── properties/           # Public property browse + detail
├── api/                  # Webhook + signed URL + CSV routes
├── sitemap.ts            # Dynamic sitemap (home + properties + approved listings)
├── robots.ts             # robots.txt
└── layout.tsx            # Root layout, metadataBase, OG defaults

components/
├── admin/                # Admin-only UI (sidebar, role menu, confirm modals, pagination)
├── auth/                 # Auth forms + shell
├── properties/           # PropertyCard, PropertyMediaCarousel, location map
├── chat/                 # ChatThread, conversation sidebar
└── shared/               # AppHeader, Logo, MainMenu, ContentPage

lib/
├── admin/                # Admin queries + server actions
├── auth/                 # Guards, JWT claim helpers, server actions
├── chat/                 # Chat queries + display helpers
├── listings/             # Public + private listing queries, schema, actions
├── payments/             # AamarPay client + verification
├── seo/                  # Canonical site URL helper
├── storage/              # Bucket constants + signed URL builders
└── supabase/             # SSR client, admin client, proxy session helper

supabase/
├── migrations/           # SQL migrations (0001 → 0014)
└── scripts/make-admin.sql

messages/bn.json          # Bengali UI strings (single source)
proxy.ts                  # Edge middleware (Supabase session refresh + canonical host)
types/database.types.ts   # Generated Supabase types
```

---

## Conventions

- **Server components by default.** `'use client'` only for forms, realtime subscriptions, Mapbox, dropdowns.
- **Server actions** for mutations. API routes only for webhooks + signed URL generation + CSV export.
- **RLS first**: app code trusts RLS to enforce authorization. The admin client (service role) is only used in admin tooling.
- **Zod schemas** in `lib/<feature>/schema.ts` validate both client form input and server action input.
- **No inline Bengali strings.** All UI text lives in `messages/bn.json`.
- **Role from JWT.** `getCurrentSession()` reads `app_metadata.role` from claims — zero DB hit per request.

---

## Troubleshooting

**Login redirects me to `/` instead of role-based page.**
JWT custom access token hook isn't enabled. See step 2 of database setup. Existing JWTs need a fresh sign-in to pick up the claim.

**Chat realtime: messages don't deliver.**
Make sure both `messages` and `conversations` are in the `supabase_realtime` publication:
```sql
alter publication supabase_realtime add table public.messages, public.conversations;
```
Then check DevTools → Network → WS, confirm the `phx_join` payload includes `access_token` (not anon).

**Map shows "Mapbox token missing".**
`NEXT_PUBLIC_MAPBOX_TOKEN` is unset or invalid. Generate one at https://account.mapbox.com.

**Vercel domain shows "Invalid Configuration".**
DNS hasn't propagated yet, or you have leftover records on Namecheap (parking page CNAME for `www` is the usual culprit). Confirm with `dig toletzoo.com +short` and `dig www.toletzoo.com +short`.

**Type errors after schema changes.**
Regenerate types: `supabase gen types typescript --linked > types/database.types.ts`.
# MLS Hydrogen — Oxygen Setup

Parallel Hydrogen port of the MLS storefront. The TanStack version in `../src` keeps running in Lovable preview untouched. This folder is **only** runnable locally with the Shopify CLI and deployable to Shopify Oxygen — it cannot run in Lovable's Cloudflare Workers preview.

---

## Prerequisites

- Node.js ≥ 18.20
- A Shopify Partner / store admin account for `mls-uae-test-store`
- The **Hydrogen** sales channel installed in the store
  (Admin → Settings → Apps and sales channels → Shopify App Store → search "Hydrogen" → Add)

## One-time setup

```bash
# 1. Install the Shopify CLI globally
npm i -g @shopify/cli @shopify/cli-hydrogen

# 2. From the project root:
cd hydrogen
npm install

# 3. Create a local env file
cp .env.example .env
# Generate SESSION_SECRET:
openssl rand -base64 32
# Paste the output as SESSION_SECRET in .env

# 4. Authenticate with Shopify
shopify auth login

# 5. Link this code to a Hydrogen storefront in the Shopify admin
npm run link
#   - select store: mls-uae-test-store
#   - select: "Create new storefront"
#   - name: "MLS UAE"
# This creates a storefront entry in Admin → Hydrogen and writes
# .shopify/project.json so future commands target it.

# 6. (Optional) Pull env vars from Shopify admin → Hydrogen → Environments
npm run env:pull
```

## Daily development

```bash
npm run dev
# → http://localhost:3000  (HMR, GraphiQL, subrequest profiler)
```

## Deploy

```bash
# Preview deploy (gets a https://*.o2.myshopify.dev URL on every push)
npm run deploy -- --env preview

# Production
npm run deploy -- --env production
```

After your first deploy, set env vars permanently in
**Shopify admin → Hydrogen → MLS UAE → Environments** so production
doesn't depend on your local `.env`.

## Customer Account API redirect URIs

The Customer Account API only allows OAuth callbacks from URLs you explicitly whitelist.

After you have an Oxygen URL, go to:
**Shopify admin → Settings → Customer accounts → Headless customer accounts**
and add to **Application callback URIs**:

```
http://localhost:3000/account/authorize
https://<your-oxygen-preview>.o2.myshopify.dev/account/authorize
https://<your-production-domain>/account/authorize
```

Also add the corresponding `/account/logout` URLs to **Logout URIs** and the
domain origins to **Javascript origins**.

## What's ported vs what's stubbed

**Done (working scaffold):**
- Project shell (`server.ts`, `entry.client/server`, `root.tsx`, `vite.config.ts`)
- Routes: `_index`, `collections.$handle`, `products.$handle`, `search`, `cart`, `account*`
- Hydrogen `createCartHandler` + `CartForm`-based add to cart
- Hydrogen `createCustomerAccountClient` + OAuth callback route

**To port from `../src` (next iteration):**
- All UI components in `src/components/**` → `hydrogen/app/components/**`
  - Imports rewritten: `@tanstack/react-router` → `@remix-run/react`
  - `<Link to="/products/$handle" params={{handle}}>` → `<Link to={\`/products/${handle}\`}>`
- Zustand stores: keep `wishlistStore`, `localeStore`, `quickBuyStore`, `recentlyViewedStore` as-is. Delete `cartStore` (replaced by Hydrogen cart) and `useCartSync` hook.
- Full `src/styles.css` design tokens, fonts, RTL rules → `app/styles.css`
- All home sections (HScroller, CategorySection, FeaturedCollections, ReelsCarousel, etc.)
- `src/i18n/strings.ts` → `app/i18n/strings.ts`
- `src/lib/utils.ts` → `app/lib/utils.ts`
- All shadcn `ui/*` → `app/components/ui/*`

## Notes

- Cart state moves from `localStorage` (Zustand) to a server-managed cookie (Hydrogen). Existing user carts won't carry over.
- `src/lib/shopifyCustomer.ts`, `src/server/customerAuth.functions.ts`, and `src/routes/api/auth.callback.tsx` are **not** ported — Hydrogen's `createCustomerAccountClient` replaces all of them.
- This folder uses `npm`, not `bun`, because Shopify CLI assumes npm for Hydrogen projects.

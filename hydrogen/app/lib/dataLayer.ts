// Tiny, bulletproof GTM dataLayer helper. Pushes GA4-style ecommerce events that GTM can
// forward to GA4 / Meta / TikTok / Ads tags. Fully guarded: never throws, no-ops on the
// server, and creates window.dataLayer if GTM hasn't yet — so it can't disturb the app.
export function pushDataLayer(event: string, data: Record<string, any> = {}) {
  try {
    if (typeof window === "undefined") return;
    const w = window as any;
    w.dataLayer = w.dataLayer || [];
    // GA4 best practice: clear the previous ecommerce object before pushing a new one.
    if (data && "ecommerce" in data) w.dataLayer.push({ ecommerce: null });
    w.dataLayer.push({ event, ...data });
  } catch {
    /* analytics must never break the storefront */
  }
}

// Build a GA4 ecommerce "items" entry from a product-ish shape.
export function gaItem(opts: {
  id?: string | null;
  name?: string | null;
  price?: string | number | null;
  quantity?: number;
  variant?: string | null;
}) {
  const item: Record<string, any> = {
    item_id: opts.id ?? "",
    item_name: opts.name ?? "",
    price: opts.price != null ? parseFloat(String(opts.price)) || 0 : 0,
    quantity: opts.quantity ?? 1,
  };
  if (opts.variant && opts.variant !== "Default Title") item.item_variant = opts.variant;
  return item;
}

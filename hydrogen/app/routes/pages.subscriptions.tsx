import type { LoaderFunctionArgs, MetaFunction } from "@shopify/remix-oxygen";
import { useLoaderData, Link } from "react-router";
import { CheckCircle2, Truck, Star, ChevronDown, ArrowRight, Settings } from "lucide-react";
import { useState } from "react";
import { shopifyImageUrl } from "~/lib/shopify";

export const meta: MetaFunction = () => [
  { title: "MLS Subscriptions — Eat Clean, Save Big!" },
  {
    name: "description",
    content:
      "Subscribe & Save up to 15% on every order. Free Ribeye Steak, free delivery and total flexibility. Fuel your carnivore lifestyle with 100% Halal fresh meat.",
  },
];

// ─── Data ─────────────────────────────────────────────────────────────────────

const QUERY = `#graphql
  query SubProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 6, query: "selling_plan:true") {
      nodes {
        handle title
        priceRange { minVariantPrice { amount currencyCode } }
        images(first: 1) { nodes { url altText } }
        sellingPlanGroups(first: 1) { nodes { name } }
      }
    }
  }
` as const;

export async function loader({ context, request }: LoaderFunctionArgs) {
  const lang = request.headers.get("Cookie")?.match(/(?:^|;\s*)lang=([a-z]{2})/)?.[1];
  const language = (lang === "ar" ? "AR" : "EN") as "AR" | "EN";
  const { products } = await context.storefront.query(QUERY, {
    variables: { country: "AE" as const, language },
  });
  return { products: products.nodes };
}

// ─── Static content ───────────────────────────────────────────────────────────

const HERO_IMAGE =
  "https://cdn.shopify.com/s/files/1/0821/0202/6556/files/4_1_22256060-b88c-4f0d-baa7-0e906c90bf68.png?v=1741559409";

const TIMELINE = [
  {
    week: "Week 1–2",
    color: "bg-crimson",
    health: ["Reduced carb cravings", "Steady energy & mental clarity"],
    perks: [
      "🥩 FREE Ribeye Steak (250g)",
      "🚚 Free Delivery",
      "💰 10% OFF orders 1 & 2",
    ],
  },
  {
    week: "Week 3–4",
    color: "bg-crimson",
    health: ["Improved digestion", "Visible fat loss & muscle definition"],
    perks: [
      "🥩 FREE Ribeye Steak (250g)",
      "🚚 Free Delivery",
      "💰 15% OFF orders 3 & 4",
    ],
  },
  {
    week: "Week 5–6",
    color: "bg-rich-red",
    health: ["Stable blood sugar", "Enhanced immunity"],
    perks: [
      "🥩 FREE Ribeye Steak (250g)",
      "🍖 FREE Beef Mince (500g)",
      "🚚 Free Delivery",
      "💰 10% OFF order 5",
    ],
  },
  {
    week: "Week 7+",
    color: "bg-charcoal",
    health: ["Long-term metabolic health", "Sustained vitality"],
    perks: [
      "🥩 FREE Ribeye Steak (250g)",
      "🍖 FREE Beef Mince (500g)",
      "🚚 Free Delivery",
      "💰 15% OFF — For Life!",
    ],
    forever: true,
  },
];

const BENEFITS = [
  {
    emoji: "🎛️",
    title: "Customisable & Full Control",
    desc: "Choose your cuts, set your schedule, pause or cancel anytime — no commitment.",
  },
  {
    emoji: "🚚",
    title: "Free Delivery",
    desc: "Free on all subscription orders over AED 100. AED 20 fee applies below that.",
  },
  {
    emoji: "✅",
    title: "100% Halal & Fresh",
    desc: "Cold-chain packed and delivered the same day. Every order quality-guaranteed.",
  },
  {
    emoji: "🥩",
    title: "FREE Ribeye Steak",
    desc: "Every subscriber receives a free NZ Beef Ribeye Steak (250g) with every order.",
  },
];

const STEPS = [
  { n: "01", title: "Choose your meat", desc: "Pick a product, a value box, or build your own custom box." },
  { n: "02", title: "Select Subscribe & Save", desc: 'Click "Subscribe & Save 10%" on any product page.' },
  { n: "03", title: "Choose your frequency", desc: "Deliver every 7, 14, 21 or 30 days — you decide." },
  { n: "04", title: "Sit back & enjoy", desc: "Checkout once and get premium fresh meat on auto-pilot." },
];

const REVIEWS = [
  {
    name: "Tooba A.",
    title: "Very happy with purchase",
    body: "I'm very happy with my purchase. They listen to the instructions very carefully and followed them.",
    rating: 5,
  },
  {
    name: "Ateeq I.",
    title: "Alhamdulillah 👍",
    body: "The quality was extremely good… right amount of fat and good cuts at a very very reasonable price.",
    rating: 5,
  },
  {
    name: "James H.",
    title: "Great beef burgers",
    body: "The patties are of great quality meat, arrived conveniently packaged in separate trays — four patties each.",
    rating: 5,
  },
];

const FAQS = [
  {
    q: "Can I pause or cancel my subscription?",
    a: "Yes — pause for up to one month per year or cancel at any time. Changes must be submitted at least 48 hours before the next delivery.",
  },
  {
    q: "How does the free Ribeye Steak work?",
    a: "Every qualifying subscription order automatically includes a free NZ Beef Ribeye Steak (250g) with your delivery at no extra charge.",
  },
  {
    q: "When will my subscription renew?",
    a: "Renewal charges are processed automatically on your chosen schedule unless you cancel before the billing date.",
  },
  {
    q: "Can I customise my order?",
    a: "Absolutely. You can change the items in your subscription, but changes must be made at least 24 hours before your next scheduled delivery.",
  },
  {
    q: "What happens if there is a quality issue?",
    a: "We offer same-day replacements for quality issues reported within 24 hours of delivery. Refunds are not available for delivered items.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(amount: string, currency: string) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(parseFloat(amount));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const { products } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ══ 1. HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[520px] flex items-center justify-center overflow-hidden md:min-h-[600px]">
        <img
          src={HERO_IMAGE}
          alt="MLS Subscription — Premium Fresh Meat"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/70 to-charcoal/30" />
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-xl">
            <span className="inline-block mb-3 rounded-full bg-crimson px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
              Subscribe &amp; Save up to 15%
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-off-white md:text-5xl lg:text-6xl">
              Eat Clean,<br />
              <span className="text-crimson">Save Big!</span>
            </h1>
            <p className="mt-4 text-base text-off-white/80 md:text-lg">
              Fuel your carnivore lifestyle with 100% MLS fresh Halal meat.
              Get free delivery, a free Ribeye Steak, and up to 15% off — every order.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/collections/all"
                className="inline-flex items-center gap-2 rounded-lg bg-crimson px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition-all hover:bg-rich-red hover:shadow-xl"
              >
                Start My Subscription <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://account.mlsuae.ae/pages/8cfdfe48-f906-45d6-8515-29818e34a6d4"
                className="inline-flex items-center gap-2 rounded-lg border border-off-white/40 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-off-white transition-all hover:border-off-white hover:bg-off-white/10"
              >
                <Settings className="h-4 w-4" /> Manage Subscriptions
              </a>
            </div>
            {/* Mini trust row */}
            <div className="mt-6 flex flex-wrap gap-4">
              {["🥩 Free Ribeye every order", "🚚 Free delivery AED 100+", "✅ Cancel anytime"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-off-white/70">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 2. CONSISTENCY TIMELINE ══════════════════════════════════════════════ */}
      <section className="py-16 md:py-20 bg-charcoal text-off-white">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Your Health Journey</p>
            <h2 className="font-display text-2xl font-extrabold md:text-4xl">
              Consistency Pays Off{" "}
              <span className="text-crimson">(In Health &amp; Savings)</span>
            </h2>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical connector line (desktop) */}
            <div className="absolute left-[calc(50%-1px)] top-0 hidden h-full w-0.5 bg-off-white/10 md:block" />

            <div className="flex flex-col gap-6">
              {TIMELINE.map((item, i) => {
                const isRight = i % 2 === 0;
                return (
                  <div
                    key={item.week}
                    className={`relative flex flex-col items-start gap-4 md:flex-row md:items-center ${isRight ? "md:flex-row" : "md:flex-row-reverse"}`}
                  >
                    {/* Content card */}
                    <div className={`w-full rounded-2xl border border-off-white/10 bg-off-white/5 p-6 backdrop-blur md:w-[46%] ${isRight ? "md:text-right" : ""}`}>
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{item.week}</p>
                      <ul className={`mb-4 space-y-1 ${isRight ? "md:justify-end" : ""}`}>
                        {item.health.map((h) => (
                          <li key={h} className="flex items-center gap-2 text-sm text-off-white/80 md:justify-end">
                            {!isRight && <CheckCircle2 className="h-4 w-4 shrink-0 text-crimson" />}
                            <span>{h}</span>
                            {isRight && <CheckCircle2 className="h-4 w-4 shrink-0 text-crimson" />}
                          </li>
                        ))}
                      </ul>
                      <div className={`flex flex-wrap gap-2 ${isRight ? "md:justify-end" : ""}`}>
                        {item.perks.map((p) => (
                          <span key={p} className="rounded-full bg-crimson/20 px-2.5 py-1 text-[11px] font-semibold text-crimson">
                            {p}
                          </span>
                        ))}
                      </div>
                      {item.forever && (
                        <p className="mt-3 text-xs font-bold uppercase tracking-wider text-gold">
                          🏆 15% Off — For Life!
                        </p>
                      )}
                    </div>

                    {/* Center dot */}
                    <div className="hidden shrink-0 md:flex md:w-[8%] md:justify-center">
                      <div className={`grid h-10 w-10 place-items-center rounded-full ${item.color} text-xs font-bold text-white shadow-lg ring-4 ring-charcoal`}>
                        {i + 1}
                      </div>
                    </div>

                    {/* Empty spacer */}
                    <div className="hidden md:block md:w-[46%]" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              to="/collections/all"
              className="inline-flex items-center gap-2 rounded-lg bg-crimson px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-rich-red"
            >
              Start Now — Free Ribeye + 10% Off <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ 3. BENEFITS ══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-crimson">Why Choose MLS?</p>
            <h2 className="font-display text-2xl font-extrabold md:text-3xl">The Benefits of MLS Subscription</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map(({ emoji, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-7 text-center shadow-sm transition-shadow hover:shadow-md">
                <span className="text-4xl">{emoji}</span>
                <h3 className="font-display text-base font-bold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 4. HOW IT WORKS ══════════════════════════════════════════════════════ */}
      <section className="bg-muted/40 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-crimson">Simple Setup</p>
            <h2 className="font-display text-2xl font-extrabold md:text-3xl">How to Get Started</h2>
          </div>
          <div className="relative grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* connector line desktop */}
            <div className="absolute left-0 right-0 top-[2.25rem] hidden h-0.5 bg-border lg:block" />
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="relative flex flex-col items-center gap-3 text-center">
                <div className="relative z-10 grid h-[4.5rem] w-[4.5rem] place-items-center rounded-full bg-crimson text-xl font-extrabold text-white shadow-md ring-4 ring-background">
                  {n}
                </div>
                <h3 className="font-display text-base font-bold">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              to="/collections/all"
              className="inline-flex items-center gap-2 rounded-lg bg-crimson px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-rich-red"
            >
              Get Started Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══ 5. PRODUCTS ══════════════════════════════════════════════════════════ */}
      {products.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-8 text-center">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-crimson">Shop &amp; Subscribe</p>
              <h2 className="font-display text-2xl font-extrabold md:text-3xl">Available for Subscription</h2>
              <p className="mt-2 text-sm text-muted-foreground">Open any product below and choose "Subscribe &amp; Save" to begin</p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {products.map((p) => (
                <Link
                  key={p.handle}
                  to={`/products/${p.handle}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  {p.images.nodes[0] && (
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={shopifyImageUrl(p.images.nodes[0].url, 400)}
                        alt={p.images.nodes[0].altText ?? p.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-3">
                    <p className="line-clamp-2 text-xs font-medium text-foreground">{p.title}</p>
                    <p className="mt-1 font-display text-sm font-bold text-crimson">
                      {fmt(p.priceRange.minVariantPrice.amount, p.priceRange.minVariantPrice.currencyCode)}
                    </p>
                    {p.sellingPlanGroups.nodes[0] && (
                      <span className="mt-1.5 inline-block rounded-full bg-crimson/10 px-2 py-0.5 text-[10px] font-semibold text-crimson">
                        Subscribe &amp; Save
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ 6. TESTIMONIALS ══════════════════════════════════════════════════════ */}
      <section className="bg-charcoal py-16 md:py-20 text-off-white">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Real Customers</p>
            <h2 className="font-display text-2xl font-extrabold md:text-3xl">
              What Meat Lovers Are Saying
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {REVIEWS.map(({ name, title, body, rating }) => (
              <div key={name} className="flex flex-col gap-4 rounded-2xl border border-off-white/10 bg-off-white/5 p-6">
                <div className="flex gap-0.5">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                  ))}
                </div>
                <div>
                  <p className="font-display text-base font-bold">{title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-off-white/70">{body}</p>
                </div>
                <p className="mt-auto text-xs font-semibold text-gold">— {name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 7. FAQs ══════════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-crimson">Got Questions?</p>
            <h2 className="font-display text-2xl font-extrabold md:text-3xl">Subscription FAQs</h2>
          </div>
          <div className="mx-auto max-w-2xl space-y-3">
            {FAQS.map((item) => <FaqItem key={item.q} q={item.q} a={item.a} />)}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Need more detail?{" "}
            <Link to="/pages/subscription-policy" className="font-semibold text-crimson hover:underline">
              Read the full Subscription Policy →
            </Link>
          </p>
        </div>
      </section>

      {/* ══ 8. BOTTOM CTA ════════════════════════════════════════════════════════ */}
      <section className="py-16 text-center" style={{ background: "linear-gradient(135deg,#1a0a0a 0%,#a70a10 50%,#1a0a0a 100%)" }}>
        <div className="container mx-auto px-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Start Today</p>
          <h2 className="font-display text-3xl font-extrabold text-white md:text-4xl">
            Ready to Start Saving?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/70 md:text-base">
            First order includes a free Ribeye Steak, free delivery and 10% off. No commitment.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/collections/all"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-sm font-bold uppercase tracking-wide text-crimson shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
            >
              Start My Subscription <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://account.mlsuae.ae/pages/8cfdfe48-f906-45d6-8515-29818e34a6d4"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition-all hover:border-white hover:bg-white/10"
            >
              <Settings className="h-4 w-4" /> Manage My Plan
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}

// ─── Inline FAQ accordion ─────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-display text-sm font-semibold md:text-base">{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? "300px" : "0px" }}
      >
        <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{a}</p>
      </div>
    </div>
  );
}

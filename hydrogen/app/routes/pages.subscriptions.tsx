import type { LoaderFunctionArgs, MetaFunction } from "@shopify/remix-oxygen";
import { useLoaderData, Link } from "react-router";
import { RefreshCw, Truck, Gift, ShieldCheck, ArrowRight, Settings } from "lucide-react";

export const meta: MetaFunction = () => [
  { title: "MLS Subscriptions — Never Run Out of Premium Meat" },
  { name: "description", content: "Subscribe to your favourite MLS cuts and get regular deliveries, 10% off every order, and a free steak every month." },
];

const SUBSCRIPTION_PRODUCTS_QUERY = `#graphql
  query SubscriptionProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 6, query: "selling_plan:true") {
      nodes {
        handle
        title
        priceRange { minVariantPrice { amount currencyCode } }
        images(first: 1) { nodes { url altText } }
        sellingPlanGroups(first: 1) {
          nodes {
            name
            sellingPlans(first: 1) {
              nodes { id name }
            }
          }
        }
      }
    }
  }
` as const;

export async function loader({ context, request }: LoaderFunctionArgs) {
  const lang = request.headers.get("Cookie")?.match(/(?:^|;\s*)lang=([a-z]{2})/)?.[1];
  const language = (lang === "ar" ? "AR" : "EN") as "AR" | "EN";

  const { products } = await context.storefront.query(SUBSCRIPTION_PRODUCTS_QUERY, {
    variables: { country: "AE" as const, language },
  });

  return { products: products.nodes };
}

const BENEFITS = [
  {
    Icon: RefreshCw,
    title: "Flexible Schedule",
    desc: "Choose weekly, bi-weekly, or monthly deliveries. Pause or cancel anytime.",
  },
  {
    Icon: Gift,
    title: "10% Off Every Order",
    desc: "Subscribers save on every delivery. Over AED 100? Unlock free delivery too.",
  },
  {
    Icon: Truck,
    title: "Free Delivery",
    desc: "Orders over AED 100 include free delivery on your chosen schedule.",
  },
  {
    Icon: ShieldCheck,
    title: "100% Halal & Fresh",
    desc: "Same-day packed, cold-chain delivered. Quality guaranteed every time.",
  },
];

function formatPrice(amount: string, currency: string) {
  return new Intl.NumberFormat("en-AE", { style: "currency", currency, minimumFractionDigits: 0 }).format(parseFloat(amount));
}

export default function SubscriptionsPage() {
  const { products } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero ── */}
      <div className="bg-charcoal py-16 text-center text-off-white md:py-20">
        <div className="container mx-auto px-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            Subscribe & Save
          </p>
          <h1 className="font-display text-3xl font-extrabold md:text-5xl">
            Never Run Out of <span className="text-crimson">Premium Meat</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-off-white/70 md:text-lg">
            Set up a recurring delivery of your favourite cuts — get 10% off, free delivery, and a free NZ Ribeye steak every month.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://account.mlsuae.ae/pages/8cfdfe48-f906-45d6-8515-29818e34a6d4"
              className="inline-flex items-center gap-2 rounded-lg bg-crimson px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-rich-red"
            >
              <Settings className="h-4 w-4" />
              Manage My Subscriptions
            </a>
            <Link
              to="/pages/subscription-policy"
              className="inline-flex items-center gap-2 rounded-lg border border-off-white/30 px-6 py-3 text-sm font-bold uppercase tracking-wide text-off-white transition-colors hover:border-off-white"
            >
              View Policy
            </Link>
          </div>
        </div>
      </div>

      {/* ── Benefits ── */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl font-extrabold md:text-3xl">Why Subscribe?</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-6 text-center shadow-sm"
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-crimson/10">
                <Icon className="h-6 w-6 text-crimson" />
              </div>
              <h3 className="font-display text-base font-bold">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Subscribable products ── */}
      {products.length > 0 && (
        <div className="container mx-auto px-4 pb-16">
          <div className="mb-6 text-center">
            <h2 className="font-display text-2xl font-extrabold md:text-3xl">Available for Subscription</h2>
            <p className="mt-2 text-sm text-muted-foreground">Add any of these to a recurring order from the product page</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {products.map((p) => (
              <Link
                key={p.handle}
                to={`/products/${p.handle}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                {p.images.nodes[0] && (
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={p.images.nodes[0].url}
                      alt={p.images.nodes[0].altText ?? p.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-3">
                  <p className="text-xs font-medium leading-snug text-foreground line-clamp-2">{p.title}</p>
                  <p className="mt-1 text-xs font-bold text-crimson">
                    {formatPrice(p.priceRange.minVariantPrice.amount, p.priceRange.minVariantPrice.currencyCode)}
                  </p>
                  {p.sellingPlanGroups.nodes[0] && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {p.sellingPlanGroups.nodes[0].name}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/collections/all"
              className="inline-flex items-center gap-2 text-sm font-semibold text-crimson hover:underline"
            >
              Browse all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Manage CTA ── */}
      <div className="bg-muted/40 py-12 text-center">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-xl font-extrabold md:text-2xl">Already a subscriber?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Manage, pause, or update your subscription from your account portal.</p>
          <a
            href="https://account.mlsuae.ae/pages/8cfdfe48-f906-45d6-8515-29818e34a6d4"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-crimson px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-rich-red"
          >
            <Settings className="h-4 w-4" />
            Go to Subscription Portal
          </a>
        </div>
      </div>

    </div>
  );
}

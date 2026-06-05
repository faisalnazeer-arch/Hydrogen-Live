import type { LoaderFunctionArgs, MetaFunction } from "@shopify/remix-oxygen";
import { useLoaderData } from "react-router";
import { MapPin, Clock, ExternalLink, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { FaqAccordion, parseFaqItems } from "@/components/ui/FaqAccordion";

export const meta: MetaFunction = () => [
  { title: "MLS Gourmet Butcher Shops — MLS UAE" },
  { name: "description", content: "Visit our premium MLS Gourmet Butcher Shops across Dubai and Abu Dhabi." },
];

const GOURMET_QUERY = `{
  page: metaobjects(type: "mls_gourmet_page", first: 1) {
    nodes {
      fields {
        key
        value
        references(first: 20) {
          nodes {
            ... on Metaobject {
              id
              fields {
                key
                value
                reference {
                  ... on MediaImage { image { url altText } }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

export async function loader({ context }: LoaderFunctionArgs) {
  const data = await context.adminFetch(GOURMET_QUERY);
  const node = data?.page?.nodes?.[0];
  const f = Object.fromEntries((node?.fields ?? []).map((x: any) => [x.key, x]));

  const stores = (f.store_locations?.references?.nodes ?? []).map((n: any) => {
    const sf = Object.fromEntries(n.fields.map((x: any) => [x.key, x]));
    return {
      id: n.id,
      name:       sf.name?.value ?? "",
      address:    sf.address?.value ?? "",
      hours:      sf.hours?.value ?? "",
      mapsUrl:    sf.maps_url?.value ?? "",
      embedUrl:   sf.embed_url?.value ?? "",
      image:      sf.store_image?.reference?.image?.url ?? null,
      imageAlt:   sf.store_image?.reference?.image?.altText ?? "",
    };
  });

  const faqItems = parseFaqItems(f.faq_items?.references?.nodes ?? []);

  return {
    heroTitle:    f.hero_title?.value    ?? "MLS Gourmet Butcher Shops",
    heroSubtitle: f.hero_subtitle?.value ?? "",
    stores,
    faqItems,
  };
}

export default function MlsGourmetPage() {
  const { heroTitle, heroSubtitle, stores, faqItems } = useLoaderData<typeof loader>();

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <div className="bg-[#f9f3f3] py-10 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          {heroTitle}
        </h1>
        {heroSubtitle && (
          <p className="mx-auto mt-3 max-w-2xl px-4 text-sm text-muted-foreground md:text-base">
            {heroSubtitle}
          </p>
        )}
      </div>

      {/* Store Locations */}
      {stores.length > 0 && (
        <div className="container mx-auto max-w-5xl px-4 py-12 space-y-14">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      )}

      {/* FAQs */}
      {faqItems.length > 0 && (
        <div className="border-t border-border">
          <div className="container mx-auto max-w-3xl px-4 py-14">
            <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground">FAQs</h2>
            <FaqAccordion items={faqItems} />
          </div>
        </div>
      )}

      {/* Back to top */}
      <div className="border-t border-border py-6 text-center">
        <button
          onClick={scrollToTop}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to top <ChevronUp className="h-4 w-4" />
        </button>
      </div>

    </div>
  );
}

// ── Store Card ────────────────────────────────────────────────────────────────

type Store = {
  id: string;
  name: string;
  address: string;
  hours: string;
  mapsUrl: string;
  embedUrl: string;
  image: string | null;
  imageAlt: string;
};

function StoreCard({ store }: { store: Store }) {
  return (
    <div>
      <h2 className="mb-4 text-center font-display text-xl font-semibold text-foreground">
        {store.name}
      </h2>
      <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-border md:grid-cols-3">

        {/* Info */}
        <div className="flex flex-col justify-between gap-6 p-6">
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-crimson" />
              <span className="text-foreground leading-relaxed">{store.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 shrink-0 text-crimson" />
              <span className="text-foreground">{store.hours}</span>
            </div>
          </div>
          {store.mapsUrl && (
            <a
              href={store.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-md bg-crimson px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-800"
            >
              <ExternalLink className="h-4 w-4" />
              Get Directions
            </a>
          )}
        </div>

        {/* Store photo */}
        <div className="flex min-h-[220px] items-center justify-center bg-muted">
          {store.image ? (
            <img
              src={store.image}
              alt={store.imageAlt || store.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center px-4 py-8 text-muted-foreground text-sm">
              <div className="text-3xl mb-2">🥩</div>
              <p className="font-medium">{store.name}</p>
              <p className="text-xs mt-1 opacity-60">Upload photo in Shopify Admin → Metaobjects</p>
            </div>
          )}
        </div>

        {/* Map embed */}
        <div className="relative min-h-[220px] overflow-hidden">
          {store.mapsUrl && (
            <a
              href={store.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-xs font-semibold shadow-sm hover:bg-white"
            >
              Open in Maps <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {store.embedUrl ? (
            <iframe
              title={`Map - ${store.name}`}
              src={store.embedUrl}
              className="h-full w-full min-h-[220px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex h-full min-h-[220px] items-center justify-center bg-muted/50 text-xs text-muted-foreground">
              Add embed URL in Shopify Admin
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

import { Link } from "react-router";
import type { ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "@/components/product/ProductCard";
import { HScroller } from "./HScroller";

interface CategorySectionProps {
  handle: string;
  title: string;
  subtitle?: string;
  /** Products pre-fetched server-side. When provided the client fetch is skipped. */
  products?: ShopifyProduct[];
}

export function CategorySection({
  handle,
  title,
  subtitle,
  products = [],
}: CategorySectionProps) {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          {subtitle && (
            <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-crimson">
              {subtitle}
            </div>
          )}
          <h2 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
            {title}
          </h2>
        </div>
        <Link
          to={`/collections/${handle}`}
          className="text-sm font-semibold text-crimson hover:underline"
        >
          View all →
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card/50 px-6 py-12 text-center text-muted-foreground">
          No products in this collection yet.
        </div>
      ) : (
        <HScroller>
          {products.map((p) => (
            <div
              key={p.node.id}
              className="w-[46%] flex-shrink-0 snap-start sm:w-[32%] lg:w-[23%] xl:w-[19%]"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </HScroller>
      )}
    </section>
  );
}

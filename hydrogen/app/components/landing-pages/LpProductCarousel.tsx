import { Link } from "react-router";
import { HScroller } from "~/components/home/HScroller";
import { ProductCard } from "~/components/product/ProductCard";
import type { ShopifyProduct } from "@/lib/shopify";

export function LpProductCarousel({
  products,
  heading,
  collectionHandle,
  sectionId,
}: {
  products: ShopifyProduct[];
  heading?: string | null;
  collectionHandle?: string | null;
  sectionId?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section id={sectionId} className="py-10 md:py-14">
      {(heading || collectionHandle) && (
        <div className="container mx-auto px-4 mb-6 flex items-center justify-between">
          {heading && (
            <h2 className="font-display text-2xl font-extrabold md:text-3xl">{heading}</h2>
          )}
          {collectionHandle && (
            <Link
              to={`/collections/${collectionHandle}`}
              className="text-sm font-semibold text-crimson hover:underline flex-shrink-0 ml-4"
            >
              View All →
            </Link>
          )}
        </div>
      )}
      <HScroller innerClassName="px-4 md:px-8">
        {products.map((p) => (
          <div key={p.node.id} className="w-[44vw] flex-shrink-0 snap-start md:w-[220px]">
            <ProductCard product={p} />
          </div>
        ))}
      </HScroller>
    </section>
  );
}

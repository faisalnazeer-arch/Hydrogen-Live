import { Link } from "react-router";
import { ProductCard } from "~/components/product/ProductCard";
import type { ShopifyProduct } from "@/lib/shopify";

function getField(fields: any[], key: string): string | null {
  return fields?.find((f: any) => f.key === key)?.value ?? null;
}

export function LpProductGridSection({
  fields,
  products,
  headingOverride,
}: {
  fields: any[];
  products: ShopifyProduct[];
  headingOverride?: string | null;
}) {
  if (products.length === 0) return null;

  const heading = getField(fields, "heading") ?? headingOverride ?? null;
  const subheading = getField(fields, "subheading");
  const ctaText = getField(fields, "cta_text");
  const ctaUrl = getField(fields, "cta_url");
  const sectionId = getField(fields, "section_id") ?? "products";

  return (
    <section id={sectionId} className="py-12">
      <div className="container mx-auto px-4">
        {(heading || subheading) && (
          <div className="mb-8 text-center">
            {heading && (
              <h2 className="font-display text-2xl font-extrabold md:text-3xl">{heading}</h2>
            )}
            {subheading && (
              <p className="mt-1 text-sm text-muted-foreground">{subheading}</p>
            )}
            {ctaText && ctaUrl && (
              <Link to={ctaUrl} className="mt-2 inline-block text-sm font-semibold text-crimson hover:underline">
                {ctaText} →
              </Link>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p.node.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
import { useState } from "react";
import { Link } from "react-router";
import type { ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "@/components/product/ProductCard";
import { HScroller } from "./HScroller";

interface TabData {
  label: string;
  handle: string;
  products: ShopifyProduct[];
}

interface CategorySectionProps {
  handle: string;
  title: string;
  subtitle?: string;
  products?: ShopifyProduct[];
  tabs?: TabData[];
}

export function CategorySection({
  handle,
  title,
  subtitle,
  products = [],
  tabs,
}: CategorySectionProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  const hasTabs = tabs && tabs.length > 1;
  const activeTab = hasTabs ? tabs[activeIdx] : null;
  const visibleProducts = activeTab ? activeTab.products : products;
  const viewAllHandle = activeTab ? activeTab.handle : handle;

  return (
    <section className="container mx-auto px-4 py-6 md:py-12">
      {/* Header */}
      <div className="mb-3 text-center">
        {subtitle && (
          <div className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-crimson md:mb-1 md:text-[11px]">
            {subtitle}
          </div>
        )}
        <h2 className="font-display text-lg font-extrabold tracking-tight md:text-3xl">
          {title}
        </h2>
      </div>

      {/* Collection tabs */}
      {hasTabs && (
        <div className="relative mb-3">
          {/* Right fade — hints that more tabs are scrollable */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-12 z-10 bg-gradient-to-l from-background to-transparent" />
          <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            <div className="flex min-w-max border-b border-border mx-auto w-fit">
              {tabs.map((tab, idx) => (
                <TabButton
                  key={tab.handle}
                  active={idx === activeIdx}
                  onClick={() => setActiveIdx(idx)}
                >
                  {tab.label}
                </TabButton>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View all */}
      <div className="mb-3 text-center">
        <Link
          to={`/collections/${viewAllHandle}`}
          className="text-xs font-semibold text-crimson underline-offset-2 hover:underline md:text-sm"
        >
          View all
        </Link>
      </div>

      {/* Products */}
      {visibleProducts.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card/50 px-6 py-12 text-center text-muted-foreground">
          No products in this tab.
        </div>
      ) : (
        <HScroller>
          {visibleProducts.map((p) => (
            <div
              key={p.node.id}
              className="w-[44%] flex-shrink-0 snap-start sm:w-[32%] lg:w-[23%] xl:w-[19%]"
            >
              <ProductCard product={p} />
            </div>
          ))}
        </HScroller>
      )}
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative whitespace-nowrap px-5 py-2.5 text-sm font-semibold capitalize transition-colors ${
        active ? "text-crimson" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      {active && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-crimson" />
      )}
    </button>
  );
}

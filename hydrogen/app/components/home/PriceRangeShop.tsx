import { Link } from "react-router";
import { SectionHeader } from "./FeaturedCollections";

// ── Types ──────────────────────────────────────────────────────────────────

export interface PriceTile {
  id: string;
  priceAmount: string;
  priceLabel: string;
  linkUrl: string;
  backgroundImageUrl: string | null;
  backgroundImageAlt: string | null;
}

export interface PriceRangeSectionData {
  heading: string;
  subHeading: string;
}

// ── Raw metaobject parsers ─────────────────────────────────────────────────

export function parsePriceRangeSection(nodes: any[]): PriceRangeSectionData {
  const node = nodes[0];
  if (!node) return { heading: "Shop by Price", subHeading: "Every budget, premium quality" };
  const f = Object.fromEntries(node.fields.map((x: any) => [x.key, x]));
  return {
    heading: f["heading"]?.value ?? "Shop by Price",
    subHeading: f["sub_heading"]?.value ?? "Every budget, premium quality",
  };
}

export function parsePriceTiles(nodes: any[]): PriceTile[] {
  return nodes
    .map((node: any) => {
      const f = Object.fromEntries(node.fields.map((x: any) => [x.key, x]));
      const amount = f["price_amount"]?.value;
      if (!amount) return null;

      // Prefer collection reference → derive URL from handle
      const collectionHandle = f["collection"]?.reference?.handle;
      const fallbackUrl = f["link_url"]?.value ?? "";
      const url = collectionHandle
        ? `/collections/${collectionHandle}`
        : fallbackUrl;

      if (!url) return null;

      return {
        id: node.id as string,
        priceAmount: amount as string,
        priceLabel: (f["price_label"]?.value ?? "AED & under") as string,
        linkUrl: url as string,
        backgroundImageUrl: f["background_image"]?.reference?.image?.url ?? null,
        backgroundImageAlt: f["background_image"]?.reference?.image?.altText ?? null,
      };
    })
    .filter(Boolean) as PriceTile[];
}

// ── Component ──────────────────────────────────────────────────────────────

interface PriceRangeShopProps {
  section?: PriceRangeSectionData | null;
  tiles?: PriceTile[];
}

export function PriceRangeShop({ section, tiles = [] }: PriceRangeShopProps) {
  const heading = section?.heading ?? "Shop by Price";
  const subHeading = section?.subHeading ?? "Every budget, premium quality";

  return (
    <section className="container mx-auto px-4 py-10 md:py-14">
      <SectionHeader title={heading} subtitle={subHeading} />
      <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [scrollbar-width:none] md:grid md:grid-cols-6">
        {tiles.map((tile) => (
          <PriceTileCard key={tile.id} tile={tile} />
        ))}
      </div>
    </section>
  );
}

// ── Tile card ──────────────────────────────────────────────────────────────

function PriceTileCard({ tile }: { tile: PriceTile }) {
  return (
    <Link
      to={tile.linkUrl}
      className="group relative flex aspect-[4/5] w-[40vw] flex-shrink-0 flex-col items-center justify-center overflow-hidden rounded-2xl border border-border text-crimson-foreground transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)] md:w-auto"
    >
      {/* Background */}
      {tile.backgroundImageUrl ? (
        <>
          <img
            src={tile.backgroundImageUrl}
            alt={tile.backgroundImageAlt ?? tile.priceAmount}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/35 to-black/10" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-crimson via-rich-red to-charcoal" />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-0.5">
        <div className="font-display text-2xl font-extrabold leading-none text-white md:text-4xl">
          {tile.priceAmount}
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/80 md:text-xs">
          {tile.priceLabel}
        </div>
      </div>
    </Link>
  );
}

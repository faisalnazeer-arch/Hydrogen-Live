import { Link } from "react-router";
import { HScroller } from "./HScroller";

export interface FeaturedCollectionCard {
  id: string;
  heading: string;
  subHeading: string;
  url: string;
  imageUrl?: string | null;
  imageAlt?: string;
  emoji?: string;
}

const FALLBACK_CARDS: FeaturedCollectionCard[] = [
  { id: "f1", heading: "Australian Wagyu", subHeading: "Marbling MB 4/5", url: "/collections/australian-wagyu-beef-mb-4-5", emoji: "🥩" },
  { id: "f2", heading: "Black Angus", subHeading: "Australian", url: "/collections/australian-black-angus-beef", emoji: "🐂" },
  { id: "f3", heading: "Australian Lamb", subHeading: "Grass-fed", url: "/collections/australian-lamb", emoji: "🐑" },
  { id: "f4", heading: "Burger Patties", subHeading: "Grill-ready", url: "/collections/beef-burgers-patties", emoji: "🍔" },
  { id: "f5", heading: "BBQ & Mishkak", subHeading: "Pre-cubed", url: "/collections/beef-mishkak-barbecue-cubes-fondue", emoji: "🔥" },
  { id: "f6", heading: "Meat Boxes", subHeading: "Curated bundles", url: "/collections/box-collection", emoji: "📦" },
];

interface FeaturedCollectionsProps {
  cards?: FeaturedCollectionCard[];
  title?: string;
  subtitle?: string;
}

export function FeaturedCollections({
  cards,
  title = "Featured Collections",
  subtitle = "Hand-picked favourites",
}: FeaturedCollectionsProps) {
  const items = cards && cards.length > 0 ? cards : FALLBACK_CARDS;

  return (
    <section className="container mx-auto px-4 py-12">
      <SectionHeader title={title} subtitle={subtitle} />
      <HScroller>
        {items.map((c) => (
          <Link
            key={c.id}
            to={c.url}
            className="group flex w-40 flex-shrink-0 snap-start flex-col items-center gap-3 rounded-lg border border-border bg-card p-5 text-center transition-shadow hover:shadow-[var(--shadow-elegant)] sm:w-48"
          >
            <div className="grid h-16 w-16 place-items-center rounded-full bg-crimson/10 transition-transform group-hover:scale-110 overflow-hidden">
              {c.imageUrl ? (
                <img
                  src={c.imageUrl}
                  alt={c.imageAlt ?? c.heading}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-3xl">{c.emoji ?? "🛒"}</span>
              )}
            </div>
            <div>
              <div className="font-display text-sm font-bold">{c.heading}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{c.subHeading}</div>
            </div>
          </Link>
        ))}
      </HScroller>
    </section>
  );
}

export function SectionHeader({
  title,
  subtitle,
  actionHref,
  actionLabel,
}: {
  title: string;
  subtitle?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
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
      {actionHref && (
        <a
          href={actionHref}
          className="hidden text-sm font-semibold text-crimson hover:underline sm:inline"
        >
          {actionLabel ?? "View all →"}
        </a>
      )}
    </div>
  );
}

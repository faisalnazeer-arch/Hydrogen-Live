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

interface FeaturedCollectionsProps {
  cards?: FeaturedCollectionCard[];
  title?: string;
  subtitle?: string;
}

export function FeaturedCollections({ cards, title, subtitle }: FeaturedCollectionsProps) {
  if (!cards || cards.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-12">
      {(title || subtitle) && <SectionHeader title={title ?? ""} subtitle={subtitle} />}
      <HScroller>
        {cards.map((c) => (
          <Link
            key={c.id}
            to={c.url}
            className="group flex w-40 flex-shrink-0 snap-start flex-col items-center gap-3 rounded-lg border border-border bg-card p-5 text-center transition-shadow hover:shadow-[var(--shadow-elegant)] sm:w-48"
          >
            <div className="grid h-16 w-16 place-items-center rounded-full bg-crimson/10 transition-transform group-hover:scale-110 overflow-hidden">
              {c.imageUrl ? (
                <img src={c.imageUrl} alt={c.imageAlt ?? c.heading} className="h-full w-full object-contain" />
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
    <div className="mb-3 flex items-end justify-between gap-4 md:mb-6">
      <div>
        {subtitle && (
          <div className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-crimson md:mb-1 md:text-[11px]">{subtitle}</div>
        )}
        <h2 className="font-display text-lg font-extrabold tracking-tight md:text-3xl">{title}</h2>
      </div>
      {actionHref && (
        <a href={actionHref} className="hidden text-sm font-semibold text-crimson hover:underline sm:inline">
          {actionLabel ?? "View all →"}
        </a>
      )}
    </div>
  );
}

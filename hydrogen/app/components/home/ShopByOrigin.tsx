import { useState } from "react";
import { Link } from "react-router";
import { HScroller } from "./HScroller";

function OriginFlag({
  imageUrl,
  imageAlt,
  countryCode,
}: {
  imageUrl: string | null;
  imageAlt: string;
  countryCode: string;
}) {
  const flagSrc = countryCode
    ? `https://hatscripts.github.io/circle-flags/flags/${countryCode.toLowerCase()}.svg`
    : null;

  const src = imageUrl ?? flagSrc;

  if (src) {
    return (
      <div className="relative h-16 w-16 transition-transform group-hover:scale-105">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-crimson/20 to-crimson/5 ring-2 ring-crimson/30 shadow-md" />
        <img
          src={src}
          alt={imageAlt}
          className="h-full w-full rounded-full object-cover relative z-10"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="h-16 w-16 rounded-full ring-2 ring-crimson/30 bg-gradient-to-br from-crimson/10 to-bone flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
      <svg viewBox="0 0 64 64" className="h-8 w-8 text-crimson/60" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="32" cy="32" r="18" />
        <path d="M32 14 C20 20 20 44 32 50 C44 44 44 20 32 14Z" />
        <line x1="14" y1="32" x2="50" y2="32" />
      </svg>
    </div>
  );
}

export interface OriginItem {
  id: string;
  heading: string;
  link: string;
  imageUrl: string | null;
  imageAlt: string;
  category: string;
  countryCode: string;
}

export interface OriginSectionData {
  eyebrow: string;
  heading: string;
  items: OriginItem[];
}

interface Props {
  section?: OriginSectionData | null;
}

export function ShopByOrigin({ section }: Props) {
  const categories = Array.from(
    new Set((section?.items ?? []).map((i) => i.category).filter(Boolean))
  );

  const [activeTab, setActiveTab] = useState(categories[0] ?? "");

  if (!section || section.items.length === 0) return null;

  const activeItems =
    categories.length > 0
      ? section.items.filter((i) => i.category === activeTab)
      : section.items;

  return (
    <section className="bg-bone py-10 md:py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-crimson">
            {section.eyebrow}
          </div>
          <h2 className="font-display text-2xl font-extrabold md:text-3xl">
            {section.heading}
          </h2>
        </div>

        {/* Category tabs */}
        {categories.length > 1 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {categories.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full border-2 px-6 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                  activeTab === tab
                    ? "border-crimson bg-crimson text-white"
                    : "border-crimson text-crimson hover:bg-crimson/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* Carousel — keyed by tab so it resets scroll position on tab change */}
        <HScroller key={activeTab}>
          {activeItems.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className="group flex min-w-[140px] shrink-0 snap-start flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-crimson hover:shadow-md"
            >
              <OriginFlag
                imageUrl={item.imageUrl}
                imageAlt={item.imageAlt || item.heading}
                countryCode={item.countryCode}
              />
              <span className="text-center text-[12px] font-semibold leading-tight">
                {item.heading}
              </span>
            </Link>
          ))}
        </HScroller>
      </div>
    </section>
  );
}

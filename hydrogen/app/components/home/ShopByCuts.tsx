import { Link } from "react-router";
import type { CutsSectionData } from "~/routes/_index";

interface Props {
  section?: CutsSectionData | null;
}

export function ShopByCuts({ section }: Props) {
  if (!section || section.items.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-6 md:py-12">
      <div className="mb-3 text-center md:mb-6">
        <div className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-crimson md:mb-1 md:text-[11px]">{section.eyebrow}</div>
        <h2 className="font-display text-lg font-extrabold md:text-3xl">{section.heading}</h2>
      </div>
      <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
        {section.items.map((c) => (
          <Link
            key={c.id}
            to={c.url}
            className="group flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 transition-all hover:-translate-y-1 hover:border-crimson hover:shadow-[var(--shadow-card)]"
          >
            <span className="text-3xl transition-transform group-hover:scale-110">{c.emoji}</span>
            <span className="text-center text-xs font-semibold uppercase tracking-wider">{c.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

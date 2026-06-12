import { Link } from "react-router";
import type { CutsSectionData } from "~/routes/_index";

interface Props {
  section?: CutsSectionData | null;
}

export function ShopByCuts({ section }: Props) {
  if (!section || section.items.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-10 md:py-14">
      <div className="mb-7 text-center md:mb-10">
        <div className="mb-1.5 flex items-center justify-center gap-2">
          <span className="h-px w-5 rounded-full bg-crimson" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-crimson">
            {section.eyebrow}
          </span>
          <span className="h-px w-5 rounded-full bg-crimson" />
        </div>
        <h2 className="font-display text-xl font-extrabold tracking-tight md:text-4xl">
          {section.heading}
        </h2>
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6 md:gap-3 lg:grid-cols-8">
        {section.items.map((c) => (
          <Link
            key={c.id}
            to={c.url}
            className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-card px-2 py-5 text-center transition-all duration-200 hover:-translate-y-1 hover:border-crimson hover:bg-crimson/5 hover:shadow-[var(--shadow-card)] md:py-6"
          >
            <span className="text-4xl transition-transform duration-300 group-hover:scale-125 md:text-5xl">
              {c.emoji}
            </span>
            <span className="text-[10px] font-bold uppercase leading-tight tracking-wider text-foreground transition-colors group-hover:text-crimson md:text-[11px]">
              {c.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

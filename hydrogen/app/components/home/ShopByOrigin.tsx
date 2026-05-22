import { Link } from "react-router";

export interface OriginItem {
  id: string;
  heading: string;
  code: string;
  link: string;
  imageUrl: string | null;
  imageAlt: string;
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
  if (!section || section.items.length === 0) return null;

  return (
    <section className="bg-bone py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 text-center">
          <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-crimson">{section.eyebrow}</div>
          <h2 className="font-display text-2xl font-extrabold md:text-3xl">{section.heading}</h2>
        </div>
        <div className="grid grid-cols-4 gap-3 md:grid-cols-7">
          {section.items.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className="group flex flex-col items-center gap-2 rounded-lg border border-border bg-card p-4 transition-all hover:-translate-y-1 hover:border-crimson hover:shadow-[var(--shadow-card)]"
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.imageAlt || item.heading}
                  className="h-10 w-10 rounded-full object-cover transition-transform group-hover:scale-110"
                />
              ) : (
                <span className="text-2xl font-bold transition-transform group-hover:scale-110" aria-hidden>
                  {item.code}
                </span>
              )}
              <span className="text-center text-[11px] font-bold uppercase tracking-wider">{item.heading}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Link } from "react-router";

export interface CategoryItem {
  id: string;
  heading: string;
  link: string;
  imageUrl: string | null;
  imageAlt: string;
}

export interface CategorySectionData {
  eyebrow: string;
  heading: string;
  items: CategoryItem[];
}

interface Props {
  section?: CategorySectionData | null;
}

export function ShopByCategory({ section }: Props) {
  if (!section || section.items.length === 0) return null;

  return (
    <section className="bg-bone py-10 md:py-16">
      <div className="container mx-auto px-4">
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

        <div className="grid grid-cols-4 gap-2.5 md:grid-cols-8 md:gap-3">
          {section.items.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className="group relative overflow-hidden rounded-xl bg-charcoal"
              style={{ aspectRatio: "3/4" }}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.imageAlt || item.heading}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-crimson/20 to-charcoal">
                  <span className="text-4xl">🥩</span>
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              {/* Hover highlight ring */}
              <div className="absolute inset-0 rounded-xl ring-2 ring-inset ring-transparent transition-all duration-300 group-hover:ring-crimson/70" />

              {/* Label */}
              <div className="absolute inset-x-0 bottom-0 p-2 text-center md:p-3">
                <span className="block text-[10px] font-bold uppercase leading-tight tracking-wide text-white md:text-[11px]">
                  {item.heading}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Link } from "react-router";

export interface MegaColumn {
  title: string;
  links: Array<{ label: string; url: string }>;
}

interface MegaMenuProps {
  columns: MegaColumn[];
}

export function MegaMenu({ columns }: MegaMenuProps) {
  return (
    <div className="absolute left-4 right-4 top-full z-50 hidden group-hover:block">
      <div className="rounded-md border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-crimson">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.url + l.label}>
                    <Link
                      to={l.url}
                      className="text-sm text-foreground transition-colors hover:text-crimson"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


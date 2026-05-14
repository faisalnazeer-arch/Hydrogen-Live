import { Truck, RefreshCw, ShieldCheck, Award } from "lucide-react";
import { useT, type TKey } from "@/i18n/strings";

// ── Types ──────────────────────────────────────────────────────────────────

interface TrustBadge {
  id: string;
  handle: string | null;
  iconUrl: string | null;
  heading: string | null;
  subTitle: string | null;
}

interface RawMetaobjectNode {
  id: string;
  handle?: string | null;
  fields: Array<{
    key: string;
    value: string | null;
    reference?: { image?: { url: string } } | null;
  }>;
}

// ── Default (static) badges used when no metaobject data is provided ───────

const DEFAULT_BADGES = [
  { Icon: RefreshCw, headingKey: "trust.free_returns" as TKey, descKey: "trust.free_returns_sub" as TKey },
  { Icon: Truck,     headingKey: "trust.same_day" as TKey,     descKey: "trust.same_day_sub" as TKey },
  { Icon: ShieldCheck, headingKey: "trust.halal" as TKey,      descKey: "trust.halal_sub" as TKey },
  { Icon: Award,     headingKey: "trust.premium" as TKey,      descKey: "trust.premium_sub" as TKey },
];

const DEFAULT_ICONS = [RefreshCw, Truck, ShieldCheck, Award];

// ── Parser ─────────────────────────────────────────────────────────────────

function parseBadges(nodes: RawMetaobjectNode[]): TrustBadge[] {
  return nodes
    .map((node) => {
      const fieldMap = Object.fromEntries(node.fields.map((f) => [f.key, f]));
      const heading = fieldMap["heading"]?.value ?? null;
      const subTitle = fieldMap["sub_title"]?.value ?? null;

      if (!heading && !subTitle) return null;

      return {
        id: node.id,
        handle: node.handle ?? null,
        iconUrl: fieldMap["icon"]?.reference?.image?.url ?? null,
        heading,
        subTitle,
      } satisfies TrustBadge;
    })
    .filter((b): b is TrustBadge => b !== null);
}

// ── Component ──────────────────────────────────────────────────────────────

interface TrustBadgesProps {
  badges?: RawMetaobjectNode[];
}

export function TrustBadges({ badges: rawBadges = [] }: TrustBadgesProps) {
  const t = useT();
  const parsed = rawBadges.length > 0 ? parseBadges(rawBadges) : null;
  const useDynamic = parsed && parsed.length > 0;

  return (
    <section className="border-b border-border bg-bone">
      <div className="container mx-auto grid grid-cols-2 gap-3 px-4 py-6 md:grid-cols-4 md:gap-6 md:py-8">
        {useDynamic
          ? parsed.map((badge, i) => (
              <DynamicBadge key={badge.id} badge={badge} index={i} />
            ))
          : DEFAULT_BADGES.map(({ Icon, headingKey, descKey }) => (
              <StaticBadge key={headingKey} Icon={Icon} title={t(headingKey)} desc={t(descKey)} />
            ))}
      </div>
    </section>
  );
}

// ── Dynamic badge (from metaobject) ───────────────────────────────────────

function DynamicBadge({
  badge,
  index,
}: {
  badge: TrustBadge;
  index: number;
}) {
  const FallbackIcon = DEFAULT_ICONS[index % DEFAULT_ICONS.length];

  const heading = badge.heading;
  const subTitle = badge.subTitle;

  return (
    <div className="flex flex-col items-center gap-2 rounded-lg bg-background/60 p-4 text-center md:flex-row md:gap-3 md:bg-transparent md:p-0 md:text-start">
      <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-crimson/10 text-crimson md:h-12 md:w-12">
        {badge.iconUrl ? (
          <img
            src={badge.iconUrl}
            alt={heading ?? ""}
            className="h-6 w-6 object-contain"
          />
        ) : (
          <FallbackIcon className="h-5 w-5" />
        )}
      </div>
      <div className="min-w-0">
        {heading && (
          <div className="font-display text-[13px] font-bold leading-tight md:text-sm">
            {heading}
          </div>
        )}
        {subTitle && (
          <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground md:text-xs">
            {subTitle}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Static badge (default fallback) ──────────────────────────────────────

function StaticBadge({
  Icon,
  title,
  desc,
}: {
  Icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg bg-background/60 p-4 text-center md:flex-row md:gap-3 md:bg-transparent md:p-0 md:text-start">
      <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-crimson/10 text-crimson md:h-12 md:w-12">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="font-display text-[13px] font-bold leading-tight md:text-sm">
          {title}
        </div>
        <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground md:text-xs">
          {desc}
        </div>
      </div>
    </div>
  );
}

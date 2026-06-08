import type { LoaderFunctionArgs, MetaFunction } from "@shopify/remix-oxygen";
import { useLoaderData, Link } from "react-router";
import { Star, ChevronDown, ArrowRight, Settings, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: `${data?.page?.heroTitle ?? "Subscriptions"} — MLS UAE` },
  { name: "description", content: data?.page?.heroSubtitle ?? "Subscribe & Save up to 15% on every MLS order." },
];

// ─── Admin query ──────────────────────────────────────────────────────────────

const PAGE_QUERY = `{
  page: metaobjects(type: "mls_subscription_page", first: 1) {
    nodes {
      fields {
        key value
        references(first: 20) {
          nodes {
            ... on Metaobject {
              id
              fields { key value }
            }
          }
        }
      }
    }
  }
}`;

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ context, request }: LoaderFunctionArgs) {
  const lang = request.headers.get("Cookie")?.match(/(?:^|;\s*)lang=([a-z]{2})/)?.[1];
  const language = (lang === "ar" ? "AR" : "EN") as "AR" | "EN";
  void language;

  const adminData = await context.adminFetch(PAGE_QUERY);
  const node = adminData?.page?.nodes?.[0];
  const f = Object.fromEntries((node?.fields ?? []).map((x: any) => [x.key, x]));
  const refs = (key: string) => f[key]?.references?.nodes ?? [];

  const page = {
    heroTitle:      f.hero_title?.value      ?? "Eat Clean, Save Big!",
    heroSubtitle:   f.hero_subtitle?.value   ?? "",
    heroImageUrl:   f.hero_image_url?.value  ?? "",
    heroCtaText:    f.hero_cta_text?.value   ?? "Start My Subscription",
    heroCtaUrl:     f.hero_cta_url?.value    ?? "/collections/all",
    timelineTitle:  f.timeline_title?.value  ?? "Consistency Pays Off",
    benefitsTitle:  f.benefits_title?.value  ?? "The Benefits of MLS Subscription",
    stepsTitle:     f.steps_title?.value     ?? "How to Get Started",
    reviewsTitle:   f.reviews_title?.value   ?? "What Meat Lovers Say",
    faqTitle:       f.faq_title?.value       ?? "Subscription FAQs",
    manageUrl:      f.manage_url?.value      ?? "",

    timeline: refs("timeline_items").map((n: any) => {
      const nf = Object.fromEntries(n.fields.map((x: any) => [x.key, x.value]));
      return {
        id: n.id,
        weekLabel:      nf.week_label ?? "",
        healthBenefits: (nf.health_benefits ?? "").split("\n").filter(Boolean),
        perks:          (nf.perks ?? "").split("\n").filter(Boolean),
      };
    }),

    benefits: refs("benefit_items").map((n: any) => {
      const nf = Object.fromEntries(n.fields.map((x: any) => [x.key, x.value]));
      return { id: n.id, emoji: nf.emoji ?? "", title: nf.title ?? "", description: nf.description ?? "", imageUrl: nf.image_url ?? "" };
    }),

    steps: refs("step_items").map((n: any) => {
      const nf = Object.fromEntries(n.fields.map((x: any) => [x.key, x.value]));
      return { id: n.id, number: nf.number ?? "", title: nf.title ?? "", description: nf.description ?? "", imageUrl: nf.image_url ?? "" };
    }),

    reviews: refs("review_items").map((n: any) => {
      const nf = Object.fromEntries(n.fields.map((x: any) => [x.key, x.value]));
      return { id: n.id, name: nf.name ?? "", title: nf.title ?? "", body: nf.body ?? "", rating: parseInt(nf.rating ?? "5") };
    }),

    faqs: refs("faq_items").map((n: any) => {
      const nf = Object.fromEntries(n.fields.map((x: any) => [x.key, x.value]));
      return { id: n.id, question: nf.question ?? "", answer: nf.answer ?? "" };
    }),
  };

  return { page };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WEEK_BG = ["bg-crimson", "bg-crimson", "bg-rich-red", "bg-[#7a0007]"];

// Shared section heading block
function SectionHead({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <div className="mb-8 text-center md:mb-10">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-crimson">{label}</p>
      <h2 className="font-display text-2xl font-extrabold text-foreground md:text-3xl">{title}</h2>
      {sub && <p className="mt-2 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const { page } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ══ 1. HERO ═══════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-[480px] items-center overflow-hidden md:min-h-[580px]">
        {page.heroImageUrl && (
          <img src={page.heroImageUrl} alt={page.heroTitle}
            className="absolute inset-0 h-full w-full object-cover object-center" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/92 via-charcoal/70 to-transparent" />
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-lg">
            <span className="mb-3 inline-block rounded-full bg-crimson/90 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow">
              Subscribe &amp; Save up to 15%
            </span>
            <h1 className="font-display text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl">
              {page.heroTitle.includes("Save Big") ? (
                <>Eat Clean,<br /><span className="text-crimson">Save Big!</span></>
              ) : page.heroTitle}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-white/75 md:text-lg">{page.heroSubtitle}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to={page.heroCtaUrl}
                className="inline-flex items-center gap-2 rounded-lg bg-crimson px-7 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition-all hover:bg-rich-red">
                {page.heroCtaText} <ArrowRight className="h-4 w-4" />
              </Link>
              {page.manageUrl && (
                <a href={page.manageUrl}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/35 px-7 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all hover:border-white hover:bg-white/10">
                  <Settings className="h-4 w-4" /> Manage Plan
                </a>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-5">
              {["🥩 Free Ribeye every order", "🚚 Free delivery AED 100+", "✅ Cancel anytime"].map((t) => (
                <span key={t} className="text-xs text-white/60">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 2. TIMELINE ═══════════════════════════════════════════════════════ */}
      {page.timeline.length > 0 && (
        <section className="bg-muted/30 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <SectionHead
              label="Your Health Journey"
              title={`${page.timelineTitle.replace("(In Health & Savings)", "").trim()} (In Health & Savings)`}
            />

            {/* Desktop */}
            <div className="hidden md:grid md:grid-cols-4 gap-0">
              {page.timeline.map((item, i) => (
                <div key={item.id} className="relative flex flex-col">
                  {i < page.timeline.length - 1 && (
                    <div className="absolute left-[calc(50%+1.25rem)] right-0 top-[1.2rem] h-0.5 bg-border z-0" />
                  )}
                  <div className="relative z-10 mb-4 flex justify-center">
                    <div className={`grid h-9 w-9 place-items-center rounded-full ${WEEK_BG[i]} text-xs font-extrabold text-white shadow ring-4 ring-background`}>
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col rounded-2xl border border-border bg-card p-4 mx-2 shadow-sm">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-crimson">{item.weekLabel}</p>
                    <ul className="mb-3 space-y-1.5">
                      {item.healthBenefits.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-crimson" />
                          {h}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex flex-wrap gap-1.5">
                      {item.perks.map((p) => (
                        <span key={p} className="rounded-full border border-crimson/20 bg-crimson/10 px-2 py-0.5 text-[10px] font-semibold text-crimson">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile */}
            <div className="flex flex-col gap-3 md:hidden">
              {page.timeline.map((item, i) => (
                <div key={item.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${WEEK_BG[i]} text-xs font-extrabold text-white ring-4 ring-background`}>
                      {i + 1}
                    </div>
                    {i < page.timeline.length - 1 && <div className="mt-1 w-0.5 flex-1 bg-border" />}
                  </div>
                  <div className="flex-1 rounded-xl border border-border bg-card p-3 mb-2 shadow-sm">
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-crimson">{item.weekLabel}</p>
                    <ul className="mb-2 space-y-1">
                      {item.healthBenefits.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-crimson" />
                          {h}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-1">
                      {item.perks.map((p) => (
                        <span key={p} className="rounded-full border border-crimson/20 bg-crimson/10 px-2 py-0.5 text-[10px] font-semibold text-crimson">{p}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link to={page.heroCtaUrl}
                className="inline-flex items-center gap-2 rounded-lg bg-crimson px-7 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition-all hover:bg-rich-red">
                Start Now — Free Ribeye + 10% Off <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══ 3. BENEFITS ═══════════════════════════════════════════════════════ */}
      {page.benefits.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <SectionHead label="Why Choose MLS?" title={page.benefitsTitle} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {page.benefits.map(({ id, emoji, title, description, imageUrl }) => (
                <div key={id} className="flex flex-col items-center rounded-2xl border border-border bg-card pt-5 pb-6 text-center shadow-sm transition-shadow hover:shadow-md overflow-hidden">
                  {/* Smaller image — h-20 */}
                  {imageUrl ? (
                    <div className="flex h-20 w-full items-center justify-center px-6 mb-3">
                      <img src={imageUrl} alt={title} className="h-full w-auto max-w-full object-contain" />
                    </div>
                  ) : (
                    <span className="mb-3 text-4xl leading-none">{emoji}</span>
                  )}
                  <div className="px-4">
                    <h3 className="font-display text-sm font-bold leading-snug md:text-base">{title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground md:text-sm">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ 4. HOW IT WORKS ═══════════════════════════════════════════════════ */}
      {page.steps.length > 0 && (
        <section className="bg-muted/40 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <SectionHead label="Simple Setup" title={page.stepsTitle} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {page.steps.map(({ id, number, title, description, imageUrl }) => (
                <div key={id} className="flex flex-col items-center gap-3 text-center">
                  {/* Larger image — h-56 */}
                  {imageUrl && (
                    <div className="flex h-56 w-full items-end justify-center">
                      <img src={imageUrl} alt={title}
                        className="max-h-full w-auto max-w-[200px] object-contain drop-shadow-md" />
                    </div>
                  )}
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-crimson text-lg font-extrabold text-white shadow-md ring-4 ring-background">
                    {number}
                  </div>
                  <h3 className="font-display text-sm font-bold md:text-base">{title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground md:text-sm">{description}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to={page.heroCtaUrl}
                className="inline-flex items-center gap-2 rounded-lg bg-crimson px-7 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition-all hover:bg-rich-red">
                Get Started Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══ 5. REVIEWS SLIDER ════════════════════════════════════════════════ */}
      {page.reviews.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <SectionHead
              label="Real Customers"
              title={page.reviewsTitle}
              sub="What They're Talking About MLS"
            />
            <ReviewsSlider reviews={page.reviews} />
          </div>
        </section>
      )}

      {/* ══ 6. FAQs ══════════════════════════════════════════════════════════ */}
      {page.faqs.length > 0 && (
        <section className="bg-muted/30 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <SectionHead label="Got Questions?" title={page.faqTitle} />
            <div className="mx-auto max-w-2xl space-y-3">
              {page.faqs.map((item) => <FaqItem key={item.id} q={item.question} a={item.answer} />)}
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Need more detail?{" "}
              <Link to="/pages/subscription-policy" className="font-semibold text-crimson hover:underline">
                Read the full Subscription Policy →
              </Link>
            </p>
          </div>
        </section>
      )}

    </div>
  );
}

// ─── Reviews Slider ───────────────────────────────────────────────────────────

type Review = { id: string; name: string; title: string; body: string; rating: number };

function ReviewsSlider({ reviews }: { reviews: Review[] }) {
  const [current, setCurrent] = useState(0);
  const count = reviews.length;
  const prev = () => setCurrent((c) => (c - 1 + count) % count);
  const next = () => setCurrent((c) => (c + 1) % count);

  return (
    <div className="relative">
      {/* Slider track */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {reviews.map(({ id, name, title, body, rating }) => (
            <div key={id} className="w-full shrink-0 px-2 sm:px-4">
              <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="font-display text-base font-bold text-foreground md:text-lg">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">{body}</p>
                <p className="mt-4 text-xs font-semibold text-crimson">— {name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      {count > 1 && (
        <>
          <button type="button" onClick={prev} aria-label="Previous review"
            className="absolute -left-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full border border-border bg-background shadow-sm transition-all hover:border-crimson hover:text-crimson sm:-left-4">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={next} aria-label="Next review"
            className="absolute -right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full border border-border bg-background shadow-sm transition-all hover:border-crimson hover:text-crimson sm:-right-4">
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {reviews.map((_, i) => (
            <button key={i} type="button" onClick={() => setCurrent(i)} aria-label={`Review ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${i === current ? "h-2 w-6 bg-crimson" : "h-2 w-2 bg-border hover:bg-muted-foreground"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── FAQ accordion ────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="font-display text-sm font-semibold md:text-base">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: open ? "300px" : "0px" }}>
        <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{a}</p>
      </div>
    </div>
  );
}

import type { LoaderFunctionArgs, MetaFunction } from "@shopify/remix-oxygen";
import { useLoaderData } from "react-router";
import { useEffect, useRef, useState } from "react";

export const meta: MetaFunction = () => [
  { title: "Our Story — MLS UAE" },
  { name: "description", content: "45 years of butchery excellence. From Oman to the UAE." },
];

const PAGE_QUERY = `{
  page: metaobjects(type: "mls_our_story_page", first: 1) {
    nodes {
      fields {
        key
        value
        reference {
          ... on MediaImage {
            image { url altText width height }
          }
        }
        references(first: 20) {
          nodes {
            ... on Metaobject {
              id
              fields {
                key
                value
                reference {
                  ... on MediaImage {
                    image { url altText width height }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`;

function toEmbed(url: string): string {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&loop=1&playlist=${yt[1]}&controls=0&rel=0&playsinline=1`;
  return url;
}

export async function loader({ context }: LoaderFunctionArgs) {
  const data = await context.adminFetch(PAGE_QUERY);
  const node = data?.page?.nodes?.[0];
  const f = Object.fromEntries((node?.fields ?? []).map((x: any) => [x.key, x]));

  const slides = (f.slides?.references?.nodes ?? []).map((n: any) => {
    const sf = Object.fromEntries(n.fields.map((x: any) => [x.key, x]));
    return {
      id: n.id,
      desktop: sf.desktop_image?.reference?.image?.url ?? "",
      mobile:  sf.mobile_image?.reference?.image?.url  ?? "",
    };
  });

  const timelineItems = (f.timeline_items?.references?.nodes ?? []).map((n: any) => {
    const tf = Object.fromEntries(n.fields.map((x: any) => [x.key, x.value]));
    return { id: n.id, year: tf.year ?? "", label: tf.label ?? "", description: tf.description ?? "" };
  });

  return {
    heroImage:          f.hero_image?.reference?.image?.url         ?? "",
    quoteText:          f.quote_text?.value                         ?? "WE EXIST TO NOURISH PEOPLE WITH NATURE'S FINEST RED MEAT.",
    slides,
    storyHeading:       f.story_heading?.value                      ?? "Expanding from Oman to UAE:",
    storySubheading:    f.story_subheading?.value                   ?? "A Butchery Legacy",
    storyDescription:   f.story_description?.value                  ?? "",
    storyImage:         f.story_image?.reference?.image?.url        ?? "",
    timelineTitle:      f.timeline_title?.value                     ?? "Our Journey: A Family Legacy",
    timelineSubtitle:   f.timeline_subtitle?.value                  ?? "",
    timelineItems,
    missionHeading:     f.mission_heading?.value                    ?? "Our Mission:",
    missionSubheading:  f.mission_subheading?.value                 ?? "Quality and Tradition",
    missionDescription: f.mission_description?.value                ?? "",
    missionImage:       f.mission_image?.reference?.image?.url      ?? "",
    videoEmbed:         toEmbed(f.video_url?.value ?? "https://youtu.be/T1ExB8rQQZs"),
    videoText:          f.video_text?.value                         ?? "",
  };
}

export default function OurStoryPage() {
  const {
    heroImage, quoteText, slides,
    storyHeading, storySubheading, storyDescription, storyImage,
    timelineTitle, timelineSubtitle, timelineItems,
    missionHeading, missionSubheading, missionDescription, missionImage,
    videoEmbed, videoText,
  } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">

      {/* ── 1. Hero banner ── */}
      {heroImage && (
        <div className="w-full">
          <img src={heroImage} alt="MLS Stores" className="w-full block" style={{ maxHeight: 680, objectFit: "cover" }} />
        </div>
      )}

      {/* ── 2. Quote carousel (contained card, like theme) ── */}
      {slides.length > 0 && (
        <div className="bg-white px-4 sm:px-8 md:px-20 py-6 md:py-8">
          <QuoteCarousel slides={slides} quote={quoteText} />
        </div>
      )}

      {/* ── 3. Brand story ── */}
      <section style={{ background: "#282828" }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12 py-12 md:py-16">
            <div className="w-full md:w-1/2 shrink-0">
              {storyImage ? (
                <img src={storyImage} alt={storyHeading} className="w-full rounded-xl object-cover shadow-xl" style={{ maxHeight: 420 }} />
              ) : (
                <div className="w-full rounded-xl bg-white/5 flex items-center justify-center" style={{ height: 320 }}>
                  <span className="text-white/30 text-xs">Add Story Image in Shopify Admin</span>
                </div>
              )}
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-3">
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl md:text-4xl leading-tight">{storyHeading}</h2>
              <h3 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl leading-tight" style={{ color: "#f4a5a5" }}>{storySubheading}</h3>
              {storyDescription && (
                <p className="mt-2 text-sm leading-relaxed sm:text-base" style={{ color: "rgba(255,255,255,0.75)" }}>{storyDescription}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Timeline ── */}
      {timelineItems.length > 0 && (
        <section className="bg-white py-12 md:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-8">
            <div className="mb-10 text-center">
              <h2 className="font-display text-2xl font-bold text-black sm:text-3xl md:text-[38px]">{timelineTitle}</h2>
              {timelineSubtitle && (
                <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-500 sm:text-base leading-relaxed">{timelineSubtitle}</p>
              )}
            </div>
            {/* Desktop */}
            <div className="hidden sm:block relative mt-8">
              <div className="absolute top-3 left-0 right-0 h-0.5" style={{ background: "#403e3e" }} />
              <div className="grid" style={{ gridTemplateColumns: `repeat(${timelineItems.length}, 1fr)` }}>
                {timelineItems.map((item) => (
                  <div key={item.id} className="flex flex-col items-center text-center px-2">
                    <div className="relative z-10 mb-5">
                      <div className="h-6 w-6 rounded-full border-4 border-white shadow-md" style={{ background: "#a70a10" }} />
                    </div>
                    <p className="text-2xl font-extrabold text-black">{item.year}</p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-widest" style={{ color: "#a70a10" }}>{item.label}</p>
                    <p className="mt-1 text-xs text-gray-500 leading-snug">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* Mobile */}
            <div className="sm:hidden mt-8 space-y-0">
              {timelineItems.map((item, i) => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-5 w-5 rounded-full shrink-0 mt-0.5 border-4 border-white shadow" style={{ background: "#a70a10" }} />
                    {i < timelineItems.length - 1 && <div className="w-0.5 flex-1 mt-1" style={{ background: "#403e3e" }} />}
                  </div>
                  <div className="pb-8">
                    <p className="text-xl font-extrabold text-black">{item.year}</p>
                    <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#a70a10" }}>{item.label}</p>
                    <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Mission ── */}
      <section style={{ background: "#2b2b2b" }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12 py-12 md:py-16">
            <div className="w-full md:w-1/2 flex flex-col gap-3 order-2 md:order-1">
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl md:text-4xl leading-tight">{missionHeading}</h2>
              <h3 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl leading-tight" style={{ color: "#f4a5a5" }}>{missionSubheading}</h3>
              {missionDescription && (
                <p className="mt-2 text-sm leading-relaxed sm:text-base" style={{ color: "rgba(255,255,255,0.75)" }}>{missionDescription}</p>
              )}
            </div>
            <div className="w-full md:w-1/2 flex items-center justify-center order-1 md:order-2">
              {missionImage ? (
                <img src={missionImage} alt={missionSubheading} className="object-contain w-full" style={{ maxWidth: 340, maxHeight: 340 }} />
              ) : (
                <div className="w-64 h-64 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-white/30 text-xs text-center px-4">Add Mission Image in Shopify Admin</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Video with overlay text ── */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9", minHeight: 300 }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={videoEmbed}
          allow="autoplay; fullscreen; picture-in-picture"
          style={{ border: "none", pointerEvents: "none" }}
          title="MLS Story Video"
        />
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.2)" }}>
          {videoText && (
            <p className="font-display font-extrabold text-white text-center px-6 leading-tight"
               style={{ fontSize: "clamp(2rem, 7vw, 6rem)", textShadow: "0 4px 32px rgba(0,0,0,0.5)" }}>
              {videoText}
            </p>
          )}
        </div>
      </div>

    </div>
  );
}

// ── Quote Carousel ─────────────────────────────────────────────────────────────

type Slide = { id: string; desktop: string; mobile: string };

function QuoteCarousel({ slides, quote }: { slides: Slide[]; quote: string }) {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setActive((a) => (a + 1) % slides.length), 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [slides.length]);

  return (
    <div className="relative w-full overflow-hidden" style={{ borderRadius: 20, boxShadow: "0 2px 24px rgba(0,0,0,0.10)" }}>
      {/* Slide images */}
      <div className="relative" style={{ paddingTop: "clamp(180px, 24vw, 320px)" }}>
        {slides.map((slide, i) => (
          <picture key={slide.id}>
            {slide.mobile && <source media="(max-width: 639px)" srcSet={slide.mobile} />}
            <img
              src={slide.desktop || slide.mobile}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms]"
              style={{ opacity: i === active ? 1 : 0 }}
            />
          </picture>
        ))}
        {/* Dark overlay + quote */}
        <div className="absolute inset-0 flex items-center justify-center px-6 sm:px-12" style={{ background: "rgba(0,0,0,0.35)" }}>
          <p
            className="font-display font-bold text-white text-center uppercase leading-snug"
            style={{ fontSize: "clamp(1rem, 2.2vw, 1.75rem)", maxWidth: 560, textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}
          >
            {quote}
          </p>
        </div>
      </div>
    </div>
  );
}

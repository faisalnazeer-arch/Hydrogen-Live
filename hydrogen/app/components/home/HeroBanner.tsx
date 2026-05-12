import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import heroImg from "@/assets/hero-meat.jpg";

// ── Types ──────────────────────────────────────────────────────────────────

interface ShopifyImage {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

interface HeroSlide {
  id: string;
  desktopImage: ShopifyImage | null;
  mobileImage: ShopifyImage | null;
  content: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
}

interface RawMetaobjectNode {
  id: string;
  fields: Array<{
    key: string;
    value: string | null;
    type: string;
    reference?: { image?: ShopifyImage } | null;
  }>;
}

// ── Parser ─────────────────────────────────────────────────────────────────

function parseSlides(nodes: RawMetaobjectNode[]): HeroSlide[] {
  return nodes
    .map((node) => {
      const fieldMap = Object.fromEntries(node.fields.map((f) => [f.key, f]));

      const desktopImage =
        fieldMap["desktop_image"]?.reference?.image ??
        fieldMap["hero_image_1"]?.reference?.image ??
        null;

      const mobileImage =
        fieldMap["mobile_image"]?.reference?.image ??
        fieldMap["hero_image_2"]?.reference?.image ??
        null;

      if (!desktopImage && !mobileImage) return null;

      let buttonUrl: string | null = null;
      const rawUrl = fieldMap["button_url"]?.value ?? null;
      if (rawUrl) {
        try {
          const parsed = JSON.parse(rawUrl);
          buttonUrl = parsed.url ?? rawUrl;
        } catch {
          buttonUrl = rawUrl;
        }
      }

      return {
        id: node.id,
        desktopImage,
        mobileImage,
        content: fieldMap["content"]?.value ?? null,
        buttonText: fieldMap["button_text"]?.value ?? null,
        buttonUrl,
      } satisfies HeroSlide;
    })
    .filter((s): s is HeroSlide => s !== null);
}

// ── Fallback ───────────────────────────────────────────────────────────────

const STATIC_SLIDE: HeroSlide = {
  id: "static",
  desktopImage: null,
  mobileImage: null,
  content: null,
  buttonText: null,
  buttonUrl: null,
};

// ── Main component ─────────────────────────────────────────────────────────

interface HeroBannerProps {
  slides?: RawMetaobjectNode[];
}

const AUTOPLAY_MS = 5000;

export function HeroBanner({ slides: rawSlides = [] }: HeroBannerProps) {
  const parsed = parseSlides(rawSlides);
  const slides = parsed.length > 0 ? parsed : [STATIC_SLIDE];
  const count = slides.length;
  const isSingle = count === 1;

  const [current, setCurrent] = useState(0);

  const goPrev = () => setCurrent((c) => (c - 1 + count) % count);
  const goNext = () => setCurrent((c) => (c + 1) % count);
  const goTo = (i: number) => setCurrent(i);

  // Stable ref so interval never re-creates
  const goNextRef = useRef(goNext);
  goNextRef.current = goNext;

  useEffect(() => {
    if (isSingle) return;
    const id = setInterval(() => goNextRef.current(), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [isSingle]);

  return (
    // overflow-hidden clips the slides; position:relative anchors the buttons/dots
    <section className="relative bg-charcoal overflow-hidden">
      {/* ── Slide track — CSS transform scroll ── */}
      <div
        className="flex transition-transform duration-500 ease-in-out will-change-transform"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <SlideItem key={slide.id} slide={slide} active={i === current} />
        ))}
      </div>

      {/* ── Arrows ── */}
      {!isSingle && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-40 -translate-y-1/2 cursor-pointer grid h-12 w-12 place-items-center rounded-full bg-black/60 text-white shadow-lg transition-all hover:bg-black/80 hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-40 -translate-y-1/2 cursor-pointer grid h-12 w-12 place-items-center rounded-full bg-black/60 text-white shadow-lg transition-all hover:bg-black/80 hover:scale-110 active:scale-95"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* ── Dot indicators ── */}
      {!isSingle && (
        <div className="absolute bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "cursor-pointer rounded-full transition-all duration-300 ease-out",
                i === current
                  ? "h-2.5 w-7 bg-white shadow-md"
                  : "h-2 w-2 bg-white/50 hover:bg-white/80",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Slide ──────────────────────────────────────────────────────────────────

function SlideItem({ slide, active }: { slide: HeroSlide; active: boolean }) {
  const isStatic = slide.id === "static";
  const hasContent = !isStatic && (slide.content || slide.buttonText);

  return (
    // shrink-0 + explicit width keeps each slide at exactly 100vw inside the flex track
    <div
      className="relative h-[420px] sm:h-[500px] md:h-[550px]"
      style={{ flexShrink: 0, width: "100%" }}
    >
      {/* Desktop image */}
      {slide.desktopImage ? (
        <img
          src={slide.desktopImage.url}
          alt={slide.desktopImage.altText ?? ""}
          draggable={false}
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full select-none object-cover transition-transform duration-[1200ms] ease-out",
            slide.mobileImage ? "hidden md:block" : "block",
            active ? "scale-[1.03]" : "scale-100",
          )}
        />
      ) : isStatic ? (
        <img
          src={heroImg}
          alt="Premium fresh cuts"
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover opacity-50"
        />
      ) : null}

      {/* Mobile image */}
      {slide.mobileImage && (
        <img
          src={slide.mobileImage.url}
          alt={slide.mobileImage.altText ?? ""}
          draggable={false}
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full select-none object-cover transition-transform duration-[1200ms] ease-out",
            slide.desktopImage ? "block md:hidden" : "block",
            active ? "scale-[1.03]" : "scale-100",
          )}
        />
      )}

      {/* Gradient overlay — pointer-events-none so arrows/dots stay clickable */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-500",
          isStatic || hasContent
            ? "bg-gradient-to-r from-charcoal/80 via-charcoal/40 to-transparent"
            : "bg-black/10",
        )}
      />

      {/* Content — outer wrapper is pointer-events-none; re-enable only on CTAs */}
      <div className="pointer-events-none absolute inset-0">
        {isStatic ? (
          <StaticContent />
        ) : hasContent ? (
          <DynamicContent slide={slide} active={active} />
        ) : null}
      </div>
    </div>
  );
}

// ── Static fallback content ────────────────────────────────────────────────

function StaticContent() {
  return (
    <div className="flex h-full items-center">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-xl"
        >
          <span className="mb-4 inline-flex items-center rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            ★ Premium Butcher · Est. Muscat
          </span>
          <h1 className="font-display text-4xl font-extrabold leading-[1.05] text-off-white sm:text-5xl md:text-6xl">
            Cuts worthy of a{" "}
            <span className="italic text-gold">centerpiece</span>.
          </h1>
          <p className="mt-5 max-w-md text-base text-off-white/80 md:text-lg">
            Hand-selected beef, lamb & specialty meats from the world's finest
            farms — delivered fresh to your door across the UAE & Oman.
          </p>
          {/* pointer-events-auto restores clicks on these buttons */}
          <div className="pointer-events-auto mt-8 flex flex-wrap gap-3">
            <Link to="/collections/all-beef">
              <Button size="lg" className="bg-crimson text-crimson-foreground hover:bg-rich-red">
                Shop Beef
              </Button>
            </Link>
            <Link to="/collections/australian-wagyu-beef-mb-4-5">
              <Button
                size="lg"
                variant="outline"
                className="border-gold bg-transparent text-gold hover:bg-gold hover:text-gold-foreground"
              >
                Discover Wagyu
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Dynamic metaobject content ─────────────────────────────────────────────

function DynamicContent({ slide, active }: { slide: HeroSlide; active: boolean }) {
  return (
    <div className="flex h-full items-center">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="max-w-xl"
        >
          {slide.content && (
            <p className="text-base font-medium leading-relaxed text-off-white drop-shadow md:text-lg">
              {slide.content}
            </p>
          )}
          {slide.buttonText && slide.buttonUrl && (
            <div className="pointer-events-auto mt-6">
              <Link to={slide.buttonUrl}>
                <Button size="lg" className="bg-crimson text-crimson-foreground hover:bg-rich-red">
                  {slide.buttonText}
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

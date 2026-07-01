import { useState, useRef, useEffect } from "react";
import { Play, X, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HScroller } from "~/components/home/HScroller";

function extractYoutubeId(url: string): string | null {
  const shorts = url.match(/youtube\.com\/shorts\/([^?&#/]+)/);
  if (shorts) return shorts[1];
  const watch = url.match(/[?&]v=([^&#]+)/);
  if (watch) return watch[1];
  const youtu = url.match(/youtu\.be\/([^?&#/]+)/);
  if (youtu) return youtu[1];
  return null;
}

interface YtReel {
  name: string;
  videoId: string;
  embedUrl: string;
  poster: string;
}

export function YoutubeReelsSection({ nodes }: { nodes: any[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!nodes?.length) return null;

  const reels: YtReel[] = nodes
    .map((node: any) => {
      const f: any[] = node.fields ?? [];
      const ytMetaRef = f.find((x: any) => x.key === "yt_url")?.reference;
      const ytUrl = ytMetaRef?.fields?.find((x: any) => x.key === "youtube_url")?.value ?? null;
      const name = f.find((x: any) => x.key === "name")?.value ?? "";
      if (!ytUrl) return null;
      const videoId = extractYoutubeId(ytUrl);
      if (!videoId) return null;
      return {
        name,
        videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        poster: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      };
    })
    .filter(Boolean) as YtReel[];

  if (reels.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-3 md:py-6">
      <div className="mb-3 text-center md:mb-4">
        <div className="mb-1.5 flex items-center justify-center gap-3">
          <span className="h-px w-6 rounded-full bg-crimson" />
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-crimson">Watch & Shop</p>
          <span className="h-px w-6 rounded-full bg-crimson" />
        </div>
        <h2 className="font-display text-2xl font-bold leading-snug tracking-tight md:text-3xl">See It In Action</h2>
      </div>

      <HScroller>
        {reels.map((r, i) => (
          <YtReelCard key={r.videoId} reel={r} onOpen={() => setActiveIndex(i)} />
        ))}
      </HScroller>

      <AnimatePresence>
        {activeIndex !== null && (
          <YtReelsPlayer
            reels={reels}
            startIndex={activeIndex}
            onClose={() => setActiveIndex(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

// ── Card — hover loads YouTube iframe, click opens full-screen player ─────────
function YtReelCard({ reel, onOpen }: { reel: YtReel; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative aspect-[3/4] w-[76vw] flex-shrink-0 snap-start overflow-hidden rounded-xl bg-muted transition-transform hover:-translate-y-1 md:aspect-[9/16] md:w-[260px]"
    >
      {/* Poster */}
      <img
        src={reel.poster}
        alt={reel.name}
        loading="lazy"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${hovered ? "opacity-0" : "opacity-100"}`}
      />

      {/* Hover iframe — muted autoplay preview */}
      {hovered && (
        <iframe
          src={`${reel.embedUrl}?autoplay=1&mute=1&controls=0&rel=0&loop=1&playlist=${reel.videoId}&playsinline=1`}
          allow="autoplay; encrypted-media"
          className="absolute inset-0 h-full w-full scale-[1.05] border-none"
          title={reel.name}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/10 to-transparent pointer-events-none" />

      {/* Title */}
      {reel.name && (
        <div className="absolute inset-x-2 top-2 text-left pointer-events-none">
          <div className="line-clamp-2 text-[11px] font-semibold leading-tight text-off-white">{reel.name}</div>
        </div>
      )}

      {/* Play button */}
      <div className={`absolute inset-0 grid place-items-center pointer-events-none transition-opacity duration-300 ${hovered ? "opacity-0" : "opacity-100"}`}>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-off-white/90 text-charcoal shadow-md transition-all duration-300 group-hover:scale-110">
          <Play className="ml-0.5 h-5 w-5 fill-current" />
        </span>
      </div>
    </button>
  );
}

// ── Full-screen TikTok-style player ──────────────────────────────────────────
function YtReelsPlayer({
  reels,
  startIndex,
  onClose,
}: {
  reels: YtReel[];
  startIndex: number;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const el = containerRef.current?.children[startIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "auto" });
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-off-white/15 text-off-white backdrop-blur transition-colors hover:bg-off-white/25"
      >
        <X className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label={muted ? "Unmute" : "Mute"}
        onClick={(e) => { e.stopPropagation(); setMuted((m) => !m); }}
        className="absolute right-4 top-16 z-20 grid h-10 w-10 place-items-center rounded-full bg-off-white/15 text-off-white backdrop-blur transition-colors hover:bg-off-white/25"
      >
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </button>

      <div
        ref={containerRef}
        className="h-full w-full snap-y snap-mandatory overflow-y-scroll overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {reels.map((reel, i) => (
          <YtReelSlide
            key={reel.videoId}
            reel={reel}
            active={activeIndex === i}
            muted={muted}
            onActive={() => setActiveIndex(i)}
            onClose={onClose}
          />
        ))}
      </div>
    </motion.div>
  );
}

function YtReelSlide({
  reel,
  active,
  muted,
  onActive,
  onClose,
}: {
  reel: YtReel;
  active: boolean;
  muted: boolean;
  onActive: () => void;
  onClose: () => void;
}) {
  const slideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = slideRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && e.intersectionRatio >= 0.6) onActive(); },
      { threshold: [0.6] }
    );
    io.observe(el);
    return () => io.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={slideRef} className="relative flex h-full w-full snap-start snap-always items-center justify-center">
      <div
        className="relative h-full w-full overflow-hidden bg-black md:aspect-[9/16] md:w-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {active ? (
          <iframe
            src={`${reel.embedUrl}?autoplay=1&mute=${muted ? 1 : 0}&controls=1&rel=0&loop=1&playlist=${reel.videoId}&playsinline=1`}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            className="h-full w-full border-none"
            title={reel.name}
          />
        ) : (
          <img src={reel.poster} alt={reel.name} className="h-full w-full object-cover" />
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent" />

        {reel.name && (
          <div className="absolute inset-x-3 bottom-4 rounded-2xl bg-white/95 p-3 shadow-xl backdrop-blur">
            <p className="text-[13px] font-semibold leading-tight text-charcoal">{reel.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}

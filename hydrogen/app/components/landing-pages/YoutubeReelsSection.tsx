import { useState, useCallback, useRef, useEffect } from "react";
import { Volume2, VolumeX, X } from "lucide-react";
import { HScroller } from "~/components/home/HScroller";

interface YoutubeReel {
  id: string;
  title: string;
  youtubeUrl: string;
  thumbnailUrl: string | null;
  sortOrder: number;
}

function extractVideoId(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    return u.searchParams.get("v") ?? u.pathname.split("/").pop() ?? "";
  } catch { return ""; }
}

function getEmbedUrl(url: string, muted: boolean): string {
  const id = extractVideoId(url);
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${id}&controls=0&rel=0&enablejsapi=1`;
}

function getAutoThumbnail(url: string): string {
  const id = extractVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
}

// ── Fullscreen modal ──────────────────────────────────────────────────────────

function ReelModal({ reel, onClose }: { reel: YoutubeReel; onClose: () => void }) {
  const id = extractVideoId(reel.youtubeUrl);
  // mute=1 required for autoplay on mobile; controls=1 gives native YT volume slider
  const src = `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=1&rel=0&enablejsapi=1`;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Portrait iframe — native YT controls handle volume on all devices */}
      <div
        className="relative w-full max-w-sm"
        style={{ aspectRatio: "9/16", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          ref={iframeRef}
          className="absolute inset-0 h-full w-full rounded-xl"
          src={src}
          title={reel.title}
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
        />
      </div>
    </div>
  );
}

// ── Reel card ─────────────────────────────────────────────────────────────────

function ReelCard({ reel, onOpen }: { reel: YoutubeReel; onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  const [muted, setMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    setMuted(true);
  }, []);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !muted;
    setMuted(next);
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func: next ? "mute" : "unMute" }),
      "*"
    );
  }, [muted]);

  return (
    <div
      className="relative aspect-[9/16] w-[76vw] flex-shrink-0 snap-start overflow-hidden rounded-xl bg-black cursor-pointer md:w-[220px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onOpen}
    >
      {/* Thumbnail */}
      <img
        src={reel.thumbnailUrl || getAutoThumbnail(reel.youtubeUrl)}
        alt={reel.title}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
          hovered ? "opacity-0 md:opacity-0" : "opacity-100"
        }`}
      />

      {/* Desktop hover — autoplay muted iframe */}
      {hovered && (
        <iframe
          ref={iframeRef}
          className="absolute inset-0 hidden h-full w-full md:block pointer-events-none"
          src={getEmbedUrl(reel.youtubeUrl, true)}
          title={reel.title}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      )}

      {/* Mute/unmute button — desktop hover only */}
      {hovered && (
        <button
          onClick={toggleMute}
          className="absolute bottom-10 right-2 z-10 hidden md:flex items-center justify-center h-7 w-7 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted
            ? <VolumeX className="h-3.5 w-3.5" />
            : <Volume2 className="h-3.5 w-3.5" />
          }
        </button>
      )}

      {/* Title overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 pointer-events-none">
        <p className="text-xs font-semibold text-white line-clamp-2">{reel.title}</p>
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export function YoutubeReelsSection({
  reels,
  heading,
}: {
  reels: YoutubeReel[];
  heading?: string;
}) {
  const [activeReel, setActiveReel] = useState<YoutubeReel | null>(null);

  if (reels.length === 0) return null;

  return (
    <section className="py-10 md:py-14">
      {heading && (
        <div className="container mx-auto px-4 mb-6">
          <h2 className="text-center font-display text-2xl font-extrabold md:text-3xl">{heading}</h2>
        </div>
      )}
      <HScroller innerClassName="md:justify-center px-4 md:px-8">
        {reels.map((reel) => (
          <ReelCard key={reel.id} reel={reel} onOpen={() => setActiveReel(reel)} />
        ))}
      </HScroller>

      {activeReel && (
        <ReelModal reel={activeReel} onClose={() => setActiveReel(null)} />
      )}
    </section>
  );
}

// ── Data helpers ──────────────────────────────────────────────────────────────

export function parseYoutubeReels(
  nodes: any[],
  pageHandle: string,
): YoutubeReel[] {
  return nodes
    .map((node: any) => {
      const f = Object.fromEntries((node.fields ?? []).map((x: any) => [x.key, x]));
      const isActive = f.is_active?.value === "true";
      const matchesHandle = (f.landing_page_handle?.value ?? "") === pageHandle;
      if (!isActive || !matchesHandle) return null;
      return {
        id: node.id,
        title: f.title?.value ?? "",
        youtubeUrl: f.youtube_url?.value ?? "",
        thumbnailUrl: f.thumbnail?.reference?.image?.url ?? null,
        sortOrder: parseInt(f.sort_order?.value ?? "0", 10),
      };
    })
    .filter((r): r is YoutubeReel => r !== null && r.youtubeUrl !== "")
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

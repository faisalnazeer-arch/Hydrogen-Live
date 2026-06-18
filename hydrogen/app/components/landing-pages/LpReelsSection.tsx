import { ReelsCarousel } from "~/components/home/ReelsCarousel";
import type { ReelProduct } from "@/lib/shopify";

function parseReelItems(nodes: any[]): ReelProduct[] {
  const reels: ReelProduct[] = [];
  for (const node of nodes) {
    const f = Object.fromEntries((node.fields ?? []).map((x: any) => [x.key, x]));
    const product = f["product"]?.reference;
    const video = f["video"]?.reference;
    if (!product) continue;


    let videoUrl: string | null = null;
    let poster: string | null = product.featuredImage?.url || null;

    if (video?.sources) {
      const mp4s = video.sources.filter((s: any) => s.mimeType === "video/mp4");
      // Prefer 720p for quality/size balance; fall back to first mp4 then first source
      const best = mp4s.find((s: any) => s.url.includes("720p"))
        ?? mp4s.find((s: any) => s.url.includes("480p"))
        ?? mp4s[0]
        ?? video.sources[0];
      videoUrl = best?.url ?? null;
      poster = video.preview?.image?.url || video.previewImage?.url || poster;
    }

    reels.push({
      id: node.id,
      title: product.title,
      handle: product.handle,
      price: product.priceRange.minVariantPrice,
      poster,
      videoUrl,
      embedUrl: null,
    });
  }
  return reels;
}

export function LpReelsSection({ reelItems, heading, label, sectionId }: { reelItems: any[]; heading?: string; label?: string; sectionId?: string }) {
  const reels = parseReelItems(reelItems);
  return (
    <div id={sectionId}>
      <ReelsCarousel reels={reels} label={label ?? "Watch & Shop"} heading={heading ?? "MLS Reels"} />
    </div>
  );
}
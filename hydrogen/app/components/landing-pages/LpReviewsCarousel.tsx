import { useRef } from "react";
import { Star, User } from "lucide-react";

interface LpReview {
  id: string;
  author: string;
  rating: number;
  body: string;
  product: string;
  date: string;
}

function parseReviewsHtml(html: string): LpReview[] {
  const reviews: LpReview[] = [];
  const parts = html.split(/(?=<div class='jdgm-rev jdgm-divider)/);
  for (const part of parts) {
    if (!part.includes("data-review-id")) continue;
    const id     = part.match(/data-review-id='([^']+)'/)?.[1] ?? "";
    const rating = parseInt(part.match(/data-score='(\d+)'/)?.[1] ?? "5");
    const author = part.match(/class='jdgm-rev__author'[^>]*>([^<]+)/)?.[1]?.trim() ?? "";
    const date   = part.match(/data-created-at='([^']+)'/)?.[1] ?? "";
    const body   = part.match(/class='jdgm-rev__content'[^>]*>([\s\S]*?)<\/p>/)?.[1]
      ?.replace(/<[^>]+>/g, "").trim() ?? "";
    const product = part.match(/class='jdgm-rev__product-title'[^>]*>([^<]+)/)?.[1]
      ?.replace(/^about\s+/i, "").trim() ?? "";
    if (!id || !body) continue;
    reviews.push({ id, author, rating, body, product, date });
  }
  return reviews;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3.5 w-3.5 ${s <= rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"}`} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: LpReview }) {
  return (
    <div className="flex w-[300px] shrink-0 flex-col gap-3 rounded-xl border border-border p-5 shadow-sm md:w-[340px]" style={{ backgroundColor: "#F7ECEA" }}>
      <div className="flex items-center gap-2.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
          <User className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">{review.author}</p>
          {review.product && <p className="text-[11px] text-muted-foreground">{review.product}</p>}
        </div>
      </div>
      <StarRow rating={review.rating} />
      <p className="line-clamp-4 flex-1 text-sm text-muted-foreground leading-relaxed">{review.body}</p>
    </div>
  );
}

function ReviewsMarquee({ reviews, heading }: { reviews: LpReview[]; heading: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  // Duplicate cards so the loop is seamless
  const doubled = [...reviews, ...reviews];

  return (
    <section className="py-10 md:py-14 overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <h2 className="text-center font-display text-2xl font-extrabold md:text-3xl">{heading}</h2>
      </div>

      {/* Marquee track */}
      <div
        ref={trackRef}
        className="group flex gap-4"
        style={{ animation: "lp-marquee 35s linear infinite" }}
        onMouseEnter={() => { if (trackRef.current) trackRef.current.style.animationPlayState = "paused"; }}
        onMouseLeave={() => { if (trackRef.current) trackRef.current.style.animationPlayState = "running"; }}
      >
        {doubled.map((r, i) => (
          <ReviewCard key={`${r.id}-${i}`} review={r} />
        ))}
      </div>

      <style>{`
        @keyframes lp-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

export function LpReviewsCarousel({
  reviewsHtml,
  reviewNodes,
  heading = "What Our Customers Say",
}: {
  reviewsHtml?: string;
  reviewNodes?: LpReview[];
  heading?: string;
}) {
  const reviews = reviewNodes?.length
    ? reviewNodes.slice(0, 12)
    : parseReviewsHtml(reviewsHtml ?? "").slice(0, 12);

  if (reviews.length === 0) return null;
  return <ReviewsMarquee reviews={reviews} heading={heading} />;
}

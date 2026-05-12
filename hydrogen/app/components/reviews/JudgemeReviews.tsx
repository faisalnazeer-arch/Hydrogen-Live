import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { ShieldCheck, User } from "lucide-react";
import type { JudgemeReview, JudgemeRatingSummary } from "~/lib/judgeme";
import { StarRating } from "./StarRating";
import { cn } from "~/lib/utils";

interface JudgemeReviewsProps {
  reviews: JudgemeReview[];
  rating: JudgemeRatingSummary;
  totalCount: number;
  handle: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-10 shrink-0 text-right text-muted-foreground">{label}</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-7 shrink-0 tabular-nums text-muted-foreground">{count}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: JudgemeReview }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">{review.reviewer.name}</p>
            <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <StarRating rating={review.rating} size="sm" />
          {review.verified === "verified_buyer" && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
              <ShieldCheck className="h-3 w-3" />
              Verified
            </span>
          )}
        </div>
      </div>

      {review.title && (
        <p className="text-sm font-semibold">{review.title}</p>
      )}
      {review.body && (
        <p className="text-sm leading-relaxed text-muted-foreground">{review.body}</p>
      )}

      {review.pictures?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {review.pictures.map((pic, i) => (
            <a key={i} href={pic.urls.original} target="_blank" rel="noopener noreferrer">
              <img
                src={pic.urls.small}
                alt={`Review photo ${i + 1}`}
                className="h-16 w-16 rounded-lg object-cover ring-1 ring-border hover:ring-crimson transition-all"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function JudgemeReviews({ reviews: initialReviews, rating, totalCount, handle }: JudgemeReviewsProps) {
  const [allReviews, setAllReviews] = useState<JudgemeReview[]>(initialReviews);
  const [page, setPage] = useState(1);
  const fetcher = useFetcher<{ reviews: JudgemeReview[]; totalCount: number }>();
  const hasMore = allReviews.length < totalCount;

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.reviews?.length) {
      setAllReviews((prev) => {
        const existing = new Set(prev.map((r) => r.id));
        const fresh = fetcher.data!.reviews.filter((r) => !existing.has(r.id));
        return [...prev, ...fresh];
      });
    }
  }, [fetcher.state, fetcher.data]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetcher.load(`/api/reviews/${handle}?page=${nextPage}`);
  };

  if (totalCount === 0) {
    return (
      <section className="border-t border-border pt-8">
        <h2 className="mb-4 text-lg font-bold">Customer Reviews</h2>
        <p className="text-sm text-muted-foreground">
          No reviews yet. Be the first to review this product!
        </p>
      </section>
    );
  }

  const starLabels = ["5 stars", "4 stars", "3 stars", "2 stars", "1 star"];

  return (
    <section className="border-t border-border pt-8">
      <h2 className="mb-6 text-lg font-bold">Customer Reviews</h2>

      {/* Summary */}
      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start">
        {/* Average score */}
        <div className="flex shrink-0 flex-col items-center gap-1 rounded-xl border border-border bg-muted/40 px-8 py-5">
          <span className="font-display text-5xl font-extrabold tabular-nums">
            {rating.average > 0 ? rating.average.toFixed(1) : "—"}
          </span>
          <StarRating rating={rating.average} size="lg" />
          <span className="text-xs text-muted-foreground">
            {totalCount} {totalCount === 1 ? "review" : "reviews"}
          </span>
        </div>

        {/* Star histogram */}
        {rating.histogram.some((n) => n > 0) && (
          <div className="flex flex-1 flex-col justify-center gap-2">
            {[4, 3, 2, 1, 0].map((idx) => (
              <RatingBar
                key={idx}
                label={starLabels[4 - idx]}
                count={rating.histogram[idx]}
                total={totalCount}
              />
            ))}
          </div>
        )}
      </div>

      {/* Review list */}
      <div className="flex flex-col gap-4">
        {allReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={fetcher.state === "loading"}
            className={cn(
              "rounded-lg border border-border px-6 py-2.5 text-sm font-medium transition-colors",
              "hover:border-crimson hover:text-crimson disabled:opacity-50",
            )}
          >
            {fetcher.state === "loading" ? "Loading…" : `Load more (${totalCount - allReviews.length} remaining)`}
          </button>
        </div>
      )}
    </section>
  );
}

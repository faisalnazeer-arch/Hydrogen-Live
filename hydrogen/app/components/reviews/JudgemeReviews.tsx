import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { ShieldCheck, User, Star, X, Loader2 } from "lucide-react";
import type { JudgemeReview, JudgemeRatingSummary } from "~/lib/judgeme";
import { StarRating } from "./StarRating";
import { cn } from "~/lib/utils";

interface JudgemeReviewsProps {
  reviews: JudgemeReview[];
  rating: JudgemeRatingSummary;
  totalCount: number;
  handle: string;
  externalId?: string;
  metaAverage?: number;
  metaCount?: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AE", { year: "numeric", month: "short", day: "numeric" });
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-10 shrink-0 text-right text-muted-foreground">{label}</span>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="absolute inset-y-0 left-0 rounded-full bg-amber-400 transition-all duration-500" style={{ width: `${pct}%` }} />
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
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
          )}
        </div>
      </div>
      {review.title && <p className="text-sm font-semibold">{review.title}</p>}
      {review.body && <p className="text-sm leading-relaxed text-muted-foreground">{review.body}</p>}
      {review.pictures?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {review.pictures.map((pic, i) => (
            <a key={i} href={pic.urls.original} target="_blank" rel="noopener noreferrer">
              <img src={pic.urls.small} alt={`Review photo ${i + 1}`}
                className="h-16 w-16 rounded-lg object-cover ring-1 ring-border transition-all hover:ring-crimson" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Star picker ──────────────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button"
          onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)} onClick={() => onChange(n)}
          className="transition-transform hover:scale-110" aria-label={`${n} stars`}>
          <Star className={cn("h-7 w-7", n <= (hovered || value) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground")} />
        </button>
      ))}
    </div>
  );
}

// ── Write review modal ───────────────────────────────────────────────────
function WriteReviewModal({ handle, externalId, onClose }: { handle: string; externalId?: string; onClose: () => void }) {
  const fetcher = useFetcher<{ success?: boolean; error?: string }>();
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const isSubmitting = fetcher.state !== "idle";
  const submitted = fetcher.data?.success === true;
  const serverError = fetcher.data?.error;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetcher.submit(
      JSON.stringify({ productExternalId: externalId, name, email, rating, title, reviewBody: body }),
      { method: "POST", action: "/api/reviews/write", encType: "application/json" },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="font-display text-lg font-bold">Write a Review</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto px-5 py-5">
          {submitted ? (
            <div className="py-8 text-center">
              <div className="mb-3 text-4xl">🎉</div>
              <p className="text-lg font-bold">Thank you for your review!</p>
              <p className="mt-1 text-sm text-muted-foreground">Your review has been submitted and is pending approval.</p>
              <button type="button" onClick={onClose} className="mt-4 rounded-lg bg-crimson px-6 py-2 text-sm font-bold text-crimson-foreground hover:bg-rich-red">Close</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Rating <span className="text-crimson">*</span></label>
                <StarPicker value={rating} onChange={setRating} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Name <span className="text-crimson">*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your full name"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-crimson" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Email <span className="text-crimson">*</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-crimson" />
                <p className="mt-1 text-[10px] text-muted-foreground">Not displayed publicly.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Review Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summarise your experience"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-crimson" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold">Review <span className="text-crimson">*</span></label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={4}
                  placeholder="Tell others about your experience…"
                  className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-crimson" />
              </div>
              {serverError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{serverError}</p>}
              <button type="submit" disabled={isSubmitting || !rating || !name || !email || !body}
                className="flex items-center justify-center gap-2 rounded-lg bg-crimson py-3 text-sm font-bold text-crimson-foreground transition-colors hover:bg-rich-red disabled:opacity-50">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Submitting…" : "Submit Review"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export function JudgemeReviews({ reviews: initialReviews, rating, totalCount, handle, externalId, metaAverage, metaCount }: JudgemeReviewsProps) {
  const [allReviews, setAllReviews] = useState<JudgemeReview[]>(initialReviews);
  const [clientTotal, setClientTotal] = useState<number | null>(null);
  const [loadingFallback, setLoadingFallback] = useState(false);
  const [page, setPage] = useState(1);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const fetcher = useFetcher<{ reviews: JudgemeReview[]; totalCount: number }>();

  useEffect(() => { setAllReviews(initialReviews); setPage(1); setClientTotal(null); }, [handle]); // eslint-disable-line

  // Client-side fallback: server may return 0 reviews when Judge.me cold-start
  // exceeds the 2.5s critical-path timeout. Fetch after hydration instead.
  useEffect(() => {
    if (initialReviews.length > 0) return;
    setLoadingFallback(true);
    const eid = externalId ? `&eid=${encodeURIComponent(externalId)}` : "";
    fetch(`/api/reviews/${handle}?page=1${eid}`)
      .then((r) => r.json())
      .then((data: any) => {
        if (data?.reviews?.length > 0) {
          setAllReviews(data.reviews);
          setClientTotal(data.totalCount ?? data.reviews.length);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingFallback(false));
  }, [handle, externalId]); // eslint-disable-line

  const effectiveTotal = clientTotal ?? (totalCount > 0 ? totalCount : (metaCount ?? 0));
  const effectiveAvg = rating.average > 0 ? rating.average : (metaAverage ?? 0);
  const effectiveRating: JudgemeRatingSummary = rating.average > 0
    ? rating
    : { average: effectiveAvg, count: effectiveTotal, histogram: [0, 0, 0, 0, 0] };

  const hasMore = allReviews.length < effectiveTotal;

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.reviews?.length) {
      setAllReviews((prev) => {
        const existing = new Set(prev.map((r) => r.id));
        return [...prev, ...fetcher.data!.reviews.filter((r) => !existing.has(r.id))];
      });
    }
  }, [fetcher.state, fetcher.data]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    const eid = externalId ? `&eid=${encodeURIComponent(externalId)}` : "";
    fetcher.load(`/api/reviews/${handle}?page=${nextPage}${eid}`);
  };

  const starLabels = ["5 stars", "4 stars", "3 stars", "2 stars", "1 star"];

  return (
    <>
      {showWriteReview && <WriteReviewModal handle={handle} externalId={externalId} onClose={() => setShowWriteReview(false)} />}

      <section className="border-t border-border pt-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Customer Reviews</h2>
          <button type="button" onClick={() => setShowWriteReview(true)}
            className="rounded-lg border border-crimson px-4 py-2 text-sm font-semibold text-crimson transition-colors hover:bg-crimson hover:text-crimson-foreground">
            ✍ Write a Review
          </button>
        </div>

        {effectiveTotal === 0 ? (
          loadingFallback ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading reviews…
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No reviews yet — be the first to review this product!</p>
          )
        ) : (
          <>
            {/* Summary */}
            <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
              <div className="flex shrink-0 flex-col items-center gap-1 rounded-xl border border-border bg-muted/40 px-8 py-5">
                <span className="font-display text-5xl font-extrabold tabular-nums">{effectiveAvg > 0 ? effectiveAvg.toFixed(1) : "—"}</span>
                <StarRating rating={effectiveAvg} size="lg" />
                <span className="text-xs text-muted-foreground">{effectiveTotal} {effectiveTotal === 1 ? "review" : "reviews"}</span>
              </div>
              {effectiveRating.histogram.some((n) => n > 0) && (
                <div className="flex flex-1 flex-col justify-center gap-2">
                  {(() => {
                    const histTotal = effectiveRating.histogram.reduce((s, n) => s + n, 0);
                    return [4, 3, 2, 1, 0].map((idx) => (
                      <RatingBar key={idx} label={starLabels[4 - idx]} count={effectiveRating.histogram[idx]} total={histTotal} />
                    ));
                  })()}
                </div>
              )}
            </div>

            {/* Reviews list */}
            <div className="flex flex-col gap-4">
              {allReviews.map((review) => <ReviewCard key={review.id} review={review} />)}
            </div>

            {/* Load more */}
            {hasMore && allReviews.length > 0 && (
              <div className="mt-6 flex justify-center">
                <button type="button" onClick={loadMore} disabled={fetcher.state === "loading"}
                  className={cn("rounded-lg border border-border px-6 py-2.5 text-sm font-medium transition-colors hover:border-crimson hover:text-crimson disabled:opacity-50")}>
                  {fetcher.state === "loading" ? "Loading…" : `Load more (${effectiveTotal - allReviews.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

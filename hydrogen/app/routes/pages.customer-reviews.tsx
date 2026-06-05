import type { LoaderFunctionArgs, MetaFunction } from "@shopify/remix-oxygen";
import { useLoaderData, useFetcher } from "react-router";
import { useState, useEffect } from "react";
import { ShieldCheck, User, Star, PenLine } from "lucide-react";
import { fetchJudgemeStoreReviews, buildRatingSummary } from "~/lib/judgeme";
import type { JudgemeReview } from "~/lib/judgeme";
import { StarRating } from "~/components/reviews/StarRating";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => [
  { title: "Customer Reviews — MLS UAE" },
  { name: "description", content: "Read genuine customer reviews for MLS UAE. Over 7000 verified buyers share their experience with our premium halal meat." },
];

export async function loader({ context }: LoaderFunctionArgs) {
  const { env } = context;
  const data = await fetchJudgemeStoreReviews(
    env.PUBLIC_STORE_DOMAIN,
    env.JUDGEME_API_TOKEN,
    1,
    10,
  );

  const rating = buildRatingSummary(data);
  const totalCount = data.total_count ?? 0;

  return { reviews: data.reviews, rating, totalCount };
}

export default function CustomerReviewsPage() {
  const { reviews: initialReviews, rating, totalCount } = useLoaderData<typeof loader>();
  const [allReviews, setAllReviews] = useState<JudgemeReview[]>(initialReviews);
  const [page, setPage] = useState(1);
  const fetcher = useFetcher<{ reviews: JudgemeReview[]; totalCount: number }>();

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
    const next = page + 1;
    setPage(next);
    fetcher.load(`/api/reviews/store?page=${next}`);
  };

  const hasMore = allReviews.length < totalCount;
  const starLabels = ["5 stars", "4 stars", "3 stars", "2 stars", "1 star"];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <div
        className="relative overflow-hidden py-20 md:py-28"
        style={{ background: "linear-gradient(135deg, #1a0a0a 0%, #3d0000 50%, #1a0a0a 100%)" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container mx-auto px-4 text-center text-white">
          <span className="mb-4 inline-block rounded-full border border-crimson/40 bg-crimson/20 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
            Verified Reviews
          </span>
          <h1 className="font-display text-4xl font-extrabold md:text-5xl lg:text-6xl">
            Take our customers' words<br className="hidden md:block" /> for our products
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/70">
            {totalCount > 0 ? `${totalCount.toLocaleString()} verified buyers can't be wrong.` : "Read what our customers say about MLS UAE."}
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-14">

        {/* Rating summary */}
        {totalCount > 0 && (
          <div className="mb-12 flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 sm:flex-row sm:items-start sm:justify-center">
            {/* Score */}
            <div className="flex shrink-0 flex-col items-center gap-2">
              <span className="font-display text-6xl font-extrabold tabular-nums text-foreground">
                {rating.average > 0 ? rating.average.toFixed(2) : "—"}
              </span>
              <StarRating rating={rating.average} size="lg" />
              <span className="text-sm text-muted-foreground">
                Based on {totalCount.toLocaleString()} reviews
              </span>
            </div>

            {/* Histogram */}
            {rating.histogram.some((n) => n > 0) && (
              <div className="flex w-full max-w-xs flex-col gap-2 sm:flex-1">
                {[4, 3, 2, 1, 0].map((idx) => {
                  const histTotal = rating.histogram.reduce((s, n) => s + n, 0);
                  const pct = histTotal > 0 ? Math.round((rating.histogram[idx] / histTotal) * 100) : 0;
                  return (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <span className="w-12 shrink-0 text-right text-muted-foreground">{starLabels[4 - idx]}</span>
                      <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-amber-400 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 shrink-0 tabular-nums text-muted-foreground">{rating.histogram[idx]}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Write review CTA */}
            <div className="flex shrink-0 flex-col items-center gap-3">
              <a
                href={`https://judge.me/stores/mls-uae.myshopify.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-amber-900 transition-colors hover:bg-amber-300"
              >
                <PenLine className="h-4 w-4" />
                Write a Store Review
              </a>
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified by Judge.me
              </span>
            </div>
          </div>
        )}

        {/* Photos strip */}
        {allReviews.some((r) => r.pictures?.length > 0) && (
          <div className="mb-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Customer photos &amp; videos</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allReviews
                .flatMap((r) => r.pictures ?? [])
                .slice(0, 12)
                .map((pic, i) => (
                  <a key={i} href={pic.urls.original} target="_blank" rel="noopener noreferrer" className="shrink-0">
                    <img
                      src={pic.urls.small}
                      alt={`Customer photo ${i + 1}`}
                      className="h-20 w-20 rounded-xl object-cover ring-1 ring-border hover:ring-crimson transition-all"
                    />
                  </a>
                ))}
            </div>
          </div>
        )}

        {/* Reviews list */}
        <div className="flex flex-col gap-4">
          {allReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={fetcher.state === "loading"}
              className={cn(
                "rounded-xl border border-border px-8 py-3 text-sm font-semibold transition-colors",
                "hover:border-crimson hover:text-crimson disabled:opacity-50",
              )}
            >
              {fetcher.state === "loading"
                ? "Loading…"
                : `Load more (${(totalCount - allReviews.length).toLocaleString()} remaining)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: JudgemeReview }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-crimson/10 text-crimson">
            <User className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">{review.reviewer.name}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(review.created_at).toLocaleDateString("en-AE", { year: "numeric", month: "short", day: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <StarRating rating={review.rating} size="sm" />
          {review.verified === "verified_buyer" && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
              <ShieldCheck className="h-3 w-3" />
              Verified Buyer
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

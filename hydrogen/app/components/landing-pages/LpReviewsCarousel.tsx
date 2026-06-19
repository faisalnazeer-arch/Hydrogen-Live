import { Star } from "lucide-react";

export function LpReviewsCarousel({ nodes }: { nodes: any[] }) {
  if (!nodes?.length) return null;

  const reviews = nodes.map((node: any) => {
    const map = Object.fromEntries((node.fields ?? []).map((x: any) => [x.key, x.value]));
    return {
      author: map.author ?? "",
      body: map.body ?? "",
      productName: map.product_name ?? "",
      rating: Math.min(5, Math.max(0, parseInt(map.rating ?? "5") || 5)),
    };
  });

  return (
    <section className="bg-[#faf8f5] py-12">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center font-display text-2xl font-extrabold text-foreground">
          What Our Customers Say
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <div key={i} className="rounded-xl bg-white p-5 shadow-sm">
              <div className="mb-2 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`h-4 w-4 ${si < r.rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`}
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-neutral-700">{r.body}</p>
              <div className="mt-4 border-t border-neutral-100 pt-3">
                <p className="text-sm font-semibold text-foreground">{r.author}</p>
                {r.productName && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{r.productName}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

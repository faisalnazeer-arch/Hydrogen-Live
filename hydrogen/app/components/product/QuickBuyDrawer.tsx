import { useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useFetcher } from "react-router";
import { useQuickBuyStore } from "@/stores/quickBuyStore";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, shopifyImageUrl } from "@/lib/shopify";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  SubscriptionSelector,
  parseSellingPlanGroups,
  type SellingPlanGroup,
} from "./SubscriptionSelector";

export function QuickBuyDrawer() {
  const { product, isOpen, close } = useQuickBuyStore();
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  const node = product?.node;
  const variants = useMemo(
    () => node?.variants.edges.map((e) => e.node) ?? [],
    [node]
  );
  const options = node?.options ?? [];

  const [selected, setSelected] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Lazy-fetch selling plans when drawer opens
  const planFetcher = useFetcher<{ groups: any[]; discountMap: Record<string, number> }>();
  const [sellingPlanGroups, setSellingPlanGroups] = useState<SellingPlanGroup[]>([]);

  useEffect(() => {
    if (!node) return;
    const firstAvail = variants.find((v) => v.availableForSale) ?? variants[0];
    const map: Record<string, string> = {};
    firstAvail?.selectedOptions.forEach((o: any) => (map[o.name] = o.value));
    setSelected(map);
    setQty(1);
    setSelectedPlanId(null);
    setSellingPlanGroups([]);
  }, [node, variants]);

  useEffect(() => {
    if (isOpen && node?.handle && planFetcher.state === "idle" && !planFetcher.data) {
      planFetcher.load(`/api/selling-plans/${node.handle}`);
    }
  }, [isOpen, node?.handle]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (planFetcher.data?.groups) {
      setSellingPlanGroups(
        parseSellingPlanGroups(planFetcher.data.groups, planFetcher.data.discountMap ?? {}),
      );
    }
  }, [planFetcher.data]);

  const matched = variants.find((v: any) =>
    v.selectedOptions.every((o: any) => selected[o.name] === o.value)
  );

  if (!node) return null;
  const img = node.images.edges[0]?.node;
  const basePrice = matched?.price ?? node.priceRange.minVariantPrice;

  const activePlan = sellingPlanGroups.flatMap((g) => g.plans).find((p) => p.id === selectedPlanId);
  const displayPrice =
    activePlan && activePlan.discount > 0
      ? {
          amount: String(
            (parseFloat(basePrice.amount) * (1 - activePlan.discount / 100)).toFixed(2)
          ),
          currencyCode: basePrice.currencyCode,
        }
      : basePrice;

  const handleAdd = async () => {
    if (!matched) return;
    await addItem({
      product: product!,
      variantId: matched.id,
      variantTitle: matched.title,
      price: displayPrice,
      quantity: qty,
      selectedOptions: matched.selectedOptions,
      sellingPlanId: selectedPlanId,
      sellingPlanName: activePlan?.name ?? null,
    });
    toast.success(selectedPlanId ? "Subscription added" : "Added to cart", {
      description: `${node.title} · ${matched.title}`,
    });
    close();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(o) => !o && close()}>
      <SheetContent className="flex w-[88vw] max-w-[420px] flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="font-display text-xl">Quick Buy</SheetTitle>
          <SheetDescription>Choose options and add to cart</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex gap-4">
            {img && (
              <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                <img
                  src={shopifyImageUrl(img.url, 300)}
                  alt={img.altText ?? node.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-col">
              <div className="font-medium leading-tight">{node.title}</div>
              <div className="mt-2 font-display text-2xl font-bold text-crimson">
                {formatPrice(displayPrice.amount, displayPrice.currencyCode)}
              </div>
              {activePlan && activePlan.discount > 0 && (
                <div className="text-xs text-muted-foreground line-through">
                  {formatPrice(basePrice.amount, basePrice.currencyCode)}
                </div>
              )}
              {matched && !matched.availableForSale && (
                <div className="mt-1 text-xs font-semibold text-destructive">
                  Out of stock
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {options.map((opt: any) => (
              <div key={opt.name}>
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {opt.name}
                </div>
                <div className="flex flex-wrap gap-2">
                  {opt.values.map((value: string) => {
                    const active = selected[opt.name] === value;
                    const candidate = variants.find(
                      (v: any) =>
                        v.selectedOptions.find((o: any) => o.name === opt.name)?.value === value &&
                        v.selectedOptions.every(
                          (o: any) =>
                            o.name === opt.name ||
                            selected[o.name] === undefined ||
                            selected[o.name] === o.value
                        )
                    );
                    const disabled = candidate ? !candidate.availableForSale : true;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSelected((s) => ({ ...s, [opt.name]: value }))}
                        className={cn(
                          "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                          active
                            ? "border-crimson bg-crimson text-crimson-foreground"
                            : "border-border bg-background hover:border-crimson",
                          disabled && "cursor-not-allowed opacity-50 line-through hover:border-border"
                        )}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Subscription selector — only shown when plans are loaded */}
            {sellingPlanGroups.length > 0 && (
              <SubscriptionSelector
                groups={sellingPlanGroups}
                selectedPlanId={selectedPlanId}
                onSelect={setSelectedPlanId}
              />
            )}

            <div>
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Quantity
              </div>
              <div className="inline-flex items-center rounded border border-border">
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center hover:bg-muted"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm">{qty}</span>
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center hover:bg-muted"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border p-4">
          <Button
            onClick={handleAdd}
            disabled={!matched?.availableForSale || isLoading}
            size="lg"
            className="w-full bg-crimson text-crimson-foreground hover:bg-rich-red"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <ShoppingBag className="mr-2 h-4 w-4" />
                {selectedPlanId ? "Subscribe" : "Add to Cart"}
              </>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { cn } from "~/lib/utils";
import { RefreshCw, Tag } from "lucide-react";

export interface SellingPlan {
  id: string;
  name: string;
  discount: number; // percentage, 0 = no discount
}

export interface SellingPlanGroup {
  name: string;
  plans: SellingPlan[];
}

interface SubscriptionSelectorProps {
  groups: SellingPlanGroup[];
  selectedPlanId: string | null;
  onSelect: (planId: string | null) => void;
  className?: string;
}

export function SubscriptionSelector({
  groups,
  selectedPlanId,
  onSelect,
  className,
}: SubscriptionSelectorProps) {
  if (groups.length === 0) return null;

  // Flatten all plans across groups for the frequency picker
  const allPlans = groups.flatMap((g) => g.plans);
  const activePlan = allPlans.find((p) => p.id === selectedPlanId) ?? null;
  const isSubscribing = selectedPlanId !== null;
  const bestDiscount = Math.max(...allPlans.map((p) => p.discount), 0);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <p className="text-sm font-semibold">Purchase type</p>

      {/* One-time option */}
      <label
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
          !isSubscribing
            ? "border-crimson bg-crimson/5 ring-1 ring-crimson"
            : "border-border hover:border-muted-foreground"
        )}
      >
        <input
          type="radio"
          name="purchase-type"
          checked={!isSubscribing}
          onChange={() => onSelect(null)}
          className="accent-crimson"
        />
        <span className="text-sm font-medium">One-time purchase</span>
      </label>

      {/* Subscribe option */}
      <label
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition-colors",
          isSubscribing
            ? "border-crimson bg-crimson/5 ring-1 ring-crimson"
            : "border-border hover:border-muted-foreground"
        )}
      >
        <input
          type="radio"
          name="purchase-type"
          checked={isSubscribing}
          onChange={() => onSelect(allPlans[0]?.id ?? null)}
          className="mt-0.5 accent-crimson"
        />
        <div className="flex flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Subscribe &amp; Save</span>
            {bestDiscount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <Tag className="h-2.5 w-2.5" />
                {bestDiscount}% OFF
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            Free cancellation · Delivered automatically
          </span>
        </div>
      </label>

      {/* Frequency picker — only shown when subscribing */}
      {isSubscribing && allPlans.length > 1 && (
        <div className="pl-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Delivery frequency
          </p>
          <div className="flex flex-wrap gap-2">
            {allPlans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => onSelect(plan.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  plan.id === selectedPlanId
                    ? "border-crimson bg-crimson text-crimson-foreground"
                    : "border-border bg-card hover:border-crimson"
                )}
              >
                <RefreshCw className="h-3 w-3" />
                {plan.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Single plan — show frequency inline */}
      {isSubscribing && allPlans.length === 1 && activePlan && (
        <div className="flex items-center gap-1.5 pl-1 text-xs text-muted-foreground">
          <RefreshCw className="h-3 w-3 text-crimson" />
          <span>{activePlan.name}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Parse Shopify selling plan groups from the GraphQL response.
 * discountMap: planId -> discount% derived from sellingPlanAllocations on variants.
 */
export function parseSellingPlanGroups(
  raw: any[],
  discountMap: Record<string, number> = {},
): SellingPlanGroup[] {
  if (!raw?.length) return [];
  return raw
    .map((group: any) => ({
      name: group.name ?? "Subscription",
      plans: (group.sellingPlans?.nodes ?? []).map((plan: any) => ({
        id: plan.id as string,
        name: plan.name as string,
        discount: discountMap[plan.id] ?? 0,
      })),
    }))
    .filter((g: SellingPlanGroup) => g.plans.length > 0);
}

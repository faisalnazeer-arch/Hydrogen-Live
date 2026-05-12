import { useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ExternalLink, Loader2, ShoppingBag, RefreshCw } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice, shopifyImageUrl } from "@/lib/shopify";

const FREE_SHIPPING_THRESHOLD = 150;

export function CartDrawer() {
  const {
    items,
    isOpen,
    setOpen,
    isLoading,
    isSyncing,
    updateQuantity,
    removeItem,
    getCheckoutUrl,
    syncCart,
  } = useCartStore();

  useEffect(() => {
    if (isOpen) syncCart();
  }, [isOpen, syncCart]);

  const totalItems = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce(
    (n, i) => n + parseFloat(i.price.amount) * i.quantity,
    0
  );
  const currency = items[0]?.price.currencyCode ?? "AED";
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleCheckout = () => {
    const url = getCheckoutUrl();
    if (url) {
      window.open(url, "_blank");
      setOpen(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="font-display text-xl">Your Cart</SheetTitle>
          <SheetDescription>
            {totalItems === 0
              ? "Your cart is empty"
              : `${totalItems} item${totalItems !== 1 ? "s" : ""}`}
          </SheetDescription>
        </SheetHeader>

        {items.length > 0 && (
          <div className="border-b border-border bg-bone px-6 py-3">
            {remaining > 0 ? (
              <p className="text-xs text-foreground">
                Add{" "}
                <span className="font-bold text-crimson">
                  {formatPrice(remaining, currency)}
                </span>{" "}
                for free delivery
              </p>
            ) : (
              <p className="text-xs font-semibold text-emerald-700">
                🎉 You unlocked free delivery!
              </p>
            )}
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
              <div
                className="h-full bg-crimson transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button onClick={() => setOpen(false)} variant="outline">
                Continue shopping
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => {
                const img = item.product.node.images.edges[0]?.node;
                const lineId = item.lineId;
                return (
                  <li key={item.lineId ?? item.variantId} className="flex gap-3 p-4">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      {img && (
                        <img
                          src={shopifyImageUrl(img.url, 200)}
                          alt={img.altText ?? item.product.node.title}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="text-sm font-medium leading-tight">
                        {item.product.node.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.selectedOptions.map((o) => o.value).join(" · ") ||
                          item.variantTitle}
                      </div>
                      {/* Subscription badge */}
                      {item.sellingPlanName && (
                        <div className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          <RefreshCw className="h-2.5 w-2.5" />
                          {item.sellingPlanName}
                        </div>
                      )}
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center rounded border border-border">
                          <button
                            type="button"
                            aria-label="Decrease"
                            disabled={!lineId}
                            className="grid h-7 w-7 place-items-center hover:bg-muted disabled:opacity-40"
                            onClick={() =>
                              lineId && updateQuantity(lineId, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase"
                            disabled={!lineId}
                            className="grid h-7 w-7 place-items-center hover:bg-muted disabled:opacity-40"
                            onClick={() =>
                              lineId && updateQuantity(lineId, item.quantity + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="font-semibold text-crimson">
                          {formatPrice(
                            parseFloat(item.price.amount) * item.quantity,
                            item.price.currencyCode
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove"
                      disabled={!lineId}
                      onClick={() => lineId && removeItem(lineId)}
                      className="self-start text-muted-foreground hover:text-crimson disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium">Subtotal</span>
              <span className="font-display text-xl font-bold text-crimson">
                {formatPrice(subtotal, currency)}
              </span>
            </div>
            <Button
              onClick={handleCheckout}
              disabled={isLoading || isSyncing}
              size="lg"
              className="w-full bg-crimson text-crimson-foreground hover:bg-rich-red"
            >
              {isLoading || isSyncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" /> Checkout
                </>
              )}
            </Button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-2 w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Continue shopping
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

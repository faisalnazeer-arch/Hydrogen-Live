import { useRouteLoaderData } from "react-router";

export interface CartDrawerConfig {
  freeShippingThreshold: number;
  deliveryItems: string[];
  freeGiftSubVariantId: string;
  freeGiftCarVariantId: string;
}

const DEFAULT_CONFIG: CartDrawerConfig = {
  freeShippingThreshold: 350,
  deliveryItems: [
    "Fresh delivery within **1 hour** across Dubai, **2 hours** across Abu Dhabi & same-day across Sharjah and Ajman.",
    "**10% off** on AED 600 purchase.",
    "🎁 **Special Offer Activated:** FREE gift of 2x Angus beef burgers and 1x AUS Grass-fed Beef Striploin on orders above **AED 40** with your first purchase!",
    "**Free Shipping** above AED 350",
  ],
  freeGiftSubVariantId: "gid://shopify/ProductVariant/48766692720956",
  freeGiftCarVariantId: "gid://shopify/ProductVariant/48650846765372",
};

export function useCartDrawerConfig(): CartDrawerConfig {
  const root = useRouteLoaderData("root") as any;
  const config = root?.cartDrawerConfig;
  if (!config) return DEFAULT_CONFIG;
  return {
    freeShippingThreshold: config.freeShippingThreshold || DEFAULT_CONFIG.freeShippingThreshold,
    deliveryItems: config.deliveryItems?.length > 0 ? config.deliveryItems : DEFAULT_CONFIG.deliveryItems,
    freeGiftSubVariantId: config.freeGiftSubVariantId ?? "",
    freeGiftCarVariantId: config.freeGiftCarVariantId ?? "",
  };
}

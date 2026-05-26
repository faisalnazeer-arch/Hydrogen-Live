import { useCallback, useState } from "react";
import { ProductPageShell, type ProductPageShellProps } from "./ProductPageShell";
import { MetafieldSubTabs } from "./SubAccordion";
import { GloboProductOptions } from "~/components/product/GloboProductOptions";

const METAFIELD_TITLES: Record<string, string> = {
  usage_guide: "Cooking Guide",
  pairing_suggestions: "Best Pairings",
  flavor_profile: "Flavor Profile",
  ingredients: "What's Included",
  understanding_rubs: "About This Cut",
  mls_rub: "MLS Notes",
  beef_rubs: "Additional Info",
};

export function WholeCutsTemplate(props: ProductPageShellProps) {
  const [globoAttributes, setGloboAttributes] = useState<Array<{ key: string; value: string }>>([]);
  const handleGloboChange = useCallback((attrs: Array<{ key: string; value: string }>) => {
    setGloboAttributes(attrs);
  }, []);

  // Shopify GID → numeric ID for Globo API
  const productNumericId = props.product.id?.split("/").pop() ?? "";

  const subTabs = (
    <MetafieldSubTabs
      product={props.product}
      metafieldTitles={METAFIELD_TITLES}
      flavorTagClass="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
    />
  );
  const hasContent = Object.keys(METAFIELD_TITLES).some(
    (key) => props.product.metafields?.find((m: any) => m?.key === key)?.value ?? null
  );

  const globoOptionsSection = (
    <GloboProductOptions
      productNumericId={productNumericId}
      onChange={handleGloboChange}
    />
  );

  return (
    <ProductPageShell
      {...props}
      templateSuffix="whole-cuts"
      extraSections={hasContent ? subTabs : undefined}
      globoOptions={globoOptionsSection}
      globoAttributes={globoAttributes}
    />
  );
}

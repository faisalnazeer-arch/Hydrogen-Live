import { ProductPageShell, type ProductPageShellProps } from "./ProductPageShell";
import { MetafieldSubTabs } from "./SubAccordion";

const METAFIELD_TITLES: Record<string, string> = {
  mls_rub: "MLS Rub",
  beef_rubs: "Rub Details",
  usage_guide: "How to Apply",
  pairing_suggestions: "Best Chicken Dishes for This Rub",
  flavor_profile: "Flavor Profile",
  ingredients: "Ingredients",
  understanding_rubs: "About This Rub",
};

export function ChickenRubsTemplate(props: ProductPageShellProps) {
  const subTabs = (
    <MetafieldSubTabs
      product={props.product}
      metafieldTitles={METAFIELD_TITLES}
      flavorTagClass="bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300"
    />
  );
  const hasContent = Object.keys(METAFIELD_TITLES).some(
    (key) => props.product.metafields?.find((m: any) => m?.key === key)?.value ?? null
  );
  return (
    <ProductPageShell
      {...props}
      templateSuffix="chicken-rubs"
      extraSections={hasContent ? subTabs : undefined}
    />
  );
}
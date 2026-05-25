import { ProductPageShell, type ProductPageShellProps } from "./ProductPageShell";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "~/components/ui/accordion";

function getMeta(product: any, key: string): string | null {
  return product.metafields?.find((m: any) => m?.key === key)?.value ?? null;
}

interface RubsAccordionProps {
  product: any;
  pairingHeading: string;
}

function RubsAccordion({ product, pairingHeading }: RubsAccordionProps) {
  const items = [
    { key: "beef_rubs",          label: "Beef Rubs",       value: getMeta(product, "beef_rubs") },
    { key: "mls_rub",            label: "MLS Rub",         value: getMeta(product, "mls_rub") },
    { key: "usage_guide",        label: "How to Apply",    value: getMeta(product, "usage_guide") },
    { key: "pairing_suggestions",label: pairingHeading,    value: getMeta(product, "pairing_suggestions") },
    { key: "flavor_profile",     label: "Flavor Profile",  value: getMeta(product, "flavor_profile") },
    { key: "ingredients",        label: "Ingredients",     value: getMeta(product, "ingredients") },
  ].filter((item) => !!item.value);

  if (items.length === 0) return null;

  return (
    <div className="border-t border-border pt-5">
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Understanding Rubs
      </h3>
      <Accordion type="multiple" className="w-full">
        {items.map((item) => (
          <AccordionItem key={item.key} value={item.key}>
            <AccordionTrigger className="text-sm font-medium hover:no-underline">
              {item.label}
            </AccordionTrigger>
            <AccordionContent>
              {item.key === "flavor_profile" ? (
                <div className="flex flex-wrap gap-2">
                  {item.value!.split(",").map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-crimson/10 px-3 py-1 text-xs font-semibold text-crimson"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                  {item.value}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

interface RubsTemplateProps extends ProductPageShellProps {
  pairingHeading?: string;
}

export function RubsTemplate({ pairingHeading = "Best Cuts for This Rub", ...props }: RubsTemplateProps) {
  return (
    <ProductPageShell
      {...props}
      productInfoExtra={
        <RubsAccordion product={props.product} pairingHeading={pairingHeading} />
      }
    />
  );
}

export function BeefRubsTemplate(props: ProductPageShellProps) {
  return <RubsTemplate {...props} pairingHeading="Best Beef Cuts for This Rub" />;
}

export function ChickenRubsTemplate(props: ProductPageShellProps) {
  return <RubsTemplate {...props} pairingHeading="Best Chicken Dishes for This Rub" />;
}

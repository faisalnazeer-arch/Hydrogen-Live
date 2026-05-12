import type { LoaderFunctionArgs } from "@shopify/remix-oxygen";

const SELLING_PLANS_QUERY = `#graphql
  query SellingPlans($handle: String!) {
    product(handle: $handle) {
      sellingPlanGroups(first: 10) {
        nodes {
          name
          sellingPlans(first: 10) {
            nodes {
              id
              name
              recurringDeliveries
            }
          }
        }
      }
      variants(first: 1) {
        nodes {
          price { amount }
          sellingPlanAllocations(first: 10) {
            nodes {
              sellingPlan { id }
              priceAdjustments {
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
              }
            }
          }
        }
      }
    }
  }
` as const;

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { handle } = params;
  if (!handle) return Response.json({ groups: [], discountMap: {} });

  const data = await context.storefront.query(SELLING_PLANS_QUERY, {
    variables: { handle },
  });

  const groups = data?.product?.sellingPlanGroups?.nodes ?? [];
  const allocations =
    data?.product?.variants?.nodes?.[0]?.sellingPlanAllocations?.nodes ?? [];

  const discountMap: Record<string, number> = {};
  for (const alloc of allocations) {
    const planId = alloc.sellingPlan?.id;
    const adj = alloc.priceAdjustments?.[0];
    if (!planId || !adj) continue;
    const price = parseFloat(adj.price?.amount ?? "0");
    const compare = parseFloat(adj.compareAtPrice?.amount ?? "0");
    if (compare > 0 && price < compare) {
      discountMap[planId] = Math.round(((compare - price) / compare) * 100);
    }
  }

  return Response.json({ groups, discountMap });
}

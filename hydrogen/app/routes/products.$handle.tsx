import type { LoaderFunctionArgs, MetaFunction } from "@shopify/remix-oxygen";
import { useLoaderData } from "react-router";
import { type ShopifyProduct } from "~/lib/shopify";
import { fetchJudgemeReviews, fetchJudgemeRating, buildRatingSummary } from "~/lib/judgeme";
import { extractGloboOptionsFromHtml, type GloboOptionSet } from "~/lib/globo";
import { DefaultTemplate } from "~/components/product-templates/DefaultTemplate";
import { BeefRubsTemplate } from "~/components/product-templates/BeefRubsTemplate";
import { ChickenRubsTemplate } from "~/components/product-templates/ChickenRubsTemplate";
import { LambRubsTemplate } from "~/components/product-templates/LambRubsTemplate";
import { WholeCutsTemplate } from "~/components/product-templates/WholeCutsTemplate";
import { BoxCollectionsTemplate } from "~/components/product-templates/BoxCollectionsTemplate";

const PAGE_SETTINGS_QUERY = `
  query {
    metaobjects(type: "product_page_settings", first: 1) {
      nodes {
        fields { key value }
      }
    }
  }
`;

const RECOMMENDATIONS_QUERY = `#graphql
  query ProductRecommendations($productId: ID!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId) {
      id title handle vendor
      availableForSale
      tags
      productType
      priceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      compareAtPriceRange { minVariantPrice { amount currencyCode } }
      images(first: 4) { edges { node { url altText width height } } }
      variants(first: 20) {
        edges {
          node {
            id title availableForSale
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            selectedOptions { name value }
          }
        }
      }
      options { name values }
      metafields(identifiers: [
        {namespace: "reviews", key: "rating"}
        {namespace: "reviews", key: "rating_count"}
      ]) { key value }
    }
  }
` as const;

const PRODUCT_QUERY = `#graphql
  query Product($handle: String!, $language: LanguageCode, $country: CountryCode)
  @inContext(language: $language, country: $country) {
    product(handle: $handle) {
      id title handle descriptionHtml vendor
      tags
      images(first: 10) { nodes { url altText } }
      media(first: 12) {
        nodes {
          mediaContentType
          ... on MediaImage { image { url altText } }
          ... on Video {
            id
            sources { url mimeType }
            previewImage { url altText }
          }
          ... on ExternalVideo {
            id
            embedUrl
            previewImage { url altText }
          }
        }
      }
      options { name values }
      priceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      sellingPlanGroups(first: 10) {
        nodes {
          name
          sellingPlans(first: 10) {
            nodes { id name recurringDeliveries }
          }
        }
      }
      variants(first: 50) {
        nodes {
          id title availableForSale quantityAvailable
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          selectedOptions { name value }
          image { url altText }
          storeAvailability(first: 10) {
            nodes { available location { name address { city } } }
          }
          unitPrice { amount currencyCode }
          unitPriceMeasurement {
            measuredType
            quantityUnit
            quantityValue
            referenceUnit
            referenceValue
          }
          metafields(identifiers: [
            {namespace: "custom", key: "price_per_kg"}
          ]) { key value namespace }
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
      metafields(identifiers: [
        {namespace: "reviews", key: "rating"}
        {namespace: "reviews", key: "rating_count"}
        {namespace: "custom", key: "beef_rubs"}
        {namespace: "custom", key: "mls_rub"}
        {namespace: "custom", key: "usage_guide"}
        {namespace: "custom", key: "ingredients"}
        {namespace: "custom", key: "flavor_profile"}
        {namespace: "custom", key: "pairing_suggestions"}
        {namespace: "custom", key: "understanding_rubs"}
      ]) { key value }
      collections(first: 30) { nodes { id } }
    }
  }
` as const;

// Converts Globo REST API option objects → GloboOption[] shape expected by GloboProductOptions
function flattenGloboApiOptions(opts: any[]): import("~/lib/globo").GloboOption[] {
  return opts
    .filter((o: any) => o?.name || o?.label)
    .map((o: any) => ({
      elementId: String(o.id ?? o._id ?? Math.random()),
      name: o.name ?? o.label ?? "",
      type: (() => {
        const t = (o.type ?? o.option_type ?? "text").toLowerCase();
        if (t.includes("textarea")) return "textarea" as const;
        if (t.includes("swatch") && t.includes("image")) return "image_swatch" as const;
        if (t.includes("swatch") || t.includes("color")) return "swatch" as const;
        if (t.includes("dropdown") || t.includes("select")) return "dropdown" as const;
        if (t.includes("radio")) return "radio" as const;
        if (t.includes("checkbox")) return "checkbox" as const;
        if (t.includes("date")) return "date" as const;
        if (t.includes("number")) return "number" as const;
        if (t.includes("file")) return "file" as const;
        return "text" as const;
      })(),
      required: o.required ?? false,
      placeholder: o.placeholder ?? "",
      values: (o.values ?? o.option_values ?? []).map((v: any) => ({
        label: typeof v === "string" ? v : (v.label ?? v.name ?? v.value ?? ""),
        value: typeof v === "string" ? v : (v.value ?? v.label ?? ""),
        color: v.color ?? v.color_code ?? undefined,
        image: v.image ?? v.image_url ?? undefined,
      })),
      min_value: o.min_value,
      max_value: o.max_value,
      position: o.position ?? 0,
    }));
}

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const { handle } = params;
  if (!handle) throw new Response("Missing handle", { status: 400 });

  const { env } = context;
  const shopDomain = env.PUBLIC_STORE_DOMAIN;
  // Use the live store custom domain for HTML scraping — the myshopify subdomain
  // may redirect to a password page or serve a stripped theme without Globo scripts.
  const liveDomain = (env as any).PUBLIC_LIVE_STORE_DOMAIN ?? shopDomain;
  const judgemeToken = env.JUDGEME_API_TOKEN;

  const lang = request.headers.get("Cookie")?.match(/(?:^|;\s*)lang=([a-z]{2})/)?.[1];
  const language = (lang === "ar" ? "AR" : "EN") as "AR" | "EN";

  const data = await context.storefront.query(PRODUCT_QUERY, {
    variables: { handle, language, country: "AE" as const },
    cache: context.storefront.CacheNone(),
  });
  if (!data.product) throw new Response("Not found", { status: 404 });

  const externalId = data.product.id.split("/").pop() ?? undefined;

  // Numeric collection IDs — used to filter Globo automate rules (collection-based targeting)
  const collectionIds: number[] = (data.product.collections?.nodes ?? [])
    .map((c: any) => Number(c.id.split("/").pop()))
    .filter(Boolean);

  // Case-insensitive tag detection so "Template:whole-cuts" and "template:whole-cuts" both work
  const templateTag = data.product.tags?.find((t: string) => t.toLowerCase().startsWith("template:"));
  const templateSuffix = templateTag ? templateTag.replace(/^template:/i, "").trim() : null as string | null;

  // Strategy 1: scrape Globo config from Shopify theme HTML (proven approach).
  // Strategy 2: try the Globo app-proxy JSON endpoint as fallback.
  // Both run for every product so all templates get Globo options.
  // Fetch Globo options by scraping the LIVE store's product page HTML.
  // We try the custom domain first (mlsuae.ae) because that's where the Shopify
  // theme with Globo is actually running. The myshopify subdomain may serve a
  // password page or a Globo-less version of the HTML.
  const globoPromise: Promise<GloboOptionSet[]> = externalId
    ? (async () => {
        const numId = Number(externalId);

        // 1️⃣  Scrape live custom domain (most reliable)
        try {
          const r = await fetch(`https://${liveDomain}/products/${handle}`, {
            headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0" },
            redirect: "follow",
          });
          if (r.ok) {
            const html = await r.text();
            const fromHtml = extractGloboOptionsFromHtml(html, numId, collectionIds);
            if (fromHtml.length > 0) return fromHtml;
          }
        } catch { /* try next */ }

        // 2️⃣  Fallback: scrape myshopify domain (in case custom domain same)
        if (liveDomain !== shopDomain) {
          try {
            const r = await fetch(`https://${shopDomain}/products/${handle}`, {
              headers: { Accept: "text/html", "User-Agent": "Mozilla/5.0" },
              redirect: "follow",
            });
            if (r.ok) {
              const html = await r.text();
              const fromHtml = extractGloboOptionsFromHtml(html, numId, collectionIds);
              if (fromHtml.length > 0) return fromHtml;
            }
          } catch { /* try next */ }
        }

        // 3️⃣  Fallback: Globo app proxy JSON (try multiple URL patterns on both domains)
        const proxyPaths = [
          `/apps/product-options-by-globo/option_sets.json?product_id=${externalId}`,
          `/apps/globo-product-options/option_sets.json?product_id=${externalId}`,
          `/apps/product-options/api/products/${externalId}/option_sets`,
        ];
        const domains = [...new Set([shopDomain, liveDomain])];
        for (const domain of domains) {
          for (const path of proxyPaths) {
            try {
              const apiRes = await fetch(
                `https://${domain}${path}`,
                { headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" }, redirect: "follow" },
              );
              if (!apiRes.ok) continue;
              const d = await apiRes.json() as any;
              const rawSets: any[] = Array.isArray(d)
                ? d
                : (d?.option_sets ?? d?.optionSets ?? d?.data?.option_sets ?? d?.data?.optionSets ?? []);
              const sets = rawSets
                .map((set: any) => ({
                  id: String(set.id ?? Math.random()),
                  name: set.name ?? "",
                  options: flattenGloboApiOptions(set.options ?? set.custom_options ?? []),
                }))
                .filter((s: GloboOptionSet) => s.options.length > 0);
              if (sets.length > 0) return sets;
            } catch { /* try next */ }
          }
        }

        return [];
      })()
    : Promise.resolve([]);

  const [reviewsData, judgemeRating, recsData, settingsData, globoOptionSets] = await Promise.all([
    fetchJudgemeReviews(handle, shopDomain, judgemeToken, 1, 10, externalId),
    fetchJudgemeRating(data.product.id, shopDomain, judgemeToken),
    context.storefront.query(RECOMMENDATIONS_QUERY, {
      variables: { productId: data.product.id, language, country: "AE" as const },
    }).catch(() => null),
    context.adminFetch(PAGE_SETTINGS_QUERY).catch(() => null),
    globoPromise,
  ]);

  // Use Judge.me's dedicated product endpoint for rating (most accurate).
  // Fall back to buildRatingSummary (from reviews) then Shopify metafields in the shell.
  const reviewsSummary = buildRatingSummary(reviewsData);
  const rating = judgemeRating.average > 0 ? judgemeRating : reviewsSummary;

  const discountMap: Record<string, number> = {};
  for (const v of data.product.variants?.nodes ?? []) {
    const variantPrice = parseFloat((v as any).price?.amount ?? "0");
    for (const alloc of (v as any).sellingPlanAllocations?.nodes ?? []) {
      const planId = alloc.sellingPlan?.id;
      const adj = alloc.priceAdjustments?.[0];
      if (!planId || !adj || discountMap[planId] !== undefined) continue;
      const subPrice = parseFloat(adj.price?.amount ?? "0");
      const baseline = parseFloat(adj.compareAtPrice?.amount ?? "0") || variantPrice;
      if (baseline > 0 && subPrice < baseline) {
        discountMap[planId] = Math.round(((baseline - subPrice) / baseline) * 100);
      }
    }
  }
  for (const group of data.product.sellingPlanGroups?.nodes ?? []) {
    for (const plan of (group as any).sellingPlans?.nodes ?? []) {
      if (plan.id && discountMap[plan.id] === undefined) {
        discountMap[plan.id] = 10;
      }
    }
  }

  const recommendations: ShopifyProduct[] = (recsData?.productRecommendations ?? [])
    .slice(0, 8)
    .map((node: any) => ({ node }));

  const metaobjectFields: Array<{ key: string; value: string }> =
    (settingsData as any)?.metaobjects?.nodes?.[0]?.fields ?? [];
  const getMeta = (key: string) => metaobjectFields.find((f) => f.key === key)?.value ?? null;
  const pageSettings = {
    deliveryTitle: getMeta("delivery_title") ?? "Delivery Info",
    deliveryContent: getMeta("delivery_content"),
    supportTitle: getMeta("support_title") ?? "Customer Support",
    supportContent: getMeta("support_content"),
  };

  return {
    product: data.product,
    templateSuffix,
    sellingPlanGroupsRaw: data.product.sellingPlanGroups?.nodes ?? [],
    discountMap,
    reviews: reviewsData.reviews,
    reviewsTotalCount: reviewsData.total_count ?? 0,
    rating,
    externalId: externalId ?? null,
    recommendations,
    pageSettings,
    globoOptionSets,
  };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `${data?.product?.title ?? "Product"} — MLS UAE` }];
};

export default function Product() {
  const { templateSuffix, ...templateProps } = useLoaderData<typeof loader>();

  if (templateSuffix === "beef-rubs") return <BeefRubsTemplate {...templateProps} />;
  if (templateSuffix === "chicken-rubs") return <ChickenRubsTemplate {...templateProps} />;
  if (templateSuffix === "lamb-rubs") return <LambRubsTemplate {...templateProps} />;
  if (templateSuffix === "whole-cuts") return <WholeCutsTemplate {...templateProps} />;
  if (templateSuffix === "box-collections") return <BoxCollectionsTemplate {...templateProps} />;
  return <DefaultTemplate {...templateProps} />;
}

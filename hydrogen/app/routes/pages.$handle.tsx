import type { LoaderFunctionArgs, MetaFunction } from "@shopify/remix-oxygen";
import { useLoaderData, Link } from "react-router";
import { LpHeroSlide } from "~/components/landing-pages/LpHeroSlide";
import { LpProductGridSection } from "~/components/landing-pages/LpProductGridSection";
import { LpReelsSection } from "~/components/landing-pages/LpReelsSection";
import { LpValueBannerSection } from "~/components/landing-pages/LpValueBannerSection";
import { LpIconsSection } from "~/components/landing-pages/LpIconsSection";
import { LpMessageBanner } from "~/components/landing-pages/LpMessageBanner";
import { LpReviewsCarousel } from "~/components/landing-pages/LpReviewsCarousel";
import { YoutubeReelsSection } from "~/components/landing-pages/YoutubeReelsSection";
import type { ShopifyProduct } from "@/lib/shopify";

// ── Queries ───────────────────────────────────────────────────────────────────

const PAGE_QUERY = `#graphql
  query Page($handle: String!, $language: LanguageCode, $country: CountryCode)
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      id
      title
      body
      bodySummary
      seo { title description }
      metafields(identifiers: [
        { namespace: "custom", key: "sections" }
        { namespace: "global", key: "title_tag" }
        { namespace: "global", key: "description_tag" }
      ]) {
        key
        namespace
        value
        references(first: 20) {
          nodes {
            ... on Metaobject {
              type handle
              fields {
                key value type
                # Resolves single metaobject_reference fields (e.g. product_grid)
                reference {
                  ... on Metaobject {
                    type handle
                    fields {
                      key value type
                      reference {
                        ... on Collection { handle title }
                        ... on MediaImage { image { url altText } }
                      }
                    }
                  }
                }
                # Resolves list.metaobject_reference fields (slider, icon, message_banner, reels_yt, reviews)
                references(first: 20) {
                  nodes {
                    ... on Metaobject {
                      type handle
                      fields {
                        key value type
                        # Resolves single refs inside each nested node
                        # (desktop_image/mobile_image for lp_hero_slide, yt_url → youtube_url for youtube_reels)
                        reference {
                          ... on Metaobject {
                            type handle
                            fields {
                              key value type
                              reference {
                                ... on MediaImage { image { url altText } }
                                ... on Collection { handle title }
                              }
                            }
                          }
                          ... on MediaImage { image { url altText } }
                          ... on Collection { handle title }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
` as const;

const REEL_ITEMS_QUERY = `#graphql
  query LpReelItems($language: LanguageCode, $country: CountryCode)
  @inContext(language: $language, country: $country) {
    metaobjects(type: "reel_item", first: 20) {
      nodes {
        id
        fields {
          key value
          reference {
            ... on Video {
              sources { url mimeType }
              previewImage { url }
            }
            ... on Product {
              id title handle
              featuredImage { url altText }
              priceRange { minVariantPrice { amount currencyCode } }
            }
          }
        }
      }
    }
  }
` as const;

const PRODUCT_FRAGMENT = `
  fragment ProductCard on Product {
    id title description handle tags vendor productType availableForSale
    priceRange {
      minVariantPrice { amount currencyCode }
      maxVariantPrice { amount currencyCode }
    }
    compareAtPriceRange { minVariantPrice { amount currencyCode } }
    images(first: 4) { edges { node { url altText width height } } }
    variants(first: 20) {
      edges {
        node {
          id title
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
          availableForSale
          selectedOptions { name value }
          quantityAvailable
        }
      }
    }
    options { name values }
    metafields(identifiers: [
      {namespace: "reviews", key: "rating"}
      {namespace: "reviews", key: "rating_count"}
    ]) { key value }
  }
`;

const COLLECTION_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_FRAGMENT}
  query CollectionProducts($handle: String!, $language: LanguageCode, $country: CountryCode)
  @inContext(language: $language, country: $country) {
    collection(handle: $handle) {
      products(first: 12) { nodes { ...ProductCard } }
    }
  }
` as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function toShopifyProduct(node: any): ShopifyProduct {
  return {
    node: {
      id: node.id ?? "",
      title: node.title ?? "",
      handle: node.handle ?? "",
      description: node.description ?? "",
      descriptionHtml: node.descriptionHtml ?? "",
      tags: node.tags ?? [],
      vendor: node.vendor ?? "",
      productType: node.productType ?? "",
      availableForSale: node.availableForSale ?? false,
      priceRange: node.priceRange,
      compareAtPriceRange: node.compareAtPriceRange ?? null,
      images: node.images,
      variants: node.variants,
      options: node.options ?? [],
      metafields: node.metafields ?? [],
    },
  };
}

// ── Loader ────────────────────────────────────────────────────────────────────

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const { handle } = params;
  if (!handle) throw new Response("Not found", { status: 404 });

  const lang = request.headers.get("Cookie")?.match(/(?:^|;\s*)lang=([a-z]{2})/)?.[1];
  const language = (lang === "ar" ? "AR" : "EN") as "AR" | "EN";

  const data = await context.storefront.query(PAGE_QUERY, {
    variables: { handle, language, country: "AE" as const },
  });

  if (!data.page) throw new Response(`Page "${handle}" not found`, { status: 404 });

  const metafields = (data.page.metafields ?? []).filter(Boolean);
  const sectionsMeta = metafields.find((m: any) => m?.key === "sections");
  const lpPageNodes: any[] = sectionsMeta?.references?.nodes ?? [];

  // Regular page — no landing page sections
  if (lpPageNodes.length === 0) {
    return {
      isLandingPage: false as const,
      page: { title: data.page.title, body: data.page.body, seo: data.page.seo },
      lpPageNodes: [],
      productsByCollection: {},
      reelItems: [],
    };
  }

  // Landing page — collect collection handles to prefetch
  const collectionHandles = new Set<string>();
  for (const lpPage of lpPageNodes) {
    const f = lpPage.fields ?? [];
    // lp_types is the top-level metaobject; it may have a nested "sections" field
    const lpTypeNodes: any[] = f.find((x: any) => x.key === "sections")?.references?.nodes ?? [];
    const targets = lpTypeNodes.length > 0 ? lpTypeNodes : [lpPage];
    for (const lpTypes of targets) {
      const tf: any[] = lpTypes.fields ?? [];
      // product_grid is a single metaobject_reference — use .reference (resolved by query)
      const pgRef = tf.find((x: any) => x.key === "product_grid")?.reference;
      if (pgRef?.type === "lp_product_grid") {
        const pf: any[] = pgRef.fields ?? [];
        const collHandle =
          pf.find((x: any) => x.key === "grid_collection_2")?.reference?.handle ??
          pf.find((x: any) => x.key === "collection_handle")?.value;
        if (collHandle) collectionHandles.add(collHandle);
      }
    }
  }

  const productsByCollection: Record<string, any[]> = {};
  const [reelData] = await Promise.all([
    context.storefront.query(REEL_ITEMS_QUERY, {
      variables: { language, country: "AE" as const },
      cache: context.storefront.CacheNone(),
    }),
    ...Array.from(collectionHandles).map(async (collHandle) => {
      const r = await context.storefront.query(COLLECTION_PRODUCTS_QUERY, {
        variables: { handle: collHandle, language, country: "AE" as const },
      });
      productsByCollection[collHandle] = r.collection?.products?.nodes ?? [];
    }),
  ]);

  return {
    isLandingPage: true as const,
    page: { title: data.page.title, body: data.page.body, seo: data.page.seo },
    lpPageNodes,
    productsByCollection,
    reelItems: reelData.metaobjects?.nodes ?? [],
  };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.page?.seo?.title ?? data?.page?.title ?? "MLS UAE" },
    { name: "description", content: data?.page?.seo?.description ?? "" },
  ];
};

// ── Landing page section renderer ─────────────────────────────────────────────

function renderLpTypes(
  lpTypes: any,
  key: string,
  productsByCollection: Record<string, any[]>,
  reelItems: any[],
): React.ReactNode[] {
  const f: any[] = lpTypes.fields ?? [];

  const orderField = f.find((x: any) => x.key === "order")?.value ?? "";
  const orderedKeys: string[] = orderField
    ? orderField.split(",").map((s: string) => s.trim()).filter(Boolean)
    : ["slider", "message_banner", "icon", "reels_yt", "reviews", "product_grid"];

  const sectionMap: Record<string, React.ReactNode | null> = {};

  // ── slider (list of lp_hero_slide) ─────────────────────────────────────────
  const sliderNodes: any[] = f.find((x: any) => x.key === "slider")?.references?.nodes ?? [];
  if (sliderNodes.length > 0) {
    sectionMap["slider"] = (
      <>
        {sliderNodes.map((n: any, i: number) => (
          <LpHeroSlide key={`${key}-slide-${i}`} node={n} />
        ))}
      </>
    );
  }
  // backward compat: old "slide" key (single ref)
  if (!sectionMap["slider"]) {
    const slideRef = f.find((x: any) => x.key === "slide")?.reference;
    if (slideRef?.type === "lp_hero_slide") {
      sectionMap["slide"] = <LpHeroSlide key={`${key}-slide`} node={slideRef} />;
    }
  }

  // ── message_banner (list of lp_message_banner) ──────────────────────────────
  const messageBannerNodes: any[] = f.find((x: any) => x.key === "message_banner")?.references?.nodes ?? [];
  if (messageBannerNodes.length > 0) {
    sectionMap["message_banner"] = (
      <LpMessageBanner key={`${key}-msg`} nodes={messageBannerNodes} />
    );
  }

  // ── icon (list of icon_with_text) ───────────────────────────────────────────
  const iconNodes: any[] = f.find((x: any) => x.key === "icon")?.references?.nodes ?? [];
  if (iconNodes.length > 0) {
    sectionMap["icon"] = <LpIconsSection key={`${key}-icons`} nodes={iconNodes} />;
  }

  // ── reels_yt (list of youtube_reels) ────────────────────────────────────────
  const reelsYtNodes: any[] = f.find((x: any) => x.key === "reels_yt")?.references?.nodes ?? [];
  if (reelsYtNodes.length > 0) {
    sectionMap["reels_yt"] = <YoutubeReelsSection key={`${key}-yt`} nodes={reelsYtNodes} />;
  }
  // backward compat: old reel_item-based "reel_section" key
  if (!sectionMap["reels_yt"]) {
    const reelSectionRef = f.find((x: any) => x.key === "reel_section")?.reference;
    if (reelSectionRef && reelItems.length > 0) {
      const heading = reelSectionRef.fields?.find((x: any) => x.key === "heading")?.value ?? "MLS Reels";
      const label = reelSectionRef.fields?.find((x: any) => x.key === "label")?.value ?? "Watch & Shop";
      const sectionId = reelSectionRef.fields?.find((x: any) => x.key === "section_id")?.value ?? "reels";
      sectionMap["reel_section"] = (
        <LpReelsSection key={`${key}-reels`} reelItems={reelItems} heading={heading} label={label} sectionId={sectionId} />
      );
    }
  }

  // ── reviews (list of lp_review) ─────────────────────────────────────────────
  const reviewNodes: any[] = f.find((x: any) => x.key === "reviews")?.references?.nodes ?? [];
  if (reviewNodes.length > 0) {
    sectionMap["reviews"] = <LpReviewsCarousel key={`${key}-reviews`} nodes={reviewNodes} />;
  }

  // ── value_banner (backward compat) ──────────────────────────────────────────
  const valueBannerRef = f.find((x: any) => x.key === "value_banner")?.reference;
  if (valueBannerRef) {
    sectionMap["value_banner"] = <LpValueBannerSection key={`${key}-value`} node={valueBannerRef} />;
  }

  // ── product_grid (single metaobject_reference → lp_product_grid) ────────────
  const productGridRef = f.find((x: any) => x.key === "product_grid")?.reference;
  if (productGridRef?.type === "lp_product_grid") {
    const pf: any[] = productGridRef.fields ?? [];
    const collHandle =
      pf.find((x: any) => x.key === "grid_collection_2")?.reference?.handle ??
      pf.find((x: any) => x.key === "collection_handle")?.value;
    const rawProducts = collHandle ? (productsByCollection[collHandle] ?? []) : [];
    const products = rawProducts.map(toShopifyProduct);
    sectionMap["product_grid"] = (
      <LpProductGridSection key={`${key}-grid`} fields={pf} products={products} />
    );
  }

  return orderedKeys
    .map((k) => sectionMap[k])
    .filter(Boolean) as React.ReactNode[];
}

// ── Page component ────────────────────────────────────────────────────────────

export default function Page() {
  const { isLandingPage, page, lpPageNodes, productsByCollection, reelItems } =
    useLoaderData<typeof loader>();

  // ── Landing page ──────────────────────────────────────────────────────
  if (isLandingPage) {
    const allSections: React.ReactNode[] = [];
    lpPageNodes.forEach((lpPage: any, pi: number) => {
      const f: any[] = lpPage.fields ?? [];
      const lpTypeNodes: any[] = f.find((x: any) => x.key === "sections")?.references?.nodes ?? [];
      const targets = lpTypeNodes.length > 0 ? lpTypeNodes : [lpPage];
      targets.forEach((lpTypes: any, ti: number) => {
        renderLpTypes(lpTypes, `${pi}-${ti}`, productsByCollection, reelItems)
          .forEach((s) => allSections.push(s));
      });
    });

    return <div className="min-h-screen">{allSections}</div>;
  }

  // ── Regular Shopify page ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-12 md:px-8 md:py-16">
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
          <span>/</span>
          <span className="text-foreground">{page.title}</span>
        </nav>

        <h1 className="font-display mb-10 text-3xl font-extrabold text-foreground md:text-4xl">
          {page.title}
        </h1>

        <div
          className="prose prose-sm md:prose-base max-w-none
            prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground
            prose-h2:mt-10 prose-h2:mb-3 prose-h2:text-xl
            prose-h3:mt-7 prose-h3:mb-2 prose-h3:text-lg
            prose-p:text-neutral-600 prose-p:leading-relaxed
            prose-strong:text-foreground prose-strong:font-semibold
            prose-a:text-crimson prose-a:no-underline hover:prose-a:underline
            prose-li:text-neutral-600 prose-li:leading-relaxed
            prose-ul:my-4 prose-ol:my-4
            prose-hr:border-border"
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      </div>
    </div>
  );
}

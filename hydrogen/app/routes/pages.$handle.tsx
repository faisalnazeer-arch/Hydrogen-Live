import type { LoaderFunctionArgs } from "@shopify/remix-oxygen";
import { useLoaderData, Link } from "react-router";

import { LpHeroSlide } from "~/components/landing-pages/LpHeroSlide";
import { LpIconsSection } from "~/components/landing-pages/LpIconsSection";
import { LpProductGridSection } from "~/components/landing-pages/LpProductGridSection";
import { LpReelsSection } from "~/components/landing-pages/LpReelsSection";
import { LpValueBannerSection } from "~/components/landing-pages/LpValueBannerSection";
import { YoutubeReelsSection } from "~/components/landing-pages/YoutubeReelsSection";
import { LpReviewsCarousel } from "~/components/landing-pages/LpReviewsCarousel";
import { LpMessageBanner } from "~/components/landing-pages/LpMessageBanner";
import { LpCertificationsSection } from "~/components/landing-pages/LpCertificationsSection";
import { LpCutsSection } from "~/components/landing-pages/LpCutsSection";
import { LpFeaturedProduct } from "~/components/landing-pages/LpFeaturedProduct";
import { LpProductCarousel } from "~/components/landing-pages/LpProductCarousel";
import { COLLECTION_PRODUCTS_QUERY } from "~/lib/shopify";
import type { ShopifyProduct } from "~/lib/shopify";

// Storefront query — kept exactly as original, plus sections IDs only
const PAGE_QUERY = `#graphql
  query Page($handle: String!, $language: LanguageCode)
  @inContext(language: $language) {
    page(handle: $handle) {
      id
      title
      body
      bodySummary
      seo {
        title
        description
      }
      metafields(identifiers: [
        {namespace: "global", key: "title_tag"}
        {namespace: "global", key: "description_tag"}
      ]) {
        namespace
        key
        value
      }
      metafield(namespace: "custom", key: "sections") {
        value
      }
    }
  }
` as const;

// Admin query — resolves all lp_types section content (no cost limit)
function sectionsAdminQuery(ids: string[]) {
  const imageFrag = `... on MediaImage { image { url altText width height } }`;
  const videoFrag = `... on Video { sources { url mimeType } preview { image { url } } }`;
  const collectionFrag = `... on Collection { id handle title }`;
  // Keep product fragment minimal — variants fetched via Storefront API to avoid cost overruns
  const productFrag = `... on Product { id handle title featuredImage { url altText } }`;

  const nodes = ids.map((id, i) => `
    n${i}: node(id: "${id}") {
      ... on Metaobject {
        id type
        fields {
          key value
          reference {
            ${imageFrag}
            ${collectionFrag}
            ${productFrag}
            ... on Metaobject {
              id handle type
              fields {
                key value
                reference {
                  ${imageFrag}
                  ${productFrag}
                  ${videoFrag}
                  ${collectionFrag}
                }
                references(first: 20) {
                  nodes {
                    ${collectionFrag}
                    ... on Metaobject {
                      id handle type
                      fields {
                        key value
                        reference { ${imageFrag} ${productFrag} ${videoFrag} ${collectionFrag} }
                      }
                    }
                  }
                }
              }
            }
          }
          references(first: 20) {
            nodes {
              ${collectionFrag}
              ... on Metaobject {
                id handle type
                fields {
                  key value
                  reference {
                    ${imageFrag}
                    ${productFrag}
                    ${videoFrag}
                    ... on Metaobject {
                      id handle type
                      fields { key value }
                    }
                  }
                  references(first: 10) {
                    nodes {
                      ${collectionFrag}
                      ... on Metaobject {
                        id handle type
                        fields {
                          key value
                          reference { ${imageFrag} ${productFrag} ${videoFrag} }
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
  `).join("\n");
  return `{ ${nodes} }`;
}

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const { handle } = params;
  if (!handle) throw new Response("Not found", { status: 404 });

  const lang = request.headers.get("Cookie")?.match(/(?:^|;\s*)lang=([a-z]{2})/)?.[1];
  const language = lang === "ar" ? "AR" : "EN";

  const { page } = await context.storefront.query(PAGE_QUERY, {
    variables: { handle, language },
  });

  if (!page) throw new Response(`Page "${handle}" not found`, { status: 404 });

  // sections metafield value is a JSON array of GIDs e.g. ["gid://shopify/Metaobject/123"]
  let sectionIds: string[] = [];
  try { sectionIds = JSON.parse(page.metafield?.value ?? "[]"); } catch { /* no sections */ }

  const lpSections: any[] = [];

  if (sectionIds.length > 0) {
    const adminData = await context.adminFetch(sectionsAdminQuery(sectionIds));
    const lpNodes: any[] = sectionIds.map((_: string, i: number) =>
      adminData?.[`n${i}`] ?? null
    ).filter(Boolean);


    for (const node of lpNodes) {
      const fm = Object.fromEntries((node.fields ?? []).map((f: any) => [f.key, f]));
      // order is plain text; title is a metaobject_reference so read its reference fields
      const rawOrder = fm.order?.value ?? "";
      // fallback: if order is empty, render all known section keys that have data
      const SECTION_KEYS = ["slider","value_banner","icon","message_banner","certifications","cuts_section","featured_product","reel_carousel","reels_yt","product_grid","product_grids","product_carousel","reviews","show_reviews","sub_banner"];
      const order: string[] = rawOrder
        ? rawOrder.split(",").map((s: string) => s.trim()).filter(Boolean)
        : SECTION_KEYS.filter(k => {
            const fk = fm[k];
            return fk && (fk.value || fk.reference || fk.references?.nodes?.length);
          });
      // title field is a metaobject_reference — get heading from its fields
      const titleRef = fm.title?.reference;
      const titleFields = Object.fromEntries((titleRef?.fields ?? []).map((f: any) => [f.key, f]));
      const lpTitle = titleFields.heading?.value ?? titleFields.title?.value ?? titleFields.text?.value ?? fm.collection_name?.value ?? null;
      const collectionName = fm.collection_name?.value ?? null;
      for (const key of order) {
        const field = fm[key];
        if (!field) continue;
        if (field.reference) lpSections.push({ key, node: field.reference, nodes: null, _lpTitle: lpTitle, _collectionName: collectionName });
        else if (field.references?.nodes?.length) lpSections.push({ key, node: null, nodes: field.references.nodes, _lpTitle: lpTitle, _collectionName: collectionName });
      }
    }
  }

  // Fetch products for grid/carousel sections
  const collectionHandles = new Set<string>();
  for (const sec of lpSections) {
    if ((sec.key === "product_grid" || sec.key === "product_grids") && sec.node) {
      const pgf = Object.fromEntries((sec.node.fields ?? []).map((f: any) => [f.key, f]));
      const ch = pgf.grid_collection_2?.reference?.handle || pgf.collection_handle?.value || "";
      const collectionTitle = pgf.grid_collection_2?.reference?.title || pgf.heading?.value || null;
      if (ch) collectionHandles.add(ch);
      sec._collectionHandle = ch;
      sec._collectionTitle = collectionTitle;
      const carouselCols: any[] = pgf.lp_product_carousel?.references?.nodes ?? [];
      sec._carouselCollections = carouselCols.map((col: any) => {
        if (col.handle) collectionHandles.add(col.handle);
        return { handle: col.handle, title: col.title };
      });
    }
    if (sec.key === "product_grids" && sec.nodes?.length) {
      sec._gridItems = sec.nodes.map((n: any) => {
        const pgf = Object.fromEntries((n.fields ?? []).map((f: any) => [f.key, f]));
        const ch = pgf.grid_collection_2?.reference?.handle || pgf.collection_handle?.value || "";
        const heading = pgf.heading?.value || pgf.grid_collection_2?.reference?.title || pgf.name?.value || null;
        if (ch) collectionHandles.add(ch);
        const carouselCols: any[] = pgf.lp_product_carousel?.references?.nodes ?? [];
        const carousels = carouselCols.map((col: any) => {
          if (col.handle) collectionHandles.add(col.handle);
          return { handle: col.handle, title: col.title };
        });
        return { node: n, collectionHandle: ch, heading, carousels };
      });
    }
  }

  const productsByHandle: Record<string, ShopifyProduct[]> = {};
  await Promise.all([...collectionHandles].map(async (ch) => {
    try {
      const res = await context.storefront.query(COLLECTION_PRODUCTS_QUERY, { variables: { handle: ch, first: 20 } });
      productsByHandle[ch] = res?.collection?.products?.edges ?? [];
    } catch { productsByHandle[ch] = []; }
  }));

  // Fetch variant prices for featured_product via Storefront API
  let featuredProductVariants: Record<string, any[]> = {};
  for (const sec of lpSections) {
    if (sec.key === "featured_product" && sec.node) {
      const pf = Object.fromEntries((sec.node.fields ?? []).map((f: any) => [f.key, f]));
      const handle = pf.product?.reference?.handle;
      if (handle) {
        try {
          const res = await context.storefront.query(`#graphql
            query FeaturedProduct($handle: String!) {
              product(handle: $handle) {
                variants(first: 20) { nodes {
                  id title availableForSale
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                } }
              }
            }
          `, { variables: { handle } });
          featuredProductVariants[handle] = res?.product?.variants?.nodes ?? [];
        } catch { featuredProductVariants[handle] = []; }
      }
    }
  }

  let reelItems: any[] = [];
  let ytUrlMap: Record<string, string> = {};
  let reviewsHtml = "";

  if (sectionIds.length > 0) {
    const hasReelCarousel = lpSections.some((s: any) => s.key === "reel_carousel");
    const hasReelsYt = lpSections.some((s: any) => s.key === "reels_yt");
    const hasReviews = lpSections.some((s: any) => s.key === "show_reviews");

    await Promise.all([
      hasReelCarousel ? context.adminFetch(`{ nodes: metaobjects(type: "reel_item", first: 50) { nodes { id fields { key value reference { ... on Product { id handle title priceRange { minVariantPrice { amount currencyCode } } featuredImage { url } } ... on Video { id sources { url mimeType } preview { image { url altText } } } } } } } }`)
        .then((d: any) => { reelItems = d?.nodes?.nodes ?? []; })
        .catch(() => {}) : Promise.resolve(),

      hasReelsYt ? context.adminFetch(`{ nodes: metaobjects(type: "youtube_url", first: 50) { nodes { id fields { key value } } } }`)
        .then((d: any) => {
          for (const node of (d?.nodes?.nodes ?? [])) {
            const urlField = (node.fields ?? []).find((f: any) => f.value?.startsWith("http") || f.key === "youtube_url" || f.key === "url");
            if (urlField?.value) ytUrlMap[node.id] = urlField.value;
          }
        })
        .catch(() => {}) : Promise.resolve(),

      hasReviews ? context.adminFetch(`{ shop { reviews0: metafield(namespace: "judgeme", key: "all_reviews_0") { value } } }`)
        .then((d: any) => { reviewsHtml = d?.shop?.reviews0?.value ?? ""; })
        .catch(() => {}) : Promise.resolve(),
    ]);
  }

  return { page, lpSections, productsByHandle, reelItems, ytUrlMap, reviewsHtml, featuredProductVariants };
}

function LpSection({ sec, productsByHandle, reelItems, ytUrlMap, reviewsHtml, featuredProductVariants }: {
  sec: any;
  productsByHandle: Record<string, ShopifyProduct[]>;
  reelItems: any[];
  ytUrlMap: Record<string, string>;
  reviewsHtml: string;
  featuredProductVariants: Record<string, any[]>;
}) {
  switch (sec.key) {
    case "slider":
      return <>{(sec.nodes ?? []).map((n: any) => <LpHeroSlide key={n.id} node={n} />)}</>;
    case "value_banner":
      return sec.node ? <LpValueBannerSection node={sec.node} /> : null;
    case "product_grid": {
      const ch = sec._collectionHandle ?? "";
      const carousels: { handle: string; title: string }[] = sec._carouselCollections ?? [];
      return (
        <>
          <div id="products">
            {ch && <LpProductGridSection fields={sec.node?.fields ?? []} products={productsByHandle[ch] ?? []} headingOverride={sec._collectionTitle ?? sec._collectionName} />}
            {carousels.map((col) => (
              <LpProductCarousel key={col.handle} heading={col.title} products={productsByHandle[col.handle] ?? []} />
            ))}
          </div>
        </>
      );
    }
    case "product_grids": {
      const items: { node: any; collectionHandle: string; heading: string | null; carousels: { handle: string; title: string }[] }[] = sec._gridItems ?? [];
      if (items.length === 0) return null;
      return (
        <>
          {items.map((item, i) => (
            <div key={`grid-${i}`}>
              <div id={i === 0 ? "products" : undefined}>
                {item.collectionHandle && (
                  <LpProductGridSection fields={item.node?.fields ?? []} products={productsByHandle[item.collectionHandle] ?? []} headingOverride={item.heading} />
                )}
                {(item.carousels ?? []).map((col) => (
                  <LpProductCarousel key={col.handle} heading={col.title} products={productsByHandle[col.handle] ?? []} />
                ))}
              </div>
            </div>
          ))}
        </>
      );
    }
    case "icon":
      return <LpIconsSection nodes={sec.nodes ?? []} />;
    case "reel_carousel": {
      const wrapper = (sec.nodes ?? [])[0];
      const wf = Object.fromEntries((wrapper?.fields ?? []).map((f: any) => [f.key, f]));
      return <LpReelsSection
        reelItems={reelItems}
        heading={wf.heading?.value ?? undefined}
        label={wf.label?.value ?? wf.sub_heading?.value}
        sectionId={wf.section_id?.value}
      />;
    }
    case "reels_yt": {
      const reels = (sec.nodes ?? [])
        .map((n: any) => {
          const f = Object.fromEntries((n.fields ?? []).map((x: any) => [x.key, x]));
          const ytUrl = ytUrlMap[f.yt_url?.value ?? ""] ?? null;
          if (!ytUrl) return null;
          return {
            id: n.id,
            title: f.title?.value ?? "",
            youtubeUrl: ytUrl,
            thumbnailUrl: f.thumnail?.reference?.image?.url ?? null,
            sortOrder: parseInt(f.order?.value ?? "0", 10),
          };
        })
        .filter(Boolean)
        .sort((a: any, b: any) => a.sortOrder - b.sortOrder);
      return <YoutubeReelsSection reels={reels} heading={undefined} />;
    }
    case "show_reviews":
      return <LpReviewsCarousel reviewsHtml={reviewsHtml} heading="What Our Customers Say" />;
    case "reviews": {
      const reviewNodes = (sec.nodes ?? []).map((n: any) => {
        const f = Object.fromEntries((n.fields ?? []).map((x: any) => [x.key, x]));
        return {
          id: n.id,
          author: f.author?.value ?? "",
          rating: parseInt(f.rating?.value ?? "5", 10),
          body: f.body?.value ?? "",
          product: f.product_name?.value ?? "",
          date: "",
        };
      }).filter((r: any) => r.body);
      if (reviewNodes.length === 0) return null;
      return <LpReviewsCarousel reviewNodes={reviewNodes} heading="What Our Customers Say" />;
    }
    case "message_banner":
      return <>{(sec.nodes ?? []).map((n: any) => <LpMessageBanner key={n.id} node={n} />)}</>;
    case "certifications":
      return sec.node ? <LpCertificationsSection node={sec.node} /> : null;
    case "cuts_section":
      return sec.node ? <LpCutsSection node={sec.node} /> : null;
    case "featured_product": {
      const pf = Object.fromEntries((sec.node?.fields ?? []).map((f: any) => [f.key, f]));
      const product = pf.product?.reference;
      if (!product) return null;
      // Variants with prices come from Storefront API (Admin API Money is scalar)
      const storefrontVariants = featuredProductVariants[product.handle] ?? [];
      const variants = storefrontVariants.length
        ? storefrontVariants
        : (product.variants?.nodes ?? []).map((v: any) => ({
            id: v.id, title: v.title, availableForSale: v.availableForSale,
            price: { amount: "0", currencyCode: "AED" }, compareAtPrice: null,
          }));
      if (variants.length === 0) return null;
      return <LpFeaturedProduct product={{
        id: product.id,
        title: product.title,
        handle: product.handle,
        featuredImage: product.featuredImage ?? null,
        variants,
      }} />;
    }
    case "sub_banner": {
      const imgUrl = sec.node?.image?.url ?? null;
      if (!imgUrl) return null;
      return (
        <div className="w-full">
          <img
            src={imgUrl}
            alt={sec.node?.image?.altText ?? ""}
            width={sec.node?.image?.width ?? undefined}
            height={sec.node?.image?.height ?? undefined}
            className="w-full h-auto"
          />
        </div>
      );
    }
    default:
      return null;
  }
}

export const meta = ({ data }: { data: any }) => {
  return [
    { title: data?.page?.seo?.title ?? data?.page?.title ?? "Page — MLS UAE" },
    { name: "description", content: data?.page?.seo?.description ?? data?.page?.bodySummary ?? "" },
  ];
};

export default function Page() {
  const { page, lpSections, productsByHandle, reelItems, ytUrlMap, reviewsHtml, featuredProductVariants } = useLoaderData<typeof loader>();

  if (lpSections?.length > 0) {
    return (
      <div className="min-h-screen bg-background">
        {lpSections.map((sec: any, i: number) => (
          <LpSection key={`${sec.key}-${i}`} sec={sec} productsByHandle={productsByHandle} reelItems={reelItems ?? []} ytUrlMap={ytUrlMap ?? {}} reviewsHtml={reviewsHtml ?? ""} featuredProductVariants={featuredProductVariants ?? {}} />
        ))}

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-12 md:px-8 md:py-16">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
          <span>/</span>
          <span className="text-foreground">{page.title}</span>
        </nav>

        {/* Title */}
        <h1 className="font-display mb-10 text-3xl font-extrabold text-foreground md:text-4xl">
          {page.title}
        </h1>

        {/* Content */}
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

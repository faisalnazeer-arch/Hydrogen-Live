import type { LoaderFunctionArgs, MetaFunction } from "@shopify/remix-oxygen";
import { useLoaderData } from "react-router";
import { HeroBanner } from "../components/home/HeroBanner";
import { TrustBadges } from "../components/home/TrustBadges";
import { FeaturedCollections } from "../components/home/FeaturedCollections";
import { PriceRangeShop } from "../components/home/PriceRangeShop";
import { PromoSideBySide } from "../components/home/PromoSideBySide";
import { CategorySection } from "../components/home/CategorySection";
import { ShopByCategory } from "../components/home/ShopByCategory";
import { ShopByCuts } from "../components/home/ShopByCuts";
import { ShopByOrigin } from "../components/home/ShopByOrigin";
import { ValueBoxesBanner } from "../components/home/ValueBoxesBanner";
import { RecentlyViewed } from "../components/home/RecentlyViewed";
import { ReelsCarousel } from "../components/home/ReelsCarousel";

const HOME_QUERY = `#graphql
  query HomeData {
    heroBanners: metaobjects(type: "hero_banner", first: 10) {
      nodes {
        id
        fields {
          key
          value
          type
          reference {
            ... on MediaImage {
              image { url altText width height }
            }
          }
        }
      }
    }
    trustBadges: metaobjects(type: "icon_with_text", first: 10) {
      nodes {
        id
        fields {
          key
          value
          reference {
            ... on MediaImage {
              image { url }
            }
          }
        }
      }
    }
    featuredCollections: metaobjects(type: "featured_collection", first: 10) {
      nodes {
        id
        fields {
          key
          value
          reference {
            ... on Collection {
              handle
              title
              products(first: 12) {
                edges {
                  node {
                    id
                    title
                    handle
                    availableForSale
                    priceRange {
                      minVariantPrice { amount currencyCode }
                      maxVariantPrice { amount currencyCode }
                    }
                    compareAtPriceRange { minVariantPrice { amount currencyCode } }
                    images(first: 4) { edges { node { url altText width height } } }
                    variants(first: 20) {
                      edges {
                        node {
                          id
                          title
                          price { amount currencyCode }
                          compareAtPrice { amount currencyCode }
                          availableForSale
                          selectedOptions { name value }
                        }
                      }
                    }
                    options { name values }
                    tags
                    vendor
                    productType
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

// ── Types ──────────────────────────────────────────────────────────────────

import type { ShopifyProduct } from "../lib/shopify";

interface FeaturedCollectionEntry {
  id: string;
  handle: string;
  title: string;
  subTitle: string | undefined;
  products: ShopifyProduct[];
}

function parseFeaturedCollections(nodes: any[]): FeaturedCollectionEntry[] {
  return nodes
    .map((node) => {
      const fieldMap = Object.fromEntries(
        node.fields.map((f: any) => [f.key, f]),
      );
      const collection = fieldMap["collection"]?.reference;
      if (!collection?.handle) return null;
      return {
        id: node.id,
        handle: collection.handle as string,
        title: (fieldMap["title"]?.value ?? collection.title ?? "") as string,
        subTitle: (fieldMap["sub_title"]?.value ?? undefined) as string | undefined,
        products: (collection.products?.edges ?? []) as ShopifyProduct[],
      };
    })
    .filter((e): e is FeaturedCollectionEntry => e !== null);
}

export const meta: MetaFunction = () => [
  { title: "MLS UAE — Premium Meats" },
  { name: "description", content: "Premium Wagyu, Angus, lamb and more — delivered." },
];

// Fallback sections shown when no metaobject entries exist (no products — CategorySection will client-fetch)
const FALLBACK_COLLECTIONS: FeaturedCollectionEntry[] = [
  { id: "f1", handle: "all-beef", title: "Premium Beef", subTitle: "The butcher's selection", products: [] },
  { id: "f2", handle: "all-lamb", title: "Lamb & Mutton", subTitle: "Tender, fresh, halal", products: [] },
  { id: "f3", handle: "australian-wagyu-beef-mb-4-5", title: "Australian Wagyu", subTitle: "Marbling MB 4/5", products: [] },
];

export async function loader({ context }: LoaderFunctionArgs) {
  const data = await context.storefront.query(HOME_QUERY);
  const parsed = parseFeaturedCollections(data?.featuredCollections?.nodes ?? []);
  return {
    heroSlides: data?.heroBanners?.nodes ?? [],
    trustBadges: data?.trustBadges?.nodes ?? [],
    featuredCollections: parsed.length > 0 ? parsed : FALLBACK_COLLECTIONS,
  };
}

export default function Home() {
  const { heroSlides, trustBadges, featuredCollections } = useLoaderData<typeof loader>();
  return (
    <>
      <HeroBanner slides={heroSlides} />
      <TrustBadges badges={trustBadges} />
      <FeaturedCollections />
      <PriceRangeShop />
      <PromoSideBySide />
      {featuredCollections.map((fc) => (
        <CategorySection
          key={fc.id}
          handle={fc.handle}
          title={fc.title}
          subtitle={fc.subTitle}
          products={fc.products}
        />
      ))}
      <ReelsCarousel />
      <ShopByCategory />
      <ShopByCuts />
      <ShopByOrigin />
      <ValueBoxesBanner />
      <RecentlyViewed />
    </>
  );
}

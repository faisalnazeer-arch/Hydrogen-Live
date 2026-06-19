import type { LoaderFunctionArgs, MetaFunction } from "@shopify/remix-oxygen";
import { useLoaderData } from "react-router";
import { SearchAutosuggest } from "~/components/layout/SearchAutosuggest";
import { ProductCard } from "~/components/product/ProductCard";
import type { ShopifyProduct } from "~/lib/shopify";

// Uses Shopify's dedicated search API — same relevance engine as predictiveSearch
const SEARCH_QUERY = `#graphql
  fragment SearchProduct on Product {
    id
    title
    description
    handle
    tags
    vendor
    productType
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
    metafields(identifiers: [
      {namespace: "reviews", key: "rating"}
      {namespace: "reviews", key: "rating_count"}
    ]) { key value }
  }
  query Search(
    $query: String!
    $first: Int!
    $language: LanguageCode
    $country: CountryCode
  ) @inContext(language: $language, country: $country) {
    search(query: $query, first: $first, types: [PRODUCT]) {
      totalCount
      nodes {
        ... on Product { ...SearchProduct }
      }
    }
  }
` as const;

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  if (!q) return { q, products: [] as ShopifyProduct[], total: 0 };

  const data = await context.storefront.query(SEARCH_QUERY, {
    variables: { query: q, first: 24, language: "EN" as const, country: "AE" as const },
  });

  const products: ShopifyProduct[] = (data?.search?.nodes ?? [])
    .filter((node: any) => parseFloat(node.priceRange?.minVariantPrice?.amount ?? "0") > 0)
    .map((node: any) => ({ node }));
  return { q, products, total: products.length };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data?.q ? `Search: "${data.q}" — MLS` : "Search — MLS" },
];

export default function Search() {
  const { q, products, total } = useLoaderData<typeof loader>();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 font-display text-2xl font-extrabold md:text-3xl">
          {q ? (
            <>Results for <span className="text-crimson">"{q}"</span></>
          ) : (
            "Search"
          )}
        </h1>
        <div className="max-w-xl">
          <SearchAutosuggest defaultQuery={q} />
        </div>
      </div>

      {q && (
        <p className="mb-6 text-sm text-muted-foreground">
          {total === 0
            ? "No products found"
            : `${total} product${total !== 1 ? "s" : ""} found`}
        </p>
      )}

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.node.id} product={product} />
          ))}
        </div>
      ) : q ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold">No results for "{q}"</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try different keywords or browse our collections
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <p>Type something above to search products</p>
        </div>
      )}
    </main>
  );
}

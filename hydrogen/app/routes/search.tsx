import type { LoaderFunctionArgs, MetaFunction } from "@shopify/remix-oxygen";
import { useLoaderData, Link, Form } from "react-router";

const SEARCH_QUERY = `#graphql
  query Search($query: String!, $first: Int!) {
    products(first: $first, query: $query) {
      nodes {
        id title handle
        featuredImage { url altText }
        priceRange { minVariantPrice { amount currencyCode } }
      }
    }
  }
` as const;

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  if (!q) return { q, products: [] };
  const data = await context.storefront.query(SEARCH_QUERY, {
    variables: { query: q, first: 24 },
  });
  return { q, products: data.products.nodes };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data?.q ? `Search: ${data.q}` : "Search" },
];

export default function Search() {
  const { q, products } = useLoaderData<typeof loader>();
  return (
    <main className="container mx-auto px-4 py-8">
      <Form method="get">
        <input name="q" defaultValue={q} className="w-full rounded border px-4 py-2" placeholder="Search products" />
      </Form>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p: any) => (
          <Link key={p.id} to={`/products/${p.handle}`} className="block rounded border p-3">
            <div className="text-sm font-semibold">{p.title}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}

import type { LoaderFunctionArgs } from "@shopify/remix-oxygen";

const SITE_URL = "https://mlsuae.ae";

const PRODUCTS_QUERY = `#graphql
  query SitemapProducts($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: UPDATED_AT) {
      pageInfo { hasNextPage endCursor }
      nodes { handle updatedAt }
    }
  }
` as const;

const COLLECTIONS_QUERY = `#graphql
  query SitemapCollections($first: Int!, $after: String) {
    collections(first: $first, after: $after, sortKey: UPDATED_AT) {
      pageInfo { hasNextPage endCursor }
      nodes { handle updatedAt }
    }
  }
` as const;

const PAGES_QUERY = `#graphql
  query SitemapPages($first: Int!, $after: String) {
    pages(first: $first, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { handle updatedAt }
    }
  }
` as const;

const BLOGS_QUERY = `#graphql
  query SitemapBlogs($first: Int!) {
    blogs(first: $first) {
      nodes {
        handle
        articles(first: 250) {
          nodes { handle publishedAt }
        }
      }
    }
  }
` as const;

async function paginate<T>(
  fetcher: (after: string | null) => Promise<{ pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: T[] }>,
): Promise<T[]> {
  const all: T[] = [];
  let after: string | null = null;
  do {
    const result = await fetcher(after);
    all.push(...result.nodes);
    if (!result.pageInfo.hasNextPage) break;
    after = result.pageInfo.endCursor;
  } while (true);
  return all;
}

function loc(path: string) {
  return `<loc>${SITE_URL}${path}</loc>`;
}

function urlEntry(path: string, lastmod?: string, changefreq = "weekly", priority = "0.7") {
  return [
    "  <url>",
    `    ${loc(path)}`,
    lastmod ? `    <lastmod>${lastmod.slice(0, 10)}</lastmod>` : "",
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function loader({ context }: LoaderFunctionArgs) {
  const { storefront } = context;

  const [products, collections, pages, blogsData] = await Promise.all([
    paginate<{ handle: string; updatedAt: string }>((after) =>
      storefront
        .query(PRODUCTS_QUERY, { variables: { first: 250, after } })
        .then((d: any) => d.products),
    ),
    paginate<{ handle: string; updatedAt: string }>((after) =>
      storefront
        .query(COLLECTIONS_QUERY, { variables: { first: 250, after } })
        .then((d: any) => d.collections),
    ),
    paginate<{ handle: string; updatedAt: string }>((after) =>
      storefront
        .query(PAGES_QUERY, { variables: { first: 250, after } })
        .then((d: any) => d.pages),
    ),
    storefront
      .query(BLOGS_QUERY, { variables: { first: 50 } })
      .then((d: any) => d.blogs?.nodes ?? []),
  ]);

  const entries: string[] = [
    urlEntry("/", undefined, "daily", "1.0"),
    urlEntry("/collections", undefined, "weekly", "0.8"),
    urlEntry("/blogs/all", undefined, "daily", "0.8"),
  ];

  for (const p of products) {
    entries.push(urlEntry(`/products/${p.handle}`, p.updatedAt, "weekly", "0.8"));
  }

  for (const c of collections) {
    entries.push(urlEntry(`/collections/${c.handle}`, c.updatedAt, "weekly", "0.7"));
  }

  const EXCLUDED_PAGES = new Set([
    "404", "password", "checkout", "account", "cart", "search",
  ]);
  for (const p of pages) {
    if (EXCLUDED_PAGES.has(p.handle)) continue;
    entries.push(urlEntry(`/pages/${p.handle}`, p.updatedAt, "monthly", "0.5"));
  }

  for (const blog of blogsData) {
    for (const article of blog.articles?.nodes ?? []) {
      entries.push(urlEntry(`/blogs/${blog.handle}/${article.handle}`, article.publishedAt, "monthly", "0.6"));
    }
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
  ].join("\n");

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

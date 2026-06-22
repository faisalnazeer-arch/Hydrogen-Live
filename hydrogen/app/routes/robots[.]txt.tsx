import type { LoaderFunctionArgs } from "@shopify/remix-oxygen";

export async function loader({ request }: LoaderFunctionArgs) {
  const host = new URL(request.url).origin;
  const body = [
    "User-agent: *",
    "Allow: /",
    "",
    "Disallow: /cart",
    "Disallow: /checkout",
    "Disallow: /account",
    "Disallow: /admin",
    "Disallow: /search",
    "Disallow: /apps/",
    "Disallow: /api/",
    "",
    `Sitemap: ${host}/sitemap.xml`,
  ].join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

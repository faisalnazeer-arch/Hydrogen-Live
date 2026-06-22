import type { LoaderFunctionArgs } from "@shopify/remix-oxygen";

const PRODUCTION_HOST = "mlsuae.ae";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const isProduction = url.hostname === PRODUCTION_HOST;

  const body = isProduction
    ? [
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
        `Sitemap: https://${PRODUCTION_HOST}/sitemap.xml`,
      ].join("\n")
    : [
        "User-agent: *",
        "Disallow: /",
      ].join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

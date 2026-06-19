import { redirect } from "@shopify/remix-oxygen";
import type { LoaderFunctionArgs } from "@shopify/remix-oxygen";

// Handles any /ar/* URL: sets lang=ar cookie and redirects to the locale-free path.
// This ensures old mlsuae.ae /ar/ deep-links and bookmarks continue to work on Hydrogen.
export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const rest = (params as Record<string, string>)["*"] ?? "";
  const newPath = rest ? `/${rest}` : "/";

  return redirect(`${newPath}${url.search}`, {
    status: 302,
    headers: {
      "Set-Cookie": "lang=ar; Path=/; Max-Age=31536000; SameSite=Lax",
    },
  });
}

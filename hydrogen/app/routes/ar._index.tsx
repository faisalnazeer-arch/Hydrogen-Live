import { redirect } from "@shopify/remix-oxygen";
import type { LoaderFunctionArgs } from "@shopify/remix-oxygen";

// Handles /ar (no trailing slash) — sets lang=ar cookie and redirects to home.
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  return redirect(`/${url.search}`, {
    status: 302,
    headers: {
      "Set-Cookie": "lang=ar; Path=/; Max-Age=31536000; SameSite=Lax",
    },
  });
}

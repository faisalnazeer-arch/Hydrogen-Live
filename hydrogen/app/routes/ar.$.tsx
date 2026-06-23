import { redirect } from "@shopify/remix-oxygen";
import type { LoaderFunctionArgs } from "@shopify/remix-oxygen";

// Map of Arabic URL slugs Shopify generates → English equivalents.
// Needed for bookmarks / external links that use translated handles.
const ARABIC_SLUG_MAP: Record<string, string> = {
  // pages
  "الأسئلة-الشائعة": "faqs",
  "اتصل-بنا": "contact-us",
  "قصتنا": "our-story-new",
  "معلومات-التوصيل": "delivery-info",
  "سياسة-الاسترداد": "refund-exchange",
  "المكافآت": "rewards",
  "mls-المكافآت": "mls-rewards",
  "جميع-المقالات": "all-blog",
  "أحل-صديقا": "refer-a-friend",
  "الاشتراكات": "subscriptions",
  "الاشتراك": "subscription",
  "سياسة-الاشتراك": "subscription-policy",
  "mls-الذواقة": "mls-gourmet",
  "mls-شريك": "mls-affiliate",
  "آراء-العملاء": "customer-reviews",
  // collections
  "لحم-بقري": "all-beef",
  "ضأن-وخروف": "all-lamb",
  "دجاج": "all-chicken",
  "صناديق-القيمة": "value-boxes",
  // blogs
  "جميع-المدونات": "all",
};

function resolveSlug(slug: string): string {
  // Try exact match first, then decoded version
  return ARABIC_SLUG_MAP[slug] ?? ARABIC_SLUG_MAP[decodeURIComponent(slug)] ?? slug;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  // Strip /ar prefix, then resolve each path segment
  const stripped = url.pathname.replace(/^\/ar/, "") || "/";
  const resolved = stripped.replace(/\/([^/]+)/g, (_, seg) => `/${resolveSlug(seg)}`);

  return redirect(`${resolved}${url.search}`, {
    status: 302,
    headers: {
      "Set-Cookie": "lang=ar; Path=/; Max-Age=31536000; SameSite=Lax",
    },
  });
}

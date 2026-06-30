import type { ActionFunctionArgs } from "@shopify/remix-oxygen";

// Footer newsletter signup → subscribes the email to the "Main Newsletter" list in Klaviyo,
// which triggers the 10%-off welcome flow. Uses Klaviyo's public client API (company id only,
// no secret key) — the same approach as api.back-in-stock.tsx.
const KLAVIYO_COMPANY_ID = "RibCBS";
const NEWSLETTER_LIST_ID = "SvR7d7"; // Klaviyo list: "Main Newsletter"

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://a.klaviyo.com/client/subscriptions/?company_id=${KLAVIYO_COMPANY_ID}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", revision: "2024-10-15" },
        body: JSON.stringify({
          data: {
            type: "subscription",
            attributes: {
              custom_source: "Footer Newsletter",
              profile: {
                data: {
                  type: "profile",
                  attributes: {
                    email,
                    subscriptions: { email: { marketing: { consent: "SUBSCRIBED" } } },
                  },
                },
              },
            },
            relationships: {
              list: { data: { type: "list", id: NEWSLETTER_LIST_ID } },
            },
          },
        }),
      }
    );

    // The client subscriptions endpoint returns 202 Accepted (no body) on success.
    if (!res.ok) {
      const errText = await res.text();
      console.error("Klaviyo newsletter subscribe error:", res.status, errText);
      // TEMP DEBUG: surface the exact Klaviyo error so we can diagnose on staging.
      return Response.json(
        { error: `Klaviyo ${res.status}: ${errText.slice(0, 400)}` },
        { status: 502 }
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Klaviyo newsletter subscribe failed:", err);
    return Response.json({ error: "Network error. Please try again." }, { status: 502 });
  }
}

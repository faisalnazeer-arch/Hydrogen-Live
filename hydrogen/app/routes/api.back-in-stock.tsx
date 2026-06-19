import type { ActionFunctionArgs } from "@shopify/remix-oxygen";

const KLAVIYO_COMPANY_ID = "RibCBS";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  let body: { name?: string; email?: string; variantId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, variantId } = body;

  if (!email || !variantId) {
    return Response.json({ error: "Email and variantId are required" }, { status: 400 });
  }

  // Extract numeric ID from GID: "gid://shopify/ProductVariant/12345678" → "12345678"
  const numericVariantId = variantId.split("/").pop();
  if (!numericVariantId) {
    return Response.json({ error: "Invalid variantId" }, { status: 400 });
  }

  const klaviyoPayload = {
    data: {
      type: "back-in-stock-subscription",
      attributes: {
        channels: ["EMAIL"],
        profile: {
          data: {
            type: "profile",
            attributes: {
              email,
            },
          },
        },
      },
      relationships: {
        variant: {
          data: {
            type: "catalog-variant",
            id: `$shopify:::$default:::${numericVariantId}`,
          },
        },
      },
    },
  };

  try {
    const res = await fetch(
      `https://a.klaviyo.com/client/back-in-stock-subscriptions/?company_id=${KLAVIYO_COMPANY_ID}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          revision: "2024-02-15",
        },
        body: JSON.stringify(klaviyoPayload),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Klaviyo back-in-stock error:", res.status, errText);
      return Response.json(
        { error: "Could not register notification. Please try again." },
        { status: 502 }
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Klaviyo fetch failed:", err);
    return Response.json({ error: "Network error. Please try again." }, { status: 502 });
  }
}

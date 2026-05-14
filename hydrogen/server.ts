// Oxygen entry point for the Hydrogen app.
import {
  createCartHandler,
  createCustomerAccountClient,
  createStorefrontClient,
  cartGetIdDefault,
  cartSetIdDefault,
} from "@shopify/hydrogen";
import {
  createRequestHandler,
  getStorefrontHeaders,
} from "@shopify/remix-oxygen";
import { AppSession } from "~/lib/session";

export default {
  async fetch(
    request: Request,
    env: Env,
    executionContext: ExecutionContext
  ): Promise<Response> {
    try {
      const waitUntil = executionContext.waitUntil.bind(executionContext);
      const [cache, session] = await Promise.all([
        caches.open("hydrogen"),
        AppSession.init(request, [env.SESSION_SECRET]),
      ]);

      const langCookie = request.headers.get("Cookie")?.match(/(?:^|;\s*)lang=([a-z]{2})/)?.[1];
      const language = langCookie === "ar" ? "AR" : "EN";

      const { storefront } = createStorefrontClient({
        cache,
        waitUntil,
        i18n: { language: language as "EN" | "AR", country: "AE" },
        publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
        privateStorefrontToken: env.PRIVATE_STOREFRONT_API_TOKEN,
        storeDomain: env.PUBLIC_STORE_DOMAIN,
        storefrontId: env.PUBLIC_STOREFRONT_ID,
        storefrontHeaders: getStorefrontHeaders(request) as any,
        storefrontApiVersion: env.PUBLIC_STOREFRONT_API_VERSION || "2025-07",
      });

      const customerAccount = createCustomerAccountClient({
        waitUntil,
        request,
        session,
        customerAccountId: env.PUBLIC_CUSTOMER_ACCOUNT_CLIENT_ID,
        shopId: env.PUBLIC_CUSTOMER_ACCOUNT_API_URL.split("/").pop() ?? "",
      } as any);

      const cart = createCartHandler({
        storefront,
        customerAccount,
        getCartId: cartGetIdDefault(request.headers),
        setCartId: cartSetIdDefault(),
      });

      const handleRequest = createRequestHandler({
        // @ts-expect-error virtual module resolved at build time
        build: await import("virtual:react-router/server-build"),
        mode: process.env.NODE_ENV,
        getLoadContext: () => ({
          session,
          storefront,
          customerAccount,
          cart,
          env,
          waitUntil,
        }),
      });

      const response = await handleRequest(request);

      if (session.isPending) {
        response.headers.set("Set-Cookie", await session.commit());
      }
      return response;
    } catch (error) {
      console.error(error);
      return new Response("An unexpected error occurred", { status: 500 });
    }
  },
};

/// <reference types="@shopify/remix-oxygen" />
/// <reference types="@shopify/oxygen-workers-types" />

import type { Storefront, CustomerAccount, HydrogenCart, HydrogenSessionData } from "@shopify/hydrogen";
import type { AppSession } from "~/lib/session";

declare global {
  interface Env extends HydrogenEnv {
    SESSION_SECRET: string;
    PUBLIC_STOREFRONT_API_TOKEN: string;
    PRIVATE_STOREFRONT_API_TOKEN?: string;
    PUBLIC_STORE_DOMAIN: string;
    PUBLIC_STOREFRONT_ID?: string;
    PUBLIC_STOREFRONT_API_VERSION: string;
    PUBLIC_CUSTOMER_ACCOUNT_CLIENT_ID: string;
    PUBLIC_CUSTOMER_ACCOUNT_API_URL: string;
    PUBLIC_CHECKOUT_DOMAIN: string;
  }
}

declare module "@shopify/remix-oxygen" {
  interface AppLoadContext {
    env: Env;
    cart: HydrogenCart;
    storefront: Storefront;
    customerAccount: CustomerAccount;
    session: AppSession;
    waitUntil: ExecutionContext["waitUntil"];
  }
}

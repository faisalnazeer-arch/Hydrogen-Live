import type { LoaderFunctionArgs } from "@shopify/remix-oxygen";
import { Outlet, useLoaderData } from "react-router";

const CUSTOMER_QUERY = `#graphql
  query Customer {
    customer { id firstName lastName emailAddress { emailAddress } }
  }
` as const;

export async function loader({ context }: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus();
  const { data } = await context.customerAccount.query(CUSTOMER_QUERY);
  return { customer: data.customer };
}

export default function AccountLayout() {
  const { customer } = useLoaderData<typeof loader>();
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-extrabold">
        Hi {customer.firstName ?? customer.emailAddress?.emailAddress}
      </h1>
      <Outlet />
    </main>
  );
}

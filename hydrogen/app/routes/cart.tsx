import type { ActionFunctionArgs, LoaderFunctionArgs } from "@shopify/remix-oxygen";
import { data } from "react-router";
import { CartForm, type CartQueryDataReturn } from "@shopify/hydrogen";
import { useLoaderData } from "react-router";

export async function action({ request, context }: ActionFunctionArgs) {
  const { cart } = context;
  const formData = await request.formData();
  const { action, inputs } = CartForm.getFormInput(formData);
  if (!action) throw new Error("No cart action provided");

  let result: CartQueryDataReturn;
  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    default:
      throw new Error(`${action} cart action not defined`);
  }

  const headers = result.cart?.id ? cart.setCartId(result.cart.id) : new Headers();
  return data({ cart: result.cart ?? null, errors: result.errors ?? [] }, { headers });
}

export async function loader({ context }: LoaderFunctionArgs) {
  return { cart: await context.cart.get() };
}

export default function CartPage() {
  const { cart } = useLoaderData<typeof loader>();
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-extrabold">Cart</h1>
      <pre className="mt-4 overflow-auto text-xs">{JSON.stringify(cart, null, 2)}</pre>
      {cart?.checkoutUrl && (
        <a href={cart.checkoutUrl} className="mt-6 inline-block rounded bg-black px-6 py-3 text-white">
          Checkout
        </a>
      )}
    </main>
  );
}

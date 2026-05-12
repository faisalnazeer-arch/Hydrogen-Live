import { Form } from "react-router";

export default function AccountIndex() {
  return (
    <div className="mt-6">
      <Form method="post" action="/account/logout">
        <button type="submit" className="rounded border px-4 py-2">Sign out</button>
      </Form>
    </div>
  );
}

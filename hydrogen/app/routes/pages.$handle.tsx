import type { LoaderFunctionArgs, MetaFunction } from "@shopify/remix-oxygen";
import { useLoaderData } from "react-router";
import { Link } from "react-router";

const PAGE_QUERY = `#graphql
  query Page($handle: String!, $language: LanguageCode)
  @inContext(language: $language) {
    page(handle: $handle) {
      id
      title
      body
      bodySummary
      seo {
        title
        description
      }
    }
  }
` as const;

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const { handle } = params;
  if (!handle) throw new Response("Not found", { status: 404 });

  const lang = request.headers.get("Cookie")?.match(/(?:^|;\s*)lang=([a-z]{2})/)?.[1];
  const language = lang === "ar" ? "AR" : "EN";

  const { page } = await context.storefront.query(PAGE_QUERY, {
    variables: { handle, language },
  });

  if (!page) throw new Response(`Page "${handle}" not found`, { status: 404 });

  return { page };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.page?.seo?.title ?? data?.page?.title ?? "Page — MLS UAE" },
    { name: "description", content: data?.page?.seo?.description ?? data?.page?.bodySummary ?? "" },
  ];
};

export default function Page() {
  const { page } = useLoaderData<typeof loader>();

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <div className="border-b border-border bg-card py-10">
        <div className="container mx-auto px-4">
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{page.title}</span>
          </nav>
          <h1 className="font-display text-3xl font-extrabold md:text-4xl">{page.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-10">
        <div
          className="prose prose-sm max-w-3xl md:prose-base
            prose-headings:font-display prose-headings:font-bold
            prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-strong:text-foreground prose-strong:font-semibold
            prose-a:text-crimson prose-a:no-underline hover:prose-a:underline
            prose-li:text-muted-foreground
            prose-hr:border-border"
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      </div>
    </div>
  );
}

import type { LoaderFunctionArgs, MetaFunction } from "@shopify/remix-oxygen";
import { useLoaderData, Link } from "react-router";
import { Calendar, User, ArrowLeft, Tag } from "lucide-react";

const ARTICLE_QUERY = `#graphql
  query Article($blogHandle: String!, $articleHandle: String!, $language: LanguageCode)
  @inContext(language: $language) {
    blog(handle: $blogHandle) {
      handle title
      articleByHandle(handle: $articleHandle) {
        handle title contentHtml publishedAt tags
        excerpt
        author { name }
        image { url altText width height }
        seo { title description }
      }
    }
  }
` as const;

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const { blogHandle, articleHandle } = params;
  if (!blogHandle || !articleHandle) throw new Response("Not found", { status: 404 });

  const lang = request.headers.get("Cookie")?.match(/(?:^|;\s*)lang=([a-z]{2})/)?.[1];
  const language = (lang === "ar" ? "AR" : "EN") as "AR" | "EN";

  const { blog } = await context.storefront.query(ARTICLE_QUERY, {
    variables: { blogHandle, articleHandle, language },
  });

  if (!blog?.articleByHandle) throw new Response("Article not found", { status: 404 });
  return { blog, article: blog.articleByHandle };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: `${data?.article?.seo?.title ?? data?.article?.title ?? "Article"} — MLS UAE` },
  { name: "description", content: data?.article?.seo?.description ?? data?.article?.excerpt ?? "" },
  ...(data?.article?.image ? [{ property: "og:image", content: data.article.image.url }] : []),
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AE", { year: "numeric", month: "long", day: "numeric" });
}

export default function ArticlePage() {
  const { blog, article } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-background">

      {/* Hero image */}
      {article.image && (
        <div className="relative h-[280px] overflow-hidden bg-muted md:h-[420px]">
          <img
            src={article.image.url}
            alt={article.image.altText ?? article.title}
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        </div>
      )}

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-3xl">

          {/* Back link */}
          <Link
            to={`/blogs/${blog.handle}`}
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-crimson transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to {blog.title}
          </Link>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 rounded-full bg-crimson/10 px-3 py-1 text-[11px] font-semibold text-crimson">
                  <Tag className="h-2.5 w-2.5" /> {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="font-display text-3xl font-extrabold leading-tight text-foreground md:text-4xl lg:text-5xl">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="mt-4 mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-b border-border pb-6">
            {article.author?.name && (
              <span className="flex items-center gap-1.5">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-crimson/10 text-xs font-bold text-crimson">
                  {article.author.name.charAt(0).toUpperCase()}
                </span>
                {article.author.name}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(article.publishedAt)}
            </span>
          </div>

          {/* Article body */}
          <div
            className="prose prose-base max-w-none
              prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-neutral-600 prose-p:leading-relaxed
              prose-strong:text-foreground prose-strong:font-semibold
              prose-a:text-crimson prose-a:no-underline hover:prose-a:underline
              prose-li:text-neutral-600 prose-li:leading-relaxed
              prose-img:rounded-xl prose-img:shadow-md
              prose-blockquote:border-crimson prose-blockquote:text-neutral-500
              prose-hr:border-border"
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />

          {/* Footer */}
          <div className="mt-12 flex items-center justify-between border-t border-border pt-8">
            <Link
              to={`/blogs/${blog.handle}`}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-crimson hover:text-crimson"
            >
              <ArrowLeft className="h-4 w-4" /> More articles
            </Link>
            <Link
              to="/collections/all"
              className="inline-flex items-center gap-2 rounded-lg bg-crimson px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-rich-red"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

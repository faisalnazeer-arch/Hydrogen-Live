import type { LoaderFunctionArgs, MetaFunction } from "@shopify/remix-oxygen";
import { useLoaderData } from "react-router";
import { FaqAccordion } from "@/components/ui/FaqAccordion";

export const meta: MetaFunction = () => [
  { title: "Subscription Policy — MLS UAE" },
  { name: "description", content: "MLS subscription policies covering fair usage, delivery, payments, refunds and more." },
];

const PAGE_QUERY = `{
  page: metaobjects(type: "mls_subscription_policy", first: 1) {
    nodes {
      fields {
        key
        value
        reference {
          ... on MediaImage {
            image { url altText }
          }
        }
        references(first: 20) {
          nodes {
            ... on Metaobject {
              id
              fields { key value }
            }
          }
        }
      }
    }
  }
}`;

export async function loader({ context }: LoaderFunctionArgs) {
  const data = await context.adminFetch(PAGE_QUERY);
  const node = data?.page?.nodes?.[0];
  const f = Object.fromEntries((node?.fields ?? []).map((x: any) => [x.key, x]));

  const policyItems = (f.policy_items?.references?.nodes ?? []).map((n: any) => {
    const pf = Object.fromEntries(n.fields.map((x: any) => [x.key, x.value]));
    return { id: n.id, question: pf.question ?? "", answer: pf.answer ?? "" };
  });

  return {
    heroTitle:      f.hero_title?.value                   ?? "MLS SUBSCRIPTION POLICIES",
    heroImage:      f.hero_image?.reference?.image?.url   ?? "",
    policyItems,
    ctaTitle:       f.cta_title?.value                    ?? "Get in touch",
    ctaSubtitle:    f.cta_subtitle?.value                 ?? "Have questions about your order, or a general enquiry?",
    ctaButtonLabel: f.cta_button_label?.value             ?? "Contact us",
    ctaButtonUrl:   f.cta_button_url?.value               ?? "https://wa.me/971504516403",
  };
}

export default function SubscriptionPolicyPage() {
  const { heroTitle, heroImage, policyItems, ctaTitle, ctaSubtitle, ctaButtonLabel, ctaButtonUrl } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── Hero Banner ── */}
      <div className="relative w-full overflow-hidden" style={{ height: "clamp(240px, 35vw, 480px)" }}>
        {heroImage && (
          <img
            src={heroImage}
            alt={heroTitle}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="bg-white px-8 py-6 text-center shadow-lg mx-4" style={{ maxWidth: 420 }}>
            <h1 className="font-display text-xl font-extrabold uppercase leading-tight tracking-wide text-gray-900 sm:text-2xl md:text-3xl">
              {heroTitle}
            </h1>
          </div>
        </div>
      </div>

      {/* ── Policy Accordion ── */}
      {policyItems.length > 0 && (
        <section className="py-10 md:py-14">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <FaqAccordion items={policyItems} />
          </div>
        </section>
      )}

      {/* ── Get in Touch CTA ── */}
      <section className="py-12 md:py-16 text-center" style={{ background: "#fce8e8" }}>
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h2 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">{ctaTitle}</h2>
          <p className="mt-3 text-base text-gray-700 sm:text-lg">{ctaSubtitle}</p>
          <div className="mt-8">
            <a
              href={ctaButtonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-md px-8 py-3 text-sm font-bold text-white shadow transition-opacity hover:opacity-90"
              style={{ background: "#a70a10" }}
            >
              {ctaButtonLabel}
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}


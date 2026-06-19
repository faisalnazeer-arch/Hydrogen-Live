import { ValueBoxesBanner, type ValueBannerData } from "~/components/home/ValueBoxesBanner";

function getField(fields: any[], key: string): string | null {
  return fields?.find((f: any) => f.key === key)?.value ?? null;
}

function getImageUrl(fields: any[], key: string): string | null {
  return fields?.find((f: any) => f.key === key)?.reference?.image?.url ?? null;
}

export function LpValueBannerSection({ node }: { node: any }) {
  if (!node) return null;
  const f: any[] = node.fields ?? [];

  // mls_value_banner: single image field — render as full-width banner image
  const hasRichFields = f.some((x: any) =>
    ["eyebrow", "heading", "body", "btn1_label", "btn2_label"].includes(x.key)
  );
  if (!hasRichFields) {
    const imgUrl = getImageUrl(f, "image") ?? getImageUrl(f, "background_image");
    if (!imgUrl) return null;
    return (
      <section className="w-full">
        <img src={imgUrl} alt="" className="w-full" loading="lazy" />
      </section>
    );
  }

  // Rich value banner with text + CTA
  const banner: ValueBannerData = {
    eyebrow: getField(f, "eyebrow") ?? "",
    heading: getField(f, "heading") ?? "",
    body: getField(f, "body") ?? "",
    btn1Label: getField(f, "btn1_label") ?? getField(f, "cta_text") ?? "",
    btn1Link: getField(f, "btn1_link") ?? getField(f, "cta_url") ?? "",
    btn2Label: getField(f, "btn2_label") ?? "",
    btn2Link: getField(f, "btn2_link") ?? "",
    imageUrl: getImageUrl(f, "image") ?? getImageUrl(f, "background_image") ?? null,
    imageAlt: getField(f, "image_alt") ?? getField(f, "heading") ?? "",
  };

  return <ValueBoxesBanner banner={banner} />;
}
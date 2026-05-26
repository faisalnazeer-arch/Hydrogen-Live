import type { LoaderFunctionArgs } from "@shopify/remix-oxygen";

export interface GloboOption {
  id: string;
  name: string;
  type: "text" | "textarea" | "dropdown" | "radio" | "checkbox" | "swatch" | "image_swatch" | "date" | "number" | "file";
  required: boolean;
  placeholder?: string;
  values?: Array<{
    label: string;
    value: string;
    color?: string;
    image?: string;
  }>;
  min_value?: number;
  max_value?: number;
  position: number;
}

export interface GloboOptionSet {
  id: string;
  name: string;
  options: GloboOption[];
}

export async function loader({ params, context }: LoaderFunctionArgs) {
  const { productId } = params;
  if (!productId) return Response.json({ optionSets: [] });

  const shopDomain = context.env.PUBLIC_STORE_DOMAIN;

  try {
    const res = await fetch(
      `https://${shopDomain}/apps/product-options-by-globo/option_sets.json?product_id=${productId}`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) return Response.json({ optionSets: [] });

    const data = await res.json() as any;
    const optionSets: GloboOptionSet[] = (data?.option_sets ?? data?.optionSets ?? []).map((set: any) => ({
      id: set.id ?? set._id ?? String(Math.random()),
      name: set.name ?? "",
      options: (set.options ?? set.custom_options ?? []).map((opt: any) => ({
        id: opt.id ?? opt._id ?? String(Math.random()),
        name: opt.name ?? opt.label ?? "",
        type: normalizeType(opt.type ?? opt.option_type ?? "text"),
        required: opt.required ?? false,
        placeholder: opt.placeholder ?? "",
        values: (opt.values ?? opt.option_values ?? []).map((v: any) => ({
          label: typeof v === "string" ? v : (v.label ?? v.name ?? v.value ?? v),
          value: typeof v === "string" ? v : (v.value ?? v.label ?? v.name ?? v),
          color: v.color ?? v.color_code ?? undefined,
          image: v.image ?? v.image_url ?? undefined,
        })),
        min_value: opt.min_value ?? undefined,
        max_value: opt.max_value ?? undefined,
        position: opt.position ?? 0,
      })).sort((a: any, b: any) => a.position - b.position),
    }));

    return Response.json({ optionSets });
  } catch {
    return Response.json({ optionSets: [] });
  }
}

function normalizeType(raw: string): GloboOption["type"] {
  const t = raw.toLowerCase();
  if (t.includes("textarea") || t.includes("multi")) return "textarea";
  if (t.includes("swatch") && t.includes("image")) return "image_swatch";
  if (t.includes("swatch") || t.includes("color")) return "swatch";
  if (t.includes("dropdown") || t.includes("select")) return "dropdown";
  if (t.includes("radio")) return "radio";
  if (t.includes("checkbox")) return "checkbox";
  if (t.includes("date")) return "date";
  if (t.includes("number")) return "number";
  if (t.includes("file")) return "file";
  return "text";
}

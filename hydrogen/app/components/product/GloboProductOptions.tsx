import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import type { GloboOption, GloboOptionSet } from "~/routes/api.globo-options.$productId";

interface Props {
  productNumericId: string;
  onChange: (attributes: Array<{ key: string; value: string }>) => void;
}

export function GloboProductOptions({ productNumericId, onChange }: Props) {
  const fetcher = useFetcher<{ optionSets: GloboOptionSet[] }>();
  const [selections, setSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    if (productNumericId) {
      fetcher.load(`/api/globo-options/${productNumericId}`);
    }
  }, [productNumericId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const attrs = Object.entries(selections)
      .filter(([, v]) => v !== "")
      .map(([k, v]) => ({ key: k, value: v }));
    onChange(attrs);
  }, [selections, onChange]);

  const optionSets = fetcher.data?.optionSets ?? [];
  if (fetcher.state === "loading") {
    return <div className="text-xs text-muted-foreground animate-pulse">Loading options…</div>;
  }
  if (optionSets.length === 0) return null;

  const set = (val: string, key: string) =>
    setSelections((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="flex flex-col gap-4">
      {optionSets.map((optSet) =>
        optSet.options.map((opt) => (
          <OptionField
            key={opt.id}
            opt={opt}
            value={selections[opt.name] ?? ""}
            onChange={(v) => set(v, opt.name)}
          />
        ))
      )}
    </div>
  );
}

function OptionField({
  opt,
  value,
  onChange,
}: {
  opt: GloboOption;
  value: string;
  onChange: (v: string) => void;
}) {
  const label = (
    <p className="mb-1.5 text-sm font-semibold">
      {opt.name}
      {opt.required && <span className="ml-1 text-crimson">*</span>}
    </p>
  );

  switch (opt.type) {
    case "dropdown":
      return (
        <div>
          {label}
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-crimson focus:outline-none"
          >
            <option value="">{opt.placeholder || "Select an option"}</option>
            {opt.values?.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>
      );

    case "radio":
      return (
        <div>
          {label}
          <div className="flex flex-wrap gap-2">
            {opt.values?.map((v) => (
              <button
                key={v.value}
                type="button"
                onClick={() => onChange(v.value)}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                  value === v.value
                    ? "border-crimson bg-crimson text-crimson-foreground"
                    : "border-border bg-card hover:border-crimson"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      );

    case "swatch":
      return (
        <div>
          {label}
          <div className="flex flex-wrap gap-2">
            {opt.values?.map((v) => (
              <button
                key={v.value}
                type="button"
                title={v.label}
                onClick={() => onChange(v.value)}
                className={`relative h-8 w-8 rounded-full border-2 transition-all ${
                  value === v.value ? "border-crimson scale-110" : "border-border hover:border-muted-foreground"
                }`}
                style={{ backgroundColor: v.color ?? v.value }}
              >
                {value === v.value && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-white shadow" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      );

    case "image_swatch":
      return (
        <div>
          {label}
          <div className="flex flex-wrap gap-2">
            {opt.values?.map((v) => (
              <button
                key={v.value}
                type="button"
                title={v.label}
                onClick={() => onChange(v.value)}
                className={`h-12 w-12 overflow-hidden rounded-md border-2 transition-all ${
                  value === v.value ? "border-crimson" : "border-border hover:border-muted-foreground"
                }`}
              >
                {v.image ? (
                  <img src={v.image} alt={v.label} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-xs">{v.label}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      );

    case "checkbox":
      return (
        <div>
          {label}
          <div className="flex flex-col gap-1.5">
            {opt.values?.map((v) => {
              const checked = value.split(",").includes(v.value);
              const toggle = () => {
                const current = value ? value.split(",") : [];
                const next = checked ? current.filter((x) => x !== v.value) : [...current, v.value];
                onChange(next.filter(Boolean).join(","));
              };
              return (
                <label key={v.value} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={toggle}
                    className="h-4 w-4 accent-crimson"
                  />
                  {v.label}
                </label>
              );
            })}
          </div>
        </div>
      );

    case "textarea":
      return (
        <div>
          {label}
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={opt.placeholder}
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-crimson focus:outline-none resize-none"
          />
        </div>
      );

    case "date":
      return (
        <div>
          {label}
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-crimson focus:outline-none"
          />
        </div>
      );

    case "number":
      return (
        <div>
          {label}
          <input
            type="number"
            value={value}
            min={opt.min_value}
            max={opt.max_value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={opt.placeholder}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-crimson focus:outline-none"
          />
        </div>
      );

    default:
      return (
        <div>
          {label}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={opt.placeholder}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-crimson focus:outline-none"
          />
        </div>
      );
  }
}

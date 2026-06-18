export function LpCertificationsSection({ node }: { node: any }) {
  const f = Object.fromEntries((node?.fields ?? []).map((x: any) => [x.key, x]));
  const heading = f.heading?.value ?? "";
  const subHeading = f.sub_heading?.value ?? "";
  const background = f.background?.value ?? "light";
  const items: any[] = f.items?.references?.nodes ?? [];

  if (items.length === 0 && !heading) return null;

  const isDark = background === "dark";

  return (
    <section className={`py-12 md:py-16 ${isDark ? "bg-charcoal text-white" : "bg-[#f5f5f5] text-foreground"}`}>
      <div className="container mx-auto px-4 text-center">
        {heading && (
          <h2 className={`font-display text-xl font-extrabold md:text-2xl mb-1 ${isDark ? "text-white" : ""}`}>
            {heading}
          </h2>
        )}
        {subHeading && (
          <p className={`text-sm mb-8 ${isDark ? "text-white/70" : "text-muted-foreground"}`}>
            {subHeading}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-8 md:gap-14">
          {items.map((item: any) => {
            const fi = Object.fromEntries((item?.fields ?? []).map((x: any) => [x.key, x]));
            const imgUrl = fi.image?.reference?.image?.url ?? null;
            const label = fi.label?.value ?? "";
            return (
              <div key={item.id} className="flex flex-col items-center gap-3 max-w-[140px]">
                {imgUrl && (
                  <img
                    src={imgUrl}
                    alt={label}
                    className="h-28 w-28 object-contain rounded-lg"
                  />
                )}
                {label && (
                  <p className={`text-xs text-center leading-snug ${isDark ? "text-white/80" : "text-muted-foreground"}`}>
                    {label}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

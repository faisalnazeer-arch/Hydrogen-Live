export function LpMessageBanner({ node }: { node: any }) {
  const f = Object.fromEntries((node?.fields ?? []).map((x: any) => [x.key, x]));
  const message = f.message?.value ?? "";
  const bgColor = f.bg_color?.value || "#8B1A1A";
  const textColor = f.text_color?.value || "#ffffff";
  if (!message) return null;
  return (
    <div style={{ backgroundColor: bgColor, color: textColor }} className="w-full py-4 px-4 text-center">
      <p className="text-sm font-bold md:text-base">{message}</p>
    </div>
  );
}

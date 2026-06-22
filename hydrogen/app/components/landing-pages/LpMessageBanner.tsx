export function LpMessageBanner({ nodes }: { nodes: any[] }) {
  if (!nodes?.length) return null;
  return (
    <>
      {nodes.map((node: any, i: number) => {
        const f = Object.fromEntries((node.fields ?? []).map((x: any) => [x.key, x.value]));
        if (!f.message) return null;
        return (
          <div
            key={i}
            className="px-4 py-3 text-center text-sm font-semibold"
            style={{ backgroundColor: f.bg_color ?? "#820000", color: f.text_color ?? "white" }}
          >
            {f.message}
          </div>
        );
      })}
    </>
  );
}

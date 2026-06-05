import type { MetaFunction } from "@shopify/remix-oxygen";
import { useEffect } from "react";

export const meta: MetaFunction = () => [
  { title: "MLS Rewards — Unlock Savings & Rewards" },
  { name: "description", content: "Join MLS Rewards and earn points on every purchase. Redeem for discounts on fresh halal meat delivery." },
];

const YOTPO_GUID = "3zSKLTmmtHC3S0CGw89ppA";

const YOTPO_INSTANCE_ID = "567647";

export default function RewardsPage() {
  useEffect(() => {
    if (document.getElementById("yotpo-loyalty-js")) return;

    const script = document.createElement("script");
    script.id = "yotpo-loyalty-js";
    script.src = `https://cdn-widgetsrepository.yotpo.com/v1/loader/${YOTPO_GUID}`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <div
        className="relative overflow-hidden py-24 md:py-36"
        style={{ background: "radial-gradient(ellipse at 60% 40%, #b45309 0%, #1a0a0a 50%, #0a0a0a 100%)" }}
      >
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="absolute top-32 right-40 h-24 w-24 rounded-full bg-amber-400/15 blur-2xl" />
          <div className="absolute bottom-10 left-20 h-32 w-32 rounded-full bg-amber-600/10 blur-3xl" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <h1 className="font-display text-3xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
            Unlock Savings &amp; Rewards With MLS
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm text-white/80 md:text-base">
            We value you and this program is built to save you money and upgrade your meat shopping experience.
          </p>
        </div>
      </div>

      {/* Yotpo Loyalty Widget — full page embed */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div
          className="yotpo-widget-instance"
          data-yotpo-instance-id={YOTPO_INSTANCE_ID}
        />
      </div>

    </div>
  );
}

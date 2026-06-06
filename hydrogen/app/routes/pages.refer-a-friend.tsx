import type { MetaFunction } from "@shopify/remix-oxygen";
import { useEffect } from "react";

export const meta: MetaFunction = () => [
  { title: "Refer a Friend — MLS UAE" },
  { name: "description", content: "Refer a friend to MLS and earn rewards. Share the love of premium halal meat." },
];

const YOTPO_GUID = "3zSKLTmmtHC3S0CGw89ppA";
const REFERRAL_INSTANCE_ID = "822349";

export default function ReferAFriendPage() {
  useEffect(() => {
    const existing = document.getElementById("yotpo-loyalty-js");
    if (existing) {
      if ((window as any).yotpoWidgetsContainer) {
        (window as any).yotpoWidgetsContainer.initWidgets();
      }
      return;
    }
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
        className="relative overflow-hidden py-14 md:py-20"
        style={{ background: "radial-gradient(ellipse at 60% 40%, #b45309 0%, #1a0a0a 50%, #0a0a0a 100%)" }}
      >
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="absolute bottom-10 left-20 h-32 w-32 rounded-full bg-amber-600/10 blur-3xl" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative container mx-auto px-4 text-center text-white">
          <h1 className="font-display text-3xl font-extrabold leading-tight md:text-5xl">
            Refer a Friend &amp; Earn Rewards
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm text-white/80 md:text-base">
            Share MLS with friends and family — you both get rewarded with exclusive discounts on premium halal meat.
          </p>
        </div>
      </div>

      {/* Yotpo Referral Widget */}
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div
          className="yotpo-widget-instance"
          data-yotpo-instance-id={REFERRAL_INSTANCE_ID}
        />
      </div>

    </div>
  );
}

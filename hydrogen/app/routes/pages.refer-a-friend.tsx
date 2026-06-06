import type { MetaFunction } from "@shopify/remix-oxygen";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { User, Users, Mail, Gift, Trophy, ShoppingCart, Tag, Smile, Plus, Minus } from "lucide-react";
import { cn } from "~/lib/utils";

export const meta: MetaFunction = () => [
  { title: "Refer a Friend — MLS UAE" },
  { name: "description", content: "Refer a friend to MLS and earn rewards. Share the love of premium halal meat." },
];

const YOTPO_GUID = "3zSKLTmmtHC3S0CGw89ppA";
const REFERRAL_INSTANCE_ID = "822349";

const HOW_TO_REFER = [
  { Icon: User,     label: "Log In / Sign Up",            desc: "Sign up/ log in to your account. Go to the page called, Refer Your Friend. Enter your email and press next." },
  { Icon: Users,    label: 'Go to "Refer Your Friend" Page', desc: "Navigate to the Refer Your Friend section and enter your email address." },
  { Icon: Mail,     label: "Enter Your Friend's Email",    desc: "Submit your friend's email address. They'll receive a referral link and a unique code via email. You can also copy and share the link via SMS, WhatsApp, or Messenger." },
  { Icon: Gift,     label: "Your Friend Gets a Free Gift", desc: "Your friend needs to: Check their email. Copy the referral code. Add the MLS Referral Box to their cart. Paste the code at checkout to get the box for free." },
  { Icon: Trophy,   label: "You Get Rewarded Too!",        desc: "Once your friend completes their order using your code, you'll receive 2 Striploin Steaks (250g each) as a thank-you!" },
];

const HOW_TO_GET_STEAKS = [
  { step: 1, Icon: ShoppingCart, label: "Add to Cart", desc: <>Add this product into your cart: <a href="https://mlsuae.ae/products/mls-referral-box" className="text-crimson underline" target="_blank" rel="noopener noreferrer">MLS Referral Box</a></> },
  { step: 2, Icon: Tag,          label: "Apply Code",  desc: "Apply the discount code in our checkout which you received in the email." },
  { step: 3, Icon: Smile,        label: "Enjoy!",      desc: "Enjoy your gift." },
];

const FAQS = [
  {
    q: "Can I refer only one friend?",
    a: "No, you can refer as many friends as you want. The more friends you refer, the more discount you get.",
  },
  {
    q: "What is a successful referral?",
    a: "Your referred friend should complete a purchase of minimum AED 150 via referral link; it should be your friend's first purchase.",
  },
  {
    q: "What causes a referral to fail?",
    a: "If the referred customer clicked on the referral link; but then made the purchase on a different IP address or user agent, the referring customer would not get the kickback.",
  },
  {
    q: "How does the MLS reward work?",
    a: null,
    link: { label: "Browse the MLS Rewards program here.", to: "/pages/rewards" },
  },
];

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

      {/* How can I refer friends? */}
      <div className="border-t border-border bg-muted/20 py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-12 text-center">
            <span className="inline-block rounded-full bg-crimson/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-crimson">Step by Step</span>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground">How can I refer friends?</h2>
          </div>

          {/* First row — 3 steps */}
          <div className="grid gap-6 sm:grid-cols-3 mb-6">
            {HOW_TO_REFER.slice(0, 3).map(({ Icon, label, desc }, i) => (
              <StepCard key={i} Icon={Icon} label={label} desc={desc} step={i + 1} />
            ))}
          </div>
          {/* Second row — 2 steps centered */}
          <div className="grid gap-6 sm:grid-cols-2 sm:max-w-2xl sm:mx-auto">
            {HOW_TO_REFER.slice(3).map(({ Icon, label, desc }, i) => (
              <StepCard key={i + 3} Icon={Icon} label={label} desc={desc} step={i + 4} />
            ))}
          </div>
        </div>
      </div>

      {/* How to get your free steaks */}
      <div className="py-20 bg-[#fdf5f5]">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-12 text-center">
            <span className="inline-block rounded-full bg-crimson/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-crimson">Free Reward</span>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground">How to get your free steaks?</h2>
          </div>
          <div className="relative grid gap-8 sm:grid-cols-3">
            {/* Connector line on desktop */}
            <div className="absolute top-8 left-[16.67%] right-[16.67%] hidden h-0.5 bg-crimson/20 sm:block" />
            {HOW_TO_GET_STEAKS.map(({ step, Icon, label, desc }) => (
              <div key={step} className="relative flex flex-col items-center text-center gap-4 rounded-2xl bg-white p-6 shadow-sm border border-border">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-crimson text-white shadow-md">
                  <Icon className="h-7 w-7" />
                </div>
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-crimson text-[11px] font-bold text-white shadow">
                  {step}
                </span>
                <p className="text-sm font-bold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="border-t border-border py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-foreground">FAQs</h2>
          <FaqList />
        </div>
      </div>

      {/* Video section — replace VIDEO_URL with actual YouTube embed URL */}
      <div className="border-t border-border py-20 bg-charcoal">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <span className="inline-block rounded-full bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-white/60">Watch</span>
          <h2 className="mt-3 font-display text-3xl font-bold text-white mb-8">See How It Works</h2>
          <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl" style={{ paddingTop: "56.25%" }}>
            <iframe
              className="absolute inset-0 h-full w-full"
              src="https://www.youtube.com/embed/_9VUPq3SxOc"
              title="Refer a Friend"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>

    </div>
  );
}

function StepCard({ Icon, label, desc, step }: { Icon: any; label: string; desc: string; step: number }) {
  return (
    <div className="relative flex flex-col items-center text-center gap-4 rounded-2xl bg-white p-6 shadow-sm border border-border hover:border-crimson/30 transition-colors">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-crimson/10 text-crimson ring-4 ring-crimson/5">
        <Icon className="h-7 w-7" />
      </div>
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-crimson text-[11px] font-bold text-white shadow">
        {step}
      </span>
      <p className="text-sm font-bold text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function FaqList() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
      {FAQS.map((faq, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
          >
            <span>{faq.q}</span>
            {open === i
              ? <Minus className="h-4 w-4 shrink-0 text-crimson" />
              : <Plus className="h-4 w-4 shrink-0 text-crimson" />
            }
          </button>
          {open === i && (
            <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
              {faq.a && <p>{faq.a}</p>}
              {faq.link && (
                <Link to={faq.link.to} className="text-crimson hover:underline">
                  {faq.link.label}
                </Link>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

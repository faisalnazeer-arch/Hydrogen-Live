import type { MetaFunction, ActionFunctionArgs } from "@shopify/remix-oxygen";
import { Form, useActionData, useNavigation } from "react-router";
import { MapPin, Phone, Mail, Clock, MessageCircle, CheckCircle2, ArrowRight, Send } from "lucide-react";

export const meta: MetaFunction = () => [
  { title: "Contact Us — MLS UAE" },
  { name: "description", content: "Reach MLS UAE — Premium halal meat delivered. Call, WhatsApp or email us 9 AM to 10 PM daily." },
];

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const name    = String(form.get("name")    ?? "").trim();
  const email   = String(form.get("email")   ?? "").trim();
  void form.get("phone"); // optional field, not validated
  const message = String(form.get("message") ?? "").trim();

  if (!name || !email || !message) return { ok: false, error: "Please fill in all required fields." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Please enter a valid email address." };
  return { ok: true };
}

export default function ContactPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  return (
    <div className="bg-background min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#1a0a0a] py-16 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #8b0000 0%, transparent 60%), radial-gradient(circle at 80% 20%, #8b0000 0%, transparent 50%)" }}
        />
        <div className="relative container mx-auto px-4 text-center">
          <span className="mb-3 inline-block rounded-full border border-crimson/40 bg-crimson/10 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-crimson">
            We're here for you
          </span>
          <h1 className="font-display mt-2 text-4xl font-extrabold md:text-5xl">Get in Touch</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/60">
            Questions about your order, custom cuts, or bulk buying? Our team responds within the hour.
          </p>
        </div>
      </div>

      {/* ── Info + Form ───────────────────────────────────────────────── */}
      <div className="container mx-auto grid gap-8 px-4 py-12 lg:grid-cols-5 lg:gap-12">

        {/* Contact cards — left 2 cols */}
        <div className="flex flex-col gap-3 lg:col-span-2">
          <div>
            <h2 className="font-display text-xl font-bold">Contact Information</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Multiple ways to reach us — pick what's easiest.</p>
          </div>

          {/* Cards */}
          {[
            {
              icon: Phone,
              label: "WhatsApp / Call",
              value: "+971 50 451 6403",
              sub: "Tap to open WhatsApp",
              href: "https://wa.me/971504516403",
              color: "#25D366",
            },
            {
              icon: Mail,
              label: "Email",
              value: "contactus@mlsuae.ae",
              sub: "We reply within a few hours",
              href: "mailto:contactus@mlsuae.ae",
              color: "var(--color-crimson,#8b0000)",
            },
            {
              icon: Clock,
              label: "Support Hours",
              value: "9 AM – 10 PM",
              sub: "All days of the week",
              href: null,
              color: "var(--color-crimson,#8b0000)",
            },
            {
              icon: MapPin,
              label: "Address",
              value: "E-09, Light Industrial Unit 6",
              sub: "Dubai Silicon Oasis · Dubai · UAE",
              href: "https://maps.google.com/?q=Dubai+Silicon+Oasis+Dubai",
              color: "var(--color-crimson,#8b0000)",
            },
          ].map(({ icon: Icon, label, value, sub, href, color }) => (
            <div key={label} className="group flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 transition-all hover:border-crimson/40">
              <div
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white"
                style={{ backgroundColor: color }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
                {href ? (
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm font-semibold text-foreground transition-colors hover:text-crimson"
                  >
                    {value}
                    <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-foreground">{value}</p>
                )}
                <p className="text-[10px] text-muted-foreground">{sub}</p>
              </div>
            </div>
          ))}

          {/* WhatsApp CTA */}
          <a
            href="https://wa.me/971504516403"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md"
          >
            <MessageCircle className="h-5 w-5" />
            Start WhatsApp Chat
          </a>
        </div>

        {/* Form — right 3 cols */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-3">
          {actionData?.ok ? (
            <div className="flex flex-col items-center gap-5 py-12 text-center">
              <div className="grid h-20 w-20 place-items-center rounded-full bg-green-50">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold">Message Sent!</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
                  Thank you for reaching out. A member of our team will get back to you shortly.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="font-display text-xl font-bold">Send a Message</h2>
                <p className="mt-1 text-sm text-muted-foreground">Fill in the form and we'll get back to you within hours.</p>
              </div>

              {actionData?.error && (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {actionData.error}
                </div>
              )}

              <Form method="post" className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name" name="name" type="text" placeholder="Your full name" required />
                  <Field label="Phone" name="phone" type="tel" placeholder="+971 50 000 0000" />
                </div>
                <Field label="Email" name="email" type="email" placeholder="you@email.com" required />
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Message <span className="text-crimson">*</span>
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Tell us how we can help — order questions, custom cuts, bulk orders…"
                    className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-crimson"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 rounded-xl bg-crimson py-3.5 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-rich-red hover:shadow-md disabled:opacity-60"
                >
                  {submitting ? (
                    <>Sending…</>
                  ) : (
                    <><Send className="h-4 w-4" /> Send Message</>
                  )}
                </button>
              </Form>
            </>
          )}
        </div>
      </div>

    </div>
  );
}

function Field({
  label, name, type, placeholder, required,
}: {
  label: string; name: string; type: string; placeholder: string; required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label} {required && <span className="text-crimson">*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-crimson"
      />
    </div>
  );
}

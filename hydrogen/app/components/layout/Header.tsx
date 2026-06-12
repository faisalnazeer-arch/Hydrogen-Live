import { useState, useRef } from "react";
import { Link } from "react-router";
import {
  ShoppingBag,
  User,
  Menu,
  ChevronDown,
  ChevronRight,
  Beef,
  Drumstick,
  Star,
  Tag,
  Flame,
  Sandwich,
  Package,
  Boxes,
  Info,
  Compass,
  Globe,
  MapPin,
  Crown,
  Gift,
  Percent,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { MegaMenu } from "./MegaMenu";
import { SearchAutosuggest } from "./SearchAutosuggest";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useLocaleStore, dirFor } from "@/stores/localeStore";
import { useT } from "@/i18n/strings";
import logo from "@/assets/mls-logo.png";
import type { NavEntry } from "~/root";

function pickIcon(title: string, url: string): LucideIcon {
  const s = `${title} ${url}`.toLowerCase();
  if (/beef|steak|wagyu|angus/.test(s)) return Beef;
  if (/lamb|mutton/.test(s)) return Drumstick;
  if (/review/.test(s)) return Star;
  if (/offer|sale|deal|redeem/.test(s)) return Percent;
  if (/bbq|grill|mishkak/.test(s)) return Flame;
  if (/burger|sandwich/.test(s)) return Sandwich;
  if (/box|bundle/.test(s)) return Boxes;
  if (/build|package/.test(s)) return Package;
  if (/about|info/.test(s)) return Info;
  if (/location|store/.test(s)) return MapPin;
  if (/subscription|subscribe/.test(s)) return Crown;
  if (/reward|loyalty/.test(s)) return Gift;
  return Compass;
}

interface HeaderProps {
  mainMenu?: NavEntry[];
  secondaryMenu?: NavEntry[];
}

export function Header({ mainMenu = [], secondaryMenu = [] }: HeaderProps) {
  const totalItems = useCartStore((s) =>
    s.items.reduce((n, i) => n + i.quantity, 0)
  );
  const setCartOpen = useCartStore((s) => s.setOpen);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const t = useT();
  const drawerSide = dirFor(locale) === "rtl" ? "right" : "left";
  const closeMobile = () => setMobileNavOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      {/* Top bar */}
      <div className="container relative mx-auto flex items-center gap-3 px-4 py-3">
        {/* Mobile menu */}
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label={t("nav.menu")}>
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side={drawerSide} className="w-[320px] p-0 flex flex-col">
            <MobileMenuDrawer
              mainMenu={mainMenu}
              secondaryMenu={secondaryMenu}
              onClose={closeMobile}
            />
          </SheetContent>
        </Sheet>

        <Link
          to="/"
          aria-label="MLS — Muscat Livestock Store"
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center lg:static lg:translate-x-0 lg:translate-y-0"
        >
          <img
            src={logo}
            alt="Muscat Livestock Store"
            className="h-10 w-auto sm:h-12"
          />
        </Link>

        <div className="ms-4 hidden flex-1 lg:block">
          <div className="mx-auto max-w-xl">
            <SearchAutosuggest />
          </div>
        </div>

        <div className="ms-auto flex items-center gap-1">
          <div className="hidden sm:flex items-center gap-0.5 rounded-full border border-border px-1 py-0.5 text-[11px] font-semibold uppercase tracking-wider">
            <Globe className="ms-1 h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            <button
              type="button"
              onClick={() => setLocale("en")}
              aria-pressed={locale === "en"}
              className={`rounded-full px-2 py-0.5 transition-colors ${
                locale === "en" ? "bg-crimson text-crimson-foreground" : "hover:text-crimson"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLocale("ar")}
              aria-pressed={locale === "ar"}
              lang="ar"
              className={`rounded-full px-2 py-0.5 transition-colors ${
                locale === "ar" ? "bg-crimson text-crimson-foreground" : "hover:text-crimson"
              }`}
            >
              العربية
            </button>
          </div>
          <a
            href="https://mlsuae.ae/customer_authentication/redirect?locale=en&region_country=AE"
            aria-label={t("nav.account")}
          >
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </a>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={t("nav.cart")}
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -end-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-crimson px-1 text-[10px] font-bold text-crimson-foreground">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Mobile search row */}
      <div className="border-t border-border bg-card px-4 py-2 lg:hidden">
        <SearchAutosuggest />
      </div>

      {/* Nav rows (desktop) */}
      <nav className="hidden border-t border-border bg-card lg:block">
        <div className="container relative mx-auto flex items-center justify-center gap-6 px-4 py-2">
          {mainMenu.map((entry) =>
            entry.columns.length > 0 ? (
              <NavItem
                key={entry.id}
                label={entry.label}
                Icon={pickIcon(entry.label, entry.url ?? "")}
                mega={entry.columns}
              />
            ) : (
              <NavLink
                key={entry.id}
                to={entry.url ?? "/"}
                label={entry.label}
                Icon={pickIcon(entry.label, entry.url ?? "")}
              />
            )
          )}
        </div>
        <div className="container relative mx-auto flex items-center justify-center gap-6 border-t border-border/60 px-4 py-2">
          {secondaryMenu.map((entry) =>
            entry.columns.length > 0 ? (
              <SecondaryNavItem
                key={entry.id}
                label={entry.label}
                Icon={pickIcon(entry.label, entry.url ?? "")}
                mega={entry.columns}
              />
            ) : (
              <SecondaryNavLink
                key={entry.id}
                to={entry.url ?? "/"}
                label={entry.label}
                Icon={pickIcon(entry.label, entry.url ?? "")}
              />
            )
          )}
        </div>
      </nav>
    </header>
  );
}

function NavItem({
  label,
  mega,
  Icon,
}: {
  label: string;
  mega: any[];
  Icon?: LucideIcon;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOpen = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };

  const handleClose = () => {
    timer.current = setTimeout(() => setOpen(false), 150);
  };

  const isMega = mega.length > 1 || (mega.length === 1 && !!mega[0].title);

  const handleLinkClick = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(false);
  };

  return (
    <div className={isMega ? undefined : "relative"} onMouseEnter={handleOpen} onMouseLeave={handleClose}>
      <button
        className={`flex items-center gap-1 py-1 text-[13px] font-semibold uppercase tracking-wider transition-colors hover:text-crimson ${open ? "text-crimson" : ""}`}
      >
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <MegaMenu
          columns={mega}
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
          onLinkClick={handleLinkClick}
        />
      )}
    </div>
  );
}

function NavLink({
  to,
  label,
  Icon,
}: {
  to: string;
  label: string;
  Icon?: LucideIcon;
}) {
  return (
    <Link
      to={to}
      prefetch="intent"
      className="flex items-center gap-1 text-[13px] font-semibold uppercase tracking-wider transition-colors hover:text-crimson"
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      <span>{label}</span>
    </Link>
  );
}

function SecondaryNavItem({
  label,
  mega,
  Icon,
}: {
  label: string;
  mega: any[];
  Icon?: LucideIcon;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMega = mega.length > 1 || (mega.length === 1 && !!mega[0].title);

  const handleOpen = () => { if (timer.current) clearTimeout(timer.current); setOpen(true); };
  const handleClose = () => { timer.current = setTimeout(() => setOpen(false), 150); };
  const handleLinkClick = () => { if (timer.current) clearTimeout(timer.current); setOpen(false); };

  return (
    <div className={isMega ? undefined : "relative"} onMouseEnter={handleOpen} onMouseLeave={handleClose}>
      <button className={`flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider transition-colors hover:text-crimson ${open ? "text-crimson" : "text-muted-foreground"}`}>
        {Icon && <Icon className="h-3 w-3" />}
        {label}
        <ChevronDown className={`h-2.5 w-2.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <MegaMenu columns={mega} onMouseEnter={handleOpen} onMouseLeave={handleClose} onLinkClick={handleLinkClick} />
      )}
    </div>
  );
}

function SecondaryNavLink({
  to,
  label,
  Icon,
}: {
  to: string;
  label: string;
  Icon?: LucideIcon;
}) {
  return (
    <Link
      to={to}
      prefetch="intent"
      className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-crimson"
    >
      {Icon && <Icon className="h-3 w-3" />}
      <span>{label}</span>
    </Link>
  );
}

// ── Mobile drawer ──────────────────────────────────────────────────────────────

function MobileMenuDrawer({
  mainMenu,
  secondaryMenu,
  onClose,
}: {
  mainMenu: NavEntry[];
  secondaryMenu: NavEntry[];
  onClose: () => void;
}) {
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  // Top-level entries with sub-links → tabs
  const tabbedEntries = mainMenu.filter((e) => e.columns.length > 0);
  // Top-level entries without sub-links → shown in secondary section
  const flatMainEntries = mainMenu.filter((e) => e.columns.length === 0);

  const activeEntry = tabbedEntries[activeTabIdx];
  // Flatten all columns of the active tab into one ordered list
  const activeLinks = activeEntry?.columns.flatMap((col) => col.links) ?? [];

  // Secondary links: flat main entries + secondary menu entries
  const secondaryLinks = [
    ...flatMainEntries.map((e) => ({ id: e.id, label: e.label, url: e.url ?? "/" })),
    ...secondaryMenu.map((e) => ({ id: e.id, label: e.label, url: e.url ?? "/" })),
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Accessible title (visually hidden) */}
      <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

      {/* ── Top header with logo ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="flex h-8 w-8 items-center justify-center rounded-full text-foreground hover:bg-muted"
        >
          <X className="h-5 w-5" />
        </button>
        <img src={logo} alt="MLS" className="h-9 w-auto" />
        <div className="w-8" />
      </div>

      {/* ── Tab bar ── */}
      {tabbedEntries.length > 0 && (
        <div className="flex shrink-0 border-b border-border">
          {tabbedEntries.map((entry, i) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setActiveTabIdx(i)}
              className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all ${
                i === activeTabIdx
                  ? "bg-crimson text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto">
        {/* Tab link rows */}
        {activeLinks.map((link) => {
          const Icon = pickIcon(link.label, link.url);
          return (
            <Link
              key={link.url + link.label}
              to={link.url}
              onClick={onClose}
              prefetch="intent"
              className="flex items-center gap-3 border-b border-border/50 px-4 py-3 transition-colors hover:bg-muted/60"
            >
              {/* Thumbnail or icon fallback */}
              <div className="h-12 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                {link.imageUrl ? (
                  <img
                    src={`${link.imageUrl}&width=120`}
                    alt={link.label}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-crimson/10 to-bone">
                    <Icon className="h-5 w-5 text-crimson/50" />
                  </div>
                )}
              </div>
              <span className="flex-1 text-sm font-semibold text-foreground">{link.label}</span>
              <span className="text-lg font-light text-muted-foreground">+</span>
            </Link>
          );
        })}

        {/* ── Divider before secondary links ── */}
        {secondaryLinks.length > 0 && (
          <div className="mx-4 my-3 border-t border-border" />
        )}

        {/* Secondary / flat links */}
        {secondaryLinks.map(({ id, label, url }) => {
          const Icon = pickIcon(label, url);
          return (
            <Link
              key={id + url}
              to={url}
              onClick={onClose}
              prefetch="intent"
              className="flex items-center gap-3.5 border-b border-border/40 px-4 py-3.5 transition-colors hover:bg-muted/60"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-crimson/10 text-crimson">
                <Icon className="h-4 w-4" />
              </div>
              <span className="flex-1 text-sm font-semibold">{label}</span>
              <span className="text-lg font-light text-muted-foreground">+</span>
            </Link>
          );
        })}
      </div>

      {/* ── Bottom: Login + Sign Up ── */}
      <div className="flex shrink-0 gap-2.5 border-t border-border p-4">
        <a
          href="https://mlsuae.ae/customer_authentication/redirect?locale=en&region_country=AE"
          className="flex flex-1 items-center justify-center rounded-lg border-2 border-crimson py-3 text-sm font-bold uppercase tracking-wider text-crimson transition-colors hover:bg-crimson hover:text-white"
        >
          Login
        </a>
        <a
          href="https://mlsuae.ae/customer_authentication/redirect?locale=en&region_country=AE&flow=register"
          className="flex flex-1 items-center justify-center rounded-lg bg-charcoal py-3 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-charcoal/80"
        >
          Sign Up
        </a>
      </div>
    </div>
  );
}

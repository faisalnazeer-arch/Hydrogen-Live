import { create } from "zustand";
import { useRouteLoaderData } from "react-router";

export type Locale = "en" | "ar";
export type Dir = "ltr" | "rtl";

interface LocaleState {
  locale: Locale;
  setLocale: (l: Locale) => void;
  _syncLocale: (l: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()((set) => ({
  // Always initialize to "en" so server and client match on first render.
  // LocaleSync in root.tsx calls _syncLocale after hydration to set the real locale.
  locale: "en",
  _syncLocale: (l) => set({ locale: l }),
  setLocale: (locale) => {
    set({ locale });
    if (typeof document !== "undefined") {
      const secure = window.location.protocol === "https:" ? ";Secure" : "";
      document.cookie = `lang=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax${secure}`;

      let target: string;
      if (locale === "ar") {
        target = "/ar";
      } else {
        const current = window.location.pathname;
        target = current.startsWith("/ar/") ? current.slice(3) || "/" : current === "/ar" ? "/" : current;
        target += window.location.search;
      }

      window.location.replace(target);
    }
  },
}));

export const dirFor = (l: Locale): Dir => (l === "ar" ? "rtl" : "ltr");

/**
 * Returns a path-prefixer function that prepends /ar/ when locale is Arabic.
 * Reads locale from the root loader (SSR-safe). Falls back to Zustand store
 * (picks up cookie on client if root data is unavailable).
 */
export function useLocalePath() {
  // Root loader provides the server-detected locale — no hydration mismatch.
  const rootData = useRouteLoaderData("root") as { locale?: Locale } | undefined;
  // Zustand fallback — correct after client hydration reads the cookie.
  const storeLocale = useLocaleStore((s) => s.locale);
  const locale: Locale = rootData?.locale ?? storeLocale;

  return (path: string | null | undefined): string => {
    const p = path ?? "/";
    if (locale !== "ar") return p;
    if (p.startsWith("/ar")) return p;
    return `/ar${p.startsWith("/") ? p : `/${p}`}`;
  };
}

import { create } from "zustand";

export type Locale = "en" | "ar";
export type Dir = "ltr" | "rtl";

interface LocaleState {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

function readInitialLocale(): Locale {
  if (typeof document === "undefined") return "en";
  // Check URL path first (/ar/... prefix), then cookie
  if (window.location.pathname.startsWith("/ar/") || window.location.pathname === "/ar") {
    return "ar";
  }
  const m = document.cookie.match(/(?:^|;\s*)lang=([a-z]{2})/);
  return m?.[1] === "ar" ? "ar" : "en";
}

export const useLocaleStore = create<LocaleState>()((set) => ({
  locale: readInitialLocale(),
  setLocale: (locale) => {
    set({ locale });
    if (typeof document !== "undefined") {
      const secure = window.location.protocol === "https:" ? ";Secure" : "";
      document.cookie = `lang=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax${secure}`;

      const currentPath = window.location.pathname;
      const search = window.location.search;
      // Strip any existing /ar prefix then add it back if switching to Arabic
      const basePath = currentPath.replace(/^\/ar(\/|$)/, "/") || "/";
      const targetPath = locale === "ar" ? `/ar${basePath === "/" ? "" : basePath}` : basePath;
      window.location.href = targetPath + search;
    }
  },
}));

export const dirFor = (l: Locale): Dir => (l === "ar" ? "rtl" : "ltr");

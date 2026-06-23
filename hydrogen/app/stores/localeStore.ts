import { create } from "zustand";

export type Locale = "en" | "ar";
export type Dir = "ltr" | "rtl";

interface LocaleState {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

function readInitialLocale(): Locale {
  if (typeof document === "undefined") return "en";
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
      // Reload current page with new cookie — no URL change needed (cookie-based locale)
      window.location.reload();
    }
  },
}));

export const dirFor = (l: Locale): Dir => (l === "ar" ? "rtl" : "ltr");

/**
 * Returns a path-prefixer function. Locale is cookie-based — no /ar/ prefix
 * in URLs. All links use English handles regardless of locale.
 */
export function useLocalePath() {
  return (path: string | null | undefined): string => path ?? "/";
}

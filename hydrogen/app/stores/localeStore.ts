import { create } from "zustand";

export type Locale = "en" | "ar";
export type Dir = "ltr" | "rtl";

interface LocaleState {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()((set) => ({
  locale: "en",
  setLocale: (locale) => {
    set({ locale });
    if (typeof document !== "undefined") {
      // Secure flag on HTTPS, omit on localhost
      const secure = window.location.protocol === "https:" ? ";Secure" : "";
      document.cookie = `lang=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax${secure}`;
      window.location.reload();
    }
  },
}));

export const dirFor = (l: Locale): Dir => (l === "ar" ? "rtl" : "ltr");

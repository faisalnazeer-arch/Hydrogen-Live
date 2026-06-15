import { create } from "zustand";

export type Locale = "en" | "ar";
export type Dir = "ltr" | "rtl";

interface LocaleState {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

// Read the cookie synchronously at module-load time so the store starts
// with the correct locale — avoids the post-hydration flash where the UI
// briefly shows "EN" before the useEffect fires and corrects it to "AR".
function readCookieLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(/(?:^|;\s*)lang=([a-z]{2})/);
  return m?.[1] === "ar" ? "ar" : "en";
}

export const useLocaleStore = create<LocaleState>()((set) => ({
  locale: readCookieLocale(),
  setLocale: (locale) => {
    set({ locale });
    if (typeof document !== "undefined") {
      const secure = window.location.protocol === "https:" ? ";Secure" : "";
      document.cookie = `lang=${locale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax${secure}`;
      window.location.reload();
    }
  },
}));

export const dirFor = (l: Locale): Dir => (l === "ar" ? "rtl" : "ltr");

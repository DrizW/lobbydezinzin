"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Locale = "fr" | "en";

type Dict = Record<string, string>;

const DICTS: Record<Locale, Dict> = {
  fr: {
    "nav.benefits": "Bénéfices",
    "nav.help": "Aide",
    "nav.contact": "Contact",
    "nav.login": "Connexion",
    "nav.dashboard": "Dashboard",
    "nav.admin": "Admin",
    "nav.logout": "Déconnexion",
  },
  en: {
    "nav.benefits": "Benefits",
    "nav.help": "Help",
    "nav.contact": "Contact",
    "nav.login": "Log in",
    "nav.dashboard": "Dashboard",
    "nav.admin": "Admin",
    "nav.logout": "Log out",
  },
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("fr");

  // Auto-détection navigateur côté client
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("lz_locale");
      if (stored === "fr" || stored === "en") {
        setLocale(stored);
        return;
      }
      const nav = navigator.language || (navigator as any).userLanguage || "fr";
      setLocale(nav.startsWith("fr") ? "fr" : "en");
    } catch {}
  }, []);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale: (l: Locale) => {
      setLocale(l);
      try { window.localStorage.setItem("lz_locale", l); } catch {}
    },
    t: (key: string) => (DICTS[locale] && DICTS[locale][key]) || DICTS.fr[key] || key,
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

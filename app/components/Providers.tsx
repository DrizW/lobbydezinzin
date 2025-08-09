"use client";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { I18nProvider } from "./I18nProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <I18nProvider>
        {children}
      </I18nProvider>
    </SessionProvider>
  );
} 
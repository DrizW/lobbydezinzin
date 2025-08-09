import "./globals.css";
import Header from "./components/Header";
import Providers from "./components/Providers";
import { ReactNode } from "react";
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-gray-900 text-white font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <Header />
            <main>{children}</main>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 
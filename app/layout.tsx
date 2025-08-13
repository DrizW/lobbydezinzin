import "./globals.css";
import Header from "./components/Header";
import Providers from "./components/Providers";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0b0f19" />
      </head>
      <body className="min-h-screen bg-gray-900 text-white font-sans">
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
} 
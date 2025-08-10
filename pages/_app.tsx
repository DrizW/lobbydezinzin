import { AppProps } from 'next/app';
import { SessionProvider } from "next-auth/react";
import { appWithTranslation } from 'next-i18next';
import nextI18NextConfig from '../next-i18next.config';
import '../styles/globals.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default appWithTranslation(MyApp, nextI18NextConfig);

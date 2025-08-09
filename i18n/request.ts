import {getRequestConfig} from 'next-intl/server';
import {headers} from 'next/headers';

export const locales = ['fr', 'en'] as const;
export type AppLocale = typeof locales[number];
export const defaultLocale: AppLocale = 'fr';

export default getRequestConfig(async () => {
  let locale: AppLocale = defaultLocale;
  try {
    const accept = (headers().get('accept-language') || '').toLowerCase();
    if (accept.startsWith('en')) locale = 'en';
    else if (accept.startsWith('fr')) locale = 'fr';
  } catch {}

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});



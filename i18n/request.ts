import {getRequestConfig} from 'next-intl/server';

export const locales = ['fr', 'en'] as const;
export type AppLocale = typeof locales[number];
export const defaultLocale: AppLocale = 'fr';

export default getRequestConfig(async ({request}) => {
  let locale: AppLocale = defaultLocale;
  try {
    const header = request.headers.get('accept-language') || '';
    if (header.toLowerCase().startsWith('en')) locale = 'en';
    else if (header.toLowerCase().startsWith('fr')) locale = 'fr';
  } catch {}

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});



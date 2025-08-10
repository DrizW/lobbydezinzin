module.exports = {
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en', 'es', 'ar'],
    localeDetection: true
  },
  fallbackLng: 'fr',
  supportedLngs: ['fr', 'en', 'es', 'ar'],
  detection: {
    order: ['cookie', 'header', 'navigator'],
    caches: ['cookie']
  }
};

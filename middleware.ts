import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './i18n/request';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true
});

export default async function middleware(request: NextRequest) {
  // Run i18n routing first
  const intlResponse = intlMiddleware(request);
  if (intlResponse) {
    // If next-intl decided to redirect/response, return it unless we need auth redirect
  }

  const { pathname } = request.nextUrl;

  // Auth guard: dashboard
  if (pathname.startsWith('/dashboard')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key' });
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // Auth guard: admin (requires role ADMIN)
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key' });
    if (!token || (token as any).role !== 'ADMIN') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  // Fall back to next-intl response or continue
  return intlResponse || NextResponse.next();
}

export const config = {
  matcher: [
    // i18n for all non-static, non-api paths
    '/((?!_next|.*\\..*|api).*)',
    // plus explicit guards
    '/dashboard/:path*',
    '/admin/:path*'
  ]
}; 
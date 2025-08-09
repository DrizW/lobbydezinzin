import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './i18n/request';

export default createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true
});

export const config = {
  // Apply on all paths except static assets and API
  matcher: ['/((?!_next|.*\..*|api).*)']
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key" 
  });
  const { pathname } = request.nextUrl;


  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }


  if (pathname.startsWith('/admin')) {
    if (!token || token.role !== 'ADMIN') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}; 
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  // Mode maintenance: redirige vers /maintenance sauf pages admin
  if (process.env.MAINTENANCE === '1') {
    const p = request.nextUrl.pathname;
    if (!p.startsWith('/admin') && !p.startsWith('/maintenance') && !p.startsWith('/api')) {
      const url = request.nextUrl.clone();
      url.pathname = '/maintenance';
      return NextResponse.rewrite(url);
    }
  }

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
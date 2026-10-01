import { NextRequest, NextResponse } from 'next/server';
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  if (request.nextUrl.pathname.startsWith('/api/admin/') || request.nextUrl.pathname.startsWith('/api/careers/applications') || request.nextUrl.pathname.startsWith('/track/')) {
    response.headers.set('Cache-Control', 'private, no-store, max-age=0');
    response.headers.set('Vary', 'Cookie');
  }
  return response;
}
export const config = { matcher: ['/api/admin/:path*', '/api/careers/applications/:path*', '/track/:path*'] };

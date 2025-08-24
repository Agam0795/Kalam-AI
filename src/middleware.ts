import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Minimal middleware - just pass through all requests
export function middleware(request: NextRequest) {
  // Example: protect dashboard-like paths (commented; enable if needed)
  // if (request.nextUrl.pathname.startsWith('/protected')) {
  //   const isLoggedIn = request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token');
  //   if (!isLoggedIn) {
  //     const url = new URL('/login', request.url);
  //     return NextResponse.redirect(url);
  //   }
  // }
  return NextResponse.next();
}

// Only apply to specific paths if needed
export const config = {
  matcher: [
    // Skip internal Next.js paths
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

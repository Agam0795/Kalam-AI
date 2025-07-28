import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function middleware(_request: NextRequest) {
  // Simply pass through all requests without modification
  // _request is intentionally unused as this middleware passes through all requests
  return NextResponse.next();
}

// Optionally, configure which paths this middleware runs on
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
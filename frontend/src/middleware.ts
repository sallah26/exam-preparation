import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAMES, PROTECTED_ROUTES, PUBLIC_ROUTES } from "@/config/auth.config";

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Check for access token (matches our auth system)
  const accessToken = req.cookies.get(COOKIE_NAMES.ACCESS_TOKEN);
  const isAuthenticated = !!accessToken;

  // Debug logging
  console.log(`[Middleware] Path: ${pathname}, Authenticated: ${isAuthenticated}, Token: ${accessToken ? 'Present' : 'Missing'}`);

  // Only redirect from login/register pages if user is authenticated
  // Let the client-side components handle other redirects
  if (pathname.startsWith('/auth/login') && isAuthenticated) {
    console.log(`[Middleware] Redirecting authenticated user from login to dashboard`);
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith('/auth/register') && isAuthenticated) {
    console.log(`[Middleware] Redirecting authenticated user from register to dashboard`);
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // For protected routes, let the client-side handle the redirect
  // This prevents middleware from interfering with client-side navigation
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route)) && !isAuthenticated) {
    console.log(`[Middleware] User not authenticated for protected route ${pathname}, but letting client handle redirect`);
    // Don't redirect here, let the client-side ProtectedRoute handle it
    return NextResponse.next();
  }

  // Allow all other requests to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

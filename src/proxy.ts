import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { REFRESH_TOKEN_COOKIE } from "@/constants/session";
import { AUTH_ROUTES, PROTECTED_ROUTES, ROUTES } from "@/constants/routes";
import { applySecurityHeaders } from "@/lib/security-headers";
import { matchesRoute } from "@/lib/route-matching";

function hasSession(request: NextRequest): boolean {
  return Boolean(request.cookies.get(REFRESH_TOKEN_COOKIE)?.value);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = matchesRoute(pathname, PROTECTED_ROUTES);
  const isAuthRoute = matchesRoute(pathname, AUTH_ROUTES);
  const sessionActive = hasSession(request);

  if (isProtectedRoute && !sessionActive) {
    const loginUrl = new URL(ROUTES.auth, request.url);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  if (isAuthRoute && sessionActive) {
    const postAuthUrl = new URL(ROUTES.postAuth, request.url);
    return applySecurityHeaders(NextResponse.redirect(postAuthUrl));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

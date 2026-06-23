import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/constants/session";
import { PROTECTED_ROUTES, ROUTES } from "@/constants/routes";
import { applySecurityHeaders } from "@/lib/security-headers";
import { matchesRoute } from "@/lib/route-matching";

function hasSession(request: NextRequest): boolean {
  const access = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refresh = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  return Boolean(access && refresh);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = matchesRoute(pathname, PROTECTED_ROUTES);
  const sessionActive = hasSession(request);

  if (isProtectedRoute && !sessionActive) {
    const loginUrl = new URL(ROUTES.auth, request.url);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

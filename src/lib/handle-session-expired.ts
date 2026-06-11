import { BFF_AUTH_ROUTES } from "@/constants/api";
import { ROUTES } from "@/constants/routes";

const AUTH_BFF_PREFIXES = [
  "/api/auth/signin",
  "/api/auth/signup",
  "/api/auth/session",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/auth/me",
] as const;

export function isAuthBffPath(path: string): boolean {
  return AUTH_BFF_PREFIXES.some((prefix) => path.startsWith(prefix));
}

let isRedirecting = false;

/**
 * Clears auth cookies and sends the user to sign-in when a protected BFF call
 * returns 401. Uses a full navigation so middleware and AuthGuard stay in sync.
 */
export async function handleSessionExpired(): Promise<void> {
  if (typeof window === "undefined" || isRedirecting) {
    return;
  }

  if (window.location.pathname === ROUTES.auth) {
    return;
  }

  isRedirecting = true;

  try {
    await fetch(BFF_AUTH_ROUTES.session, {
      method: "DELETE",
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    // Best-effort cookie cleanup before redirect.
  }

  window.location.replace(ROUTES.auth);
}

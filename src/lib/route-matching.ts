import {
  APP_ROUTE_PREFIXES,
  MARKETING_ROUTE_PREFIXES,
} from "@/constants/routes";

export function matchesRoute(pathname: string, routes: readonly string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isAppRoute(pathname: string) {
  return matchesRoute(pathname, APP_ROUTE_PREFIXES);
}

export function isMarketingRoute(pathname: string) {
  return matchesRoute(pathname, MARKETING_ROUTE_PREFIXES);
}

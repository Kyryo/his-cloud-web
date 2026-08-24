import {
  getAppHost,
  getMarketingHost,
  hostOrigin,
  isHostRoutingEnabled,
} from "@/constants/hosts";

function looksLocal(host: string) {
  const hostname = host.replace(/:\d+$/, "").toLowerCase();
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "127.0.0.1"
  );
}

/** Absolute app URL when host routing is on; otherwise the same-origin path. */
export function appHref(path: string) {
  const appHost = getAppHost();
  if (!isHostRoutingEnabled() || !appHost) {
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  const protocol = looksLocal(appHost) ? "http" : "https";
  return `${hostOrigin(appHost, protocol)}${normalized}`;
}

export function marketingHref(path: string) {
  const marketingHost = getMarketingHost();
  if (!isHostRoutingEnabled() || !marketingHost) {
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  const protocol = looksLocal(marketingHost) ? "http" : "https";
  return `${hostOrigin(marketingHost, protocol)}${normalized}`;
}

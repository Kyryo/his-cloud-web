const SENSITIVE_AUTH_QUERY_KEYS = [
  "email",
  "password",
  "password2",
  "code",
] as const;

export function buildAuthUrlWithoutCredentials(
  pathname: string,
  search: string,
): string {
  if (!search || search === "?") {
    return pathname;
  }

  const params = new URLSearchParams(search);
  let changed = false;

  for (const key of SENSITIVE_AUTH_QUERY_KEYS) {
    if (params.has(key)) {
      params.delete(key);
      changed = true;
    }
  }

  if (!changed) {
    return `${pathname}${search}`;
  }

  const nextSearch = params.toString();
  return nextSearch ? `${pathname}?${nextSearch}` : pathname;
}

export function stripSensitiveAuthSearchParams(): void {
  if (typeof window === "undefined") {
    return;
  }

  const nextUrl = buildAuthUrlWithoutCredentials(
    window.location.pathname,
    window.location.search,
  );
  const currentUrl = `${window.location.pathname}${window.location.search}`;

  if (nextUrl !== currentUrl) {
    window.history.replaceState(window.history.state, "", nextUrl);
  }
}

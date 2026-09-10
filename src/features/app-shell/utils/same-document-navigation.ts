export function getSameDocumentNavigationHref(
  target: EventTarget | null,
): string | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const anchor = target.closest("a");
  if (!anchor || anchor.hasAttribute("download")) {
    return null;
  }

  if (anchor.target && anchor.target !== "_self") {
    return null;
  }

  const href = anchor.getAttribute("href");
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return null;
  }

  try {
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) {
      return null;
    }

    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

export function getDocumentLocationKey() {
  return `${window.location.pathname}${window.location.search}`;
}

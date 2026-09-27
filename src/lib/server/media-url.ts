import { HMIS_API_URL } from "@/constants/api";

/**
 * Django stores uploaded files as `/media/...`. The browser is on the web
 * origin, so those paths have to point at the API host that serves media.
 */
export function absoluteMediaUrl(
  url: string | null | undefined,
  apiUrl: string | undefined = HMIS_API_URL,
): string {
  if (!url) {
    return "";
  }

  if (!url.startsWith("/media/") || !apiUrl) {
    return url;
  }

  const baseUrl = apiUrl.replace(/\/api\/v\d+\/?$/, "");
  if (!baseUrl) {
    return url;
  }

  return `${baseUrl}${url}`;
}

export function withBrowserAvatar<T extends { avatar_url?: string | null }>(
  user: T,
): T {
  if (!user.avatar_url?.startsWith("/media/")) {
    return user;
  }

  return {
    ...user,
    avatar_url: absoluteMediaUrl(user.avatar_url),
  };
}

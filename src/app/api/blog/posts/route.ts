import { bffSuccess } from "@/lib/server/bff-response";
import { requireAccessToken } from "@/lib/server/require-access-token";

const PRODUCTION_BLOG_POSTS =
  "https://api.sigmahmis.com/api/v1/blog/posts/?page_size=3";

type BlogCard = {
  title: string;
  excerpt: string;
  published_at: string;
  slug: string;
  category: string | null;
  image_url: string | null;
  image_alt: string | null;
};

function firstCategory(value: unknown) {
  if (!Array.isArray(value)) {
    return null;
  }

  for (const entry of value) {
    if (
      entry &&
      typeof entry === "object" &&
      "title" in entry &&
      typeof entry.title === "string" &&
      entry.title.trim()
    ) {
      return entry.title;
    }
  }

  return null;
}

function httpUrl(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    return trimmed;
  } catch {
    return null;
  }
}

function toCard(value: unknown): BlogCard | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.title !== "string" || typeof record.slug !== "string") {
    return null;
  }

  if (!record.slug.trim() || !record.title.trim()) {
    return null;
  }

  return {
    title: record.title,
    excerpt: typeof record.excerpt === "string" ? record.excerpt : "",
    published_at:
      typeof record.published_at === "string" ? record.published_at : "",
    slug: record.slug,
    category: firstCategory(record.categories),
    image_url: httpUrl(record.main_image_url) ?? httpUrl(record.social_image_url),
    image_alt:
      typeof record.main_image_alt === "string" && record.main_image_alt.trim()
        ? record.main_image_alt.trim()
        : null,
  };
}

export async function GET() {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const response = await fetch(PRODUCTION_BLOG_POSTS, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });

    if (!response.ok) {
      return bffSuccess([]);
    }

    const body = (await response.json()) as { data?: unknown };
    const posts = Array.isArray(body.data)
      ? body.data.map(toCard).filter((post): post is BlogCard => post !== null)
      : [];

    return bffSuccess(posts.slice(0, 3));
  } catch {
    return bffSuccess([]);
  }
}

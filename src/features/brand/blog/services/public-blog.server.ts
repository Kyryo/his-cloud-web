import { HMIS_API_URL } from "@/constants/api";
import type {
  PublicBlogCategory,
  PublicBlogPageResult,
  PublicBlogPost,
  PublicBlogPostQuery,
  PublicBlogSettings,
} from "@/features/brand/blog/types";
import { PUBLIC_BLOG_PAGE_SIZE } from "@/features/brand/blog/utils/format";

type Envelope<T> = {
  data: T;
  meta?: {
    pagination?: {
      count?: number | null;
    };
  };
};

export class PublicBlogApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function apiBase(): string {
  const base = (HMIS_API_URL || "").replace(/\/$/, "");
  if (!base) {
    throw new PublicBlogApiError(500, "HMIS_API_URL is not configured.");
  }
  return base;
}

async function apiGet<T>(path: string): Promise<Envelope<T>> {
  const response = await fetch(`${apiBase()}${path}`, {
    headers: { accept: "application/json" },
    next: { revalidate: 60 },
  });
  const text = await response.text();
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!response.ok) {
    throw new PublicBlogApiError(
      response.status,
      `Blog API returned ${response.status}`,
    );
  }
  return body as Envelope<T>;
}

export async function listPublicBlogPosts(
  query: PublicBlogPostQuery = {},
): Promise<PublicBlogPageResult<PublicBlogPost>> {
  const params = new URLSearchParams();
  params.set("page", String(query.page || 1));
  params.set("page_size", String(query.pageSize || PUBLIC_BLOG_PAGE_SIZE));
  if (query.category) {
    params.set("category", query.category);
  }
  if (query.search) {
    params.set("search", query.search);
  }
  if (query.featured) {
    params.set("featured", "true");
  }
  const payload = await apiGet<PublicBlogPost[]>(
    `/blog/posts/?${params.toString()}`,
  );
  return {
    items: payload.data || [],
    total: payload.meta?.pagination?.count ?? payload.data?.length ?? 0,
  };
}

export async function getPublicBlogPost(
  slug: string,
): Promise<PublicBlogPost | null> {
  try {
    const payload = await apiGet<PublicBlogPost>(
      `/blog/posts/${encodeURIComponent(slug)}/`,
    );
    return payload.data;
  } catch (error) {
    if (error instanceof PublicBlogApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function listPublicBlogCategories(): Promise<PublicBlogCategory[]> {
  const payload = await apiGet<PublicBlogCategory[]>("/blog/categories/");
  return payload.data || [];
}

export async function getPublicBlogSettings(): Promise<PublicBlogSettings> {
  try {
    const payload = await apiGet<PublicBlogSettings>("/blog/settings/");
    return payload.data || { title: "Blog" };
  } catch {
    return {
      title: "Blog",
      description: "Product notes, guides, and clinic stories from Sigma Health.",
    };
  }
}

export async function listIndexablePublicBlogPosts(): Promise<PublicBlogPost[]> {
  const posts: PublicBlogPost[] = [];
  let page = 1;
  while (page <= 20) {
    const result = await listPublicBlogPosts({ page, pageSize: 100 });
    posts.push(...result.items);
    if (posts.length >= result.total || result.items.length === 0) {
      break;
    }
    page += 1;
  }
  return posts.filter((post) => !post.noindex);
}

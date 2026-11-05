import type { PublicBlogPost } from "@/features/brand/blog/types";

export const PUBLIC_BLOG_PAGE_SIZE = 12;

export function formatBlogDate(value?: string | null): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function readingMinutes(text?: string | null): number {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

export function pageCount(total: number, size: number): number {
  return Math.max(1, Math.ceil(total / size));
}

export function pageFromSearch(value?: string | string[]): number {
  const raw = Array.isArray(value) ? value[0] : value;
  return Math.max(1, Number(raw) || 1);
}

export function categoryFromSearch(value?: string | string[]): string {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw || "").trim();
}

export function summaryOf(post: PublicBlogPost): string {
  const seo = post.seo_description?.trim();
  const usefulSeo =
    seo && seo.toLowerCase() !== post.title.trim().toLowerCase() ? seo : "";
  return (post.excerpt || usefulSeo || post.body_text || "")
    .replace(/\s+/g, " ")
    .trim();
}

export function primaryCategory(post: PublicBlogPost): string | null {
  const title = post.categories?.[0]?.title?.trim();
  return title || null;
}

export function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function blogListHref(options: {
  category?: string;
  page?: number;
}): string {
  const params = new URLSearchParams();
  if (options.category) {
    params.set("category", options.category);
  }
  if (options.page && options.page > 1) {
    params.set("page", String(options.page));
  }
  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
}

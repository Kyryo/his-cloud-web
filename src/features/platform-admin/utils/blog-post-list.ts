import { getBlogPostMockViews } from "@/features/platform-admin/constants/blog-mock-stats";
import type { BlogPost } from "@/features/platform-admin/types/blog.types";

export const BLOG_POSTS_PAGE_SIZE = 10;

export const BLOG_POST_SORTS = [
  { value: "updated", label: "Recently updated" },
  { value: "published", label: "Recently published" },
  { value: "title", label: "Title A–Z" },
  { value: "views", label: "Most viewed" },
] as const;

export type BlogPostSort = (typeof BLOG_POST_SORTS)[number]["value"];

export type BlogPostListQuery = {
  search: string;
  status: "all" | "draft" | "published";
  categoryId: string;
  sort: BlogPostSort;
  page: number;
};

export const BLOG_POST_LIST_PARAMS = {
  search: "q",
  status: "status",
  category: "category",
  sort: "sort",
  page: "page",
  create: "new",
} as const;

function readSort(value: string | null): BlogPostSort {
  return BLOG_POST_SORTS.some((option) => option.value === value) ? (value as BlogPostSort) : "updated";
}

function readStatus(value: string | null): BlogPostListQuery["status"] {
  return value === "draft" || value === "published" ? value : "all";
}

export function readBlogPostListQuery(params: URLSearchParams): BlogPostListQuery {
  const page = Number.parseInt(params.get(BLOG_POST_LIST_PARAMS.page) ?? "1", 10);
  return {
    search: params.get(BLOG_POST_LIST_PARAMS.search) ?? "",
    status: readStatus(params.get(BLOG_POST_LIST_PARAMS.status)),
    categoryId: params.get(BLOG_POST_LIST_PARAMS.category) ?? "all",
    sort: readSort(params.get(BLOG_POST_LIST_PARAMS.sort)),
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

function timestamp(value?: string | null): number {
  const time = value ? new Date(value).getTime() : Number.NaN;
  return Number.isNaN(time) ? 0 : time;
}

const SORTERS: Record<BlogPostSort, (a: BlogPost, b: BlogPost) => number> = {
  updated: (a, b) => timestamp(b.updatedAt) - timestamp(a.updatedAt),
  published: (a, b) => timestamp(b.publishedAt) - timestamp(a.publishedAt),
  title: (a, b) => a.title.localeCompare(b.title),
  views: (a, b) => getBlogPostMockViews(b.id) - getBlogPostMockViews(a.id),
};

/** Category filter, sorting and paging happen client-side: the API only filters by status and search. */
export function selectBlogPostPage(posts: BlogPost[], query: BlogPostListQuery) {
  const filtered = query.categoryId === "all"
    ? posts
    : posts.filter((post) => post.categoryIds.includes(query.categoryId));
  const sorted = [...filtered].sort(SORTERS[query.sort]);
  const totalCount = sorted.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / BLOG_POSTS_PAGE_SIZE));
  const page = Math.min(query.page, pageCount);
  const start = (page - 1) * BLOG_POSTS_PAGE_SIZE;
  return {
    rows: sorted.slice(start, start + BLOG_POSTS_PAGE_SIZE),
    totalCount,
    page,
    hasPrevious: page > 1,
    hasNext: page < pageCount,
  };
}

export function countActiveBlogFilters(query: BlogPostListQuery): number {
  return [query.search !== "", query.status !== "all", query.categoryId !== "all"].filter(Boolean).length;
}

export function recentBlogPosts(posts: BlogPost[], limit = 6): BlogPost[] {
  return [...posts].sort(SORTERS.updated).slice(0, limit);
}

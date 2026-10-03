import { BFF_PLATFORM_ADMIN_ROUTES } from "@/constants/api";
import { bffRequest } from "@/lib/bff-client";
import type {
  BlogAuthor,
  BlogAuthorInput,
  BlogCategory,
  BlogCategoryInput,
  BlogCmsStats,
  BlogPost,
  BlogPostInput,
  BlogSiteSettings,
  BlogTag,
  BlogTagInput,
} from "@/features/platform-admin/types/blog.types";

export async function fetchBlogCmsStats(): Promise<BlogCmsStats> {
  return bffRequest<BlogCmsStats>(
    `${BFF_PLATFORM_ADMIN_ROUTES.blogPosts}?stats=1`,
  );
}

export async function fetchBlogPosts(filters?: {
  status?: string;
  search?: string;
}): Promise<{ results: BlogPost[]; count: number }> {
  const params = new URLSearchParams();
  if (filters?.status) {
    params.set("status", filters.status);
  }
  if (filters?.search) {
    params.set("search", filters.search);
  }
  const query = params.toString();
  return bffRequest(
    query
      ? `${BFF_PLATFORM_ADMIN_ROUTES.blogPosts}?${query}`
      : BFF_PLATFORM_ADMIN_ROUTES.blogPosts,
  );
}

export async function fetchBlogPost(postId: string): Promise<BlogPost | null> {
  return bffRequest(BFF_PLATFORM_ADMIN_ROUTES.blogPostDetail(postId));
}

export async function saveBlogPost(
  postId: string,
  input: BlogPostInput,
): Promise<BlogPost> {
  return bffRequest(BFF_PLATFORM_ADMIN_ROUTES.blogPostDetail(postId), {
    method: "PUT",
    body: input,
  });
}

export async function deleteBlogPost(postId: string): Promise<void> {
  await bffRequest(BFF_PLATFORM_ADMIN_ROUTES.blogPostDetail(postId), {
    method: "DELETE",
  });
}

export async function fetchBlogAuthors(): Promise<{
  results: BlogAuthor[];
  count: number;
}> {
  return bffRequest(BFF_PLATFORM_ADMIN_ROUTES.blogAuthors);
}

export async function saveBlogAuthor(
  input: BlogAuthorInput & { id?: string },
): Promise<BlogAuthor> {
  return bffRequest(BFF_PLATFORM_ADMIN_ROUTES.blogAuthors, {
    method: "POST",
    body: input,
  });
}

export async function deleteBlogAuthor(id: string): Promise<void> {
  await bffRequest(
    `${BFF_PLATFORM_ADMIN_ROUTES.blogAuthors}?id=${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

export async function fetchBlogCategories(): Promise<{
  results: BlogCategory[];
  count: number;
}> {
  return bffRequest(BFF_PLATFORM_ADMIN_ROUTES.blogCategories);
}

export async function saveBlogCategory(
  input: BlogCategoryInput & { id?: string },
): Promise<BlogCategory> {
  return bffRequest(BFF_PLATFORM_ADMIN_ROUTES.blogCategories, {
    method: "POST",
    body: input,
  });
}

export async function deleteBlogCategory(id: string): Promise<void> {
  await bffRequest(
    `${BFF_PLATFORM_ADMIN_ROUTES.blogCategories}?id=${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

export async function fetchBlogTags(): Promise<{
  results: BlogTag[];
  count: number;
}> {
  return bffRequest(BFF_PLATFORM_ADMIN_ROUTES.blogTags);
}

export async function saveBlogTag(
  input: BlogTagInput & { id?: string },
): Promise<BlogTag> {
  return bffRequest(BFF_PLATFORM_ADMIN_ROUTES.blogTags, {
    method: "POST",
    body: input,
  });
}

export async function deleteBlogTag(id: string): Promise<void> {
  await bffRequest(
    `${BFF_PLATFORM_ADMIN_ROUTES.blogTags}?id=${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

export async function fetchBlogSettings(): Promise<BlogSiteSettings> {
  return bffRequest(BFF_PLATFORM_ADMIN_ROUTES.blogSettings);
}

export async function saveBlogSettings(
  input: BlogSiteSettings,
): Promise<BlogSiteSettings> {
  return bffRequest(BFF_PLATFORM_ADMIN_ROUTES.blogSettings, {
    method: "PUT",
    body: input,
  });
}

export async function uploadBlogImage(
  file: File,
  folder: "covers" | "authors" | "inline" | "settings" | "social",
): Promise<{ url: string; path: string }> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  return bffRequest(BFF_PLATFORM_ADMIN_ROUTES.blogUploads, {
    method: "POST",
    body: form,
  });
}

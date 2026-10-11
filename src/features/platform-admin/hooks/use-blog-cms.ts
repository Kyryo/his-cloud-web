import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteBlogPost,
  fetchBlogAuthors,
  fetchBlogCategories,
  fetchBlogCmsStats,
  fetchBlogPost,
  fetchBlogPosts,
  fetchBlogTags,
  saveBlogPost,
} from "@/features/platform-admin/services/blog-cms.service";
import type { BlogPost, BlogPostInput } from "@/features/platform-admin/types/blog.types";

export const BLOG_QUERY_KEYS = {
  all: ["platform-admin-blog"] as const,
  stats: () => [...BLOG_QUERY_KEYS.all, "stats"] as const,
  posts: (filters: { status?: string; search?: string }) =>
    [...BLOG_QUERY_KEYS.all, "posts", filters] as const,
  post: (postId: string) => [...BLOG_QUERY_KEYS.all, "post", postId] as const,
  authors: () => [...BLOG_QUERY_KEYS.all, "authors"] as const,
  categories: () => [...BLOG_QUERY_KEYS.all, "categories"] as const,
  tags: () => [...BLOG_QUERY_KEYS.all, "tags"] as const,
};

export function useBlogCmsStats() {
  return useQuery({ queryKey: BLOG_QUERY_KEYS.stats(), queryFn: fetchBlogCmsStats });
}

export function useBlogPosts(filters: { status?: string; search?: string } = {}) {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.posts(filters),
    queryFn: () => fetchBlogPosts(filters),
    placeholderData: (previous) => previous,
  });
}

export function useBlogPost(postId: string) {
  return useQuery({
    queryKey: BLOG_QUERY_KEYS.post(postId),
    queryFn: () => fetchBlogPost(postId),
  });
}

export function useBlogAuthors() {
  return useQuery({ queryKey: BLOG_QUERY_KEYS.authors(), queryFn: fetchBlogAuthors });
}

export function useBlogCategories() {
  return useQuery({ queryKey: BLOG_QUERY_KEYS.categories(), queryFn: fetchBlogCategories });
}

export function useBlogTags() {
  return useQuery({ queryKey: BLOG_QUERY_KEYS.tags(), queryFn: fetchBlogTags });
}

/** Creates (postId "new") or replaces a post, then refreshes every blog query. */
export function useSaveBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, input }: { postId: string; input: BlogPostInput }) => saveBlogPost(postId, input),
    onSuccess: (saved: BlogPost) => {
      queryClient.setQueryData(BLOG_QUERY_KEYS.post(saved.id), saved);
      void queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.all });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBlogPost,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BLOG_QUERY_KEYS.all });
    },
  });
}

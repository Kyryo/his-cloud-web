import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import {
  BLOG_POST_LIST_PARAMS,
  readBlogPostListQuery,
  type BlogPostListQuery,
} from "@/features/platform-admin/utils/blog-post-list";

const DEFAULTS: Record<keyof BlogPostListQuery, string> = {
  search: "",
  status: "all",
  categoryId: "all",
  sort: "updated",
  page: "1",
};

const PARAM_FOR: Record<keyof BlogPostListQuery, string> = {
  search: BLOG_POST_LIST_PARAMS.search,
  status: BLOG_POST_LIST_PARAMS.status,
  categoryId: BLOG_POST_LIST_PARAMS.category,
  sort: BLOG_POST_LIST_PARAMS.sort,
  page: BLOG_POST_LIST_PARAMS.page,
};

/** Posts list filters live in the URL so they survive refreshes and can be shared. */
export function useBlogPostListQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(() => readBlogPostListQuery(new URLSearchParams(searchParams.toString())), [searchParams]);
  const isCreateOpen = searchParams.get(BLOG_POST_LIST_PARAMS.create) === "1";

  const replaceParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      const next = params.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setQuery = useCallback(
    (patch: Partial<BlogPostListQuery>) => {
      replaceParams((params) => {
        const merged: Partial<BlogPostListQuery> = { ...patch };
        if (!("page" in patch)) {
          merged.page = 1;
        }
        for (const [key, value] of Object.entries(merged) as Array<[keyof BlogPostListQuery, string | number]>) {
          const text = String(value);
          if (text === DEFAULTS[key]) {
            params.delete(PARAM_FOR[key]);
          } else {
            params.set(PARAM_FOR[key], text);
          }
        }
      });
    },
    [replaceParams],
  );

  const setCreateOpen = useCallback(
    (open: boolean) => {
      replaceParams((params) => {
        if (open) {
          params.set(BLOG_POST_LIST_PARAMS.create, "1");
        } else {
          params.delete(BLOG_POST_LIST_PARAMS.create);
        }
      });
    },
    [replaceParams],
  );

  return { query, setQuery, isCreateOpen, setCreateOpen };
}

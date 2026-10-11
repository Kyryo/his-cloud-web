import { describe, expect, it } from "vitest";

import { getBlogPostMockStats } from "@/features/platform-admin/constants/blog-mock-stats";
import { blogPostBasicsSchema, togglePublishInput } from "@/features/platform-admin/schemas/blog-post.schema";
import type { BlogPost } from "@/features/platform-admin/types/blog.types";
import {
  BLOG_POSTS_PAGE_SIZE,
  readBlogPostListQuery,
  selectBlogPostPage,
} from "@/features/platform-admin/utils/blog-post-list";

function makePost(index: number, overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    id: `post-${index}`,
    title: `Post ${String(index).padStart(2, "0")}`,
    slug: `post-${index}`,
    kind: "article",
    categoryIds: index % 2 === 0 ? ["even"] : ["odd"],
    tagIds: [],
    featured: false,
    status: "draft",
    noindex: false,
    updatedAt: new Date(2026, 0, index + 1).toISOString(),
    ...overrides,
  };
}

describe("readBlogPostListQuery", () => {
  it("falls back to defaults for missing or invalid params", () => {
    expect(readBlogPostListQuery(new URLSearchParams("status=bogus&sort=nope&page=-2"))).toEqual({
      search: "",
      status: "all",
      categoryId: "all",
      sort: "updated",
      page: 1,
    });
  });
});

describe("selectBlogPostPage", () => {
  const posts = Array.from({ length: 25 }, (_, index) => makePost(index));

  it("sorts by most recently updated and pages the result", () => {
    const page = selectBlogPostPage(posts, readBlogPostListQuery(new URLSearchParams("page=3")));
    expect(page.totalCount).toBe(25);
    expect(page.rows).toHaveLength(25 - 2 * BLOG_POSTS_PAGE_SIZE);
    expect(page.hasNext).toBe(false);
    expect(page.rows[0].id).toBe("post-4");
  });

  it("filters by category and clamps the page", () => {
    const page = selectBlogPostPage(posts, readBlogPostListQuery(new URLSearchParams("category=odd&page=9&sort=title")));
    expect(page.totalCount).toBe(12);
    expect(page.page).toBe(2);
    expect(page.rows.every((post) => post.categoryIds.includes("odd"))).toBe(true);
  });
});

describe("togglePublishInput", () => {
  it("publishes with the current time when no date is set", () => {
    const now = new Date("2026-10-11T10:00:00Z");
    const input = togglePublishInput(makePost(1), now);
    expect(input.status).toBe("published");
    expect(input.publishedAt).toBe(now.toISOString());
  });

  it("keeps the body and dates when unpublishing", () => {
    const body = { type: "doc" as const, content: [{ type: "paragraph" }] };
    const input = togglePublishInput(makePost(1, { status: "published", publishedAt: "2026-01-01T00:00:00Z", body }));
    expect(input.status).toBe("draft");
    expect(input.publishedAt).toBe("2026-01-01T00:00:00Z");
    expect(input.body).toBe(body);
  });
});

describe("blogPostBasicsSchema", () => {
  it("rejects invalid slugs", () => {
    const result = blogPostBasicsSchema.safeParse({
      title: "Hello",
      slug: "Not A Slug",
      excerpt: "",
      authorId: "",
      categoryIds: [],
      tagIds: [],
      mainImageUrl: "",
      mainImageAlt: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("getBlogPostMockStats", () => {
  it("is stable for the same post", () => {
    const date = new Date("2026-10-11T00:00:00Z");
    expect(getBlogPostMockStats("abc", date)).toEqual(getBlogPostMockStats("abc", date));
    expect(getBlogPostMockStats("abc", date).dailyViews).toHaveLength(30);
  });
});

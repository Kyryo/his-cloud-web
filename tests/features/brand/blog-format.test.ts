import { describe, expect, it } from "vitest";

import {
  blogListHref,
  pageFromSearch,
  readingMinutes,
  summaryOf,
} from "@/features/brand/blog/utils/format";
import type { PublicBlogPost } from "@/features/brand/blog/types";

describe("public blog format helpers", () => {
  it("builds list hrefs with category and page", () => {
    expect(blogListHref({})).toBe("/blog");
    expect(blogListHref({ category: "engineering" })).toBe(
      "/blog?category=engineering",
    );
    expect(blogListHref({ category: "engineering", page: 2 })).toBe(
      "/blog?category=engineering&page=2",
    );
    expect(blogListHref({ page: 1 })).toBe("/blog");
  });

  it("parses page search params", () => {
    expect(pageFromSearch(undefined)).toBe(1);
    expect(pageFromSearch("3")).toBe(3);
    expect(pageFromSearch(["2"])).toBe(2);
  });

  it("estimates reading minutes", () => {
    expect(readingMinutes("one two three")).toBe(1);
    expect(readingMinutes(Array.from({ length: 360 }, () => "word").join(" "))).toBe(
      2,
    );
  });

  it("prefers excerpt over seo description for summary", () => {
    const post = {
      title: "Hello",
      excerpt: "Short excerpt",
      seo_description: "SEO description",
      body_text: "Body text",
    } as PublicBlogPost;
    expect(summaryOf(post)).toBe("Short excerpt");
  });
});

import { z } from "zod";

import type { BlogPost, BlogPostInput, BlogPostKind } from "@/features/platform-admin/types/blog.types";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || /^https?:\/\//i.test(value), "Enter a full URL starting with https://");

/** Basic details collected by the New post sheet. */
export const blogPostBasicsSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Keep the title under 200 characters"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(SLUG_PATTERN, "Use lowercase letters, numbers and hyphens"),
  excerpt: z.string().trim().max(500, "Keep the excerpt under 500 characters"),
  authorId: z.string(),
  categoryIds: z.array(z.string()),
  tagIds: z.array(z.string()),
  mainImageUrl: optionalUrl,
  mainImageAlt: z.string().trim().max(200),
});

/** Full metadata edited from the post detail page. */
export const blogPostDetailsSchema = blogPostBasicsSchema.extend({
  kind: z.enum(["article", "news", "product_update", "guide", "case_study", "announcement"]),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
  publishedAt: z.string(),
  seoTitle: z.string().trim().max(200),
  seoDescription: z.string().trim().max(500),
  socialImageUrl: optionalUrl,
  canonicalUrl: optionalUrl,
  noindex: z.boolean(),
});

export type BlogPostBasicsValues = z.infer<typeof blogPostBasicsSchema>;
export type BlogPostDetailsValues = z.infer<typeof blogPostDetailsSchema>;

export const EMPTY_BLOG_POST_BASICS: BlogPostBasicsValues = {
  title: "",
  slug: "",
  excerpt: "",
  authorId: "",
  categoryIds: [],
  tagIds: [],
  mainImageUrl: "",
  mainImageAlt: "",
};

function toDatetimeLocal(value?: string | null): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function toBlogPostDetailsValues(post: BlogPost): BlogPostDetailsValues {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? "",
    authorId: post.authorId ?? "",
    categoryIds: post.categoryIds,
    tagIds: post.tagIds,
    mainImageUrl: post.mainImageUrl ?? "",
    mainImageAlt: post.mainImageAlt ?? "",
    kind: post.kind,
    status: post.status,
    featured: post.featured,
    publishedAt: toDatetimeLocal(post.publishedAt),
    seoTitle: post.seoTitle ?? "",
    seoDescription: post.seoDescription ?? "",
    socialImageUrl: post.socialImageUrl ?? "",
    canonicalUrl: post.canonicalUrl ?? "",
    noindex: post.noindex,
  };
}

/** The API replaces the whole post on save, so every write starts from the current post. */
export function toBlogPostInput(post: BlogPost, overrides: Partial<BlogPostInput> = {}): BlogPostInput {
  return {
    title: post.title,
    slug: post.slug,
    kind: post.kind,
    excerpt: post.excerpt ?? "",
    authorId: post.authorId ?? null,
    mainImageUrl: post.mainImageUrl ?? null,
    mainImageAlt: post.mainImageAlt ?? null,
    categoryIds: post.categoryIds,
    tagIds: post.tagIds,
    publishedAt: post.publishedAt ?? null,
    featured: post.featured,
    status: post.status,
    body: post.body ?? { type: "doc", content: [] },
    bodyText: post.bodyText ?? "",
    seoTitle: post.seoTitle ?? "",
    seoDescription: post.seoDescription ?? "",
    socialImageUrl: post.socialImageUrl ?? null,
    canonicalUrl: post.canonicalUrl ?? null,
    noindex: post.noindex,
    ...overrides,
  };
}

export function basicsToCreateInput(values: BlogPostBasicsValues, kind: BlogPostKind = "article"): BlogPostInput {
  return {
    title: values.title,
    slug: values.slug,
    kind,
    excerpt: values.excerpt,
    authorId: values.authorId || null,
    categoryIds: values.categoryIds,
    tagIds: values.tagIds,
    mainImageUrl: values.mainImageUrl || null,
    mainImageAlt: values.mainImageAlt || null,
    status: "draft",
    featured: false,
    publishedAt: null,
    body: { type: "doc", content: [] },
    bodyText: "",
    noindex: false,
  };
}

export function detailsToUpdateInput(post: BlogPost, values: BlogPostDetailsValues): BlogPostInput {
  return toBlogPostInput(post, {
    title: values.title,
    slug: values.slug,
    excerpt: values.excerpt,
    authorId: values.authorId || null,
    categoryIds: values.categoryIds,
    tagIds: values.tagIds,
    mainImageUrl: values.mainImageUrl || null,
    mainImageAlt: values.mainImageAlt || null,
    kind: values.kind,
    status: values.status,
    featured: values.featured,
    publishedAt: fromDatetimeLocal(values.publishedAt),
    seoTitle: values.seoTitle,
    seoDescription: values.seoDescription,
    socialImageUrl: values.socialImageUrl || null,
    canonicalUrl: values.canonicalUrl || null,
    noindex: values.noindex,
  });
}

/** Publishing without a date stamps it now so the post appears on the public site. */
export function togglePublishInput(post: BlogPost, now = new Date()): BlogPostInput {
  const publishing = post.status !== "published";
  return toBlogPostInput(post, {
    status: publishing ? "published" : "draft",
    publishedAt: publishing ? post.publishedAt ?? now.toISOString() : post.publishedAt ?? null,
  });
}

export type BlogPostStatus = "draft" | "published";

export type BlogPostKind =
  | "article"
  | "news"
  | "product_update"
  | "guide"
  | "case_study"
  | "announcement";

export const BLOG_POST_KINDS: { value: BlogPostKind; label: string }[] = [
  { value: "article", label: "Article" },
  { value: "news", label: "News" },
  { value: "product_update", label: "Product update" },
  { value: "guide", label: "Guide" },
  { value: "case_study", label: "Case study" },
  { value: "announcement", label: "Announcement" },
];

export type TipTapDoc = {
  type: "doc";
  content?: TipTapNode[];
};

export type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  text?: string;
  content?: TipTapNode[];
};

export type BlogAuthor = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  bio?: TipTapDoc | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BlogCategory = {
  id: string;
  title: string;
  slug: string;
  color?: string | null;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BlogTag = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  kind: BlogPostKind;
  excerpt?: string | null;
  authorId?: string | null;
  author?: BlogAuthor | null;
  mainImageUrl?: string | null;
  mainImageAlt?: string | null;
  categoryIds: string[];
  categories?: BlogCategory[];
  tagIds: string[];
  tags?: BlogTag[];
  publishedAt?: string | null;
  featured: boolean;
  status: BlogPostStatus;
  body?: TipTapDoc | null;
  bodyText?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  socialImageUrl?: string | null;
  canonicalUrl?: string | null;
  noindex: boolean;
  createdAt?: string;
  updatedAt?: string;
  updatedByEmail?: string | null;
};

export type BlogSiteSettings = {
  title?: string;
  url?: string;
  copyright?: string;
  logoUrl?: string | null;
  logoAltUrl?: string | null;
  email?: string;
  phone?: string;
  w3ckey?: string;
  social?: Array<{ media: string; url: string }>;
  description?: string;
  openGraphImageUrl?: string | null;
  updatedAt?: string;
  updatedByEmail?: string | null;
};

export type BlogPostInput = {
  title: string;
  slug: string;
  kind?: BlogPostKind;
  excerpt?: string;
  authorId?: string | null;
  mainImageUrl?: string | null;
  mainImageAlt?: string | null;
  categoryIds?: string[];
  tagIds?: string[];
  publishedAt?: string | null;
  featured?: boolean;
  status: BlogPostStatus;
  body?: TipTapDoc | null;
  bodyText?: string;
  seoTitle?: string;
  seoDescription?: string;
  socialImageUrl?: string | null;
  canonicalUrl?: string | null;
  noindex?: boolean;
};

export type BlogAuthorInput = {
  name: string;
  slug: string;
  imageUrl?: string | null;
  bio?: TipTapDoc | null;
};

export type BlogCategoryInput = {
  title: string;
  slug: string;
  color?: string;
  description?: string;
};

export type BlogTagInput = {
  title: string;
  slug: string;
  description?: string;
};

export type BlogCmsStats = {
  posts: number;
  published: number;
  drafts: number;
  authors: number;
  categories: number;
  tags: number;
};

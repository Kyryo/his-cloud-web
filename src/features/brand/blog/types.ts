export type PublicBlogTipTapDoc = {
  type: "doc";
  content?: PublicBlogTipTapNode[];
};

export type PublicBlogTipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  text?: string;
  content?: PublicBlogTipTapNode[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
};

export type PublicBlogAuthor = {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
};

export type PublicBlogCategory = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
};

export type PublicBlogTag = {
  id: string;
  title: string;
  slug: string;
};

export type PublicBlogPost = {
  id: string;
  title: string;
  slug: string;
  kind: string;
  excerpt?: string | null;
  author?: PublicBlogAuthor | null;
  main_image_url?: string | null;
  main_image_alt?: string | null;
  categories?: PublicBlogCategory[];
  tags?: PublicBlogTag[];
  published_at?: string | null;
  updated_at?: string | null;
  featured?: boolean;
  body?: PublicBlogTipTapDoc | null;
  body_text?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  social_image_url?: string | null;
  canonical_url?: string | null;
  noindex?: boolean;
  redirect_to?: string | null;
  related?: PublicBlogPost[];
};

export type PublicBlogSettings = {
  title?: string;
  url?: string;
  description?: string;
  open_graph_image_url?: string | null;
};

export type PublicBlogPageResult<T> = {
  items: T[];
  total: number;
};

export type PublicBlogPostQuery = {
  page?: number;
  pageSize?: number;
  category?: string;
  featured?: boolean;
  search?: string;
};

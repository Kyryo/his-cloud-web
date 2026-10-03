import { HmisApiError, hmisApiRequest } from "@/lib/server/hmis-api";
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
  TipTapDoc,
} from "@/features/platform-admin/types/blog.types";

const BLOG_API = "/platform-admin/blog";

type ApiAuthor = {
  id: string;
  name: string;
  slug: string;
  image_url?: string | null;
  bio?: TipTapDoc | null;
  created_at?: string;
  updated_at?: string;
};

type ApiCategory = {
  id: string;
  title: string;
  slug: string;
  color?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

type ApiTag = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

type ApiPost = {
  id: string;
  title: string;
  slug: string;
  kind?: BlogPost["kind"];
  excerpt?: string | null;
  author_id?: string | null;
  author?: ApiAuthor | null;
  main_image_url?: string | null;
  main_image_alt?: string | null;
  category_ids?: string[];
  categories?: ApiCategory[];
  tag_ids?: string[];
  tags?: ApiTag[];
  published_at?: string | null;
  featured?: boolean;
  status?: BlogPost["status"];
  body?: TipTapDoc | null;
  body_text?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  social_image_url?: string | null;
  canonical_url?: string | null;
  noindex?: boolean;
  created_at?: string;
  updated_at?: string;
  updated_by_email?: string | null;
};

type ApiSettings = {
  title?: string;
  url?: string;
  copyright?: string;
  logo_url?: string | null;
  logo_alt_url?: string | null;
  email?: string;
  phone?: string;
  w3ckey?: string;
  social?: BlogSiteSettings["social"];
  description?: string;
  open_graph_image_url?: string | null;
  updated_at?: string;
  updated_by_email?: string | null;
};

function mapAuthor(row: ApiAuthor): BlogAuthor {
  return {
    id: row.id,
    name: row.name || "",
    slug: row.slug || "",
    imageUrl: row.image_url || null,
    bio: row.bio ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCategory(row: ApiCategory): BlogCategory {
  return {
    id: row.id,
    title: row.title || "",
    slug: row.slug || "",
    color: row.color || null,
    description: row.description || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTag(row: ApiTag): BlogTag {
  return {
    id: row.id,
    title: row.title || "",
    slug: row.slug || "",
    description: row.description || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPost(row: ApiPost): BlogPost {
  return {
    id: row.id,
    title: row.title || "",
    slug: row.slug || "",
    kind: row.kind || "article",
    excerpt: row.excerpt || null,
    authorId: row.author_id || null,
    author: row.author ? mapAuthor(row.author) : null,
    mainImageUrl: row.main_image_url || null,
    mainImageAlt: row.main_image_alt || null,
    categoryIds: row.category_ids || [],
    categories: (row.categories || []).map(mapCategory),
    tagIds: row.tag_ids || [],
    tags: (row.tags || []).map(mapTag),
    publishedAt: row.published_at || null,
    featured: Boolean(row.featured),
    status: row.status || "draft",
    body: row.body ?? null,
    bodyText: row.body_text || "",
    seoTitle: row.seo_title || null,
    seoDescription: row.seo_description || null,
    socialImageUrl: row.social_image_url || null,
    canonicalUrl: row.canonical_url || null,
    noindex: Boolean(row.noindex),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    updatedByEmail: row.updated_by_email || null,
  };
}

function mapSettings(row: ApiSettings | null): BlogSiteSettings {
  if (!row) {
    return { title: "Blog", social: [] };
  }
  return {
    title: row.title,
    url: row.url,
    copyright: row.copyright,
    logoUrl: row.logo_url || null,
    logoAltUrl: row.logo_alt_url || null,
    email: row.email,
    phone: row.phone,
    w3ckey: row.w3ckey,
    social: row.social || [],
    description: row.description,
    openGraphImageUrl: row.open_graph_image_url || null,
    updatedAt: row.updated_at,
    updatedByEmail: row.updated_by_email || null,
  };
}

export async function getBlogCmsStats(token: string): Promise<BlogCmsStats> {
  return hmisApiRequest<BlogCmsStats>(`${BLOG_API}/stats/`, { token });
}

export async function listBlogPostsAdmin(
  token: string,
  options?: { status?: string; search?: string },
): Promise<BlogPost[]> {
  const params = new URLSearchParams();
  if (options?.status) {
    params.set("status", options.status);
  }
  if (options?.search) {
    params.set("search", options.search);
  }
  const query = params.toString();
  const rows = await hmisApiRequest<ApiPost[]>(
    query ? `${BLOG_API}/posts/?${query}` : `${BLOG_API}/posts/`,
    { token },
  );
  return rows.map(mapPost);
}

export async function getBlogPostAdmin(
  token: string,
  id: string,
): Promise<BlogPost | null> {
  try {
    const row = await hmisApiRequest<ApiPost>(`${BLOG_API}/posts/${id}/`, {
      token,
    });
    return mapPost(row);
  } catch (error) {
    if (error instanceof HmisApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function saveBlogPostAdmin(
  token: string,
  input: BlogPostInput,
  id?: string,
): Promise<BlogPost> {
  const body = {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt || "",
    author_id: input.authorId || null,
    main_image_url: input.mainImageUrl || "",
    main_image_alt: input.mainImageAlt || "",
    category_ids: input.categoryIds || [],
    tag_ids: input.tagIds || [],
    published_at: input.publishedAt || null,
    featured: Boolean(input.featured),
    status: input.status,
    kind: input.kind || "article",
    body: input.body || { type: "doc", content: [] },
    body_text: input.bodyText || "",
    seo_title: input.seoTitle || "",
    seo_description: input.seoDescription || "",
    social_image_url: input.socialImageUrl || "",
    canonical_url: input.canonicalUrl || "",
    noindex: Boolean(input.noindex),
  };
  const row = await hmisApiRequest<ApiPost>(
    id ? `${BLOG_API}/posts/${id}/` : `${BLOG_API}/posts/`,
    {
      method: id ? "PUT" : "POST",
      token,
      body,
    },
  );
  return mapPost(row);
}

export async function deleteBlogPostAdmin(token: string, id: string): Promise<void> {
  await hmisApiRequest(`${BLOG_API}/posts/${id}/`, {
    method: "DELETE",
    token,
  });
}

export async function listBlogAuthorsAdmin(token: string): Promise<BlogAuthor[]> {
  const rows = await hmisApiRequest<ApiAuthor[]>(`${BLOG_API}/authors/`, { token });
  return rows.map(mapAuthor);
}

export async function saveBlogAuthorAdmin(
  token: string,
  input: BlogAuthorInput,
  id?: string,
): Promise<BlogAuthor> {
  const body = {
    name: input.name,
    slug: input.slug,
    image_url: input.imageUrl || "",
    bio: input.bio ?? null,
  };
  const row = await hmisApiRequest<ApiAuthor>(
    id ? `${BLOG_API}/authors/${id}/` : `${BLOG_API}/authors/`,
    {
      method: id ? "PUT" : "POST",
      token,
      body,
    },
  );
  return mapAuthor(row);
}

export async function deleteBlogAuthorAdmin(token: string, id: string): Promise<void> {
  await hmisApiRequest(`${BLOG_API}/authors/${id}/`, {
    method: "DELETE",
    token,
  });
}

export async function listBlogCategoriesAdmin(
  token: string,
): Promise<BlogCategory[]> {
  const rows = await hmisApiRequest<ApiCategory[]>(`${BLOG_API}/categories/`, {
    token,
  });
  return rows.map(mapCategory);
}

export async function saveBlogCategoryAdmin(
  token: string,
  input: BlogCategoryInput,
  id?: string,
): Promise<BlogCategory> {
  const body = {
    title: input.title,
    slug: input.slug,
    color: input.color || "blue",
    description: input.description || "",
  };
  const row = await hmisApiRequest<ApiCategory>(
    id ? `${BLOG_API}/categories/${id}/` : `${BLOG_API}/categories/`,
    {
      method: id ? "PUT" : "POST",
      token,
      body,
    },
  );
  return mapCategory(row);
}

export async function deleteBlogCategoryAdmin(
  token: string,
  id: string,
): Promise<void> {
  await hmisApiRequest(`${BLOG_API}/categories/${id}/`, {
    method: "DELETE",
    token,
  });
}

export async function listBlogTagsAdmin(token: string): Promise<BlogTag[]> {
  const rows = await hmisApiRequest<ApiTag[]>(`${BLOG_API}/tags/`, { token });
  return rows.map(mapTag);
}

export async function saveBlogTagAdmin(
  token: string,
  input: BlogTagInput,
  id?: string,
): Promise<BlogTag> {
  const body = {
    title: input.title,
    slug: input.slug,
    description: input.description || "",
  };
  const row = await hmisApiRequest<ApiTag>(
    id ? `${BLOG_API}/tags/${id}/` : `${BLOG_API}/tags/`,
    {
      method: id ? "PUT" : "POST",
      token,
      body,
    },
  );
  return mapTag(row);
}

export async function deleteBlogTagAdmin(token: string, id: string): Promise<void> {
  await hmisApiRequest(`${BLOG_API}/tags/${id}/`, {
    method: "DELETE",
    token,
  });
}

export async function getBlogSettingsAdmin(token: string): Promise<BlogSiteSettings> {
  const row = await hmisApiRequest<ApiSettings>(`${BLOG_API}/settings/`, { token });
  return mapSettings(row);
}

export async function saveBlogSettingsAdmin(
  token: string,
  input: BlogSiteSettings,
): Promise<BlogSiteSettings> {
  const row = await hmisApiRequest<ApiSettings>(`${BLOG_API}/settings/`, {
    method: "PUT",
    token,
    body: {
      title: input.title || "",
      url: input.url || "",
      copyright: input.copyright || "",
      logo_url: input.logoUrl || "",
      logo_alt_url: input.logoAltUrl || "",
      email: input.email || "",
      phone: input.phone || "",
      w3ckey: input.w3ckey || "",
      social: input.social || [],
      description: input.description || "",
      open_graph_image_url: input.openGraphImageUrl || "",
    },
  });
  return mapSettings(row);
}

export async function uploadBlogImageAdmin(
  token: string,
  file: File,
  folder: "covers" | "authors" | "inline" | "settings" | "social",
): Promise<{ url: string; path: string }> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  return hmisApiRequest(`${BLOG_API}/uploads/`, {
    method: "POST",
    token,
    body: form,
  });
}

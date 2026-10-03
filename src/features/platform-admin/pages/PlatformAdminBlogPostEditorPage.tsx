"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/constants/routes";
import {
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { BlogTipTapEditor } from "@/features/platform-admin/components/blog/BlogTipTapEditor";
import {
  fetchBlogAuthors,
  fetchBlogCategories,
  fetchBlogPost,
  fetchBlogTags,
  saveBlogPost,
  uploadBlogImage,
} from "@/features/platform-admin/services/blog-cms.service";
import type {
  BlogAuthor,
  BlogCategory,
  BlogPostKind,
  BlogPostStatus,
  BlogTag,
  TipTapDoc,
} from "@/features/platform-admin/types/blog.types";
import { BLOG_POST_KINDS } from "@/features/platform-admin/types/blog.types";
import { useToast } from "@/providers/toast-provider";

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

function slugifyClient(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function PlatformAdminBlogPostEditorPage() {
  const params = useParams<{ postId: string }>();
  const postId = params?.postId || "new";
  const isNew = postId === "new";
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [kind, setKind] = useState<BlogPostKind>("article");
  const [excerpt, setExcerpt] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [status, setStatus] = useState<BlogPostStatus>("draft");
  const [featured, setFeatured] = useState(false);
  const [publishedAt, setPublishedAt] = useState("");
  const [mainImageUrl, setMainImageUrl] = useState("");
  const [mainImageAlt, setMainImageAlt] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [socialImageUrl, setSocialImageUrl] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [noindex, setNoindex] = useState(false);
  const [body, setBody] = useState<TipTapDoc | null>(null);
  const [bodyText, setBodyText] = useState("");
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const [authorsRes, categoriesRes, tagsRes] = await Promise.all([
          fetchBlogAuthors(),
          fetchBlogCategories(),
          fetchBlogTags(),
        ]);
        setAuthors(authorsRes.results);
        setCategories(categoriesRes.results);
        setTags(tagsRes.results);
        if (!isNew) {
          const post = await fetchBlogPost(postId);
          if (!post) {
            toast({ variant: "error", title: "Post not found" });
            router.replace(ROUTES.platformAdminBlogPosts);
            return;
          }
          setTitle(post.title);
          setSlug(post.slug);
          setKind(post.kind || "article");
          setExcerpt(post.excerpt || "");
          setAuthorId(post.authorId || "");
          setCategoryIds(post.categoryIds || []);
          setTagIds(post.tagIds || []);
          setStatus(post.status);
          setFeatured(post.featured);
          setPublishedAt(toDatetimeLocal(post.publishedAt));
          setMainImageUrl(post.mainImageUrl || "");
          setMainImageAlt(post.mainImageAlt || "");
          setSeoTitle(post.seoTitle || "");
          setSeoDescription(post.seoDescription || "");
          setSocialImageUrl(post.socialImageUrl || "");
          setCanonicalUrl(post.canonicalUrl || "");
          setNoindex(post.noindex);
          setBody(post.body || null);
          setBodyText(post.bodyText || "");
        }
      } catch (error) {
        toast({
          variant: "error",
          title: "Unable to load editor",
          description:
            error instanceof Error ? error.message : "Something went wrong.",
        });
      } finally {
        setLoaded(true);
      }
    })();
  }, [isNew, postId, router, toast]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await saveBlogPost(isNew ? "new" : postId, {
        title,
        slug: slug || slugifyClient(title),
        kind,
        excerpt,
        authorId: authorId || null,
        categoryIds,
        tagIds,
        status,
        featured,
        publishedAt: fromDatetimeLocal(publishedAt),
        mainImageUrl: mainImageUrl || null,
        mainImageAlt,
        seoTitle,
        seoDescription,
        socialImageUrl: socialImageUrl || null,
        canonicalUrl: canonicalUrl || null,
        noindex,
        body: body || { type: "doc", content: [] },
        bodyText,
      });
      toast({ variant: "success", title: "Post saved" });
      if (isNew) {
        router.replace(ROUTES.platformAdminBlogPost(saved.id));
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "Save failed",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <ListPageLayout data-testid="platform-admin-blog-post-editor">
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title={isNew ? "New blog post" : "Edit blog post"}
            description="Changes are saved through the platform API and served by the public blog app."
          />
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={ROUTES.platformAdminBlogPosts}>Back</Link>
            </Button>
            <Button type="submit" form="blog-post-form" disabled={!loaded || saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <ListPageTableSection>
        {!loaded ? (
          <p className="text-sm text-brand-muted">Loading…</p>
        ) : (
          <form id="blog-post-form" onSubmit={(e) => void onSubmit(e)} className="space-y-6">
            <div className="grid gap-4 rounded-xl border border-brand-border bg-white p-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (isNew || !slug) {
                      setSlug(slugifyClient(e.target.value));
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  required
                  value={slug}
                  onChange={(e) => setSlug(slugifyClient(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BlogPostStatus)}
                  className="h-9 w-full rounded-md border border-brand-border bg-white px-3 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kind">Kind</Label>
                <select
                  id="kind"
                  value={kind}
                  onChange={(e) => setKind(e.target.value as BlogPostKind)}
                  className="h-9 w-full rounded-md border border-brand-border bg-white px-3 text-sm"
                >
                  {BLOG_POST_KINDS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="publishedAt">Publish date</Label>
                <Input
                  id="publishedAt"
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                />
                <p className="text-xs text-brand-muted">
                  A future date stays off the public site until that time.
                </p>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  rows={3}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <select
                  id="author"
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  className="h-9 w-full rounded-md border border-brand-border bg-white px-3 text-sm"
                >
                  <option value="">—</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 pt-7 text-sm">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                Featured
              </label>
              <div className="md:col-span-2">
                <p className="mb-2 text-sm font-medium">Categories</p>
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => {
                    const checked = categoryIds.includes(category.id);
                    return (
                      <label key={category.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setCategoryIds((current) =>
                              checked
                                ? current.filter((id) => id !== category.id)
                                : [...current, category.id],
                            )
                          }
                        />
                        {category.title}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="mb-2 text-sm font-medium">Tags</p>
                <div className="flex flex-wrap gap-3">
                  {tags.map((tag) => {
                    const checked = tagIds.includes(tag.id);
                    return (
                      <label key={tag.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setTagIds((current) =>
                              checked
                                ? current.filter((id) => id !== tag.id)
                                : [...current, tag.id],
                            )
                          }
                        />
                        {tag.title}
                      </label>
                    );
                  })}
                  {tags.length === 0 ? (
                    <p className="text-sm text-brand-muted">No tags yet.</p>
                  ) : null}
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Cover image</Label>
                <div className="flex flex-wrap gap-2">
                  <Input
                    value={mainImageUrl}
                    onChange={(e) => setMainImageUrl(e.target.value)}
                    placeholder="https://…"
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) {
                        return;
                      }
                      void uploadBlogImage(file, "covers")
                        .then((uploaded) => setMainImageUrl(uploaded.url))
                        .catch((error) =>
                          toast({
                            variant: "error",
                            title: "Upload failed",
                            description:
                              error instanceof Error
                                ? error.message
                                : "Something went wrong.",
                          }),
                        );
                    }}
                  />
                </div>
                {mainImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mainImageUrl}
                    alt={mainImageAlt || ""}
                    className="mt-3 h-40 rounded-md object-cover"
                  />
                ) : null}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="alt">Cover alt text</Label>
                <Input
                  id="alt"
                  value={mainImageAlt}
                  onChange={(e) => setMainImageAlt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO title</Label>
                <Input
                  id="seoTitle"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="canonical">Canonical URL</Label>
                <Input
                  id="canonical"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://…"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="seoDescription">SEO description</Label>
                <Textarea
                  id="seoDescription"
                  rows={3}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Social image</Label>
                <div className="flex flex-wrap gap-2">
                  <Input
                    value={socialImageUrl}
                    onChange={(e) => setSocialImageUrl(e.target.value)}
                    placeholder="https://…"
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) {
                        return;
                      }
                      void uploadBlogImage(file, "social")
                        .then((uploaded) => setSocialImageUrl(uploaded.url))
                        .catch((error) =>
                          toast({
                            variant: "error",
                            title: "Upload failed",
                            description:
                              error instanceof Error
                                ? error.message
                                : "Something went wrong.",
                          }),
                        );
                    }}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm md:col-span-2">
                <input
                  type="checkbox"
                  checked={noindex}
                  onChange={(e) => setNoindex(e.target.checked)}
                />
                Hide from search engines
              </label>
            </div>

            <div className="space-y-2">
              <Label>Body</Label>
              <BlogTipTapEditor
                value={body}
                onChange={(doc, text) => {
                  setBody(doc);
                  setBodyText(text);
                }}
              />
            </div>
          </form>
        )}
      </ListPageTableSection>
    </ListPageLayout>
  );
}

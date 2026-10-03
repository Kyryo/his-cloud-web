"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  deleteBlogAuthor,
  fetchBlogAuthors,
  saveBlogAuthor,
  uploadBlogImage,
} from "@/features/platform-admin/services/blog-cms.service";
import type { BlogAuthor, TipTapDoc } from "@/features/platform-admin/types/blog.types";
import { useToast } from "@/providers/toast-provider";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function PlatformAdminBlogAuthorsPage() {
  const { toast } = useToast();
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [bio, setBio] = useState<TipTapDoc | null>(null);

  const load = useCallback(async () => {
    const response = await fetchBlogAuthors();
    setAuthors(response.results);
  }, []);

  useEffect(() => {
    void load().catch((error) =>
      toast({
        variant: "error",
        title: "Unable to load authors",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      }),
    );
  }, [load, toast]);

  function reset() {
    setEditingId(undefined);
    setName("");
    setSlug("");
    setImageUrl("");
    setBio(null);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await saveBlogAuthor({
        id: editingId,
        name,
        slug: slug || slugify(name),
        imageUrl: imageUrl || null,
        bio,
      });
      toast({ variant: "success", title: "Author saved" });
      reset();
      await load();
    } catch (error) {
      toast({
        variant: "error",
        title: "Save failed",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  return (
    <ListPageLayout data-testid="platform-admin-blog-authors">
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="Blog authors"
            description="Authors appear on post bylines on the public blog."
          />
          <Button asChild variant="outline">
            <Link href={ROUTES.platformAdminBlog}>Hub</Link>
          </Button>
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <ListPageTableSection>
        <div className="grid gap-6 lg:grid-cols-2">
          <ul className="divide-y divide-brand-border rounded-xl border border-brand-border bg-white">
            {authors.map((author) => (
              <li
                key={author.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-brand-navy">{author.name}</p>
                  <p className="text-xs text-brand-muted">/{author.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(author.id);
                      setName(author.name);
                      setSlug(author.slug);
                      setImageUrl(author.imageUrl || "");
                      setBio(author.bio || null);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                    onClick={() => {
                      if (!window.confirm(`Delete ${author.name}?`)) {
                        return;
                      }
                      void deleteBlogAuthor(author.id)
                        .then(load)
                        .then(() =>
                          toast({ variant: "success", title: "Author deleted" }),
                        );
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
            {authors.length === 0 ? (
              <li className="px-4 py-8 text-sm text-brand-muted">No authors yet.</li>
            ) : null}
          </ul>

          <form
            onSubmit={(e) => void onSubmit(e)}
            className="space-y-4 rounded-xl border border-brand-border bg-white p-4"
          >
            <h2 className="text-base font-semibold">
              {editingId ? "Edit author" : "Add author"}
            </h2>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingId) {
                    setSlug(slugify(e.target.value));
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                required
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) {
                    return;
                  }
                  void uploadBlogImage(file, "authors").then((uploaded) =>
                    setImageUrl(uploaded.url),
                  );
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <BlogTipTapEditor value={bio} onChange={(doc) => setBio(doc)} />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={reset}>
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </div>
      </ListPageTableSection>
    </ListPageLayout>
  );
}

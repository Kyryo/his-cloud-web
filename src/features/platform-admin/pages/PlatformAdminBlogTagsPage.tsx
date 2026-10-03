"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

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
import {
  deleteBlogTag,
  fetchBlogTags,
  saveBlogTag,
} from "@/features/platform-admin/services/blog-cms.service";
import type { BlogTag } from "@/features/platform-admin/types/blog.types";
import { useToast } from "@/providers/toast-provider";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function PlatformAdminBlogTagsPage() {
  const { toast } = useToast();
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const load = useCallback(async () => {
    const response = await fetchBlogTags();
    setTags(response.results);
  }, []);

  useEffect(() => {
    void load().catch((error) =>
      toast({
        variant: "error",
        title: "Unable to load tags",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      }),
    );
  }, [load, toast]);

  function reset() {
    setEditingId(undefined);
    setTitle("");
    setSlug("");
    setDescription("");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await saveBlogTag({
        id: editingId,
        title,
        slug: slug || slugify(title),
        description,
      });
      toast({ variant: "success", title: "Tag saved" });
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
    <ListPageLayout data-testid="platform-admin-blog-tags">
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="Blog tags"
            description="Cross-cutting labels for public tag pages and search."
          />
          <Button asChild variant="outline">
            <Link href={ROUTES.platformAdminBlog}>Hub</Link>
          </Button>
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <ListPageTableSection>
        <div className="grid gap-6 lg:grid-cols-2">
          <ul className="divide-y divide-brand-border rounded-xl border border-brand-border bg-white">
            {tags.map((tag) => (
              <li
                key={tag.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-brand-navy">{tag.title}</p>
                  <p className="text-xs text-brand-muted">/{tag.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(tag.id);
                      setTitle(tag.title);
                      setSlug(tag.slug);
                      setDescription(tag.description || "");
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
                      if (!window.confirm(`Delete ${tag.title}?`)) {
                        return;
                      }
                      void deleteBlogTag(tag.id)
                        .then(load)
                        .then(() =>
                          toast({ variant: "success", title: "Tag deleted" }),
                        );
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
            {tags.length === 0 ? (
              <li className="px-4 py-8 text-sm text-brand-muted">No tags yet.</li>
            ) : null}
          </ul>

          <form
            onSubmit={(e) => void onSubmit(e)}
            className="space-y-4 rounded-xl border border-brand-border bg-white p-4"
          >
            <h2 className="text-base font-semibold">
              {editingId ? "Edit tag" : "Add tag"}
            </h2>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
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
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
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

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
  deleteBlogCategory,
  fetchBlogCategories,
  saveBlogCategory,
} from "@/features/platform-admin/services/blog-cms.service";
import type { BlogCategory } from "@/features/platform-admin/types/blog.types";
import { useToast } from "@/providers/toast-provider";

const COLORS = ["green", "blue", "purple", "orange"];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function PlatformAdminBlogCategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [color, setColor] = useState("blue");
  const [description, setDescription] = useState("");

  const load = useCallback(async () => {
    const response = await fetchBlogCategories();
    setCategories(response.results);
  }, []);

  useEffect(() => {
    void load().catch((error) =>
      toast({
        variant: "error",
        title: "Unable to load categories",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      }),
    );
  }, [load, toast]);

  function reset() {
    setEditingId(undefined);
    setTitle("");
    setSlug("");
    setColor("blue");
    setDescription("");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await saveBlogCategory({
        id: editingId,
        title,
        slug: slug || slugify(title),
        color,
        description,
      });
      toast({ variant: "success", title: "Category saved" });
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
    <ListPageLayout data-testid="platform-admin-blog-categories">
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="Blog categories"
            description="Organize posts for browse and filter pages on the public blog."
          />
          <Button asChild variant="outline">
            <Link href={ROUTES.platformAdminBlog}>Hub</Link>
          </Button>
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <ListPageTableSection>
        <div className="grid gap-6 lg:grid-cols-2">
          <ul className="divide-y divide-brand-border rounded-xl border border-brand-border bg-white">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-brand-navy">{category.title}</p>
                  <p className="text-xs text-brand-muted">
                    /{category.slug} · {category.color}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(category.id);
                      setTitle(category.title);
                      setSlug(category.slug);
                      setColor(category.color || "blue");
                      setDescription(category.description || "");
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
                      if (!window.confirm(`Delete ${category.title}?`)) {
                        return;
                      }
                      void deleteBlogCategory(category.id)
                        .then(load)
                        .then(() =>
                          toast({
                            variant: "success",
                            title: "Category deleted",
                          }),
                        );
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
            {categories.length === 0 ? (
              <li className="px-4 py-8 text-sm text-brand-muted">
                No categories yet.
              </li>
            ) : null}
          </ul>

          <form
            onSubmit={(e) => void onSubmit(e)}
            className="space-y-4 rounded-xl border border-brand-border bg-white p-4"
          >
            <h2 className="text-base font-semibold">
              {editingId ? "Edit category" : "Add category"}
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
              <Label>Color</Label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-full rounded-md border border-brand-border bg-white px-3 text-sm"
              >
                {COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
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

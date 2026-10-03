"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import {
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import {
  deleteBlogPost,
  fetchBlogPosts,
} from "@/features/platform-admin/services/blog-cms.service";
import type { BlogPost } from "@/features/platform-admin/types/blog.types";
import { useToast } from "@/providers/toast-provider";

export function PlatformAdminBlogPostsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchBlogPosts({
        status: status === "all" ? undefined : status,
        search: search.trim() || undefined,
      });
      setPosts(response.results);
    } catch (error) {
      toast({
        variant: "error",
        title: "Unable to load posts",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [search, status, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ListPageLayout data-testid="platform-admin-blog-posts">
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="Blog posts"
            description="Draft and publish posts for the public blog site."
          />
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={ROUTES.platformAdminBlog}>Hub</Link>
            </Button>
            <Button asChild>
              <Link href={ROUTES.platformAdminBlogPost("new")}>New post</Link>
            </Button>
          </div>
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <ListPageTableSection>
        <div className="mb-4 flex flex-wrap gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, slug, body…"
            className="max-w-xs"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 rounded-md border border-brand-border bg-white px-3 text-sm"
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <Button type="button" variant="outline" onClick={() => void load()}>
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-brand-muted">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-brand-muted">No posts found.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-brand-border bg-brand-canvas/50 text-brand-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-brand-border last:border-0">
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-left font-medium text-brand-navy hover:underline"
                        onClick={() =>
                          router.push(ROUTES.platformAdminBlogPost(post.id))
                        }
                      >
                        {post.title}
                      </button>
                      <div className="text-xs text-brand-muted">/{post.slug}</div>
                    </td>
                    <td className="px-4 py-3 capitalize">{post.status}</td>
                    <td className="px-4 py-3 text-brand-muted">
                      {post.updatedAt
                        ? new Date(post.updatedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="mr-2"
                        onClick={() =>
                          router.push(ROUTES.platformAdminBlogPost(post.id))
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-red-600"
                        onClick={() => {
                          if (!window.confirm(`Delete “${post.title}”?`)) {
                            return;
                          }
                          void deleteBlogPost(post.id)
                            .then(() => {
                              toast({
                                variant: "success",
                                title: "Post deleted",
                              });
                              void load();
                            })
                            .catch((error) =>
                              toast({
                                variant: "error",
                                title: "Delete failed",
                                description:
                                  error instanceof Error
                                    ? error.message
                                    : "Something went wrong.",
                              }),
                            );
                        }}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ListPageTableSection>
    </ListPageLayout>
  );
}

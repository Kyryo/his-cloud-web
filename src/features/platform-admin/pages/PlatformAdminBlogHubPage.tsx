"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { fetchBlogCmsStats } from "@/features/platform-admin/services/blog-cms.service";
import type { BlogCmsStats } from "@/features/platform-admin/types/blog.types";
import { useToast } from "@/providers/toast-provider";

const EMPTY_STATS: BlogCmsStats = {
  posts: 0,
  published: 0,
  drafts: 0,
  authors: 0,
  categories: 0,
  tags: 0,
};

export function PlatformAdminBlogHubPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<BlogCmsStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setStats(await fetchBlogCmsStats());
    } catch (error) {
      toast({
        variant: "error",
        title: "Unable to load blog CMS",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ListPageLayout data-testid="platform-admin-blog-hub">
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="Blog CMS"
            description="Manage public marketing blog content stored in the platform API."
          />
          <Button asChild>
            <Link href={ROUTES.platformAdminBlogPost("new")}>New post</Link>
          </Button>
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <ListPageTableSection>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(
            [
              ["Posts", stats.posts, ROUTES.platformAdminBlogPosts],
              ["Published", stats.published, ROUTES.platformAdminBlogPosts],
              ["Drafts", stats.drafts, `${ROUTES.platformAdminBlogPosts}?status=draft`],
              ["Authors", stats.authors, ROUTES.platformAdminBlogAuthors],
              ["Categories", stats.categories, ROUTES.platformAdminBlogCategories],
              ["Tags", stats.tags, ROUTES.platformAdminBlogTags],
            ] as const
          ).map(([label, value, href]) => (
            <Link
              key={label}
              href={href}
              className="rounded-xl border border-brand-border bg-white p-4 transition-colors hover:border-brand-primary/40"
            >
              <p className="text-sm text-brand-muted">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-brand-navy">
                {isLoading ? "—" : value}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["All posts", ROUTES.platformAdminBlogPosts],
            ["Authors", ROUTES.platformAdminBlogAuthors],
            ["Categories", ROUTES.platformAdminBlogCategories],
            ["Tags", ROUTES.platformAdminBlogTags],
            ["Site settings", ROUTES.platformAdminBlogSettings],
          ].map(([label, href]) => (
            <Button key={href} asChild variant="outline" className="justify-start">
              <Link href={href}>{label}</Link>
            </Button>
          ))}
        </div>
      </ListPageTableSection>
    </ListPageLayout>
  );
}

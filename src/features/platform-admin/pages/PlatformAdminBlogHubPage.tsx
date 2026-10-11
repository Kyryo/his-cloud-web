"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
  PAGE_SECTION_TITLE_CLASS,
} from "@/features/app-shell/components/page-layout";
import { BlogOverviewStats } from "@/features/platform-admin/components/blog/BlogOverviewStats";
import { BlogQuickLinks } from "@/features/platform-admin/components/blog/BlogQuickLinks";
import { BlogRecentPostsList } from "@/features/platform-admin/components/blog/BlogRecentPostsList";
import { useBlogCmsStats, useBlogPosts } from "@/features/platform-admin/hooks/use-blog-cms";
import { BLOG_POST_LIST_PARAMS, recentBlogPosts } from "@/features/platform-admin/utils/blog-post-list";

const NEW_POST_HREF = `${ROUTES.platformAdminBlogPosts}?${BLOG_POST_LIST_PARAMS.create}=1`;

export function PlatformAdminBlogHubPage() {
  const statsQuery = useBlogCmsStats();
  const postsQuery = useBlogPosts();
  const recent = recentBlogPosts(postsQuery.data?.results ?? []);

  return (
    <ListPageLayout data-testid="platform-admin-blog-hub" className="space-y-8">
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="Blog"
            description="Everything published on the public marketing blog."
          />
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={ROUTES.platformAdminBlogPosts}>All posts</Link>
            </Button>
            <Button asChild variant="primary" size="sm">
              <Link href={NEW_POST_HREF}>
                <Plus className="size-4" aria-hidden="true" />
                New post
              </Link>
            </Button>
          </div>
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <section aria-label="Key figures" className="border-y border-dash-border/80 py-5">
        <BlogOverviewStats stats={statsQuery.data} isLoading={statsQuery.isPending} />
        {statsQuery.isError ? (
          <p className="mt-3 text-xs text-red-700">Post counts could not be loaded. Refresh to try again.</p>
        ) : null}
      </section>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="blog-recent-heading">
          <div className="flex items-baseline justify-between">
            <h2 id="blog-recent-heading" className={PAGE_SECTION_TITLE_CLASS}>Recently updated</h2>
            <Link href={ROUTES.platformAdminBlogPosts} className="text-xs font-medium text-brand-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-2">
            {postsQuery.isError ? (
              <p className="py-6 text-sm text-red-700">Posts could not be loaded.</p>
            ) : (
              <BlogRecentPostsList posts={recent} isLoading={postsQuery.isPending} />
            )}
          </div>
        </section>

        <section aria-labelledby="blog-manage-heading">
          <h2 id="blog-manage-heading" className={PAGE_SECTION_TITLE_CLASS}>Manage</h2>
          <div className="mt-2">
            <BlogQuickLinks stats={statsQuery.data} />
          </div>
        </section>
      </div>
    </ListPageLayout>
  );
}

"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_SECTION_TITLE_CLASS } from "@/features/app-shell/components/page-layout";
import { BlogInlineStats } from "@/features/platform-admin/components/blog/BlogInlineStats";
import { BlogSampleDataTag } from "@/features/platform-admin/components/blog/BlogSampleDataTag";
import { getBlogPostMockStats } from "@/features/platform-admin/constants/blog-mock-stats";
import { formatBlogNumber, formatPercentChange } from "@/features/platform-admin/utils/blog-format";
import { cn } from "@/lib/utils";

const BlogPostViewsChart = dynamic(
  () => import("@/features/platform-admin/components/blog/BlogPostViewsChart").then((module) => module.BlogPostViewsChart),
  { ssr: false, loading: () => <Skeleton className="h-48 w-full" /> },
);

type BlogPostStatsSectionProps = {
  postId: string;
};

export function BlogPostStatsSection({ postId }: BlogPostStatsSectionProps) {
  const stats = getBlogPostMockStats(postId);
  const trendUp = stats.viewsChangePercent >= 0;
  return (
    <section aria-labelledby="blog-post-stats-heading" className="space-y-5">
      <div className="flex items-center gap-2">
        <h2 id="blog-post-stats-heading" className={PAGE_SECTION_TITLE_CLASS}>Performance</h2>
        <span className="text-xs text-dash-muted">Last 30 days</span>
        <BlogSampleDataTag />
      </div>
      <BlogInlineStats
        stats={[
          {
            label: "Views",
            value: formatBlogNumber(stats.views),
            hint: <span className={cn(trendUp ? "text-emerald-700" : "text-red-700")}>{formatPercentChange(stats.viewsChangePercent)}</span>,
          },
          { label: "Unique visitors", value: formatBlogNumber(stats.uniqueVisitors) },
          { label: "Avg. read time", value: `${stats.avgReadTimeMinutes} min` },
          { label: "Shares", value: formatBlogNumber(stats.shares) },
          { label: "Comments", value: formatBlogNumber(stats.comments) },
        ]}
      />
      <BlogPostViewsChart data={stats.dailyViews} />
    </section>
  );
}

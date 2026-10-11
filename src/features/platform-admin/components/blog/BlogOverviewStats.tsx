import { BlogInlineStats, type BlogInlineStat } from "@/features/platform-admin/components/blog/BlogInlineStats";
import { BlogSampleDataTag } from "@/features/platform-admin/components/blog/BlogSampleDataTag";
import { BLOG_OVERVIEW_MOCK_STATS } from "@/features/platform-admin/constants/blog-mock-stats";
import type { BlogCmsStats } from "@/features/platform-admin/types/blog.types";
import { formatBlogCompact, formatBlogNumber, formatPercentChange } from "@/features/platform-admin/utils/blog-format";

type BlogOverviewStatsProps = {
  stats?: BlogCmsStats;
  isLoading: boolean;
};

export function BlogOverviewStats({ stats, isLoading }: BlogOverviewStatsProps) {
  const mock = BLOG_OVERVIEW_MOCK_STATS;
  const items: BlogInlineStat[] = [
    { label: "Published", value: formatBlogNumber(stats?.published ?? 0), hint: stats ? `of ${formatBlogNumber(stats.posts)} posts` : undefined },
    { label: "Drafts", value: formatBlogNumber(stats?.drafts ?? 0) },
    {
      label: "Views · 30d",
      value: formatBlogCompact(mock.viewsLast30Days),
      hint: <span className="text-emerald-700">{formatPercentChange(mock.viewsChangePercent)}</span>,
      tag: <BlogSampleDataTag />,
    },
    { label: "Visitors · 30d", value: formatBlogCompact(mock.uniqueVisitorsLast30Days), tag: <BlogSampleDataTag /> },
    { label: "Avg. read time", value: `${mock.avgReadTimeMinutes} min`, tag: <BlogSampleDataTag /> },
  ];
  return <BlogInlineStats stats={items} isLoading={isLoading} />;
}

import { ChevronRight, FileText, FolderTree, Settings, Tags, UserRound, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import type { BlogCmsStats } from "@/features/platform-admin/types/blog.types";

type QuickLink = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  count?: (stats: BlogCmsStats) => number;
};

const QUICK_LINKS: QuickLink[] = [
  { label: "Posts", description: "Write, edit and publish articles", href: ROUTES.platformAdminBlogPosts, icon: FileText, count: (stats) => stats.posts },
  { label: "Authors", description: "People credited on posts", href: ROUTES.platformAdminBlogAuthors, icon: UserRound, count: (stats) => stats.authors },
  { label: "Categories", description: "Top-level topics", href: ROUTES.platformAdminBlogCategories, icon: FolderTree, count: (stats) => stats.categories },
  { label: "Tags", description: "Fine-grained labels", href: ROUTES.platformAdminBlogTags, icon: Tags, count: (stats) => stats.tags },
  { label: "Settings", description: "Site title, logo and social links", href: ROUTES.platformAdminBlogSettings, icon: Settings },
];

type BlogQuickLinksProps = {
  stats?: BlogCmsStats;
};

export function BlogQuickLinks({ stats }: BlogQuickLinksProps) {
  return (
    <ul className="divide-y divide-dash-border/60">
      {QUICK_LINKS.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="group -mx-2 flex items-center gap-3 rounded-md px-2 py-3 transition-colors hover:bg-white/70"
          >
            <link.icon className="size-4 shrink-0 text-dash-muted" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-brand-navy">{link.label}</p>
              <p className="truncate text-xs text-dash-muted">{link.description}</p>
            </div>
            {link.count && stats ? (
              <span className="text-sm tabular-nums text-brand-slate">{link.count(stats)}</span>
            ) : null}
            <ChevronRight className="size-4 text-dash-muted/60 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

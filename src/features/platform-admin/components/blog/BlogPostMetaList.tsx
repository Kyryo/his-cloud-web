import type { ReactNode } from "react";

import { PAGE_SECTION_TITLE_CLASS } from "@/features/app-shell/components/page-layout";
import { BLOG_POST_KINDS, type BlogPost } from "@/features/platform-admin/types/blog.types";
import { formatBlogDateTime } from "@/features/platform-admin/utils/blog-format";

type MetaRow = { label: string; value: ReactNode };

function joinTitles(items?: Array<{ title: string }>): string {
  return items && items.length > 0 ? items.map((item) => item.title).join(", ") : "—";
}

function buildRows(post: BlogPost): MetaRow[] {
  return [
    { label: "Type", value: BLOG_POST_KINDS.find((kind) => kind.value === post.kind)?.label ?? post.kind },
    { label: "Author", value: post.author?.name ?? "—" },
    { label: "Categories", value: joinTitles(post.categories) },
    { label: "Tags", value: joinTitles(post.tags) },
    { label: "Featured", value: post.featured ? "Yes" : "No" },
    { label: "Publish date", value: formatBlogDateTime(post.publishedAt) },
    { label: "Created", value: formatBlogDateTime(post.createdAt) },
    { label: "Last updated", value: formatBlogDateTime(post.updatedAt) },
    { label: "Updated by", value: post.updatedByEmail ?? "—" },
  ];
}

function buildSeoRows(post: BlogPost): MetaRow[] {
  return [
    { label: "SEO title", value: post.seoTitle || "Uses post title" },
    { label: "SEO description", value: post.seoDescription || "Uses excerpt" },
    { label: "Canonical URL", value: post.canonicalUrl || "—" },
    { label: "Search engines", value: post.noindex ? "Hidden" : "Indexed" },
  ];
}

function MetaGroup({ title, rows }: { title: string; rows: MetaRow[] }) {
  return (
    <div>
      <h2 className={PAGE_SECTION_TITLE_CLASS}>{title}</h2>
      <dl className="mt-2 divide-y divide-dash-border/60">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 py-2.5 text-[13px]">
            <dt className="text-dash-muted">{row.label}</dt>
            <dd className="break-words text-brand-slate">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function BlogPostMetaList({ post }: { post: BlogPost }) {
  return (
    <div className="space-y-8">
      <MetaGroup title="Details" rows={buildRows(post)} />
      <MetaGroup title="Search & sharing" rows={buildSeoRows(post)} />
    </div>
  );
}

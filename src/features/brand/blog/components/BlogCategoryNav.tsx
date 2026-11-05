import Link from "next/link";
import { Rss } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import type { PublicBlogCategory } from "@/features/brand/blog/types";
import { blogListHref } from "@/features/brand/blog/utils/format";
import { cn } from "@/lib/utils";

type BlogCategoryNavProps = {
  categories: PublicBlogCategory[];
  activeSlug?: string;
};

export function BlogCategoryNav({
  categories,
  activeSlug = "",
}: BlogCategoryNavProps) {
  const items = [
    { slug: "", title: "All articles" },
    ...categories.map((category) => ({
      slug: category.slug,
      title: category.title,
    })),
  ];

  return (
    <div
      className="flex items-center gap-4 border-b border-[color:var(--landing-border)]"
      data-testid="blog-category-nav"
    >
      <nav
        aria-label="Blog categories"
        className="-mb-px flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const active = activeSlug === item.slug;
          return (
            <Link
              key={item.slug || "all"}
              href={blogListHref({ category: item.slug || undefined })}
              aria-current={active ? "page" : undefined}
              className={cn(
                "landing-focus shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-[14px] font-medium transition-colors",
                active
                  ? "border-[color:var(--landing-teal)] text-[color:var(--landing-ink)]"
                  : "border-transparent text-[color:var(--landing-ledger-ink)] hover:text-[color:var(--landing-ink)]",
              )}
            >
              {item.title}
            </Link>
          );
        })}
      </nav>
      <Link
        href={ROUTES.blogFeed}
        className="landing-focus shrink-0 p-2 text-[color:var(--landing-ledger-ink)] transition-colors hover:text-[color:var(--landing-ink)]"
        aria-label="RSS feed"
      >
        <Rss className="size-4" />
      </Link>
    </div>
  );
}

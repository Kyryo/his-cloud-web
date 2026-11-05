import Link from "next/link";

import { blogListHref, pageCount } from "@/features/brand/blog/utils/format";
import { cn } from "@/lib/utils";

type BlogPaginationProps = {
  page: number;
  total: number;
  pageSize: number;
  category?: string;
};

export function BlogPagination({
  page,
  total,
  pageSize,
  category,
}: BlogPaginationProps) {
  const pages = pageCount(total, pageSize);
  if (pages <= 1) {
    return null;
  }

  const windowStart = Math.max(1, page - 2);
  const windowEnd = Math.min(pages, page + 2);
  const numbers = Array.from(
    { length: windowEnd - windowStart + 1 },
    (_, index) => windowStart + index,
  );

  return (
    <nav
      aria-label="Blog pagination"
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
      data-testid="blog-pagination"
    >
      <PaginationLink
        href={blogListHref({ category, page: page - 1 })}
        disabled={page <= 1}
        label="Previous"
      />
      {windowStart > 1 ? (
        <>
          <PaginationLink
            href={blogListHref({ category, page: 1 })}
            label="1"
            active={page === 1}
          />
          {windowStart > 2 ? (
            <span className="px-1 text-[color:var(--landing-ledger-ink)]">…</span>
          ) : null}
        </>
      ) : null}
      {numbers.map((number) => (
        <PaginationLink
          key={number}
          href={blogListHref({ category, page: number })}
          label={String(number)}
          active={number === page}
        />
      ))}
      {windowEnd < pages ? (
        <>
          {windowEnd < pages - 1 ? (
            <span className="px-1 text-[color:var(--landing-ledger-ink)]">…</span>
          ) : null}
          <PaginationLink
            href={blogListHref({ category, page: pages })}
            label={String(pages)}
            active={page === pages}
          />
        </>
      ) : null}
      <PaginationLink
        href={blogListHref({ category, page: page + 1 })}
        disabled={page >= pages}
        label="Next"
      />
    </nav>
  );
}

function PaginationLink({
  href,
  label,
  active,
  disabled,
}: {
  href: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm text-[color:var(--landing-ledger-ink)]/50">
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "landing-focus inline-flex min-h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-medium transition-colors",
        active
          ? "bg-[color:var(--landing-ink)] text-white"
          : "text-[color:var(--landing-ledger-ink)] hover:bg-[color:var(--landing-warm)] hover:text-[color:var(--landing-ink)]",
      )}
    >
      {label}
    </Link>
  );
}

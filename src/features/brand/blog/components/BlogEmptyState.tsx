import Link from "next/link";

import { ROUTES } from "@/constants/routes";

type BlogEmptyStateProps = {
  title: string;
  description: string;
  showClearFilter?: boolean;
};

export function BlogEmptyState({
  title,
  description,
  showClearFilter = false,
}: BlogEmptyStateProps) {
  return (
    <div
      className="rounded-2xl border border-[color:var(--landing-border)] bg-[color:var(--landing-warm)]/50 px-6 py-16 text-center"
      data-testid="blog-empty-state"
    >
      <h2 className="landing-display text-xl font-semibold text-[color:var(--landing-ink)]">
        {title}
      </h2>
      <p className="landing-body mx-auto mt-3 max-w-md text-[15px] text-[color:var(--landing-ledger-ink)]">
        {description}
      </p>
      {showClearFilter ? (
        <Link
          href={ROUTES.blog}
          className="landing-focus landing-btn-secondary mt-6 inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold"
        >
          View all articles
        </Link>
      ) : null}
    </div>
  );
}

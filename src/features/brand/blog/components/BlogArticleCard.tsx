import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { BlogCoverImage } from "@/features/brand/blog/components/BlogCoverImage";
import type { PublicBlogPost } from "@/features/brand/blog/types";
import {
  formatBlogDate,
  primaryCategory,
  summaryOf,
} from "@/features/brand/blog/utils/format";

type BlogArticleCardProps = {
  post: PublicBlogPost;
  priority?: boolean;
};

export function BlogArticleCard({ post, priority = false }: BlogArticleCardProps) {
  const href = ROUTES.blogPost(post.slug);
  const category = primaryCategory(post);
  const date = formatBlogDate(post.published_at);
  const summary = summaryOf(post);

  return (
    <Link
      href={href}
      className="landing-focus group block"
      data-testid="blog-article-card"
    >
      <BlogCoverImage
        src={post.main_image_url || post.social_image_url}
        alt={post.main_image_alt}
        priority={priority}
        className="aspect-[16/10] rounded-xl"
      />
      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px]">
        {category ? (
          <span className="font-semibold text-[color:var(--landing-ink)]">
            {category}
          </span>
        ) : null}
        {category && date ? (
          <span aria-hidden className="text-[color:var(--landing-border)]">
            ·
          </span>
        ) : null}
        {date ? (
          <time
            dateTime={post.published_at || undefined}
            className="text-[color:var(--landing-ledger-ink)]"
          >
            {date}
          </time>
        ) : null}
      </div>
      <h3 className="landing-display mt-2 text-[1.125rem] font-semibold leading-snug tracking-[-0.02em] text-[color:var(--landing-ink)] transition-opacity duration-300 group-hover:opacity-70 sm:text-[1.2rem]">
        {post.title}
      </h3>
      {summary ? (
        <p className="landing-body mt-2 line-clamp-2 text-[14px] leading-[1.6] text-[color:var(--landing-ledger-ink)] sm:text-[15px]">
          {summary}
        </p>
      ) : null}
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";

import { BRAND_LOGO_SRC } from "@/constants/brand";
import { ROUTES } from "@/constants/routes";
import { BlogCoverImage } from "@/features/brand/blog/components/BlogCoverImage";
import type { PublicBlogPost } from "@/features/brand/blog/types";
import {
  formatBlogDate,
  readingMinutes,
} from "@/features/brand/blog/utils/format";

type FeaturedArticleProps = {
  post: PublicBlogPost;
};

export function FeaturedArticle({ post }: FeaturedArticleProps) {
  const href = ROUTES.blogPost(post.slug);
  const date = formatBlogDate(post.published_at);
  const minutes = readingMinutes(post.body_text);
  const meta = [date, `${minutes} min read`].filter(Boolean).join(" · ");
  const authorName = post.author?.name?.trim() || "Sigma Media";
  const authorImage = post.author?.image_url?.trim() || null;
  const showSigmaFallback = !post.author;

  return (
    <Link
      href={href}
      className="landing-focus group relative isolate flex min-h-[20rem] overflow-hidden rounded-[1.25rem] sm:min-h-[22rem] lg:min-h-[26rem]"
      data-testid="blog-featured-article"
    >
      <BlogCoverImage
        src={post.main_image_url || post.social_image_url}
        alt={post.main_image_alt}
        priority
        className="absolute inset-0 size-full bg-black"
        sizes="100vw"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25"
      />

      <div className="relative z-10 flex w-full max-w-xl flex-col justify-between gap-12 p-7 sm:p-9 lg:p-10">
        <div>
          {meta ? (
            <p className="landing-body text-[13px] font-medium tracking-[0.01em] text-white/55">
              {meta}
            </p>
          ) : null}
          <h2 className="landing-display mt-5 max-w-[16ch] text-[clamp(1.85rem,3.2vw,2.85rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-white">
            {post.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-white/10">
            {authorImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={authorImage}
                alt=""
                className="size-full object-cover"
              />
            ) : showSigmaFallback ? (
              <span className="flex size-full items-center justify-center bg-[#0B6E6E]/15">
                <Image
                  src={BRAND_LOGO_SRC}
                  alt=""
                  width={22}
                  height={22}
                  className="object-contain"
                />
              </span>
            ) : (
              <span className="flex size-full items-center justify-center text-sm font-semibold text-white/80">
                {authorName.slice(0, 1)}
              </span>
            )}
          </div>
          <p className="truncate text-[14px] font-medium leading-tight text-white">
            {authorName}
          </p>
        </div>
      </div>
    </Link>
  );
}

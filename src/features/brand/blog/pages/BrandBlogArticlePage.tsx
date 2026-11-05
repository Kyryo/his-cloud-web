import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { ROUTES } from "@/constants/routes";
import { BlogArticleGrid } from "@/features/brand/blog/components/BlogArticleGrid";
import { BlogArticleJsonLd } from "@/features/brand/blog/components/BlogArticleJsonLd";
import { BlogCoverImage } from "@/features/brand/blog/components/BlogCoverImage";
import { BlogSalesCta } from "@/features/brand/blog/components/BlogSalesCta";
import { PublicBlogProse } from "@/features/brand/blog/components/PublicBlogProse";
import { getPublicBlogPost } from "@/features/brand/blog/services/public-blog.server";
import {
  formatBlogDate,
  primaryCategory,
  readingMinutes,
  summaryOf,
} from "@/features/brand/blog/utils/format";

import "@/features/brand/blog/components/public-blog-prose.css";

type BrandBlogArticlePageProps = {
  slug: string;
};

export async function BrandBlogArticlePage({ slug }: BrandBlogArticlePageProps) {
  const post = await getPublicBlogPost(slug);
  if (!post) {
    notFound();
  }
  if (post.redirect_to && post.redirect_to !== slug) {
    permanentRedirect(ROUTES.blogPost(post.redirect_to));
  }

  const category = primaryCategory(post);
  const date = formatBlogDate(post.published_at);
  const minutes = readingMinutes(post.body_text);
  const standfirst = summaryOf(post);
  const related = (post.related || []).filter((item) => item.id !== post.id).slice(0, 3);
  const cover = post.main_image_url || post.social_image_url;

  return (
    <article className="bg-white pb-20 pt-28 sm:pb-28 sm:pt-36" data-testid="blog-article-page">
      <BlogArticleJsonLd post={post} />
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
        <nav aria-label="Breadcrumb" className="landing-body text-[13px] text-[color:var(--landing-ledger-ink)]">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href={ROUTES.blog}
                className="landing-focus font-medium text-[color:var(--landing-teal)] hover:underline"
              >
                Blog
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="truncate text-[color:var(--landing-ink)]">{post.title}</li>
          </ol>
        </nav>

        <header className="mt-8 max-w-3xl">
          <p className="landing-body text-[13px] font-medium text-[color:var(--landing-ledger-ink)]">
            {[category, date, `${minutes} min read`].filter(Boolean).join(" · ")}
          </p>
          <h1 className="landing-display mt-4 text-[clamp(2rem,4.2vw,3.35rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-[color:var(--landing-ink)]">
            {post.title}
          </h1>
          {standfirst ? (
            <p className="landing-body mt-5 text-lg leading-[1.65] text-[color:var(--landing-ledger-ink)]">
              {standfirst}
            </p>
          ) : null}
          {post.author ? (
            <div className="mt-8 flex items-center gap-3">
              <div className="relative size-11 overflow-hidden rounded-md bg-[color:var(--landing-warm)]">
                {post.author.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.author.image_url}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-sm font-semibold text-[color:var(--landing-ink)]">
                    {post.author.name.slice(0, 1)}
                  </span>
                )}
              </div>
              <p className="text-[14px] font-semibold text-[color:var(--landing-ink)]">
                {post.author.name}
              </p>
            </div>
          ) : null}
        </header>

        {cover ? (
          <BlogCoverImage
            src={cover}
            alt={post.main_image_alt}
            priority
            className="mt-10 aspect-[16/9] rounded-2xl sm:mt-12"
            sizes="(min-width: 1152px) 1100px, 100vw"
          />
        ) : null}

        <div className="mx-auto mt-10 max-w-3xl sm:mt-14">
          <PublicBlogProse body={post.body} />
        </div>

        {related.length > 0 ? (
          <section aria-labelledby="related-heading" className="mt-20 sm:mt-28">
            <h2
              id="related-heading"
              className="landing-display text-2xl font-semibold tracking-[-0.03em] text-[color:var(--landing-ink)] sm:text-3xl"
            >
              Related articles
            </h2>
            <div className="mt-8">
              <BlogArticleGrid posts={related} />
            </div>
          </section>
        ) : null}

        <div className="mt-20 sm:mt-28">
          <BlogSalesCta />
        </div>
      </div>
    </article>
  );
}

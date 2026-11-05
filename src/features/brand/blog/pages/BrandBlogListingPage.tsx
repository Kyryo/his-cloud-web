import Link from "next/link";

import { BlogArticleGrid } from "@/features/brand/blog/components/BlogArticleGrid";
import { BlogCategoryNav } from "@/features/brand/blog/components/BlogCategoryNav";
import { BlogEmptyState } from "@/features/brand/blog/components/BlogEmptyState";
import { BlogPagination } from "@/features/brand/blog/components/BlogPagination";
import { BlogSalesCta } from "@/features/brand/blog/components/BlogSalesCta";
import { FeaturedArticle } from "@/features/brand/blog/components/FeaturedArticle";
import {
  listPublicBlogCategories,
  listPublicBlogPosts,
} from "@/features/brand/blog/services/public-blog.server";
import type { PublicBlogPost } from "@/features/brand/blog/types";
import {
  PUBLIC_BLOG_PAGE_SIZE,
  categoryFromSearch,
  pageFromSearch,
} from "@/features/brand/blog/utils/format";

type BrandBlogListingPageProps = {
  searchParams: {
    category?: string | string[];
    page?: string | string[];
  };
};

async function resolveFeatured(): Promise<PublicBlogPost | null> {
  const featured = await listPublicBlogPosts({ featured: true, pageSize: 1 });
  if (featured.items[0]) {
    return featured.items[0];
  }
  const latest = await listPublicBlogPosts({ page: 1, pageSize: 1 });
  return latest.items[0] ?? null;
}

export async function BrandBlogListingPage({
  searchParams,
}: BrandBlogListingPageProps) {
  const category = categoryFromSearch(searchParams.category);
  const page = pageFromSearch(searchParams.page);
  const isUnfiltered = !category;

  let categories: Awaited<ReturnType<typeof listPublicBlogCategories>> = [];
  let posts: PublicBlogPost[] = [];
  let total = 0;
  let featured: PublicBlogPost | null = null;
  let errorMessage: string | null = null;

  try {
    const [categoryRows, featuredPost, list] = await Promise.all([
      listPublicBlogCategories(),
      isUnfiltered && page === 1 ? resolveFeatured() : Promise.resolve(null),
      listPublicBlogPosts({
        category: category || undefined,
        page,
        pageSize: PUBLIC_BLOG_PAGE_SIZE,
      }),
    ]);
    categories = categoryRows;
    featured = featuredPost;
    posts = list.items;
    total = list.total;
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Could not load blog posts.";
  }

  const gridPosts =
    featured && isUnfiltered && page === 1
      ? posts.filter((post) => post.id !== featured.id)
      : posts;

  return (
    <div className="bg-white pb-20 pt-28 sm:pb-28 sm:pt-36" data-testid="blog-listing-page">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">
        <h1 className="sr-only">Blog</h1>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
            <p className="landing-display text-lg font-semibold text-red-900">
              Could not load articles
            </p>
            <p className="landing-body mt-2 text-sm text-red-800">{errorMessage}</p>
            <Link
              href="/blog"
              className="landing-focus landing-btn-secondary mt-6 inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold"
            >
              Try again
            </Link>
          </div>
        ) : (
          <>
            {featured && isUnfiltered && page === 1 ? (
              <FeaturedArticle post={featured} />
            ) : null}

            <div className={featured && isUnfiltered && page === 1 ? "mt-12" : undefined}>
              <BlogCategoryNav categories={categories} activeSlug={category} />
            </div>

            <section aria-label="Articles" className="mt-10">
              {gridPosts.length === 0 ? (
                <BlogEmptyState
                  title={category ? "No articles in this category" : "No posts yet"}
                  description={
                    category
                      ? "Try another category, or browse all articles."
                      : "When a post is published in Platform Admin, it will appear here."
                  }
                  showClearFilter={Boolean(category)}
                />
              ) : (
                <>
                  <BlogArticleGrid
                    posts={gridPosts}
                    priorityCount={featured && isUnfiltered && page === 1 ? 0 : 3}
                  />
                  <BlogPagination
                    page={page}
                    total={total}
                    pageSize={PUBLIC_BLOG_PAGE_SIZE}
                    category={category || undefined}
                  />
                </>
              )}
            </section>
          </>
        )}

        <div className="mt-20 sm:mt-28">
          <BlogSalesCta />
        </div>
      </div>
    </div>
  );
}

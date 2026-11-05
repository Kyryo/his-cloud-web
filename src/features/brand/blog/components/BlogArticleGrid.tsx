import { BlogArticleCard } from "@/features/brand/blog/components/BlogArticleCard";
import type { PublicBlogPost } from "@/features/brand/blog/types";

type BlogArticleGridProps = {
  posts: PublicBlogPost[];
  priorityCount?: number;
};

export function BlogArticleGrid({
  posts,
  priorityCount = 0,
}: BlogArticleGridProps) {
  return (
    <div
      className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="blog-article-grid"
    >
      {posts.map((post, index) => (
        <BlogArticleCard
          key={post.id}
          post={post}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}

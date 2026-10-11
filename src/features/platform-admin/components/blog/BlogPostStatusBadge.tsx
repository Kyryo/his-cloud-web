import { StatusPill } from "@/components/ui/status-pill";
import type { BlogPost } from "@/features/platform-admin/types/blog.types";
import { isScheduled } from "@/features/platform-admin/utils/blog-format";

type BlogPostStatusBadgeProps = {
  post: Pick<BlogPost, "status" | "publishedAt">;
  className?: string;
};

export function BlogPostStatusBadge({ post, className }: BlogPostStatusBadgeProps) {
  if (post.status === "draft") {
    return <StatusPill label="Draft" variant="outline" className={className} />;
  }
  if (isScheduled(post.publishedAt)) {
    return <StatusPill label="Scheduled" variant="warning" className={className} />;
  }
  return <StatusPill label="Published" variant="success" className={className} />;
}

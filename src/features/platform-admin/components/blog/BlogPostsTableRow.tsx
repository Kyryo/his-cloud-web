"use client";

import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import { ListPageDataTableCell, ListPageDataTableRow } from "@/features/app-shell/components/page-layout";
import { BlogPostCover } from "@/features/platform-admin/components/blog/BlogPostCover";
import { BLOG_POSTS_COLUMN_CLASS } from "@/features/platform-admin/components/blog/BlogPostsTableColumns";
import { BlogPostStatusBadge } from "@/features/platform-admin/components/blog/BlogPostStatusBadge";
import { getBlogPostMockViews } from "@/features/platform-admin/constants/blog-mock-stats";
import type { BlogPost } from "@/features/platform-admin/types/blog.types";
import { formatBlogDate, formatBlogNumber } from "@/features/platform-admin/utils/blog-format";

type BlogPostsTableRowProps = {
  post: BlogPost;
  onDelete: (post: BlogPost) => void;
};

function primaryDate(post: BlogPost): { label: string; value: string } {
  return post.status === "published" && post.publishedAt
    ? { label: "Published", value: formatBlogDate(post.publishedAt) }
    : { label: "Updated", value: formatBlogDate(post.updatedAt) };
}

export function BlogPostsTableRow({ post, onDelete }: BlogPostsTableRowProps) {
  const router = useRouter();
  const href = ROUTES.platformAdminBlogPost(post.id);
  const date = primaryDate(post);
  const [category, ...otherCategories] = post.categories ?? [];

  return (
    <ListPageDataTableRow className="cursor-pointer" onClick={() => router.push(href)}>
      <ListPageDataTableCell className={BLOG_POSTS_COLUMN_CLASS.post}>
        <div className="flex items-center gap-3">
          <BlogPostCover src={post.mainImageUrl} alt={post.mainImageAlt} className="h-11 w-[4.5rem]" sizes="72px" />
          <div className="min-w-0">
            <p className="truncate font-medium text-brand-navy">{post.title || "Untitled"}</p>
            <p className="mt-0.5 line-clamp-1 text-xs text-dash-muted">{post.excerpt || `/${post.slug}`}</p>
          </div>
        </div>
      </ListPageDataTableCell>
      <ListPageDataTableCell className={BLOG_POSTS_COLUMN_CLASS.author}>
        <span className="whitespace-nowrap">{post.author?.name ?? "—"}</span>
      </ListPageDataTableCell>
      <ListPageDataTableCell className={BLOG_POSTS_COLUMN_CLASS.category}>
        {category ? (
          <span className="whitespace-nowrap">
            {category.title}
            {otherCategories.length > 0 ? <span className="text-dash-muted"> +{otherCategories.length}</span> : null}
          </span>
        ) : (
          <span className="text-dash-muted">—</span>
        )}
      </ListPageDataTableCell>
      <ListPageDataTableCell className={BLOG_POSTS_COLUMN_CLASS.status}>
        <BlogPostStatusBadge post={post} />
      </ListPageDataTableCell>
      <ListPageDataTableCell className={BLOG_POSTS_COLUMN_CLASS.date}>
        <span className="block text-brand-slate">{date.value}</span>
        <span className="block text-[11px] text-dash-muted">{date.label}</span>
      </ListPageDataTableCell>
      <ListPageDataTableCell className={`${BLOG_POSTS_COLUMN_CLASS.views} tabular-nums`}>
        {formatBlogNumber(getBlogPostMockViews(post.id))}
      </ListPageDataTableCell>
      <ListPageDataTableCell className={BLOG_POSTS_COLUMN_CLASS.actions} onClick={(event) => event.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={`Actions for ${post.title}`}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => router.push(href)}>Open</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-700 focus:text-red-700" onSelect={() => onDelete(post)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ListPageDataTableCell>
    </ListPageDataTableRow>
  );
}

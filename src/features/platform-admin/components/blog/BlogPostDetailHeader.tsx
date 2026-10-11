"use client";

import { ArrowLeft, Loader2, MoreHorizontal, PenLine, Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/constants/routes";
import { PAGE_TITLE_CLASS } from "@/features/app-shell/components/page-layout";
import { BlogPostStatusBadge } from "@/features/platform-admin/components/blog/BlogPostStatusBadge";
import type { BlogPost } from "@/features/platform-admin/types/blog.types";
import { formatBlogDate } from "@/features/platform-admin/utils/blog-format";

type BlogPostDetailHeaderProps = {
  post: BlogPost;
  hasContent: boolean;
  isTogglingPublish: boolean;
  onEditDetails: () => void;
  onEditContent: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
};

export function BlogPostDetailHeader({
  post,
  hasContent,
  isTogglingPublish,
  onEditDetails,
  onEditContent,
  onTogglePublish,
  onDelete,
}: BlogPostDetailHeaderProps) {
  const published = post.status === "published";
  return (
    <header className="space-y-3">
      <Link
        href={ROUTES.platformAdminBlogPosts}
        className="inline-flex items-center gap-1 text-xs font-medium text-dash-muted transition-colors hover:text-brand-navy"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Posts
      </Link>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className={PAGE_TITLE_CLASS}>{post.title || "Untitled"}</h1>
            <BlogPostStatusBadge post={post} />
            {post.featured ? <span className="text-[11px] font-medium text-brand-primary">Featured</span> : null}
          </div>
          <p className="text-[13px] text-dash-muted">
            /{post.slug}
            {post.author ? <> · by {post.author.name}</> : null}
            {" · "}Updated {formatBlogDate(post.updatedAt)}
          </p>
          {post.excerpt ? <p className="max-w-2xl pt-1 text-sm text-brand-slate">{post.excerpt}</p> : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEditDetails}>
            Edit details
          </Button>
          <Button variant="outline" size="sm" onClick={onTogglePublish} disabled={isTogglingPublish}>
            {isTogglingPublish ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {published ? "Unpublish" : "Publish"}
          </Button>
          <Button variant="primary" size="sm" onClick={onEditContent}>
            {hasContent ? <PenLine className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
            {hasContent ? "Edit content" : "Add content"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-9" aria-label="More actions">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-red-700 focus:text-red-700" onSelect={onDelete}>
                Delete post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

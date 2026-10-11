"use client";

import { FileText, Plus } from "lucide-react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PAGE_SECTION_TITLE_CLASS } from "@/features/app-shell/components/page-layout";
import type { TipTapDoc } from "@/features/platform-admin/types/blog.types";

const BlogContentPreview = dynamic(() => import("@/features/platform-admin/components/blog/BlogContentPreview"), {
  ssr: false,
  loading: () => (
    <div className="space-y-3">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-11/12" />
    </div>
  ),
});

type BlogPostContentSectionProps = {
  body: TipTapDoc | null | undefined;
  hasContent: boolean;
  onEditContent: () => void;
};

export function BlogPostContentSection({ body, hasContent, onEditContent }: BlogPostContentSectionProps) {
  return (
    <section aria-labelledby="blog-post-content-heading">
      <div className="flex items-center justify-between border-b border-dash-border/80 pb-2">
        <h2 id="blog-post-content-heading" className={PAGE_SECTION_TITLE_CLASS}>Content</h2>
        {hasContent ? (
          <button type="button" onClick={onEditContent} className="text-xs font-medium text-brand-primary hover:underline">
            Edit content
          </button>
        ) : null}
      </div>
      {hasContent && body ? (
        <div className="py-6">
          <BlogContentPreview doc={body} />
        </div>
      ) : (
        <div className="flex flex-col items-start gap-3 py-10">
          <FileText className="size-5 text-dash-muted" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-brand-navy">This post has no content yet</p>
            <p className="mt-1 text-sm text-dash-muted">Write the article in the rich text editor. You can save as often as you like.</p>
          </div>
          <Button variant="primary" size="sm" onClick={onEditContent}>
            <Plus className="size-4" aria-hidden="true" />
            Add content
          </Button>
        </div>
      )}
    </section>
  );
}

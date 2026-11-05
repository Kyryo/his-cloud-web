"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { OverviewSectionSkeleton } from "@/features/overview/components/OverviewWorkspaceSkeleton";
import { marketingHref } from "@/lib/app-url";
import { bffRequest } from "@/lib/bff-client";

export type OverviewBlogPost = {
  title: string;
  excerpt: string;
  published_at: string;
  slug: string;
  category: string | null;
  image_url?: string | null;
  image_alt?: string | null;
};

function BlogEntryImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return null;
  }

  return (
    // Cover URLs come from the public blog host and are not in the image allowlist.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="mt-0.5 h-12 w-12 shrink-0 rounded-md object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function formatPublishedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function OverviewBlogSection() {
  const posts = useQuery({
    queryKey: ["overview-blog"],
    queryFn: () => bffRequest<OverviewBlogPost[]>("/api/blog/posts"),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  if (posts.isPending) {
    return <OverviewSectionSkeleton />;
  }

  if (!posts.data?.length) {
    return null;
  }

  return (
    <section aria-label="Latest from Sigma.">
      <h2 className="text-sm font-medium text-dash-muted">Latest from Sigma.</h2>
      <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
        {posts.data.map((post) => {
          const published = formatPublishedAt(post.published_at);
          return (
            <li key={post.slug}>
              <a
                href={marketingHref(ROUTES.blogPost(post.slug))}
                className="group flex items-start gap-3"
              >
                {post.image_url ? (
                  <BlogEntryImage src={post.image_url} alt={post.image_alt ?? ""} />
                ) : null}
                <span className="min-w-0 flex-1">
                  <span className="text-[13px] font-medium text-brand-slate transition-colors group-hover:text-brand-primary">
                    {post.title}
                  </span>
                  {post.excerpt ? (
                    <span className="mt-1 line-clamp-2 block text-[12px] leading-5 text-dash-muted">
                      {post.excerpt}
                    </span>
                  ) : null}
                  {published || post.category ? (
                    <span className="mt-1.5 block text-[11px] text-dash-muted/80">
                      {[published, post.category].filter(Boolean).join(" · ")}
                    </span>
                  ) : null}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

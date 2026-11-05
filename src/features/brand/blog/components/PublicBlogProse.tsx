"use client";

import { useEffect, useState } from "react";

import type { PublicBlogTipTapDoc } from "@/features/brand/blog/types";
import { renderPublicBlogPostHtml } from "@/features/brand/blog/utils/render-post-html";

type PublicBlogProseProps = {
  body?: PublicBlogTipTapDoc | null;
};

export function PublicBlogProse({ body }: PublicBlogProseProps) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    setHtml(renderPublicBlogPostHtml(body));
  }, [body]);

  if (!body || body.type !== "doc") {
    return (
      <p className="landing-body text-base leading-[1.75] text-[color:var(--landing-ledger-ink)]">
        This post has no body yet.
      </p>
    );
  }

  if (!html) {
    return (
      <div className="space-y-3" aria-hidden>
        <div className="h-4 w-full rounded bg-[color:var(--landing-warm)]" />
        <div className="h-4 w-full rounded bg-[color:var(--landing-warm)]" />
        <div className="h-4 w-5/6 rounded bg-[color:var(--landing-warm)]" />
      </div>
    );
  }

  return (
    <div
      className="public-blog-prose"
      // TipTap escapes text and drops unknown markup from the stored document.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

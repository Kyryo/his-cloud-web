"use client";

import { useEffect, useMemo, useState } from "react";

import { TagBadge } from "@/features/tags/components/TagBadge";
import type { Tag } from "@/features/tags/types/tag.types";
import { cn } from "@/lib/utils";

export const DEFAULT_VISIBLE_TAG_COUNT = 3;

type TagBadgeListProps = {
  tags?: Tag[];
  className?: string;
  emptyLabel?: string;
  visibleCount?: number;
  onTagClick?: () => void;
  "data-testid"?: string;
  moreTagsTestId?: string;
  lessTagsTestId?: string;
};

function formatMoreTagsLabel(count: number) {
  return `${count} more tag${count === 1 ? "" : "s"}`;
}

export function TagBadgeList({
  tags = [],
  className,
  emptyLabel,
  visibleCount = DEFAULT_VISIBLE_TAG_COUNT,
  onTagClick,
  "data-testid": dataTestId,
  moreTagsTestId = "tag-badge-list-more",
  lessTagsTestId = "tag-badge-list-less",
}: TagBadgeListProps) {
  const [expanded, setExpanded] = useState(false);
  const tagKey = useMemo(() => tags.map((tag) => tag.uuid).join(","), [tags]);

  useEffect(() => {
    setExpanded(false);
  }, [tagKey]);

  if (tags.length === 0) {
    return emptyLabel ? (
      <span className="text-xs text-brand-muted">{emptyLabel}</span>
    ) : null;
  }

  const shouldCollapse = tags.length > visibleCount + 1;
  const visibleTags =
    shouldCollapse && !expanded ? tags.slice(0, visibleCount) : tags;
  const hiddenCount = tags.length - visibleCount;

  return (
    <div
      className={cn("flex flex-wrap items-center gap-1.5", className)}
      data-testid={dataTestId}
    >
      {visibleTags.map((tag) => (
        <TagBadge key={tag.uuid} tag={tag} onClick={onTagClick} />
      ))}

      {shouldCollapse && !expanded ? (
        <button
          type="button"
          className="inline-flex items-center rounded-full border border-brand-border bg-white px-2 py-0.5 text-xs font-medium text-brand-muted transition-colors hover:bg-brand-tint/60 hover:text-brand-navy"
          onClick={() => setExpanded(true)}
          data-testid={moreTagsTestId}
        >
          {formatMoreTagsLabel(hiddenCount)}
        </button>
      ) : null}

      {shouldCollapse && expanded ? (
        <button
          type="button"
          className="inline-flex items-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium text-brand-primary underline-offset-2 hover:underline"
          onClick={() => setExpanded(false)}
          data-testid={lessTagsTestId}
        >
          Show less
        </button>
      ) : null}
    </div>
  );
}

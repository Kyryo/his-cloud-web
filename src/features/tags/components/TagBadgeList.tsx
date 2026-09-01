import { TagBadge } from "@/features/tags/components/TagBadge";
import type { Tag } from "@/features/tags/types/tag.types";
import { cn } from "@/lib/utils";

type TagBadgeListProps = {
  tags?: Tag[];
  className?: string;
  emptyLabel?: string;
};

export function TagBadgeList({
  tags = [],
  className,
  emptyLabel,
}: TagBadgeListProps) {
  if (tags.length === 0) {
    return emptyLabel ? (
      <span className="text-xs text-brand-muted">{emptyLabel}</span>
    ) : null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {tags.map((tag) => (
        <TagBadge key={tag.uuid} tag={tag} />
      ))}
    </div>
  );
}

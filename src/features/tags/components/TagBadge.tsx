import type { Tag } from "@/features/tags/types/tag.types";
import { cn } from "@/lib/utils";
import { resolveTagBadgeStyle } from "@/features/tags/utils/resolve-tag-badge-style";

type TagBadgeProps = {
  tag: Pick<Tag, "name" | "color">;
  className?: string;
};

export function TagBadge({ tag, className }: TagBadgeProps) {
  const { className: badgeClassName, style } = resolveTagBadgeStyle(tag.color);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        badgeClassName,
        className,
      )}
      style={style}
    >
      {tag.name}
    </span>
  );
}

import type { Tag } from "@/features/tags/types/tag.types";
import { cn } from "@/lib/utils";
import { resolveTagBadgeStyle } from "@/features/tags/utils/resolve-tag-badge-style";

type TagBadgeProps = {
  tag: Pick<Tag, "name" | "color">;
  className?: string;
  onClick?: () => void;
};

export function TagBadge({ tag, className, onClick }: TagBadgeProps) {
  const { className: badgeClassName, style } = resolveTagBadgeStyle(tag.color);
  const sharedClassName = cn(
    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
    badgeClassName,
    onClick &&
      "cursor-pointer transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40",
    className,
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={sharedClassName}
        style={style}
        onClick={onClick}
        aria-label={`Manage tag ${tag.name}`}
      >
        {tag.name}
      </button>
    );
  }

  return (
    <span className={sharedClassName} style={style}>
      {tag.name}
    </span>
  );
}

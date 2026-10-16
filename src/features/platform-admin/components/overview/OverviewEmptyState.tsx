import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  height?: number;
};

export function OverviewEmptyState({
  icon: Icon,
  title,
  description,
  height = 280,
}: Props) {
  return (
    <div
      style={{ minHeight: height }}
      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-foreground/10 bg-foreground/[0.015] px-6 text-center"
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-foreground/[0.05] text-muted-foreground">
        <Icon className="size-4" aria-hidden />
      </span>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="max-w-xs text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

import type { PlatformAdminTenantUsageLevel } from "@/features/platform-admin/types/platform-admin.types";
import { cn } from "@/lib/utils";

const USAGE_STYLES: Record<PlatformAdminTenantUsageLevel, string> = {
  High: "border-brand-primary/20 bg-brand-tint text-brand-primary",
  Moderate: "border-sky-200 bg-sky-50 text-sky-800",
  Low: "border-amber-200 bg-amber-50 text-amber-900",
  None: "border-brand-border bg-brand-surface text-brand-muted",
};

export function PlatformAdminUsageBadge({
  level,
}: {
  level: PlatformAdminTenantUsageLevel;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium",
        USAGE_STYLES[level],
      )}
    >
      {level}
    </span>
  );
}

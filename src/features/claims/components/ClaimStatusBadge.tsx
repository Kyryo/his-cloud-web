"use client";

import { Badge } from "@/components/ui/badge";
import type { ClaimStatus } from "@/features/claims/types/claims.types";
import { cn } from "@/lib/utils";

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "destructive" | "success"
> = {
  draft: "secondary",
  submitted: "default",
  approved: "success",
  rejected: "destructive",
  cancelled: "outline",
};

export function ClaimStatusBadge({
  status,
  className,
}: {
  status: ClaimStatus | null | undefined;
  className?: string;
}) {
  if (!status) {
    return (
      <Badge variant="outline" className={cn("font-normal", className)}>
        Not submitted
      </Badge>
    );
  }

  const normalized = String(status).toLowerCase();
  return (
    <Badge
      variant={STATUS_VARIANTS[normalized] ?? "outline"}
      className={cn("font-normal", className)}
    >
      {normalized.replace(/_/g, " ")}
    </Badge>
  );
}

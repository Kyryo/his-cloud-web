"use client";

import { Badge } from "@/components/ui/badge";
import type { PaymentState } from "@/features/payments/types/payment.types";
import { cn } from "@/lib/utils";

const STATE_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive" | "success"> = {
  draft: "secondary",
  posted: "success",
  cancel: "destructive",
};

export function PaymentStatusBadge({
  state,
  className,
}: {
  state: PaymentState;
  className?: string;
}) {
  const normalized = String(state || "").toLowerCase();
  return (
    <Badge variant={STATE_VARIANTS[normalized] ?? "outline"} className={cn("font-normal", className)}>
      {normalized.replace(/_/g, " ") || "unknown"}
    </Badge>
  );
}

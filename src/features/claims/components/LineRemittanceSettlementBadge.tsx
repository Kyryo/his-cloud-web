"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { RemittanceLineSettlementStatus } from "@/features/claims/types/remittance-line-settlement.types";
import { cn } from "@/lib/utils";

type LineRemittanceSettlementBadgeProps = {
  status: RemittanceLineSettlementStatus;
  className?: string;
};

const STATUS_META: Record<
  RemittanceLineSettlementStatus,
  { label: string; tooltip: string; variant: "success" | "destructive" }
> = {
  paid: {
    label: "Paid",
    tooltip: "Insurer remittance applied and payment recorded for this line.",
    variant: "success",
  },
  partial: {
    label: "Partial",
    tooltip: "Insurer remittance partially paid this line.",
    variant: "success",
  },
  denied: {
    label: "Rejected",
    tooltip: "Insurer remittance denied payment for this line.",
    variant: "destructive",
  },
  rejected: {
    label: "Rejected",
    tooltip: "This matched remittance line was rejected without payment.",
    variant: "destructive",
  },
};

export function LineRemittanceSettlementBadge({
  status,
  className,
}: LineRemittanceSettlementBadgeProps) {
  const meta = STATUS_META[status];

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={meta.variant}
            className={cn("shrink-0 px-1.5 font-normal", className)}
            data-testid={`line-remittance-settlement-badge-${status}`}
          >
            {meta.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{meta.tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function shouldShowRemittanceSettlementBadge(
  status: RemittanceLineSettlementStatus | null | undefined,
): status is RemittanceLineSettlementStatus {
  return (
    status === "paid" ||
    status === "partial" ||
    status === "denied" ||
    status === "rejected"
  );
}

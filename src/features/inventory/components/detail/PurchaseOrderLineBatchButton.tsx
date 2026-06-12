"use client";

import { Check } from "lucide-react";
import type { MouseEventHandler } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PurchaseOrderLineBatchButtonProps = {
  isComplete: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  "data-testid"?: string;
};

export function PurchaseOrderLineBatchButton({
  isComplete,
  onClick,
  className,
  "data-testid": dataTestId,
}: PurchaseOrderLineBatchButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        "h-7 shrink-0 px-2 text-[11px] font-medium",
        isComplete
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
          : "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100",
        className,
      )}
      aria-label={isComplete ? "Batch and expiry recorded" : "Record batch and expiry"}
      data-testid={dataTestId}
      onClick={onClick}
    >
      {isComplete ? (
        <Check className="size-3 shrink-0" aria-hidden="true" />
      ) : null}
      Batch &amp; Expiry
    </Button>
  );
}

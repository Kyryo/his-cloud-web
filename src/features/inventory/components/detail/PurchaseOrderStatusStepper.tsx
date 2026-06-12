"use client";

import { Check } from "lucide-react";

import type { PurchaseOrder, PurchaseStatus } from "@/features/inventory/types/inventory.types";
import { cn } from "@/lib/utils";

const STEPS = ["Draft", "Submitted", "Approved", "Received"] as const;

function getActiveStepIndex(order: PurchaseOrder): number {
  const status = order.status as PurchaseStatus;

  if (status === "CANCELLED") {
    return -1;
  }
  if (status === "DRAFT") {
    return 0;
  }
  if (status === "SUBMITTED") {
    return 1;
  }
  if (status === "CONFIRMED") {
    return order.received_at ? 3 : 2;
  }

  return 0;
}

type PurchaseOrderStatusStepperProps = {
  order: PurchaseOrder;
};

export function PurchaseOrderStatusStepper({ order }: PurchaseOrderStatusStepperProps) {
  const activeIndex = getActiveStepIndex(order);
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="space-y-2" data-testid="purchase-order-status-stepper">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
        Order progress
      </p>
      {isCancelled ? (
        <p className="text-sm font-medium text-red-700">This purchase order was cancelled.</p>
      ) : (
        <ol className="flex items-center gap-1">
          {STEPS.map((label, index) => {
            const isComplete = index < activeIndex;
            const isCurrent = index === activeIndex;

            return (
              <li key={label} className="flex min-w-0 flex-1 items-center gap-1">
                <div className="flex min-w-0 flex-col items-center gap-1">
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full border text-[10px] font-semibold",
                      isComplete && "border-emerald-200 bg-emerald-50 text-emerald-700",
                      isCurrent && "border-brand-primary bg-brand-primary text-white",
                      !isComplete && !isCurrent && "border-brand-border bg-white text-brand-muted",
                    )}
                  >
                    {isComplete ? (
                      <Check className="size-3.5" aria-hidden="true" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span
                    className={cn(
                      "max-w-full truncate text-[10px] font-medium",
                      isCurrent ? "text-brand-navy" : "text-brand-muted",
                    )}
                  >
                    {label}
                  </span>
                </div>
                {index < STEPS.length - 1 ? (
                  <div
                    className={cn(
                      "mb-4 h-px flex-1",
                      index < activeIndex ? "bg-emerald-300" : "bg-brand-border",
                    )}
                    aria-hidden="true"
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

"use client";

import { AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { InvoiceClaimReadinessItem } from "@/features/invoices/utils/invoice-claim-readiness";
import { cn } from "@/lib/utils";

export type ClaimRequirementsCardProps = {
  items: InvoiceClaimReadinessItem[];
  footerActions?: ReactNode;
  className?: string;
};

/**
 * Findings-style card for claim requirement checks (mirrors advisory findings chrome).
 */
export function ClaimRequirementsCard({
  items,
  footerActions,
  className,
}: ClaimRequirementsCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(true);
  const unmet = items.filter((item) => !item.met);
  const metCount = items.length - unmet.length;
  const allClear = unmet.length === 0;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-brand-border bg-white",
        className,
      )}
      data-testid="claim-requirements-card"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0 flex flex-wrap items-center gap-2">
          {allClear ? (
            <>
              <CheckCircle2
                className="size-4 shrink-0 text-emerald-600"
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-emerald-800">
                All requirements met
              </span>
            </>
          ) : (
            <>
              <span className="text-sm font-medium text-brand-navy">
                {unmet.length} remaining
              </span>
              <span className="hidden text-brand-border sm:inline" aria-hidden="true">
                ·
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800">
                  <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                  {unmet.length} open
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-800">
                  <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  {metCount} met
                </span>
              </div>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setDetailsOpen((open) => !open)}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-brand-muted hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/25"
          aria-expanded={detailsOpen}
        >
          {detailsOpen ? "Hide" : "Show"}
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform",
              detailsOpen && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>
      </div>

      {detailsOpen ? (
        <div className="border-t border-brand-border">
          <ul
            className="divide-y divide-brand-border"
            data-testid="claim-workflow-requirements-list"
          >
            {items.map((item) => (
              <li
                key={item.label}
                className="flex items-stretch"
                data-testid={`claim-requirement-${item.met ? "met" : "open"}`}
              >
                <span
                  className={cn(
                    "w-1 shrink-0",
                    item.met ? "bg-emerald-500" : "bg-amber-500",
                  )}
                  aria-hidden="true"
                />
                <div className="flex min-w-0 flex-1 items-start gap-3 px-4 py-3">
                  {item.met ? (
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-emerald-600"
                      aria-hidden="true"
                    />
                  ) : (
                    <AlertCircle
                      className="mt-0.5 size-4 shrink-0 text-amber-600"
                      aria-hidden="true"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium leading-snug",
                        item.met ? "text-brand-navy" : "text-brand-navy",
                      )}
                    >
                      {item.label}
                    </p>
                    {!item.met && item.hint ? (
                      <p className="mt-1 text-xs leading-relaxed text-brand-muted">
                        {item.hint}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {footerActions ? (
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-brand-border bg-slate-50/60 px-4 py-3">
          {footerActions}
        </div>
      ) : null}
    </div>
  );
}

export function ClaimRequirementsEditButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-9 rounded-full border-brand-navy/20 px-3.5 text-brand-navy hover:border-brand-navy hover:bg-brand-tint"
      onClick={onClick}
      data-testid="claim-edit-draft-button"
    >
      Edit draft
    </Button>
  );
}

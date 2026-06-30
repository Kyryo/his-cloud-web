"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PricingBreakdownLine } from "@/features/sales-orders/types/line-payment-split.types";
import { getLinePricingSnapshot } from "@/features/sales-orders/types/line-payment-split.types";
import { formatSalesOrderAmount } from "@/features/sales-orders/utils/format-sales-order";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type LinePricingBreakdownDialogProps = {
  line: PricingBreakdownLine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  capturedAt?: string | null;
};

function formatRuleTypesLabel(ruleTypes: string[] | undefined): string {
  if (!ruleTypes?.length) {
    return "—";
  }

  return ruleTypes
    .map((type) => {
      if (type === "CO_PAYMENT") return "Co-payment";
      if (type === "EXCESS") return "Excess";
      if (type === "FORMULA") return "Formula";
      return type;
    })
    .join(", ");
}

function formatSnapshotDate(value: string | null | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function buildSubtitle(
  snapshot: ReturnType<typeof getLinePricingSnapshot>,
  capturedAt?: string | null,
): string {
  const parts = ["Snapshot"];
  const ruleName = snapshot?.rule_name?.trim();

  if (ruleName) {
    parts.push(ruleName);
  } else if (!snapshot || Object.keys(snapshot).length === 0) {
    parts.push("List price");
  }

  const formattedDate = formatSnapshotDate(capturedAt);
  if (formattedDate) {
    parts.push(formattedDate);
  }

  return parts.join(" · ");
}

function hasDisplayAmount(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined || value === "") {
    return false;
  }

  return Number.isFinite(Number(value));
}

function BreakdownRow({
  label,
  value,
  emphasized = false,
  valueClassName,
}: {
  label: string;
  value: ReactNode;
  emphasized?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <dt
        className={cn(
          "text-sm",
          emphasized ? "font-medium text-brand-navy" : "text-brand-muted",
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          "text-right text-sm",
          emphasized ? "font-semibold text-brand-navy" : "font-medium text-brand-navy",
          valueClassName,
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function BreakdownSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
        {title}
      </h3>
      <div className="mt-2 divide-y divide-brand-border/70">{children}</div>
    </section>
  );
}

function FormulaBlock({ formula }: { formula: string }) {
  return (
    <div className="py-2">
      <p className="text-sm text-brand-muted">Formula</p>
      <code className="mt-2 block w-full rounded-md bg-slate-100 px-3 py-2.5 font-mono text-xs leading-relaxed break-all text-brand-slate">
        {formula}
      </code>
    </div>
  );
}

export function LinePricingBreakdownDialog({
  line,
  open,
  onOpenChange,
  capturedAt,
}: LinePricingBreakdownDialogProps) {
  if (!line) {
    return null;
  }

  const snapshot = getLinePricingSnapshot(line);
  const formula = snapshot?.client_liability_formula?.trim() ?? "";
  const isPayable = "is_payable" in line ? line.is_payable : undefined;
  const showPricelistAmount =
    isPayable !== false && hasDisplayAmount(line.pricelist_amount_at_order);
  const showRuleName = Boolean(snapshot?.rule_name?.trim());
  const showRuleTypes = Boolean(snapshot?.rule_types?.length);
  const showFormula = Boolean(formula);
  const showInsurerDue = Number(line.insurer_due ?? 0) > 0;
  const showExcess =
    line.has_excess === true &&
    hasDisplayAmount(line.excess_amount) &&
    Number(line.excess_amount) > 0;
  const showListPrice = hasDisplayAmount(line.list_price_at_order);
  const hasPricingInputs =
    showListPrice || showPricelistAmount || showRuleName || showRuleTypes || showFormula;

  const lineTotal = hasDisplayAmount(line.price_total)
    ? line.price_total
    : Number(line.insurer_due ?? 0) + Number(line.client_due ?? 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-lg", appFont.className)}>
        <DialogHeader>
          <DialogTitle>Pricing breakdown</DialogTitle>
          <DialogDescription>{buildSubtitle(snapshot, capturedAt)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {hasPricingInputs ? (
            <BreakdownSection title="Pricing inputs">
              {showListPrice ? (
                <BreakdownRow
                  label="List price"
                  value={formatSalesOrderAmount(line.list_price_at_order)}
                />
              ) : null}
              {showPricelistAmount ? (
                <BreakdownRow
                  label="Pricelist amount"
                  value={formatSalesOrderAmount(line.pricelist_amount_at_order)}
                />
              ) : null}
              {showRuleName ? (
                <BreakdownRow label="Rule name" value={snapshot?.rule_name ?? "—"} />
              ) : null}
              {showRuleTypes ? (
                <BreakdownRow
                  label="Rule types"
                  value={formatRuleTypesLabel(snapshot?.rule_types)}
                />
              ) : null}
              {showFormula ? <FormulaBlock formula={formula} /> : null}
            </BreakdownSection>
          ) : null}

          <BreakdownSection title="Payment split">
            {showInsurerDue ? (
              <BreakdownRow
                label="Insurer due"
                value={formatSalesOrderAmount(line.insurer_due)}
              />
            ) : null}
            <BreakdownRow
              label="Client due"
              value={formatSalesOrderAmount(line.client_due)}
            />
            {showExcess ? (
              <BreakdownRow
                label="Excess"
                value={formatSalesOrderAmount(line.excess_amount)}
              />
            ) : null}
            <div className="border-t border-brand-border pt-1">
              <BreakdownRow
                label="Line total"
                value={formatSalesOrderAmount(lineTotal)}
                emphasized
              />
            </div>
          </BreakdownSection>
        </div>
      </DialogContent>
    </Dialog>
  );
}

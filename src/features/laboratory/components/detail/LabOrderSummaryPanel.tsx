"use client";

import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import type { LabOrder } from "@/features/laboratory/types/laboratory.types";
import {
  formatLabAccession,
  formatLabDisplayDateTime,
  formatLabOrderPriorityLabel,
  formatLabOrderStatusLabel,
  shortenUuid,
} from "@/features/laboratory/utils/format-lab-order";
import { cn } from "@/lib/utils";

type LabOrderSummaryPanelProps = {
  order: LabOrder;
  className?: string;
};

function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1 border-b border-dash-border/70 py-3 last:border-b-0">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
        {label}
      </p>
      <div className="text-sm text-brand-navy">{children}</div>
    </div>
  );
}

export function LabOrderSummaryPanel({
  order,
  className,
}: LabOrderSummaryPanelProps) {
  return (
    <aside
      className={cn(
        "rounded-xl border border-dash-border bg-white p-4 shadow-2xs",
        className,
      )}
      data-testid="lab-order-summary-panel"
    >
      <h2 className="text-sm font-semibold text-brand-navy">Order summary</h2>
      <div className="mt-1">
        <SummaryRow label="Status">
          {formatLabOrderStatusLabel(order.status)}
        </SummaryRow>
        <SummaryRow label="Priority">
          {formatLabOrderPriorityLabel(order.priority)}
        </SummaryRow>
        <SummaryRow label="Accession">{formatLabAccession(order)}</SummaryRow>
        <SummaryRow label="Clinic">{order.clinic_name || "—"}</SummaryRow>
        <SummaryRow label="Ordered">
          {formatLabDisplayDateTime(order.ordered_at)}
        </SummaryRow>
        <SummaryRow label="Ordered by">
          {order.ordered_by_name || "—"}
        </SummaryRow>
        <SummaryRow label="Client">
          <Link
            href={ROUTES.customerDetail(order.customer_uuid)}
            className="font-mono text-brand-primary hover:underline"
          >
            {shortenUuid(order.customer_uuid)}
          </Link>
        </SummaryRow>
        <SummaryRow label="Visit">
          <span className="font-mono">{shortenUuid(order.visit_uuid)}</span>
        </SummaryRow>
        <SummaryRow label="Encounter">
          <span className="font-mono">{shortenUuid(order.encounter_uuid)}</span>
        </SummaryRow>
        <SummaryRow label="Notes">
          {order.clinical_notes?.trim() || "No clinical notes"}
        </SummaryRow>
      </div>
    </aside>
  );
}

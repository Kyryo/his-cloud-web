"use client";

import Link from "next/link";

import {
  DetailPageAsidePanelHeader,
  DetailPageAsidePanelSection,
  DetailPageAsideSummaryField,
  DetailPageAsideSummarySection,
} from "@/features/app-shell/components/page-layout";
import { LabOrderPriorityBadge } from "@/features/laboratory/components/LabOrderPriorityBadge";
import { LabOrderStatusBadge } from "@/features/laboratory/components/LabOrderStatusBadge";
import type { LabOrder } from "@/features/laboratory/types/laboratory.types";
import {
  formatLabAccession,
  formatLabDisplayDateTime,
  formatLabPatientName,
} from "@/features/laboratory/utils/format-lab-order";
import { ROUTES } from "@/constants/routes";

type LabOrderSummaryPanelProps = {
  order: LabOrder;
  className?: string;
};

export function LabOrderSummaryPanel({
  order,
  className,
}: LabOrderSummaryPanelProps) {
  const patientName = formatLabPatientName(order);
  const identifier = order.customer_identifier?.trim() || "—";
  const notes = order.clinical_notes?.trim();

  return (
    <DetailPageAsidePanelSection
      className={className}
      data-testid="lab-order-summary-panel"
    >
      <DetailPageAsidePanelHeader
        title="Order summary"
        description="Requisition and patient details"
      />

      <DetailPageAsideSummarySection title="Order">
        <DetailPageAsideSummaryField
          label="Status"
          value={<LabOrderStatusBadge status={order.status} />}
        />
        <DetailPageAsideSummaryField
          label="Priority"
          value={<LabOrderPriorityBadge priority={order.priority} />}
        />
        <DetailPageAsideSummaryField
          label="Accession"
          value={formatLabAccession(order)}
        />
        <DetailPageAsideSummaryField
          label="Clinic"
          value={order.clinic_name || "—"}
        />
        <DetailPageAsideSummaryField
          label="Ordered"
          value={formatLabDisplayDateTime(order.ordered_at)}
        />
        <DetailPageAsideSummaryField
          label="Ordered by"
          value={order.ordered_by_name || "—"}
        />
        <DetailPageAsideSummaryField
          label="Items"
          value={String(order.items.length)}
        />
      </DetailPageAsideSummarySection>

      <DetailPageAsideSummarySection title="Patient">
        <DetailPageAsideSummaryField
          label="Name"
          value={
            <Link
              href={ROUTES.customerDetail(order.customer_uuid)}
              className="font-medium text-brand-primary hover:underline"
            >
              {patientName}
            </Link>
          }
        />
        <DetailPageAsideSummaryField
          label="Client ID"
          value={
            <span className="inline-flex items-center rounded border border-dash-border/80 bg-dash-canvas px-1.5 py-0.5 font-mono text-xs font-semibold text-brand-navy">
              {identifier}
            </span>
          }
        />
      </DetailPageAsideSummarySection>

      <DetailPageAsideSummarySection title="Notes">
        <p className="whitespace-pre-wrap text-sm text-brand-slate">
          {notes || "No clinical notes"}
        </p>
      </DetailPageAsideSummarySection>
    </DetailPageAsidePanelSection>
  );
}

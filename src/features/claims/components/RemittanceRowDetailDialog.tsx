"use client";

import { useEffect, useState, type ReactNode } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import type { RemittanceRow } from "@/features/claims/types/remittances.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type RemittanceRowDetailTab = "general" | "amounts" | "rejections";

type RemittanceRowDetailDialogProps = {
  row: RemittanceRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatResolutionStatus(status: RemittanceRow["resolution_status"]): string {
  return status.replace(/_/g, " ");
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-brand-muted">{label}</dt>
      <dd
        className={cn(
          "text-right font-medium text-brand-navy",
          mono && "font-mono text-sm",
          !mono && "whitespace-pre-wrap",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function DetailPanel({
  children,
  className,
  "data-testid": dataTestId,
}: {
  children: ReactNode;
  className?: string;
  "data-testid"?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-brand-border bg-slate-50/60 p-5 text-sm",
        className,
      )}
      data-testid={dataTestId}
    >
      {children}
    </div>
  );
}

export function RemittanceRowDetailDialog({
  row,
  open,
  onOpenChange,
}: RemittanceRowDetailDialogProps) {
  const [activeTab, setActiveTab] = useState<RemittanceRowDetailTab>("general");

  useEffect(() => {
    if (open) {
      setActiveTab("general");
    }
  }, [open, row?.id]);

  if (!row) {
    return null;
  }

  const patientName = row.patient_name || row.member_name || "—";
  const reasonCode = row.reason_code?.trim() || "";
  const remarks = row.remarks?.trim() || "";
  const hasReason = Boolean(reasonCode || remarks);
  const isDenialLike =
    row.resolution_status === "rejected" ||
    Boolean(reasonCode) ||
    (row.pay_to_provider != null &&
      Number(row.pay_to_provider) === 0 &&
      Boolean(reasonCode));

  const tabs = [
    { id: "general", label: "General" },
    { id: "amounts", label: "Amounts" },
    { id: "rejections", label: "Rejections" },
  ];

  return (
    <TabbedDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Line item #${row.source_row_number}`}
      description={`Remittance details for ${patientName}${
        row.procedure_code ? ` · ${row.procedure_code}` : ""
      }.`}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tabId) => {
        if (
          tabId === "general" ||
          tabId === "amounts" ||
          tabId === "rejections"
        ) {
          setActiveTab(tabId);
        }
      }}
      className={appFont.className}
      data-testid="remittance-row-detail-dialog"
      footer={
        <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
          Close
        </SecondaryButton>
      }
    >
      {activeTab === "general" ? (
        <div className="space-y-4">
          <DetailPanel>
            <dl className="space-y-3">
              <DetailRow
                label="Status"
                value={formatResolutionStatus(row.resolution_status)}
              />
              <DetailRow label="Treatment date" value={row.service_date || "—"} />
              <DetailRow label="Member #" value={row.member_number || "—"} mono />
              <DetailRow label="Patient" value={patientName} />
              <DetailRow label="Member name" value={row.member_name || "—"} />
              <DetailRow label="Invoice" value={row.invoice_number || "—"} />
              <DetailRow
                label="Claim #"
                value={row.payer_claim_number || "—"}
                mono
              />
              <DetailRow label="Procedure" value={row.procedure_code || "—"} />
              <DetailRow label="Quantity" value={row.quantity ?? "—"} />
            </dl>
          </DetailPanel>

          {row.match_reasons?.length ? (
            <DetailPanel>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-brand-muted">
                Match notes
              </p>
              <ul className="list-disc space-y-1 pl-4 text-brand-slate">
                {row.match_reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </DetailPanel>
          ) : null}

          {row.parse_warnings?.length ? (
            <DetailPanel>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-brand-muted">
                Parse warnings
              </p>
              <ul className="list-disc space-y-1 pl-4 text-brand-slate">
                {row.parse_warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </DetailPanel>
          ) : null}
        </div>
      ) : null}

      {activeTab === "amounts" ? (
        <DetailPanel className="bg-white">
          <dl className="space-y-3">
            <DetailRow label="Claimed" value={row.amount_claimed ?? "—"} />
            <DetailRow label="Accepted" value={row.accepted_amount ?? "—"} />
            <DetailRow label="Shortfall" value={row.shortfall_amount ?? "—"} />
            <DetailRow label="Cover %" value={row.cover_percent ?? "—"} />
            <DetailRow label="Pay to you" value={row.pay_to_provider ?? "—"} />
            <DetailRow label="Pay to member" value={row.pay_to_member ?? "—"} />
            <DetailRow
              label="Excess previously paid"
              value={row.excess_previously_paid ?? "—"}
            />
            <DetailRow label="Tax" value={row.tax_amount ?? "—"} />
          </dl>
        </DetailPanel>
      ) : null}

      {activeTab === "rejections" ? (
        hasReason ? (
          <DetailPanel
            className={
              isDenialLike
                ? "border-amber-200 bg-amber-50/80"
                : undefined
            }
            data-testid="remittance-row-reason"
          >
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-brand-muted">
              {isDenialLike ? "Rejection reason" : "Reason"}
            </p>
            <dl className="space-y-3">
              {reasonCode ? (
                <DetailRow label="Code" value={reasonCode} mono />
              ) : null}
              {remarks ? (
                <div className="space-y-1">
                  <dt className="text-brand-muted">Details</dt>
                  <dd className="whitespace-pre-wrap font-medium leading-relaxed text-brand-navy">
                    {remarks}
                  </dd>
                </div>
              ) : null}
            </dl>
          </DetailPanel>
        ) : (
          <DetailPanel data-testid="remittance-row-no-reason">
            <p className="font-medium text-brand-navy">No rejection details</p>
            <p className="mt-1 text-brand-muted">
              This line has no payer reason code or remarks.
            </p>
          </DetailPanel>
        )
      ) : null}
    </TabbedDialog>
  );
}

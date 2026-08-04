"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  DetailPageAsidePanelHeader,
  DetailPageAsidePanelSection,
  DetailPageAsideSummaryAmountRow,
  DetailPageAsideSummaryField,
  DetailPageAsideSummaryHighlight,
  DetailPageAsideSummarySection,
  DetailPageAsideSummaryTotalRow,
} from "@/features/app-shell/components/page-layout";
import { ClaimStatusBadge } from "@/features/claims/components/ClaimStatusBadge";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { fetchInvoice } from "@/features/invoices/services/invoices.service";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { formatInvoiceAmount } from "@/features/invoices/utils/format-invoice";
import {
  formatInvoiceInsurerDueLabel,
  hasInvoiceBalance,
  sumInvoiceClientDue,
  sumInvoiceInsurerDue,
} from "@/features/invoices/utils/sum-invoice-billing";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type ClaimSummaryPanelProps = {
  claim: ClaimDetail;
  className?: string;
  onOpenVisit?: () => void;
};

function formatClaimDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatVitals(claim: ClaimDetail): string {
  const vitals = claim.vitals ?? {};
  const parts: string[] = [];
  if (vitals.height != null && vitals.height !== "") {
    parts.push(`Height ${vitals.height}`);
  }
  if (vitals.weight != null && vitals.weight !== "") {
    parts.push(`Weight ${vitals.weight}`);
  }
  if (vitals.systolic_pressure != null && vitals.diastolic_pressure != null) {
    parts.push(`BP ${vitals.systolic_pressure}/${vitals.diastolic_pressure}`);
  }
  return parts.length > 0 ? parts.join(" · ") : "—";
}

function formatInsuranceDueLabel(claim: ClaimDetail, invoice: Invoice | null): string {
  if (invoice) {
    return formatInvoiceInsurerDueLabel(invoice);
  }
  const payer = claim.payer_code?.trim();
  return payer ? `${payer} due` : "Insurance due";
}

export function ClaimSummaryPanel({
  claim,
  className,
  onOpenVisit,
}: ClaimSummaryPanelProps) {
  const invoiceId = claim.invoice_id || claim.invoice || null;
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (!invoiceId) {
      setInvoice(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchInvoice(invoiceId);
        if (!cancelled) {
          setInvoice(data);
        }
      } catch {
        if (!cancelled) {
          setInvoice(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [invoiceId]);

  const insurerDue = invoice ? sumInvoiceInsurerDue(invoice) : 0;
  const clientDue = invoice ? sumInvoiceClientDue(invoice) : 0;
  const amountTotal = invoice
    ? Number(invoice.amount_total ?? insurerDue + clientDue)
    : insurerDue + clientDue;
  const amountPaid = Number(invoice?.amount_paid ?? 0);
  const amountResidual = Number(invoice?.amount_residual ?? 0);
  const hasBalance = invoice ? hasInvoiceBalance(invoice) : amountResidual > 0;

  return (
    <DetailPageAsidePanelSection className={cn(className)}>
      <DetailPageAsidePanelHeader
        title="Claim summary"
        description="Billing totals and claim details"
      />

      <DetailPageAsideSummaryHighlight title="Billing summary">
        <dl className="space-y-2.5">
          <DetailPageAsideSummaryAmountRow
            label={formatInsuranceDueLabel(claim, invoice)}
            value={formatInvoiceAmount(insurerDue)}
          />
          <DetailPageAsideSummaryAmountRow
            label="Client due"
            value={formatInvoiceAmount(clientDue)}
          />
          <DetailPageAsideSummaryTotalRow
            value={formatInvoiceAmount(amountTotal)}
            showDivider
          />
        </dl>
      </DetailPageAsideSummaryHighlight>

      <div
        className={cn(
          "mt-3 rounded-xl border p-4",
          hasBalance
            ? "border-red-200 bg-red-50/70"
            : "border-emerald-200 bg-emerald-50/80",
        )}
      >
        <dl className="space-y-2.5">
          <DetailPageAsideSummaryAmountRow
            label="Paid"
            value={formatInvoiceAmount(amountPaid)}
          />
          <DetailPageAsideSummaryAmountRow
            label="Balance"
            value={formatInvoiceAmount(amountResidual)}
            variant={hasBalance ? "danger" : "default"}
            emphasized={hasBalance}
          />
        </dl>
      </div>

      <DetailPageAsideSummarySection title="Claim details">
        <DetailPageAsideSummaryField
          label="Status"
          value={<ClaimStatusBadge status={claim.status} />}
        />
        <DetailPageAsideSummaryField
          label="Client"
          value={claim.customer_name?.trim() || "—"}
        />
        <DetailPageAsideSummaryField
          label="Membership number"
          value={claim.membership_number || "—"}
        />
        <DetailPageAsideSummaryField
          label="Payer"
          value={claim.payer_code || "—"}
        />
        <DetailPageAsideSummaryField
          label="Practitioner number"
          value={claim.practitioner_number || "—"}
        />
        <DetailPageAsideSummaryField
          label="Service provider code"
          value={claim.service_provider_code || "—"}
        />
        <DetailPageAsideSummaryField
          label="External claim ID"
          value={claim.external_claim_id || "—"}
        />
        <DetailPageAsideSummaryField label="Vitals" value={formatVitals(claim)} />
        <DetailPageAsideSummaryField
          label="Created"
          value={formatClaimDate(claim.created_at)}
        />
        <DetailPageAsideSummaryField
          label="Submitted"
          value={formatClaimDate(claim.submitted_at)}
        />
        <DetailPageAsideSummaryField
          label="Invoice"
          value={
            invoiceId ? (
              <Link
                href={ROUTES.invoiceDetail(invoiceId)}
                className="text-brand-primary hover:underline"
              >
                View invoice
              </Link>
            ) : (
              "—"
            )
          }
        />
        <DetailPageAsideSummaryField
          label="Visit"
          value={
            claim.visit_uuid ? (
              onOpenVisit ? (
                <button
                  type="button"
                  className="text-brand-primary hover:underline"
                  onClick={onOpenVisit}
                >
                  Open visit
                </button>
              ) : (
                <Link
                  href={ROUTES.visitDetail(claim.visit_uuid)}
                  className="text-brand-primary hover:underline"
                >
                  Open visit
                </Link>
              )
            ) : (
              "—"
            )
          }
        />
      </DetailPageAsideSummarySection>
    </DetailPageAsidePanelSection>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  DetailPageAsidePanelHeader,
  DetailPageAsidePanelSection,
  DetailPageAsideSummaryAmountRow,
  DetailPageAsideSummaryField,
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
  getInvoiceOutstandingBalance,
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

function parseAmount(value: string | number | null | undefined): number {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

function sumClaimLineBilling(claim: ClaimDetail) {
  let insurerDue = 0;
  let clientDue = 0;
  let lineTotal = 0;
  let invoiceAmount = 0;

  for (const claimInvoice of claim.claim_invoices ?? []) {
    invoiceAmount += parseAmount(claimInvoice.amount);
    for (const line of claimInvoice.line_items ?? []) {
      insurerDue += parseAmount(line.payer_due);
      clientDue += parseAmount(line.client_due);
      if (line.total != null && line.total !== "") {
        lineTotal += parseAmount(line.total);
      } else {
        lineTotal += parseAmount(line.unit_price) * parseAmount(line.quantity);
      }
    }
  }

  return {
    insurerDue,
    clientDue,
    total: invoiceAmount || lineTotal || insurerDue + clientDue,
  };
}

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

function formatInsuranceDueLabel(
  claim: ClaimDetail,
  invoice: Invoice | null,
): string {
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
  const invoiceRef =
    claim.invoice_uuid ?? claim.invoice_id ?? claim.invoice ?? null;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const displayedInvoice = invoiceRef ? invoice : null;
  const fallback = sumClaimLineBilling(claim);

  useEffect(() => {
    if (!invoiceRef) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchInvoice(invoiceRef);
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
  }, [invoiceRef, claim.updated_at, claim.latest_advisor_evaluation?.id]);

  const insurerDue = displayedInvoice
    ? sumInvoiceInsurerDue(displayedInvoice)
    : fallback.insurerDue;
  const clientDue = displayedInvoice
    ? sumInvoiceClientDue(displayedInvoice)
    : fallback.clientDue;
  const amountTotal = displayedInvoice
    ? Number(displayedInvoice.amount_total ?? insurerDue + clientDue)
    : fallback.total;
  const amountPaid = displayedInvoice
    ? Number(displayedInvoice.amount_paid ?? 0)
    : null;
  const amountResidual = displayedInvoice
    ? getInvoiceOutstandingBalance(displayedInvoice)
    : null;
  const hasBalance = displayedInvoice
    ? hasInvoiceBalance(displayedInvoice)
    : false;
  const showPaymentSplit = insurerDue > 0 || clientDue > 0;
  const membershipNumber = claim.membership_number?.trim() || "";
  const practitionerNumber = claim.practitioner_number?.trim() || "";
  const serviceProviderCode = claim.service_provider_code?.trim() || "";
  const externalClaimId = claim.external_claim_id?.trim() || "";
  const payerCode = claim.payer_code?.trim() || "";
  const payerStatus = claim.payer_status_label?.trim() || claim.payer_status?.trim() || "";
  const hasCoverageDetails = Boolean(
    payerCode ||
      membershipNumber ||
      practitionerNumber ||
      serviceProviderCode ||
      externalClaimId,
  );
  const customerName = claim.customer_name?.trim() || "—";

  return (
    <DetailPageAsidePanelSection className={cn(className)}>
      <DetailPageAsidePanelHeader
        title="Claim summary"
        description="Billing totals and claim details"
      />

      <div data-testid="claim-summary-totals">
        <DetailPageAsideSummarySection title="Totals" className="border-t-0 pt-0">
          <DetailPageAsideSummaryField
            label="Total"
            value={formatInvoiceAmount(amountTotal)}
          />
          <DetailPageAsideSummaryField
            label="Paid"
            value={
              amountPaid == null ? "—" : formatInvoiceAmount(amountPaid)
            }
          />
          <DetailPageAsideSummaryField
            label="Balance"
            value={
              amountResidual == null ? (
                "—"
              ) : (
                <span className={hasBalance ? "text-red-600" : undefined}>
                  {formatInvoiceAmount(amountResidual)}
                </span>
              )
            }
          />
        </DetailPageAsideSummarySection>
      </div>

      <DetailPageAsideSummarySection title="Billing">
        {showPaymentSplit ? (
          <>
            <DetailPageAsideSummaryAmountRow
              label={formatInsuranceDueLabel(claim, displayedInvoice)}
              value={formatInvoiceAmount(insurerDue)}
            />
            <DetailPageAsideSummaryAmountRow
              label="Client due"
              value={formatInvoiceAmount(clientDue)}
            />
            <div
              className="border-t border-dash-border/80 pt-2"
              role="presentation"
            />
          </>
        ) : null}
        <DetailPageAsideSummaryTotalRow
          value={formatInvoiceAmount(amountTotal)}
        />
      </DetailPageAsideSummarySection>

      {hasCoverageDetails ? (
        <DetailPageAsideSummarySection title="Coverage">
          {payerCode ? (
            <DetailPageAsideSummaryField
              label="Payer"
              value={
                <span className="inline-flex items-center gap-1.5 font-medium text-brand-navy">
                  <Shield
                    className="size-3.5 text-brand-primary"
                    aria-hidden="true"
                  />
                  {payerCode}
                </span>
              }
            />
          ) : null}
          {membershipNumber ? (
            <DetailPageAsideSummaryField
              label="Membership no."
              value={
                <Badge variant="outline" className="font-mono font-normal">
                  {membershipNumber}
                </Badge>
              }
            />
          ) : null}
          {practitionerNumber ? (
            <DetailPageAsideSummaryField
              label="Practitioner no."
              value={
                <span className="font-mono text-xs">{practitionerNumber}</span>
              }
            />
          ) : null}
          {serviceProviderCode ? (
            <DetailPageAsideSummaryField
              label="Service provider"
              value={
                <span className="font-mono text-xs">{serviceProviderCode}</span>
              }
            />
          ) : null}
          {externalClaimId ? (
            <DetailPageAsideSummaryField
              label="External claim ID"
              value={
                <span className="font-mono text-xs">{externalClaimId}</span>
              }
            />
          ) : null}
        </DetailPageAsideSummarySection>
      ) : null}

      <DetailPageAsideSummarySection title="Details">
        <DetailPageAsideSummaryField
          label="Status"
          value={<ClaimStatusBadge status={claim.status} />}
        />
        {payerStatus ? (
          <DetailPageAsideSummaryField label="Payer status" value={payerStatus} />
        ) : null}
        <DetailPageAsideSummaryField
          label="Client"
          value={
            claim.customer_uuid ? (
              <Link
                href={ROUTES.customerDetail(claim.customer_uuid)}
                className="text-brand-primary hover:underline"
              >
                {customerName}
              </Link>
            ) : (
              customerName
            )
          }
        />
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
            invoiceRef ? (
              <Link
                href={ROUTES.invoiceDetail(invoiceRef)}
                className="text-brand-primary hover:underline"
              >
                {claim.invoice_name?.trim() || "View invoice"}
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

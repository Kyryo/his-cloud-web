import type { ClaimDetail, ClaimLineItem } from "@/features/claims/types/claims.types";
import type { Invoice, InvoiceLine } from "@/features/invoices/types/invoice.types";
import { getInvoiceClaimableLines } from "@/features/invoices/utils/invoice-line-payability";
import { formatInvoiceInsuranceNumber } from "@/features/invoices/utils/format-invoice-insurance";
import { coerceToOptionalString } from "@/lib/coerce-string";

export type InvoiceClaimReadinessItem = {
  label: string;
  met: boolean;
  hint?: string;
};

function payerConnectionLabel(invoice: Invoice): string {
  const payer = coerceToOptionalString(invoice.claim_payer_code)?.toUpperCase();
  if (payer) {
    return `${payer} connection is configured`;
  }
  return "Payer connection is configured";
}

function hasTariffCode(
  line: Pick<InvoiceLine, "tariff_code"> | Pick<ClaimLineItem, "tariff_code">,
): boolean {
  return Boolean(coerceToOptionalString(line.tariff_code));
}

function getClaimLineItems(claim?: ClaimDetail | null): ClaimLineItem[] {
  return (claim?.claim_invoices ?? []).flatMap((invoice) => invoice.line_items ?? []);
}

function resolveMembershipNumber(
  invoice?: Invoice | null,
  claim?: ClaimDetail | null,
): string {
  const fromClaim = coerceToOptionalString(claim?.membership_number);
  if (fromClaim) {
    return fromClaim;
  }
  if (!invoice) {
    return "";
  }
  const fromInvoice = formatInvoiceInsuranceNumber(invoice);
  return fromInvoice === "—" ? "" : fromInvoice;
}

/**
 * Requirements shown in the claim workflow Requirements stage.
 * Prefers claim line items when a draft exists; otherwise uses invoice claimable lines.
 */
export function getClaimRequirementCheckItems(
  invoice?: Invoice | null,
  claim?: ClaimDetail | null,
): InvoiceClaimReadinessItem[] {
  const claimLines = getClaimLineItems(claim);
  const lines: Array<{ tariff_code?: string | null }> =
    claimLines.length > 0
      ? claimLines
      : invoice
        ? getInvoiceClaimableLines(invoice.lines)
        : [];
  const linesWithTariff = lines.filter(hasTariffCode);
  const allLinesHaveTariff =
    lines.length > 0 && linesWithTariff.length === lines.length;
  const membershipNumber = resolveMembershipNumber(invoice, claim);
  const hasDiagnosis =
    Boolean(invoice?.has_diagnosis) ||
    (claim?.diagnoses?.length ?? 0) > 0;

  return [
    {
      label: "All line items have tariff codes",
      met: allLinesHaveTariff,
      hint:
        lines.length === 0
          ? "Add payable line items before claiming."
          : "Open each line’s details and sync or set the tariff code.",
    },
    {
      label: "At least one diagnosis is recorded",
      met: hasDiagnosis,
      hint: invoice?.visit_uuid
        ? "Add diagnoses on the Diagnoses tab."
        : claim
          ? "Add at least one diagnosis on the visit linked to this claim."
          : "Link this invoice to a visit and add a diagnosis.",
    },
    {
      label: "Membership number is recorded",
      met: Boolean(membershipNumber),
      hint: claim
        ? "Edit the draft claim to add the membership number."
        : "Ensure the client insurance membership number is on the invoice.",
    },
  ];
}

/**
 * System readiness checks that gate creating a claim from an invoice.
 */
export function getInvoiceClaimSystemReadinessItems(
  invoice: Invoice,
  claim?: ClaimDetail | null,
): InvoiceClaimReadinessItem[] {
  const hasProviderCode = Boolean(coerceToOptionalString(invoice.service_provider_code));
  const payer = coerceToOptionalString(invoice.claim_payer_code)?.toUpperCase();

  return [
    {
      label: "Invoice is posted",
      met: String(invoice.state).toLowerCase() === "posted",
    },
    {
      label: "Visit has at least one diagnosis",
      met: Boolean(invoice.has_diagnosis),
      hint: invoice.visit_uuid
        ? "Add diagnoses on the Diagnoses tab."
        : "Link this invoice to a visit first.",
    },
    {
      label: "Practitioner mapping is configured",
      met: Boolean(invoice.has_practitioner_mapping) || hasProviderCode,
      hint: payer
        ? `Add a mapping under Settings → Integrations → ${payer} → Practitioner mappings.`
        : "Add a practitioner mapping under Settings → Integrations.",
    },
    {
      label: payerConnectionLabel(invoice),
      met:
        invoice.can_initiate_claim
        || Boolean(claim)
        || Boolean(invoice.claim_status),
      hint: payer
        ? `Add ${payer} credentials under Settings → Integrations.`
        : "Add payer credentials under Settings → Integrations.",
    },
  ];
}

/**
 * Combined system + requirement checks (create-claim gating / tab indicator).
 */
export function getInvoiceClaimReadinessItems(
  invoice: Invoice,
  claim?: ClaimDetail | null,
): InvoiceClaimReadinessItem[] {
  return [
    ...getInvoiceClaimSystemReadinessItems(invoice, claim),
    ...getClaimRequirementCheckItems(invoice, claim),
  ];
}

export function hasInvoiceClaimReadinessIssues(
  invoice: Invoice,
  claim?: ClaimDetail | null,
): boolean {
  return getInvoiceClaimReadinessItems(invoice, claim).some((item) => !item.met);
}

export function hasClaimRequirementIssues(
  invoice: Invoice,
  claim?: ClaimDetail | null,
): boolean {
  return getClaimRequirementCheckItems(invoice, claim).some((item) => !item.met);
}

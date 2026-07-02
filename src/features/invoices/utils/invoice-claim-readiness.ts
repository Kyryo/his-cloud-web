import type { ClaimDetail } from "@/features/claims/types/claims.types";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { coerceToOptionalString } from "@/lib/coerce-string";

export type InvoiceClaimReadinessItem = {
  label: string;
  met: boolean;
  hint?: string;
};

export function getInvoiceClaimReadinessItems(
  invoice: Invoice,
  claim?: ClaimDetail | null,
): InvoiceClaimReadinessItem[] {
  const hasProviderCode = Boolean(coerceToOptionalString(invoice.service_provider_code));

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
      hint: "Add a mapping under Settings → Integrations → MASM → Practitioner mappings.",
    },
    {
      label: "MASM connection is configured",
      met:
        invoice.can_initiate_claim
        || Boolean(claim)
        || Boolean(invoice.claim_status),
      hint: "Add MASM credentials under Settings → Integrations → MASM eClaims.",
    },
  ];
}

export function hasInvoiceClaimReadinessIssues(
  invoice: Invoice,
  claim?: ClaimDetail | null,
): boolean {
  return getInvoiceClaimReadinessItems(invoice, claim).some((item) => !item.met);
}

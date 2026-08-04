import { isInsuranceInvoice } from "@/features/claims/services/claims.service";
import type { Invoice } from "@/features/invoices/types/invoice.types";

/** Posted insurance invoices that can start a new claim from the Claims list. */
export function isClaimableInvoice(invoice: Invoice): boolean {
  if (String(invoice.state).toLowerCase() !== "posted") {
    return false;
  }

  if (invoice.can_initiate_claim === true) {
    return true;
  }

  return (
    isInsuranceInvoice(invoice) &&
    Boolean(invoice.visit_id || invoice.visit_uuid)
  );
}

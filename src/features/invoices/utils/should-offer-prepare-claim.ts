/**
 * Offer the post-invoice Prepare Claim flow when the payer has claim
 * integration credentials configured for this invoice's visit.
 */
export function shouldOfferPrepareClaimAfterInvoice(invoice: {
  payer_integration_configured?: boolean | null;
}): boolean {
  return invoice.payer_integration_configured === true;
}

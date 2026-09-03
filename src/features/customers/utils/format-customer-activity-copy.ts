import type { CustomerEncounter } from "@/features/customers/types/customer-encounter.types";

function detailString(
  details: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = details[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return null;
}

function claimLabel(details: Record<string, unknown>): string | null {
  const claimId = detailString(details, ["claim_id"]);
  return claimId ? `claim #${claimId}` : null;
}

/**
 * Build clearer title/summary copy for client activity rows.
 * Works for existing terse records and richer detail payloads.
 */
export function formatCustomerActivityCopy(encounter: CustomerEncounter): {
  title: string;
  summary: string;
} {
  const details = encounter.details ?? {};
  const claim = claimLabel(details);
  const payer = detailString(details, ["payer_code"]);
  const orderName = detailString(details, ["order_name"]);
  const invoiceName = detailString(details, ["invoice_name"]);
  const paymentName = detailString(details, ["payment_name"]);
  const findingCode = detailString(details, ["finding_code"]);
  const diagnosisCode = detailString(details, ["code"]);
  const diagnosisDescription = detailString(details, ["description"]);
  const findingCount = detailString(details, ["finding_count"]);
  const aiCount = detailString(details, ["ai_count"]);
  const customerName = detailString(details, ["full_name"]) ?? encounter.customer_name;
  const identifier =
    detailString(details, ["customer_identifier"]) ??
    encounter.customer_identifier;

  switch (encounter.action) {
    case "CUSTOMER_CREATED":
      return {
        title: "Client profile created",
        summary: [customerName, identifier ? `MRN ${identifier}` : null]
          .filter(Boolean)
          .join(" · "),
      };
    case "CUSTOMER_UPDATED":
      return {
        title: "Client profile updated",
        summary: "Demographic or account details were changed for this client.",
      };
    case "CUSTOMER_ARCHIVED":
      return {
        title: "Client profile archived",
        summary: "This client was archived and is no longer active.",
      };
    case "OPENING_BALANCE_UPDATED":
      return {
        title: "Opening balance updated",
        summary: "The client's opening balance was changed.",
      };
    case "INSURANCE_ADDED":
      return {
        title: "Insurance coverage added",
        summary: "A new insurance policy was linked to this client.",
      };
    case "INSURANCE_UPDATED":
      return {
        title: "Insurance coverage updated",
        summary: "An insurance policy linked to this client was changed.",
      };
    case "INSURANCE_ARCHIVED":
      return {
        title: "Insurance coverage removed",
        summary: "An insurance policy was archived for this client.",
      };
    case "ADDRESS_ADDED":
      return {
        title: "Address added",
        summary: "A new address was added to this client's record.",
      };
    case "ADDRESS_UPDATED":
      return {
        title: "Address updated",
        summary: "An address on this client's record was changed.",
      };
    case "ADDRESS_ARCHIVED":
      return {
        title: "Address removed",
        summary: "An address was archived from this client's record.",
      };
    case "NOTE_ADDED":
      return {
        title: "Note added",
        summary: "A new note was saved on this client's record.",
      };
    case "NOTE_UPDATED":
      return {
        title: "Note updated",
        summary: "An existing client note was edited.",
      };
    case "NOTE_ARCHIVED":
      return {
        title: "Note archived",
        summary: "A client note was archived.",
      };
    case "GUARDIAN_ADDED":
      return {
        title: "Legal guardian added",
        summary: "A legal guardian was linked to this client.",
      };
    case "GUARDIAN_UPDATED":
      return {
        title: "Legal guardian updated",
        summary: "Guardian details for this client were changed.",
      };
    case "GUARDIAN_ARCHIVED":
      return {
        title: "Legal guardian removed",
        summary: "A legal guardian was archived for this client.",
      };
    case "TAG_ASSIGNED":
      return {
        title: "Tag assigned",
        summary: "A tag was added to this client's profile.",
      };
    case "TAG_REMOVED":
      return {
        title: "Tag removed",
        summary: "A tag was removed from this client's profile.",
      };
    case "VISIT_CREATED":
      return {
        title: "Visit started",
        summary: "A new clinical visit was opened for this client.",
      };
    case "VISIT_UPDATED":
      return {
        title: "Visit updated",
        summary: "Details for an existing visit were changed.",
      };
    case "ORDER_ADDED":
      return {
        title: "Sales order created",
        summary: orderName
          ? `Order ${orderName} was created for this client.`
          : "A new sales order was created for this client.",
      };
    case "ORDER_CONFIRMED":
      return {
        title: "Sales order confirmed",
        summary: orderName
          ? `Order ${orderName} was confirmed.`
          : "A sales order was confirmed.",
      };
    case "ORDER_INVOICED":
      return {
        title: "Sales order invoiced",
        summary: [orderName ? `Order ${orderName}` : null, invoiceName]
          .filter(Boolean)
          .join(" · ") || "A sales order was converted to an invoice.",
      };
    case "ORDER_CANCELLED":
      return {
        title: "Sales order cancelled",
        summary: orderName
          ? `Order ${orderName} was cancelled.`
          : "A sales order was cancelled.",
      };
    case "ORDER_LINE_ADDED":
      return {
        title: "Order line added",
        summary: orderName
          ? `A line item was added to order ${orderName}.`
          : "A line item was added to a sales order.",
      };
    case "INVOICE_CREATED":
      return {
        title: "Invoice created",
        summary: invoiceName
          ? `Invoice ${invoiceName} was created for this client.`
          : "A new invoice was created for this client.",
      };
    case "INVOICE_CANCELLED":
      return {
        title: "Invoice cancelled",
        summary: invoiceName
          ? `Invoice ${invoiceName} was cancelled.`
          : "An invoice was cancelled.",
      };
    case "PAYMENT_RECORDED":
      return {
        title: "Payment recorded",
        summary: paymentName
          ? `Payment ${paymentName} was recorded.`
          : "A payment was recorded against this client's account.",
      };
    case "PAYMENT_CANCELLED":
      return {
        title: "Payment cancelled",
        summary: paymentName
          ? `Payment ${paymentName} was cancelled.`
          : "A payment was cancelled.",
      };
    case "CLAIM_CREATED":
      return {
        title: claim
          ? `Insurance claim created (${claim})`
          : "Insurance claim created",
        summary: [
          "A new claim draft was prepared for this client",
          payer ? `payer ${payer}` : null,
        ]
          .filter(Boolean)
          .join(" · "),
      };
    case "CLAIM_SUBMITTED":
      return {
        title: claim
          ? `Insurance claim submitted (${claim})`
          : "Insurance claim submitted",
        summary: [
          "The claim was submitted to the payer",
          payer ? `payer ${payer}` : null,
        ]
          .filter(Boolean)
          .join(" · "),
      };
    case "CLAIM_UPDATED":
      return {
        title: claim
          ? `Insurance claim updated (${claim})`
          : "Insurance claim updated",
        summary:
          encounter.summary?.trim() &&
          encounter.summary.trim().toLowerCase() !== "claim updated"
            ? encounter.summary
            : "Claim details or status were changed.",
      };
    case "CLAIM_VITALS_UPDATED":
      return {
        title: claim
          ? `Claim vital signs updated (${claim})`
          : "Claim vital signs updated",
        summary: "Vital signs recorded on the claim were changed.",
      };
    case "CLAIM_DIAGNOSIS_ADDED":
      return {
        title: claim
          ? `Diagnosis added to ${claim}`
          : "Diagnosis added to claim",
        summary: [diagnosisCode, diagnosisDescription].filter(Boolean).join(" — ") ||
          "A diagnosis was added to the insurance claim.",
      };
    case "CLAIM_DIAGNOSES_SYNCED":
      return {
        title: claim
          ? `Diagnoses synced to ${claim}`
          : "Claim diagnoses synced",
        summary: "Diagnoses were synced from the visit onto the claim draft.",
      };
    case "CLAIM_ADVISORIES_EVALUATED":
      return {
        title: claim
          ? `Claim advisories evaluated (${claim})`
          : "Claim advisories evaluated",
        summary: [
          findingCount != null ? `${findingCount} finding(s)` : null,
          aiCount != null ? `${aiCount} AI finding(s)` : null,
        ]
          .filter(Boolean)
          .join(" · ") ||
          "Advisory checks were run against the claim before submission.",
      };
    case "CLAIM_ADVISORY_CLEARED":
      return {
        title: claim
          ? `Advisory finding cleared (${claim})`
          : "Advisory finding cleared",
        summary: findingCode
          ? `Finding ${findingCode} was cleared on the claim.`
          : "An advisory finding was cleared on the claim.",
      };
    case "CLAIM_ADVISORY_OVERRIDE":
      return {
        title: claim
          ? `Advisory override recorded (${claim})`
          : "Advisory override recorded",
        summary: "An advisory finding was overridden with a note.",
      };
    case "CLAIM_ADVISORY_APPLIED":
      return {
        title: claim
          ? `Advisory fix applied (${claim})`
          : "Advisory fix applied",
        summary: findingCode
          ? `A suggested fix for ${findingCode} was applied.`
          : "A suggested advisory fix was applied to the claim.",
      };
    case "CLAIM_PAYER_WEBHOOK_RECEIVED":
      return {
        title: claim
          ? `Payer update received (${claim})`
          : "Payer update received",
        summary:
          encounter.summary?.trim() ||
          "An update was received from the payer portal.",
      };
    default: {
      const title =
        encounter.action_display?.trim() ||
        encounter.summary?.trim() ||
        "Activity recorded";
      const summary =
        encounter.summary?.trim() &&
        encounter.summary.trim().toLowerCase() !== title.toLowerCase()
          ? encounter.summary.trim()
          : "An event was recorded for this client.";
      return { title, summary };
    }
  }
}

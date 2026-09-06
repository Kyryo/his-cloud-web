import type { ClinicalCapabilityKey } from "@/features/clinical-opd/types/clinical-opd.types";
import type { ClinicalOrderItemType } from "@/features/clinical-opd/schemas/clinical-opd.schema";

export const CLINICAL_ORDER_ITEM_TYPE_OPTIONS: Array<{
  value: ClinicalOrderItemType;
  label: string;
  capability: ClinicalCapabilityKey;
}> = [
  {
    value: "LABORATORY",
    label: "Laboratory",
    capability: "order_laboratory",
  },
  {
    value: "RADIOLOGY",
    label: "Radiology",
    capability: "order_radiology",
  },
  {
    value: "PROCEDURE",
    label: "Procedure",
    capability: "order_procedure",
  },
  {
    value: "SUNDRY",
    label: "Sundry",
    capability: "order_sundry",
  },
  {
    value: "MEDICATION",
    label: "Medication",
    capability: "order_medication",
  },
];

export function getOrderItemTypesForCapabilities(
  capabilities: readonly string[],
) {
  const capabilitySet = new Set(capabilities);
  return CLINICAL_ORDER_ITEM_TYPE_OPTIONS.filter((option) =>
    capabilitySet.has(option.capability),
  );
}

export function formatBillingModeLabel(
  billingMode: string | null | undefined,
): string {
  if (billingMode === "separate_department") {
    return "Separate bill for this department";
  }
  if (billingMode === "shared_visit") {
    return "One bill for this visit";
  }
  return "—";
}

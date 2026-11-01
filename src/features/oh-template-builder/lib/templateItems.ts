import type {
  OhCatalogItemAttributes,
  OhCatalogPossibleResponse,
  OhCatalogScheduleRow,
} from "@/features/occupational-health/types";
import { toUpperCode } from "@/features/oh-template-builder/lib/templateCodes";
import type { ItemInput } from "@/features/oh-template-builder/template-builder.types";

export function cleanResponses(
  responses: OhCatalogPossibleResponse[],
): OhCatalogPossibleResponse[] {
  return responses.flatMap((row) => {
    const label = row.label.trim();
    const code = toUpperCode(row.code.trim() || label);
    return code ? [{ code, label: label || code }] : [];
  });
}

export function cleanSchedule(
  schedule: OhCatalogScheduleRow[],
): OhCatalogScheduleRow[] {
  return schedule.map((row) => ({
    interval: Math.max(1, Math.floor(Number(row.interval) || 1)),
    unit: row.unit || "month",
    notes: (row.notes ?? "").trim(),
  }));
}

/**
 * Merges editor input into stored item attributes. Unknown keys are kept so
 * server-side extensions survive edits; selection mode now lives on the section.
 */
export function buildItemAttributes(
  existing: OhCatalogItemAttributes | undefined,
  input: ItemInput,
): OhCatalogItemAttributes {
  const rest: OhCatalogItemAttributes = { ...existing };
  delete rest.selection_mode;
  return {
    ...rest,
    possible_responses: cleanResponses(input.responses),
    is_mandatory: input.isMandatory,
    schedule: cleanSchedule(input.schedule),
  };
}

export function buildItemNames(name: string): Record<string, string> {
  const trimmed = name.trim();
  return trimmed ? { en: trimmed } : {};
}

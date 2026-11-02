import type { OhCatalogSelectionMode } from "@/features/occupational-health/types";
import type { BuilderAttachment } from "@/features/oh-template-builder/template-builder.types";

/** Picked item uuids per attachment uuid. */
export type PreviewAnswers = Readonly<Record<string, readonly string[]>>;

/** Field values per owner (attachment uuid for direct sections, item uuid otherwise), keyed by field code. */
export type PreviewValues = Readonly<Record<string, Readonly<Record<string, string>>>>;

export function togglePreviewPick(
  picked: readonly string[],
  itemUuid: string,
  mode: OhCatalogSelectionMode,
): readonly string[] {
  if (mode === "exclusive") {
    return picked.includes(itemUuid) ? [] : [itemUuid];
  }
  return picked.includes(itemUuid)
    ? picked.filter((uuid) => uuid !== itemUuid)
    : [...picked, itemUuid];
}

export function setPreviewValue(
  values: PreviewValues,
  ownerUuid: string,
  fieldCode: string,
  value: string,
): PreviewValues {
  return { ...values, [ownerUuid]: { ...values[ownerUuid], [fieldCode]: value } };
}

export function isPreviewSectionAnswered(
  attachment: BuilderAttachment,
  answers: PreviewAnswers,
  values: PreviewValues,
): boolean {
  if (attachment.section?.contentMode === "direct") {
    return Object.values(values[attachment.uuid] ?? {}).some((value) => value.trim() !== "");
  }
  return (answers[attachment.uuid]?.length ?? 0) > 0;
}

export function previewProgress(
  attachments: BuilderAttachment[],
  answers: PreviewAnswers,
  values: PreviewValues = {},
) {
  let total = 0;
  let answered = 0;
  for (const attachment of attachments) {
    if (!attachment.section?.isMandatory) {
      continue;
    }
    total += 1;
    if (isPreviewSectionAnswered(attachment, answers, values)) {
      answered += 1;
    }
  }
  return { answered, total };
}

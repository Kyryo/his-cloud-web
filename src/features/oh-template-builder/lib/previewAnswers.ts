import type { OhCatalogSelectionMode } from "@/features/occupational-health/types";
import type { BuilderAttachment } from "@/features/oh-template-builder/template-builder.types";

/** Picked item uuids per attachment uuid. */
export type PreviewAnswers = Readonly<Record<string, readonly string[]>>;

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

export function previewProgress(attachments: BuilderAttachment[], answers: PreviewAnswers) {
  let total = 0;
  let answered = 0;
  for (const attachment of attachments) {
    if (!attachment.section?.isMandatory) {
      continue;
    }
    total += 1;
    if ((answers[attachment.uuid]?.length ?? 0) > 0) {
      answered += 1;
    }
  }
  return { answered, total };
}

import type { BuilderAttachment } from "@/features/oh-template-builder/template-builder.types";

export type MoveDirection = "up" | "down";

type Reordered = {
  attachments: BuilderAttachment[];
  /** Attachments whose stored position must be patched. */
  changes: Array<{ uuid: string; sortOrder: number }>;
};

/**
 * Moves one attachment a single step and renumbers positions 0..n-1 so
 * duplicate or sparse sort orders from older data are normalised.
 */
export function moveAttachment(
  attachments: BuilderAttachment[],
  attachmentUuid: string,
  direction: MoveDirection,
): Reordered | null {
  const from = attachments.findIndex((row) => row.uuid === attachmentUuid);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from === -1 || to < 0 || to >= attachments.length) {
    return null;
  }
  const next = [...attachments];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);

  const changes: Reordered["changes"] = [];
  const renumbered = next.map((row, index) => {
    if (row.sortOrder === index) {
      return row;
    }
    changes.push({ uuid: row.uuid, sortOrder: index });
    return { ...row, sortOrder: index };
  });
  return { attachments: renumbered, changes };
}

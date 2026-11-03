import type { OhResponseField } from "@/features/occupational-health/types";

export type ExamTemplateSnapshotItem = {
  code: string;
  name: string;
  sort_order?: number;
  inherits?: boolean;
  response_fields: OhResponseField[];
};

export type ExamTemplateSnapshotSection = {
  code: string;
  name: string;
  content_mode: "items" | "direct" | string;
  is_mandatory?: boolean;
  selection_mode?: "exclusive" | "inclusive" | string;
  sort_order?: number;
  response_fields?: OhResponseField[];
  items: ExamTemplateSnapshotItem[];
};

export type ExamTemplateSnapshot = {
  schema_version?: number;
  sections: ExamTemplateSnapshotSection[];
};

export type ExamTemplateAnswers = {
  /** Picked item codes per section code. */
  picks: Record<string, string[]>;
  /** Field values keyed by `${sectionCode}` (direct) or `${sectionCode}:${itemCode}`. */
  fields: Record<string, Record<string, string>>;
};

export type ExamTemplateResponseEnvelope = {
  template_uuid: string;
  template_name?: string;
  version_number?: number | null;
  hazard_profile_id?: number | null;
  answers: ExamTemplateAnswers;
};

export function parseExamTemplateSnapshot(raw: unknown): ExamTemplateSnapshot | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const sections = (raw as { sections?: unknown }).sections;
  if (!Array.isArray(sections)) {
    return null;
  }
  const normalized: ExamTemplateSnapshotSection[] = sections
    .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object")
    .map((row, index) => ({
      code: String(row.code ?? `section_${index + 1}`),
      name: String(row.name ?? "Section"),
      content_mode: String(row.content_mode ?? "items"),
      is_mandatory: Boolean(row.is_mandatory),
      selection_mode: String(row.selection_mode ?? "inclusive"),
      sort_order: typeof row.sort_order === "number" ? row.sort_order : index + 1,
      response_fields: Array.isArray(row.response_fields)
        ? (row.response_fields as OhResponseField[])
        : [],
      items: Array.isArray(row.items)
        ? (row.items as ExamTemplateSnapshotItem[]).map((item, itemIndex) => ({
            code: String(item.code ?? `item_${itemIndex + 1}`),
            name: String(item.name ?? item.code ?? "Item"),
            sort_order: item.sort_order ?? itemIndex + 1,
            inherits: item.inherits,
            response_fields: Array.isArray(item.response_fields)
              ? item.response_fields
              : [],
          }))
        : [],
    }))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  return {
    schema_version: Number((raw as { schema_version?: number }).schema_version ?? 2),
    sections: normalized,
  };
}

export function emptyExamTemplateAnswers(): ExamTemplateAnswers {
  return { picks: {}, fields: {} };
}

export function fieldOwnerKey(sectionCode: string, itemCode?: string) {
  return itemCode ? `${sectionCode}:${itemCode}` : sectionCode;
}

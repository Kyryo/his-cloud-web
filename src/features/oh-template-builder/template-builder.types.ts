import type {
  OhCatalogItemAttributes,
  OhCatalogPossibleResponse,
  OhCatalogScheduleRow,
  OhCatalogSelectionMode,
} from "@/features/occupational-health/types";

export type TemplateKind = "exam" | "certificate";

export const TEMPLATE_KINDS: readonly TemplateKind[] = ["exam", "certificate"];

export type BuilderTemplate = {
  uuid: string;
  name: string;
  code: string;
  active: boolean;
  sectionCount: number | null;
  updatedAt: string | null;
};

export type BuilderSection = {
  uuid: string;
  code: string;
  name: string;
  isMandatory: boolean;
  selectionMode: OhCatalogSelectionMode;
  /** System sections back programme requirements; their code and library entry are protected. */
  isSystem: boolean;
  active: boolean;
};

/** A library section placed on a template, with its position. */
export type BuilderAttachment = {
  uuid: string;
  sectionUuid: string;
  sortOrder: number;
  itemCount: number | null;
  section: BuilderSection | null;
};

export type BuilderItem = {
  uuid: string;
  code: string;
  name: string;
  isMandatory: boolean;
  schedule: OhCatalogScheduleRow[];
  responses: OhCatalogPossibleResponse[];
  active: boolean;
  attributes: OhCatalogItemAttributes;
};

export type SectionInput = {
  name: string;
  isMandatory: boolean;
  selectionMode: OhCatalogSelectionMode;
};

export type NewSectionInput = SectionInput & { code: string };

export type ItemInput = {
  name: string;
  code: string;
  isMandatory: boolean;
  schedule: OhCatalogScheduleRow[];
  responses: OhCatalogPossibleResponse[];
};

export type BuilderSelection =
  | { type: "template" }
  | { type: "section"; attachmentUuid: string }
  | { type: "item"; attachmentUuid: string; itemUuid: string };

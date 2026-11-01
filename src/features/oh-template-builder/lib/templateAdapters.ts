import {
  archiveOhCatalogItem,
  archiveOhCatalogSection,
  archiveOhCofTemplate,
  archiveOhExamSection,
  archiveOhExamSectionItem,
  archiveOhExamTemplate,
  attachOhCofTemplateSection,
  attachOhExamTemplateSection,
  createOhCatalogItem,
  createOhCatalogSection,
  createOhCofTemplate,
  createOhExamSection,
  createOhExamSectionItem,
  createOhExamTemplate,
  detachOhCofTemplateSection,
  detachOhExamTemplateSection,
  fetchOhCatalogItemsPage,
  fetchOhCatalogSections,
  fetchOhCofTemplate,
  fetchOhCofTemplateSections,
  fetchOhCofTemplates,
  fetchOhExamSectionItemsPage,
  fetchOhExamSections,
  fetchOhExamTemplate,
  fetchOhExamTemplateSections,
  fetchOhExamTemplates,
  getCatalogItemMandatory,
  getCatalogPossibleResponses,
  getCatalogSchedule,
  getSectionSelectionMode,
  ohCatalogItemLabel,
  ohCatalogSectionIsSystem,
  ohExamSectionItemLabel,
  updateOhCatalogItem,
  updateOhCatalogSection,
  updateOhCofTemplate,
  updateOhCofTemplateSection,
  updateOhExamSection,
  updateOhExamSectionItem,
  updateOhExamTemplate,
  updateOhExamTemplateSection,
} from "@/features/occupational-health/services/oh.service";
import type {
  OhCatalogItem,
  OhCatalogSection,
  OhCofTemplate,
  OhCofTemplateSection,
  OhExamSection,
  OhExamSectionItem,
  OhExamTemplate,
  OhExamTemplateSection,
} from "@/features/occupational-health/types";
import {
  buildItemAttributes,
  buildItemNames,
} from "@/features/oh-template-builder/lib/templateItems";
import { toUpperCode } from "@/features/oh-template-builder/lib/templateCodes";
import type {
  BuilderAttachment,
  BuilderItem,
  BuilderSection,
  BuilderTemplate,
  ItemInput,
  NewSectionInput,
  SectionInput,
  TemplateKind,
} from "@/features/oh-template-builder/template-builder.types";

/** Items per section loaded into the builder canvas. */
export const SECTION_ITEMS_PAGE_SIZE = 100;

export type TemplateAdapter = {
  listTemplates: () => Promise<BuilderTemplate[]>;
  getTemplate: (uuid: string) => Promise<BuilderTemplate>;
  createTemplate: (input: { name: string; code: string }) => Promise<BuilderTemplate>;
  renameTemplate: (uuid: string, name: string) => Promise<BuilderTemplate>;
  archiveTemplate: (uuid: string) => Promise<void>;
  listAttachments: (templateUuid: string) => Promise<BuilderAttachment[]>;
  attachSection: (
    templateUuid: string,
    sectionUuid: string,
    sortOrder: number,
  ) => Promise<BuilderAttachment>;
  detachSection: (attachmentUuid: string) => Promise<void>;
  moveAttachment: (attachmentUuid: string, sortOrder: number) => Promise<void>;
  listLibrary: () => Promise<BuilderSection[]>;
  createSection: (input: NewSectionInput) => Promise<BuilderSection>;
  updateSection: (uuid: string, input: SectionInput) => Promise<BuilderSection>;
  archiveSection: (uuid: string) => Promise<void>;
  listItems: (sectionUuid: string) => Promise<{ items: BuilderItem[]; total: number }>;
  createItem: (sectionUuid: string, input: ItemInput) => Promise<BuilderItem>;
  updateItem: (item: BuilderItem, input: ItemInput) => Promise<BuilderItem>;
  archiveItem: (uuid: string) => Promise<void>;
};

function toTemplate(row: OhCofTemplate | OhExamTemplate): BuilderTemplate {
  return {
    uuid: row.uuid,
    name: row.name,
    code: row.code,
    active: row.active !== false,
    sectionCount: typeof row.section_count === "number" ? row.section_count : null,
    updatedAt: row.updated_at ?? null,
  };
}

function fromCatalogSection(row: OhCatalogSection): BuilderSection {
  return {
    uuid: row.uuid,
    code: row.code,
    name: row.name,
    isMandatory: Boolean(row.is_mandatory),
    selectionMode: getSectionSelectionMode(row),
    isSystem: ohCatalogSectionIsSystem(row),
    active: row.active !== false,
  };
}

function fromExamSection(row: OhExamSection): BuilderSection {
  return {
    uuid: row.uuid,
    code: row.code,
    name: row.name,
    isMandatory: Boolean(row.is_mandatory),
    selectionMode: getSectionSelectionMode(row),
    isSystem: false,
    active: row.active !== false,
  };
}

function fromCofAttachment(row: OhCofTemplateSection): BuilderAttachment {
  return {
    uuid: row.uuid,
    sectionUuid: row.catalog_section,
    sortOrder: row.sort_order,
    itemCount: typeof row.item_count === "number" ? row.item_count : null,
    section: row.catalog_section_detail
      ? fromCatalogSection(row.catalog_section_detail)
      : null,
  };
}

function fromExamAttachment(row: OhExamTemplateSection): BuilderAttachment {
  return {
    uuid: row.uuid,
    sectionUuid: row.exam_section,
    sortOrder: row.sort_order,
    itemCount: typeof row.item_count === "number" ? row.item_count : null,
    section: row.exam_section_detail
      ? fromExamSection(row.exam_section_detail)
      : null,
  };
}

function fromItem(
  row: OhCatalogItem | OhExamSectionItem,
  name: string,
): BuilderItem {
  return {
    uuid: row.uuid,
    code: row.code,
    name,
    isMandatory: getCatalogItemMandatory(row),
    schedule: getCatalogSchedule(row),
    responses: getCatalogPossibleResponses(row),
    active: row.active !== false,
    attributes: row.attributes_json ?? {},
  };
}

function byPosition(a: BuilderAttachment, b: BuilderAttachment) {
  return a.sortOrder - b.sortOrder;
}

function sectionPayload(input: SectionInput) {
  return {
    name: input.name.trim(),
    is_mandatory: input.isMandatory,
    selection_mode: input.selectionMode,
  };
}

function itemPayload(existing: BuilderItem | null, input: ItemInput) {
  return {
    code: toUpperCode(input.code),
    names_i18n: buildItemNames(input.name),
    attributes_json: buildItemAttributes(existing?.attributes, input),
  };
}

const certificateAdapter: TemplateAdapter = {
  listTemplates: async () => (await fetchOhCofTemplates()).map(toTemplate),
  getTemplate: async (uuid) => toTemplate(await fetchOhCofTemplate(uuid)),
  createTemplate: async (input) => toTemplate(await createOhCofTemplate(input)),
  renameTemplate: async (uuid, name) =>
    toTemplate(await updateOhCofTemplate(uuid, { name })),
  archiveTemplate: async (uuid) => {
    await archiveOhCofTemplate(uuid);
  },
  listAttachments: async (templateUuid) =>
    (await fetchOhCofTemplateSections(templateUuid))
      .filter((row) => row.active !== false)
      .map(fromCofAttachment)
      .toSorted(byPosition),
  attachSection: async (templateUuid, sectionUuid, sortOrder) =>
    fromCofAttachment(
      await attachOhCofTemplateSection({
        template: templateUuid,
        catalog_section: sectionUuid,
        sort_order: sortOrder,
      }),
    ),
  detachSection: async (uuid) => {
    await detachOhCofTemplateSection(uuid);
  },
  moveAttachment: async (uuid, sortOrder) => {
    await updateOhCofTemplateSection(uuid, { sort_order: sortOrder });
  },
  listLibrary: async () =>
    (await fetchOhCatalogSections())
      .filter((row) => row.active !== false)
      .map(fromCatalogSection),
  createSection: async (input) =>
    fromCatalogSection(
      await createOhCatalogSection({ code: input.code, ...sectionPayload(input) }),
    ),
  updateSection: async (uuid, input) =>
    fromCatalogSection(await updateOhCatalogSection(uuid, sectionPayload(input))),
  archiveSection: async (uuid) => {
    await archiveOhCatalogSection(uuid);
  },
  listItems: async (sectionUuid) => {
    const response = await fetchOhCatalogItemsPage({
      sectionUuid,
      pageSize: SECTION_ITEMS_PAGE_SIZE,
    });
    const items = response.results
      .filter((row) => row.active !== false)
      .map((row) => fromItem(row, ohCatalogItemLabel(row)));
    return { items, total: response.pagination?.count ?? items.length };
  },
  createItem: async (sectionUuid, input) => {
    const row = await createOhCatalogItem({
      section: sectionUuid,
      active: true,
      ...itemPayload(null, input),
    });
    return fromItem(row, ohCatalogItemLabel(row));
  },
  updateItem: async (item, input) => {
    const row = await updateOhCatalogItem(item.uuid, itemPayload(item, input));
    return fromItem(row, ohCatalogItemLabel(row));
  },
  archiveItem: async (uuid) => {
    await archiveOhCatalogItem(uuid);
  },
};

const examAdapter: TemplateAdapter = {
  listTemplates: async () => (await fetchOhExamTemplates()).map(toTemplate),
  getTemplate: async (uuid) => toTemplate(await fetchOhExamTemplate(uuid)),
  createTemplate: async (input) => toTemplate(await createOhExamTemplate(input)),
  renameTemplate: async (uuid, name) =>
    toTemplate(await updateOhExamTemplate(uuid, { name })),
  archiveTemplate: async (uuid) => {
    await archiveOhExamTemplate(uuid);
  },
  listAttachments: async (templateUuid) =>
    (await fetchOhExamTemplateSections(templateUuid))
      .filter((row) => row.active !== false)
      .map(fromExamAttachment)
      .toSorted(byPosition),
  attachSection: async (templateUuid, sectionUuid, sortOrder) =>
    fromExamAttachment(
      await attachOhExamTemplateSection({
        template: templateUuid,
        exam_section: sectionUuid,
        sort_order: sortOrder,
      }),
    ),
  detachSection: async (uuid) => {
    await detachOhExamTemplateSection(uuid);
  },
  moveAttachment: async (uuid, sortOrder) => {
    await updateOhExamTemplateSection(uuid, { sort_order: sortOrder });
  },
  listLibrary: async () =>
    (await fetchOhExamSections())
      .filter((row) => row.active !== false)
      .map(fromExamSection),
  createSection: async (input) =>
    fromExamSection(
      await createOhExamSection({ code: input.code, ...sectionPayload(input) }),
    ),
  updateSection: async (uuid, input) =>
    fromExamSection(await updateOhExamSection(uuid, sectionPayload(input))),
  archiveSection: async (uuid) => {
    await archiveOhExamSection(uuid);
  },
  listItems: async (sectionUuid) => {
    const response = await fetchOhExamSectionItemsPage({
      sectionUuid,
      pageSize: SECTION_ITEMS_PAGE_SIZE,
    });
    const items = response.results
      .filter((row) => row.active !== false)
      .toSorted((a, b) => a.sort_order - b.sort_order)
      .map((row) => fromItem(row, ohExamSectionItemLabel(row)));
    return { items, total: response.pagination?.count ?? items.length };
  },
  createItem: async (sectionUuid, input) => {
    const row = await createOhExamSectionItem({
      section: sectionUuid,
      active: true,
      ...itemPayload(null, input),
    });
    return fromItem(row, ohExamSectionItemLabel(row));
  },
  updateItem: async (item, input) => {
    const row = await updateOhExamSectionItem(item.uuid, itemPayload(item, input));
    return fromItem(row, ohExamSectionItemLabel(row));
  },
  archiveItem: async (uuid) => {
    await archiveOhExamSectionItem(uuid);
  },
};

const ADAPTERS: Record<TemplateKind, TemplateAdapter> = {
  certificate: certificateAdapter,
  exam: examAdapter,
};

export function getTemplateAdapter(kind: TemplateKind) {
  return ADAPTERS[kind];
}

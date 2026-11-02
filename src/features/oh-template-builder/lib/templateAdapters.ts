import {
  archiveOhCofTemplate,
  archiveOhExamTemplate,
  archiveOhLibrarySection,
  archiveOhLibrarySectionItem,
  attachOhCofTemplateSection,
  attachOhExamTemplateSection,
  createOhCofTemplate,
  createOhExamTemplate,
  createOhLibrarySection,
  createOhLibrarySectionItem,
  detachOhCofTemplateSection,
  detachOhExamTemplateSection,
  fetchOhCofTemplate,
  fetchOhCofTemplateSections,
  fetchOhCofTemplates,
  fetchOhExamTemplate,
  fetchOhExamTemplateSections,
  fetchOhExamTemplates,
  fetchOhLibrarySectionItemsPage,
  fetchOhLibrarySections,
  getSectionSelectionMode,
  ohLibrarySectionItemLabel,
  reorderOhLibrarySectionItems,
  updateOhCofTemplate,
  updateOhCofTemplateSection,
  updateOhExamTemplate,
  updateOhExamTemplateSection,
  updateOhLibrarySection,
  updateOhLibrarySectionItem,
} from "@/features/occupational-health/services/oh.service";
import type {
  OhCofTemplate,
  OhCofTemplateSection,
  OhExamTemplate,
  OhExamTemplateSection,
  OhLibrarySection,
  OhLibrarySectionItem,
  OhLibrarySectionKind,
  OhResponseField,
} from "@/features/occupational-health/types";
import {
  defaultResponseFields,
  normalizeResponseFields,
  optionsFromResponseFields,
  resolveEffectiveResponseFields,
} from "@/features/settings/components/modules/occupational-health/template-library/responseConfig";
import { buildItemNames } from "@/features/oh-template-builder/lib/templateItems";
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
  reorderItems: (sectionUuid: string, orderedUuids: string[]) => Promise<void>;
};

const LIBRARY_KIND: Record<TemplateKind, OhLibrarySectionKind> = {
  certificate: "cof",
  exam: "exam",
};

function toTemplate(row: OhCofTemplate | OhExamTemplate): BuilderTemplate {
  return {
    uuid: row.uuid,
    name: row.name,
    code: row.code,
    active: row.active !== false,
    sectionCount: typeof row.section_count === "number" ? row.section_count : null,
    publishedVersionNumber: row.published_version_number ?? null,
    publishedVersionStatus: row.published_version_status ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function fromLibrarySection(row: OhLibrarySection): BuilderSection {
  return {
    uuid: row.uuid,
    code: row.code,
    name: row.name,
    isMandatory: Boolean(row.is_mandatory),
    selectionMode: getSectionSelectionMode(row),
    isSystem: false,
    active: row.active !== false,
    contentMode: row.content_mode ?? "items",
    defaultResponseFields: normalizeResponseFields(row.default_response_fields),
  };
}

function fromTemplateAttachment(
  row: OhCofTemplateSection | OhExamTemplateSection,
): BuilderAttachment {
  return {
    uuid: row.uuid,
    sectionUuid: row.library_section,
    sortOrder: row.sort_order,
    itemCount: typeof row.item_count === "number" ? row.item_count : null,
    section: row.library_section_detail
      ? fromLibrarySection(row.library_section_detail)
      : null,
  };
}

function fromLibraryItem(
  row: OhLibrarySectionItem,
  sectionDefault: OhResponseField[] | undefined,
  name: string,
): BuilderItem {
  const { fields, inherits } = resolveEffectiveResponseFields(
    sectionDefault,
    row.override_response_fields,
  );
  const effective = row.effective_response_fields ?? fields;
  return {
    uuid: row.uuid,
    code: row.code,
    name,
    isMandatory: false,
    schedule: [],
    responses: optionsFromResponseFields(effective),
    active: row.active !== false,
    attributes: {},
    overrideResponseFields: row.override_response_fields,
    effectiveResponseFields: effective,
    inheritsResponseFields: row.inherits_response_fields ?? inherits,
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
    content_mode: input.contentMode,
    default_response_fields: normalizeResponseFields(input.defaultResponseFields),
  };
}

function itemPayload(_item: BuilderItem | null, input: ItemInput) {
  const override = input.inheritsResponseFields
    ? null
    : normalizeResponseFields(input.overrideResponseFields);
  return {
    code: toUpperCode(input.code),
    names_i18n: buildItemNames(input.name),
    override_response_fields: override,
  };
}

function createLibraryAdapter(
  templateKind: TemplateKind,
  libraryKind: OhLibrarySectionKind,
): TemplateAdapter {
  const isCertificate = templateKind === "certificate";

  return {
    listTemplates: async () =>
      (isCertificate ? await fetchOhCofTemplates() : await fetchOhExamTemplates()).map(
        toTemplate,
      ),
    getTemplate: async (uuid) =>
      toTemplate(
        isCertificate ? await fetchOhCofTemplate(uuid) : await fetchOhExamTemplate(uuid),
      ),
    createTemplate: async (input) =>
      toTemplate(
        isCertificate
          ? await createOhCofTemplate(input)
          : await createOhExamTemplate(input),
      ),
    renameTemplate: async (uuid, name) =>
      toTemplate(
        isCertificate
          ? await updateOhCofTemplate(uuid, { name })
          : await updateOhExamTemplate(uuid, { name }),
      ),
    archiveTemplate: async (uuid) => {
      if (isCertificate) {
        await archiveOhCofTemplate(uuid);
      } else {
        await archiveOhExamTemplate(uuid);
      }
    },
    listAttachments: async (templateUuid) =>
      (isCertificate
        ? await fetchOhCofTemplateSections(templateUuid)
        : await fetchOhExamTemplateSections(templateUuid)
      )
        .filter((row) => row.active !== false)
        .map(fromTemplateAttachment)
        .toSorted(byPosition),
    attachSection: async (templateUuid, sectionUuid, sortOrder) =>
      fromTemplateAttachment(
        isCertificate
          ? await attachOhCofTemplateSection({
              template: templateUuid,
              library_section: sectionUuid,
              sort_order: sortOrder,
            })
          : await attachOhExamTemplateSection({
              template: templateUuid,
              library_section: sectionUuid,
              sort_order: sortOrder,
            }),
      ),
    detachSection: async (uuid) => {
      if (isCertificate) {
        await detachOhCofTemplateSection(uuid);
      } else {
        await detachOhExamTemplateSection(uuid);
      }
    },
    moveAttachment: async (uuid, sortOrder) => {
      if (isCertificate) {
        await updateOhCofTemplateSection(uuid, { sort_order: sortOrder });
      } else {
        await updateOhExamTemplateSection(uuid, { sort_order: sortOrder });
      }
    },
    listLibrary: async () =>
      (await fetchOhLibrarySections({ kind: libraryKind }))
        .filter((row) => row.active !== false)
        .map(fromLibrarySection),
    createSection: async (input) =>
      fromLibrarySection(
        await createOhLibrarySection({
          kind: libraryKind,
          code: input.code,
          ...sectionPayload({
            ...input,
            defaultResponseFields:
              input.defaultResponseFields ??
              (input.contentMode === "direct" ? defaultResponseFields("text") : []),
          }),
        }),
      ),
    updateSection: async (uuid, input) =>
      fromLibrarySection(await updateOhLibrarySection(uuid, sectionPayload(input))),
    archiveSection: async (uuid) => {
      await archiveOhLibrarySection(uuid);
    },
    listItems: async (sectionUuid) => {
      const sections = await fetchOhLibrarySections({ kind: libraryKind });
      const section = sections.find((row) => row.uuid === sectionUuid);
      const sectionDefault = section?.default_response_fields;
      const response = await fetchOhLibrarySectionItemsPage({
        sectionUuid,
        pageSize: SECTION_ITEMS_PAGE_SIZE,
      });
      const items = response.results
        .filter((row) => row.active !== false)
        .toSorted((a, b) => a.sort_order - b.sort_order)
        .map((row) =>
          fromLibraryItem(row, sectionDefault, ohLibrarySectionItemLabel(row)),
        );
      return { items, total: response.pagination?.count ?? items.length };
    },
    createItem: async (sectionUuid, input) => {
      const row = await createOhLibrarySectionItem({
        section: sectionUuid,
        active: true,
        ...itemPayload(null, input),
      });
      const sections = await fetchOhLibrarySections({ kind: libraryKind });
      const section = sections.find((entry) => entry.uuid === sectionUuid);
      return fromLibraryItem(
        row,
        section?.default_response_fields,
        ohLibrarySectionItemLabel(row),
      );
    },
    updateItem: async (item, input) => {
      const row = await updateOhLibrarySectionItem(item.uuid, itemPayload(item, input));
      return fromLibraryItem(
        row,
        row.effective_response_fields ?? item.effectiveResponseFields,
        ohLibrarySectionItemLabel(row),
      );
    },
    archiveItem: async (uuid) => {
      await archiveOhLibrarySectionItem(uuid);
    },
    reorderItems: async (sectionUuid, orderedUuids) => {
      await reorderOhLibrarySectionItems({
        section: sectionUuid,
        ordered_uuids: orderedUuids,
      });
    },
  };
}

const ADAPTERS: Record<TemplateKind, TemplateAdapter> = {
  certificate: createLibraryAdapter("certificate", LIBRARY_KIND.certificate),
  exam: createLibraryAdapter("exam", LIBRARY_KIND.exam),
};

export function getTemplateAdapter(kind: TemplateKind) {
  return ADAPTERS[kind];
}

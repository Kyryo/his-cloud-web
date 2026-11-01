"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useBuilderAction } from "@/features/oh-template-builder/hooks/useBuilderAction";
import { getTemplateAdapter } from "@/features/oh-template-builder/lib/templateAdapters";
import { templateQueryKeys } from "@/features/oh-template-builder/lib/templateKinds";
import {
  moveAttachment,
  type MoveDirection,
} from "@/features/oh-template-builder/lib/templateOrder";
import type {
  BuilderAttachment,
  BuilderItem,
  BuilderSection,
  BuilderSelection,
  BuilderTemplate,
  ItemInput,
  NewSectionInput,
  SectionInput,
  TemplateKind,
} from "@/features/oh-template-builder/template-builder.types";

type TemplateBuilderValue = {
  kind: TemplateKind;
  templateUuid: string;
  template: BuilderTemplate | undefined;
  attachments: BuilderAttachment[];
  library: BuilderSection[];
  isLoading: boolean;
  loadError: unknown;
  selection: BuilderSelection;
  select: (selection: BuilderSelection) => void;
  isBusy: boolean;
  isPending: (key: string) => boolean;
  renameTemplate: (name: string) => Promise<boolean>;
  archiveTemplate: () => Promise<boolean>;
  attachSection: (sectionUuid: string) => Promise<BuilderAttachment | null>;
  createSection: (input: NewSectionInput) => Promise<BuilderAttachment | null>;
  detachSection: (attachment: BuilderAttachment) => Promise<boolean>;
  moveSection: (attachmentUuid: string, direction: MoveDirection) => Promise<void>;
  updateSection: (sectionUuid: string, input: SectionInput) => Promise<boolean>;
  archiveSection: (attachment: BuilderAttachment) => Promise<boolean>;
  createItem: (sectionUuid: string, input: ItemInput) => Promise<BuilderItem | null>;
  updateItem: (
    sectionUuid: string,
    item: BuilderItem,
    input: ItemInput,
  ) => Promise<boolean>;
  archiveItem: (sectionUuid: string, item: BuilderItem) => Promise<boolean>;
};

const TemplateBuilderContext = createContext<TemplateBuilderValue | null>(null);

type ItemsData = { items: BuilderItem[]; total: number };

export function TemplateBuilderProvider({
  kind,
  templateUuid,
  children,
}: {
  kind: TemplateKind;
  templateUuid: string;
  children: ReactNode;
}) {
  const adapter = getTemplateAdapter(kind);
  const queryClient = useQueryClient();
  const { perform, isPending, isBusy } = useBuilderAction();
  const [selection, select] = useState<BuilderSelection>({ type: "template" });

  const detailKey = templateQueryKeys.detail(kind, templateUuid);
  const attachmentsKey = templateQueryKeys.attachments(kind, templateUuid);
  const libraryKey = templateQueryKeys.library(kind);

  const templateQuery = useQuery({
    queryKey: detailKey,
    queryFn: () => adapter.getTemplate(templateUuid),
  });
  const attachmentsQuery = useQuery({
    queryKey: attachmentsKey,
    queryFn: () => adapter.listAttachments(templateUuid),
  });
  const libraryQuery = useQuery({
    queryKey: libraryKey,
    queryFn: () => adapter.listLibrary(),
  });

  const library = useMemo(() => libraryQuery.data ?? [], [libraryQuery.data]);

  const attachments = useMemo(() => {
    const sectionsByUuid = new Map(library.map((row) => [row.uuid, row]));
    return (attachmentsQuery.data ?? []).map((row) => ({
      ...row,
      section: sectionsByUuid.get(row.sectionUuid) ?? row.section,
    }));
  }, [attachmentsQuery.data, library]);

  function refreshAttachments() {
    return queryClient.invalidateQueries({ queryKey: attachmentsKey });
  }
  function refreshLibrary() {
    return queryClient.invalidateQueries({ queryKey: libraryKey });
  }

  const value: TemplateBuilderValue = {
    kind,
    templateUuid,
    template: templateQuery.data,
    attachments,
    library,
    isLoading:
      templateQuery.isPending ||
      attachmentsQuery.isPending ||
      libraryQuery.isPending,
    loadError: templateQuery.error ?? attachmentsQuery.error ?? null,
    selection,
    select,
    isBusy,
    isPending,

    renameTemplate: async (name) => {
      const updated = await perform(
        "template:rename",
        () => adapter.renameTemplate(templateUuid, name.trim()),
        { error: "Could not rename template" },
      );
      if (!updated) {
        return false;
      }
      queryClient.setQueryData<BuilderTemplate>(detailKey, (current) =>
        current ? { ...current, name: updated.name } : updated,
      );
      void queryClient.invalidateQueries({ queryKey: templateQueryKeys.list(kind) });
      return true;
    },

    archiveTemplate: async () => {
      const done = await perform(
        "template:archive",
        async () => {
          await adapter.archiveTemplate(templateUuid);
          return true;
        },
        { success: "Template archived", error: "Could not archive template" },
      );
      if (done) {
        void queryClient.invalidateQueries({ queryKey: templateQueryKeys.list(kind) });
      }
      return Boolean(done);
    },

    attachSection: async (sectionUuid) => {
      const created = await perform(
        `section:attach:${sectionUuid}`,
        () => adapter.attachSection(templateUuid, sectionUuid, attachments.length),
        { error: "Could not add section" },
      );
      if (created) {
        await refreshAttachments();
        select({ type: "section", attachmentUuid: created.uuid });
      }
      return created;
    },

    createSection: async (input) => {
      const created = await perform(
        "section:create",
        async () => {
          const section = await adapter.createSection(input);
          return adapter.attachSection(templateUuid, section.uuid, attachments.length);
        },
        { error: "Could not create section" },
      );
      if (created) {
        await Promise.all([refreshLibrary(), refreshAttachments()]);
        select({ type: "section", attachmentUuid: created.uuid });
      }
      return created;
    },

    detachSection: async (attachment) => {
      const done = await perform(
        `section:detach:${attachment.uuid}`,
        async () => {
          await adapter.detachSection(attachment.uuid);
          return true;
        },
        {
          success: "Section removed from template",
          error: "Could not remove section",
        },
      );
      if (done) {
        queryClient.setQueryData<BuilderAttachment[]>(attachmentsKey, (current) =>
          current?.filter((row) => row.uuid !== attachment.uuid),
        );
        select({ type: "template" });
      }
      return Boolean(done);
    },

    moveSection: async (attachmentUuid, direction) => {
      const result = moveAttachment(attachments, attachmentUuid, direction);
      if (!result) {
        return;
      }
      const previous = queryClient.getQueryData<BuilderAttachment[]>(attachmentsKey);
      queryClient.setQueryData(attachmentsKey, result.attachments);
      const done = await perform(
        `section:move:${attachmentUuid}`,
        () =>
          Promise.all(
            result.changes.map((change) =>
              adapter.moveAttachment(change.uuid, change.sortOrder),
            ),
          ),
        { error: "Could not reorder sections" },
      );
      if (!done) {
        queryClient.setQueryData(attachmentsKey, previous);
        void refreshAttachments();
      }
    },

    updateSection: async (sectionUuid, input) => {
      const updated = await perform(
        `section:update:${sectionUuid}`,
        () => adapter.updateSection(sectionUuid, input),
        { success: "Section saved", error: "Could not save section" },
      );
      if (!updated) {
        return false;
      }
      queryClient.setQueryData<BuilderSection[]>(libraryKey, (current) =>
        current?.map((row) => (row.uuid === updated.uuid ? updated : row)),
      );
      return true;
    },

    archiveSection: async (attachment) => {
      const done = await perform(
        `section:archive:${attachment.sectionUuid}`,
        async () => {
          await adapter.detachSection(attachment.uuid);
          await adapter.archiveSection(attachment.sectionUuid);
          return true;
        },
        {
          success: "Section archived from the library",
          error: "Could not archive section",
        },
      );
      if (done) {
        await Promise.all([refreshLibrary(), refreshAttachments()]);
        select({ type: "template" });
      }
      return Boolean(done);
    },

    createItem: async (sectionUuid, input) => {
      const created = await perform(
        `item:create:${sectionUuid}`,
        () => adapter.createItem(sectionUuid, input),
        { error: "Could not add item" },
      );
      if (created) {
        queryClient.setQueryData<ItemsData>(
          templateQueryKeys.items(kind, sectionUuid),
          (current) =>
            current
              ? { items: [...current.items, created], total: current.total + 1 }
              : { items: [created], total: 1 },
        );
        void refreshAttachments();
      }
      return created;
    },

    updateItem: async (sectionUuid, item, input) => {
      const updated = await perform(
        `item:update:${item.uuid}`,
        () => adapter.updateItem(item, input),
        { success: "Item saved", error: "Could not save item" },
      );
      if (!updated) {
        return false;
      }
      queryClient.setQueryData<ItemsData>(
        templateQueryKeys.items(kind, sectionUuid),
        (current) =>
          current && {
            ...current,
            items: current.items.map((row) =>
              row.uuid === updated.uuid ? updated : row,
            ),
          },
      );
      return true;
    },

    archiveItem: async (sectionUuid, item) => {
      const done = await perform(
        `item:archive:${item.uuid}`,
        async () => {
          await adapter.archiveItem(item.uuid);
          return true;
        },
        { success: "Item archived", error: "Could not archive item" },
      );
      if (done) {
        queryClient.setQueryData<ItemsData>(
          templateQueryKeys.items(kind, sectionUuid),
          (current) =>
            current && {
              items: current.items.filter((row) => row.uuid !== item.uuid),
              total: Math.max(0, current.total - 1),
            },
        );
        void refreshAttachments();
      }
      return Boolean(done);
    },
  };

  return (
    <TemplateBuilderContext.Provider value={value}>
      {children}
    </TemplateBuilderContext.Provider>
  );
}

export function useTemplateBuilder() {
  const value = useContext(TemplateBuilderContext);
  if (!value) {
    throw new Error("useTemplateBuilder must be used inside TemplateBuilderProvider");
  }
  return value;
}

export function useSectionItems(sectionUuid: string | null | undefined) {
  const { kind } = useTemplateBuilder();
  const adapter = getTemplateAdapter(kind);
  return useQuery({
    queryKey: templateQueryKeys.items(kind, sectionUuid ?? ""),
    queryFn: () => adapter.listItems(sectionUuid as string),
    enabled: Boolean(sectionUuid),
  });
}

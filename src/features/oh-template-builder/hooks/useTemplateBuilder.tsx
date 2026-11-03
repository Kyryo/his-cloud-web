"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useBuilderAction } from "@/features/oh-template-builder/hooks/useBuilderAction";
import { getTemplateAdapter } from "@/features/oh-template-builder/lib/templateAdapters";
import { templateQueryKeys } from "@/features/oh-template-builder/lib/templateKinds";
import {
  publishOhCofTemplate,
  publishOhExamTemplate,
} from "@/features/occupational-health/services/oh.service";
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
  reorderItems: (sectionUuid: string, orderedUuids: string[]) => Promise<boolean>;
  publishTemplate: () => Promise<boolean>;
  /** Register a flush callback (e.g. dirty inspector save). Returns unsubscribe. */
  registerPendingSave: (flush: () => Promise<boolean>) => () => void;
  /** Await all registered dirty saves before leaving Build (e.g. Preview). */
  flushPendingSaves: () => Promise<boolean>;
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
  const pendingSavesRef = useRef(new Set<() => Promise<boolean>>());

  const registerPendingSave = useCallback((flush: () => Promise<boolean>) => {
    pendingSavesRef.current.add(flush);
    return () => {
      pendingSavesRef.current.delete(flush);
    };
  }, []);

  const flushPendingSaves = useCallback(async () => {
    const results = await Promise.all(
      [...pendingSavesRef.current].map(async (flush) => flush()),
    );
    return results.every(Boolean);
  }, []);

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

    registerPendingSave,
    flushPendingSaves,

    updateSection: async (sectionUuid, input) => {
      const updated = await perform(
        `section:update:${sectionUuid}`,
        () => adapter.updateSection(sectionUuid, input),
        { error: "Could not save section" },
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
        { error: "Could not save item" },
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

    reorderItems: async (sectionUuid, orderedUuids) => {
      const itemsKey = templateQueryKeys.items(kind, sectionUuid);
      const previous = queryClient.getQueryData<ItemsData>(itemsKey);
      if (previous) {
        const byUuid = new Map(previous.items.map((row) => [row.uuid, row]));
        const nextItems = orderedUuids
          .map((uuid) => byUuid.get(uuid))
          .filter((row): row is BuilderItem => Boolean(row));
        queryClient.setQueryData<ItemsData>(itemsKey, {
          ...previous,
          items: nextItems,
        });
      }
      const done = await perform(
        `item:reorder:${sectionUuid}`,
        async () => {
          await adapter.reorderItems(sectionUuid, orderedUuids);
          return true;
        },
        { error: "Could not reorder items" },
      );
      if (!done) {
        queryClient.setQueryData(itemsKey, previous);
        void queryClient.invalidateQueries({ queryKey: itemsKey });
      }
      return Boolean(done);
    },

    publishTemplate: async () => {
      const published = await perform(
        "template:publish",
        async () => {
          const version =
            kind === "certificate"
              ? await publishOhCofTemplate(templateUuid)
              : await publishOhExamTemplate(templateUuid);
          return version;
        },
        {
          success: "Template published",
          error: "Could not publish template",
        },
      );
      if (!published) {
        return false;
      }
      await queryClient.invalidateQueries({ queryKey: detailKey });
      void queryClient.invalidateQueries({ queryKey: templateQueryKeys.list(kind) });
      return true;
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

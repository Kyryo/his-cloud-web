"use client";

import { Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ListPagePagination } from "@/features/app-shell/components/page-layout";
import {
  OhCatalogItemDialog,
  type OhCatalogItemDialogValues,
} from "@/features/settings/components/modules/occupational-health/OhCatalogItemDialog";
import { OhCatalogRow } from "@/features/settings/components/modules/occupational-health/OhCatalogListPanel";
import {
  archiveOhCatalogItem,
  archiveOhCatalogSection,
  createOhCatalogItem,
  createOhCatalogSection,
  fetchOhCatalogItemsPage,
  formatCatalogScheduleSummary,
  getCatalogItemMandatory,
  getCatalogPossibleResponses,
  getCatalogSchedule,
  getSectionSelectionMode,
  ohCatalogItemLabel,
  ohCatalogSectionIsSystem,
  updateOhCatalogItem,
  updateOhCatalogSection,
} from "@/features/occupational-health/services/oh.service";
import type {
  OhCatalogItem,
  OhCatalogSection,
  OhCatalogSelectionMode,
} from "@/features/occupational-health/types";
import { BffError } from "@/lib/bff-client";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const PAGE_SIZE = 8;

type SectionDialogTab = "general" | "items" | "selection";

export type OhCatalogSectionDialogValues = {
  name: string;
  code: string;
  isMandatory: boolean;
  selectionMode: OhCatalogSelectionMode;
};

type OhCatalogSectionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initialSection?: OhCatalogSection | null;
  onSaved: (section: OhCatalogSection) => void;
  onArchived?: (sectionUuid: string) => void;
};

export function OhCatalogSectionDialog({
  open,
  onOpenChange,
  mode,
  initialSection = null,
  onSaved,
  onArchived,
}: OhCatalogSectionDialogProps) {
  const { toast } = useToast();
  const [tab, setTab] = useState<SectionDialogTab>("general");
  const [section, setSection] = useState<OhCatalogSection | null>(
    initialSection,
  );
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isMandatory, setIsMandatory] = useState(false);
  const [selectionMode, setSelectionMode] =
    useState<OhCatalogSelectionMode>("inclusive");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<OhCatalogItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsReload, setItemsReload] = useState(0);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OhCatalogItem | null>(null);
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);
  const [archivingItemUuid, setArchivingItemUuid] = useState<string | null>(
    null,
  );

  const isSystem = section ? ohCatalogSectionIsSystem(section) : false;
  const hasPersistedSection = Boolean(section?.uuid);
  const tabs = useMemo(
    () =>
      [
        { id: "general", label: "General" },
        { id: "items", label: "Items", disabled: !hasPersistedSection },
        { id: "selection", label: "Selection rule" },
      ] as Array<{ id: SectionDialogTab; label: string; disabled?: boolean }>,
    [hasPersistedSection],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    setTab("general");
    setSection(initialSection);
    setName(initialSection?.name ?? "");
    setCode(initialSection?.code ?? "");
    setIsMandatory(Boolean(initialSection?.is_mandatory));
    setSelectionMode(getSectionSelectionMode(initialSection));
    setSearchInput("");
    setSearch("");
    setPage(1);
    setItems([]);
    setEditingItem(null);
    setItemDialogOpen(false);
  }, [initialSection, open]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    if (!open || !section?.uuid || tab !== "items") {
      return;
    }
    let active = true;
    async function loadItems() {
      setItemsLoading(true);
      try {
        const response = await fetchOhCatalogItemsPage({
          page,
          pageSize: PAGE_SIZE,
          sectionUuid: section!.uuid,
          search: search || undefined,
        });
        if (!active) {
          return;
        }
        setItems(response.results);
        setTotalCount(response.pagination?.count ?? response.results.length);
        setHasNext(Boolean(response.pagination?.next));
        setHasPrevious(Boolean(response.pagination?.previous));
      } catch (loadError) {
        if (active) {
          setItems([]);
          toast({
            variant: "error",
            title: "Could not load items",
            description:
              loadError instanceof Error ? loadError.message : undefined,
          });
        }
      } finally {
        if (active) {
          setItemsLoading(false);
        }
      }
    }
    void loadItems();
    return () => {
      active = false;
    };
  }, [open, page, search, section, tab, itemsReload, toast]);

  async function handleSaveGeneralAndSelection() {
    if (!name.trim()) {
      setTab("general");
      return;
    }
    if (!hasPersistedSection && !code.trim()) {
      setTab("general");
      return;
    }
    setIsSubmitting(true);
    try {
      if (section?.uuid) {
        const updated = await updateOhCatalogSection(section.uuid, {
          name: name.trim(),
          is_mandatory: isMandatory,
          selection_mode: selectionMode,
        });
        setSection(updated);
        onSaved(updated);
        toast({ variant: "success", title: "Section saved" });
      } else {
        const created = await createOhCatalogSection({
          code: code.trim().toLowerCase().replace(/\s+/g, "_"),
          name: name.trim(),
          is_mandatory: isMandatory,
          selection_mode: selectionMode,
        });
        setSection(created);
        onSaved(created);
        toast({ variant: "success", title: "Section created" });
        setTab("items");
      }
    } catch (submitError) {
      toast({
        variant: "error",
        title: section?.uuid ? "Could not save section" : "Could not add section",
        description:
          submitError instanceof BffError
            ? submitError.message
            : submitError instanceof Error
              ? submitError.message
              : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleArchiveSection() {
    if (!section?.uuid || isSystem) {
      return;
    }
    setIsArchiving(true);
    try {
      await archiveOhCatalogSection(section.uuid);
      toast({
        variant: "success",
        title: "Section archived",
        description: `${section.name} was removed from the shared library.`,
      });
      onArchived?.(section.uuid);
      onOpenChange(false);
    } catch (archiveError) {
      toast({
        variant: "error",
        title: "Could not archive section",
        description:
          archiveError instanceof Error
            ? archiveError.message
            : "Something went wrong.",
      });
    } finally {
      setIsArchiving(false);
    }
  }

  async function handleItemSubmit(values: OhCatalogItemDialogValues) {
    if (!section?.uuid) {
      return;
    }
    const cleanedResponses = values.responses
      .map((row) => ({
        code: row.code.trim().toUpperCase().replace(/\s+/g, "_"),
        label: row.label.trim() || row.code.trim(),
      }))
      .filter((row) => row.code);
    const cleanedSchedule = values.schedule
      .map((row) => ({
        interval: Math.max(1, Math.floor(Number(row.interval) || 1)),
        unit: row.unit || "month",
        notes: (row.notes ?? "").trim(),
      }))
      .filter((row) => row.interval >= 1);
    setIsSubmittingItem(true);
    try {
      const names_i18n = values.name ? { en: values.name } : {};
      const attributes_json = {
        ...(editingItem?.attributes_json ?? {}),
        possible_responses: cleanedResponses,
        is_mandatory: values.isMandatory,
        schedule: cleanedSchedule,
      };
      delete (attributes_json as { selection_mode?: unknown }).selection_mode;
      const normalizedCode = values.code.toUpperCase().replace(/\s+/g, "_");
      if (editingItem) {
        await updateOhCatalogItem(editingItem.uuid, {
          code: normalizedCode,
          names_i18n,
          attributes_json,
        });
        toast({ variant: "success", title: "Item updated" });
      } else {
        await createOhCatalogItem({
          section: section.uuid,
          code: normalizedCode,
          names_i18n,
          attributes_json,
          active: true,
        });
        toast({ variant: "success", title: "Item added" });
      }
      setItemDialogOpen(false);
      setEditingItem(null);
      setItemsReload((current) => current + 1);
    } catch (submitError) {
      toast({
        variant: "error",
        title: editingItem ? "Could not update item" : "Could not add item",
        description:
          submitError instanceof BffError
            ? submitError.message
            : submitError instanceof Error
              ? submitError.message
              : undefined,
      });
    } finally {
      setIsSubmittingItem(false);
    }
  }

  async function handleArchiveItem(row: OhCatalogItem) {
    setArchivingItemUuid(row.uuid);
    try {
      await archiveOhCatalogItem(row.uuid);
      toast({
        variant: "success",
        title: "Item archived",
        description: `${ohCatalogItemLabel(row)} was removed.`,
      });
      setItemsReload((current) => current + 1);
    } catch (archiveError) {
      toast({
        variant: "error",
        title: "Could not archive item",
        description:
          archiveError instanceof Error
            ? archiveError.message
            : "Something went wrong.",
      });
    } finally {
      setArchivingItemUuid(null);
    }
  }

  const itemDialogInitialValues = editingItem
    ? {
        name:
          ohCatalogItemLabel(editingItem) === editingItem.code
            ? ""
            : ohCatalogItemLabel(editingItem),
        code: editingItem.code,
        isMandatory: getCatalogItemMandatory(editingItem),
        schedule: getCatalogSchedule(editingItem),
        responses: getCatalogPossibleResponses(editingItem),
      }
    : null;

  const title =
    mode === "edit" || section?.uuid
      ? section?.name || name || "Edit section"
      : "Add section";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="shrink-0 space-y-1 border-b border-dash-border/70 px-6 py-5 pr-14 text-left">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Configure the section, its items, and how staff select values on
              exams.
            </DialogDescription>
          </DialogHeader>

          <nav
            aria-label="Section settings"
            className="flex shrink-0 gap-5 overflow-x-auto border-b border-dash-border/70 px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {tabs.map((entry) => {
              const isActive = tab === entry.id;
              const badge =
                entry.id === "items" && hasPersistedSection ? totalCount : 0;
              return (
                <button
                  key={entry.id}
                  type="button"
                  disabled={entry.disabled}
                  onClick={() => {
                    if (!entry.disabled) {
                      setTab(entry.id);
                    }
                  }}
                  className={cn(
                    "relative -mb-px shrink-0 pb-2.5 pt-3 text-sm transition-colors",
                    entry.disabled
                      ? "cursor-not-allowed text-slate-300"
                      : isActive
                        ? "font-medium text-brand-navy"
                        : "text-dash-muted hover:text-brand-navy",
                  )}
                >
                  {entry.label}
                  {badge > 0 ? (
                    <span className="ml-1.5 text-xs text-slate-400">
                      ({badge})
                    </span>
                  ) : null}
                  {isActive && !entry.disabled ? (
                    <span className="absolute inset-x-0 bottom-0 h-px bg-brand-navy" />
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {tab === "general" ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="oh-section-name">Display name</Label>
                  <Input
                    id="oh-section-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoFocus
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oh-section-code">Code</Label>
                  <Input
                    id="oh-section-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    disabled={hasPersistedSection || isSystem}
                    required={!hasPersistedSection}
                  />
                  <p className="text-xs text-slate-400">
                    Stable identifier. Locked after the section is created.
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-dash-border/80 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-brand-navy">
                      Mandatory section
                    </p>
                    <p className="mt-0.5 text-[13px] text-slate-400">
                      Required before exam submit when this section is used.
                    </p>
                  </div>
                  <Switch
                    checked={isMandatory}
                    onCheckedChange={setIsMandatory}
                    aria-label="Mandatory section"
                  />
                </div>
                {isSystem ? (
                  <p className="rounded-xl bg-slate-50 px-4 py-3 text-[13px] text-slate-500">
                    System section — kept for programme compatibility. Name and
                    rules can change; code cannot.
                  </p>
                ) : null}
              </div>
            ) : null}

            {tab === "selection" ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-brand-navy">
                    Selection rule
                  </h3>
                  <p className="mt-0.5 text-[13px] text-slate-400">
                    Applies to all items in this section on exams.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      {
                        id: "exclusive" as const,
                        title: "Mutually exclusive",
                        description: "Staff may pick only one item.",
                      },
                      {
                        id: "inclusive" as const,
                        title: "Inclusive",
                        description: "Staff may pick one or more items.",
                      },
                    ] as const
                  ).map((option) => {
                    const selected = selectionMode === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectionMode(option.id)}
                        className={cn(
                          "rounded-xl border px-4 py-4 text-left transition-colors",
                          selected
                            ? "border-brand-navy bg-brand-tint/40 shadow-sm"
                            : "border-dash-border hover:border-brand-navy/40",
                        )}
                      >
                        <p className="text-sm font-medium text-brand-navy">
                          {option.title}
                        </p>
                        <p className="mt-1 text-[13px] leading-5 text-slate-400">
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {tab === "items" ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-brand-navy">
                      Section items
                    </h3>
                    <p className="mt-0.5 text-[13px] text-slate-400">
                      Values staff can record under this section.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-1"
                    onClick={() => {
                      setEditingItem(null);
                      setItemDialogOpen(true);
                    }}
                  >
                    <Plus className="size-3.5" aria-hidden />
                    Add item
                  </Button>
                </div>

                <div className="relative max-w-sm">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                    aria-hidden
                  />
                  <Input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search items…"
                    className="pl-9"
                  />
                </div>

                {itemsLoading ? (
                  <p className="py-8 text-center text-sm text-slate-400">
                    Loading items…
                  </p>
                ) : items.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-dash-border/80 px-4 py-10 text-center">
                    <p className="text-sm font-medium text-brand-navy">
                      {search
                        ? `No matches for “${search}”`
                        : "No items yet"}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {search
                        ? "Try a different search."
                        : "Add the first item for this section."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <ul className="divide-y divide-brand-border">
                      {items.map((row) => {
                        const responseCount =
                          getCatalogPossibleResponses(row).length;
                        const schedule = getCatalogSchedule(row);
                        const mandatory = getCatalogItemMandatory(row);
                        return (
                          <OhCatalogRow
                            key={row.uuid}
                            title={ohCatalogItemLabel(row)}
                            meta={
                              [
                                row.code,
                                mandatory ? "Mandatory" : "Optional",
                                formatCatalogScheduleSummary(schedule[0]),
                                responseCount > 0
                                  ? `${responseCount} response${responseCount === 1 ? "" : "s"}`
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(" · ")
                            }
                            isActive={row.active !== false}
                            archiving={archivingItemUuid === row.uuid}
                            onEdit={() => {
                              setEditingItem(row);
                              setItemDialogOpen(true);
                            }}
                            onArchive={() => void handleArchiveItem(row)}
                          />
                        );
                      })}
                    </ul>
                    {totalCount > PAGE_SIZE ? (
                      <ListPagePagination
                        page={page}
                        pageSize={PAGE_SIZE}
                        totalCount={totalCount}
                        hasNext={hasNext}
                        hasPrevious={hasPrevious}
                        isLoading={itemsLoading}
                        onPageChange={setPage}
                      />
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-dash-border/60 bg-white px-6 py-4">
            <div>
              {hasPersistedSection && !isSystem ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-brand-muted hover:text-red-600"
                  disabled={isArchiving || isSubmitting}
                  onClick={() => void handleArchiveSection()}
                >
                  <Trash2 className="size-3.5" aria-hidden />
                  Archive
                </Button>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <SecondaryButton
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Close
              </SecondaryButton>
              {tab !== "items" ? (
                <PrimaryButton
                  type="button"
                  disabled={
                    isSubmitting ||
                    !name.trim() ||
                    (!hasPersistedSection && !code.trim())
                  }
                  onClick={() => void handleSaveGeneralAndSelection()}
                >
                  {isSubmitting
                    ? "Saving…"
                    : hasPersistedSection
                      ? "Save"
                      : "Create section"}
                </PrimaryButton>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <OhCatalogItemDialog
        open={itemDialogOpen}
        onOpenChange={(next) => {
          setItemDialogOpen(next);
          if (!next) {
            setEditingItem(null);
          }
        }}
        mode={editingItem ? "edit" : "add"}
        sectionName={section?.name || name}
        singularLabel="item"
        initialValues={itemDialogInitialValues}
        isSubmitting={isSubmittingItem}
        onSubmit={handleItemSubmit}
      />
    </>
  );
}

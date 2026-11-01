"use client";

import { ChevronDown, ChevronRight, Link2, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OhCatalogListPanel,
} from "@/features/settings/components/modules/occupational-health/OhCatalogListPanel";
import { OhExamSectionDialog } from "@/features/settings/components/modules/occupational-health/OhExamSectionDialog";
import {
  archiveOhExamTemplate,
  attachOhExamTemplateSection,
  createOhExamTemplate,
  detachOhExamTemplateSection,
  fetchOhExamSections,
  fetchOhExamTemplateSections,
  fetchOhExamTemplates,
  getSectionSelectionMode,
  updateOhExamTemplate,
} from "@/features/occupational-health/services/oh.service";
import type {
  OhExamSection,
  OhExamTemplate,
  OhExamTemplateSection,
} from "@/features/occupational-health/types";
import { BffError } from "@/lib/bff-client";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type OhExamTemplatesSettingsTabProps = {
  isActive: boolean;
};

export function OhExamTemplatesSettingsTab({ isActive }: OhExamTemplatesSettingsTabProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<OhExamTemplate[]>([]);
  const [librarySections, setLibrarySections] = useState<OhExamSection[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [expandedUuid, setExpandedUuid] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createCode, setCreateCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    let active = true;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [nextTemplates, nextSections] = await Promise.all([
          fetchOhExamTemplates(),
          fetchOhExamSections(),
        ]);
        if (!active) {
          return;
        }
        setTemplates(nextTemplates);
        setLibrarySections(nextSections);
      } catch (loadError) {
        if (active) {
          setTemplates([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load Exam templates.",
          );
          toast({
            variant: "error",
            title: "Could not load Exam templates",
            description:
              loadError instanceof Error ? loadError.message : undefined,
          });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [isActive, reloadToken, toast]);

  if (!isActive) {
    return null;
  }

  function openCreate() {
    setCreateName("");
    setCreateCode("");
    setCreateOpen(true);
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!createName.trim() || !createCode.trim()) {
      return;
    }
    setIsCreating(true);
    try {
      const created = await createOhExamTemplate({
        name: createName.trim(),
        code: createCode.trim().toUpperCase().replace(/\s+/g, "_"),
      });
      setTemplates((current) => [...current, created]);
      setCreateOpen(false);
      setExpandedUuid(created.uuid);
      toast({ variant: "success", title: "Template created" });
    } catch (submitError) {
      toast({
        variant: "error",
        title: "Could not create template",
        description:
          submitError instanceof BffError
            ? submitError.message
            : submitError instanceof Error
              ? submitError.message
              : undefined,
      });
    } finally {
      setIsCreating(false);
    }
  }

  function handleTemplateUpdated(template: OhExamTemplate) {
    setTemplates((current) =>
      current.map((row) => (row.uuid === template.uuid ? template : row)),
    );
  }

  function handleTemplateArchived(uuid: string) {
    setTemplates((current) => current.filter((row) => row.uuid !== uuid));
    if (expandedUuid === uuid) {
      setExpandedUuid(null);
    }
  }

  function handleLibrarySectionSaved(section: OhExamSection) {
    setLibrarySections((current) => {
      const exists = current.some((row) => row.uuid === section.uuid);
      if (exists) {
        return current.map((row) =>
          row.uuid === section.uuid ? section : row,
        );
      }
      return [...current, section];
    });
  }

  return (
    <>
      <OhCatalogListPanel
        title="Exam templates"
        description="Define Exam form layouts for your organization. Sections and items are reusable across templates."
        addLabel="Add template"
        onAdd={openCreate}
        isLoading={isLoading}
        error={error}
        emptyTitle="No Exam templates yet"
        emptyDescription="Create a template, then attach reusable sections and configure their items."
        isEmpty={templates.length === 0}
      >
        <ul className="divide-y divide-brand-border">
          {templates.map((template) => {
            const isExpanded = expandedUuid === template.uuid;
            return (
              <li key={template.uuid}>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedUuid((current) =>
                      current === template.uuid ? null : template.uuid,
                    )
                  }
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left transition-colors",
                    isExpanded
                      ? "bg-slate-50"
                      : "hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30",
                  )}
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? (
                    <ChevronDown
                      className="size-4 shrink-0 text-brand-navy"
                      aria-hidden
                    />
                  ) : (
                    <ChevronRight
                      className="size-4 shrink-0 text-slate-300 transition-colors group-hover:text-brand-navy"
                      aria-hidden
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-brand-navy">
                      {template.name}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-slate-400">
                      {[
                        template.code,
                        typeof template.section_count === "number"
                          ? `${template.section_count} section${template.section_count === 1 ? "" : "s"}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {template.active !== false ? "Active" : "Archived"}
                  </span>
                </button>

                {isExpanded ? (
                  <div className="mb-3 ml-7 rounded-xl border border-dash-border/80 bg-white p-4 shadow-sm sm:p-5">
                    <OhExamTemplateExpandedPanel
                      template={template}
                      librarySections={librarySections}
                      onTemplateUpdated={handleTemplateUpdated}
                      onTemplateArchived={handleTemplateArchived}
                      onLibrarySectionSaved={handleLibrarySectionSaved}
                      onLibraryReload={() =>
                        setReloadToken((current) => current + 1)
                      }
                    />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </OhCatalogListPanel>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add exam template</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => void handleCreate(event)}>
            <div className="space-y-2">
              <Label htmlFor="oh-exam-create-name">Template name</Label>
              <Input
                id="oh-exam-create-name"
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
                autoFocus
                required
                placeholder="e.g. Pre-employment exam"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oh-exam-create-code">Template code</Label>
              <Input
                id="oh-exam-create-code"
                value={createCode}
                onChange={(event) => setCreateCode(event.target.value)}
                required
                placeholder="e.g. PRE_EMP"
              />
              <p className="text-xs text-slate-400">
                Stable identifier. Locked after create.
              </p>
            </div>
            <DialogFooter>
              <SecondaryButton
                type="button"
                onClick={() => setCreateOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                disabled={
                  isCreating || !createName.trim() || !createCode.trim()
                }
              >
                {isCreating ? "Creating…" : "Create template"}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

type ExpandedPanelProps = {
  template: OhExamTemplate;
  librarySections: OhExamSection[];
  onTemplateUpdated: (template: OhExamTemplate) => void;
  onTemplateArchived: (uuid: string) => void;
  onLibrarySectionSaved: (section: OhExamSection) => void;
  onLibraryReload: () => void;
};

function OhExamTemplateExpandedPanel({
  template,
  librarySections,
  onTemplateUpdated,
  onTemplateArchived,
  onLibrarySectionSaved,
  onLibraryReload,
}: ExpandedPanelProps) {
  const { toast } = useToast();
  const [name, setName] = useState(template.name);
  const [isSaving, setIsSaving] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [attachments, setAttachments] = useState<OhExamTemplateSection[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [attachmentsReload, setAttachmentsReload] = useState(0);
  const [expandedSectionUuid, setExpandedSectionUuid] = useState<string | null>(
    null,
  );
  const [attachSectionUuid, setAttachSectionUuid] = useState<string>("");
  const [isAttaching, setIsAttaching] = useState(false);
  const [detachingUuid, setDetachingUuid] = useState<string | null>(null);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingExamSection, setEditingExamSection] =
    useState<OhExamSection | null>(null);
  const [sectionDialogMode, setSectionDialogMode] = useState<"add" | "edit">(
    "add",
  );

  useEffect(() => {
    setName(template.name);
  }, [template.name, template.uuid]);

  useEffect(() => {
    let active = true;
    async function loadAttachments() {
      setAttachmentsLoading(true);
      try {
        const next = await fetchOhExamTemplateSections(template.uuid);
        if (active) {
          setAttachments(next);
          onTemplateUpdated({
            ...template,
            section_count: next.length,
          });
        }
      } catch (loadError) {
        if (active) {
          setAttachments([]);
          toast({
            variant: "error",
            title: "Could not load template sections",
            description:
              loadError instanceof Error ? loadError.message : undefined,
          });
        }
      } finally {
        if (active) {
          setAttachmentsLoading(false);
        }
      }
    }
    void loadAttachments();
    return () => {
      active = false;
    };
    // Intentionally omit onTemplateUpdated / template object identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.uuid, attachmentsReload, toast]);

  const attachedSectionIds = useMemo(
    () => new Set(attachments.map((row) => row.exam_section)),
    [attachments],
  );

  const availableLibrarySections = useMemo(
    () =>
      librarySections.filter(
        (section) =>
          section.active !== false && !attachedSectionIds.has(section.uuid),
      ),
    [attachedSectionIds, librarySections],
  );

  async function handleSaveGeneral() {
    if (!name.trim()) {
      return;
    }
    setIsSaving(true);
    try {
      const updated = await updateOhExamTemplate(template.uuid, {
        name: name.trim(),
      });
      onTemplateUpdated({
        ...updated,
        section_count: attachments.length,
      });
      toast({ variant: "success", title: "Template saved" });
    } catch (submitError) {
      toast({
        variant: "error",
        title: "Could not save template",
        description:
          submitError instanceof BffError
            ? submitError.message
            : submitError instanceof Error
              ? submitError.message
              : undefined,
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleArchive() {
    setIsArchiving(true);
    try {
      await archiveOhExamTemplate(template.uuid);
      toast({
        variant: "success",
        title: "Template archived",
        description: `${template.name} was removed.`,
      });
      onTemplateArchived(template.uuid);
    } catch (archiveError) {
      toast({
        variant: "error",
        title: "Could not archive template",
        description:
          archiveError instanceof Error
            ? archiveError.message
            : "Something went wrong.",
      });
    } finally {
      setIsArchiving(false);
    }
  }

  async function handleAttachExisting() {
    if (!attachSectionUuid) {
      return;
    }
    setIsAttaching(true);
    try {
      const created = await attachOhExamTemplateSection({
        template: template.uuid,
        exam_section: attachSectionUuid,
        sort_order: attachments.length,
      });
      setAttachments((current) => [...current, created]);
      setAttachSectionUuid("");
      onTemplateUpdated({
        ...template,
        section_count: attachments.length + 1,
      });
      toast({
        variant: "success",
        title: "Section attached",
        description: "Reusable section linked to this template.",
      });
    } catch (attachError) {
      toast({
        variant: "error",
        title: "Could not attach section",
        description:
          attachError instanceof BffError
            ? attachError.message
            : attachError instanceof Error
              ? attachError.message
              : undefined,
      });
    } finally {
      setIsAttaching(false);
    }
  }

  async function handleDetach(attachment: OhExamTemplateSection) {
    setDetachingUuid(attachment.uuid);
    try {
      await detachOhExamTemplateSection(attachment.uuid);
      setAttachments((current) =>
        current.filter((row) => row.uuid !== attachment.uuid),
      );
      if (expandedSectionUuid === attachment.uuid) {
        setExpandedSectionUuid(null);
      }
      onTemplateUpdated({
        ...template,
        section_count: Math.max(0, attachments.length - 1),
      });
      toast({
        variant: "success",
        title: "Section detached",
        description: "Section remains in the shared library for other templates.",
      });
    } catch (detachError) {
      toast({
        variant: "error",
        title: "Could not detach section",
        description:
          detachError instanceof Error
            ? detachError.message
            : "Something went wrong.",
      });
    } finally {
      setDetachingUuid(null);
    }
  }

  function openCreateSection() {
    setSectionDialogMode("add");
    setEditingExamSection(null);
    setSectionDialogOpen(true);
  }

  function openEditSection(section: OhExamSection) {
    setSectionDialogMode("edit");
    setEditingExamSection(section);
    setSectionDialogOpen(true);
  }

  async function handleSectionSaved(section: OhExamSection) {
    onLibrarySectionSaved(section);
    if (sectionDialogMode === "add") {
      try {
        const already = attachments.some(
          (row) => row.exam_section === section.uuid,
        );
        if (!already) {
          const created = await attachOhExamTemplateSection({
            template: template.uuid,
            exam_section: section.uuid,
            sort_order: attachments.length,
          });
          setAttachments((current) => [...current, created]);
          onTemplateUpdated({
            ...template,
            section_count: attachments.length + 1,
          });
        }
      } catch {
        setAttachmentsReload((current) => current + 1);
      }
    } else {
      setAttachments((current) =>
        current.map((row) =>
          row.exam_section === section.uuid
            ? {
                ...row,
                exam_section_detail: section,
              }
            : row,
        ),
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-brand-navy">General</h4>
          <p className="mt-0.5 text-[13px] text-slate-400">
            Template identity for this organization.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`oh-cof-name-${template.uuid}`}>Name</Label>
            <Input
              id={`oh-cof-name-${template.uuid}`}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`oh-cof-code-${template.uuid}`}>Code</Label>
            <Input
              id={`oh-cof-code-${template.uuid}`}
              value={template.code}
              disabled
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-1 text-brand-muted hover:text-red-600"
            disabled={isArchiving || isSaving}
            onClick={() => void handleArchive()}
          >
            <Trash2 className="size-3.5" aria-hidden />
            Archive template
          </Button>
          <PrimaryButton
            type="button"
            disabled={isSaving || !name.trim() || name.trim() === template.name}
            onClick={() => void handleSaveGeneral()}
          >
            {isSaving ? "Saving…" : "Save"}
          </PrimaryButton>
        </div>
      </div>

      <div className="space-y-4 border-t border-dash-border/70 pt-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-brand-navy">Sections</h4>
            <p className="mt-0.5 text-[13px] text-slate-400">
              Attach shared sections. Editing items updates every template that
              uses the section.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={openCreateSection}
          >
            <Plus className="size-3.5" aria-hidden />
            New section
          </Button>
        </div>

        {availableLibrarySections.length > 0 ? (
          <div className="flex flex-col gap-2 rounded-xl border border-dashed border-dash-border/80 bg-slate-50/50 p-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Link2 className="size-4 shrink-0 text-slate-400" aria-hidden />
              <Select
                value={attachSectionUuid || undefined}
                onValueChange={setAttachSectionUuid}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Attach existing section…" />
                </SelectTrigger>
                <SelectContent>
                  {availableLibrarySections.map((section) => (
                    <SelectItem key={section.uuid} value={section.uuid}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              size="sm"
              disabled={!attachSectionUuid || isAttaching}
              onClick={() => void handleAttachExisting()}
            >
              {isAttaching ? "Attaching…" : "Attach"}
            </Button>
          </div>
        ) : null}

        {attachmentsLoading ? (
          <p className="py-6 text-center text-sm text-slate-400">
            Loading sections…
          </p>
        ) : attachments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-dash-border/80 px-4 py-8 text-center">
            <p className="text-sm font-medium text-brand-navy">
              No sections on this template
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Create a new section or attach one from the shared library.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-brand-border rounded-xl border border-dash-border/70">
            {attachments.map((attachment) => {
              const section =
                attachment.exam_section_detail ??
                librarySections.find(
                  (row) => row.uuid === attachment.exam_section,
                );
              const isOpen = expandedSectionUuid === attachment.uuid;
              const selectionMode = getSectionSelectionMode(section);
              return (
                <li key={attachment.uuid}>
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      onClick={() =>
                        setExpandedSectionUuid((current) =>
                          current === attachment.uuid ? null : attachment.uuid,
                        )
                      }
                    >
                      {isOpen ? (
                        <ChevronDown
                          className="size-3.5 shrink-0 text-brand-navy"
                          aria-hidden
                        />
                      ) : (
                        <ChevronRight
                          className="size-3.5 shrink-0 text-slate-300"
                          aria-hidden
                        />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-brand-navy">
                          {section?.name ?? "Section"}
                        </p>
                        <p className="truncate text-[13px] text-slate-400">
                          {[
                            section?.code,
                            section?.is_mandatory ? "Mandatory" : "Optional",
                            selectionMode === "exclusive"
                              ? "Exclusive"
                              : "Inclusive",
                            typeof attachment.item_count === "number"
                              ? `${attachment.item_count} item${attachment.item_count === 1 ? "" : "s"}`
                              : null,
                            "Shared",
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 shrink-0 text-brand-muted hover:text-brand-navy"
                      disabled={!section}
                      onClick={() => {
                        if (section) {
                          openEditSection(section);
                        }
                      }}
                    >
                      Configure
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 shrink-0 text-brand-muted hover:text-red-600"
                      disabled={detachingUuid === attachment.uuid}
                      onClick={() => void handleDetach(attachment)}
                    >
                      Detach
                    </Button>
                  </div>
                  {isOpen && section ? (
                    <div className="border-t border-dash-border/60 bg-slate-50/60 px-4 py-3 text-[13px] text-slate-500">
                      Open <span className="font-medium text-brand-navy">Configure</span>{" "}
                      to manage this shared section&apos;s items, mandatory flag,
                      and selection rule. Changes apply to every template using
                      it.
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <OhExamSectionDialog
        open={sectionDialogOpen}
        onOpenChange={(open) => {
          setSectionDialogOpen(open);
          if (!open) {
            setEditingExamSection(null);
            setSectionDialogMode("add");
            onLibraryReload();
            setAttachmentsReload((current) => current + 1);
          }
        }}
        mode={sectionDialogMode}
        initialSection={editingExamSection}
        onSaved={handleSectionSaved}
        onArchived={() => {
          onLibraryReload();
          setAttachmentsReload((current) => current + 1);
        }}
      />
    </div>
  );
}

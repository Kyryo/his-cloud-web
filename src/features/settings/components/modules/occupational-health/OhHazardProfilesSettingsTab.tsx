"use client";

import { useEffect, useState } from "react";

import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  OhCatalogRow,
} from "@/features/settings/components/modules/occupational-health/OhCatalogListPanel";
import {
  archiveOhHazardProfile,
  createOhHazardProfile,
  fetchOhCofTemplates,
  fetchOhExamTemplates,
  fetchOhHazardProfiles,
  updateOhHazardProfile,
} from "@/features/occupational-health/services/oh.service";
import type {
  OhCofTemplate,
  OhEmployer,
  OhExamTemplate,
  OhHazardProfile,
} from "@/features/occupational-health/types";
import { BffError } from "@/lib/bff-client";
import { useToast } from "@/providers/toast-provider";

const NONE_TEMPLATE = "__none__";

type OhHazardProfilesSettingsTabProps = {
  isActive: boolean;
  employer: OhEmployer;
  embedded?: boolean;
};

export function OhHazardProfilesSettingsTab({
  isActive,
  employer,
  embedded = false,
}: OhHazardProfilesSettingsTabProps) {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<OhHazardProfile[]>([]);
  const [cofTemplates, setCofTemplates] = useState<OhCofTemplate[]>([]);
  const [examTemplates, setExamTemplates] = useState<OhExamTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OhHazardProfile | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [cofTemplateUuid, setCofTemplateUuid] = useState(NONE_TEMPLATE);
  const [examTemplateUuid, setExamTemplateUuid] = useState(NONE_TEMPLATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [archivingUuid, setArchivingUuid] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    let active = true;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [profileRows, nextCofTemplates, nextExamTemplates] =
          await Promise.all([
            fetchOhHazardProfiles(employer.id),
            fetchOhCofTemplates(),
            fetchOhExamTemplates(),
          ]);
        if (active) {
          setProfiles(profileRows);
          setCofTemplates(nextCofTemplates);
          setExamTemplates(nextExamTemplates);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load risk profiles.",
          );
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
  }, [employer.id, isActive]);

  if (!isActive) {
    return null;
  }

  function openCreate() {
    setEditing(null);
    setName("");
    setCode("");
    setCofTemplateUuid(NONE_TEMPLATE);
    setExamTemplateUuid(NONE_TEMPLATE);
    setDialogOpen(true);
  }

  function openEdit(row: OhHazardProfile) {
    setEditing(row);
    setName(row.name);
    setCode(row.code ?? "");
    setCofTemplateUuid(row.cof_template || NONE_TEMPLATE);
    setExamTemplateUuid(row.exam_template || NONE_TEMPLATE);
    setDialogOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    const cof_template =
      cofTemplateUuid === NONE_TEMPLATE ? null : cofTemplateUuid;
    const exam_template =
      examTemplateUuid === NONE_TEMPLATE ? null : examTemplateUuid;
    setIsSubmitting(true);
    try {
      if (editing) {
        const updated = await updateOhHazardProfile(editing.uuid, {
          name: name.trim(),
          code: code.trim(),
          employer: employer.id,
          cof_template,
          exam_template,
        });
        setProfiles((current) =>
          current
            .map((row) => (row.uuid === updated.uuid ? updated : row))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
        toast({ variant: "success", title: "Risk profile updated" });
      } else {
        const created = await createOhHazardProfile({
          name: name.trim(),
          code: code.trim(),
          employer: employer.id,
          cof_template,
          exam_template,
        });
        setProfiles((current) =>
          [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
        );
        toast({ variant: "success", title: "Risk profile added" });
      }
      setDialogOpen(false);
      setEditing(null);
      setName("");
      setCode("");
      setCofTemplateUuid(NONE_TEMPLATE);
      setExamTemplateUuid(NONE_TEMPLATE);
    } catch (submitError) {
      toast({
        variant: "error",
        title: editing
          ? "Could not update risk profile"
          : "Could not add risk profile",
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

  async function handleArchive(row: OhHazardProfile) {
    setArchivingUuid(row.uuid);
    try {
      await archiveOhHazardProfile(row.uuid);
      setProfiles((current) => current.filter((item) => item.uuid !== row.uuid));
      toast({
        variant: "success",
        title: "Risk profile archived",
        description: `${row.name} was removed.`,
      });
    } catch (archiveError) {
      toast({
        variant: "error",
        title: "Could not archive risk profile",
        description:
          archiveError instanceof Error
            ? archiveError.message
            : "Something went wrong.",
      });
    } finally {
      setArchivingUuid(null);
    }
  }

  return (
    <>
      <OhCatalogListPanel
        title="Risk profiles"
        description={`Workplace risk bundles for ${employer.name}, linked to COF and exam templates.`}
        addLabel="Add risk profile"
        onAdd={openCreate}
        isLoading={isLoading}
        error={error}
        emptyTitle="No risk profiles yet"
        emptyDescription="Create a profile and link COF and exam templates."
        isEmpty={profiles.length === 0}
        embedded={embedded}
      >
        <ul className="divide-y divide-brand-border">
          {profiles.map((row) => (
            <OhCatalogRow
              key={row.uuid}
              title={row.name}
              meta={
                [
                  row.code || "No code",
                  row.cof_template_name || row.cof_template_code || null,
                  row.exam_template_name || row.exam_template_code || null,
                ]
                  .filter(Boolean)
                  .join(" · ")
              }
              isActive={row.is_active !== false}
              archiving={archivingUuid === row.uuid}
              onEdit={() => openEdit(row)}
              onArchive={() => void handleArchive(row)}
            />
          ))}
        </ul>
      </OhCatalogListPanel>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditing(null);
          }
        }}
      >
        <DialogContent className="flex max-h-[90vh] w-full max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="shrink-0 space-y-1 border-b border-dash-border/70 px-6 py-5 pr-14 text-left">
            <DialogTitle>
              {editing ? "Edit risk profile" : "Add risk profile"}
            </DialogTitle>
            <DialogDescription>
              Optional COF and exam templates for {employer.name}.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <div className="space-y-2">
                <Label htmlFor="oh-profile-name">Name</Label>
                <Input
                  id="oh-profile-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oh-profile-code">Code</Label>
                <Input
                  id="oh-profile-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oh-profile-cof">COF template</Label>
                <Select
                  value={cofTemplateUuid}
                  onValueChange={setCofTemplateUuid}
                >
                  <SelectTrigger id="oh-profile-cof">
                    <SelectValue placeholder="Select a template…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_TEMPLATE}>No template</SelectItem>
                    {cofTemplates.map((template) => (
                      <SelectItem key={template.uuid} value={template.uuid}>
                        {template.name}
                        {template.code ? ` (${template.code})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="oh-profile-exam">Exam template</Label>
                <Select
                  value={examTemplateUuid}
                  onValueChange={setExamTemplateUuid}
                >
                  <SelectTrigger id="oh-profile-exam">
                    <SelectValue placeholder="Select a template…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_TEMPLATE}>No template</SelectItem>
                    {examTemplates.map((template) => (
                      <SelectItem key={template.uuid} value={template.uuid}>
                        {template.name}
                        {template.code ? ` (${template.code})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-dash-border/60 bg-white px-6 py-4">
              <SecondaryButton
                type="button"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                disabled={isSubmitting || !name.trim()}
              >
                {isSubmitting
                  ? "Saving…"
                  : editing
                    ? "Save changes"
                    : "Save profile"}
              </PrimaryButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

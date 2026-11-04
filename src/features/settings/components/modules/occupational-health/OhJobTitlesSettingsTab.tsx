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
  archiveOhJobTitle,
  createOhJobTitle,
  fetchOhHazardProfiles,
  fetchOhJobTitles,
  updateOhJobTitle,
} from "@/features/occupational-health/services/oh.service";
import type {
  OhEmployer,
  OhHazardProfile,
  OhJobTitle,
} from "@/features/occupational-health/types";
import { BffError } from "@/lib/bff-client";
import { useToast } from "@/providers/toast-provider";

const NONE_PROFILE = "__none__";

type OhJobTitlesSettingsTabProps = {
  isActive: boolean;
  employer: OhEmployer;
  embedded?: boolean;
};

export function OhJobTitlesSettingsTab({
  isActive,
  employer,
  embedded = false,
}: OhJobTitlesSettingsTabProps) {
  const { toast } = useToast();
  const [rows, setRows] = useState<OhJobTitle[]>([]);
  const [profiles, setProfiles] = useState<OhHazardProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OhJobTitle | null>(null);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [hazardProfileId, setHazardProfileId] = useState(NONE_PROFILE);
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
        const [jobTitles, riskProfiles] = await Promise.all([
          fetchOhJobTitles(employer.id),
          fetchOhHazardProfiles(employer.id),
        ]);
        if (active) {
          setRows(jobTitles);
          setProfiles(riskProfiles);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load job titles.",
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
    setTitle("");
    setCode("");
    setHazardProfileId(NONE_PROFILE);
    setDialogOpen(true);
  }

  function openEdit(row: OhJobTitle) {
    setEditing(row);
    setTitle(row.title);
    setCode(row.code ?? "");
    setHazardProfileId(
      row.hazard_profile != null ? String(row.hazard_profile) : NONE_PROFILE,
    );
    setDialogOpen(true);
  }

  function profileMeta(row: OhJobTitle): string {
    if (row.hazard_profile_name || row.hazard_profile_code) {
      return [row.hazard_profile_code, row.hazard_profile_name]
        .filter(Boolean)
        .join(" · ");
    }
    return "No risk profile";
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      return;
    }
    const hazard_profile =
      hazardProfileId === NONE_PROFILE ? null : Number(hazardProfileId);
    setIsSubmitting(true);
    try {
      if (editing) {
        const updated = await updateOhJobTitle(editing.uuid, {
          title: title.trim(),
          code: code.trim(),
          employer: employer.id,
          hazard_profile,
        });
        setRows((current) =>
          current
            .map((row) => (row.uuid === updated.uuid ? updated : row))
            .sort((a, b) => a.title.localeCompare(b.title)),
        );
        toast({ variant: "success", title: "Job title updated" });
      } else {
        const created = await createOhJobTitle({
          title: title.trim(),
          code: code.trim(),
          employer: employer.id,
          hazard_profile,
        });
        setRows((current) =>
          [...current, created].sort((a, b) => a.title.localeCompare(b.title)),
        );
        toast({ variant: "success", title: "Job title added" });
      }
      setDialogOpen(false);
      setEditing(null);
      setTitle("");
      setCode("");
      setHazardProfileId(NONE_PROFILE);
    } catch (submitError) {
      toast({
        variant: "error",
        title: editing ? "Could not update job title" : "Could not add job title",
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

  async function handleArchive(row: OhJobTitle) {
    setArchivingUuid(row.uuid);
    try {
      await archiveOhJobTitle(row.uuid);
      setRows((current) => current.filter((item) => item.uuid !== row.uuid));
      toast({
        variant: "success",
        title: "Job title archived",
        description: `${row.title} was removed from the catalog.`,
      });
    } catch (archiveError) {
      toast({
        variant: "error",
        title: "Could not archive job title",
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
        title="Job titles"
        description="Roles recorded on employment episodes."
        addLabel="Add job title"
        onAdd={openCreate}
        isLoading={isLoading}
        error={error}
        emptyTitle="No job titles yet"
        emptyDescription="Add the roles workers hold at this employer."
        isEmpty={rows.length === 0}
        embedded={embedded}
      >
        <ul className="divide-y divide-brand-border">
          {rows.map((row) => (
            <OhCatalogRow
              key={row.uuid}
              title={row.title}
              meta={[row.code || "No code", profileMeta(row)]
                .filter(Boolean)
                .join(" · ")}
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
              {editing ? "Edit job title" : "Add job title"}
            </DialogTitle>
            <DialogDescription>
              Define the role for {employer.name} and optionally attach a risk
              profile.
            </DialogDescription>
          </DialogHeader>

          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <div className="space-y-2">
                <Label htmlFor="oh-job-title">Title</Label>
                <Input
                  id="oh-job-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oh-job-code">Code</Label>
                <Input
                  id="oh-job-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="Optional short code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oh-job-risk-profile">Risk profile</Label>
                <Select
                  value={hazardProfileId}
                  onValueChange={setHazardProfileId}
                >
                  <SelectTrigger id="oh-job-risk-profile">
                    <SelectValue placeholder="Select a risk profile…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_PROFILE}>No risk profile</SelectItem>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.uuid} value={String(profile.id)}>
                        {profile.name}
                        {profile.code ? ` (${profile.code})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400">
                  {profiles.length === 0
                    ? "Create a risk profile under Risk profiles first."
                    : "Links this role to hazards and the profile’s COF template."}
                </p>
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
                disabled={isSubmitting || !title.trim()}
              >
                {isSubmitting
                  ? "Saving…"
                  : editing
                    ? "Save changes"
                    : "Save job title"}
              </PrimaryButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";

import { PrimaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
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
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
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
        <DialogContent
          className={cn(appFont.className, "flex w-full max-w-md flex-col gap-0 overflow-hidden p-0")}
        >
          <DialogHeader className="shrink-0 px-5 pb-4 pt-5 text-left">
            <DialogTitle>{editing ? "Edit job title" : "Add job title"}</DialogTitle>
          </DialogHeader>
          <form
            className="flex flex-col border-t border-dash-border"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div className="space-y-4 px-5 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="oh-job-title">
                    Title <RequiredFieldMarker />
                  </Label>
                  <Input
                    id="oh-job-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    autoFocus
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="oh-job-code">Code</Label>
                  <Input
                    id="oh-job-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="oh-job-risk-profile">Risk profile</Label>
                <Select value={hazardProfileId} onValueChange={setHazardProfileId}>
                  <SelectTrigger id="oh-job-risk-profile">
                    <SelectValue placeholder="No risk profile" />
                  </SelectTrigger>
                  <SelectContent className={appFont.className}>
                    <SelectItem value={NONE_PROFILE}>No risk profile</SelectItem>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.uuid} value={String(profile.id)}>
                        {profile.code ? `${profile.name} (${profile.code})` : profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-dash-border px-5 py-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <PrimaryButton type="submit" disabled={isSubmitting || !title.trim()}>
                {isSubmitting ? "Saving" : editing ? "Save changes" : "Add job title"}
              </PrimaryButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

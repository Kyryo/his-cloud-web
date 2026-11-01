"use client";

import { useEffect, useState } from "react";

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
  OhCatalogListPanel,
  OhCatalogRow,
} from "@/features/settings/components/modules/occupational-health/OhCatalogListPanel";
import {
  archiveOhJobProfile,
  createOhJobProfile,
  fetchOhHazards,
  fetchOhJobProfiles,
  updateOhJobProfile,
} from "@/features/occupational-health/services/oh.service";
import type {
  OhEmployer,
  OhHazard,
  OhJobProfile,
} from "@/features/occupational-health/types";
import { BffError } from "@/lib/bff-client";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type OhJobProfilesSettingsTabProps = {
  isActive: boolean;
  employer: OhEmployer;
  embedded?: boolean;
};

export function OhJobProfilesSettingsTab({
  isActive,
  employer,
  embedded = false,
}: OhJobProfilesSettingsTabProps) {
  const { toast } = useToast();
  const [rows, setRows] = useState<OhJobProfile[]>([]);
  const [hazards, setHazards] = useState<OhHazard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OhJobProfile | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [selectedHazardIds, setSelectedHazardIds] = useState<number[]>([]);
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
        const [profiles, hazardRows] = await Promise.all([
          fetchOhJobProfiles(employer.id),
          fetchOhHazards(),
        ]);
        if (active) {
          setRows(profiles);
          setHazards(hazardRows);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load job profiles.",
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

  function toggleHazard(id: number) {
    setSelectedHazardIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  function openCreate() {
    setEditing(null);
    setName("");
    setCode("");
    setSelectedHazardIds([]);
    setDialogOpen(true);
  }

  function openEdit(row: OhJobProfile) {
    setEditing(row);
    setName(row.name);
    setCode(row.code);
    setSelectedHazardIds(row.hazards ?? []);
    setDialogOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !code.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      if (editing) {
        const updated = await updateOhJobProfile(editing.uuid, {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          employer: employer.id,
          hazards: selectedHazardIds,
        });
        setRows((current) =>
          current
            .map((row) => (row.uuid === updated.uuid ? updated : row))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
        toast({ variant: "success", title: "Job profile updated" });
      } else {
        const created = await createOhJobProfile({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          employer: employer.id,
          hazards: selectedHazardIds,
        });
        setRows((current) =>
          [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
        );
        toast({ variant: "success", title: "Job profile added" });
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (submitError) {
      toast({
        variant: "error",
        title: editing ? "Could not update job profile" : "Could not add job profile",
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

  async function handleArchive(row: OhJobProfile) {
    setArchivingUuid(row.uuid);
    try {
      await archiveOhJobProfile(row.uuid);
      setRows((current) => current.filter((item) => item.uuid !== row.uuid));
      toast({
        variant: "success",
        title: "Job profile archived",
        description: `${row.name} was removed from the catalog.`,
      });
    } catch (archiveError) {
      toast({
        variant: "error",
        title: "Could not archive job profile",
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
        title="Job profiles"
        description="Optional roles with hazards for procedure requirements. The exam form stays programme-wide."
        addLabel="Add job profile"
        onAdd={openCreate}
        isLoading={isLoading}
        error={error}
        emptyTitle="No job profiles yet"
        emptyDescription="Add profiles when you need role-specific procedure lists."
        isEmpty={rows.length === 0}
        embedded={embedded}
      >
        <ul className="divide-y divide-brand-border">
          {rows.map((row) => (
            <OhCatalogRow
              key={row.uuid}
              title={row.name}
              meta={
                [
                  row.code,
                  row.hazards?.length
                    ? `${row.hazards.length} hazard${row.hazards.length === 1 ? "" : "s"}`
                    : null,
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit job profile" : "Add job profile"}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <div className="space-y-2">
              <Label htmlFor="oh-job-profile-name">Name</Label>
              <Input
                id="oh-job-profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oh-job-profile-code">Code</Label>
              <Input
                id="oh-job-profile-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Hazards</Label>
              {hazards.length === 0 ? (
                <p className="text-sm text-brand-muted">
                  No hazards yet. Add hazards under Hazard profiles first.
                </p>
              ) : (
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-dash-border p-2">
                  {hazards.map((hazard) => {
                    const checked = selectedHazardIds.includes(hazard.id);
                    return (
                      <button
                        key={hazard.uuid}
                        type="button"
                        onClick={() => toggleHazard(hazard.id)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm",
                          checked
                            ? "bg-brand-primary/10 text-brand-navy"
                            : "hover:bg-slate-50 text-brand-slate",
                        )}
                      >
                        <span>
                          {hazard.code} — {hazard.name}
                        </span>
                        <span className="text-xs text-brand-muted">
                          {checked ? "Selected" : "Select"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !name.trim() || !code.trim()}
              >
                {isSubmitting
                  ? "Saving…"
                  : editing
                    ? "Save changes"
                    : "Save profile"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

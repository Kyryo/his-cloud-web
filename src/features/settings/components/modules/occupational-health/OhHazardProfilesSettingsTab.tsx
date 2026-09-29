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
import { OhCatalogListPanel } from "@/features/settings/components/modules/occupational-health/OhCatalogListPanel";
import {
  createOhHazard,
  createOhHazardProfile,
  fetchOhHazardProfiles,
  fetchOhHazards,
} from "@/features/occupational-health/services/oh.service";
import type {
  OhHazard,
  OhHazardProfile,
} from "@/features/occupational-health/types";
import { BffError } from "@/lib/bff-client";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type OhHazardProfilesSettingsTabProps = {
  isActive: boolean;
};

export function OhHazardProfilesSettingsTab({
  isActive,
}: OhHazardProfilesSettingsTabProps) {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<OhHazardProfile[]>([]);
  const [hazards, setHazards] = useState<OhHazard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [hazardDialogOpen, setHazardDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [selectedHazardIds, setSelectedHazardIds] = useState<number[]>([]);
  const [hazardCode, setHazardCode] = useState("");
  const [hazardName, setHazardName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    let active = true;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [profileRows, hazardRows] = await Promise.all([
          fetchOhHazardProfiles(),
          fetchOhHazards(),
        ]);
        if (active) {
          setProfiles(profileRows);
          setHazards(hazardRows);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load hazard profiles.",
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
  }, [isActive]);

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

  async function handleCreateHazard(event: React.FormEvent) {
    event.preventDefault();
    if (!hazardCode.trim() || !hazardName.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await createOhHazard({
        code: hazardCode.trim(),
        name: hazardName.trim(),
      });
      setHazards((current) =>
        [...current, created].sort((a, b) => a.code.localeCompare(b.code)),
      );
      setSelectedHazardIds((current) => [...current, created.id]);
      setHazardDialogOpen(false);
      setHazardCode("");
      setHazardName("");
      toast({ variant: "success", title: "Hazard added" });
    } catch (submitError) {
      toast({
        variant: "error",
        title: "Could not add hazard",
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await createOhHazardProfile({
        name: name.trim(),
        code: code.trim(),
        hazards: selectedHazardIds,
      });
      setProfiles((current) =>
        [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setDialogOpen(false);
      setName("");
      setCode("");
      setSelectedHazardIds([]);
      toast({ variant: "success", title: "Hazard profile added" });
    } catch (submitError) {
      toast({
        variant: "error",
        title: "Could not add hazard profile",
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

  return (
    <>
      <OhCatalogListPanel
        title="Hazard profiles"
        description="Bundles of workplace hazards assigned to employment episodes."
        addLabel="Add profile"
        onAdd={() => setDialogOpen(true)}
        isLoading={isLoading}
        error={error}
        emptyTitle="No hazard profiles yet"
        emptyDescription="Create a profile and attach hazards for surveillance planning."
        isEmpty={profiles.length === 0}
      >
        <ul className="divide-y rounded-xl border border-dash-border bg-white">
          {profiles.map((row) => (
            <li key={row.uuid} className="px-4 py-3">
              <p className="text-sm font-medium text-brand-navy">{row.name}</p>
              <p className="text-xs text-brand-muted">
                {row.code || "No code"}
                {row.hazards?.length
                  ? ` · ${row.hazards.length} hazard${row.hazards.length === 1 ? "" : "s"}`
                  : ""}
              </p>
            </li>
          ))}
        </ul>
      </OhCatalogListPanel>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add hazard profile</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <div className="space-y-2">
              <Label htmlFor="oh-profile-name">Name</Label>
              <Input
                id="oh-profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
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
              <div className="flex items-center justify-between gap-2">
                <Label>Hazards</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setHazardDialogOpen(true)}
                >
                  Add hazard
                </Button>
              </div>
              {hazards.length === 0 ? (
                <p className="text-sm text-brand-muted">
                  No hazards yet. Add one to attach to this profile.
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
              <Button type="submit" disabled={isSubmitting || !name.trim()}>
                {isSubmitting ? "Saving…" : "Save profile"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={hazardDialogOpen} onOpenChange={setHazardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add hazard</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => void handleCreateHazard(event)}
          >
            <div className="space-y-2">
              <Label htmlFor="oh-hazard-code">Code</Label>
              <Input
                id="oh-hazard-code"
                value={hazardCode}
                onChange={(event) => setHazardCode(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oh-hazard-name">Name</Label>
              <Input
                id="oh-hazard-name"
                value={hazardName}
                onChange={(event) => setHazardName(event.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setHazardDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting || !hazardCode.trim() || !hazardName.trim()
                }
              >
                {isSubmitting ? "Saving…" : "Save hazard"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

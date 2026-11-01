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
  archiveOhEmployerSite,
  createOhEmployerSite,
  fetchOhEmployerSites,
  updateOhEmployerSite,
} from "@/features/occupational-health/services/oh.service";
import type {
  OhEmployer,
  OhEmployerSite,
} from "@/features/occupational-health/types";
import { BffError } from "@/lib/bff-client";
import { useToast } from "@/providers/toast-provider";

type OhSitesSettingsTabProps = {
  isActive: boolean;
  employer: OhEmployer;
  embedded?: boolean;
};

export function OhSitesSettingsTab({
  isActive,
  employer,
  embedded = false,
}: OhSitesSettingsTabProps) {
  const { toast } = useToast();
  const [rows, setRows] = useState<OhEmployerSite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OhEmployerSite | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
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
        const results = await fetchOhEmployerSites(employer.id);
        if (active) {
          setRows(results);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load sites.",
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
    setAddress("");
    setDialogOpen(true);
  }

  function openEdit(row: OhEmployerSite) {
    setEditing(row);
    setName(row.name);
    setCode(row.code ?? "");
    setAddress(row.address ?? "");
    setDialogOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      if (editing) {
        const updated = await updateOhEmployerSite(editing.uuid, {
          name: name.trim(),
          code: code.trim(),
          address: address.trim(),
          employer: employer.id,
        });
        setRows((current) =>
          current
            .map((row) => (row.uuid === updated.uuid ? updated : row))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
        toast({ variant: "success", title: "Site updated" });
      } else {
        const created = await createOhEmployerSite({
          name: name.trim(),
          code: code.trim(),
          address: address.trim(),
          employer: employer.id,
        });
        setRows((current) =>
          [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
        );
        toast({ variant: "success", title: "Site added" });
      }
      setDialogOpen(false);
      setEditing(null);
      setName("");
      setCode("");
      setAddress("");
    } catch (submitError) {
      toast({
        variant: "error",
        title: editing ? "Could not update site" : "Could not add site",
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

  async function handleArchive(row: OhEmployerSite) {
    setArchivingUuid(row.uuid);
    try {
      await archiveOhEmployerSite(row.uuid);
      setRows((current) => current.filter((item) => item.uuid !== row.uuid));
      toast({
        variant: "success",
        title: "Site archived",
        description: `${row.name} was removed from the catalog.`,
      });
    } catch (archiveError) {
      toast({
        variant: "error",
        title: "Could not archive site",
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
        title="Sites"
        description={`Worksites for ${employer.name} used on employment episodes.`}
        addLabel="Add site"
        onAdd={openCreate}
        isLoading={isLoading}
        error={error}
        emptyTitle="No sites yet"
        emptyDescription="Add the locations where this employer’s workers operate."
        isEmpty={rows.length === 0}
        embedded={embedded}
      >
        <ul className="divide-y divide-brand-border">
          {rows.map((row) => (
            <OhCatalogRow
              key={row.uuid}
              title={row.name}
              meta={
                [row.code, row.address].filter(Boolean).join(" · ") || "No details"
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit site" : "Add site"}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <div className="space-y-2">
              <Label htmlFor="oh-site-name">Name</Label>
              <Input
                id="oh-site-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oh-site-code">Code</Label>
              <Input
                id="oh-site-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oh-site-address">Address</Label>
              <Input
                id="oh-site-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
              />
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
                {isSubmitting ? "Saving…" : editing ? "Save changes" : "Save site"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
  OhCatalogListPanel,
  OhCatalogRow,
} from "@/features/settings/components/modules/occupational-health/OhCatalogListPanel";
import {
  archiveOhEmployerDepartment,
  createOhEmployerDepartment,
  fetchOhEmployerDepartments,
  updateOhEmployerDepartment,
} from "@/features/occupational-health/services/oh.service";
import type {
  OhEmployer,
  OhEmployerDepartment,
} from "@/features/occupational-health/types";
import { BffError } from "@/lib/bff-client";
import { useToast } from "@/providers/toast-provider";

type OhDepartmentsSettingsTabProps = {
  isActive: boolean;
  employer: OhEmployer;
  embedded?: boolean;
};

export function OhDepartmentsSettingsTab({
  isActive,
  employer,
  embedded = false,
}: OhDepartmentsSettingsTabProps) {
  const { toast } = useToast();
  const [rows, setRows] = useState<OhEmployerDepartment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OhEmployerDepartment | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
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
        const results = await fetchOhEmployerDepartments(employer.id);
        if (active) {
          setRows(results);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load departments.",
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
    setDialogOpen(true);
  }

  function openEdit(row: OhEmployerDepartment) {
    setEditing(row);
    setName(row.name);
    setCode(row.code ?? "");
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
        const updated = await updateOhEmployerDepartment(editing.uuid, {
          name: name.trim(),
          code: code.trim(),
          employer: employer.id,
        });
        setRows((current) =>
          current
            .map((row) => (row.uuid === updated.uuid ? updated : row))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
        toast({ variant: "success", title: "Department updated" });
      } else {
        const created = await createOhEmployerDepartment({
          name: name.trim(),
          code: code.trim(),
          employer: employer.id,
        });
        setRows((current) =>
          [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
        );
        toast({ variant: "success", title: "Department added" });
      }
      setDialogOpen(false);
      setEditing(null);
    } catch (submitError) {
      toast({
        variant: "error",
        title: editing ? "Could not update department" : "Could not add department",
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

  async function handleArchive(row: OhEmployerDepartment) {
    setArchivingUuid(row.uuid);
    try {
      await archiveOhEmployerDepartment(row.uuid);
      setRows((current) => current.filter((item) => item.uuid !== row.uuid));
      toast({
        variant: "success",
        title: "Department archived",
        description: `${row.name} was removed.`,
      });
    } catch (archiveError) {
      toast({
        variant: "error",
        title: "Could not archive department",
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
        title="Departments"
        description="Units used when placing workers."
        addLabel="Add department"
        onAdd={openCreate}
        isLoading={isLoading}
        error={error}
        emptyTitle="No departments yet"
        emptyDescription="Add departments used when placing workers at this employer."
        isEmpty={rows.length === 0}
        embedded={embedded}
      >
        <ul className="divide-y divide-brand-border">
          {rows.map((row) => (
            <OhCatalogRow
              key={row.uuid}
              title={row.name}
              meta={row.code || "No code"}
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
              {editing ? "Edit department" : "Add department"}
            </DialogTitle>
            <DialogDescription>
              Department for {employer.name}.
            </DialogDescription>
          </DialogHeader>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <div className="space-y-2">
                <Label htmlFor="oh-dept-name">Name</Label>
                <Input
                  id="oh-dept-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oh-dept-code">Code</Label>
                <Input
                  id="oh-dept-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="Optional short code"
                />
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
                    : "Save department"}
              </PrimaryButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

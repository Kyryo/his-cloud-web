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
  createOhEmployer,
  fetchOhEmployers,
} from "@/features/occupational-health/services/oh.service";
import type { OhEmployer } from "@/features/occupational-health/types";
import { BffError } from "@/lib/bff-client";
import { useToast } from "@/providers/toast-provider";

type OhEmployersSettingsTabProps = {
  isActive: boolean;
};

export function OhEmployersSettingsTab({ isActive }: OhEmployersSettingsTabProps) {
  const { toast } = useToast();
  const [rows, setRows] = useState<OhEmployer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
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
        const results = await fetchOhEmployers();
        if (active) {
          setRows(results);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load employers.",
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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await createOhEmployer({
        name: name.trim(),
        code: code.trim(),
        registration_number: registrationNumber.trim(),
      });
      setRows((current) =>
        [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setDialogOpen(false);
      setName("");
      setCode("");
      setRegistrationNumber("");
      toast({ variant: "success", title: "Employer added" });
    } catch (submitError) {
      toast({
        variant: "error",
        title: "Could not add employer",
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
        title="Employers"
        description="Organizations that send workers for occupational health services."
        addLabel="Add employer"
        onAdd={() => setDialogOpen(true)}
        isLoading={isLoading}
        error={error}
        emptyTitle="No employers yet"
        emptyDescription="Add an employer to start configuring job titles and sites."
        isEmpty={rows.length === 0}
      >
        <ul className="divide-y rounded-xl border border-dash-border bg-white">
          {rows.map((row) => (
            <li key={row.uuid} className="flex items-start justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-brand-navy">{row.name}</p>
                <p className="text-xs text-brand-muted">
                  {[row.code, row.registration_number].filter(Boolean).join(" · ") ||
                    "No code"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </OhCatalogListPanel>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add employer</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <div className="space-y-2">
              <Label htmlFor="oh-employer-name">Name</Label>
              <Input
                id="oh-employer-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oh-employer-code">Code</Label>
              <Input
                id="oh-employer-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oh-employer-reg">Registration number</Label>
              <Input
                id="oh-employer-reg"
                value={registrationNumber}
                onChange={(event) => setRegistrationNumber(event.target.value)}
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
                {isSubmitting ? "Saving…" : "Save employer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

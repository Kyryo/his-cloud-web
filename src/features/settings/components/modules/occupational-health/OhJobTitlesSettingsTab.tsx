"use client";

import { useEffect, useMemo, useState } from "react";

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
import { OhCatalogListPanel } from "@/features/settings/components/modules/occupational-health/OhCatalogListPanel";
import {
  createOhJobTitle,
  fetchOhEmployers,
  fetchOhJobTitles,
} from "@/features/occupational-health/services/oh.service";
import type { OhEmployer, OhJobTitle } from "@/features/occupational-health/types";
import { BffError } from "@/lib/bff-client";
import { useToast } from "@/providers/toast-provider";

type OhJobTitlesSettingsTabProps = {
  isActive: boolean;
};

export function OhJobTitlesSettingsTab({ isActive }: OhJobTitlesSettingsTabProps) {
  const { toast } = useToast();
  const [employers, setEmployers] = useState<OhEmployer[]>([]);
  const [employerId, setEmployerId] = useState<string>("");
  const [rows, setRows] = useState<OhJobTitle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedEmployerId = useMemo(
    () => (employerId ? Number(employerId) : undefined),
    [employerId],
  );

  useEffect(() => {
    if (!isActive) {
      return;
    }
    let active = true;
    async function loadEmployers() {
      try {
        const results = await fetchOhEmployers();
        if (!active) {
          return;
        }
        setEmployers(results);
        if (!employerId && results[0]) {
          setEmployerId(String(results[0].id));
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load employers.",
          );
        }
      }
    }
    void loadEmployers();
    return () => {
      active = false;
    };
  }, [employerId, isActive]);

  useEffect(() => {
    if (!isActive || !selectedEmployerId) {
      return;
    }
    let active = true;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const results = await fetchOhJobTitles(selectedEmployerId);
        if (active) {
          setRows(results);
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
  }, [isActive, selectedEmployerId]);

  if (!isActive) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || !selectedEmployerId) {
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await createOhJobTitle({
        title: title.trim(),
        code: code.trim(),
        employer: selectedEmployerId,
      });
      setRows((current) =>
        [...current, created].sort((a, b) => a.title.localeCompare(b.title)),
      );
      setDialogOpen(false);
      setTitle("");
      setCode("");
      toast({ variant: "success", title: "Job title added" });
    } catch (submitError) {
      toast({
        variant: "error",
        title: "Could not add job title",
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
        title="Job titles"
        description="Roles linked to a specific employer for employment episodes."
        addLabel="Add job title"
        onAdd={() => setDialogOpen(true)}
        isLoading={isLoading}
        error={error}
        emptyTitle="No job titles for this employer"
        emptyDescription="Add job titles after selecting an employer."
        isEmpty={rows.length === 0}
        toolbar={
          <div className="max-w-sm space-y-2">
            <Label>Employer</Label>
            <Select value={employerId} onValueChange={setEmployerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select employer" />
              </SelectTrigger>
              <SelectContent>
                {employers.map((employer) => (
                  <SelectItem key={employer.uuid} value={String(employer.id)}>
                    {employer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      >
        <ul className="divide-y rounded-xl border border-dash-border bg-white">
          {rows.map((row) => (
            <li key={row.uuid} className="px-4 py-3">
              <p className="text-sm font-medium text-brand-navy">{row.title}</p>
              <p className="text-xs text-brand-muted">
                {row.code || "No code"}
                {row.employer_name ? ` · ${row.employer_name}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </OhCatalogListPanel>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add job title</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <div className="space-y-2">
              <Label htmlFor="oh-job-title">Title</Label>
              <Input
                id="oh-job-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oh-job-code">Code</Label>
              <Input
                id="oh-job-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
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
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim() || !selectedEmployerId}
              >
                {isSubmitting ? "Saving…" : "Save job title"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

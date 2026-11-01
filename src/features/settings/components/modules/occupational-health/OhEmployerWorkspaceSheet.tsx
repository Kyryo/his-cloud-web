"use client";

import { Loader2, Pencil } from "lucide-react";
import { useState } from "react";

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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { OhDepartmentsSettingsTab } from "@/features/settings/components/modules/occupational-health/OhDepartmentsSettingsTab";
import { OhHazardProfilesSettingsTab } from "@/features/settings/components/modules/occupational-health/OhHazardProfilesSettingsTab";
import { OhJobTitlesSettingsTab } from "@/features/settings/components/modules/occupational-health/OhJobTitlesSettingsTab";
import {
  archiveOhEmployer,
  updateOhEmployer,
} from "@/features/occupational-health/services/oh.service";
import type { OhEmployer } from "@/features/occupational-health/types";
import { BffError } from "@/lib/bff-client";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

export type OhEmployerWorkspaceTabId =
  | "risk-profiles"
  | "departments"
  | "job-titles";

const TABS: Array<{ id: OhEmployerWorkspaceTabId; label: string }> = [
  { id: "risk-profiles", label: "Risk profiles" },
  { id: "departments", label: "Departments" },
  { id: "job-titles", label: "Job titles" },
];

type OhEmployerWorkspaceSheetProps = {
  employer: OhEmployer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployerUpdated: (employer: OhEmployer) => void;
  onEmployerArchived: (uuid: string) => void;
};

export function OhEmployerWorkspaceSheet({
  employer,
  open,
  onOpenChange,
  onEmployerUpdated,
  onEmployerArchived,
}: OhEmployerWorkspaceSheetProps) {
  const { toast } = useToast();
  const [tabState, setTabState] = useState<{
    employerId: string;
    tab: OhEmployerWorkspaceTabId;
  }>({ employerId: "", tab: "risk-profiles" });
  const activeTab =
    employer && tabState.employerId === employer.uuid
      ? tabState.tab
      : "risk-profiles";

  function setActiveTab(tab: OhEmployerWorkspaceTabId) {
    if (!employer) {
      return;
    }
    setTabState({ employerId: employer.uuid, tab });
  }
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  function openEdit() {
    if (!employer) {
      return;
    }
    setName(employer.name);
    setCode(employer.code ?? "");
    setRegistrationNumber(employer.registration_number ?? "");
    setEditOpen(true);
  }

  async function handleSaveEmployer(event: React.FormEvent) {
    event.preventDefault();
    if (!employer || !name.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const updated = await updateOhEmployer(employer.uuid, {
        name: name.trim(),
        code: code.trim(),
        registration_number: registrationNumber.trim(),
      });
      onEmployerUpdated(updated);
      setEditOpen(false);
      toast({ variant: "success", title: "Employer updated" });
    } catch (submitError) {
      toast({
        variant: "error",
        title: "Could not update employer",
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

  async function handleArchive() {
    if (!employer) {
      return;
    }
    setIsArchiving(true);
    try {
      await archiveOhEmployer(employer.uuid);
      onEmployerArchived(employer.uuid);
      onOpenChange(false);
      toast({
        variant: "success",
        title: "Employer archived",
        description: `${employer.name} was removed from the catalog.`,
      });
    } catch (archiveError) {
      toast({
        variant: "error",
        title: "Could not archive employer",
        description:
          archiveError instanceof Error
            ? archiveError.message
            : "Something went wrong.",
      });
    } finally {
      setIsArchiving(false);
    }
  }

  const meta = employer
    ? [employer.code, employer.registration_number].filter(Boolean).join(" · ")
    : "";

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          className={cn(
            appFont.className,
            "flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl",
          )}
          data-testid="oh-employer-workspace-sheet"
        >
          <SheetHeader className="space-y-0 border-b border-dash-border/70 px-6 py-5 pr-14 text-left">
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <SheetTitle className="text-[11px] font-medium uppercase tracking-[0.08em] text-dash-muted">
                  Employer
                </SheetTitle>
                <p className="mt-1 truncate text-lg font-semibold tracking-tight text-brand-navy">
                  {employer?.name ?? "—"}
                </p>
                {meta ? (
                  <p className="mt-1 truncate text-sm text-dash-muted">
                    {meta}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 gap-1.5 text-brand-muted hover:text-brand-navy"
                onClick={openEdit}
                disabled={!employer}
              >
                <Pencil className="size-3.5" aria-hidden />
                Edit
              </Button>
            </div>
            <SheetDescription className="sr-only">
              Configure catalogs for {employer?.name ?? "this employer"}
            </SheetDescription>
          </SheetHeader>

          <nav
            aria-label="Employer catalogs"
            className="flex gap-5 overflow-x-auto border-b border-dash-border/70 px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative -mb-px shrink-0 pb-2.5 pt-3 text-sm transition-colors",
                    isActive
                      ? "font-medium text-brand-navy"
                      : "text-dash-muted hover:text-brand-navy",
                  )}
                >
                  {tab.label}
                  {isActive ? (
                    <span className="absolute inset-x-0 bottom-0 h-px bg-brand-navy" />
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {employer ? (
              <>
                <OhHazardProfilesSettingsTab
                  isActive={activeTab === "risk-profiles"}
                  employer={employer}
                  embedded
                />
                <OhDepartmentsSettingsTab
                  isActive={activeTab === "departments"}
                  employer={employer}
                  embedded
                />
                <OhJobTitlesSettingsTab
                  isActive={activeTab === "job-titles"}
                  employer={employer}
                  embedded
                />
              </>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-dash-border/60 bg-white px-6 py-4">
            <SecondaryButton
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isArchiving}
            >
              Done
            </SecondaryButton>
            <Button
              type="button"
              variant="ghost"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              disabled={!employer || isArchiving}
              onClick={() => void handleArchive()}
            >
              {isArchiving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Archiving…
                </>
              ) : (
                "Archive employer"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit employer</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => void handleSaveEmployer(event)}
          >
            <div className="space-y-2">
              <Label htmlFor="oh-employer-edit-name">Name</Label>
              <Input
                id="oh-employer-edit-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oh-employer-edit-code">Code</Label>
              <Input
                id="oh-employer-edit-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oh-employer-edit-reg">Registration number</Label>
              <Input
                id="oh-employer-edit-reg"
                value={registrationNumber}
                onChange={(event) => setRegistrationNumber(event.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <PrimaryButton
                type="submit"
                disabled={isSubmitting || !name.trim()}
              >
                {isSubmitting ? "Saving…" : "Save changes"}
              </PrimaryButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

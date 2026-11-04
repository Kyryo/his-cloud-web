"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

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
          <SheetHeader className="space-y-0 border-b border-dash-border px-5 py-4 pr-12 text-left">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <SheetTitle className="truncate text-[16px] font-semibold tracking-tight text-brand-navy">
                  {employer?.name ?? "Employer"}
                </SheetTitle>
                <SheetDescription className="mt-0.5 truncate text-[13px] text-dash-muted">
                  {meta || "Risk profiles, departments and job titles."}
                </SheetDescription>
              </div>
              <button
                type="button"
                onClick={openEdit}
                disabled={!employer}
                className="shrink-0 text-[13px] font-medium text-brand-primary hover:underline disabled:opacity-50"
              >
                Edit
              </button>
            </div>
          </SheetHeader>

          <nav
            aria-label="Employer catalogs"
            className="flex gap-6 overflow-x-auto border-b border-dash-border px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "-mb-px shrink-0 border-b-2 py-2.5 text-[13px]",
                    isActive
                      ? "border-brand-navy font-medium text-brand-navy"
                      : "border-transparent text-dash-muted hover:text-brand-navy",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
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

          <div className="flex items-center justify-between border-t border-dash-border px-5 py-3">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-[13px] text-red-700 hover:underline disabled:opacity-50"
              disabled={!employer || isArchiving}
              onClick={() => void handleArchive()}
            >
              {isArchiving ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : null}
              {isArchiving ? "Archiving" : "Archive employer"}
            </button>
            <span className="text-[12px] text-dash-muted">
              {employer?.is_active === false ? "Inactive" : "Active"}
            </span>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className={cn(appFont.className, "gap-0 p-0 sm:max-w-md")}>
          <DialogHeader className="px-5 pb-4 pt-5">
            <DialogTitle>Edit employer</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4 border-t border-dash-border px-5 py-4"
            onSubmit={(event) => void handleSaveEmployer(event)}
          >
            <div className="space-y-1.5">
              <Label htmlFor="oh-employer-edit-name">
                Name <RequiredFieldMarker />
              </Label>
              <Input
                id="oh-employer-edit-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="oh-employer-edit-code">Code</Label>
              <Input
                id="oh-employer-edit-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="oh-employer-edit-reg">Registration number</Label>
              <Input
                id="oh-employer-edit-reg"
                value={registrationNumber}
                onChange={(event) => setRegistrationNumber(event.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-dash-border pt-3">
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
                {isSubmitting ? "Saving" : "Save changes"}
              </PrimaryButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

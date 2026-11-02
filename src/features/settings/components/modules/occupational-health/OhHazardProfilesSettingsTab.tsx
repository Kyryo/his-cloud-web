"use client";

import { useEffect, useMemo, useState } from "react";

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
import { SearchableSelect, SelectItem } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem as PlainSelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OhCatalogListPanel,
  OhCatalogRow,
} from "@/features/settings/components/modules/occupational-health/OhCatalogListPanel";
import { TagColorField } from "@/features/settings/components/ClientTagFormFields";
import {
  archiveOhHazardProfile,
  createOhHazardProfile,
  fetchOhCofTemplates,
  fetchOhExamTemplates,
  fetchOhHazardProfiles,
  updateOhHazardProfile,
} from "@/features/occupational-health/services/oh.service";
import type {
  OhAssessmentIntervalUnit,
  OhCofTemplate,
  OhEmployer,
  OhExamTemplate,
  OhHazardProfile,
} from "@/features/occupational-health/types";
import { BffError } from "@/lib/bff-client";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const NONE_TEMPLATE = "__none__";
const DEFAULT_COLOR = "#2563eb";

const SCHEDULE_UNITS: Array<{
  value: OhAssessmentIntervalUnit;
  label: string;
}> = [
  { value: "day", label: "days" },
  { value: "week", label: "weeks" },
  { value: "month", label: "months" },
  { value: "year", label: "years" },
];

type DialogTabId = "general" | "schedule";

const DIALOG_TABS: Array<{ id: DialogTabId; label: string }> = [
  { id: "general", label: "General" },
  { id: "schedule", label: "Schedule" },
];

type TemplateOption = {
  uuid: string;
  name: string;
  code?: string;
};

type OhTemplateSearchableSelectProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: TemplateOption[];
  searchPlaceholder: string;
  noneLabel?: string;
};

function formatTemplateLabel(template: TemplateOption) {
  return template.code
    ? `${template.name} (${template.code})`
    : template.name;
}

function OhTemplateSearchableSelect({
  id,
  label,
  value,
  onChange,
  options,
  searchPlaceholder,
  noneLabel = "No template",
}: OhTemplateSearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = useMemo(
    () => options.find((option) => option.uuid === value) ?? null,
    [options, value],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return options;
    }
    return options.filter((option) => {
      const haystack = `${option.name} ${option.code ?? ""}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [options, search]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <SearchableSelect
        id={id}
        value={value}
        onValueChange={(next) => {
          onChange(next);
          setOpen(false);
          setSearch("");
        }}
        open={open}
        onOpenChange={handleOpenChange}
        placeholder="Select a template…"
        displayValue={
          value === NONE_TEMPLATE
            ? noneLabel
            : selected
              ? formatTemplateLabel(selected)
              : "Selected template"
        }
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={searchPlaceholder}
        minSearchLength={0}
        emptySearchMessage="No templates loaded."
        noResultsMessage="No matching templates."
      >
        <SelectItem value={NONE_TEMPLATE}>{noneLabel}</SelectItem>
        {filtered.map((option) => (
          <SelectItem key={option.uuid} value={option.uuid}>
            {formatTemplateLabel(option)}
          </SelectItem>
        ))}
      </SearchableSelect>
    </div>
  );
}

function formatScheduleSummary(
  interval: number | null,
  unit: OhAssessmentIntervalUnit,
): string | null {
  if (interval == null || interval < 1) {
    return null;
  }
  const unitLabel =
    SCHEDULE_UNITS.find((row) => row.value === unit)?.label ?? unit;
  return `Every ${interval} ${unitLabel}`;
}

type OhHazardProfilesSettingsTabProps = {
  isActive: boolean;
  employer: OhEmployer;
  embedded?: boolean;
};

export function OhHazardProfilesSettingsTab({
  isActive,
  employer,
  embedded = false,
}: OhHazardProfilesSettingsTabProps) {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<OhHazardProfile[]>([]);
  const [cofTemplates, setCofTemplates] = useState<OhCofTemplate[]>([]);
  const [examTemplates, setExamTemplates] = useState<OhExamTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState<DialogTabId>("general");
  const [editing, setEditing] = useState<OhHazardProfile | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [cofTemplateUuid, setCofTemplateUuid] = useState(NONE_TEMPLATE);
  const [examTemplateUuid, setExamTemplateUuid] = useState(NONE_TEMPLATE);
  const [assessmentInterval, setAssessmentInterval] = useState("");
  const [assessmentIntervalUnit, setAssessmentIntervalUnit] =
    useState<OhAssessmentIntervalUnit>("month");
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
        const [profileRows, nextCofTemplates, nextExamTemplates] =
          await Promise.all([
            fetchOhHazardProfiles(employer.id),
            fetchOhCofTemplates(),
            fetchOhExamTemplates(),
          ]);
        if (active) {
          setProfiles(profileRows);
          setCofTemplates(nextCofTemplates);
          setExamTemplates(nextExamTemplates);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load risk profiles.",
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

  function resetForm() {
    setEditing(null);
    setDialogTab("general");
    setName("");
    setCode("");
    setColor(DEFAULT_COLOR);
    setCofTemplateUuid(NONE_TEMPLATE);
    setExamTemplateUuid(NONE_TEMPLATE);
    setAssessmentInterval("");
    setAssessmentIntervalUnit("month");
  }

  function openCreate() {
    resetForm();
    setDialogOpen(true);
  }

  function openEdit(row: OhHazardProfile) {
    setEditing(row);
    setDialogTab("general");
    setName(row.name);
    setCode(row.code ?? "");
    setColor(row.color?.trim() || DEFAULT_COLOR);
    setCofTemplateUuid(row.cof_template || NONE_TEMPLATE);
    setExamTemplateUuid(row.exam_template || NONE_TEMPLATE);
    setAssessmentInterval(
      row.assessment_interval != null ? String(row.assessment_interval) : "",
    );
    setAssessmentIntervalUnit(
      (row.assessment_interval_unit as OhAssessmentIntervalUnit) || "month",
    );
    setDialogOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      return;
    }
    const cof_template =
      cofTemplateUuid === NONE_TEMPLATE ? null : cofTemplateUuid;
    const exam_template =
      examTemplateUuid === NONE_TEMPLATE ? null : examTemplateUuid;
    const parsedInterval = Number.parseInt(assessmentInterval, 10);
    const assessment_interval =
      Number.isFinite(parsedInterval) && parsedInterval > 0
        ? parsedInterval
        : null;
    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        code: code.trim(),
        color: color.trim(),
        assessment_interval,
        assessment_interval_unit: assessmentIntervalUnit,
        employer: employer.id,
        cof_template,
        exam_template,
      };
      if (editing) {
        const updated = await updateOhHazardProfile(editing.uuid, payload);
        setProfiles((current) =>
          current
            .map((row) => (row.uuid === updated.uuid ? updated : row))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
        toast({ variant: "success", title: "Risk profile updated" });
      } else {
        const created = await createOhHazardProfile(payload);
        setProfiles((current) =>
          [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
        );
        toast({ variant: "success", title: "Risk profile added" });
      }
      setDialogOpen(false);
      resetForm();
    } catch (submitError) {
      toast({
        variant: "error",
        title: editing
          ? "Could not update risk profile"
          : "Could not add risk profile",
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

  async function handleArchive(row: OhHazardProfile) {
    setArchivingUuid(row.uuid);
    try {
      await archiveOhHazardProfile(row.uuid);
      setProfiles((current) => current.filter((item) => item.uuid !== row.uuid));
      toast({
        variant: "success",
        title: "Risk profile archived",
        description: `${row.name} was removed.`,
      });
    } catch (archiveError) {
      toast({
        variant: "error",
        title: "Could not archive risk profile",
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
        title="Risk profiles"
        description={`Workplace risk bundles for ${employer.name}, linked to COF and exam templates.`}
        addLabel="Add risk profile"
        onAdd={openCreate}
        isLoading={isLoading}
        error={error}
        emptyTitle="No risk profiles yet"
        emptyDescription="Create a profile and link COF and exam templates."
        isEmpty={profiles.length === 0}
        embedded={embedded}
      >
        <ul className="divide-y divide-brand-border">
          {profiles.map((row) => (
            <OhCatalogRow
              key={row.uuid}
              title={row.name}
              color={row.color}
              meta={
                [
                  row.code || "No code",
                  formatScheduleSummary(
                    row.assessment_interval ?? null,
                    (row.assessment_interval_unit as OhAssessmentIntervalUnit) ||
                      "month",
                  ),
                  row.cof_template_name || row.cof_template_code || null,
                  row.exam_template_name || row.exam_template_code || null,
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
            resetForm();
          }
        }}
      >
        <DialogContent className="flex max-h-[90vh] w-full max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="shrink-0 space-y-1 border-b border-dash-border/70 px-6 py-5 pr-14 text-left">
            <DialogTitle>
              {editing ? "Edit risk profile" : "Add risk profile"}
            </DialogTitle>
            <DialogDescription>
              Templates, color, and assessment cadence for {employer.name}.
            </DialogDescription>
          </DialogHeader>
          <nav
            aria-label="Risk profile sections"
            className="flex gap-5 border-b border-dash-border/70 px-6"
          >
            {DIALOG_TABS.map((tab) => {
              const isActiveTab = dialogTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDialogTab(tab.id)}
                  className={cn(
                    "relative -mb-px shrink-0 pb-2.5 pt-3 text-sm transition-colors",
                    isActiveTab
                      ? "font-medium text-brand-navy"
                      : "text-dash-muted hover:text-brand-navy",
                  )}
                >
                  {tab.label}
                  {isActiveTab ? (
                    <span className="absolute inset-x-0 bottom-0 h-px bg-brand-navy" />
                  ) : null}
                </button>
              );
            })}
          </nav>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
              {dialogTab === "general" ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="oh-profile-name">Name</Label>
                    <Input
                      id="oh-profile-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoFocus
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
                  <TagColorField value={color} onChange={setColor} />
                  <OhTemplateSearchableSelect
                    id="oh-profile-cof"
                    label="COF template"
                    value={cofTemplateUuid}
                    onChange={setCofTemplateUuid}
                    options={cofTemplates}
                    searchPlaceholder="Search COF templates…"
                  />
                  <OhTemplateSearchableSelect
                    id="oh-profile-exam"
                    label="Exam template"
                    value={examTemplateUuid}
                    onChange={setExamTemplateUuid}
                    options={examTemplates}
                    searchPlaceholder="Search exam templates…"
                  />
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-brand-navy">
                      Assessment schedule
                    </h3>
                    <p className="mt-0.5 text-[13px] text-slate-400">
                      How often people on this risk profile should undergo an
                      assessment. Leave blank if there is no fixed cadence.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="oh-profile-interval">Every</Label>
                      <Input
                        id="oh-profile-interval"
                        type="number"
                        min={1}
                        inputMode="numeric"
                        value={assessmentInterval}
                        onChange={(event) =>
                          setAssessmentInterval(event.target.value)
                        }
                        placeholder="e.g. 12"
                        className="w-28"
                      />
                    </div>
                    <div className="min-w-[8rem] flex-1 space-y-2">
                      <Label htmlFor="oh-profile-interval-unit">Unit</Label>
                      <Select
                        value={assessmentIntervalUnit}
                        onValueChange={(value) =>
                          setAssessmentIntervalUnit(
                            value as OhAssessmentIntervalUnit,
                          )
                        }
                      >
                        <SelectTrigger id="oh-profile-interval-unit">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SCHEDULE_UNITS.map((unit) => (
                            <PlainSelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </PlainSelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {formatScheduleSummary(
                    Number.parseInt(assessmentInterval, 10) || null,
                    assessmentIntervalUnit,
                  ) ? (
                    <p className="text-sm text-brand-slate">
                      {formatScheduleSummary(
                        Number.parseInt(assessmentInterval, 10) || null,
                        assessmentIntervalUnit,
                      )}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400">Not scheduled.</p>
                  )}
                </div>
              )}
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
                    : "Save profile"}
              </PrimaryButton>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

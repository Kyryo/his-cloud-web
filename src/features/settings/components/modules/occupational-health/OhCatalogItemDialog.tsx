"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type {
  OhCatalogItemType,
  OhCatalogPossibleResponse,
  OhCatalogScheduleRow,
  OhCatalogScheduleUnit,
} from "@/features/occupational-health/types";
import { cn } from "@/lib/utils";

const SCHEDULE_UNIT_OPTIONS: Array<{
  value: OhCatalogScheduleUnit;
  label: string;
}> = [
  { value: "day", label: "day(s)" },
  { value: "week", label: "week(s)" },
  { value: "month", label: "month(s)" },
  { value: "year", label: "year(s)" },
];

type CatalogItemDialogTab = "general" | "schedule" | "responses";

export type OhCatalogItemDialogValues = {
  name: string;
  code: string;
  isMandatory: boolean;
  schedule: OhCatalogScheduleRow[];
  responses: OhCatalogPossibleResponse[];
};

type OhCatalogItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  /** @deprecated Prefer sectionName. */
  itemType?: OhCatalogItemType;
  sectionName?: string;
  singularLabel?: string;
  initialValues?: OhCatalogItemDialogValues | null;
  isSubmitting?: boolean;
  onSubmit: (values: OhCatalogItemDialogValues) => Promise<void> | void;
};

function emptyResponse(): OhCatalogPossibleResponse {
  return { code: "", label: "" };
}

function emptyScheduleRow(): OhCatalogScheduleRow {
  return { interval: 12, unit: "month", notes: "" };
}

export function OhCatalogItemDialog({
  open,
  onOpenChange,
  mode,
  sectionName,
  singularLabel = "item",
  initialValues = null,
  isSubmitting = false,
  onSubmit,
}: OhCatalogItemDialogProps) {
  const tabs = useMemo(
    () =>
      [
        { id: "general", label: "General" },
        { id: "schedule", label: "Schedule" },
        { id: "responses", label: "Responses" },
      ] as Array<{ id: CatalogItemDialogTab; label: string }>,
    [],
  );

  const [tab, setTab] = useState<CatalogItemDialogTab>("general");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isMandatory, setIsMandatory] = useState(false);
  const [schedule, setSchedule] = useState<OhCatalogScheduleRow[]>([]);
  const [responses, setResponses] = useState<OhCatalogPossibleResponse[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setTab("general");
    setName(initialValues?.name ?? "");
    setCode(initialValues?.code ?? "");
    setIsMandatory(initialValues?.isMandatory ?? false);
    setSchedule(initialValues?.schedule ?? []);
    setResponses(initialValues?.responses ?? []);
  }, [initialValues, open]);

  function updateResponse(
    index: number,
    patch: Partial<OhCatalogPossibleResponse>,
  ) {
    setResponses((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  }

  function updateSchedule(
    index: number,
    patch: Partial<OhCatalogScheduleRow>,
  ) {
    setSchedule((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!code.trim()) {
      setTab("general");
      return;
    }
    await onSubmit({
      name: name.trim(),
      code: code.trim(),
      isMandatory,
      schedule,
      responses,
    });
  }

  const title =
    mode === "edit"
      ? `Edit ${singularLabel}`
      : `Add ${singularLabel}${sectionName ? ` · ${sectionName}` : ""}`;
  const responseCount = responses.filter(
    (row) => row.code.trim() || row.label.trim(),
  ).length;
  const scheduleCount = schedule.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-1 border-b border-dash-border/70 px-6 py-5 pr-14 text-left">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Configure identity, schedule for due reminders, and possible
            responses. Selection rules are set on the section.
          </DialogDescription>
        </DialogHeader>

        <nav
          aria-label={`${singularLabel} sections`}
          className="flex shrink-0 gap-5 border-b border-dash-border/70 px-6"
        >
          {tabs.map((entry) => {
            const isActive = tab === entry.id;
            const badge =
              entry.id === "responses"
                ? responseCount
                : entry.id === "schedule"
                  ? scheduleCount
                  : 0;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setTab(entry.id)}
                className={cn(
                  "relative -mb-px shrink-0 pb-2.5 pt-3 text-sm transition-colors",
                  isActive
                    ? "font-medium text-brand-navy"
                    : "text-dash-muted hover:text-brand-navy",
                )}
              >
                {entry.label}
                {badge > 0 ? (
                  <span className="ml-1.5 text-xs text-slate-400">({badge})</span>
                ) : null}
                {isActive ? (
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
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {tab === "general" ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="oh-catalog-name">Display name</Label>
                  <Input
                    id="oh-catalog-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoFocus={mode === "add"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oh-catalog-code">Code</Label>
                  <Input
                    id="oh-catalog-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    required
                  />
                  <p className="text-xs text-slate-400">
                    Stable identifier used when programmes require this item on
                    an exam.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl border border-dash-border/80 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-brand-navy">
                      Mandatory item
                    </p>
                    <p className="mt-0.5 text-[13px] text-slate-400">
                      Required when completing this section.
                    </p>
                  </div>
                  <Switch
                    checked={isMandatory}
                    onCheckedChange={setIsMandatory}
                    aria-label="Mandatory catalog item"
                  />
                </div>
              </div>
            ) : null}

            {tab === "schedule" ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-brand-navy">
                      Schedule
                    </h3>
                    <p className="mt-0.5 text-[13px] text-slate-400">
                      Frequency used to track due dates and remind relevant
                      offices.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-1"
                    onClick={() =>
                      setSchedule((current) => [...current, emptyScheduleRow()])
                    }
                  >
                    <Plus className="size-3.5" aria-hidden />
                    Add row
                  </Button>
                </div>

                {schedule.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-dash-border/80 px-4 py-8 text-center">
                    <p className="text-sm font-medium text-brand-navy">
                      No schedule rows
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Add a frequency such as every 3 months.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-dash-border/80">
                    <table className="w-full min-w-[28rem] text-left text-sm">
                      <thead className="border-b border-dash-border/80 bg-slate-50/80 text-xs font-medium uppercase tracking-wide text-slate-400">
                        <tr>
                          <th className="px-3 py-2.5 font-medium">Every</th>
                          <th className="px-3 py-2.5 font-medium">Freq</th>
                          <th className="px-3 py-2.5 font-medium">Notes</th>
                          <th className="px-3 py-2.5 font-medium">
                            <span className="sr-only">Remove</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-border">
                        {schedule.map((row, index) => (
                          <tr key={`schedule-${index}`}>
                            <td className="px-3 py-2 align-middle">
                              <Input
                                type="number"
                                min={1}
                                step={1}
                                value={row.interval}
                                onChange={(event) =>
                                  updateSchedule(index, {
                                    interval: Math.max(
                                      1,
                                      Number(event.target.value) || 1,
                                    ),
                                  })
                                }
                                aria-label={`Schedule ${index + 1} interval`}
                                className="h-9 w-24"
                              />
                            </td>
                            <td className="px-3 py-2 align-middle">
                              <Select
                                value={row.unit}
                                onValueChange={(value) =>
                                  updateSchedule(index, {
                                    unit: value as OhCatalogScheduleUnit,
                                  })
                                }
                              >
                                <SelectTrigger
                                  aria-label={`Schedule ${index + 1} frequency unit`}
                                  className="h-9 w-[8.5rem]"
                                >
                                  <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                  {SCHEDULE_UNIT_OPTIONS.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-3 py-2 align-middle">
                              <Input
                                value={row.notes ?? ""}
                                onChange={(event) =>
                                  updateSchedule(index, {
                                    notes: event.target.value,
                                  })
                                }
                                placeholder="Optional"
                                aria-label={`Schedule ${index + 1} notes`}
                                className="h-9"
                              />
                            </td>
                            <td className="px-2 py-2 align-middle">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-brand-muted hover:text-red-600"
                                onClick={() =>
                                  setSchedule((current) =>
                                    current.filter(
                                      (_, rowIndex) => rowIndex !== index,
                                    ),
                                  )
                                }
                                aria-label={`Remove schedule row ${index + 1}`}
                              >
                                <Trash2 className="size-4" aria-hidden />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : null}

            {tab === "responses" ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-brand-navy">
                      Possible responses
                    </h3>
                    <p className="mt-0.5 text-[13px] text-slate-400">
                      Outcome choices for this item.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-1"
                    onClick={() =>
                      setResponses((current) => [...current, emptyResponse()])
                    }
                  >
                    <Plus className="size-3.5" aria-hidden />
                    Add
                  </Button>
                </div>

                {responses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-dash-border/80 px-4 py-8 text-center">
                    <p className="text-sm font-medium text-brand-navy">
                      No responses yet
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Add choices staff can pick when recording this item.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-[1fr_1fr_2.5rem] gap-2 px-0.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                      <span>Label</span>
                      <span>Code</span>
                      <span className="sr-only">Remove</span>
                    </div>
                    {responses.map((row, index) => (
                      <div
                        key={`response-${index}`}
                        className="grid grid-cols-[1fr_1fr_auto] gap-2"
                      >
                        <Input
                          value={row.label}
                          onChange={(event) =>
                            updateResponse(index, {
                              label: event.target.value,
                            })
                          }
                          placeholder="Label"
                          aria-label={`Response ${index + 1} label`}
                        />
                        <Input
                          value={row.code}
                          onChange={(event) =>
                            updateResponse(index, {
                              code: event.target.value,
                            })
                          }
                          placeholder="Code"
                          aria-label={`Response ${index + 1} code`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-brand-muted hover:text-red-600"
                          onClick={() =>
                            setResponses((current) =>
                              current.filter(
                                (_, rowIndex) => rowIndex !== index,
                              ),
                            )
                          }
                          aria-label={`Remove response ${index + 1}`}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-dash-border/60 bg-white px-6 py-4">
            <SecondaryButton
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={isSubmitting || !code.trim()}
            >
              {isSubmitting
                ? "Saving…"
                : mode === "edit"
                  ? "Save"
                  : "Add"}
            </PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReportResourceSelect } from "@/features/reports/components/ReportResourceSelect";
import type { ReportFilterField } from "@/features/reports/constants/report-catalog";
import {
  getReportDatePresets,
  getReportSingleDatePresets,
} from "@/features/reports/utils/report-date-presets";
import {
  groupReportDateFields,
  type ReportDateFieldGroup,
} from "@/features/reports/utils/report-export-summary";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type ReportFilterFormProps = {
  fields: ReportFilterField[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
};

const ALL_OPTION = "__all__";

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
        {title}
      </h3>
      {children}
    </section>
  );
}

function FilterField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-brand-navy">
        {label}
      </Label>
      {children}
    </div>
  );
}

function PresetChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium transition-colors active:scale-[0.98]",
        selected
          ? "bg-brand-primary text-white"
          : "bg-brand-tint/60 text-brand-primary hover:bg-brand-tint hover:text-brand-primary-hover",
      )}
    >
      {label}
    </button>
  );
}

function DatePresetChips({
  group,
  values,
  onChange,
}: {
  group: ReportDateFieldGroup;
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  if (group.kind === "range") {
    const presets = getReportDatePresets();
    const from = values[group.from.name] ?? "";
    const to = values[group.to.name] ?? "";

    return (
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Quick periods">
        {presets.map((preset) => (
          <PresetChip
            key={preset.id}
            label={preset.label}
            selected={preset.dateFrom === from && preset.dateTo === to}
            onClick={() => {
              onChange(group.from.name, preset.dateFrom);
              onChange(group.to.name, preset.dateTo);
            }}
          />
        ))}
      </div>
    );
  }

  if (group.kind === "single") {
    const presets = getReportSingleDatePresets();
    const current = values[group.field.name] ?? "";

    return (
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Quick dates">
        {presets.map((preset) => (
          <PresetChip
            key={preset.id}
            label={preset.label}
            selected={preset.date === current}
            onClick={() => onChange(group.field.name, preset.date)}
          />
        ))}
      </div>
    );
  }

  return null;
}

export function ReportFilterForm({
  fields,
  values,
  onChange,
}: ReportFilterFormProps) {
  const dateGroup = groupReportDateFields(fields);
  const dateFields = fields.filter((field) => field.type === "date");
  const otherFields = fields.filter((field) => field.type !== "date");

  function renderField(field: ReportFilterField) {
    if (field.type === "resource" && field.resource) {
      return (
        <ReportResourceSelect
          key={field.name}
          id={field.name}
          label={field.label}
          resource={field.resource}
          value={values[field.name] ?? ""}
          onChange={(value) => onChange(field.name, value)}
        />
      );
    }

    if (field.type === "select" && field.options) {
      return (
        <FilterField key={field.name} id={field.name} label={field.label}>
          <Select
            value={values[field.name] || ALL_OPTION}
            onValueChange={(value) =>
              onChange(field.name, value === ALL_OPTION ? "" : value)
            }
          >
            <SelectTrigger id={field.name} className={appFont.className}>
              <SelectValue placeholder={`All ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent position="popper" className={appFont.className}>
              <SelectItem value={ALL_OPTION}>All</SelectItem>
              {field.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
      );
    }

    return (
      <FilterField key={field.name} id={field.name} label={field.label}>
        <Input
          id={field.name}
          type={field.type === "date" ? "date" : "text"}
          value={values[field.name] ?? ""}
          placeholder={field.placeholder}
          onChange={(event) => onChange(field.name, event.target.value)}
        />
      </FilterField>
    );
  }

  return (
    <div className="space-y-7">
      {dateGroup.kind !== "none" ? (
        <FilterSection title={dateGroup.kind === "range" ? "Period" : "Date"}>
          <DatePresetChips group={dateGroup} values={values} onChange={onChange} />
          <div className="grid gap-4 sm:grid-cols-2">
            {dateFields.map(renderField)}
          </div>
        </FilterSection>
      ) : null}

      {otherFields.length > 0 ? (
        <FilterSection title="Narrow down">
          <div className="grid gap-4 sm:grid-cols-2">
            {otherFields.map(renderField)}
          </div>
        </FilterSection>
      ) : null}
    </div>
  );
}

export function buildReportFiltersPayload(
  values: Record<string, string>,
): Record<string, string> {
  const payload: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value.trim()) {
      payload[key] = value.trim();
    }
  }
  return payload;
}

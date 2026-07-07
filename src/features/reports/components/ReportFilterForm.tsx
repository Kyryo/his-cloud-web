"use client";

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

type ReportFilterFormProps = {
  fields: ReportFilterField[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
};

const ALL_OPTION = "__all__";

export function ReportFilterForm({
  fields,
  values,
  onChange,
}: ReportFilterFormProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => {
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
            <div key={field.name} className="space-y-1.5">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Select
                value={values[field.name] || ALL_OPTION}
                onValueChange={(value) =>
                  onChange(field.name, value === ALL_OPTION ? "" : value)
                }
              >
                <SelectTrigger id={field.name}>
                  <SelectValue placeholder={`All ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_OPTION}>All</SelectItem>
                  {field.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        return (
          <div key={field.name} className="space-y-1.5">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type={field.type === "date" ? "date" : "text"}
              value={values[field.name] ?? ""}
              placeholder={field.placeholder}
              onChange={(event) => onChange(field.name, event.target.value)}
            />
          </div>
        );
      })}
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

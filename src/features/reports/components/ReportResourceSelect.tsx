"use client";

import { useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchReportFilterOptions,
  type ReportFilterOption,
  type ReportFilterResource,
} from "@/features/reports/services/report-filter-options.service";

const ALL_OPTION = "__all__";

const optionsCache = new Map<ReportFilterResource, ReportFilterOption[]>();

type ReportResourceSelectProps = {
  id: string;
  label: string;
  resource: ReportFilterResource;
  value: string;
  onChange: (value: string) => void;
};

export function ReportResourceSelect({
  id,
  label,
  resource,
  value,
  onChange,
}: ReportResourceSelectProps) {
  const [options, setOptions] = useState<ReportFilterOption[]>(
    () => optionsCache.get(resource) ?? [],
  );
  const [isLoading, setIsLoading] = useState(
    () => !optionsCache.has(resource),
  );
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const cached = optionsCache.get(resource);
    if (cached) {
      setOptions(cached);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setHasError(false);

    void (async () => {
      try {
        const result = await fetchReportFilterOptions(resource);
        optionsCache.set(resource, result);
        if (!cancelled) {
          setOptions(result);
        }
      } catch {
        if (!cancelled) {
          setHasError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resource]);

  const placeholder = isLoading
    ? "Loading…"
    : hasError
      ? "Unable to load options"
      : `All ${label.toLowerCase()}`;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value || ALL_OPTION}
        disabled={isLoading || hasError}
        onValueChange={(next) => onChange(next === ALL_OPTION ? "" : next)}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_OPTION}>{`All ${label.toLowerCase()}`}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

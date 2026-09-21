"use client";

import type { ReactNode } from "react";

import { UserIdenticon } from "@/components/UserIdenticon";
import { Badge } from "@/components/ui/badge";
import {
  DetailPageHeaderSection,
  DetailPageTitle,
} from "@/features/app-shell/components/page-layout";
import type { LabTestDefinition } from "@/features/laboratory/types/laboratory-catalog.types";
import { formatLabDisplayDateTime } from "@/features/laboratory/utils/format-lab-order";

type LabTestDetailHeaderProps = {
  test: LabTestDefinition;
  actions?: ReactNode;
};

export function LabTestDetailHeader({
  test,
  actions,
}: LabTestDetailHeaderProps) {
  const isActive = test.is_active !== false;
  const analyteCount = test.analytes?.length ?? 0;
  const facts = [
    { key: "code", label: "Code", value: test.code },
    test.category?.trim()
      ? { key: "category", label: "Category", value: test.category.trim() }
      : null,
    {
      key: "analytes",
      label: "Analytes",
      value: `${analyteCount} analyte${analyteCount === 1 ? "" : "s"}`,
    },
    test.turnaround_hours != null
      ? {
          key: "tat",
          label: "Turnaround",
          value: `${test.turnaround_hours}h TAT`,
        }
      : null,
    test.primary_specimen_type_code?.trim()
      ? {
          key: "specimen",
          label: "Specimen",
          value: test.primary_specimen_type_code.trim(),
        }
      : null,
    {
      key: "updated",
      label: "Updated",
      value: `Updated ${formatLabDisplayDateTime(test.updated_at)}`,
    },
  ].filter((item): item is { key: string; label: string; value: string } =>
    Boolean(item),
  );

  return (
    <DetailPageHeaderSection className="bg-white px-4 py-4 sm:px-6">
      <div
        className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3"
        data-testid="lab-test-detail-header"
      >
        <div className="flex min-w-0 items-center gap-3">
          <UserIdenticon
            seed={test.uuid || test.code || test.name}
            name={test.name}
            className="size-10 shrink-0 rounded-lg"
            fallbackClassName="rounded-lg text-sm font-semibold"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <DetailPageTitle className="truncate">{test.name}</DetailPageTitle>
              {isActive ? (
                <Badge
                  variant="outline"
                  className="rounded-full border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800"
                >
                  Active
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="rounded-full border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700"
                >
                  Inactive
                </Badge>
              )}
            </div>
            <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-dash-muted">
              {facts.map((item, index) => (
                <span
                  key={item.key}
                  className="inline-flex items-baseline gap-x-2"
                >
                  {index > 0 ? <span aria-hidden="true">·</span> : null}
                  <span>
                    <span className="sr-only">{item.label}: </span>
                    {item.value}
                  </span>
                </span>
              ))}
            </p>
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </DetailPageHeaderSection>
  );
}

"use client";

import type { ReactNode } from "react";

import { UserIdenticon } from "@/components/UserIdenticon";
import { Badge } from "@/components/ui/badge";
import {
  DetailPageHeaderSection,
  DetailPageTitle,
} from "@/features/app-shell/components/page-layout";
import type { LabPanel } from "@/features/laboratory/types/laboratory-catalog.types";
import { formatLabDisplayDateTime } from "@/features/laboratory/utils/format-lab-order";

type LabPanelDetailHeaderProps = {
  panel: LabPanel;
  actions?: ReactNode;
};

export function LabPanelDetailHeader({
  panel,
  actions,
}: LabPanelDetailHeaderProps) {
  const isActive = panel.is_active !== false;
  const testCount = panel.tests?.length ?? 0;
  const facts = [
    { key: "code", label: "Code", value: panel.code },
    {
      key: "tests",
      label: "Tests",
      value: `${testCount} test${testCount === 1 ? "" : "s"}`,
    },
    panel.product?.name
      ? { key: "product", label: "Product", value: panel.product.name }
      : null,
    {
      key: "updated",
      label: "Updated",
      value: `Updated ${formatLabDisplayDateTime(panel.updated_at)}`,
    },
  ].filter((item): item is { key: string; label: string; value: string } =>
    Boolean(item),
  );

  return (
    <DetailPageHeaderSection className="bg-white px-4 py-4 sm:px-6">
      <div
        className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3"
        data-testid="lab-panel-detail-header"
      >
        <div className="flex min-w-0 items-center gap-3">
          <UserIdenticon
            seed={panel.uuid || panel.code || panel.name}
            name={panel.name}
            className="size-10 shrink-0 rounded-lg"
            fallbackClassName="rounded-lg text-sm font-semibold"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <DetailPageTitle className="truncate">{panel.name}</DetailPageTitle>
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
            {facts.length > 0 ? (
              <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-dash-muted">
                {facts.map((item, index) => (
                  <span
                    key={item.key}
                    className="inline-flex items-baseline gap-x-2"
                  >
                    {index > 0 ? (
                      <span aria-hidden="true">·</span>
                    ) : null}
                    <span>
                      <span className="sr-only">{item.label}: </span>
                      {item.value}
                    </span>
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </DetailPageHeaderSection>
  );
}

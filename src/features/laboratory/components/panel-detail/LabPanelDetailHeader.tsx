"use client";

import { Calendar, FlaskConical, Hash } from "lucide-react";
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

  return (
    <DetailPageHeaderSection className="border-b-0 bg-white px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3.5 sm:gap-4">
          <UserIdenticon
            seed={panel.uuid || panel.code || panel.name}
            name={panel.name}
            className="size-12 shrink-0 rounded-lg shadow-2xs sm:size-14"
            fallbackClassName="text-base font-semibold sm:text-lg"
          />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <DetailPageTitle>{panel.name}</DetailPageTitle>

              <span className="inline-flex items-center rounded-md border border-slate-200/90 bg-slate-50 px-2.5 py-0.5 font-mono text-xs font-semibold text-brand-navy shadow-2xs">
                {panel.code}
              </span>

              {!isActive ? (
                <Badge
                  variant="outline"
                  className="rounded-full border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700"
                >
                  Inactive
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
                >
                  Active
                </Badge>
              )}
            </div>

            <p className="text-sm text-brand-muted">Laboratory panel</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
              <span className="inline-flex items-center gap-1.5">
                <FlaskConical className="size-3.5 shrink-0" aria-hidden="true" />
                {panel.tests?.length ?? 0} test
                {(panel.tests?.length ?? 0) === 1 ? "" : "s"}
              </span>
              {panel.product?.name ? (
                <span className="inline-flex items-center gap-1.5">
                  <Hash className="size-3.5 shrink-0" aria-hidden="true" />
                  {panel.product.name}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
                Updated {formatLabDisplayDateTime(panel.updated_at)}
              </span>
            </div>
          </div>
        </div>

        {actions ? <div className="ml-auto shrink-0">{actions}</div> : null}
      </div>
    </DetailPageHeaderSection>
  );
}

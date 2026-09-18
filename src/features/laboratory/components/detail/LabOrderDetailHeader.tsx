"use client";

import { Calendar, FlaskConical, Hash } from "lucide-react";
import type { ReactNode } from "react";

import {
  DetailPageDescription,
  DetailPageHeaderSection,
  DetailPageTitle,
} from "@/features/app-shell/components/page-layout";
import { LabOrderPriorityBadge } from "@/features/laboratory/components/LabOrderPriorityBadge";
import { LabOrderStatusBadge } from "@/features/laboratory/components/LabOrderStatusBadge";
import type { LabOrder } from "@/features/laboratory/types/laboratory.types";
import {
  formatLabAccession,
  formatLabDisplayDateTime,
  shortenUuid,
} from "@/features/laboratory/utils/format-lab-order";

type LabOrderDetailHeaderProps = {
  order: LabOrder;
  actions?: ReactNode;
};

export function LabOrderDetailHeader({
  order,
  actions,
}: LabOrderDetailHeaderProps) {
  return (
    <DetailPageHeaderSection className="border-b-0 bg-white px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <DetailPageTitle>
              Lab order {shortenUuid(order.uuid)}
            </DetailPageTitle>
            <LabOrderStatusBadge status={order.status} />
            <LabOrderPriorityBadge priority={order.priority} />
          </div>

          <DetailPageDescription className="font-mono">
            {formatLabAccession(order)}
          </DetailPageDescription>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
              Ordered {formatLabDisplayDateTime(order.ordered_at)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FlaskConical className="size-3.5 shrink-0" aria-hidden="true" />
              {order.clinic_name || "Clinic"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Hash className="size-3.5 shrink-0" aria-hidden="true" />
              {order.items.length} item{order.items.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {actions ? <div className="ml-auto shrink-0">{actions}</div> : null}
      </div>
    </DetailPageHeaderSection>
  );
}

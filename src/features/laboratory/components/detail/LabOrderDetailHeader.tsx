"use client";

import { Calendar, FlaskConical } from "lucide-react";
import type { ReactNode } from "react";

import { UserIdenticon } from "@/components/UserIdenticon";
import {
  DetailPageHeaderSection,
  DetailPageTitle,
} from "@/features/app-shell/components/page-layout";
import { LabOrderPriorityBadge } from "@/features/laboratory/components/LabOrderPriorityBadge";
import { LabOrderStatusBadge } from "@/features/laboratory/components/LabOrderStatusBadge";
import type { LabOrder } from "@/features/laboratory/types/laboratory.types";
import {
  formatLabAccession,
  formatLabOrderedRelative,
  formatLabPatientName,
} from "@/features/laboratory/utils/format-lab-order";
import { formatAge } from "@/lib/age";

type LabOrderDetailHeaderProps = {
  order: LabOrder;
  actions?: ReactNode;
};

export function LabOrderDetailHeader({
  order,
  actions,
}: LabOrderDetailHeaderProps) {
  const name = formatLabPatientName(order);
  const identifier = order.customer_identifier?.trim() || "—";
  const identiconSeed = order.customer_uuid || identifier || name;
  const ageLabel = formatAge(order.customer_dob);
  const accession = formatLabAccession(order);

  return (
    <DetailPageHeaderSection className="border-b-0 bg-white px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3.5 sm:gap-4">
          <UserIdenticon
            seed={identiconSeed}
            name={name}
            className="size-12 shrink-0 rounded-lg shadow-2xs sm:size-14"
            fallbackClassName="text-base font-semibold sm:text-lg"
          />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <DetailPageTitle>{name}</DetailPageTitle>
              {ageLabel !== "—" ? (
                <span className="text-sm font-normal text-brand-muted">
                  {ageLabel}
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <p className="text-sm text-brand-muted">
                {accession === "Not accessioned"
                  ? "Awaiting accession"
                  : `Accession ${accession}`}
              </p>
              <LabOrderStatusBadge status={order.status} />
              <LabOrderPriorityBadge priority={order.priority} />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
                Ordered {formatLabOrderedRelative(order.ordered_at)}
                {order.ordered_by_name ? ` · ${order.ordered_by_name}` : ""}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FlaskConical className="size-3.5 shrink-0" aria-hidden="true" />
                {order.clinic_name || "Clinic"}
              </span>
            </div>
          </div>
        </div>

        {actions ? <div className="ml-auto shrink-0">{actions}</div> : null}
      </div>
    </DetailPageHeaderSection>
  );
}

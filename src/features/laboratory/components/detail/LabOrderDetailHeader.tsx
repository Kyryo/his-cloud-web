"use client";

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
  const identifier = order.customer_identifier?.trim() || "";
  const identiconSeed = order.customer_uuid || identifier || name;
  const ageLabel = formatAge(order.customer_dob);
  const accession = formatLabAccession(order);
  const identity = [identifier || null, ageLabel !== "—" ? ageLabel : null]
    .filter(Boolean)
    .join(" · ");
  const facts = [
    {
      key: "accession",
      label: "Accession",
      value:
        accession === "Not accessioned"
          ? "Awaiting accession"
          : `Accession ${accession}`,
    },
    {
      key: "ordered",
      label: "Ordered",
      value: `Ordered ${formatLabOrderedRelative(order.ordered_at)}${
        order.ordered_by_name ? ` by ${order.ordered_by_name}` : ""
      }`,
    },
    order.clinic_name
      ? { key: "clinic", label: "Clinic", value: order.clinic_name }
      : null,
  ].filter((item): item is { key: string; label: string; value: string } =>
    Boolean(item),
  );

  return (
    <DetailPageHeaderSection className="bg-white px-4 py-4 sm:px-6">
      <div
        className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3"
        data-testid="lab-order-detail-header"
      >
        <div className="flex min-w-0 items-center gap-3">
          <UserIdenticon
            seed={identiconSeed}
            name={name}
            className="size-10 shrink-0 rounded-lg"
            fallbackClassName="rounded-lg text-sm font-semibold"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <DetailPageTitle className="truncate">{name}</DetailPageTitle>
              <LabOrderStatusBadge status={order.status} />
              <LabOrderPriorityBadge priority={order.priority} />
            </div>
            {identity ? (
              <p className="mt-0.5 truncate text-sm text-dash-muted">
                {identity}
              </p>
            ) : null}
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

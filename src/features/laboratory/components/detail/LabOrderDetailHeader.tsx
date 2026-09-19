"use client";

import { Calendar, FlaskConical } from "lucide-react";
import Link from "next/link";
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
  formatLabDisplayDateTime,
  formatLabPatientName,
} from "@/features/laboratory/utils/format-lab-order";
import { ROUTES } from "@/constants/routes";

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
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <DetailPageTitle>
                <Link
                  href={ROUTES.customerDetail(order.customer_uuid)}
                  className="hover:text-brand-primary"
                >
                  {name}
                </Link>
              </DetailPageTitle>

              <span className="inline-flex items-center rounded-md border border-slate-200/90 bg-slate-50 px-2.5 py-0.5 font-mono text-xs font-semibold text-brand-navy shadow-2xs">
                {identifier}
              </span>

              <LabOrderStatusBadge status={order.status} />
              <LabOrderPriorityBadge priority={order.priority} />
            </div>

            <p className="text-sm text-brand-muted">
              {formatLabAccession(order) === "Not accessioned"
                ? "Awaiting accession"
                : `Accession ${formatLabAccession(order)}`}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
                Ordered {formatLabDisplayDateTime(order.ordered_at)}
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

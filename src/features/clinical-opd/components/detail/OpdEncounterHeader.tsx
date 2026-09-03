"use client";

import { Building2, Calendar, CreditCard, Hash, Mail, Phone } from "lucide-react";
import type { ReactNode } from "react";

import { ClientAvatar } from "@/components/client-avatar";
import { Badge } from "@/components/ui/badge";
import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { OpdEncounterStatusBadge } from "@/features/clinical-opd/components/OpdEncounterStatusBadge";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { formatOpdEncounterPaymentLabel } from "@/features/clinical-opd/utils/format-opd-encounter-payment";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  formatAdaptiveAge,
  formatCustomerName,
  formatDisplayDate,
  formatDisplayDateTime,
} from "@/features/customers/utils/format-customer";

type OpdEncounterHeaderProps = {
  customer: Customer | null;
  actions?: ReactNode;
};

export function OpdEncounterHeader({
  customer,
  actions,
}: OpdEncounterHeaderProps) {
  const { encounter } = useOpdEncounterWorkspace();
  const fullName = customer
    ? formatCustomerName(customer)
    : (encounter?.customer_name ?? "OPD encounter");
  const ageDisplay = customer ? formatAdaptiveAge(customer.dob) : null;

  return (
    <DetailPageHeaderSection className="border-b border-dash-border/80 bg-white px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3.5 sm:gap-4">
          <ClientAvatar
            name={fullName}
            className="size-12 shrink-0 text-base font-semibold shadow-2xs ring-2 ring-dash-border/70 sm:size-14 sm:text-lg"
          />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <h1 className="truncate text-lg font-bold tracking-tight text-brand-navy sm:text-2xl">
                {fullName}
              </h1>

              {customer?.customer_identifier ? (
                <span className="inline-flex items-center rounded-md border border-slate-200/90 bg-slate-50 px-2.5 py-0.5 font-mono text-xs font-semibold text-brand-navy shadow-2xs">
                  {customer.customer_identifier}
                </span>
              ) : null}

              {customer?.gender ? (
                <Badge
                  variant={customer.gender === "Male" ? "default" : "secondary"}
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                >
                  {customer.gender}
                </Badge>
              ) : null}

              {encounter?.status ? (
                <OpdEncounterStatusBadge status={encounter.status} />
              ) : null}

              {encounter?.status === "in_progress" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/90 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 shadow-2xs">
                  <span className="relative flex size-2 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                  </span>
                  Active encounter
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-brand-slate sm:text-sm">
              {ageDisplay ? (
                <span className="font-medium text-brand-navy">
                  {ageDisplay}
                  {customer?.dob_is_estimated ? " (est.)" : ""}
                  {customer?.dob ? (
                    <span className="ml-1 font-normal text-brand-muted">
                      · DOB: {formatDisplayDate(customer.dob)}
                    </span>
                  ) : null}
                </span>
              ) : null}

              {customer?.phone_number ? (
                <a
                  href={`tel:${customer.phone_number}`}
                  className="inline-flex items-center gap-1.5 text-brand-slate transition-colors hover:text-brand-primary hover:underline"
                >
                  <Phone className="size-3.5 text-brand-muted" aria-hidden="true" />
                  <span>{customer.phone_number}</span>
                </a>
              ) : null}

              {customer?.email ? (
                <a
                  href={`mailto:${customer.email}`}
                  className="inline-flex items-center gap-1.5 text-brand-slate transition-colors hover:text-brand-primary hover:underline"
                >
                  <Mail className="size-3.5 text-brand-muted" aria-hidden="true" />
                  <span>{customer.email}</span>
                </a>
              ) : null}

              {customer?.internal_reference ? (
                <span className="inline-flex items-center gap-1 font-mono text-xs text-brand-muted">
                  <Hash className="size-3.5" aria-hidden="true" />
                  <span>{customer.internal_reference}</span>
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-muted">
              {encounter?.department_name ? (
                <span className="inline-flex items-center gap-1.5">
                  <Building2
                    className="size-3.5 shrink-0 text-brand-muted"
                    aria-hidden="true"
                  />
                  <span>{encounter.department_name}</span>
                </span>
              ) : null}

              {encounter?.started_at ? (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar
                    className="size-3.5 shrink-0 text-brand-muted"
                    aria-hidden="true"
                  />
                  <span>Started {formatDisplayDateTime(encounter.started_at)}</span>
                </span>
              ) : null}

              {encounter ? (
                <span className="inline-flex items-center gap-1.5">
                  <CreditCard
                    className="size-3.5 shrink-0 text-brand-muted"
                    aria-hidden="true"
                  />
                  <span>{formatOpdEncounterPaymentLabel(encounter)}</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </DetailPageHeaderSection>
  );
}

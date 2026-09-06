"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { SecondaryButton } from "@/components/ui/app-buttons";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { fetchCustomer } from "@/features/customers/services/customers.service";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  formatAdaptiveAge,
  formatCustomerName,
  formatDisplayDateTime,
} from "@/features/customers/utils/format-customer";
import { formatCustomerVisitStatusLabel } from "@/features/customers/utils/customer-visit-status";
import { formatVisitStartedBy } from "@/features/customers/utils/format-visit-started-by";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { fetchVisit } from "@/features/visits/services/visits.service";
import type { VisitDetail } from "@/features/visits/types/visit.types";
import { ROUTES } from "@/constants/routes";

type ClaimDetailClientTabProps = {
  claim: ClaimDetail;
  isActive: boolean;
};

function RecordSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
        {title}
      </h3>
      <div className="mt-3 divide-y divide-dash-border/60">{children}</div>
    </section>
  );
}

function RecordRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 first:pt-0">
      <dt className="shrink-0 text-sm text-brand-muted">{label}</dt>
      <dd className="text-right text-sm text-brand-navy">{value}</dd>
    </div>
  );
}

function ClientTabSkeleton() {
  return (
    <div className="space-y-6" data-testid="claim-detail-client-visit-tab">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

function VisitRows({ visit }: { visit: VisitDetail | null }) {
  return (
    <>
      <RecordRow
        label="Visit date"
        value={visit?.visit_date ? formatDisplayDateTime(visit.visit_date) : "—"}
      />
      <RecordRow label="Clinic" value={visit?.clinic_name || "—"} />
      <RecordRow
        label="Started by"
        value={visit ? formatVisitStartedBy(visit) : "—"}
      />
    </>
  );
}

export function ClaimDetailClientTab({
  claim,
  isActive,
}: ClaimDetailClientTabProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const customerUuid = claim.customer_uuid?.trim() || "";
  const visitUuid = claim.visit_uuid?.trim() || "";

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setHasLoaded(false);
      setIsLoading(true);
      setLoadError(null);

      const customerPromise = customerUuid
        ? fetchCustomer(customerUuid)
            .then((record) => ({ ok: true as const, record }))
            .catch((error: unknown) => ({
              ok: false as const,
              message:
                error instanceof Error
                  ? error.message
                  : "Failed to load client details.",
            }))
        : Promise.resolve(null);

      const visitPromise = visitUuid
        ? fetchVisit(visitUuid)
            .then((record) => record)
            .catch(() => null)
        : Promise.resolve(null);

      const [customerResult, visitResult] = await Promise.all([
        customerPromise,
        visitPromise,
      ]);

      if (cancelled) {
        return;
      }

      if (customerResult === null) {
        setCustomer(null);
        setLoadError(null);
      } else if (customerResult.ok) {
        setCustomer(customerResult.record);
        setLoadError(null);
      } else {
        setCustomer(null);
        setLoadError(customerResult.message);
      }

      setVisit(visitResult);
      setIsLoading(false);
      setHasLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [isActive, customerUuid, visitUuid]);

  if (!isActive) {
    return null;
  }

  if (isLoading || !hasLoaded) {
    return <ClientTabSkeleton />;
  }

  if (!customerUuid) {
    return (
      <div className="space-y-8" data-testid="claim-detail-client-visit-tab">
        <CustomerDetailTabEmptyState
          icon={UserRound}
          title="Client profile unavailable"
          description="The full client profile could not be loaded for this claim."
          data-testid="claim-detail-client-empty-state"
        />
        <RecordSection title="Visit">
          <RecordRow label="Client" value={claim.customer_name || "—"} />
          <VisitRows visit={visit} />
        </RecordSection>
      </div>
    );
  }

  if (loadError || !customer) {
    return (
      <div className="space-y-8" data-testid="claim-detail-client-visit-tab">
        <CustomerDetailTabEmptyState
          icon={UserRound}
          title="Client unavailable"
          description={
            loadError ??
            "The linked client could not be loaded. The record may have been removed or you may not have access."
          }
          data-testid="claim-detail-client-unavailable-state"
        />
        <RecordSection title="Visit">
          <VisitRows visit={visit} />
        </RecordSection>
      </div>
    );
  }

  const fullName = formatCustomerName(customer);
  const phone = customer.phone_number?.trim() || "";
  const email = customer.email?.trim() || "";

  return (
    <div className="space-y-8" data-testid="claim-detail-client-visit-tab">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-brand-navy">
            {fullName}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {customer.customer_identifier ? (
              <Badge variant="outline" className="font-mono font-normal">
                {customer.customer_identifier}
              </Badge>
            ) : null}
            {customer.gender ? (
              <Badge variant="secondary" className="font-normal">
                {customer.gender}
              </Badge>
            ) : null}
            {!customer.is_active ? (
              <Badge variant="outline" className="font-normal">
                Inactive
              </Badge>
            ) : null}
          </div>
        </div>
        <SecondaryButton asChild className="shrink-0">
          <Link href={ROUTES.customerDetail(customer.uuid)}>View client</Link>
        </SecondaryButton>
      </div>

      {phone || email ? (
        <RecordSection title="Contact">
          {phone ? (
            <RecordRow
              label="Phone"
              value={
                <a
                  href={`tel:${phone}`}
                  className="underline-offset-4 hover:underline"
                >
                  {phone}
                </a>
              }
            />
          ) : null}
          {email ? (
            <RecordRow
              label="Email"
              value={
                <a
                  href={`mailto:${email}`}
                  className="break-all underline-offset-4 hover:underline"
                >
                  {email}
                </a>
              }
            />
          ) : null}
        </RecordSection>
      ) : null}

      <RecordSection title="Visit">
        <RecordRow label="Age" value={formatAdaptiveAge(customer.dob)} />
        <RecordRow
          label="Visit status"
          value={formatCustomerVisitStatusLabel(customer.visit_status)}
        />
        <VisitRows visit={visit} />
      </RecordSection>
    </div>
  );
}

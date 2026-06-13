"use client";

import { useCallback, useEffect, useState } from "react";

import {
  PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS,
  PageLoader,
} from "@/components/page-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DetailPageLayout,
  DetailPageMainSection,
  DetailPageTabsNavSection,
  DetailPageTabNavItem,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";
import { CustomerVisitStatusBadge } from "@/features/customers/components/CustomerVisitStatusBadge";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { formatVisitStartedBy } from "@/features/customers/utils/format-visit-started-by";
import {
  closeVisit,
  fetchVisit,
  runVisitEncounterAction,
} from "@/features/visits/services/visits.service";
import type { VisitDetail, VisitEncounter } from "@/features/visits/types/visit.types";
import { useToast } from "@/providers/toast-provider";

type VisitDetailPageProps = {
  visitUuid: string;
};

function EncounterStatusBadge({ status }: { status: string }) {
  const variant =
    status === "completed"
      ? "outline"
      : status === "in_progress"
        ? "default"
        : status === "cancelled"
          ? "destructive"
          : "secondary";

  return <Badge variant={variant}>{status.replaceAll("_", " ")}</Badge>;
}

function canRunEncounterAction(encounter: VisitEncounter, action: "start" | "complete" | "cancel") {
  if (action === "start") {
    return encounter.status === "waiting";
  }
  if (action === "complete") {
    return encounter.status === "in_progress";
  }
  return ["waiting", "in_progress"].includes(encounter.status);
}

export function VisitDetailPage({ visitUuid }: VisitDetailPageProps) {
  const { toast } = useToast();
  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionKey, setActionKey] = useState<string | null>(null);

  useAppBreadcrumb(visit?.customer_name ?? null);

  const loadVisit = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchVisit(visitUuid);
      setVisit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load visit.");
    } finally {
      setIsLoading(false);
    }
  }, [visitUuid]);

  useEffect(() => {
    void loadVisit();
  }, [loadVisit]);

  const handleEncounterAction = async (
    encounter: VisitEncounter,
    action: "start" | "complete" | "cancel",
  ) => {
    if (!visit) {
      return;
    }

    setActionKey(`${encounter.uuid}:${action}`);

    try {
      await runVisitEncounterAction(visit.uuid, encounter.uuid, action);
      toast({
        variant: "success",
        title: "Encounter updated",
        description: `Encounter marked as ${action.replaceAll("_", " ")}.`,
      });
      await loadVisit();
    } catch (err) {
      toast({
        variant: "error",
        title: "Action could not be completed",
        description: err instanceof Error ? err.message : "Try again.",
      });
    } finally {
      setActionKey(null);
    }
  };

  const handleCloseVisit = async () => {
    if (!visit) {
      return;
    }

    try {
      await closeVisit(visit.uuid);
      toast({
        variant: "success",
        title: "Visit closed",
        description: "The visit has been completed.",
      });
      await loadVisit();
    } catch (err) {
      toast({
        variant: "error",
        title: "Could not close visit",
        description: err instanceof Error ? err.message : "Try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className={PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS}>
        <PageLoader />
      </div>
    );
  }

  if (error || !visit) {
    return (
      <DetailPageLayout>
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-sm text-red-700">
          {error ?? "Visit not found."}
        </div>
      </DetailPageLayout>
    );
  }

  return (
    <DetailPageLayout data-testid="visit-detail-page">
      <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-brand-muted">Visit</p>
            <h1 className="text-2xl font-semibold text-brand-navy">{visit.customer_name}</h1>
            <p className="mt-1 text-sm text-brand-muted">
              {visit.customer_identifier} · {formatDisplayDateTime(visit.visit_date)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <CustomerVisitStatusBadge status={visit.status} />
            {visit.status === "active" ? (
              <Button variant="destructive" onClick={() => void handleCloseVisit()}>
                Close visit
              </Button>
            ) : null}
          </div>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-brand-muted">Consultation service</dt>
            <dd className="mt-1 text-sm font-medium text-brand-navy">
              {visit.consultation_service_name || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-brand-muted">Clinic</dt>
            <dd className="mt-1 text-sm font-medium text-brand-navy">
              {visit.clinic_name || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-brand-muted">Payment</dt>
            <dd className="mt-1 text-sm font-medium capitalize text-brand-navy">
              {visit.mode_of_payment}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-brand-muted">Started by</dt>
            <dd className="mt-1 text-sm font-medium text-brand-navy">
              {formatVisitStartedBy(visit)}
            </dd>
          </div>
        </dl>
      </div>

      <DetailPageTabsSection className="mt-6">
        <DetailPageTabsNavSection aria-label="Visit sections">
          <DetailPageTabNavItem isActive onClick={() => undefined}>
            Encounters
          </DetailPageTabNavItem>
        </DetailPageTabsNavSection>

        <DetailPageMainSection>
          <div className="rounded-2xl border border-brand-border bg-white">
            <div className="border-b border-brand-border px-6 py-4">
              <h2 className="text-base font-semibold text-brand-navy">Encounters</h2>
              <p className="text-sm text-brand-muted">
                Department-level clinical units inside this visit.
              </p>
            </div>

            {visit.encounters.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-brand-muted">
                No encounters recorded for this visit yet.
              </div>
            ) : (
              <div className="divide-y divide-brand-border">
                {visit.encounters.map((encounter) => (
                  <div
                    key={encounter.uuid}
                    className="flex flex-wrap items-start justify-between gap-4 px-6 py-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-brand-navy">
                          {encounter.department_name}
                        </p>
                        <EncounterStatusBadge status={encounter.status} />
                      </div>
                      <p className="mt-1 text-sm text-brand-muted">
                        {encounter.location_name || "No location"} ·{" "}
                        {encounter.clinician_name || "Unassigned clinician"}
                      </p>
                      {encounter.started_at ? (
                        <p className="mt-1 text-xs text-brand-muted">
                          Started {formatDisplayDateTime(encounter.started_at)}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {canRunEncounterAction(encounter, "start") ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionKey === `${encounter.uuid}:start`}
                          onClick={() => void handleEncounterAction(encounter, "start")}
                        >
                          Start
                        </Button>
                      ) : null}
                      {canRunEncounterAction(encounter, "complete") ? (
                        <Button
                          size="sm"
                          disabled={actionKey === `${encounter.uuid}:complete`}
                          onClick={() => void handleEncounterAction(encounter, "complete")}
                        >
                          Complete
                        </Button>
                      ) : null}
                      {canRunEncounterAction(encounter, "cancel") ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={actionKey === `${encounter.uuid}:cancel`}
                          onClick={() => void handleEncounterAction(encounter, "cancel")}
                        >
                          Cancel
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DetailPageMainSection>
      </DetailPageTabsSection>
    </DetailPageLayout>
  );
}

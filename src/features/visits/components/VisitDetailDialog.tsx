"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { StatusBanner } from "@/components/ui/status-banner";
import {
  DestructiveButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TabbedDialog } from "@/components/ui/tabbed-dialog";
import { ROUTES } from "@/constants/routes";
import { CustomerVisitStatusBadge } from "@/features/customers/components/CustomerVisitStatusBadge";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { formatVisitStartedBy } from "@/features/customers/utils/format-visit-started-by";
import { OpenEncountersCloseNotice } from "@/features/visits/components/OpenEncountersCloseNotice";
import {
  closeVisit,
  fetchVisit,
  runVisitEncounterAction,
} from "@/features/visits/services/visits.service";
import type { VisitDetail, VisitEncounter } from "@/features/visits/types/visit.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type VisitDetailDialogProps = {
  visitUuid: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVisitUpdated?: () => void;
};

type VisitDetailTab = "overview" | "encounters";

const TABS = [
  { id: "overview" as const, label: "Overview" },
  { id: "encounters" as const, label: "Encounters" },
];

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

function canRunEncounterAction(
  encounter: VisitEncounter,
  action: "start" | "complete" | "cancel",
) {
  if (action === "start") {
    return encounter.status === "waiting";
  }
  if (action === "complete") {
    return encounter.status === "in_progress";
  }
  return ["waiting", "in_progress"].includes(encounter.status);
}

export function VisitDetailDialog({
  visitUuid,
  open,
  onOpenChange,
  onVisitUpdated,
}: VisitDetailDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<VisitDetailTab>("overview");
  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionKey, setActionKey] = useState<string | null>(null);
  const [isClosingVisit, setIsClosingVisit] = useState(false);
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);

  const loadVisit = useCallback(async () => {
    if (!visitUuid) {
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);
      const data = await fetchVisit(visitUuid);
      setVisit(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load visit.");
      setVisit(null);
    } finally {
      setIsLoading(false);
    }
  }, [visitUuid]);

  useEffect(() => {
    if (!open || !visitUuid) {
      return;
    }

    setActiveTab("overview");
    setCloseConfirmOpen(false);
    setCloseError(null);
    void loadVisit();
  }, [loadVisit, open, visitUuid]);

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
      onVisitUpdated?.();
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

    setIsClosingVisit(true);
    setCloseError(null);

    try {
      await closeVisit(visit.uuid);
      toast({
        variant: "success",
        title: "Visit closed",
        description: "The visit has been completed.",
      });
      setCloseConfirmOpen(false);
      await loadVisit();
      onVisitUpdated?.();
    } catch (err) {
      const message =
        err instanceof BffError
          ? formatBffErrorMessage(err.message, err.errors)
          : err instanceof Error
            ? err.message
            : "Try again.";
      setCloseError(message);
      toast({
        variant: "error",
        title: "Could not close visit",
        description: message,
      });
    } finally {
      setIsClosingVisit(false);
    }
  };

  const dialogTitle = visit ? (
    <Link
      href={ROUTES.customerDetail(visit.customer)}
      className={cn(
        "inline-flex cursor-pointer text-brand-primary underline-offset-4 transition-colors",
        "hover:text-brand-primary/80 hover:underline",
      )}
      onClick={() => onOpenChange(false)}
    >
      {visit.customer_name}
    </Link>
  ) : (
    "Visit details"
  );

  const dialogDescription = visit
    ? `${visit.customer_identifier} · ${formatDisplayDateTime(visit.visit_date)}`
    : "Loading visit information...";

  return (
    <>
      <TabbedDialog
        open={open}
        onOpenChange={onOpenChange}
        title={dialogTitle}
        description={dialogDescription}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as VisitDetailTab)}
        className={appFont.className}
        data-testid="visit-detail-dialog"
        footer={
          <>
            <SecondaryButton
              type="button"
              disabled={isClosingVisit}
              onClick={() => onOpenChange(false)}
            >
              Close
            </SecondaryButton>
            {visit?.status === "active" ? (
              <DestructiveButton
                type="button"
                disabled={isClosingVisit || isLoading}
                onClick={() => setCloseConfirmOpen(true)}
              >
                Close visit
              </DestructiveButton>
            ) : null}
          </>
        }
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-brand-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading visit...
          </div>
        ) : loadError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700">
            {loadError}
          </div>
        ) : visit ? (
          activeTab === "overview" ? (
            <div className="space-y-4">
              <section className="rounded-xl border border-brand-border bg-slate-50/40 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-brand-navy">Visit status</p>
                    <p className="mt-1 text-xs text-brand-muted">
                      Current state of this clinic visit.
                    </p>
                  </div>
                  <CustomerVisitStatusBadge status={visit.status} />
                </div>
              </section>

              <section className="rounded-xl border border-brand-border bg-white p-4">
                <p className="text-sm font-medium text-brand-navy">Visit details</p>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
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
              </section>
            </div>
          ) : (
            <section className="overflow-hidden rounded-xl border border-brand-border bg-white">
              <div className="border-b border-brand-border px-4 py-3">
                <p className="text-sm font-medium text-brand-navy">Encounters</p>
                <p className="text-xs text-brand-muted">
                  Department-level clinical units inside this visit.
                </p>
              </div>

              {visit.encounters.length === 0 ? (
                <div className="px-4 py-12 text-center text-sm text-brand-muted">
                  No encounters recorded for this visit yet.
                </div>
              ) : (
                <div className="divide-y divide-brand-border">
                  {visit.encounters.map((encounter) => (
                    <div
                      key={encounter.uuid}
                      className="flex flex-wrap items-start justify-between gap-4 px-4 py-4"
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
            </section>
          )
        ) : null}
      </TabbedDialog>

      <Dialog
        open={closeConfirmOpen}
        onOpenChange={(nextOpen) => {
          setCloseConfirmOpen(nextOpen);
          if (!nextOpen) {
            setCloseError(null);
          }
        }}
      >
        <DialogContent className={cn("sm:max-w-md", appFont.className)}>
          <DialogHeader>
            <DialogTitle>Close this visit?</DialogTitle>
            <DialogDescription>
              {visit
                ? `This will complete ${visit.customer_name}'s active visit.`
                : "This will complete the active visit."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <OpenEncountersCloseNotice
              encounters={visit?.encounters}
              appointmentLinked={Boolean(visit?.appointment)}
            />
            {closeError ? <StatusBanner variant="error" message={closeError} /> : null}
          </div>

          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isClosingVisit}
              onClick={() => setCloseConfirmOpen(false)}
            >
              Keep visit open
            </SecondaryButton>
            <DestructiveButton
              type="button"
              disabled={isClosingVisit}
              onClick={() => void handleCloseVisit()}
              data-testid="visit-close-confirm-button"
            >
              {isClosingVisit ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Closing...
                </>
              ) : (
                "Close visit"
              )}
            </DestructiveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

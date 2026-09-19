"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { PrimaryButton } from "@/components/ui/app-buttons";
import { ROUTES } from "@/constants/routes";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { opdEncounterLandingHref } from "@/features/clinical-opd/utils/opd-encounter-tabs";
import type { Customer } from "@/features/customers/types/customer.types";
import { AddVisitEncounterDialog } from "@/features/visits/components/AddVisitEncounterDialog";
import { closeVisit, fetchVisit } from "@/features/visits/services/visits.service";
import type { VisitDetail, VisitEncounter } from "@/features/visits/types/visit.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { useToast } from "@/providers/toast-provider";

type OpdEncounterActionsProps = {
  customer: Customer | null;
  className?: string;
};

export function OpdEncounterActions({
  customer,
  className,
}: OpdEncounterActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { visitUuid, isChartLocked, capabilities, userRole } =
    useOpdEncounterWorkspace();
  const [visitDetail, setVisitDetail] = useState<VisitDetail | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingVisit, setIsLoadingVisit] = useState(false);
  const [isClosingVisit, setIsClosingVisit] = useState(false);

  const canAddEncounter = Boolean(visitUuid) && !isChartLocked;
  const canCloseVisit = Boolean(visitUuid) && !isChartLocked;

  async function handleOpenAddEncounter() {
    try {
      setIsLoadingVisit(true);
      const visit = await fetchVisit(visitUuid);
      if (visit.status !== "active") {
        toast({
          title: "Visit is not active",
          description: "Encounters can only be added to active visits.",
          variant: "error",
        });
        return;
      }
      setVisitDetail(visit);
      setIsDialogOpen(true);
    } catch (error) {
      toast({
        title: "Could not load visit",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : "Unable to open add encounter.",
        variant: "error",
      });
    } finally {
      setIsLoadingVisit(false);
    }
  }

  async function handleCloseVisit() {
    try {
      setIsClosingVisit(true);
      await closeVisit(visitUuid);
      await queryClient.invalidateQueries({ queryKey: ["opd-queue"] });
      await queryClient.invalidateQueries({ queryKey: ["visit", visitUuid] });
      toast({
        title: "Visit closed",
        description: "The visit was completed. Chart writes are now locked.",
        variant: "success",
      });
      router.push(ROUTES.clinicalOpd);
    } catch (error) {
      toast({
        title: "Could not close visit",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : "Unable to close this visit.",
        variant: "error",
      });
    } finally {
      setIsClosingVisit(false);
    }
  }

  async function handleCreated(created: VisitEncounter) {
    await queryClient.invalidateQueries({ queryKey: ["opd-queue"] });
    setIsDialogOpen(false);
    setVisitDetail(null);
    if (created.department_type === "opd") {
      router.push(
        opdEncounterLandingHref(
          created.visit,
          created.uuid,
          capabilities,
          userRole,
        ),
      );
    }
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {customer ? (
          <Link
            href={ROUTES.customerDetail(customer.uuid)}
            className="text-sm text-brand-slate hover:text-brand-navy hover:underline"
            data-testid="opd-encounter-view-client-button"
          >
            Client
          </Link>
        ) : null}
        {canAddEncounter ? (
          <button
            type="button"
            disabled={isLoadingVisit}
            className="text-sm text-brand-slate hover:text-brand-navy disabled:opacity-50"
            onClick={() => {
              void handleOpenAddEncounter();
            }}
            data-testid="opd-encounter-add-encounter-button"
          >
            Add encounter
          </button>
        ) : null}
        {canCloseVisit ? (
          <PrimaryButton
            type="button"
            disabled={isClosingVisit}
            onClick={() => {
              void handleCloseVisit();
            }}
            data-testid="opd-encounter-close-visit-button"
          >
            Close visit
          </PrimaryButton>
        ) : null}
      </div>

      {visitDetail ? (
        <AddVisitEncounterDialog
          visit={visitDetail}
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setVisitDetail(null);
            }
          }}
          onCreated={(created) => {
            void handleCreated(created);
          }}
        />
      ) : null}
    </div>
  );
}

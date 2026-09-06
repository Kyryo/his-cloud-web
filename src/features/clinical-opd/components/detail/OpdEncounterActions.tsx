"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Plus } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { ROUTES } from "@/constants/routes";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import type { Customer } from "@/features/customers/types/customer.types";
import { AddVisitEncounterDialog } from "@/features/visits/components/AddVisitEncounterDialog";
import { fetchVisit } from "@/features/visits/services/visits.service";
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
  const { visitUuid } = useOpdEncounterWorkspace();
  const [visitDetail, setVisitDetail] = useState<VisitDetail | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingVisit, setIsLoadingVisit] = useState(false);

  const canAddEncounter = Boolean(visitUuid);

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

  async function handleCreated(created: VisitEncounter) {
    await queryClient.invalidateQueries({ queryKey: ["opd-queue"] });
    setIsDialogOpen(false);
    setVisitDetail(null);
    if (created.department_type === "opd") {
      router.push(ROUTES.clinicalOpdEncounter(created.visit, created.uuid));
    }
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {canAddEncounter ? (
          <SecondaryButton
            type="button"
            className="inline-flex items-center gap-1.5"
            disabled={isLoadingVisit}
            onClick={() => {
              void handleOpenAddEncounter();
            }}
            data-testid="opd-encounter-add-encounter-button"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            <span>Add encounter</span>
          </SecondaryButton>
        ) : null}

        {customer ? (
          <SecondaryButton asChild className="inline-flex items-center gap-1.5">
            <Link
              href={ROUTES.customerDetail(customer.uuid)}
              data-testid="opd-encounter-view-client-button"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              <span>View client</span>
            </Link>
          </SecondaryButton>
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

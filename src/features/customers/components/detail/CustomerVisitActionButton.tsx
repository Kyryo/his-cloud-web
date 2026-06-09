"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DestructiveButton, PrimaryButton } from "@/components/ui/app-buttons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CustomerVisitDialog } from "@/features/customers/components/detail/CustomerVisitDialog";
import { fetchOrganizationClinics } from "@/features/settings/services/settings.service";
import {
  fetchCustomerVisits,
  findActiveCustomerVisit,
} from "@/features/customers/services/customer-visits.service";
import type { CustomerVisit } from "@/features/customers/types/customer-visit.types";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  canCloseCustomerVisit,
  getCloseCustomerVisitTooltip,
} from "@/features/customers/utils/can-close-customer-visit";
import { isCustomerVisitActive } from "@/features/customers/utils/customer-visit-status";
import { useUser } from "@/providers/user-provider";

type CustomerVisitActionButtonProps = {
  customer: Customer;
  onVisitChanged: (visit: CustomerVisit) => void;
};

export function CustomerVisitActionButton({
  customer,
  onVisitChanged,
}: CustomerVisitActionButtonProps) {
  const { userData, isLoading: isUserLoading } = useUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeVisit, setActiveVisit] = useState<CustomerVisit | null>(null);
  const [clinicIdByUuid, setClinicIdByUuid] = useState<Map<string, number>>(
    new Map(),
  );
  const [isLoadingContext, setIsLoadingContext] = useState(false);

  const hasActiveVisit = isCustomerVisitActive(customer.visit_status);

  const loadVisitContext = useCallback(async () => {
    if (!hasActiveVisit) {
      setActiveVisit(null);
      return;
    }

    setIsLoadingContext(true);

    try {
      const [visits, clinicsResponse] = await Promise.all([
        fetchCustomerVisits(customer.uuid, { limit: 100 }),
        fetchOrganizationClinics(),
      ]);

      setActiveVisit(findActiveCustomerVisit(visits));
      setClinicIdByUuid(
        new Map(
          clinicsResponse.results.map((clinic) => [clinic.uuid, clinic.id]),
        ),
      );
    } catch {
      setActiveVisit(null);
    } finally {
      setIsLoadingContext(false);
    }
  }, [customer.uuid, hasActiveVisit]);

  useEffect(() => {
    void loadVisitContext();
  }, [loadVisitContext]);

  const canClose = useMemo(
    () => canCloseCustomerVisit(userData, activeVisit, clinicIdByUuid),
    [activeVisit, clinicIdByUuid, userData],
  );

  const closeTooltip = useMemo(
    () => getCloseCustomerVisitTooltip(userData, activeVisit, clinicIdByUuid),
    [activeVisit, clinicIdByUuid, userData],
  );

  const isButtonLoading = isUserLoading || (hasActiveVisit && isLoadingContext);
  const isCloseDisabled = hasActiveVisit && !isButtonLoading && !canClose;

  const button = hasActiveVisit ? (
    <DestructiveButton
      type="button"
      onClick={() => setDialogOpen(true)}
      disabled={isButtonLoading || isCloseDisabled}
      data-testid="customer-close-visit-button"
    >
      {isButtonLoading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading...
        </>
      ) : (
        "Close visit"
      )}
    </DestructiveButton>
  ) : (
    <PrimaryButton
      type="button"
      onClick={() => setDialogOpen(true)}
      disabled={isButtonLoading}
      data-testid="customer-start-visit-button"
    >
      {isButtonLoading ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading...
        </>
      ) : (
        "Start visit"
      )}
    </PrimaryButton>
  );

  return (
    <>
      {isCloseDisabled && closeTooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">{button}</span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">{closeTooltip}</TooltipContent>
        </Tooltip>
      ) : (
        button
      )}

      <CustomerVisitDialog
        customer={customer}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onVisitChanged={(visit) => {
          onVisitChanged(visit);
          void loadVisitContext();
        }}
      />
    </>
  );
}

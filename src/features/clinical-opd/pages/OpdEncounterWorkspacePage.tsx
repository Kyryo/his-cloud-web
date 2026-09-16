"use client";

import { useEffect, useMemo, useState } from "react";

import {
  DetailPageLayout,
  DetailPageNotFound,
  DetailPageSkeleton,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";
import { OpdEncounterActions } from "@/features/clinical-opd/components/detail/OpdEncounterActions";
import { OpdEncounterHeader } from "@/features/clinical-opd/components/detail/OpdEncounterHeader";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { OpdEncounterWorkspaceBody } from "@/features/clinical-opd/components/detail/OpdEncounterWorkspaceBody";
import { OpdEncounterWorkspaceProvider } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import {
  useMyClinicalCapabilities,
  useOpdQueue,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import { getVisibleOpdEncounterTabs } from "@/features/clinical-opd/utils/opd-encounter-tabs";
import { fetchCustomer } from "@/features/customers/services/customers.service";
import type { Customer } from "@/features/customers/types/customer.types";
import { formatCustomerName } from "@/features/customers/utils/format-customer";
import { useUser } from "@/providers/user-provider";

type OpdEncounterWorkspacePageProps = {
  visitUuid: string;
  encounterUuid: string;
  children: React.ReactNode;
};

export function OpdEncounterWorkspacePage({
  visitUuid,
  encounterUuid,
  children,
}: OpdEncounterWorkspacePageProps) {
  const { userData, isLoading: isUserLoading } = useUser();
  const { data: capabilitiesData, isLoading: isCapabilitiesLoading } =
    useMyClinicalCapabilities();
  const { data: queue = [], isLoading: isQueueLoading } = useOpdQueue();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isCustomerLoading, setIsCustomerLoading] = useState(false);

  const encounter = useMemo(
    () =>
      queue.find(
        (item) =>
          item.visit_uuid === visitUuid &&
          item.encounter_uuid === encounterUuid,
      ) ?? null,
    [encounterUuid, queue, visitUuid],
  );

  const userRole = userData?.user_role ?? null;
  const capabilities = capabilitiesData?.capabilities ?? [];
  const visibleTabs = getVisibleOpdEncounterTabs(capabilities);
  const visibleTabIds = visibleTabs.map((tab) => tab.id);

  const breadcrumbLabel = customer
    ? formatCustomerName(customer)
    : (encounter?.customer_name ?? "OPD encounter");

  useAppBreadcrumb(breadcrumbLabel);

  const hasAccess = (userData?.groups ?? []).includes("Clinical");

  useEffect(() => {
    const customerUuid = encounter?.customer_uuid;
    if (!customerUuid) {
      setCustomer(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsCustomerLoading(true);
      try {
        const data = await fetchCustomer(customerUuid);
        if (!cancelled) {
          setCustomer(data);
        }
      } catch {
        if (!cancelled) {
          setCustomer(null);
        }
      } finally {
        if (!cancelled) {
          setIsCustomerLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [encounter?.customer_uuid]);

  if (isUserLoading || isCapabilitiesLoading || isQueueLoading) {
    return (
      <DetailPageSkeleton
        tabCount={5}
        data-testid="opd-encounter-workspace-skeleton"
      />
    );
  }

  if (!hasAccess) {
    return (
      <DetailPageNotFound
        title="Access denied"
        message="You do not have access to the clinical module."
      />
    );
  }

  if (visibleTabIds.length === 0) {
    const clinicalRole = userData?.user_role;
    const roleMessage =
      clinicalRole === "nurse" || clinicalRole === "physician"
        ? "Your role does not have access to any OPD workspace tabs. Contact your administrator to update clinical role capabilities."
        : "Your clinical role is not assigned. Ask an administrator to set you as Nurse or Physician in Settings → EMR → Providers.";

    return (
      <DetailPageNotFound
        tone="warning"
        title="No workspace tabs available"
        message={roleMessage}
      />
    );
  }

  if (!encounter) {
    return (
      <DetailPageNotFound
        title="Encounter not found"
        message="This OPD encounter could not be loaded from the queue."
      />
    );
  }

  return (
    <OpdEncounterWorkspaceProvider
      value={{
        visitUuid,
        encounterUuid,
        encounter,
        customer,
        capabilities,
        visibleTabIds,
        userRole,
      }}
    >
      <DetailPageLayout data-testid="opd-encounter-workspace">
        <OpdEncounterHeader
          customer={customer}
          actions={<OpdEncounterActions customer={customer} />}
        />
        <DetailPageTabsSection>
          <OpdEncounterWorkspaceBody>
            {isCustomerLoading && !customer ? (
              <OpdEncounterTabSkeleton className="pt-4" rows={4} />
            ) : (
              children
            )}
          </OpdEncounterWorkspaceBody>
        </DetailPageTabsSection>
      </DetailPageLayout>
    </OpdEncounterWorkspaceProvider>
  );
}

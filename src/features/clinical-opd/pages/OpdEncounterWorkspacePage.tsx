"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileQuestion, Lock, ShieldAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DetailPageLayout,
  DetailPageSkeleton,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";
import { OpdEncounterHeader } from "@/features/clinical-opd/components/detail/OpdEncounterHeader";
import { OpdEncounterScheduleButton } from "@/features/clinical-opd/components/detail/OpdEncounterScheduleButton";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { OpdEncounterWorkspaceBody } from "@/features/clinical-opd/components/detail/OpdEncounterWorkspaceBody";
import { OpdEncounterWorkspaceProvider } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { OPD_WORKSPACE_CONFIG } from "@/features/clinical-opd/config/opd-workspace.config";
import {
  useEncounterChartSummary,
  useMyClinicalCapabilities,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import { opdEncounterFromVisit } from "@/features/clinical-opd/utils/opd-encounter-from-visit";
import { isOpdEncounterLocked } from "@/features/clinical-opd/utils/opd-encounter-tabs";
import { ClinicalWorkspaceConfigProvider } from "@/features/clinical-workspace/components/clinical-workspace-config-context";
import { useSpecialtyQueue } from "@/features/clinical-workspace/hooks/use-clinical-departments";
import type { ClinicalWorkspaceConfig } from "@/features/clinical-workspace/types/clinical-workspace.types";
import { getVisibleWorkspaceSections } from "@/features/clinical-workspace/utils/workspace-tabs";
import { fetchCustomer } from "@/features/customers/services/customers.service";
import type { Customer } from "@/features/customers/types/customer.types";
import { formatCustomerName } from "@/features/customers/utils/format-customer";
import { fetchVisit } from "@/features/visits/services/visits.service";
import { BffError } from "@/lib/bff-client";
import { useUser } from "@/providers/user-provider";

type WorkspaceStateScreenProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  "data-testid"?: string;
};

function WorkspaceStateScreen({
  icon,
  title,
  description,
  action,
  "data-testid": dataTestId,
}: WorkspaceStateScreenProps) {
  return (
    <DetailPageLayout data-testid={dataTestId}>
      <div className="flex min-h-full items-center justify-center bg-white">
        <EmptyState
          icon={icon}
          title={title}
          description={description}
          action={action}
        />
      </div>
    </DetailPageLayout>
  );
}

type OpdEncounterWorkspacePageProps = {
  visitUuid: string;
  encounterUuid: string;
  children: React.ReactNode;
  /** Specialty workspace to run; OPD when omitted. */
  config?: ClinicalWorkspaceConfig;
};

export function OpdEncounterWorkspacePage({
  visitUuid,
  encounterUuid,
  children,
  config = OPD_WORKSPACE_CONFIG,
}: OpdEncounterWorkspacePageProps) {
  const { specialty } = config;
  const { userData, isLoading: isUserLoading } = useUser();
  const { data: capabilitiesData, isLoading: isCapabilitiesLoading } =
    useMyClinicalCapabilities();
  const visitQuery = useQuery({
    queryKey: ["visit", visitUuid],
    queryFn: () => fetchVisit(visitUuid),
    enabled: Boolean(visitUuid),
  });
  const chartQuery = useEncounterChartSummary(visitUuid, encounterUuid);
  const { data: queue = [] } = useSpecialtyQueue(specialty.code);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isCustomerLoading, setIsCustomerLoading] = useState(false);

  const queueRow = useMemo(
    () =>
      queue.find(
        (item) =>
          item.visit_uuid === visitUuid &&
          item.encounter_uuid === encounterUuid,
      ) ?? null,
    [encounterUuid, queue, visitUuid],
  );

  const encounter = useMemo(() => {
    if (visitQuery.data) {
      return opdEncounterFromVisit(visitQuery.data, encounterUuid, queueRow);
    }
    return queueRow;
  }, [encounterUuid, queueRow, visitQuery.data]);

  const userRole = userData?.user_role ?? null;
  const capabilities = capabilitiesData?.capabilities ?? [];
  const visibleSections = getVisibleWorkspaceSections(config, capabilities);
  const visibleTabIds = visibleSections.map((tab) => tab.id);
  const isChartLocked = isOpdEncounterLocked(encounter?.status);

  const breadcrumbLabel = customer
    ? formatCustomerName(customer)
    : (encounter?.customer_name ?? config.encounterNoun);

  useAppBreadcrumb(breadcrumbLabel);

  const hasAccess = (userData?.groups ?? []).includes(specialty.accessGroup);
  const customerUuid = visitQuery.data?.customer ?? encounter?.customer_uuid;

  useEffect(() => {
    let cancelled = false;

    async function loadCustomer() {
      await Promise.resolve();
      if (!customerUuid) {
        if (!cancelled) {
          setCustomer(null);
          setIsCustomerLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setIsCustomerLoading(true);
      }

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
    }

    void loadCustomer();

    return () => {
      cancelled = true;
    };
  }, [customerUuid]);

  if (isUserLoading || isCapabilitiesLoading || visitQuery.isLoading) {
    return (
      <DetailPageSkeleton
        tabCount={5}
        data-testid="opd-encounter-workspace-skeleton"
      />
    );
  }

  if (!hasAccess) {
    return (
      <WorkspaceStateScreen
        icon={ShieldAlert}
        title="Access denied"
        description={`You do not have access to the ${specialty.label} module. Ask an administrator to add you to the ${specialty.accessGroup} group.`}
        data-testid="opd-encounter-access-denied"
      />
    );
  }

  if (isNotDepartmentMember(chartQuery.error)) {
    return (
      <WorkspaceStateScreen
        icon={ShieldAlert}
        title="Not a member of this department"
        description={`You can only open encounters of ${specialty.label} departments you belong to. Ask an administrator to add you to this department.`}
        action={
          <SecondaryButton asChild>
            <Link href={specialty.basePath}>Back to {specialty.label} queue</Link>
          </SecondaryButton>
        }
        data-testid="opd-encounter-not-member"
      />
    );
  }

  if (visibleTabIds.length === 0) {
    const clinicalRole = userData?.user_role;
    const roleMessage =
      clinicalRole === "nurse" ||
      clinicalRole === "physician" ||
      clinicalRole === "dentist"
        ? `Your role does not have access to any ${specialty.label} workspace tabs. Contact your administrator to update clinical role capabilities.`
        : "Your clinical role is not assigned. Ask an administrator to set your clinical role in Settings → EMR → Providers.";

    return (
      <WorkspaceStateScreen
        icon={Lock}
        title="No workspace tabs available"
        description={roleMessage}
        data-testid="opd-encounter-no-tabs"
      />
    );
  }

  if (visitQuery.isError || !encounter) {
    return (
      <WorkspaceStateScreen
        icon={FileQuestion}
        title="Encounter not found"
        description={`This ${config.encounterNoun} could not be loaded. It may have been removed, or you may not have access.`}
        action={
          <SecondaryButton asChild>
            <Link href={specialty.basePath}>Back to {specialty.label} queue</Link>
          </SecondaryButton>
        }
        data-testid="opd-encounter-not-found"
      />
    );
  }

  return (
    <ClinicalWorkspaceConfigProvider config={config}>
      <OpdEncounterWorkspaceProvider
        value={{
          visitUuid,
          encounterUuid,
          encounter,
          customer,
          chartSummary: chartQuery.data ?? null,
          capabilities,
          visibleTabIds,
          userRole,
          isChartLocked,
        }}
      >
        <DetailPageLayout data-testid="opd-encounter-workspace">
          <OpdEncounterHeader
            customer={customer}
            actions={<OpdEncounterScheduleButton customer={customer} />}
          />
          <DetailPageTabsSection>
            <OpdEncounterWorkspaceBody>
              {isCustomerLoading && !customer ? (
                <OpdEncounterTabSkeleton rows={4} />
              ) : (
                children
              )}
            </OpdEncounterWorkspaceBody>
          </DetailPageTabsSection>
        </DetailPageLayout>
      </OpdEncounterWorkspaceProvider>
    </ClinicalWorkspaceConfigProvider>
  );
}

/** The API hides encounters outside the user's departments behind 404. */
function isNotDepartmentMember(error: unknown): boolean {
  return error instanceof BffError && error.status === 404;
}

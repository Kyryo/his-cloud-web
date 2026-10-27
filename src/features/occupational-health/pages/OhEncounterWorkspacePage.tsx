"use client";

import Link from "next/link";
import { FileQuestion, ShieldAlert } from "lucide-react";
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
import { OhEncounterHeader } from "@/features/occupational-health/components/OhEncounterHeader";
import {
  OH_ENCOUNTER_TABS,
  OhEncounterTabs,
} from "@/features/occupational-health/components/OhEncounterTabs";
import { OhEncounterWorkspaceBody } from "@/features/occupational-health/components/OhEncounterWorkspaceBody";
import { useOhEncounterTabParam } from "@/features/occupational-health/hooks/use-oh-encounter-tab-param";
import {
  useEmploymentEpisodes,
  useOhEncounterWorkspaceData,
} from "@/features/occupational-health/hooks/use-occupational-health";
import { fetchOhEncounters } from "@/features/occupational-health/services/oh.service";
import type { OhVisitEncounter } from "@/features/occupational-health/types";
import { canAccessOccupationalHealth } from "@/features/occupational-health/utils/oh-access";
import { fetchCustomer } from "@/features/customers/services/customers.service";
import { formatCustomerName } from "@/features/customers/utils/format-customer";
import { fetchVisit } from "@/features/visits/services/visits.service";
import { ROUTES } from "@/constants/routes";
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

type OhEncounterWorkspacePageProps = {
  visitUuid: string;
  encounterUuid: string;
};

export function OhEncounterWorkspacePage({
  visitUuid,
  encounterUuid,
}: OhEncounterWorkspacePageProps) {
  const { userData, isLoading: isUserLoading } = useUser();
  const hasAccess = canAccessOccupationalHealth(userData);
  const [activeTab, setActiveTab] = useOhEncounterTabParam();

  const visitQuery = useQuery({
    queryKey: ["visit", visitUuid],
    queryFn: () => fetchVisit(visitUuid),
    enabled: Boolean(visitUuid) && hasAccess,
  });

  const encounterFromVisit: OhVisitEncounter | null =
    visitQuery.data?.encounters.find((item) => item.uuid === encounterUuid) ?? null;

  const fallbackEncounterQuery = useQuery({
    queryKey: ["oh-encounter", encounterUuid],
    queryFn: async () => {
      const rows = await fetchOhEncounters({ pageSize: 200 });
      return rows.find((row) => row.uuid === encounterUuid) ?? null;
    },
    enabled: hasAccess && visitQuery.isFetched && !encounterFromVisit,
  });

  const customerQuery = useQuery({
    queryKey: ["customer", visitQuery.data?.customer],
    queryFn: () => fetchCustomer(visitQuery.data!.customer),
    enabled: Boolean(visitQuery.data?.customer),
  });

  const encounter = encounterFromVisit ?? fallbackEncounterQuery.data ?? null;
  const workspace = useOhEncounterWorkspaceData(encounter?.id ?? null);
  const customer = customerQuery.data ?? null;
  const episodesQuery = useEmploymentEpisodes(customer?.uuid);

  useAppBreadcrumb(customer ? formatCustomerName(customer) : "OH encounter");

  const tabCounts = {
    exam: workspace.examinations.length,
    fitness: workspace.fitness.length,
    certificate: workspace.fitnessCertificates.length,
    iod: workspace.iodCases.length,
    findings: workspace.findings.length,
    employment: episodesQuery.data?.length ?? 0,
  };

  if (
    isUserLoading ||
    visitQuery.isLoading ||
    (!encounterFromVisit && fallbackEncounterQuery.isLoading)
  ) {
    return (
      <DetailPageSkeleton
        tabCount={OH_ENCOUNTER_TABS.length}
        data-testid="oh-encounter-workspace-skeleton"
      />
    );
  }

  if (!hasAccess) {
    return (
      <WorkspaceStateScreen
        icon={ShieldAlert}
        title="Access denied"
        description="You do not have access to occupational health. Ask an administrator to add you to the OccupationalHealth group."
        data-testid="oh-encounter-workspace"
      />
    );
  }

  if (!encounter) {
    return (
      <WorkspaceStateScreen
        icon={FileQuestion}
        title="Encounter not found"
        description="This occupational health encounter could not be loaded. It may have been removed, or you may not have access."
        action={
          <SecondaryButton asChild>
            <Link href={ROUTES.occupationalHealth}>Back to OH queue</Link>
          </SecondaryButton>
        }
        data-testid="oh-encounter-not-found"
      />
    );
  }

  return (
    <DetailPageLayout data-testid="oh-encounter-workspace">
      <div className="flex min-h-full flex-col xl:h-full">
        <OhEncounterHeader
          customer={customer}
          encounter={encounter}
          actions={
            <SecondaryButton asChild>
              <Link href={ROUTES.occupationalHealth}>OH queue</Link>
            </SecondaryButton>
          }
        />

        <DetailPageTabsSection className="xl:min-h-0">
          <OhEncounterTabs
            activeTab={activeTab}
            counts={tabCounts}
            onTabChange={setActiveTab}
            className="shrink-0"
          />
          <OhEncounterWorkspaceBody
            activeTab={activeTab}
            visitUuid={visitUuid}
            counts={tabCounts}
            encounter={encounter}
            customer={customer}
            tenantId={userData?.tenant?.id}
            workspace={workspace}
          />
        </DetailPageTabsSection>
      </div>
    </DetailPageLayout>
  );
}

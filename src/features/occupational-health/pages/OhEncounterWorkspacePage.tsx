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
} from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";
import { OhEncounterContextPanel } from "@/features/occupational-health/components/OhEncounterContextPanel";
import { OhEncounterHeader } from "@/features/occupational-health/components/OhEncounterHeader";
import { OhEncounterModuleNav } from "@/features/occupational-health/components/OhEncounterModuleNav";
import { OhRiskProfileRequiredEmptyState } from "@/features/occupational-health/components/OhRiskProfileRequiredEmptyState";
import { useOhEncounterModuleParam } from "@/features/occupational-health/hooks/use-oh-encounter-module-param";
import {
  useEmploymentEpisodes,
  useOhEncounterWorkspaceData,
} from "@/features/occupational-health/hooks/use-occupational-health";
import { fetchOhEncounters } from "@/features/occupational-health/services/oh.service";
import type { OhVisitEncounter } from "@/features/occupational-health/types";
import { canAccessOccupationalHealth } from "@/features/occupational-health/utils/oh-access";
import { customerHasActiveRiskProfile } from "@/features/occupational-health/utils/customer-has-risk-profile";
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
  const [activePanel, setActivePanel] = useOhEncounterModuleParam();

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
  const episodes = episodesQuery.data ?? [];

  useAppBreadcrumb(customer ? formatCustomerName(customer) : "OH encounter");

  const episodesLoading = Boolean(customer?.uuid) && episodesQuery.isLoading;
  const hasRiskProfile = customerHasActiveRiskProfile(episodes);
  const showRiskProfileEmpty =
    Boolean(customer?.uuid) &&
    !episodesLoading &&
    !hasRiskProfile &&
    activePanel !== "employment";

  if (
    isUserLoading ||
    visitQuery.isLoading ||
    (!encounterFromVisit && fallbackEncounterQuery.isLoading) ||
    episodesLoading
  ) {
    return (
      <DetailPageSkeleton
        tabCount={4}
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
            <Link href={ROUTES.occupationalHealth}>Back to OHS Queue</Link>
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
              <Link href={ROUTES.occupationalHealth}>OHS Queue</Link>
            </SecondaryButton>
          }
        />

        <div
          className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[17.5rem_minmax(0,1fr)] xl:grid-rows-[minmax(0,1fr)] 2xl:grid-cols-[19rem_minmax(0,1fr)]"
          data-testid="oh-encounter-module-layout"
        >
          <OhEncounterModuleNav
            activePanel={activePanel}
            onPanelChange={setActivePanel}
          />
          <section
            className="flex min-h-0 min-w-0 flex-col bg-white"
            aria-label="Occupational health content"
            data-testid="oh-encounter-context-panel"
          >
            {showRiskProfileEmpty ? (
              <OhRiskProfileRequiredEmptyState
                onManageEmployment={() => setActivePanel("employment")}
              />
            ) : (
              <OhEncounterContextPanel
                activePanel={activePanel}
                encounter={encounter}
                customer={customer}
                episodes={episodes}
                workspace={workspace}
              />
            )}
          </section>
        </div>
      </div>
    </DetailPageLayout>
  );
}

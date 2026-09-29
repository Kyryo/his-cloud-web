"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FileQuestion, ShieldAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DetailPageLayout,
  DetailPageMainSection,
  DetailPageSkeleton,
  DetailPageTabsSection,
} from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";
import { OhEncounterHeader } from "@/features/occupational-health/components/OhEncounterHeader";
import {
  OhEncounterTabs,
  type OhEncounterTabId,
} from "@/features/occupational-health/components/OhEncounterTabs";
import { OhExamTabPanel } from "@/features/occupational-health/components/OhExamTabPanel";
import { OhFindingsTabPanel } from "@/features/occupational-health/components/OhFindingsTabPanel";
import { OhFitnessTabPanel } from "@/features/occupational-health/components/OhFitnessTabPanel";
import { OhIodTabPanel } from "@/features/occupational-health/components/OhIodTabPanel";
import { useOhEncounterWorkspaceData } from "@/features/occupational-health/hooks/use-occupational-health";
import { fetchOhEncounters } from "@/features/occupational-health/services/oh.service";
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
  const hasAccess = (userData?.groups ?? []).includes("OccupationalHealth");
  const [activeTab, setActiveTab] = useState<OhEncounterTabId>("exam");

  const encounterQuery = useQuery({
    queryKey: ["oh-encounter", encounterUuid],
    queryFn: async () => {
      const rows = await fetchOhEncounters({ pageSize: 200 });
      return rows.find((row) => row.uuid === encounterUuid) ?? null;
    },
  });

  const visitQuery = useQuery({
    queryKey: ["visit", visitUuid],
    queryFn: () => fetchVisit(visitUuid),
    enabled: Boolean(visitUuid),
  });

  const customerQuery = useQuery({
    queryKey: ["customer", visitQuery.data?.customer],
    queryFn: () => fetchCustomer(visitQuery.data!.customer),
    enabled: Boolean(visitQuery.data?.customer),
  });

  const encounter = encounterQuery.data;
  const workspace = useOhEncounterWorkspaceData(encounter?.id ?? null);
  const customer = customerQuery.data ?? null;

  useAppBreadcrumb(
    customer ? formatCustomerName(customer) : "OH encounter",
  );

  const tabCounts = useMemo(
    () => ({
      exam: workspace.examinations.length,
      fitness: workspace.fitness.length + workspace.fitnessCertificates.length,
      iod: workspace.iodCases.length,
      findings: workspace.findings.length,
    }),
    [workspace],
  );

  if (isUserLoading || encounterQuery.isLoading || visitQuery.isLoading) {
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
            <Link href={ROUTES.occupationalHealth}>Back to OH queue</Link>
          </SecondaryButton>
        }
        data-testid="oh-encounter-not-found"
      />
    );
  }

  const tenantId = userData?.tenant?.id;

  return (
    <DetailPageLayout data-testid="oh-encounter-workspace">
      <OhEncounterHeader
        customer={customer}
        encounter={encounter}
        actions={
          <SecondaryButton asChild>
            <Link href={ROUTES.occupationalHealth}>OH queue</Link>
          </SecondaryButton>
        }
      />

      <DetailPageTabsSection>
        <div className="flex min-w-0 flex-1 flex-col">
          <OhEncounterTabs
            activeTab={activeTab}
            counts={tabCounts}
            onTabChange={setActiveTab}
          />
          <DetailPageMainSection className="max-w-3xl">
            {activeTab === "exam" ? (
              <OhExamTabPanel
                encounterId={encounter.id}
                examinations={workspace.examinations}
                onCreated={() => workspace.refetchAll()}
              />
            ) : null}
            {activeTab === "fitness" ? (
              <OhFitnessTabPanel
                examinations={workspace.examinations}
                assessments={workspace.fitness}
                certificates={workspace.fitnessCertificates}
                onCreated={() => workspace.refetchAll()}
              />
            ) : null}
            {activeTab === "iod" ? (
              customer && tenantId ? (
                <OhIodTabPanel
                  encounterId={encounter.id}
                  customerId={customer.id}
                  tenantId={tenantId}
                  iodCases={workspace.iodCases}
                  onCreated={() => workspace.refetchAll()}
                />
              ) : (
                <p className="text-sm text-brand-muted">
                  Client and tenant context are required for IOD cases.
                </p>
              )
            ) : null}
            {activeTab === "findings" ? (
              <OhFindingsTabPanel
                examinations={workspace.examinations}
                findings={workspace.findings}
                onCreated={() => workspace.refetchAll()}
              />
            ) : null}
          </DetailPageMainSection>
        </div>
      </DetailPageTabsSection>
    </DetailPageLayout>
  );
}

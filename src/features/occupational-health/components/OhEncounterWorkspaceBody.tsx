"use client";

import { useEffect, useState, type ReactNode } from "react";

import { SecondaryButton } from "@/components/ui/app-buttons";
import { Skeleton } from "@/components/ui/skeleton";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  OhColumnMessage,
  OhColumnPanel,
  OhEncounterColumns,
  OhPanelSection,
} from "@/features/occupational-health/components/OhEncounterColumns";
import { OhClinicalHistoryPanel } from "@/features/occupational-health/components/OhClinicalHistoryPanel";
import type { OhEncounterTabId } from "@/features/occupational-health/components/OhEncounterTabs";
import { OhExamFormSetupEmptyState } from "@/features/occupational-health/components/OhExamFormSetupEmptyState";
import { OhExamRecords } from "@/features/occupational-health/components/OhExamTabPanel";
import { OhProcedureChecklistPanel } from "@/features/occupational-health/components/OhProcedureChecklistPanel";
import { OhSchemaExamForm } from "@/features/occupational-health/components/OhSchemaExamForm";
import {
  OhFindingForm,
  OhFindingRecords,
} from "@/features/occupational-health/components/OhFindingsTabPanel";
import { newestFirst } from "@/features/occupational-health/utils/oh-format";
import { OhCertificateRecords } from "@/features/occupational-health/components/OhCertificateRecords";
import { OhCertificateForm } from "@/features/occupational-health/components/OhCertificateTabPanel";
import { OhEmploymentRecords } from "@/features/occupational-health/components/OhEmploymentRecords";
import { OhEmploymentForm } from "@/features/occupational-health/components/OhEmploymentTabPanel";
import { OhFitnessRecords } from "@/features/occupational-health/components/OhFitnessRecords";
import { OhFitnessForms } from "@/features/occupational-health/components/OhFitnessTabPanel";
import { OhIodRecords } from "@/features/occupational-health/components/OhIodRecords";
import { OhIodForm } from "@/features/occupational-health/components/OhIodTabPanel";
import type { useOhEncounterWorkspaceData } from "@/features/occupational-health/hooks/use-occupational-health";
import { fetchOhPublishedFormConfig } from "@/features/occupational-health/services/oh.service";
import type {
  OhPublishedFormConfig,
  OhVisitEncounter,
} from "@/features/occupational-health/types";

type OhWorkspaceData = ReturnType<typeof useOhEncounterWorkspaceData>;

const TAB_TITLES: Record<OhEncounterTabId, { form: string; records: string }> = {
  exam: { form: "Examination", records: "Examinations" },
  fitness: { form: "Fitness", records: "Fitness" },
  certificate: { form: "Certificate", records: "Certificates" },
  iod: { form: "New IOD case", records: "IOD cases" },
  findings: { form: "New finding", records: "Findings" },
  employment: { form: "Employment", records: "Employment" },
};

function hasPublishedExamForm(config: OhPublishedFormConfig | null) {
  return Boolean(
    config?.programme_code && (config.form?.sections?.length ?? 0) > 0,
  );
}

type OhEncounterWorkspaceBodyProps = {
  activeTab: OhEncounterTabId;
  visitUuid: string;
  counts: Record<OhEncounterTabId, number>;
  encounter: OhVisitEncounter;
  customer: Customer | null;
  tenantId: number | undefined;
  workspace: OhWorkspaceData;
};

export function OhEncounterWorkspaceBody({
  activeTab,
  visitUuid,
  counts,
  encounter,
  customer,
  tenantId,
  workspace,
}: OhEncounterWorkspaceBodyProps) {
  const titles = TAB_TITLES[activeTab];
  const onChanged = workspace.refetchAll;
  const [formConfig, setFormConfig] = useState<OhPublishedFormConfig | null>(
    null,
  );
  const [formConfigLoading, setFormConfigLoading] = useState(
    activeTab === "exam",
  );

  useEffect(() => {
    if (activeTab !== "exam") {
      return;
    }
    let active = true;
    async function load() {
      setFormConfigLoading(true);
      try {
        const config = await fetchOhPublishedFormConfig();
        if (active) {
          setFormConfig(config);
        }
      } catch {
        if (active) {
          setFormConfig(null);
        }
      } finally {
        if (active) {
          setFormConfigLoading(false);
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [activeTab]);

  if (activeTab === "exam") {
    if (workspace.isLoading || formConfigLoading) {
      return (
        <div className="flex flex-1 items-start bg-white px-4 py-4 sm:px-5">
          <ColumnSkeleton />
        </div>
      );
    }
    if (!hasPublishedExamForm(formConfig)) {
      return <OhExamFormSetupEmptyState />;
    }
  }

  return (
    <OhEncounterColumns
      sectionKey={activeTab}
      form={
        <OhColumnPanel eyebrow="Record" title={titles.form} className="bg-white">
          {workspace.isLoading ? (
            <ColumnSkeleton />
          ) : (
            <OhTabForm
              activeTab={activeTab}
              encounter={encounter}
              customer={customer}
              tenantId={tenantId}
              workspace={workspace}
              onChanged={onChanged}
            />
          )}
        </OhColumnPanel>
      }
      records={
        <OhColumnPanel
          eyebrow="This encounter"
          title={titles.records}
          count={counts[activeTab]}
          className="bg-white"
        >
          {workspace.isLoading ? (
            <ColumnSkeleton />
          ) : workspace.isError ? (
            <OhPanelSection>
              <div className="space-y-3" data-testid="oh-workspace-error">
                <OhColumnMessage tone="error">
                  Some encounter records could not be loaded.
                </OhColumnMessage>
                <SecondaryButton type="button" size="sm" onClick={onChanged}>
                  Try again
                </SecondaryButton>
              </div>
            </OhPanelSection>
          ) : (
            <OhTabRecords
              activeTab={activeTab}
              customer={customer}
              workspace={workspace}
              onChanged={onChanged}
            />
          )}
        </OhColumnPanel>
      }
      aside={
        <OhClinicalHistoryPanel
          visitUuid={visitUuid}
          encounterUuid={encounter.uuid}
          section={activeTab}
          embedded
        />
      }
    />
  );
}

type OhTabFormProps = {
  activeTab: OhEncounterTabId;
  encounter: OhVisitEncounter;
  customer: Customer | null;
  tenantId: number | undefined;
  workspace: OhWorkspaceData;
  onChanged: () => void;
};

function OhTabForm({
  activeTab,
  encounter,
  customer,
  tenantId,
  workspace,
  onChanged,
}: OhTabFormProps): ReactNode {
  switch (activeTab) {
    case "exam": {
      const latestExam =
        newestFirst(
          workspace.examinations,
          (exam) => exam.examined_at ?? exam.created_at,
        )[0] ?? null;
      return (
        <div className="space-y-6">
          <OhSchemaExamForm
            encounterId={encounter.id}
            examination={latestExam}
            onSaved={() => onChanged()}
            onCreated={() => onChanged()}
          />
          <OhProcedureChecklistPanel
            examination={latestExam}
            onChanged={onChanged}
          />
        </div>
      );
    }
    case "fitness":
      return (
        <OhFitnessForms examinations={workspace.examinations} onCreated={onChanged} />
      );
    case "certificate":
      return (
        <OhCertificateForm assessments={workspace.fitness} onCreated={onChanged} />
      );
    case "iod":
      return customer && tenantId ? (
        <OhIodForm
          encounterId={encounter.id}
          customerId={customer.id}
          tenantId={tenantId}
          onCreated={onChanged}
        />
      ) : (
        <OhPanelSection>
          <OhColumnMessage>
            Client and tenant context are required to open an IOD case.
          </OhColumnMessage>
        </OhPanelSection>
      );
    case "findings":
      return (
        <OhFindingForm examinations={workspace.examinations} onCreated={onChanged} />
      );
    case "employment":
      return <OhEmploymentForm customer={customer} />;
  }
}

type OhTabRecordsProps = {
  activeTab: OhEncounterTabId;
  customer: Customer | null;
  workspace: OhWorkspaceData;
  onChanged: () => void;
};

function OhTabRecords({
  activeTab,
  customer,
  workspace,
  onChanged,
}: OhTabRecordsProps): ReactNode {
  switch (activeTab) {
    case "exam":
      return (
        <OhExamRecords
          examinations={workspace.examinations}
          findings={workspace.findings}
          assessments={workspace.fitness}
        />
      );
    case "fitness":
      return (
        <OhFitnessRecords
          examinations={workspace.examinations}
          assessments={workspace.fitness}
        />
      );
    case "certificate":
      return (
        <OhCertificateRecords
          assessments={workspace.fitness}
          certificates={workspace.fitnessCertificates}
          onChanged={onChanged}
        />
      );
    case "iod":
      return <OhIodRecords iodCases={workspace.iodCases} />;
    case "findings":
      return (
        <OhFindingRecords
          examinations={workspace.examinations}
          findings={workspace.findings}
        />
      );
    case "employment":
      return <OhEmploymentRecords customer={customer} />;
  }
}

function ColumnSkeleton() {
  return (
    <div className="space-y-3 px-4 py-4 sm:px-5" aria-hidden="true">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

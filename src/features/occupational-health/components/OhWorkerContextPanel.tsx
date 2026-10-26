"use client";

import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  OhColumnMessage,
  OhColumnPanel,
  OhFactList,
  OhPanelSection,
} from "@/features/occupational-health/components/OhEncounterColumns";
import { OhEncounterProgress } from "@/features/occupational-health/components/OhEncounterProgress";
import type { OhEncounterTabId } from "@/features/occupational-health/components/OhEncounterTabs";
import { OhStatusChip } from "@/features/occupational-health/components/OhStatusChip";
import { formatFitnessOutcome } from "@/features/occupational-health/utils/oh-labels";
import {
  useEmploymentEpisodes,
  useOhEmploymentLookups,
} from "@/features/occupational-health/hooks/use-occupational-health";
import type {
  EmploymentEpisode,
  FitnessAssessment,
  FitnessCertificate,
  IodCase,
  OhExamFinding,
} from "@/features/occupational-health/types";
import {
  currentFitnessCertificate,
  formatOhDate,
  formatOhDateRange,
  humanizeOhCode,
  latestFitnessAssessment,
} from "@/features/occupational-health/utils/oh-format";

type OhWorkerContextPanelProps = {
  customer: Customer | null;
  examinationCount: number;
  findings: OhExamFinding[];
  assessments: FitnessAssessment[];
  certificates: FitnessCertificate[];
  iodCases: IodCase[];
  activeTab: OhEncounterTabId;
  onSelectTab: (tab: OhEncounterTabId) => void;
};

export function OhWorkerContextPanel({
  customer,
  examinationCount,
  findings,
  assessments,
  certificates,
  iodCases,
  activeTab,
  onSelectTab,
}: OhWorkerContextPanelProps) {
  const latestAssessment = latestFitnessAssessment(assessments);
  const certificate = currentFitnessCertificate(certificates);

  return (
    <OhColumnPanel eyebrow="Worker" title="Context" className="bg-white">
      <OhPanelSection title="Fitness decision" data-testid="oh-worker-fitness">
        {latestAssessment ? (
          <div className="space-y-3">
            <OhStatusChip
              value={latestAssessment.outcome}
              label={formatFitnessOutcome(latestAssessment.outcome)}
              className="h-6 px-2 text-xs"
            />
            <OhFactList
              facts={[
                { label: "Assessed", value: formatOhDate(latestAssessment.assessed_at) },
                ...(latestAssessment.review_date
                  ? [{ label: "Review", value: formatOhDate(latestAssessment.review_date) }]
                  : []),
                {
                  label: "Certificate",
                  value: certificate
                    ? formatOhDateRange(certificate.valid_from, certificate.valid_to)
                    : "Not issued",
                },
              ]}
            />
          </div>
        ) : (
          <OhColumnMessage>No fitness decision on this encounter yet.</OhColumnMessage>
        )}
      </OhPanelSection>

      <OhPanelSection title="Encounter progress">
        <OhEncounterProgress
          examinationCount={examinationCount}
          findings={findings}
          assessments={assessments}
          certificates={certificates}
          iodCases={iodCases}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
        />
      </OhPanelSection>

      {customer ? <OhWorkerEmploymentSection customer={customer} /> : null}
    </OhColumnPanel>
  );
}

function OhWorkerEmploymentSection({ customer }: { customer: Customer }) {
  const episodesQuery = useEmploymentEpisodes(customer.uuid);
  const activeEpisodes = (episodesQuery.data ?? []).filter((item) => item.is_active);
  const lookups = useOhEmploymentLookups(activeEpisodes.length > 0);

  return (
    <OhPanelSection
      title="Employment"
      action={
        <Link
          href={ROUTES.occupationalHealthEmployment(customer.uuid)}
          className="text-xs font-medium text-brand-primary hover:underline"
        >
          Manage
        </Link>
      }
      data-testid="oh-worker-employment"
    >
      {episodesQuery.isLoading ? (
        <OhColumnMessage>Loading employment…</OhColumnMessage>
      ) : episodesQuery.isError ? (
        <OhColumnMessage tone="error">Could not load employment episodes.</OhColumnMessage>
      ) : activeEpisodes.length === 0 ? (
        <OhColumnMessage>No active employment episode for this worker.</OhColumnMessage>
      ) : (
        <div className="divide-y divide-dash-border/60">
          {activeEpisodes.map((episode) => (
            <div key={episode.uuid} className="py-3 first:pt-0 last:pb-0">
              <OhFactList
                facts={buildEpisodeFacts(
                  episode,
                  lookups.employerNames,
                  lookups.jobTitleNames,
                )}
              />
            </div>
          ))}
        </div>
      )}
    </OhPanelSection>
  );
}

function buildEpisodeFacts(
  episode: EmploymentEpisode,
  employerNames: Map<number, string>,
  jobTitleNames: Map<number, string>,
) {
  return [
    { label: "Employer", value: employerNames.get(episode.employer) ?? "—" },
    { label: "Job title", value: jobTitleNames.get(episode.job_title) ?? "—" },
    { label: "Site", value: episode.site || "—" },
    { label: "Department", value: episode.department_name || "—" },
    { label: "Employee no.", value: episode.employee_number || "—" },
    { label: "Type", value: humanizeOhCode(episode.employment_type) },
    { label: "Since", value: formatOhDate(episode.start_date) },
    { label: "Fitness req.", value: episode.requires_fitness ? "Yes" : "No" },
  ];
}

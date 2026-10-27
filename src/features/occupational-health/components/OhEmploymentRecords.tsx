"use client";

import { Briefcase } from "lucide-react";

import type { Customer } from "@/features/customers/types/customer.types";
import {
  OhColumnMessage,
  OhFactList,
  OhPanelSection,
  OhRecordItem,
  OhRecordList,
  OhRecordsEmpty,
} from "@/features/occupational-health/components/OhEncounterColumns";
import { OhStatusChip } from "@/features/occupational-health/components/OhStatusChip";
import {
  useEmploymentEpisodes,
  useOhEmploymentLookups,
} from "@/features/occupational-health/hooks/use-occupational-health";
import type { EmploymentEpisode } from "@/features/occupational-health/types";
import {
  formatOhDate,
  humanizeOhCode,
} from "@/features/occupational-health/utils/oh-format";

type OhEmploymentRecordsProps = {
  customer: Customer | null;
};

export function OhEmploymentRecords({ customer }: OhEmploymentRecordsProps) {
  const episodesQuery = useEmploymentEpisodes(customer?.uuid);
  const episodes = episodesQuery.data ?? [];
  const lookups = useOhEmploymentLookups(episodes.length > 0);

  if (!customer) {
    return (
      <OhPanelSection>
        <OhColumnMessage>Client context is required to show employment.</OhColumnMessage>
      </OhPanelSection>
    );
  }

  if (episodesQuery.isLoading) {
    return (
      <OhPanelSection>
        <OhColumnMessage>Loading employment…</OhColumnMessage>
      </OhPanelSection>
    );
  }

  if (episodesQuery.isError) {
    return (
      <OhPanelSection>
        <OhColumnMessage tone="error" data-testid="oh-employment-error">
          Could not load employment episodes.
        </OhColumnMessage>
      </OhPanelSection>
    );
  }

  if (episodes.length === 0) {
    return (
      <OhRecordsEmpty
        icon={Briefcase}
        title="No employment episode"
        description="Add the employer and job on the left so this encounter is tied to the worker’s role."
        data-testid="oh-employment-records-empty"
      />
    );
  }

  const ordered = [...episodes].sort((left, right) => {
    if (left.is_active !== right.is_active) {
      return left.is_active ? -1 : 1;
    }
    return right.start_date.localeCompare(left.start_date);
  });

  return (
    <OhPanelSection title="Episodes" data-testid="oh-employment-records">
      <OhRecordList>
        {ordered.map((episode) => (
          <EmploymentEpisodeItem
            key={episode.uuid}
            episode={episode}
            employerName={lookups.employerNames.get(episode.employer) ?? "—"}
            jobTitle={lookups.jobTitleNames.get(episode.job_title) ?? "—"}
          />
        ))}
      </OhRecordList>
    </OhPanelSection>
  );
}

function EmploymentEpisodeItem({
  episode,
  employerName,
  jobTitle,
}: {
  episode: EmploymentEpisode;
  employerName: string;
  jobTitle: string;
}) {
  return (
    <OhRecordItem
      title={jobTitle}
      badges={
        <OhStatusChip
          value={episode.is_active ? "active" : "closed"}
          label={episode.is_active ? "Active" : "Ended"}
        />
      }
      meta={`${employerName} · since ${formatOhDate(episode.start_date)}`}
    >
      <OhFactList
        facts={[
          { label: "Site", value: episode.site || "—" },
          { label: "Department", value: episode.department_name || "—" },
          { label: "Employee no.", value: episode.employee_number || "—" },
          { label: "Type", value: humanizeOhCode(episode.employment_type) },
          { label: "Fitness req.", value: episode.requires_fitness ? "Yes" : "No" },
        ]}
      />
    </OhRecordItem>
  );
}

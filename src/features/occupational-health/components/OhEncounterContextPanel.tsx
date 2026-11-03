"use client";

import type { Customer } from "@/features/customers/types/customer.types";
import { OhCertificateForm } from "@/features/occupational-health/components/OhCertificateTabPanel";
import { OhCertificateRecords } from "@/features/occupational-health/components/OhCertificateRecords";
import { OhEmploymentForm } from "@/features/occupational-health/components/OhEmploymentTabPanel";
import { OhEmploymentRecords } from "@/features/occupational-health/components/OhEmploymentRecords";
import { OhEncounterModulePlaceholder } from "@/features/occupational-health/components/OhEncounterModulePlaceholder";
import { OhMedicalExaminationsPanel } from "@/features/occupational-health/components/OhMedicalExaminationsPanel";
import {
  OhColumnPanel,
  OhEncounterColumns,
} from "@/features/occupational-health/components/OhEncounterColumns";
import type { useOhEncounterWorkspaceData } from "@/features/occupational-health/hooks/use-occupational-health";
import type { OhEncounterPanelId } from "@/features/occupational-health/lib/oh-encounter-modules";
import type {
  EmploymentEpisode,
  OhVisitEncounter,
} from "@/features/occupational-health/types";

type OhEncounterContextPanelProps = {
  activePanel: OhEncounterPanelId;
  encounter: OhVisitEncounter;
  customer: Customer | null;
  episodes: EmploymentEpisode[];
  workspace: ReturnType<typeof useOhEncounterWorkspaceData>;
};

export function OhEncounterContextPanel({
  activePanel,
  encounter,
  customer,
  episodes,
  workspace,
}: OhEncounterContextPanelProps) {
  if (activePanel === "medical-examinations") {
    return (
      <OhMedicalExaminationsPanel
        encounter={encounter}
        episodes={episodes}
        workspace={workspace}
      />
    );
  }

  if (activePanel === "certificate") {
    return (
      <OhEncounterColumns
        sectionKey="certificate"
        form={
          <OhColumnPanel eyebrow="Record" title="Certificate" className="bg-white">
            <OhCertificateForm
              assessments={workspace.fitness}
              onCreated={workspace.refetchAll}
            />
          </OhColumnPanel>
        }
        records={
          <OhColumnPanel
            eyebrow="This encounter"
            title="Certificates"
            count={workspace.fitnessCertificates.length}
            className="bg-white"
          >
            <OhCertificateRecords
              assessments={workspace.fitness}
              certificates={workspace.fitnessCertificates}
              onChanged={workspace.refetchAll}
            />
          </OhColumnPanel>
        }
      />
    );
  }

  if (activePanel === "employment") {
    return (
      <OhEncounterColumns
        sectionKey="employment"
        form={
          <OhColumnPanel eyebrow="Record" title="Employment" className="bg-white">
            <OhEmploymentForm customer={customer} />
          </OhColumnPanel>
        }
        records={
          <OhColumnPanel
            eyebrow="This encounter"
            title="Employment"
            count={episodes.length}
            className="bg-white"
          >
            <OhEmploymentRecords customer={customer} />
          </OhColumnPanel>
        }
      />
    );
  }

  return <OhEncounterModulePlaceholder moduleId={activePanel} />;
}

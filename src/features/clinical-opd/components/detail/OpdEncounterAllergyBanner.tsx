import Link from "next/link";

import { StatusBanner } from "@/components/ui/status-banner";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import type { ChartAllergy } from "@/features/clinical-opd/types/clinical-opd.types";
import { opdEncounterTabHref } from "@/features/clinical-opd/utils/opd-encounter-tabs";

const HIGH_SEVERITY = new Set(["severe", "life_threatening"]);

type OpdEncounterAllergyBannerProps = {
  allergies: ChartAllergy[];
};

export function OpdEncounterAllergyBanner({
  allergies,
}: OpdEncounterAllergyBannerProps) {
  const { visitUuid, encounterUuid, visibleTabIds } = useOpdEncounterWorkspace();
  const active = allergies.filter(Boolean);

  if (active.length === 0) {
    return null;
  }

  const highRisk = active.some((allergy) =>
    HIGH_SEVERITY.has(allergy.severity),
  );
  const names = active
    .map((allergy) => `${allergy.allergy_name} (${allergy.severity})`)
    .join(" · ");

  return (
    <div className="border-b border-dash-border/80 px-4 py-3 sm:px-6">
      <StatusBanner
        variant={highRisk ? "error" : "warning"}
        message={highRisk ? "High-risk allergies on file" : "Allergies on file"}
        description={names}
        data-testid="opd-encounter-allergy-banner"
      >
        {visibleTabIds.includes("allergies") ? (
          <Link
            href={opdEncounterTabHref(visitUuid, encounterUuid, "allergies")}
            className="text-sm font-medium text-brand-primary hover:underline"
          >
            Review allergies
          </Link>
        ) : null}
      </StatusBanner>
    </div>
  );
}

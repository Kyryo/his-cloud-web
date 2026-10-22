import Link from "next/link";

import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { useWorkspaceRouting } from "@/features/clinical-opd/hooks/use-workspace-routing";
import type { ChartAllergy } from "@/features/clinical-opd/types/clinical-opd.types";
import { workspaceTabHref } from "@/features/clinical-workspace/utils/workspace-tabs";

const HIGH_SEVERITY = new Set(["severe", "life_threatening"]);

type OpdEncounterAllergyBannerProps = {
  allergies: ChartAllergy[];
};

export function OpdEncounterAllergyBanner({
  allergies,
}: OpdEncounterAllergyBannerProps) {
  const routing = useWorkspaceRouting();
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
    .join(", ");

  return (
    <p
      className={
        highRisk
          ? "px-4 py-2.5 text-sm text-red-800 sm:px-6"
          : "px-4 py-2.5 text-sm text-amber-800 sm:px-6"
      }
      data-testid="opd-encounter-allergy-banner"
    >
      <span className="font-medium">
        {highRisk ? "High-risk allergies on file" : "Allergies on file"}
      </span>
      {": "}
      {names}
      {visibleTabIds.includes("allergies") ? (
        <>
          {" "}
          <Link
            href={workspaceTabHref(routing, visitUuid, encounterUuid, "allergies")}
            className="font-medium text-brand-primary hover:underline"
          >
            Review allergies
          </Link>
        </>
      ) : null}
    </p>
  );
}

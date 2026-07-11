import type { VisitEncounter } from "@/features/visits/types/visit.types";
import {
  formatEncounterCloseActionLabel,
  getOpenEncounters,
  predictEncounterCloseAction,
} from "@/features/visits/utils/visit-encounter-close";

import { StatusBanner } from "@/components/ui/status-banner";

type OpenEncountersCloseNoticeProps = {
  encounters: VisitEncounter[] | undefined;
  appointmentLinked?: boolean;
};

export function OpenEncountersCloseNotice({
  encounters,
  appointmentLinked = false,
}: OpenEncountersCloseNoticeProps) {
  const openEncounters = getOpenEncounters(encounters);
  const count = openEncounters.length;

  if (count === 0 && !appointmentLinked) {
    return null;
  }

  const encounterSummary =
    count === 0
      ? null
      : count === 1
        ? "1 open encounter will be completed or cancelled when you close this visit."
        : `${count} open encounters will be completed or cancelled when you close this visit.`;

  const appointmentNote = appointmentLinked
    ? "The linked appointment will be marked completed."
    : null;

  const message =
    encounterSummary && appointmentNote
      ? `${encounterSummary} ${appointmentNote}`
      : encounterSummary ?? appointmentNote ?? "";

  return (
    <StatusBanner variant="info" message={message}>
      {count > 0 ? (
        <ul className="mt-2 space-y-1 text-sm text-brand-muted">
          {openEncounters.map((encounter) => {
            const hasKnownProgress =
              encounter.status === "in_progress"
              || Boolean(encounter.started_at)
              || Boolean(encounter.notes?.trim())
              || encounter.clinician != null;
            const actionLabel = hasKnownProgress
              ? formatEncounterCloseActionLabel(predictEncounterCloseAction(encounter))
              : null;

            return (
              <li key={encounter.uuid}>
                {encounter.department_name}
                {actionLabel ? ` — will be ${actionLabel}` : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </StatusBanner>
  );
}

"use client";

import { Loader2 } from "lucide-react";

import { PrimaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteDentalFinding,
  useDentalToothHistory,
  useUpdateDentalFinding,
} from "@/features/clinical-dental/hooks/use-clinical-dental";
import type { DentalChartFinding } from "@/features/clinical-dental/types/clinical-dental.types";
import { toothName } from "@/features/clinical-dental/utils/dental-arches";
import {
  DENTAL_CONDITION_META,
  formatSurfaces,
} from "@/features/clinical-dental/utils/dental-conditions";
import {
  formatDisplayDate,
  formatDisplayDateTime,
} from "@/features/customers/utils/format-customer";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type DentalToothHistorySheetProps = {
  visitUuid: string;
  encounterUuid: string;
  toothNumber: number | null;
  canRecord: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordFinding: (toothNumber: number) => void;
};

export function DentalToothHistorySheet({
  visitUuid,
  encounterUuid,
  toothNumber,
  canRecord,
  onOpenChange,
  onRecordFinding,
}: DentalToothHistorySheetProps) {
  const { toast } = useToast();
  const historyQuery = useDentalToothHistory(visitUuid, encounterUuid, toothNumber);
  const updateFinding = useUpdateDentalFinding(visitUuid, encounterUuid);
  const deleteFinding = useDeleteDentalFinding(visitUuid, encounterUuid);
  const history = historyQuery.data;
  const isMutating = updateFinding.isPending || deleteFinding.isPending;

  async function runAction(action: () => Promise<unknown>, success: string) {
    try {
      await action();
      await historyQuery.refetch();
      toast({ variant: "success", title: success });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update the chart",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : "Try again in a moment.",
      });
    }
  }

  function renderFinding(finding: DentalChartFinding) {
    const meta = DENTAL_CONDITION_META[finding.condition];
    const isActive = finding.status === "active";
    const isThisEncounter = finding.encounter_uuid === encounterUuid;
    return (
      <li
        key={finding.uuid}
        className="border-b border-dash-border/70 py-3 last:border-b-0"
        data-testid="dental-tooth-history-finding"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn("inline-block size-2.5 rounded-sm", meta.swatchClassName)}
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-brand-navy">
                {meta.label}
                {finding.surfaces.length > 0
                  ? ` · ${formatSurfaces(finding.surfaces)}`
                  : null}
              </p>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                  isActive
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "bg-slate-100 text-brand-muted",
                )}
              >
                {isActive ? "Active" : "Resolved"}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-brand-muted">
              {formatDisplayDateTime(finding.recorded_at)}
              {finding.recorded_by_name ? ` · ${finding.recorded_by_name}` : null}
            </p>
            {finding.notes ? (
              <p className="mt-1 text-xs text-brand-slate">{finding.notes}</p>
            ) : null}
          </div>
          {canRecord ? (
            <div className="flex shrink-0 gap-1">
              {isActive ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  disabled={isMutating}
                  onClick={() =>
                    void runAction(
                      () =>
                        updateFinding.mutateAsync({
                          findingUuid: finding.uuid,
                          payload: { status: "resolved" },
                        }),
                      "Finding resolved",
                    )
                  }
                >
                  Resolve
                </Button>
              ) : null}
              {isThisEncounter ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-brand-muted hover:text-red-600"
                  disabled={isMutating}
                  onClick={() =>
                    void runAction(
                      () => deleteFinding.mutateAsync(finding.uuid),
                      "Finding removed",
                    )
                  }
                >
                  Remove
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </li>
    );
  }

  return (
    <Sheet open={toothNumber !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn("w-full overflow-y-auto sm:max-w-md", appFont.className)}
        data-testid="dental-tooth-history-sheet"
      >
        <SheetHeader>
          <SheetTitle>
            {toothNumber !== null ? `Tooth ${toothNumber}` : "Tooth history"}
          </SheetTitle>
          <SheetDescription>
            {toothNumber !== null ? toothName(toothNumber) : null}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          {canRecord && toothNumber !== null ? (
            <PrimaryButton
              type="button"
              onClick={() => onRecordFinding(toothNumber)}
              data-testid="dental-tooth-record-finding"
            >
              Record finding
            </PrimaryButton>
          ) : null}

          {historyQuery.isLoading ? (
            <div className="space-y-2" aria-busy="true">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : historyQuery.isError ? (
            <p className="text-sm text-red-700">Could not load this tooth&apos;s history.</p>
          ) : (
            <>
              <section aria-labelledby="dental-tooth-findings-heading">
                <h3
                  id="dental-tooth-findings-heading"
                  className="text-xs font-semibold uppercase tracking-wide text-brand-muted"
                >
                  Findings
                </h3>
                {history && history.findings.length > 0 ? (
                  <ul>{history.findings.map(renderFinding)}</ul>
                ) : (
                  <p className="py-3 text-sm text-brand-muted">
                    No findings recorded for this tooth.
                  </p>
                )}
              </section>

              <section aria-labelledby="dental-tooth-procedures-heading">
                <h3
                  id="dental-tooth-procedures-heading"
                  className="text-xs font-semibold uppercase tracking-wide text-brand-muted"
                >
                  Procedures
                </h3>
                {history && history.treatments.length > 0 ? (
                  <ul>
                    {history.treatments.map((treatment) => (
                      <li
                        key={treatment.uuid}
                        className="border-b border-dash-border/70 py-3 last:border-b-0"
                        data-testid="dental-tooth-history-procedure"
                      >
                        <p className="text-sm font-medium text-brand-navy">
                          {treatment.procedure_name}
                          {treatment.surfaces.length > 0
                            ? ` · ${formatSurfaces(treatment.surfaces)}`
                            : null}
                        </p>
                        <p className="mt-0.5 text-[11px] text-brand-muted">
                          {formatDisplayDate(treatment.treatment_date)}
                          {treatment.performed_by_name || treatment.provider_name
                            ? ` · ${treatment.performed_by_name || treatment.provider_name}`
                            : null}
                        </p>
                        {treatment.notes ? (
                          <p className="mt-1 text-xs text-brand-slate">{treatment.notes}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-3 text-sm text-brand-muted">
                    No procedures performed on this tooth.
                  </p>
                )}
              </section>
            </>
          )}
        </div>

        {isMutating ? (
          <span className="sr-only" role="status">
            <Loader2 aria-hidden="true" /> Saving
          </span>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

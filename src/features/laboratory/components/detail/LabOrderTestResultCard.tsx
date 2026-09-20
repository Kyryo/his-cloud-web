"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { PrimaryButton } from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchLabOrderItemResults,
  upsertLabOrderItemResults,
} from "@/features/laboratory/services/laboratory.service";
import type {
  LabOrderItem,
  LabResult,
  LabResultAnalyte,
} from "@/features/laboratory/types/laboratory.types";
import {
  formatAnalyteReferenceRange,
  isNumericOutOfReferenceRange,
  sanitizeAnalyteNumericInput,
} from "@/features/laboratory/utils/analyte-result-input";
import { formatLabOrderItemStatusLabel } from "@/features/laboratory/utils/format-lab-order";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { getErrorMessage } from "@/lib/fetch-error";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AnalyteDraft = {
  analyte_uuid: string;
  analyte_code: string;
  analyte_name: string;
  unit: string;
  value_type: string;
  decimal_precision: number | null;
  value_text: string;
  value_numeric: string;
  ref_low: string | number | null;
  ref_high: string | number | null;
};

type LabOrderTestResultCardProps = {
  item: LabOrderItem;
  enabled: boolean;
  onSaved: () => void | Promise<void>;
};

function draftsFromResult(result: LabResult): AnalyteDraft[] {
  return result.analytes.map((analyte: LabResultAnalyte) => {
    const valueType = String(analyte.value_type || "").toUpperCase();
    const isNumeric =
      valueType === "NUMERIC" ||
      (!valueType && Boolean(analyte.unit?.trim()));

    return {
      analyte_uuid: analyte.analyte_uuid,
      analyte_code: analyte.analyte_code,
      analyte_name: analyte.analyte_name,
      unit: analyte.unit,
      value_type: isNumeric ? "NUMERIC" : valueType || "TEXT",
      decimal_precision:
        analyte.decimal_precision == null
          ? null
          : Number(analyte.decimal_precision),
      value_text: analyte.value_text ?? "",
      value_numeric:
        analyte.value_numeric === null || analyte.value_numeric === undefined
          ? ""
          : String(analyte.value_numeric),
      ref_low: analyte.ref_low,
      ref_high: analyte.ref_high,
    };
  });
}

export function LabOrderTestResultCard({
  item,
  enabled,
  onSaved,
}: LabOrderTestResultCardProps) {
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<AnalyteDraft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readOnly =
    item.status === "CANCELLED" ||
    item.status === "RELEASED" ||
    item.result_status === "RELEASED";

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchLabOrderItemResults(item.uuid);
        if (!cancelled) {
          setDrafts(draftsFromResult(result));
        }
      } catch (err) {
        if (!cancelled) {
          setDrafts([]);
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, item.uuid]);

  function updateDraft(
    analyteUuid: string,
    patch: Partial<Pick<AnalyteDraft, "value_text" | "value_numeric">>,
  ) {
    setDrafts((current) =>
      current.map((draft) =>
        draft.analyte_uuid === analyteUuid ? { ...draft, ...patch } : draft,
      ),
    );
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      await upsertLabOrderItemResults(item.uuid, {
        values: drafts.map((draft) => ({
          analyte_uuid: draft.analyte_uuid,
          value_text: draft.value_text.trim() || undefined,
          value_numeric: draft.value_numeric.trim()
            ? draft.value_numeric.trim()
            : null,
        })),
      });
      toast({
        variant: "success",
        title: "Results saved",
        description: `${item.test_name} was updated.`,
      });
      await onSaved();
    } catch (err) {
      setError(
        err instanceof BffError
          ? formatBffErrorMessage(err.message, err.errors)
          : getErrorMessage(err),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-xl border border-dash-border/80 bg-white p-3 shadow-2xs",
        readOnly && "bg-slate-50/60",
      )}
      data-testid={`lab-order-test-result-card-${item.uuid}`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-brand-navy">
            {item.test_name}
          </h3>
          <p className="truncate font-mono text-[11px] text-brand-muted">
            {item.test_code}
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 font-normal">
          {formatLabOrderItemStatusLabel(item.status)}
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center gap-2 py-6 text-xs text-brand-muted">
          <Loader2 className="size-3.5 animate-spin" />
          Loading…
        </div>
      ) : error && drafts.length === 0 ? (
        <p className="flex-1 text-xs text-red-700">{error}</p>
      ) : drafts.length === 0 ? (
        <p className="flex-1 text-xs text-brand-muted">
          No analytes configured for this test.
        </p>
      ) : (
        <div className="flex flex-1 flex-col gap-2.5">
          {drafts.map((draft) => {
            const referenceLabel = formatAnalyteReferenceRange(
              draft.ref_low,
              draft.ref_high,
            );
            const isNumeric = draft.value_type === "NUMERIC";
            const outOfRange =
              isNumeric &&
              isNumericOutOfReferenceRange(
                draft.value_numeric,
                draft.ref_low,
                draft.ref_high,
              );
            const isInteger = draft.decimal_precision === 0;

            return (
              <div key={draft.analyte_uuid} className="space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                  <Label
                    className={cn(
                      "min-w-0 truncate text-[11px] font-medium",
                      outOfRange ? "text-red-600" : "text-brand-muted",
                    )}
                  >
                    {draft.analyte_name}
                    {draft.unit ? (
                      <span className="font-normal"> ({draft.unit})</span>
                    ) : null}
                  </Label>
                  {referenceLabel ? (
                    <span
                      className={cn(
                        "shrink-0 text-[11px] tabular-nums",
                        outOfRange ? "font-medium text-red-600" : "text-brand-muted",
                      )}
                      data-testid={`lab-order-analyte-ref-${draft.analyte_uuid}`}
                    >
                      {referenceLabel}
                    </span>
                  ) : null}
                </div>
                {isNumeric ? (
                  <Input
                    value={draft.value_numeric}
                    onChange={(event) =>
                      updateDraft(draft.analyte_uuid, {
                        value_numeric: sanitizeAnalyteNumericInput(
                          event.target.value,
                          draft.decimal_precision,
                        ),
                      })
                    }
                    inputMode={isInteger ? "numeric" : "decimal"}
                    pattern={isInteger ? "-?[0-9]*" : undefined}
                    placeholder={isInteger ? "0" : "0.0"}
                    disabled={readOnly || isSaving}
                    aria-invalid={outOfRange}
                    className={cn(
                      "h-8 text-sm",
                      outOfRange &&
                        "border-red-500 text-red-700 focus-visible:border-red-500 focus-visible:ring-red-500/30",
                    )}
                    data-testid={`lab-order-analyte-numeric-${draft.analyte_uuid}`}
                  />
                ) : (
                  <Input
                    value={draft.value_text}
                    onChange={(event) =>
                      updateDraft(draft.analyte_uuid, {
                        value_text: event.target.value,
                      })
                    }
                    placeholder="Text result"
                    disabled={readOnly || isSaving}
                    className="h-8 text-sm"
                    data-testid={`lab-order-analyte-text-${draft.analyte_uuid}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && drafts.length > 0 ? (
        <p className="mt-2 text-[11px] text-red-700">{error}</p>
      ) : null}

      {!readOnly && drafts.length > 0 ? (
        <PrimaryButton
          type="button"
          size="sm"
          className="mt-3 h-8 w-full"
          disabled={isSaving || isLoading}
          onClick={() => {
            void handleSave();
          }}
          data-testid={`lab-order-test-save-${item.uuid}`}
        >
          {isSaving ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Saving…
            </>
          ) : (
            "Save results"
          )}
        </PrimaryButton>
      ) : null}
    </article>
  );
}

"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import {
  fetchLabOrderItemResults,
  upsertLabOrderItemResults,
} from "@/features/laboratory/services/laboratory.service";
import type {
  LabOrder,
  LabResult,
  LabResultAnalyte,
  LabResultAnalyteCodedOption,
} from "@/features/laboratory/types/laboratory.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { getErrorMessage } from "@/lib/fetch-error";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type EnterResultsDialogProps = {
  order: LabOrder;
  open: boolean;
  initialItemUuid?: string | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void | Promise<void>;
};

type AnalyteDraft = {
  analyte_uuid: string;
  analyte_code: string;
  analyte_name: string;
  unit: string;
  value_type: string;
  coded_options: LabResultAnalyteCodedOption[];
  value_text: string;
  value_numeric: string;
};

function normalizeCodedOptions(
  options: LabResultAnalyte["coded_options"],
): LabResultAnalyteCodedOption[] {
  if (!Array.isArray(options)) {
    return [];
  }
  return options
    .map((option) => ({
      code: String(option?.code ?? "").trim(),
      label: String(option?.label ?? "").trim(),
    }))
    .filter((option) => option.code && option.label);
}

function draftsFromResult(result: LabResult): AnalyteDraft[] {
  return result.analytes.map((analyte: LabResultAnalyte) => {
    const valueType = String(analyte.value_type || "").toUpperCase();
    return {
      analyte_uuid: analyte.analyte_uuid,
      analyte_code: analyte.analyte_code,
      analyte_name: analyte.analyte_name,
      unit: analyte.unit,
      value_type: valueType || "TEXT",
      coded_options: normalizeCodedOptions(analyte.coded_options),
      value_text: analyte.value_text ?? "",
      value_numeric:
        analyte.value_numeric === null || analyte.value_numeric === undefined
          ? ""
          : String(analyte.value_numeric),
    };
  });
}

export function EnterResultsDialog({
  order,
  open,
  initialItemUuid = null,
  onOpenChange,
  onSaved,
}: EnterResultsDialogProps) {
  const { toast } = useToast();
  const eligibleItems = useMemo(
    () =>
      order.items.filter(
        (item) => item.status !== "CANCELLED" && item.status !== "RELEASED",
      ),
    [order.items],
  );
  const [itemUuid, setItemUuid] = useState("");
  const [drafts, setDrafts] = useState<AnalyteDraft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) {
        return;
      }
      setItemUuid(
        (initialItemUuid &&
        eligibleItems.some((item) => item.uuid === initialItemUuid)
          ? initialItemUuid
          : eligibleItems[0]?.uuid) ?? "",
      );
      setDrafts([]);
      setError(null);
    })();

    return () => {
      cancelled = true;
    };
  }, [eligibleItems, initialItemUuid, open]);

  useEffect(() => {
    if (!open || !itemUuid) {
      return;
    }

    let cancelled = false;
    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchLabOrderItemResults(itemUuid);
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
  }, [itemUuid, open]);

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

  async function handleSubmit() {
    if (!itemUuid) {
      setError("Select an order item.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await upsertLabOrderItemResults(itemUuid, {
        values: drafts.map((draft) => ({
          analyte_uuid: draft.analyte_uuid,
          value_text: draft.value_text.trim() || undefined,
          value_numeric:
            draft.value_type === "NUMERIC" && draft.value_numeric.trim()
              ? draft.value_numeric.trim()
              : null,
        })),
      });
      toast({
        variant: "success",
        title: "Results saved",
        description: "Analyte values were saved for the selected test.",
      });
      await onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof BffError
          ? formatBffErrorMessage(err.message, err.errors)
          : getErrorMessage(err),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Enter results"
      description="Enter numeric or text values for each analyte on the selected test."
      className={cn("sm:max-w-xl", appFont.className)}
      data-testid="enter-results-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isSubmitting || isLoading || !itemUuid}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              "Save results"
            )}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        {error ? (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="lab-result-item">Order item</Label>
          <Select value={itemUuid} onValueChange={setItemUuid}>
            <SelectTrigger id="lab-result-item">
              <SelectValue placeholder="Select a test" />
            </SelectTrigger>
            <SelectContent>
              {eligibleItems.map((item) => (
                <SelectItem key={item.uuid} value={item.uuid}>
                  {item.test_name} ({item.test_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-brand-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading analytes…
          </div>
        ) : drafts.length === 0 ? (
          <p className="text-sm text-brand-muted">
            No analytes available for this item yet. Accession the order and
            ensure the test catalog defines analytes.
          </p>
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => {
              const isNumeric = draft.value_type === "NUMERIC";
              const isCoded =
                draft.value_type === "CODED" && draft.coded_options.length > 0;

              return (
                <div
                  key={draft.analyte_uuid}
                  className="space-y-2 rounded-lg border border-dash-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-brand-navy">
                      {draft.analyte_name}
                    </p>
                    <p className="font-mono text-xs text-brand-muted">
                      {draft.analyte_code}
                      {draft.unit ? ` · ${draft.unit}` : ""}
                    </p>
                  </div>
                  {isNumeric ? (
                    <div className="space-y-1">
                      <Label htmlFor={`numeric-${draft.analyte_uuid}`}>
                        Numeric value
                      </Label>
                      <Input
                        id={`numeric-${draft.analyte_uuid}`}
                        value={draft.value_numeric}
                        onChange={(event) =>
                          updateDraft(draft.analyte_uuid, {
                            value_numeric: event.target.value,
                          })
                        }
                        className="h-9 font-mono text-sm"
                        inputMode="decimal"
                      />
                    </div>
                  ) : isCoded ? (
                    <div className="space-y-1">
                      <Label>Result</Label>
                      <Select
                        value={draft.value_text || undefined}
                        onValueChange={(value) =>
                          updateDraft(draft.analyte_uuid, {
                            value_text: value,
                          })
                        }
                      >
                        <SelectTrigger
                          className="h-9 text-sm"
                          data-testid={`enter-results-coded-${draft.analyte_uuid}`}
                        >
                          <SelectValue placeholder="Select result" />
                        </SelectTrigger>
                        <SelectContent>
                          {draft.coded_options.map((option) => (
                            <SelectItem key={option.code} value={option.code}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Label htmlFor={`text-${draft.analyte_uuid}`}>
                        Text value
                      </Label>
                      <Input
                        id={`text-${draft.analyte_uuid}`}
                        value={draft.value_text}
                        onChange={(event) =>
                          updateDraft(draft.analyte_uuid, {
                            value_text: event.target.value,
                          })
                        }
                        className="h-9 text-sm"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SectionedDialog>
  );
}

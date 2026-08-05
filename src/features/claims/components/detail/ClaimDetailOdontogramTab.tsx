"use client";

import { Loader2, Smile } from "lucide-react";
import { useMemo, useState } from "react";

import { DetailTabEmptyState } from "@/components/detail/detail-tab-empty-state";
import { StatusBanner } from "@/components/ui/status-banner";
import { AssignClaimLineTeethDialog } from "@/features/claims/components/detail/AssignClaimLineTeethDialog";
import { setClaimLineDentalTeeth } from "@/features/claims/services/claims.service";
import type { ClaimDetail, ClaimLineItem } from "@/features/claims/types/claims.types";
import {
  computeLineTeethAssignments,
  getLineToothNumbers,
  lineTeethChanged,
} from "@/features/claims/utils/claim-odontogram-assignments";
import {
  ClaimLineOdontogramPicker,
  getPermanentFdiToothNumbers,
} from "@/features/dental/components/ClaimLineOdontogramPicker";
import { formatToothNumbersSummary } from "@/features/dental/lib/dental-teeth-display";
import { useToast } from "@/providers/toast-provider";

type ClaimDetailOdontogramTabProps = {
  claim: ClaimDetail;
  isActive: boolean;
  onClaimUpdated?: (claim: ClaimDetail) => void;
};

type PendingAssign = {
  toothNumbers: number[];
  mode: "add" | "replace";
  title: string;
  description: string;
};

function lineLabel(line: ClaimLineItem): string {
  return line.tariff_code?.trim() || `Line #${line.id}`;
}

export function ClaimDetailOdontogramTab({
  claim,
  isActive,
  onClaimUpdated,
}: ClaimDetailOdontogramTabProps) {
  const { toast } = useToast();
  const lineItems = useMemo(
    () =>
      (claim.claim_invoices ?? []).flatMap(
        (invoice) => invoice.line_items ?? [],
      ),
    [claim.claim_invoices],
  );

  const assignedTeeth = useMemo(() => {
    const numbers = lineItems.flatMap((line) => getLineToothNumbers(line));
    return [...new Set(numbers)].sort((a, b) => a - b);
  }, [lineItems]);

  const [pendingAssign, setPendingAssign] = useState<PendingAssign | null>(
    null,
  );
  const [chartRemountToken, setChartRemountToken] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDraft = String(claim.status).toLowerCase() === "draft";

  function bumpChart() {
    setChartRemountToken((token) => token + 1);
  }

  async function persistAssignments(
    targetLineId: number,
    toothNumbers: number[],
    mode: "add" | "replace",
  ): Promise<ClaimDetail | null> {
    const currentByLine = lineItems.map((line) => ({
      id: line.id,
      toothNumbers: getLineToothNumbers(line),
    }));
    const next = computeLineTeethAssignments({
      lines: currentByLine,
      targetLineId,
      toothNumbers,
      mode,
    });

    const changes = next.filter((item) => {
      const before =
        currentByLine.find((line) => line.id === item.lineId)?.toothNumbers ??
        [];
      return lineTeethChanged(before, item.toothNumbers);
    });

    if (changes.length === 0) {
      return claim;
    }

    let latest: ClaimDetail = claim;
    for (const change of changes) {
      latest = await setClaimLineDentalTeeth(
        claim.id,
        change.lineId,
        change.toothNumbers,
      );
    }
    return latest;
  }

  async function handleConfirmAssign(lineItemId: number) {
    if (!pendingAssign || !isDraft) return;
    setIsSaving(true);
    setError(null);
    try {
      const updated = await persistAssignments(
        lineItemId,
        pendingAssign.toothNumbers,
        pendingAssign.mode,
      );
      if (updated) {
        onClaimUpdated?.(updated);
        toast({
          variant: "success",
          title: "Teeth assigned",
          description: "Tooth selection was saved to the claim line.",
        });
      }
      setPendingAssign(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not save tooth selection.";
      setError(message);
      toast({
        variant: "error",
        title: "Could not assign teeth",
        description: message,
      });
      bumpChart();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemoveTeeth(toothNumbers: number[]) {
    if (!isDraft || toothNumbers.length === 0) return;
    setIsSaving(true);
    setError(null);
    try {
      const owners = lineItems.filter((line) =>
        getLineToothNumbers(line).some((n) => toothNumbers.includes(n)),
      );
      let latest: ClaimDetail = claim;
      for (const line of owners) {
        const remaining = getLineToothNumbers(line).filter(
          (n) => !toothNumbers.includes(n),
        );
        latest = await setClaimLineDentalTeeth(claim.id, line.id, remaining);
      }
      onClaimUpdated?.(latest);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not remove tooth selection.";
      setError(message);
      bumpChart();
    } finally {
      setIsSaving(false);
    }
  }

  function openAssignDialog(pending: PendingAssign) {
    bumpChart();
    setPendingAssign(pending);
  }

  function handleRequestAssign(toothNumbers: number[]) {
    if (!isDraft || toothNumbers.length === 0) {
      bumpChart();
      return;
    }
    openAssignDialog({
      toothNumbers,
      mode: "add",
      title:
        toothNumbers.length === 1
          ? "Assign tooth to a line item"
          : "Assign teeth to a line item",
      description:
        "Choose which claim line this selection should be related to. Changes save immediately.",
    });
  }

  async function handleSelectAll() {
    if (!isDraft || lineItems.length === 0) return;
    const allTeeth = getPermanentFdiToothNumbers();
    if (lineItems.length === 1) {
      setIsSaving(true);
      setError(null);
      try {
        const updated = await persistAssignments(
          lineItems[0].id,
          allTeeth,
          "replace",
        );
        if (updated) {
          onClaimUpdated?.(updated);
          toast({
            variant: "success",
            title: "All teeth selected",
            description: `Assigned to ${lineLabel(lineItems[0])}.`,
          });
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not select all teeth.";
        setError(message);
        bumpChart();
      } finally {
        setIsSaving(false);
      }
      return;
    }

    openAssignDialog({
      toothNumbers: allTeeth,
      mode: "replace",
      title: "Select all teeth",
      description:
        "Choose which claim line should receive all teeth. Teeth on other lines will be cleared.",
    });
  }

  async function handleDeselectAll() {
    if (!isDraft || lineItems.length === 0 || assignedTeeth.length === 0) {
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      let latest: ClaimDetail = claim;
      for (const line of lineItems) {
        if (getLineToothNumbers(line).length === 0) continue;
        latest = await setClaimLineDentalTeeth(claim.id, line.id, []);
      }
      onClaimUpdated?.(latest);
      toast({
        variant: "success",
        title: "All teeth cleared",
        description: "Tooth selections were removed from every claim line.",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not clear tooth selection.";
      setError(message);
      bumpChart();
    } finally {
      setIsSaving(false);
    }
  }

  if (!isActive) {
    return null;
  }

  if (lineItems.length === 0) {
    return (
      <section data-testid="claim-detail-odontogram-tab">
        <DetailTabEmptyState
          icon={Smile}
          title="No claim line items"
          description="Add claimed items before selecting teeth on the odontogram."
        />
      </section>
    );
  }

  return (
    <section className="space-y-4" data-testid="claim-detail-odontogram-tab">
      <div className="space-y-3">
        {error ? <StatusBanner variant="error" message={error} /> : null}
        {!isDraft ? (
          <StatusBanner
            variant="info"
            message="This claim is not a draft. Teeth can be viewed but not edited."
          />
        ) : null}
        {isSaving ? (
          <p className="flex items-center gap-2 text-xs text-brand-muted">
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            Saving tooth selection...
          </p>
        ) : null}
        <ClaimLineOdontogramPicker
          value={assignedTeeth}
          remountToken={chartRemountToken}
          disabled={!isDraft || isSaving}
          onRequestAssign={handleRequestAssign}
          onRemoveTeeth={(teeth) => {
            void handleRemoveTeeth(teeth);
          }}
          onSelectAll={() => {
            void handleSelectAll();
          }}
          onDeselectAll={() => {
            void handleDeselectAll();
          }}
        />
      </div>

      <div className="rounded-lg border border-brand-border bg-white">
        <div className="border-b border-brand-border px-3 py-2">
          <h3 className="text-xs font-semibold text-brand-navy">Line items</h3>
          <p className="text-[11px] leading-snug text-brand-muted">
            Click a tooth to assign it to a line.
          </p>
        </div>
        <ul className="divide-y divide-brand-border">
          {lineItems.map((line) => {
            const teeth = getLineToothNumbers(line);
            return (
              <li
                key={line.id}
                className="flex min-h-8 items-center justify-between gap-2 px-3 py-1.5"
                data-testid={`claim-odontogram-line-${line.id}`}
              >
                <div className="flex min-w-0 items-baseline gap-2">
                  <p className="shrink-0 text-xs font-medium text-brand-navy">
                    {lineLabel(line)}
                  </p>
                  <p className="truncate text-[11px] text-brand-muted">
                    {formatToothNumbersSummary(teeth)}
                  </p>
                </div>
                {teeth.length === 0 ? (
                  <span className="shrink-0 text-[11px] text-amber-700">
                    None
                  </span>
                ) : (
                  <span className="shrink-0 tabular-nums text-[11px] text-brand-muted">
                    {teeth.length}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <AssignClaimLineTeethDialog
        open={pendingAssign != null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAssign(null);
            bumpChart();
          }
        }}
        toothNumbers={pendingAssign?.toothNumbers ?? []}
        lineItems={lineItems}
        title={pendingAssign?.title}
        description={pendingAssign?.description}
        isSaving={isSaving}
        onConfirm={handleConfirmAssign}
      />
    </section>
  );
}

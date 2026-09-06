"use client";

import { useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBillingModeLabel } from "@/features/clinical-opd/utils/clinical-order-item-types";
import {
  changeVisitEncounterBillingMode,
  fetchVisitEncounters,
} from "@/features/visits/services/visits.service";
import type { VisitEncounter } from "@/features/visits/types/visit.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type BillingMode = "shared_visit" | "separate_department";

type OpdEncounterBillingModeControlProps = {
  visitUuid: string;
  encounterUuid: string;
};

const BILLING_MODE_OPTIONS: Array<{ value: BillingMode; label: string }> = [
  { value: "shared_visit", label: "One bill for this visit" },
  {
    value: "separate_department",
    label: "Separate bill for this department",
  },
];

export function OpdEncounterBillingModeControl({
  visitUuid,
  encounterUuid,
}: OpdEncounterBillingModeControlProps) {
  const { toast } = useToast();
  const [encounter, setEncounter] = useState<VisitEncounter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [draftMode, setDraftMode] = useState<BillingMode>("shared_visit");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setIsLoading(true);
        const encounters = await fetchVisitEncounters(visitUuid);
        if (cancelled) {
          return;
        }
        const match =
          encounters.find((item) => item.uuid === encounterUuid) ?? null;
        setEncounter(match);
        if (match?.billing_mode) {
          setDraftMode(match.billing_mode);
        }
      } catch {
        if (!cancelled) {
          setEncounter(null);
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
  }, [encounterUuid, visitUuid]);

  const handleConfirmChange = async () => {
    if (!encounter) {
      return;
    }
    try {
      setIsSaving(true);
      const updated = await changeVisitEncounterBillingMode(
        visitUuid,
        encounterUuid,
        { billing_mode: draftMode },
      );
      setEncounter(updated);
      setIsEditing(false);
      setConfirmOpen(false);
      toast({
        title: "Billing mode updated",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Could not update billing mode",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : "Unable to change billing mode.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <span className="text-brand-muted">Loading…</span>;
  }

  if (!encounter) {
    return <span className="text-brand-muted">—</span>;
  }

  const modeChanged = draftMode !== encounter.billing_mode;

  return (
    <>
      {!isEditing ? (
        <div className="flex flex-wrap items-center gap-2">
          <span>{formatBillingModeLabel(encounter.billing_mode)}</span>
          {["waiting", "in_progress"].includes(encounter.status) ? (
            <SecondaryButton
              type="button"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => {
                setDraftMode(encounter.billing_mode);
                setIsEditing(true);
              }}
              data-testid="opd-change-billing-mode"
            >
              Change
            </SecondaryButton>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div
            className="flex flex-col gap-1.5"
            role="radiogroup"
            aria-label="Billing mode"
            data-testid="opd-billing-mode-select"
          >
            {BILLING_MODE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-start gap-2 rounded-md border px-2.5 py-2 text-xs",
                  draftMode === option.value
                    ? "border-brand-primary bg-brand-primary/5"
                    : "border-dash-border/80",
                )}
              >
                <input
                  type="radio"
                  name="opd-billing-mode"
                  value={option.value}
                  checked={draftMode === option.value}
                  disabled={isSaving}
                  onChange={() => setDraftMode(option.value)}
                  className="mt-0.5"
                  data-testid={`opd-billing-mode-option-${option.value}`}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <SecondaryButton
              type="button"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={isSaving}
              onClick={() => {
                setDraftMode(encounter.billing_mode);
                setIsEditing(false);
              }}
            >
              Cancel
            </SecondaryButton>
            <SecondaryButton
              type="button"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={isSaving || !modeChanged}
              onClick={() => setConfirmOpen(true)}
              data-testid="opd-billing-mode-save"
            >
              Save
            </SecondaryButton>
          </div>
        </div>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className={cn("sm:max-w-md", appFont.className)}>
          <DialogHeader>
            <DialogTitle>Change billing mode?</DialogTitle>
            <DialogDescription>
              Switch from {formatBillingModeLabel(encounter.billing_mode)} to{" "}
              {formatBillingModeLabel(draftMode)}. Charge lines for this
              department encounter will move to the matching draft sales order
              when that order is still mutable. The change is blocked if any
              linked line has been dispensed or invoiced.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isSaving}
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="button"
              disabled={isSaving}
              onClick={() => void handleConfirmChange()}
              data-testid="opd-billing-mode-confirm"
            >
              {isSaving ? "Updating…" : "Confirm change"}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

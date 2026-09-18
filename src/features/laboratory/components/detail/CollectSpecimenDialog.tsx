"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import type {
  LabOrder,
  LabSpecimen,
  LabSpecimenType,
} from "@/features/laboratory/types/laboratory.types";
import {
  collectLabSpecimen,
  fetchLabSpecimenTypes,
} from "@/features/laboratory/services/laboratory.service";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { getErrorMessage } from "@/lib/fetch-error";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type CollectSpecimenDialogProps = {
  order: LabOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCollected: (specimen: LabSpecimen) => void;
};

export function CollectSpecimenDialog({
  order,
  open,
  onOpenChange,
  onCollected,
}: CollectSpecimenDialogProps) {
  const { toast } = useToast();
  const [specimenTypes, setSpecimenTypes] = useState<LabSpecimenType[]>([]);
  const [specimenTypeUuid, setSpecimenTypeUuid] = useState("");
  const [selectedItemUuids, setSelectedItemUuids] = useState<string[]>([]);
  const [condition, setCondition] = useState("");
  const [barcode, setBarcode] = useState("");
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const collectibleItems = useMemo(
    () =>
      order.items.filter(
        (item) =>
          item.status !== "CANCELLED" && item.status !== "RELEASED",
      ),
    [order.items],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    void (async () => {
      const itemUuids = order.items
        .filter(
          (item) => item.status !== "CANCELLED" && item.status !== "RELEASED",
        )
        .map((item) => item.uuid);

      await Promise.resolve();
      if (cancelled) {
        return;
      }

      setSpecimenTypeUuid("");
      setSelectedItemUuids(itemUuids);
      setCondition("");
      setBarcode("");
      setError(null);
      setIsLoadingTypes(true);

      try {
        const response = await fetchLabSpecimenTypes();
        if (!cancelled) {
          setSpecimenTypes(response.results);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTypes(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, order.items]);

  function toggleItem(uuid: string) {
    setSelectedItemUuids((current) =>
      current.includes(uuid)
        ? current.filter((item) => item !== uuid)
        : [...current, uuid],
    );
  }

  async function handleSubmit() {
    if (!specimenTypeUuid || selectedItemUuids.length === 0) {
      setError("Select a specimen type and at least one order item.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const specimen = await collectLabSpecimen(order.uuid, {
        specimen_type_uuid: specimenTypeUuid,
        order_item_uuids: selectedItemUuids,
        condition: condition.trim() || undefined,
        barcode: barcode.trim() || null,
      });
      onCollected(specimen);
      toast({
        variant: "success",
        title: "Specimen collected",
        description: `${specimen.specimen_type_name} was recorded for this order.`,
      });
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
      title="Collect specimen"
      description="Record specimen collection for one or more tests on this order."
      className={cn("sm:max-w-lg", appFont.className)}
      data-testid="collect-specimen-dialog"
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
            disabled={isSubmitting || isLoadingTypes}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Collecting…
              </>
            ) : (
              "Collect specimen"
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
          <Label htmlFor="lab-specimen-type">Specimen type</Label>
          <Select
            value={specimenTypeUuid}
            onValueChange={setSpecimenTypeUuid}
            disabled={isLoadingTypes}
          >
            <SelectTrigger id="lab-specimen-type">
              <SelectValue
                placeholder={
                  isLoadingTypes ? "Loading types…" : "Select specimen type"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {specimenTypes.map((type) => (
                <SelectItem key={type.uuid} value={type.uuid}>
                  {type.name} ({type.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Order items</Label>
          <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-dash-border p-3">
            {collectibleItems.length === 0 ? (
              <p className="text-sm text-brand-muted">No collectible items.</p>
            ) : (
              collectibleItems.map((item) => (
                <label
                  key={item.uuid}
                  className="flex cursor-pointer items-start gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={selectedItemUuids.includes(item.uuid)}
                    onChange={() => toggleItem(item.uuid)}
                  />
                  <span>
                    <span className="font-medium text-brand-navy">
                      {item.test_name}
                    </span>
                    <span className="ml-1 font-mono text-xs text-brand-muted">
                      {item.test_code}
                    </span>
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lab-specimen-condition">Condition (optional)</Label>
          <input
            id="lab-specimen-condition"
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
            className="h-9 w-full rounded-lg border border-dash-border bg-white px-3 text-sm"
            placeholder="e.g. Adequate volume"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lab-specimen-barcode">Barcode (optional)</Label>
          <input
            id="lab-specimen-barcode"
            value={barcode}
            onChange={(event) => setBarcode(event.target.value)}
            className="h-9 w-full rounded-lg border border-dash-border bg-white px-3 font-mono text-sm"
            placeholder="Scan or enter barcode"
          />
        </div>
      </div>
    </SectionedDialog>
  );
}

"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchCatalogPricelists,
  startCatalogPricelistCopy,
} from "@/features/catalog/services/catalog.service";
import type { CatalogPricelist } from "@/features/catalog/types/catalog.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type CopyPricelistProductsDialogProps = {
  targetPricelist: CatalogPricelist;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopyStarted: (jobUuid: string, toastId: string | number) => void;
};

type DialogStep = "select" | "confirm";

export function CopyPricelistProductsDialog({
  targetPricelist,
  open,
  onOpenChange,
  onCopyStarted,
}: CopyPricelistProductsDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<DialogStep>("select");
  const [options, setOptions] = useState<CatalogPricelist[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [selectedUuid, setSelectedUuid] = useState("");
  const [selectOpen, setSelectOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep("select");
      setSelectedUuid("");
      setSearch("");
      return;
    }

    let cancelled = false;

    async function loadOptions() {
      setIsLoadingOptions(true);
      try {
        const response = await fetchCatalogPricelists({ pageSize: 200 });
        if (!cancelled) {
          setOptions(
            response.results.filter(
              (pricelist) =>
                pricelist.uuid !== targetPricelist.uuid &&
                pricelist.is_active &&
                pricelist.currency_code === targetPricelist.currency_code,
            ),
          );
          setSelectedUuid("");
        }
      } catch (error) {
        if (!cancelled) {
          setOptions([]);
          toast({
            variant: "error",
            title: "Could not load pricelists",
            description:
              error instanceof Error ? error.message : "Try again in a moment.",
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOptions(false);
        }
      }
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [open, targetPricelist.currency_code, targetPricelist.uuid, toast]);

  const filteredOptions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return options;
    }
    return options.filter(
      (option) =>
        option.name.toLowerCase().includes(term) ||
        option.currency_code.toLowerCase().includes(term),
    );
  }, [options, search]);

  const selectedPricelist = useMemo(
    () => options.find((option) => option.uuid === selectedUuid) ?? null,
    [options, selectedUuid],
  );

  function handleContinue() {
    if (!selectedUuid) {
      toast({
        variant: "error",
        title: "Select a source pricelist",
        description: "Choose which pricelist to copy products from.",
      });
      return;
    }

    setStep("confirm");
  }

  async function handleConfirmCopy() {
    if (!selectedUuid || !selectedPricelist) {
      return;
    }

    setIsSubmitting(true);
    try {
      const job = await startCatalogPricelistCopy(targetPricelist.uuid, {
        source_pricelist_uuid: selectedUuid,
      });
      const toastId = toast({
        variant: "loading",
        id: `pricelist-copy-${job.uuid}`,
        title: "Copying products",
        description: `Copying from ${selectedPricelist.name} into ${targetPricelist.name}.`,
      });
      onCopyStarted(job.uuid, toastId);
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not start copy",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-lg", appFont.className)}>
        {step === "select" ? (
          <>
            <DialogHeader>
              <DialogTitle>Copy products from another pricelist</DialogTitle>
              <DialogDescription>
                Choose a source pricelist to copy all products and fixed prices into{" "}
                {targetPricelist.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="copy-source-pricelist">Source pricelist</Label>
              <Select
                value={selectedUuid}
                open={selectOpen}
                disabled={isLoadingOptions || isSubmitting}
                onOpenChange={(nextOpen) => {
                  setSelectOpen(nextOpen);
                  if (!nextOpen) {
                    setSearch("");
                  }
                }}
                onValueChange={setSelectedUuid}
              >
                <SelectTrigger id="copy-source-pricelist">
                  <SelectValue
                    placeholder={
                      isLoadingOptions ? "Loading pricelists..." : "Select a pricelist"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <div className="border-b border-brand-border p-2">
                    <Input
                      value={search}
                      placeholder="Search pricelists..."
                      className="h-9"
                      onChange={(event) => setSearch(event.target.value)}
                      onKeyDown={(event) => event.stopPropagation()}
                    />
                  </div>
                  {isLoadingOptions ? (
                    <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-brand-muted">
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Loading...
                    </div>
                  ) : filteredOptions.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-brand-muted">
                      No matching pricelists with the same currency.
                    </div>
                  ) : (
                    filteredOptions.map((option) => (
                      <SelectItem key={option.uuid} value={option.uuid}>
                        <div className="flex flex-col items-start">
                          <span>{option.name}</span>
                          <span className="text-xs text-brand-muted">
                            {option.currency_code}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <SecondaryButton
                type="button"
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="button"
                disabled={isLoadingOptions || !selectedUuid}
                onClick={handleContinue}
              >
                Continue
              </PrimaryButton>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Confirm product copy</DialogTitle>
              <DialogDescription>
                This will copy all products and fixed prices from the source pricelist
                into {targetPricelist.name}. The target pricelist must remain empty
                until the copy completes.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg border border-brand-border bg-brand-surface/40 p-4 text-sm">
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-brand-muted">
                    From
                  </dt>
                  <dd className="mt-1 font-medium text-brand-navy">
                    {selectedPricelist?.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-brand-muted">
                    Into
                  </dt>
                  <dd className="mt-1 font-medium text-brand-navy">{targetPricelist.name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-brand-muted">
                    Currency
                  </dt>
                  <dd className="mt-1 text-brand-navy">{targetPricelist.currency_code}</dd>
                </div>
              </dl>
            </div>

            <DialogFooter>
              <SecondaryButton
                type="button"
                disabled={isSubmitting}
                onClick={() => setStep("select")}
              >
                Back
              </SecondaryButton>
              <PrimaryButton
                type="button"
                disabled={isSubmitting}
                onClick={() => void handleConfirmCopy()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Starting...
                  </>
                ) : (
                  "Confirm copy"
                )}
              </PrimaryButton>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

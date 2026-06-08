"use client";

import { Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOrganizationCurrency } from "@/features/settings/services/settings.service";
import type { TenantCurrency } from "@/features/settings/types/settings.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type UpdateTenantCurrencyDialogProps = {
  currencyData: TenantCurrency | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (currencyData: TenantCurrency) => void;
};

export function UpdateTenantCurrencyDialog({
  currencyData,
  open,
  onOpenChange,
  onUpdated,
}: UpdateTenantCurrencyDialogProps) {
  const { toast } = useToast();
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && currencyData) {
      setSelectedCurrencyId(String(currencyData.currency.id));
    }
  }, [currencyData, open]);

  const handleSave = async () => {
    const currencyId = Number.parseInt(selectedCurrencyId, 10);

    if (!Number.isFinite(currencyId) || currencyId < 1) {
      toast({
        variant: "error",
        title: "Select a currency",
        description: "Choose a currency before saving.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const updated = await updateOrganizationCurrency({ currency_id: currencyId });
      onUpdated(updated);
      onOpenChange(false);
      toast({
        variant: "success",
        title: "Currency updated",
        description: `${updated.currency.full_name} is now your organization currency.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update currency",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-md", appFont.className)}>
        <DialogHeader>
          <DialogTitle>Update currency</DialogTitle>
          <DialogDescription>
            Set the default currency used for billing and financial records in
            your ERP.
          </DialogDescription>
        </DialogHeader>

        {currencyData ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-brand-navy">Currency</p>
            <Select
              value={selectedCurrencyId}
              onValueChange={setSelectedCurrencyId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {currencyData.available_currencies.map((currency) => (
                  <SelectItem key={currency.id} value={String(currency.id)}>
                    {currency.full_name} ({currency.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <p className="text-sm text-brand-muted">Loading currencies...</p>
        )}

        <DialogFooter>
          <SecondaryButton
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || !currencyData}
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import { Input } from "@/components/ui/input";
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

const COMMON_CURRENCY_CODES = ["MWK", "USD", "ZAR", "GBP", "EUR", "KES", "TZS", "ZMW"] as const;

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
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState("");
  const [customCurrencyCode, setCustomCurrencyCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && currencyData) {
      const code = currencyData.currency_code.toUpperCase();
      setSelectedCurrencyCode(
        COMMON_CURRENCY_CODES.includes(code as (typeof COMMON_CURRENCY_CODES)[number])
          ? code
          : "custom",
      );
      setCustomCurrencyCode(
        COMMON_CURRENCY_CODES.includes(code as (typeof COMMON_CURRENCY_CODES)[number])
          ? ""
          : code,
      );
    }
  }, [currencyData, open]);

  const handleSave = async () => {
    const currencyCode = (
      selectedCurrencyCode === "custom"
        ? customCurrencyCode
        : selectedCurrencyCode
    )
      .trim()
      .toUpperCase();

    if (!/^[A-Z]{3}$/.test(currencyCode)) {
      toast({
        variant: "error",
        title: "Invalid currency code",
        description: "Enter a three-letter ISO currency code (for example, MWK).",
      });
      return;
    }

    setIsSaving(true);

    try {
      const updated = await updateOrganizationCurrency({ currency_code: currencyCode });
      onUpdated(updated);
      onOpenChange(false);
      toast({
        variant: "success",
        title: "Currency updated",
        description: `${updated.currency_code} is now your organization currency.`,
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
            Set the default currency used for billing and financial records.
          </DialogDescription>
        </DialogHeader>

        {currencyData ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-brand-navy">Currency</p>
              <Select
                value={selectedCurrencyCode}
                onValueChange={setSelectedCurrencyCode}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {COMMON_CURRENCY_CODES.map((code) => (
                    <SelectItem key={code} value={code}>
                      {code}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Other (ISO code)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedCurrencyCode === "custom" ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-brand-navy">ISO code</p>
                <Input
                  value={customCurrencyCode}
                  onChange={(event) =>
                    setCustomCurrencyCode(event.target.value.toUpperCase())
                  }
                  maxLength={3}
                  placeholder="MWK"
                />
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-brand-muted">Loading currency...</p>
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

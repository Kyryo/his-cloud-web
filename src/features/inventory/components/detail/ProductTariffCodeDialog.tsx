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
import { fetchInsuranceSchemes } from "@/features/customers/services/insurance-schemes.service";
import type { InsuranceScheme } from "@/features/customers/types/customer-insurance.types";
import {
  createProductTariffCode,
  updateProductTariffCode,
} from "@/features/inventory/services/inventory.service";
import type { ProductTariffCode } from "@/features/inventory/types/inventory.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type ProductTariffCodeDialogProps = {
  productId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingCodes: ProductTariffCode[];
  editingCode?: ProductTariffCode | null;
  onSaved: () => void;
};

export function ProductTariffCodeDialog({
  productId,
  open,
  onOpenChange,
  existingCodes,
  editingCode = null,
  onSaved,
}: ProductTariffCodeDialogProps) {
  const { toast } = useToast();
  const [schemes, setSchemes] = useState<InsuranceScheme[]>([]);
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(false);
  const [schemeUuid, setSchemeUuid] = useState("");
  const [tariffCode, setTariffCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(editingCode);
  const usedSchemeUuids = useMemo(
    () => new Set(existingCodes.map((entry) => entry.scheme_uuid)),
    [existingCodes],
  );
  const availableSchemes = useMemo(
    () =>
      schemes.filter(
        (scheme) =>
          scheme.is_active &&
          (isEditing
            ? scheme.uuid === editingCode?.scheme_uuid
            : !usedSchemeUuids.has(scheme.uuid)),
      ),
    [editingCode?.scheme_uuid, isEditing, schemes, usedSchemeUuids],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setSchemeUuid(editingCode?.scheme_uuid ?? "");
    setTariffCode(editingCode?.tariff_code ?? "");

    let cancelled = false;

    void (async () => {
      setIsLoadingSchemes(true);
      try {
        const data = await fetchInsuranceSchemes();
        if (!cancelled) {
          setSchemes(data);
        }
      } catch {
        if (!cancelled) {
          toast({
            variant: "error",
            title: "Could not load insurance schemes",
            description: "Try again or contact your administrator.",
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSchemes(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [editingCode, open, toast]);

  async function handleSubmit() {
    if (!schemeUuid.trim() || !tariffCode.trim()) {
      toast({
        variant: "error",
        title: "Missing information",
        description: "Select an insurance scheme and enter a tariff code.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && editingCode) {
        await updateProductTariffCode(productId, editingCode.scheme_uuid, {
          tariff_code: tariffCode.trim(),
        });
        toast({
          variant: "success",
          title: "Tariff code updated",
          description: "The insurance tariff code was saved.",
        });
      } else {
        await createProductTariffCode(productId, {
          scheme: schemeUuid,
          tariff_code: tariffCode.trim(),
        });
        toast({
          variant: "success",
          title: "Tariff code added",
          description: "The insurance tariff code was linked to this product.",
        });
      }

      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: isEditing ? "Could not update tariff code" : "Could not add tariff code",
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
      <DialogContent className={cn("sm:max-w-md", appFont.className)}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit tariff code" : "Add tariff code"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the tariff code used for this insurance scheme."
              : "Link this product to an insurance scheme with a tariff code."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="tariff-scheme">Insurance scheme</Label>
            {isLoadingSchemes ? (
              <div className="flex items-center gap-2 text-sm text-brand-muted">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Loading schemes...
              </div>
            ) : (
              <Select
                value={schemeUuid}
                onValueChange={setSchemeUuid}
                disabled={isEditing || isSubmitting}
              >
                <SelectTrigger id="tariff-scheme">
                  <SelectValue placeholder="Select a scheme" />
                </SelectTrigger>
                <SelectContent>
                  {availableSchemes.map((scheme) => (
                    <SelectItem key={scheme.uuid} value={scheme.uuid}>
                      {scheme.insurance_company_name} · {scheme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tariff-code">Tariff code</Label>
            <Input
              id="tariff-code"
              value={tariffCode}
              disabled={isSubmitting}
              placeholder="e.g. 03001"
              onChange={(event) => setTariffCode(event.target.value)}
            />
          </div>
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
            disabled={isSubmitting || isLoadingSchemes}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : isEditing ? (
              "Save changes"
            ) : (
              "Add tariff code"
            )}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { PrimaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateInventoryProduct } from "@/features/inventory/services/inventory.service";
import {
  MAX_CHARGE_OCCURRENCES,
  MIN_CHARGE_OCCURRENCES,
  productBillingSchema,
} from "@/features/inventory/schemas/product-billing.schema";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type ProductDetailBillingTabProps = {
  product: InventoryProduct;
  isActive: boolean;
  onProductUpdated?: (product: InventoryProduct) => void;
};

export function ProductDetailBillingTab({
  product,
  isActive,
  onProductUpdated,
}: ProductDetailBillingTabProps) {
  const { toast } = useToast();
  const [chargeOccurrences, setChargeOccurrences] = useState(
    String(product.charge_occurrences ?? MIN_CHARGE_OCCURRENCES),
  );
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setFieldError(null);

    const parsed = productBillingSchema.safeParse({
      charge_occurrences: chargeOccurrences,
    });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Invalid charge occurrences.");
      return;
    }

    try {
      setIsSaving(true);
      const updated = await updateInventoryProduct(product.uuid, {
        charge_occurrences: parsed.data.charge_occurrences,
      });
      onProductUpdated?.(updated);
      toast({
        title: "Billing settings saved",
        description: "Charge occurrences were updated for this product.",
        variant: "success",
      });
    } catch (err) {
      const message =
        err instanceof BffError
          ? formatBffErrorMessage(err.message, err.errors)
          : err instanceof Error
            ? err.message
            : "Failed to save billing settings.";
      toast({
        title: "Could not save billing settings",
        description: message,
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      className={cn(!isActive && "hidden")}
      data-testid="product-billing-tab"
    >
      <form
        onSubmit={(event) => void handleSave(event)}
        className="w-full space-y-6 rounded-xl border border-brand-border bg-white p-6"
      >
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-brand-ink">Charge occurrences</h2>
          <p className="text-sm text-muted-foreground">
            Configure how many separate sales order line items are created when this
            product is ordered.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="charge-occurrences">Number of occurrences</Label>
          <Input
            id="charge-occurrences"
            type="number"
            min={MIN_CHARGE_OCCURRENCES}
            max={MAX_CHARGE_OCCURRENCES}
            step={1}
            value={chargeOccurrences}
            disabled={isSaving}
            onChange={(event) => setChargeOccurrences(event.target.value)}
            data-testid="charge-occurrences-input"
          />
          <p className="text-sm text-muted-foreground">
            Each occurrence creates a separate sales order line item (quantity stays
            per line). Allowed range: {MIN_CHARGE_OCCURRENCES}–{MAX_CHARGE_OCCURRENCES}.
          </p>
          {fieldError ? (
            <p className="text-sm text-destructive" data-testid="charge-occurrences-error">
              {fieldError}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end">
          <PrimaryButton type="submit" disabled={isSaving} data-testid="save-billing-button">
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}

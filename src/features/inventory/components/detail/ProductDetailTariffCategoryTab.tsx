"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { fetchTariffCategories } from "@/features/claims/services/claims.service";
import type { TariffCategory } from "@/features/claims/types/claims.types";
import { TariffCategoryPicker } from "@/features/inventory/components/detail/TariffCategoryPicker";
import { updateInventoryProduct } from "@/features/inventory/services/inventory.service";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type ProductDetailTariffCategoryTabProps = {
  product: InventoryProduct;
  isActive: boolean;
  onProductUpdated?: (product: InventoryProduct) => void;
};

function readProductTariffCategory(product: InventoryProduct): string {
  const meta = product.metadata ?? {};
  const value =
    meta.claims_tariff_category ?? meta.tariff_category ?? meta.claim_category;
  return typeof value === "string" ? value.trim() : "";
}

export function ProductDetailTariffCategoryTab({
  product,
  isActive,
  onProductUpdated,
}: ProductDetailTariffCategoryTabProps) {
  const { toast } = useToast();
  const storedCode = readProductTariffCategory(product);
  const [selectedCategory, setSelectedCategory] = useState<TariffCategory | null>(
    null,
  );
  const [selectedCode, setSelectedCode] = useState(storedCode);
  const [hasCategories, setHasCategories] = useState<boolean | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const checkAvailability = useCallback(async () => {
    try {
      setIsCheckingAvailability(true);
      setAvailabilityError(null);
      const response = await fetchTariffCategories({ pageSize: 1 });
      setHasCategories((response.pagination?.count ?? response.results.length) > 0);
    } catch (err) {
      setHasCategories(null);
      setAvailabilityError(
        err instanceof Error
          ? err.message
          : "Failed to load tariff categories.",
      );
    } finally {
      setIsCheckingAvailability(false);
    }
  }, []);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    void checkAvailability();
  }, [checkAvailability, isActive]);

  useEffect(() => {
    const nextCode = readProductTariffCategory(product);
    setSelectedCode(nextCode);
    setSelectedCategory(null);
  }, [product]);

  async function persistCategory(code: string) {
    try {
      setIsSaving(true);
      const updated = await updateInventoryProduct(product.uuid, {
        x_meta: {
          claims_tariff_category: code,
        },
      });
      setSelectedCode(code);
      if (!code) {
        setSelectedCategory(null);
      }
      onProductUpdated?.(updated);
      toast({
        title: "Tariff category saved",
        description: code
          ? "Claims tariff category was updated for this product."
          : "Claims tariff category was cleared for this product.",
        variant: "success",
      });
    } catch (err) {
      const message =
        err instanceof BffError
          ? formatBffErrorMessage(err.message, err.errors)
          : err instanceof Error
            ? err.message
            : "Failed to save tariff category.";
      toast({
        title: "Could not save tariff category",
        description: message,
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    await persistCategory(selectedCode);
  }

  async function handleClear() {
    await persistCategory("");
  }

  const showPicker = hasCategories === true;
  const showEmpty = hasCategories === false;
  const canClear = Boolean(selectedCode);

  return (
    <div
      className={cn(!isActive && "hidden")}
      data-testid="product-tariff-category-tab"
    >
      <form
        onSubmit={(event) => void handleSave(event)}
        className="w-full space-y-6 rounded-xl border border-brand-border bg-white p-6"
      >
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-brand-ink">Tariff category</h2>
          <p className="text-sm text-muted-foreground">
            Tag this product with a claims tariff category used by the claims
            advisor. Categories are scoped to your tenant&apos;s insurance
            schemes.
          </p>
        </div>

        {isCheckingAvailability ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading tariff categories...
          </div>
        ) : null}

        {availabilityError ? (
          <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{availabilityError}</p>
            <SecondaryButton type="button" onClick={() => void checkAvailability()}>
              Try again
            </SecondaryButton>
          </div>
        ) : null}

        {showEmpty ? (
          <div
            className="space-y-3 rounded-lg border border-dashed border-brand-border bg-slate-50/80 px-4 py-6 text-sm text-muted-foreground"
            data-testid="tariff-category-empty"
          >
            <p>
              No tariff categories are available for this tenant yet. Load scheme
              validation packs (or configure insurance schemes) before assigning a
              category.
            </p>
            {storedCode ? (
              <p>
                Current value: <code className="text-xs">{storedCode}</code>
              </p>
            ) : null}
          </div>
        ) : null}

        {showPicker ? (
          <TariffCategoryPicker
            category={selectedCategory}
            categoryCode={selectedCode || null}
            disabled={isSaving}
            onCategoryChange={(next) => {
              setSelectedCategory(next);
              setSelectedCode(next?.code ?? "");
            }}
          />
        ) : null}

        {showPicker || (showEmpty && canClear) ? (
          <div className="flex flex-wrap justify-end gap-2">
            {canClear ? (
              <SecondaryButton
                type="button"
                disabled={isSaving}
                onClick={() => void handleClear()}
                data-testid="clear-tariff-category-button"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Clearing...
                  </>
                ) : (
                  "Clear category"
                )}
              </SecondaryButton>
            ) : null}
            {showPicker ? (
              <PrimaryButton
                type="submit"
                disabled={isSaving || selectedCode === storedCode}
                data-testid="save-tariff-category-button"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </PrimaryButton>
            ) : null}
          </div>
        ) : null}
      </form>
    </div>
  );
}

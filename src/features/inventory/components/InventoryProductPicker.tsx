"use client";

import { useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { SearchableSelect, SelectItem } from "@/components/ui/searchable-select";
import { searchInventoryProducts } from "@/features/inventory/services/inventory.service";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { formatProductLabel } from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

const BATCH_ELIGIBLE_PRODUCT_TYPES = new Set(["product", "consu"]);

type InventoryProductPickerProps = {
  id?: string;
  label?: string;
  required?: boolean;
  product: InventoryProduct | null;
  onProductChange: (product: InventoryProduct | null) => void;
  disabled?: boolean;
  invalid?: boolean;
  helperText?: string;
  filterBatchEligible?: boolean;
};

function isBatchEligibleProduct(product: InventoryProduct): boolean {
  if (!product.product_type) {
    return true;
  }
  return BATCH_ELIGIBLE_PRODUCT_TYPES.has(product.product_type);
}

export function InventoryProductPicker({
  id = "inventory-product-picker",
  label = "Product",
  required = false,
  product,
  onProductChange,
  disabled = false,
  invalid = false,
  helperText = "Search by product name or SKU.",
  filterBatchEligible = false,
}: InventoryProductPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<InventoryProduct[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const trimmedSearch = search.trim();

  useEffect(() => {
    if (!open || trimmedSearch.length < 2) {
      return;
    }

    let cancelled = false;
    const handle = window.setTimeout(() => {
      void (async () => {
        setIsLoadingResults(true);
        try {
          const products = await searchInventoryProducts({
            q: trimmedSearch,
            active: true,
          });
          const filtered = filterBatchEligible
            ? products.filter(isBatchEligibleProduct)
            : products;
          if (!cancelled) {
            setOptions(filtered);
            setIsLoadingResults(false);
          }
        } catch {
          if (!cancelled) {
            setOptions(product ? [product] : []);
            setIsLoadingResults(false);
          }
        }
      })();
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [filterBatchEligible, open, product, trimmedSearch]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
    }
  }

  function handleValueChange(uuid: string) {
    const match =
      options.find((option) => option.uuid === uuid) ??
      (product?.uuid === uuid ? product : null);

    if (match) {
      onProductChange(match);
      handleOpenChange(false);
    }
  }

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor={id}>
          {label}
          {required ? <> <RequiredFieldMarker /></> : null}
        </Label>
        {helperText ? (
          <p className="mt-1 text-xs text-brand-muted">{helperText}</p>
        ) : null}
      </div>

      <SearchableSelect
        id={id}
        value={product?.uuid}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={handleOpenChange}
        disabled={disabled}
        placeholder="Select a product"
        displayValue={product ? formatProductLabel(product) : undefined}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search products..."
        emptySearchMessage="Type at least 2 characters to search."
        noResultsMessage={
          filterBatchEligible
            ? "No stockable or consumable products found."
            : "No products found."
        }
        isLoading={isLoadingResults}
        triggerClassName={cn("w-full", invalid && "border-destructive")}
      >
        {options.map((option) => (
          <SelectItem key={option.uuid} value={option.uuid}>
            <div className="flex flex-col items-start">
              <span>{formatProductLabel(option)}</span>
              {option.product_type_label ? (
                <span className="text-xs text-brand-muted capitalize">
                  {option.product_type_label}
                </span>
              ) : null}
            </div>
          </SelectItem>
        ))}
      </SearchableSelect>
    </div>
  );
}

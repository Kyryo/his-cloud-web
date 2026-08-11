"use client";

import { useEffect, useState } from "react";

import { SearchableSelect, SelectItem } from "@/components/ui/searchable-select";
import { searchInventoryProducts } from "@/features/inventory/services/inventory.service";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { formatProductLabel } from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

export type SalesOrderLineProductSelection = {
  product_uuid: string;
  product_id: number | null;
  productName: string;
  fixed_price?: string | null;
  list_price?: string | number | null;
};

type SalesOrderLineProductPickerProps = {
  id: string;
  value: string | null;
  displayLabel?: string | null;
  disabled?: boolean;
  autoOpen?: boolean;
  className?: string;
  onSelect: (selection: SalesOrderLineProductSelection) => void;
  onFocus?: () => void;
};

function productToSelection(product: InventoryProduct): SalesOrderLineProductSelection {
  const productName = formatProductLabel(product);
  return {
    product_uuid: product.uuid,
    product_id: product.id ?? null,
    productName,
    list_price: product.list_price,
  };
}

export function SalesOrderLineProductPicker({
  id,
  value,
  displayLabel,
  disabled = false,
  autoOpen = false,
  className,
  onSelect,
  onFocus,
}: SalesOrderLineProductPickerProps) {
  const [open, setOpen] = useState(autoOpen);
  const [search, setSearch] = useState("");
  const [productOptions, setProductOptions] = useState<InventoryProduct[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  useEffect(() => {
    if (autoOpen) {
      setOpen(true);
    }
  }, [autoOpen]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }

    onFocus?.();

    if (search.trim().length < 2) {
      setProductOptions([]);
      return;
    }

    const handle = window.setTimeout(() => {
      void (async () => {
        setIsLoadingResults(true);
        try {
          // Always search all active products. Order pricelist pricing is
          // resolved after selection in SalesOrderLinesEditor.
          const products = await searchInventoryProducts({
            q: search.trim(),
            active: true,
          });
          setProductOptions(products);
        } catch {
          setProductOptions([]);
        } finally {
          setIsLoadingResults(false);
        }
      })();
    }, 250);

    return () => window.clearTimeout(handle);
  }, [onFocus, open, search]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
    }
  }

  function handleValueChange(selectedUuid: string) {
    const match = productOptions.find((option) => option.uuid === selectedUuid);
    if (match) {
      onSelect(productToSelection(match));
      setOpen(false);
    }
  }

  return (
    <SearchableSelect
      id={id}
      value={value ?? ""}
      onValueChange={handleValueChange}
      open={open}
      onOpenChange={handleOpenChange}
      disabled={disabled}
      placeholder="Select a product"
      displayValue={displayLabel ?? undefined}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search products..."
      isLoading={isLoadingResults}
      noResultsMessage="No products found."
      triggerClassName={cn("min-w-[12rem]", className)}
    >
      {productOptions.map((option) => (
        <SelectItem key={option.uuid} value={option.uuid}>
          <div className="flex flex-col items-start">
            <span>{formatProductLabel(option)}</span>
            {option.default_code ? (
              <span className="text-xs text-brand-muted">
                {option.default_code}
              </span>
            ) : null}
          </div>
        </SelectItem>
      ))}
    </SearchableSelect>
  );
}

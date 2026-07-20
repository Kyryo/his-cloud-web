"use client";

import { useEffect, useState } from "react";

import { SearchableSelect, SelectItem } from "@/components/ui/searchable-select";
import { searchInventoryProducts } from "@/features/inventory/services/inventory.service";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { formatProductLabel } from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

export type ProductSearchSelection = {
  product_uuid: string;
  product_id: number | null;
  productName: string;
  list_price?: string | number | null;
  quantity_available?: string | number;
};

type ProductSearchSelectProps = {
  id: string;
  value: string | null;
  displayLabel?: string | null;
  disabled?: boolean;
  autoOpen?: boolean;
  className?: string;
  onSelect: (selection: ProductSearchSelection) => void;
  onFocus?: () => void;
  searchProducts?: (query: string) => Promise<InventoryProduct[]>;
};

function productToSelection(product: InventoryProduct): ProductSearchSelection {
  return {
    product_uuid: product.uuid,
    product_id: product.id ?? null,
    productName: formatProductLabel(product),
    list_price: product.list_price,
    quantity_available: product.quantity_available,
  };
}

/**
 * Searchable product select for inline line-item editing.
 *
 * Mirrors `SalesOrderLineProductPicker`: SearchableSelect + debounced search,
 * and always returns an explicit `productName` so the parent never has to
 * fall back to "Product #N" fillers after selection.
 */
export function ProductSearchSelect({
  id,
  value,
  displayLabel,
  disabled = false,
  autoOpen = false,
  className,
  onSelect,
  onFocus,
  searchProducts,
}: ProductSearchSelectProps) {
  const [open, setOpen] = useState(autoOpen);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<InventoryProduct[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [selected, setSelected] = useState<{
    uuid: string;
    label: string;
  } | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    onFocus?.();

    if (search.trim().length < 2) {
      return;
    }

    const handle = window.setTimeout(() => {
      void (async () => {
        setIsLoadingResults(true);
        try {
          const products = searchProducts
            ? await searchProducts(search.trim())
            : await searchInventoryProducts({
                q: search.trim(),
                active: true,
              });
          setOptions(products);
        } catch {
          setOptions([]);
        } finally {
          setIsLoadingResults(false);
        }
      })();
    }, 250);

    return () => window.clearTimeout(handle);
  }, [onFocus, open, search, searchProducts]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
    }
  }

  function handleSearchChange(nextSearch: string) {
    setSearch(nextSearch);
    if (nextSearch.trim().length < 2) {
      setOptions([]);
    }
  }

  function handleValueChange(selectedUuid: string) {
    const match = options.find((option) => option.uuid === selectedUuid);
    if (!match) {
      return;
    }

    const selection = productToSelection(match);
    setSelected({
      uuid: selection.product_uuid,
      label: selection.productName,
    });
    onSelect(selection);
    setOpen(false);
  }

  return (
    <SearchableSelect
      id={id}
      value={value ?? undefined}
      onValueChange={handleValueChange}
      open={open}
      onOpenChange={handleOpenChange}
      disabled={disabled}
      placeholder="Select a product"
      displayValue={
        (selected?.uuid === value ? selected.label : displayLabel) || undefined
      }
      searchValue={search}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Search products..."
      isLoading={isLoadingResults}
      noResultsMessage="No products found."
      triggerClassName={cn("min-w-[12rem]", className)}
    >
      {options.map((option) => (
        <SelectItem key={option.uuid} value={option.uuid}>
          <div className="flex flex-col items-start">
            <span>{formatProductLabel(option)}</span>
            {option.default_code ? (
              <span className="text-xs text-brand-muted">{option.default_code}</span>
            ) : null}
            {option.quantity_available != null ? (
              <span className="text-xs text-brand-muted">
                {option.quantity_available} available
              </span>
            ) : null}
          </div>
        </SelectItem>
      ))}
    </SearchableSelect>
  );
}

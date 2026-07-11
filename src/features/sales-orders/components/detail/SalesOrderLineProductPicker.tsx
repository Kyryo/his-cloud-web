"use client";

import { useEffect, useState } from "react";

import { SearchableSelect, SelectItem } from "@/components/ui/searchable-select";
import { fetchCatalogPricelistProducts } from "@/features/catalog/services/catalog.service";
import type { CatalogPricelistMembership } from "@/features/catalog/types/catalog.types";
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
  pricelistUuid?: string | null;
  disabled?: boolean;
  autoOpen?: boolean;
  className?: string;
  onSelect: (selection: SalesOrderLineProductSelection) => void;
  onFocus?: () => void;
};

function membershipToSelection(
  membership: CatalogPricelistMembership,
): SalesOrderLineProductSelection {
  const productName = membership.product_name?.trim() || membership.product_uuid;
  return {
    product_uuid: membership.product_uuid,
    product_id: null,
    productName,
    fixed_price:
      membership.fixed_price != null ? String(membership.fixed_price) : null,
  };
}

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
  pricelistUuid,
  disabled = false,
  autoOpen = false,
  className,
  onSelect,
  onFocus,
}: SalesOrderLineProductPickerProps) {
  const [open, setOpen] = useState(autoOpen);
  const [search, setSearch] = useState("");
  const [pricelistOptions, setPricelistOptions] = useState<
    CatalogPricelistMembership[]
  >([]);
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
      setPricelistOptions([]);
      setProductOptions([]);
      return;
    }

    const handle = window.setTimeout(() => {
      void (async () => {
        setIsLoadingResults(true);
        try {
          const term = search.trim();
          if (pricelistUuid) {
            const response = await fetchCatalogPricelistProducts(pricelistUuid, {
              search: term,
              pageSize: 20,
            });
            setPricelistOptions(response.results);
            setProductOptions([]);
          } else {
            const products = await searchInventoryProducts({
              q: term,
              active: true,
            });
            setProductOptions(products);
            setPricelistOptions([]);
          }
        } catch {
          setPricelistOptions([]);
          setProductOptions([]);
        } finally {
          setIsLoadingResults(false);
        }
      })();
    }, 250);

    return () => window.clearTimeout(handle);
  }, [onFocus, open, pricelistUuid, search]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
    }
  }

  function handleValueChange(selectedUuid: string) {
    if (pricelistUuid) {
      const match = pricelistOptions.find(
        (option) => option.product_uuid === selectedUuid,
      );
      if (match) {
        onSelect(membershipToSelection(match));
        setOpen(false);
      }
      return;
    }

    const match = productOptions.find((option) => option.uuid === selectedUuid);
    if (match) {
      onSelect(productToSelection(match));
      setOpen(false);
    }
  }

  const searchPlaceholder = pricelistUuid
    ? "Search by name or tariff code..."
    : "Search products...";

  return (
    <SearchableSelect
      id={id}
      value={value ?? undefined}
      onValueChange={handleValueChange}
      open={open}
      onOpenChange={handleOpenChange}
      disabled={disabled}
      placeholder="Select a product"
      displayValue={displayLabel ?? undefined}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder={searchPlaceholder}
      isLoading={isLoadingResults}
      noResultsMessage="No products found."
      triggerClassName={cn("min-w-[12rem]", className)}
    >
      {pricelistUuid
        ? pricelistOptions.map((option) => (
            <SelectItem key={option.product_uuid} value={option.product_uuid}>
              <span>{option.product_name?.trim() || option.product_uuid}</span>
            </SelectItem>
          ))
        : productOptions.map((option) => (
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

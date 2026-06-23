"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { searchInventoryProducts } from "@/features/inventory/services/inventory.service";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { formatProductLabel } from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

const BATCH_ELIGIBLE_PRODUCT_TYPES = new Set(["product", "consu"]);

type ProductOption = {
  uuid: string;
  label: string;
  product: InventoryProduct;
};

type BatchProductComboboxProps = {
  id?: string;
  label?: string;
  value: string | null;
  disabled?: boolean;
  className?: string;
  onSelect: (product: InventoryProduct | null) => void;
};

function toProductOption(product: InventoryProduct): ProductOption {
  return {
    uuid: product.uuid,
    label: formatProductLabel(product),
    product,
  };
}

function isBatchEligibleProduct(product: InventoryProduct): boolean {
  if (!product.product_type) {
    return true;
  }
  return BATCH_ELIGIBLE_PRODUCT_TYPES.has(product.product_type);
}

export function BatchProductCombobox({
  id = "batch-product-search",
  label = "Product",
  value,
  disabled = false,
  className,
  onSelect,
}: BatchProductComboboxProps) {
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [committedProduct, setCommittedProduct] = useState<InventoryProduct | null>(
    null,
  );
  const [inputValue, setInputValue] = useState("");
  const suppressNextSearchRef = useRef(false);

  const selectedOption = useMemo(
    () => (committedProduct ? toProductOption(committedProduct) : null),
    [committedProduct],
  );

  useEffect(() => {
    if (!value) {
      setCommittedProduct(null);
      setInputValue("");
      setOptions([]);
    }
  }, [value]);

  useEffect(() => {
    if (suppressNextSearchRef.current) {
      suppressNextSearchRef.current = false;
      return;
    }

    if (committedProduct && inputValue.trim() === formatProductLabel(committedProduct)) {
      return;
    }

    if (inputValue.trim().length < 2) {
      setOptions([]);
      return;
    }

    const handle = window.setTimeout(() => {
      void (async () => {
        setIsSearching(true);
        try {
          const products = await searchInventoryProducts({
            q: inputValue.trim(),
            active: true,
          });
          setOptions(
            products.filter(isBatchEligibleProduct).map(toProductOption),
          );
        } catch {
          setOptions([]);
        } finally {
          setIsSearching(false);
        }
      })();
    }, 250);

    return () => window.clearTimeout(handle);
  }, [committedProduct, inputValue]);

  function commitSelection(product: InventoryProduct) {
    const label = formatProductLabel(product);
    setCommittedProduct(product);
    setInputValue(label);
    suppressNextSearchRef.current = true;
    onSelect(product);
  }

  function clearSelection() {
    setCommittedProduct(null);
    setInputValue("");
    setOptions([]);
    onSelect(null);
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>
        {label} <RequiredFieldMarker />
      </Label>
      <Combobox
        items={options}
        filter={null}
        value={selectedOption}
        inputValue={inputValue}
        itemToStringLabel={(option) => option.label}
        itemToStringValue={(option) => option.uuid}
        isItemEqualToValue={(left, right) => left.uuid === right.uuid}
        onValueChange={(option) => {
          if (!option) {
            return;
          }
          commitSelection(option.product);
        }}
        onInputValueChange={(nextValue) => {
          setInputValue(nextValue);
          if (!nextValue.trim()) {
            clearSelection();
          }
        }}
      >
        <ComboboxInput
          id={id}
          disabled={disabled}
          placeholder="Search stockable or consumable products..."
          showClear={Boolean(committedProduct)}
          className="w-full"
          aria-busy={isSearching}
        />
        <ComboboxContent className="min-w-[var(--anchor-width)]">
          <ComboboxEmpty>
            {inputValue.trim().length < 2
              ? "Type at least 2 characters to search."
              : isSearching
                ? "Searching..."
                : "No eligible products found."}
          </ComboboxEmpty>
          <ComboboxList>
            {(option) => (
              <ComboboxItem key={option.uuid} value={option}>
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

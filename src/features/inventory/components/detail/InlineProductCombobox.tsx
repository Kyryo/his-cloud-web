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
import { searchInventoryProducts } from "@/features/inventory/services/inventory.service";
import type { InventoryProduct } from "@/features/inventory/types/inventory.types";
import { formatProductLabel } from "@/features/inventory/utils/format-inventory";
import { cn } from "@/lib/utils";

type ProductOption = {
  uuid: string;
  label: string;
  product: InventoryProduct;
};

type InlineProductComboboxProps = {
  id: string;
  value: string | null;
  displayLabel?: string | null;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  onSelect: (product: InventoryProduct) => void;
  onFocus?: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};

function toProductOption(product: InventoryProduct): ProductOption {
  return {
    uuid: product.uuid,
    label: formatProductLabel(product),
    product,
  };
}

export function InlineProductCombobox({
  id,
  value,
  displayLabel,
  disabled = false,
  autoFocus = false,
  className,
  onSelect,
  onFocus,
  onKeyDown,
}: InlineProductComboboxProps) {
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [inputValue, setInputValue] = useState(displayLabel ?? "");
  const suppressNextSearchRef = useRef(false);

  const selectedOption = useMemo(() => {
    if (!value) {
      return null;
    }

    const match = options.find((option) => option.uuid === value);
    if (match) {
      return match;
    }

    if (displayLabel) {
      return {
        uuid: value,
        label: displayLabel,
        product: { uuid: value } as InventoryProduct,
      };
    }

    return null;
  }, [displayLabel, options, value]);

  useEffect(() => {
    const nextLabel = displayLabel ?? "";
    if (nextLabel !== inputValue) {
      suppressNextSearchRef.current = true;
      setInputValue(nextLabel);
    }
  }, [displayLabel, value]);

  useEffect(() => {
    if (suppressNextSearchRef.current) {
      suppressNextSearchRef.current = false;
      return;
    }

    const selectedLabel = selectedOption?.label ?? "";
    if (value && inputValue.trim() === selectedLabel.trim()) {
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
          setOptions(products.map(toProductOption));
        } catch {
          setOptions([]);
        } finally {
          setIsSearching(false);
        }
      })();
    }, 250);

    return () => window.clearTimeout(handle);
  }, [inputValue, selectedOption?.label, value]);

  return (
    <Combobox
      items={options}
      filter={null}
      value={selectedOption}
      itemToStringLabel={(option) => option.label}
      itemToStringValue={(option) => option.uuid}
      isItemEqualToValue={(left, right) => left.uuid === right.uuid}
      onValueChange={(option) => {
        if (!option) {
          return;
        }
        onSelect(option.product);
        suppressNextSearchRef.current = true;
        setInputValue(option.label);
      }}
      onInputValueChange={(nextValue) => setInputValue(nextValue)}
    >
      <ComboboxInput
        id={id}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder="Search products..."
        showClear={Boolean(value)}
        className={cn("min-w-[12rem]", className)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        aria-busy={isSearching}
      />
      <ComboboxContent className="min-w-[16rem]">
        <ComboboxEmpty>
          {isSearching ? "Searching..." : "No products found."}
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
  );
}

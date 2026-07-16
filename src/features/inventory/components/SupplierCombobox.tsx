"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { searchInventorySuppliers } from "@/features/inventory/services/batches.service";
import { cn } from "@/lib/utils";

type SupplierOption = {
  name: string;
  isFreeText?: boolean;
};

type SupplierComboboxProps = {
  id?: string;
  label?: string;
  value: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  /** Word used in the free-text hint, e.g. "supplier" or "vendor". */
  noun?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
};

function toSupplierOption(name: string, isFreeText = false): SupplierOption {
  return { name, isFreeText };
}

export function SupplierCombobox({
  id = "batch-supplier-search",
  label = "Supplier",
  value,
  disabled = false,
  className,
  placeholder = "Search suppliers or enter a name...",
  noun = "supplier",
  onChange,
  onBlur,
}: SupplierComboboxProps) {
  const [options, setOptions] = useState<SupplierOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputValue = value;
  const selectedOption = useMemo(
    () => (value.trim() ? toSupplierOption(value.trim()) : null),
    [value],
  );

  useEffect(() => {
    if (inputValue.trim().length < 2) {
      return;
    }

    const handle = window.setTimeout(() => {
      void (async () => {
        setIsSearching(true);
        try {
          const results = await searchInventorySuppliers(inputValue.trim());
          setOptions(results.map((name) => toSupplierOption(name)));
        } catch {
          setOptions([]);
        } finally {
          setIsSearching(false);
        }
      })();
    }, 250);

    return () => window.clearTimeout(handle);
  }, [inputValue]);

  const trimmedInput = inputValue.trim();

  const freeTextOption = useMemo(() => {
    if (trimmedInput.length < 2 || isSearching) {
      return null;
    }

    const matchesExisting = options.some(
      (option) => option.name.toLowerCase() === trimmedInput.toLowerCase(),
    );
    const matchesValue = value.toLowerCase() === trimmedInput.toLowerCase();

    if (matchesExisting || matchesValue) {
      return null;
    }

    return toSupplierOption(trimmedInput, true);
  }, [isSearching, options, trimmedInput, value]);

  const comboboxItems = useMemo(
    () => (freeTextOption ? [freeTextOption, ...options] : options),
    [freeTextOption, options],
  );

  function commitValue(nextValue: string) {
    const trimmed = nextValue.trim();
    if (trimmed) {
      onChange(trimmed);
      return;
    }

    onChange("");
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <Combobox
        items={comboboxItems}
        filter={null}
        value={selectedOption}
        inputValue={inputValue}
        itemToStringLabel={(option) => option.name}
        itemToStringValue={(option) => option.name}
        isItemEqualToValue={(left, right) =>
          left.name.toLowerCase() === right.name.toLowerCase()
        }
        onValueChange={(option) => {
          if (!option) {
            return;
          }
          commitValue(option.name);
        }}
        onInputValueChange={(nextValue) => {
          onChange(nextValue);
        }}
      >
        <ComboboxInput
          id={id}
          disabled={disabled}
          placeholder={placeholder}
          showClear={Boolean(value.trim())}
          className="w-full"
          aria-busy={isSearching}
          onBlur={() => {
            if (trimmedInput) {
              commitValue(trimmedInput);
            }
            onBlur?.();
          }}
        />
        <ComboboxContent className="min-w-[var(--anchor-width)]">
          <ComboboxEmpty>
            {trimmedInput.length < 2
              ? "Type at least 2 characters to search."
              : isSearching
                ? "Searching..."
                : `No matching ${noun}s found.`}
          </ComboboxEmpty>
          <ComboboxList>
            {(option) => (
              <ComboboxItem key={option.name} value={option}>
                {option.isFreeText ? `Use "${option.name}"` : option.name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

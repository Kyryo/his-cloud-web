"use client";

import { useEffect, useRef, useState } from "react";

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

function toSupplierOption(name: string): SupplierOption {
  return { name };
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
  const [inputValue, setInputValue] = useState(value);
  const [selectedOption, setSelectedOption] = useState<SupplierOption | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!isTypingRef.current) {
      setInputValue(value);
      if (value.trim()) {
        setSelectedOption(toSupplierOption(value));
      } else {
        setSelectedOption(null);
      }
    }
  }, [value]);

  useEffect(() => {
    if (inputValue.trim().length < 2) {
      setOptions([]);
      return;
    }

    const handle = window.setTimeout(() => {
      void (async () => {
        setIsSearching(true);
        try {
          const results = await searchInventorySuppliers(inputValue.trim());
          setOptions(results.map(toSupplierOption));
        } catch {
          setOptions([]);
        } finally {
          setIsSearching(false);
        }
      })();
    }, 250);

    return () => window.clearTimeout(handle);
  }, [inputValue]);

  const showFreeTextHint =
    inputValue.trim().length >= 2 &&
    !isSearching &&
    !options.some(
      (option) => option.name.toLowerCase() === inputValue.trim().toLowerCase(),
    );

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <Combobox
        items={options}
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
          isTypingRef.current = false;
          setSelectedOption(option);
          setInputValue(option.name);
          onChange(option.name);
        }}
        onInputValueChange={(nextValue) => {
          isTypingRef.current = true;
          setInputValue(nextValue);
          setSelectedOption(null);
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
            isTypingRef.current = false;
            onBlur?.();
          }}
        />
        <ComboboxContent className="min-w-[var(--anchor-width)]">
          <ComboboxEmpty>
            {inputValue.trim().length < 2
              ? "Type at least 2 characters to search."
              : isSearching
                ? "Searching..."
                : showFreeTextHint
                  ? `Use "${inputValue.trim()}" as ${noun} name.`
                  : `No matching ${noun}s found.`}
          </ComboboxEmpty>
          <ComboboxList>
            {(option) => (
              <ComboboxItem key={option.name} value={option}>
                {option.name}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

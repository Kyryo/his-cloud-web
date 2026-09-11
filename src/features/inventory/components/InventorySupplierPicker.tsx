"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { SearchableSelect, SelectItem } from "@/components/ui/searchable-select";
import { searchInventorySuppliers } from "@/features/inventory/services/batches.service";
import { cn } from "@/lib/utils";

type InventorySupplierPickerProps = {
  id?: string;
  label?: string;
  required?: boolean;
  supplier: string;
  onSupplierChange: (supplier: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  helperText?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
};

const SEARCH_DEBOUNCE_MS = 300;

export function InventorySupplierPicker({
  id = "inventory-supplier-picker",
  label = "Supplier",
  required = false,
  supplier,
  onSupplierChange,
  disabled = false,
  invalid = false,
  helperText = "Search existing suppliers or enter a new name.",
  placeholder = "Select a supplier",
  searchPlaceholder = "Search suppliers...",
  emptyMessage = "No suppliers found.",
}: InventorySupplierPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const searchRequestIdRef = useRef(0);

  const trimmedSearch = search.trim();

  const customOption = useMemo(() => {
    if (trimmedSearch.length < 2) {
      return null;
    }

    const matchesExisting = options.some(
      (option) => option.toLowerCase() === trimmedSearch.toLowerCase(),
    );
    const matchesSelected =
      supplier.toLowerCase() === trimmedSearch.toLowerCase();

    if (matchesExisting || matchesSelected) {
      return null;
    }

    return trimmedSearch;
  }, [options, supplier, trimmedSearch]);

  useEffect(() => {
    if (!open || trimmedSearch.length < 2) {
      return;
    }

    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;

    const handle = window.setTimeout(() => {
      void (async () => {
        setIsLoadingResults(true);
        try {
          const results = await searchInventorySuppliers(trimmedSearch);
          if (searchRequestIdRef.current !== requestId) {
            return;
          }
          setOptions(results);
          setIsLoadingResults(false);
        } catch {
          if (searchRequestIdRef.current !== requestId) {
            return;
          }
          setOptions(supplier ? [supplier] : []);
          setIsLoadingResults(false);
        }
      })();
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(handle);
      if (searchRequestIdRef.current === requestId) {
        searchRequestIdRef.current += 1;
      }
    };
  }, [open, supplier, trimmedSearch]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      searchRequestIdRef.current += 1;
      setSearch("");
    }
  }

  function handleValueChange(value: string) {
    onSupplierChange(value);
    handleOpenChange(false);
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
        value={supplier || undefined}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={handleOpenChange}
        disabled={disabled}
        placeholder={placeholder}
        displayValue={supplier || undefined}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={searchPlaceholder}
        emptySearchMessage="Type at least 2 characters to search."
        noResultsMessage={emptyMessage}
        isLoading={isLoadingResults}
        triggerClassName={cn("w-full", invalid && "border-destructive")}
      >
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
        {customOption ? (
          <SelectItem value={customOption}>
            Use &ldquo;{customOption}&rdquo;
          </SelectItem>
        ) : null}
      </SearchableSelect>
    </div>
  );
}

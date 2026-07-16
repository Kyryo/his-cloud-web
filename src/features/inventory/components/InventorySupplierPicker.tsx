"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    if (!open) {
      searchRequestIdRef.current += 1;
      setSearch("");
      setIsLoadingResults(false);
      return;
    }

    if (trimmedSearch.length < 2) {
      searchRequestIdRef.current += 1;
      setOptions(supplier ? [supplier] : []);
      setIsLoadingResults(false);
      return;
    }

    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;

    const handle = window.setTimeout(() => {
      void (async () => {
        // Mark loading without clearing current options so the dropdown
        // content (and search input focus) stay stable while fetching.
        setIsLoadingResults(true);
        try {
          const results = await searchInventorySuppliers(trimmedSearch);
          if (searchRequestIdRef.current !== requestId) {
            return;
          }
          setOptions(results);
        } catch {
          if (searchRequestIdRef.current !== requestId) {
            return;
          }
          setOptions(supplier ? [supplier] : []);
        } finally {
          if (searchRequestIdRef.current === requestId) {
            setIsLoadingResults(false);
          }
        }
      })();
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(handle);
      // Invalidate in-flight work started by this effect run.
      if (searchRequestIdRef.current === requestId) {
        searchRequestIdRef.current += 1;
      }
    };
  }, [open, supplier, trimmedSearch]);

  const handleValueChange = (value: string) => {
    onSupplierChange(value);
    setOpen(false);
  };

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

      <Select
        value={supplier || undefined}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          className={cn("w-full", invalid && "border-destructive")}
          aria-invalid={invalid}
        >
          <SelectValue placeholder={placeholder}>
            {supplier || null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <div className="border-b border-brand-border p-2">
            <div className="relative">
              <Input
                value={search}
                placeholder={searchPlaceholder}
                className="h-9 pr-8"
                aria-busy={isLoadingResults}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => event.stopPropagation()}
              />
              {isLoadingResults ? (
                <Loader2
                  className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 animate-spin text-brand-muted"
                  aria-hidden="true"
                />
              ) : null}
            </div>
          </div>

          {trimmedSearch.length < 2 ? (
            <div className="px-3 py-6 text-center text-sm text-brand-muted">
              Type at least 2 characters to search.
            </div>
          ) : options.length === 0 && !customOption && !isLoadingResults ? (
            <div className="px-3 py-6 text-center text-sm text-brand-muted">
              {emptyMessage}
            </div>
          ) : options.length === 0 && !customOption && isLoadingResults ? (
            <div className="px-3 py-6 text-center text-sm text-brand-muted">
              Searching...
            </div>
          ) : (
            <>
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
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

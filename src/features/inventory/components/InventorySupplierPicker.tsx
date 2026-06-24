"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
};

export function InventorySupplierPicker({
  id = "inventory-supplier-picker",
  label = "Supplier",
  required = false,
  supplier,
  onSupplierChange,
  disabled = false,
  invalid = false,
  helperText = "Search existing suppliers or enter a new name.",
}: InventorySupplierPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  const trimmedSearch = search.trim();

  const customOption = useMemo(() => {
    if (trimmedSearch.length < 2 || isLoadingResults) {
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
  }, [isLoadingResults, options, supplier, trimmedSearch]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }

    if (trimmedSearch.length < 2) {
      setOptions(supplier ? [supplier] : []);
      return;
    }

    const handle = window.setTimeout(() => {
      void (async () => {
        setIsLoadingResults(true);
        try {
          const results = await searchInventorySuppliers(trimmedSearch);
          setOptions(results);
        } catch {
          setOptions(supplier ? [supplier] : []);
        } finally {
          setIsLoadingResults(false);
        }
      })();
    }, 250);

    return () => window.clearTimeout(handle);
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
          <SelectValue placeholder="Select a supplier">
            {supplier || null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <div className="border-b border-brand-border p-2">
            <Input
              value={search}
              placeholder="Search suppliers..."
              className="h-9"
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.stopPropagation()}
            />
          </div>

          {isLoadingResults ? (
            <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-brand-muted">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Searching...
            </div>
          ) : trimmedSearch.length < 2 ? (
            <div className="px-3 py-6 text-center text-sm text-brand-muted">
              Type at least 2 characters to search.
            </div>
          ) : options.length === 0 && !customOption ? (
            <div className="px-3 py-6 text-center text-sm text-brand-muted">
              No suppliers found.
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

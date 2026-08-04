"use client";

import { useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
import { SearchableSelect, SelectItem } from "@/components/ui/searchable-select";
import { fetchTariffCategories } from "@/features/claims/services/claims.service";
import type { TariffCategory } from "@/features/claims/types/claims.types";

const LIST_PAGE_SIZE = 200;

type TariffCategoryPickerProps = {
  category: TariffCategory | null;
  categoryCode?: string | null;
  onCategoryChange: (category: TariffCategory | null) => void;
  disabled?: boolean;
};

function formatCategoryLabel(category: TariffCategory): string {
  return `${category.name} (${category.code})`;
}

export function TariffCategoryPicker({
  category,
  categoryCode = null,
  onCategoryChange,
  disabled = false,
}: TariffCategoryPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<TariffCategory[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [resolvedCategory, setResolvedCategory] = useState<TariffCategory | null>(
    category,
  );

  const selected = category ?? resolvedCategory;
  const selectedCode = selected?.code ?? categoryCode ?? null;

  useEffect(() => {
    setResolvedCategory(category);
  }, [category]);

  useEffect(() => {
    if (category || !categoryCode?.trim()) {
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const response = await fetchTariffCategories({
          search: categoryCode.trim(),
          pageSize: LIST_PAGE_SIZE,
        });
        const match =
          response.results.find((row) => row.code === categoryCode.trim()) ?? null;
        if (!cancelled && match) {
          setResolvedCategory(match);
        }
      } catch {
        // Keep showing the stored code until the user searches.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [category, categoryCode]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handle = window.setTimeout(() => {
      void (async () => {
        setIsLoadingResults(true);
        try {
          const response = await fetchTariffCategories({
            search: search.trim() || undefined,
            pageSize: LIST_PAGE_SIZE,
          });
          setOptions(response.results);
        } catch {
          setOptions(selected ? [selected] : []);
        } finally {
          setIsLoadingResults(false);
        }
      })();
    }, search.trim() ? 250 : 0);

    return () => window.clearTimeout(handle);
  }, [open, search, selected]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
    }
  }

  function handleValueChange(code: string) {
    const match =
      options.find((option) => option.code === code) ??
      (selected?.code === code ? selected : null);

    if (match) {
      setResolvedCategory(match);
      onCategoryChange(match);
      setOpen(false);
    }
  }

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="product-tariff-category-select">Category</Label>
        <p className="mt-1 text-xs text-brand-muted">
          Search by category name or code.
        </p>
      </div>

      <SearchableSelect
        id="product-tariff-category-select"
        value={selectedCode ?? undefined}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={handleOpenChange}
        disabled={disabled}
        placeholder="Select a tariff category"
        displayValue={
          selected
            ? formatCategoryLabel(selected)
            : selectedCode
              ? selectedCode
              : undefined
        }
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search categories..."
        isLoading={isLoadingResults}
        minSearchLength={0}
        noResultsMessage="No categories found."
      >
        {options.map((option) => (
          <SelectItem key={option.public_id} value={option.code}>
            <div className="flex flex-col items-start">
              <span>{option.name}</span>
              <span className="text-xs text-brand-muted">
                {option.code}
                {option.scheme_code ? ` · ${option.scheme_code}` : ""}
              </span>
            </div>
          </SelectItem>
        ))}
      </SearchableSelect>
    </div>
  );
}

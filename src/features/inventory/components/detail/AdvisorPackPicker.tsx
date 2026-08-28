"use client";

import { useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
import { SearchableSelect, SelectItem } from "@/components/ui/searchable-select";
import { fetchValidationPacks } from "@/features/claims/services/claims.service";
import type { ValidationPack } from "@/features/claims/types/claims.types";

const NONE_VALUE = "__none__";

type AdvisorPackPickerProps = {
  pack: ValidationPack | null;
  onPackChange: (pack: ValidationPack | null) => void;
  disabled?: boolean;
};

export function AdvisorPackPicker({
  pack,
  onPackChange,
  disabled = false,
}: AdvisorPackPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<ValidationPack[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handle = window.setTimeout(() => {
      void (async () => {
        setIsLoadingResults(true);
        try {
          const packs = await fetchValidationPacks({ assignable: true });
          const query = search.trim().toLowerCase();
          setOptions(
            query
              ? packs.filter((row) => {
                  const haystack = `${row.name} ${row.code}`.toLowerCase();
                  return haystack.includes(query);
                })
              : packs,
          );
        } catch {
          setOptions(pack ? [pack] : []);
        } finally {
          setIsLoadingResults(false);
        }
      })();
    }, search.trim() ? 250 : 0);

    return () => window.clearTimeout(handle);
  }, [open, search, pack]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
    }
  }

  function handleValueChange(code: string) {
    if (code === NONE_VALUE) {
      onPackChange(null);
      setOpen(false);
      return;
    }
    const match =
      options.find((option) => option.code === code) ??
      (pack?.code === code ? pack : null);
    if (match) {
      onPackChange(match);
      setOpen(false);
    }
  }

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="pricelist-advisor-pack-select">Claims advisor pack</Label>
        <p className="mt-1 text-xs text-brand-muted">
          Optional. Scheme-specific advisor rules and AI coverage follow this pack.
        </p>
      </div>

      <SearchableSelect
        id="pricelist-advisor-pack-select"
        value={pack?.code ?? NONE_VALUE}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={handleOpenChange}
        disabled={disabled}
        placeholder="No advisor pack"
        displayValue={pack ? pack.name : "No advisor pack"}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search advisor packs..."
        isLoading={isLoadingResults}
        minSearchLength={0}
        noResultsMessage="No advisor packs found."
        data-testid="pricelist-advisor-pack-select"
      >
        <SelectItem value={NONE_VALUE}>No advisor pack</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.public_id} value={option.code}>
            <div className="flex flex-col items-start">
              <span>{option.name}</span>
              <span className="text-xs text-brand-muted">{option.code}</span>
            </div>
          </SelectItem>
        ))}
      </SearchableSelect>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { SearchableSelect, SelectItem } from "@/components/ui/searchable-select";
import { ProposeRegistryPayerDialog } from "@/features/settings/components/ProposeRegistryPayerDialog";
import { fetchCountryPayers } from "@/features/settings/services/settings.service";
import type { CountryPayer } from "@/features/settings/types/settings.types";

type RegistryPayerPickerProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
};

export function RegistryPayerPicker({
  value,
  onChange,
  disabled = false,
}: RegistryPayerPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [payers, setPayers] = useState<CountryPayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [proposeOpen, setProposeOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      try {
        const response = await fetchCountryPayers({
          search: search.trim().length >= 1 ? search.trim() : undefined,
        });
        if (active) {
          setPayers(response.results);
        }
      } catch {
        if (active) {
          setPayers([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [search]);

  const selected = useMemo(
    () => payers.find((payer) => payer.id === value) ?? null,
    [payers, value],
  );

  const selectValue = value == null ? "__none__" : String(value);

  return (
    <div className="space-y-2">
      <SearchableSelect
        value={selectValue}
        onValueChange={(next) => {
          if (next === "__none__") {
            onChange(null);
            return;
          }
          const parsed = Number(next);
          onChange(Number.isFinite(parsed) ? parsed : null);
        }}
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
        placeholder="Optional — link to registry"
        displayValue={
          value == null
            ? "Not linked"
            : selected
              ? `${selected.display_name} (${selected.code})`
              : `Registry #${value}`
        }
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search registry payers…"
        minSearchLength={0}
        emptySearchMessage="Loading registry payers…"
        noResultsMessage="No matching registry payers."
        isLoading={isLoading}
        data-testid="registry-payer-picker"
        footerExtra={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              setOpen(false);
              setProposeOpen(true);
            }}
          >
            Request new registry payer
          </Button>
        }
      >
        <SelectItem value="__none__">Not linked</SelectItem>
        {payers.map((payer) => (
          <SelectItem key={payer.uuid} value={String(payer.id)}>
            {payer.display_name} ({payer.code})
          </SelectItem>
        ))}
      </SearchableSelect>

      <ProposeRegistryPayerDialog
        open={proposeOpen}
        onOpenChange={setProposeOpen}
        onCreated={(payer) => {
          setPayers((current) => {
            if (current.some((item) => item.id === payer.id)) {
              return current;
            }
            return [payer, ...current];
          });
          if (payer.status === "approved") {
            onChange(payer.id);
          }
        }}
      />
    </div>
  );
}

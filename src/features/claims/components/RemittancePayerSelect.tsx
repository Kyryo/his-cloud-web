"use client";

import { useMemo, useState } from "react";

import { Label } from "@/components/ui/label";
import { SearchableSelect, SelectItem } from "@/components/ui/searchable-select";
import {
  getRemittancePayer,
  REMITTANCE_PAYERS,
  type RemittancePayerOption,
} from "@/features/claims/constants/remittance-payers";

type RemittancePayerSelectProps = {
  value: string;
  onValueChange: (code: string) => void;
  disabled?: boolean;
};

export function RemittancePayerSelect({
  value,
  onValueChange,
  disabled = false,
}: RemittancePayerSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = getRemittancePayer(value) ?? REMITTANCE_PAYERS[0];

  const options = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return REMITTANCE_PAYERS;
    }
    return REMITTANCE_PAYERS.filter(
      (payer) =>
        payer.code.toLowerCase().includes(term) ||
        payer.label.toLowerCase().includes(term) ||
        payer.description.toLowerCase().includes(term),
    );
  }, [search]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
    }
  }

  function handleValueChange(code: string) {
    onValueChange(code);
    setOpen(false);
  }

  function formatDisplay(payer: RemittancePayerOption) {
    return `${payer.label} · ${payer.description}`;
  }

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="remittance-payer-select">Payer</Label>
        <p className="mt-1 text-xs text-brand-muted">
          Choose the insurance payer for this remittance advice.
        </p>
      </div>

      <SearchableSelect
        id="remittance-payer-select"
        value={selected?.code}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={handleOpenChange}
        disabled={disabled}
        placeholder="Select a payer"
        displayValue={selected ? formatDisplay(selected) : undefined}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search payers…"
        minSearchLength={0}
        emptySearchMessage="No payers available."
        noResultsMessage="No payers match your search."
        data-testid="remittance-payer-select"
      >
        {options.map((payer) => (
          <SelectItem key={payer.code} value={payer.code}>
            <div className="flex flex-col items-start">
              <span>{payer.label}</span>
              <span className="text-xs text-brand-muted">{payer.description}</span>
            </div>
          </SelectItem>
        ))}
      </SearchableSelect>
    </div>
  );
}

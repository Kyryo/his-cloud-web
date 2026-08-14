"use client";

import { useMemo, useState } from "react";

import { SearchableSelect, SelectItem } from "@/components/ui/searchable-select";
import type { InsuranceScheme } from "@/features/customers/types/customer-insurance.types";
import {
  formatInsuranceSchemeLabel,
  formatMorePayersLabel,
  splitVisibleInsurancePayers,
  uniqueInsurancePayers,
  type InsurancePayerOption,
} from "@/features/customers/utils/format-insurance-scheme";
import { cn } from "@/lib/utils";

type InsuranceSchemeSearchableSelectProps = {
  id?: string;
  schemes: InsuranceScheme[];
  value: number | null;
  onChange: (schemeId: number) => void;
  disabled?: boolean;
  placeholder?: string;
  "data-testid"?: string;
};

export function InsuranceSchemeSearchableSelect({
  id,
  schemes,
  value,
  onChange,
  disabled = false,
  placeholder = "Select an insurance scheme",
  "data-testid": dataTestId,
}: InsuranceSchemeSearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPayerId, setSelectedPayerId] = useState<number | null>(null);
  const [payersExpanded, setPayersExpanded] = useState(false);

  const selectedScheme = useMemo(
    () => schemes.find((scheme) => scheme.id === value) ?? null,
    [schemes, value],
  );

  const payers = useMemo(() => uniqueInsurancePayers(schemes), [schemes]);
  const { visible: visiblePayers, overflow: overflowPayers } = useMemo(
    () =>
      splitVisibleInsurancePayers(payers, {
        expanded: payersExpanded,
        selectedPayerId,
      }),
    [payers, payersExpanded, selectedPayerId],
  );

  const filteredSchemes = useMemo(() => {
    const term = search.trim().toLowerCase();

    return schemes.filter((scheme) => {
      if (selectedPayerId != null && scheme.insurance_company !== selectedPayerId) {
        return false;
      }

      if (!term) {
        return true;
      }

      const label = formatInsuranceSchemeLabel(scheme).toLowerCase();
      return (
        label.includes(term) ||
        scheme.name.toLowerCase().includes(term) ||
        scheme.insurance_company_name.toLowerCase().includes(term) ||
        scheme.code.toLowerCase().includes(term)
      );
    });
  }, [schemes, search, selectedPayerId]);

  function resetDropdownState() {
    setSearch("");
    setSelectedPayerId(null);
    setPayersExpanded(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      resetDropdownState();
    }
  }

  function handleValueChange(nextValue: string) {
    const schemeId = Number(nextValue);
    if (!Number.isFinite(schemeId) || schemeId <= 0) {
      return;
    }

    onChange(schemeId);
    setOpen(false);
    resetDropdownState();
  }

  function handlePayerClick(payerId: number) {
    setSelectedPayerId((current) => (current === payerId ? null : payerId));
  }

  function payerBadgeClassName(isSelected: boolean) {
    return cn(
      "inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
      isSelected
        ? "border-transparent bg-brand-primary text-white"
        : "border-brand-border bg-background text-brand-slate hover:bg-brand-tint",
    );
  }

  function renderPayerBadge(payer: InsurancePayerOption) {
    const isSelected = selectedPayerId === payer.id;
    return (
      <button
        key={payer.id}
        type="button"
        aria-pressed={isSelected}
        className={payerBadgeClassName(isSelected)}
        onClick={() => handlePayerClick(payer.id)}
      >
        <span className="truncate">{payer.name}</span>
      </button>
    );
  }

  const payerBadges =
    payers.length > 0 ? (
      <div
        className="flex flex-col gap-2.5"
        onPointerDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            aria-pressed={selectedPayerId == null}
            className={payerBadgeClassName(selectedPayerId == null)}
            onClick={() => {
              setSelectedPayerId(null);
              setPayersExpanded(false);
            }}
          >
            View all
          </button>
          {visiblePayers.map(renderPayerBadge)}
          {!payersExpanded && overflowPayers.length > 0 ? (
            <button
              type="button"
              className="inline-flex items-center rounded-full border border-dashed border-brand-border bg-brand-tint px-2.5 py-1 text-xs font-medium text-brand-navy hover:bg-brand-tint/80"
              onClick={() => setPayersExpanded(true)}
            >
              {formatMorePayersLabel(overflowPayers.length)}
            </button>
          ) : null}
        </div>
        {payersExpanded && overflowPayers.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {overflowPayers.map(renderPayerBadge)}
          </div>
        ) : null}
      </div>
    ) : null;

  return (
    <SearchableSelect
      id={id}
      value={selectedScheme ? String(selectedScheme.id) : undefined}
      onValueChange={handleValueChange}
      open={open}
      onOpenChange={handleOpenChange}
      disabled={disabled}
      placeholder={placeholder}
      displayValue={
        selectedScheme
          ? formatInsuranceSchemeLabel(selectedScheme)
          : undefined
      }
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search insurance schemes..."
      minSearchLength={0}
      emptySearchMessage=""
      noResultsMessage="No insurance schemes found."
      triggerClassName="w-full"
      headerExtra={payerBadges}
      data-testid={dataTestId}
    >
      {filteredSchemes.map((scheme) => (
        <SelectItem key={scheme.id} value={String(scheme.id)}>
          {formatInsuranceSchemeLabel(scheme)}
        </SelectItem>
      ))}
    </SearchableSelect>
  );
}

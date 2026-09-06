"use client";

import { useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { SearchableSelect, SelectItem } from "@/components/ui/searchable-select";
import { fetchCustomers } from "@/features/customers/services/customers.service";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  formatCustomerName,
  formatCustomerSearchLabel,
} from "@/features/customers/utils/format-customer";

type CustomerAppointmentPickerProps = {
  customer: Customer | null;
  onCustomerChange: (customer: Customer | null) => void;
  disabled?: boolean;
};

export function CustomerAppointmentPicker({
  customer,
  onCustomerChange,
  disabled = false,
}: CustomerAppointmentPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  useEffect(() => {
    if (!open || search.trim().length < 2) {
      return;
    }

    let cancelled = false;

    const handle = window.setTimeout(() => {
      void (async () => {
        try {
          const response = await fetchCustomers({
            search: search.trim(),
            pageSize: 8,
            isActive: true,
          });
          if (!cancelled) {
            setSearchResults(response.results);
            setIsLoadingResults(false);
          }
        } catch {
          if (!cancelled) {
            setSearchResults([]);
            setIsLoadingResults(false);
          }
        }
      })();
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [open, search]);

  const options =
    search.trim().length < 2
      ? customer
        ? [customer]
        : []
      : searchResults;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
      setSearchResults([]);
    }
  }

  function handleValueChange(uuid: string) {
    const match =
      options.find((option) => option.uuid === uuid) ??
      (customer?.uuid === uuid ? customer : null);

    if (match) {
      onCustomerChange(match);
      setOpen(false);
    }
  }

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="appointment-client-select">
          Client <RequiredFieldMarker />
        </Label>
        <p className="mt-1 text-xs text-brand-muted">
          Search by name, identifier, phone, or reference.
        </p>
      </div>

      <SearchableSelect
        id="appointment-client-select"
        value={customer?.uuid}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={handleOpenChange}
        disabled={disabled}
        placeholder="Select a client"
        displayValue={customer ? formatCustomerSearchLabel(customer) : undefined}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search clients..."
        isLoading={isLoadingResults}
        noResultsMessage="No clients found."
      >
        {options.map((option) => (
          <SelectItem key={option.uuid} value={option.uuid}>
            <div className="flex flex-col items-start">
              <span>{formatCustomerName(option)}</span>
              <span className="text-xs text-brand-muted">
                {option.customer_identifier}
                {option.phone_number ? ` · ${option.phone_number}` : ""}
              </span>
            </div>
          </SelectItem>
        ))}
      </SearchableSelect>
    </div>
  );
}

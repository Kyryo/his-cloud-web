"use client";

import { useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
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
  const [options, setOptions] = useState<Customer[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }

    if (search.trim().length < 2) {
      setOptions(customer ? [customer] : []);
      return;
    }

    const handle = window.setTimeout(() => {
      void (async () => {
        setIsLoadingResults(true);
        try {
          const response = await fetchCustomers({
            search: search.trim(),
            pageSize: 8,
            isActive: true,
          });
          setOptions(response.results);
        } catch {
          setOptions(customer ? [customer] : []);
        } finally {
          setIsLoadingResults(false);
        }
      })();
    }, 250);

    return () => window.clearTimeout(handle);
  }, [customer, open, search]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
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
        <Label htmlFor="appointment-client-select">Client</Label>
        <p className="mt-1 text-xs text-brand-muted">
          Search by name, identifier, or phone number.
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

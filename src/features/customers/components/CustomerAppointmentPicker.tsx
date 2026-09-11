"use client";

import { useEffect, useState, type ReactNode } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { SearchableSelect, SelectItem } from "@/components/ui/searchable-select";
import { fetchCustomers } from "@/features/customers/services/customers.service";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  formatCustomerName,
  formatCustomerSearchLabel,
  looksLikeClientName,
} from "@/features/customers/utils/format-customer";

type CustomerAppointmentPickerProps = {
  customer: Customer | null;
  onCustomerChange: (customer: Customer | null) => void;
  disabled?: boolean;
  labelAction?: ReactNode;
  onCreateClient?: (name: string) => void;
};

export function CustomerAppointmentPicker({
  customer,
  onCustomerChange,
  disabled = false,
  labelAction,
  onCreateClient,
}: CustomerAppointmentPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const trimmedSearch = search.trim();

  useEffect(() => {
    if (!open || trimmedSearch.length < 2) {
      return;
    }

    let cancelled = false;

    const handle = window.setTimeout(() => {
      void (async () => {
        setIsLoadingResults(true);
        try {
          const response = await fetchCustomers({
            search: trimmedSearch,
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
  }, [open, trimmedSearch]);

  const options =
    trimmedSearch.length < 2
      ? customer
        ? [customer]
        : []
      : searchResults;

  const hasExactNameMatch = options.some(
    (option) =>
      formatCustomerName(option).toLowerCase() === trimmedSearch.toLowerCase(),
  );
  const showCreateClient =
    Boolean(onCreateClient) &&
    looksLikeClientName(trimmedSearch) &&
    !hasExactNameMatch;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
      setSearchResults([]);
    }
  }

  function handleCreateClient() {
    const name = trimmedSearch;
    handleOpenChange(false);
    onCreateClient?.(name);
  }

  function handleValueChange(uuid: string) {
    const match =
      options.find((option) => option.uuid === uuid) ??
      (customer?.uuid === uuid ? customer : null);

    if (match) {
      onCustomerChange(match);
      handleOpenChange(false);
    }
  }

  return (
    <div className="space-y-2">
      <div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="appointment-client-select">
            Client <RequiredFieldMarker />
          </Label>
          {labelAction}
        </div>
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
        searchPlaceholder="Name, identifier, or phone"
        emptySearchMessage="Type a name, identifier, or phone."
        isLoading={isLoadingResults}
        noResultsMessage="No clients found."
        footerExtra={
          showCreateClient ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 w-full gap-1.5 rounded-md"
              data-testid="customer-picker-create"
              onPointerDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={handleCreateClient}
            >
              <AppIcon name="add" size={14} />
              Create “{trimmedSearch}”
            </Button>
          ) : null
        }
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

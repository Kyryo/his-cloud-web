"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

  const handleValueChange = (uuid: string) => {
    const match =
      options.find((option) => option.uuid === uuid) ??
      (customer?.uuid === uuid ? customer : null);

    if (match) {
      onCustomerChange(match);
      setOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="appointment-client-select">Client</Label>
        <p className="mt-1 text-xs text-brand-muted">
          Search by name, identifier, or phone number.
        </p>
      </div>

      <Select
        value={customer?.uuid}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
      >
        <SelectTrigger id="appointment-client-select" className="w-full">
          <SelectValue placeholder="Select a client">
            {customer ? formatCustomerSearchLabel(customer) : null}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <div className="border-b border-brand-border p-2">
            <Input
              value={search}
              placeholder="Search clients..."
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
          ) : search.trim().length < 2 ? (
            <div className="px-3 py-6 text-center text-sm text-brand-muted">
              Type at least 2 characters to search.
            </div>
          ) : options.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-brand-muted">
              No clients found.
            </div>
          ) : (
            options.map((option) => (
              <SelectItem key={option.uuid} value={option.uuid}>
                <div className="flex flex-col items-start">
                  <span>{formatCustomerName(option)}</span>
                  <span className="text-xs text-brand-muted">
                    {option.customer_identifier}
                    {option.phone_number ? ` · ${option.phone_number}` : ""}
                  </span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

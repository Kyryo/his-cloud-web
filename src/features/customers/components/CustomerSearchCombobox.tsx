"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchCustomers } from "@/features/customers/services/customers.service";
import type { Customer } from "@/features/customers/types/customer.types";
import {
  formatCustomerName,
  formatCustomerSearchLabel,
} from "@/features/customers/utils/format-customer";
import { cn } from "@/lib/utils";

type CustomerSearchComboboxProps = {
  id?: string;
  label?: string;
  value?: string | null;
  onSelect: (customer: Customer) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function CustomerSearchCombobox({
  id = "customer-search",
  label = "Client",
  value,
  onSelect,
  disabled = false,
  placeholder = "Search by name or identifier...",
}: CustomerSearchComboboxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Customer[]>([]);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) {
      setSelectedLabel(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const response = await fetchCustomers({ search: value, pageSize: 5 });
        const match = response.results.find((customer) => customer.uuid === value);
        if (!cancelled && match) {
          setSelectedLabel(formatCustomerSearchLabel(match));
        }
      } catch {
        if (!cancelled) {
          setSelectedLabel(formatCustomerName({ full_name: value, first_name: "", middle_name: null, last_name: "" }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [value]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const handle = window.setTimeout(() => {
      void (async () => {
        setIsSearching(true);
        try {
          const response = await fetchCustomers({
            search: query.trim(),
            pageSize: 8,
            isActive: true,
          });
          setResults(response.results);
          setIsOpen(true);
        } catch {
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      })();
    }, 300);

    return () => window.clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(customer: Customer) {
    onSelect(customer);
    setSelectedLabel(formatCustomerSearchLabel(customer));
    setQuery("");
    setResults([]);
    setIsOpen(false);
  }

  const displayValue = isOpen ? query : selectedLabel ?? query;

  return (
    <div ref={containerRef} className="relative space-y-2">
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <div className="relative">
        <Input
          id={id}
          type="search"
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          className="bg-white"
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedLabel(null);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
        />
        {isSearching ? (
          <Loader2
            className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-brand-muted"
            aria-hidden="true"
          />
        ) : null}
      </div>
      {isOpen && results.length > 0 ? (
        <ul
          className={cn(
            "absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-brand-border bg-white py-1 shadow-lg",
          )}
        >
          {results.map((customer) => (
            <li key={customer.uuid}>
              <button
                type="button"
                className="w-full px-3 py-2.5 text-left hover:bg-slate-50"
                onClick={() => handleSelect(customer)}
              >
                <p className="text-sm font-medium text-brand-navy">
                  {formatCustomerName(customer)}
                </p>
                <p className="text-xs text-brand-muted">
                  {customer.customer_identifier}
                  {customer.phone_number ? ` · ${customer.phone_number}` : ""}
                </p>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

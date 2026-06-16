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
import { fetchOrganizationPricelists } from "@/features/settings/services/settings.service";
import type { OrganizationPricelist } from "@/features/settings/types/settings.types";

type SalesOrderPricelistPickerProps = {
  pricelist: OrganizationPricelist | null;
  onPricelistChange: (pricelist: OrganizationPricelist | null) => void;
  disabled?: boolean;
  isLocked?: boolean;
};

export function SalesOrderPricelistPicker({
  pricelist,
  onPricelistChange,
  disabled = false,
  isLocked = false,
}: SalesOrderPricelistPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<OrganizationPricelist[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoadingResults(true);
      try {
        const response = await fetchOrganizationPricelists();
        if (!cancelled) {
          setOptions(response.results.filter((item) => item.is_active));
        }
      } catch {
        if (!cancelled) {
          setOptions(pricelist ? [pricelist] : []);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingResults(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, pricelist]);

  const filteredOptions = options.filter((option) => {
    if (!search.trim()) {
      return true;
    }

    return option.name.toLowerCase().includes(search.trim().toLowerCase());
  });

  const handleValueChange = (value: string) => {
    if (value === "__none__") {
      onPricelistChange(null);
      setOpen(false);
      return;
    }

    const match =
      options.find((option) => String(option.id) === value) ??
      (pricelist && String(pricelist.id) === value ? pricelist : null);

    if (match) {
      onPricelistChange(match);
      setOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="sales-order-pricelist-select">Pricelist</Label>
        <p className="mt-1 text-xs text-brand-muted">
          {isLocked
            ? "Pricelist is set from the selected visit."
            : "Optional. Choose the pricing list for this order."}
        </p>
      </div>

      <Select
        value={pricelist ? String(pricelist.id) : "__none__"}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setSearch("");
          }
        }}
        disabled={disabled || isLocked}
      >
        <SelectTrigger id="sales-order-pricelist-select" className="w-full">
          <SelectValue placeholder="Select a pricelist">
            {pricelist ? pricelist.name : "No pricelist selected"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <div className="border-b border-brand-border p-2">
            <Input
              value={search}
              placeholder="Search pricelists..."
              className="h-9"
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.stopPropagation()}
            />
          </div>

          {isLoadingResults ? (
            <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-brand-muted">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Loading pricelists...
            </div>
          ) : (
            <>
              <SelectItem value="__none__">No pricelist</SelectItem>
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-brand-muted">
                  No pricelists found.
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    <div className="flex flex-col items-start">
                      <span>{option.name}</span>
                      <span className="text-xs text-brand-muted">
                        {option.currency_code}
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

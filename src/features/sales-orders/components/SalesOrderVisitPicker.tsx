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
import { fetchCustomerVisits } from "@/features/visits/services/visits.service";
import type { VisitDetail } from "@/features/visits/types/visit.types";
import { formatVisitPickerLabel } from "@/features/sales-orders/utils/resolve-visit-pricelist";

type SalesOrderVisitPickerProps = {
  customerUuid: string | null;
  visit: VisitDetail | null;
  onVisitChange: (visit: VisitDetail | null) => void;
  disabled?: boolean;
};

export function SalesOrderVisitPicker({
  customerUuid,
  visit,
  onVisitChange,
  disabled = false,
}: SalesOrderVisitPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<VisitDetail[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  useEffect(() => {
    if (!open || !customerUuid) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoadingResults(true);
      try {
        const visits = await fetchCustomerVisits(customerUuid, { limit: 100 });
        if (!cancelled) {
          setOptions(visits);
        }
      } catch {
        if (!cancelled) {
          setOptions(visit ? [visit] : []);
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
  }, [customerUuid, open, visit]);

  const filteredOptions = options.filter((option) => {
    if (!search.trim()) {
      return true;
    }

    const haystack = formatVisitPickerLabel(option).toLowerCase();
    return haystack.includes(search.trim().toLowerCase());
  });

  const handleValueChange = (uuid: string) => {
    if (uuid === "__none__") {
      onVisitChange(null);
      setOpen(false);
      return;
    }

    const match =
      options.find((option) => option.uuid === uuid) ??
      (visit?.uuid === uuid ? visit : null);

    if (match) {
      onVisitChange(match);
      setOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="sales-order-visit-select">Visit</Label>
        <p className="mt-1 text-xs text-brand-muted">
          Optional. Link this order to an active or recent visit for the client.
        </p>
      </div>

      <Select
        value={visit?.uuid ?? "__none__"}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setSearch("");
          }
        }}
        disabled={disabled || !customerUuid}
      >
        <SelectTrigger id="sales-order-visit-select" className="w-full">
          <SelectValue placeholder="Select a visit">
            {visit ? formatVisitPickerLabel(visit) : "No visit selected"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <div className="border-b border-brand-border p-2">
            <Input
              value={search}
              placeholder="Search visits..."
              className="h-9"
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.stopPropagation()}
            />
          </div>

          {isLoadingResults ? (
            <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-brand-muted">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Loading visits...
            </div>
          ) : (
            <>
              <SelectItem value="__none__">No visit</SelectItem>
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-brand-muted">
                  No visits found for this client.
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <SelectItem key={option.uuid} value={option.uuid}>
                    <div className="flex flex-col items-start">
                      <span>{formatVisitPickerLabel(option)}</span>
                      <span className="text-xs text-brand-muted">
                        {option.customer_identifier}
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

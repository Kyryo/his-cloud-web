"use client";

import { useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchInventoryLocations } from "@/features/inventory/services/inventory.service";
import type { InventoryLocationOption } from "@/features/inventory/types/inventory.types";

type InventoryLocationSelectProps = {
  id?: string;
  label?: string;
  value?: string;
  onValueChange: (locationId: number) => void;
  disabled?: boolean;
  placeholder?: string;
  clinicId?: number;
};

export function InventoryLocationSelect({
  id = "inventory-location",
  label = "Location",
  value,
  onValueChange,
  disabled = false,
  placeholder = "Select location",
  clinicId,
}: InventoryLocationSelectProps) {
  const [locations, setLocations] = useState<InventoryLocationOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetchInventoryLocations(clinicId);
        if (!cancelled) {
          setLocations(response.results);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load locations.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clinicId]);

  return (
    <div className="space-y-2">
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <Select
        value={value}
        onValueChange={(nextValue) => onValueChange(Number(nextValue))}
        disabled={disabled || isLoading || Boolean(error)}
      >
        <SelectTrigger id={id}>
          <SelectValue
            placeholder={
              isLoading ? "Loading locations..." : error ?? placeholder
            }
          />
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => (
            <SelectItem key={location.id} value={String(location.id)}>
              {location.name}
              {location.code ? ` (${location.code})` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

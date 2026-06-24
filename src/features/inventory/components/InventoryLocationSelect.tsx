"use client";

import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInventoryLocations } from "@/features/inventory/hooks/use-inventory-locations";

type InventoryLocationSelectProps = {
  id?: string;
  label?: string;
  required?: boolean;
  value?: string;
  onValueChange: (locationId: number) => void;
  disabled?: boolean;
  placeholder?: string;
  clinicId?: number;
  enabled?: boolean;
};

export function InventoryLocationSelect({
  id = "inventory-location",
  label = "Location",
  required = false,
  value,
  onValueChange,
  disabled = false,
  placeholder = "Select location",
  clinicId,
  enabled = true,
}: InventoryLocationSelectProps) {
  const { data, isLoading, isError } = useInventoryLocations(clinicId, enabled);
  const locations = data?.results ?? [];
  const error = isError ? "Failed to load locations." : null;

  return (
    <div className="space-y-2">
      {label ? (
        <Label htmlFor={id}>
          {label}
          {required ? <> <RequiredFieldMarker /></> : null}
        </Label>
      ) : null}
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

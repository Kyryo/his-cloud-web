"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HPI_DURATION_UNITS,
  type HpiDurationUnit,
} from "@/features/clinical-opd/utils/hpi-duration";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type OpdHpiDurationFieldsProps = {
  value: string;
  unit: HpiDurationUnit;
  disabled?: boolean;
  onValueChange: (value: string) => void;
  onUnitChange: (unit: HpiDurationUnit) => void;
};

export function OpdHpiDurationFields({
  value,
  unit,
  disabled = false,
  onValueChange,
  onUnitChange,
}: OpdHpiDurationFieldsProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="opd-hpi-duration-value">Duration</Label>
      <div className="grid grid-cols-[minmax(0,1fr)_8.5rem] gap-2">
        <Input
          id="opd-hpi-duration-value"
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          placeholder="3"
          disabled={disabled}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          data-testid="opd-hpi-duration-value"
        />
        <Select
          value={unit}
          disabled={disabled}
          onValueChange={(next) => onUnitChange(next as HpiDurationUnit)}
        >
          <SelectTrigger
            id="opd-hpi-duration-unit"
            className="h-10"
            aria-label="Duration unit"
            data-testid="opd-hpi-duration-unit"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className={cn(appFont.className)}>
            {HPI_DURATION_UNITS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

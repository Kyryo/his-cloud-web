"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type FilterSelectFieldProps = {
  id: string;
  label: string;
  value: string;
  disabled?: boolean;
  placeholder?: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
};

export function FilterSelectField({
  id,
  label,
  value,
  disabled = false,
  placeholder = "Select...",
  onValueChange,
  options,
}: FilterSelectFieldProps) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block text-sm font-medium text-brand-slate">
        {label}
      </Label>
      <Select
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
      >
        <SelectTrigger id={id} className={cn("h-9 w-full text-sm", appFont.className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent position="popper" className={appFont.className}>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

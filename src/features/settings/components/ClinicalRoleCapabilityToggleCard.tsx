"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type ClinicalRoleCapabilityToggleCardProps = {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function ClinicalRoleCapabilityToggleCard({
  id,
  label,
  checked,
  disabled = false,
  onCheckedChange,
}: ClinicalRoleCapabilityToggleCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-xl border border-brand-border bg-white px-4 py-3.5 transition-colors",
        checked && "border-brand-primary/25 bg-brand-tint/20",
      )}
    >
      <label htmlFor={id} className="text-sm text-brand-navy">
        {label}
      </label>

      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-label={label}
      />
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";

import { Label } from "@/components/ui/label";
import { SearchableSelect, SelectItem } from "@/components/ui/searchable-select";
import { fetchCareProviders } from "@/features/appointments/services/appointments.service";
import type { CareProvider } from "@/features/appointments/types/appointment.types";
import { cn } from "@/lib/utils";

type ProviderOption = {
  id: number;
  label: string;
  provider: CareProvider;
};

type CareProviderComboboxProps = {
  id?: string;
  label?: string;
  value?: number | null;
  displayName?: string | null;
  clinicUuid?: string;
  disabled?: boolean;
  className?: string;
  onSelect: (provider: CareProvider | null) => void;
};

function formatCareProviderLabel(provider: Pick<CareProvider, "name" | "user_role">) {
  const role = provider.user_role?.replaceAll("_", " ") || "Staff";
  return `${provider.name} · ${role.charAt(0).toUpperCase()}${role.slice(1)}`;
}

function toProviderOption(provider: CareProvider): ProviderOption {
  return {
    id: provider.id,
    label: formatCareProviderLabel(provider),
    provider,
  };
}

export function CareProviderCombobox({
  id = "care-provider-search",
  label = "Care provider",
  value = null,
  displayName = null,
  clinicUuid,
  disabled = false,
  className,
  onSelect,
}: CareProviderComboboxProps) {
  const [options, setOptions] = useState<ProviderOption[]>([]);
  const [loadedClinicUuid, setLoadedClinicUuid] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedOption = useMemo(() => {
    if (!value) {
      return null;
    }

    const match = options.find((option) => option.id === value);
    if (match) {
      return match;
    }

    if (displayName) {
      return {
        id: value,
        label: displayName,
        provider: { id: value, name: displayName, user_role: "" },
      };
    }

    return null;
  }, [displayName, options, value]);

  useEffect(() => {
    const clinic = clinicUuid;
    if (!clinic) {
      return;
    }

    let cancelled = false;

    async function run() {
      try {
        const providers = await fetchCareProviders({ clinic });
        if (cancelled) {
          return;
        }
        setOptions(providers.map(toProviderOption));
        setLoadedClinicUuid(clinic);
      } catch {
        if (cancelled) {
          return;
        }
        setOptions([]);
        setLoadedClinicUuid(clinic);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [clinicUuid]);

  const visibleOptions = useMemo(() => {
    if (!clinicUuid || clinicUuid !== loadedClinicUuid) {
      return [];
    }

    const term = search.trim().toLowerCase();
    if (!term) {
      return options;
    }

    return options.filter((option) => option.label.toLowerCase().includes(term));
  }, [clinicUuid, loadedClinicUuid, options, search]);

  const isLoadingClinic = Boolean(clinicUuid) && clinicUuid !== loadedClinicUuid;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <SearchableSelect
        id={id}
        value={selectedOption ? String(selectedOption.id) : undefined}
        open={open}
        onOpenChange={handleOpenChange}
        onValueChange={(nextValue) => {
          const selected = options.find((option) => String(option.id) === nextValue);
          if (selected) {
            onSelect(selected.provider);
            handleOpenChange(false);
          }
        }}
        disabled={disabled || !clinicUuid || isLoadingClinic}
        placeholder={
          clinicUuid
            ? isLoadingClinic
              ? "Loading providers..."
              : "Select a provider"
            : "Select a clinic first"
        }
        displayValue={selectedOption?.label}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Name or role"
        emptySearchMessage="Type a name or role."
        noResultsMessage={
          clinicUuid
            ? search.trim()
              ? "No matching providers."
              : "No assignable providers found for this clinic."
            : "Select a clinic first."
        }
        isLoading={isLoadingClinic}
        minSearchLength={0}
      >
        {visibleOptions.map((option) => (
          <SelectItem key={option.id} value={String(option.id)}>
            {option.label}
          </SelectItem>
        ))}
      </SearchableSelect>
    </div>
  );
}

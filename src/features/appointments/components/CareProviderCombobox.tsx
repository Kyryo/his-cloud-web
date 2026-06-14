"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
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
  const [isSearching, setIsSearching] = useState(false);
  const [inputValue, setInputValue] = useState(displayName ?? "");

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
    setInputValue(displayName ?? "");
  }, [displayName, value]);

  useEffect(() => {
    if (inputValue.trim().length < 2) {
      setOptions([]);
      return;
    }

    const handle = window.setTimeout(() => {
      void (async () => {
        setIsSearching(true);
        try {
          const providers = await fetchCareProviders({
            search: inputValue.trim(),
            clinic: clinicUuid,
          });
          setOptions(providers.map(toProviderOption));
        } catch {
          setOptions([]);
        } finally {
          setIsSearching(false);
        }
      })();
    }, 250);

    return () => window.clearTimeout(handle);
  }, [clinicUuid, inputValue]);

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <Combobox
        items={options}
        filter={null}
        value={selectedOption}
        itemToStringLabel={(option) => option.label}
        itemToStringValue={(option) => String(option.id)}
        isItemEqualToValue={(left, right) => left.id === right.id}
        onValueChange={(option) => {
          if (!option) {
            onSelect(null);
            setInputValue("");
            return;
          }

          onSelect(option.provider);
          setInputValue(option.label);
        }}
        onInputValueChange={(nextValue) => setInputValue(nextValue)}
      >
        <ComboboxInput
          id={id}
          disabled={disabled}
          placeholder="Search doctors and nurses..."
          showClear={Boolean(value)}
          className="w-full"
          aria-busy={isSearching}
        />
        <ComboboxContent className="min-w-[var(--anchor-width)]">
          <ComboboxEmpty>
            {inputValue.trim().length < 2
              ? "Type at least 2 characters to search."
              : isSearching
                ? "Searching..."
                : "No care providers found."}
          </ComboboxEmpty>
          <ComboboxList>
            {(option) => (
              <ComboboxItem key={option.id} value={option}>
                {option.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

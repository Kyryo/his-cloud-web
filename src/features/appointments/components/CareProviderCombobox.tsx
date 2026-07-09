"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    if (!clinicUuid) {
      setOptions([]);
      setLoadedClinicUuid(null);
      return;
    }

    if (clinicUuid === loadedClinicUuid) {
      return;
    }

    setLoadedClinicUuid(clinicUuid);
    void (async () => {
      setIsSearching(true);
      try {
        const providers = await fetchCareProviders({ clinic: clinicUuid });
        setOptions(providers.map(toProviderOption));
      } catch {
        setOptions([]);
      } finally {
        setIsSearching(false);
      }
    })();
  }, [clinicUuid, loadedClinicUuid]);

  const filteredOptions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return options;
    }
    return options.filter((option) => option.label.toLowerCase().includes(term));
  }, [options, search]);

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <Select
        value={selectedOption ? String(selectedOption.id) : ""}
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setSearch("");
          }
        }}
        onValueChange={(nextValue) => {
          const selected = options.find((option) => String(option.id) === nextValue);
          onSelect(selected?.provider ?? null);
        }}
        disabled={disabled || !clinicUuid || isSearching}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue
            placeholder={
              clinicUuid
                ? isSearching
                  ? "Loading providers..."
                  : "Select a provider"
                : "Select a clinic first"
            }
          />
        </SelectTrigger>
        <SelectContent>
          <div className="border-b border-brand-border p-2">
            <Input
              value={search}
              placeholder="Search providers..."
              className="h-9"
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.stopPropagation()}
            />
          </div>

          {isSearching ? (
            <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-brand-muted">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Loading...
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-brand-muted">
              {clinicUuid
                ? search.trim()
                  ? "No matching providers."
                  : "No assignable providers found for this clinic. Link the provider to a clinical user account to appear here."
                : "Select a clinic first."}
            </div>
          ) : (
            filteredOptions.map((option) => (
              <SelectItem key={option.id} value={String(option.id)}>
                {option.label}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

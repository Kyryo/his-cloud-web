"use client";

import { useEffect, useState } from "react";

import { TabAddActionButton } from "@/components/ui/app-buttons";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { SearchableSelect, SelectItem } from "@/components/ui/searchable-select";
import {
  CareProviderDialog,
  type CareProviderFormValues,
} from "@/features/settings/components/CareProviderDialog";
import {
  createCareProvider,
  fetchCareProviderRecords,
} from "@/features/care-providers/services/care-providers.service";
import { fetchClinicalClinics } from "@/features/clinical/services/clinical-catalog.service";
import type { ClinicalClinic } from "@/features/clinical/types/clinical-catalog.types";
import type { CareProviderRecord } from "@/features/care-providers/types/care-provider.types";

type CareProviderPickerProps = {
  id?: string;
  label?: string;
  required?: boolean;
  provider: CareProviderRecord | null;
  onProviderChange: (provider: CareProviderRecord | null) => void;
  clinicId?: number | null;
  disabled?: boolean;
};

function formatProviderLabel(provider: CareProviderRecord): string {
  if (provider.provider_has_user) {
    return `${provider.display_name} · Has login`;
  }
  return provider.display_name;
}

export function CareProviderPicker({
  id = "care-provider-picker",
  label = "Provider",
  required = false,
  provider,
  onProviderChange,
  clinicId = null,
  disabled = false,
}: CareProviderPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<CareProviderRecord[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [clinics, setClinics] = useState<ClinicalClinic[]>([]);

  useEffect(() => {
    if (!addDialogOpen) {
      return;
    }

    let active = true;
    void (async () => {
      try {
        const clinicList = await fetchClinicalClinics();
        if (active) {
          setClinics(clinicList);
        }
      } catch {
        if (active) {
          setClinics([]);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [addDialogOpen]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;
    const handle = window.setTimeout(() => {
      void (async () => {
        setIsLoadingResults(true);
        try {
          const response = await fetchCareProviderRecords({
            search: search.trim() || undefined,
            clinicId,
            isActive: true,
          });
          if (!cancelled) {
            setOptions(response.results);
            setIsLoadingResults(false);
          }
        } catch {
          if (!cancelled) {
            setOptions(provider ? [provider] : []);
            setIsLoadingResults(false);
          }
        }
      })();
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [clinicId, open, provider, search]);

  async function handleCreateProvider(values: CareProviderFormValues) {
    return createCareProvider({
      display_name: values.displayName,
      user_id: values.linkExistingUser ? values.linkedUser?.id ?? null : undefined,
      clinic_ids: values.clinicIds,
      create_user_account: values.createUserAccount,
      invite_email: values.createUserAccount ? values.inviteEmail : undefined,
      user_role: values.userRole,
    });
  }

  function handleProviderCreated(created: CareProviderRecord) {
    onProviderChange(created);
    setAddDialogOpen(false);
    handleOpenChange(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch("");
      return;
    }
    setIsLoadingResults(true);
  }

  function handleValueChange(value: string) {
    const match =
      options.find((option) => String(option.id) === value) ??
      (provider && String(provider.id) === value ? provider : null);
    onProviderChange(match);
    handleOpenChange(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>
          {label}
          {required ? <RequiredFieldMarker /> : null}
        </Label>
        <TabAddActionButton
          type="button"
          label="Add provider"
          disabled={disabled}
          onClick={() => setAddDialogOpen(true)}
        />
      </div>

      <SearchableSelect
        id={id}
        value={provider ? String(provider.id) : undefined}
        onValueChange={handleValueChange}
        open={open}
        onOpenChange={handleOpenChange}
        disabled={disabled}
        placeholder="Select a provider"
        displayValue={provider ? formatProviderLabel(provider) : undefined}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search providers..."
        emptySearchMessage="Type a name to search."
        noResultsMessage="No providers found."
        isLoading={isLoadingResults}
        minSearchLength={0}
      >
        {options.map((option) => (
          <SelectItem key={option.id} value={String(option.id)}>
            {formatProviderLabel(option)}
          </SelectItem>
        ))}
      </SearchableSelect>

      <CareProviderDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSaved={handleProviderCreated}
        clinics={clinics}
        onSubmit={handleCreateProvider}
      />
    </div>
  );
}

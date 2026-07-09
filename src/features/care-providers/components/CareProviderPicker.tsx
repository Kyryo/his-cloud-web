"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { TabAddActionButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      setSearch("");
      return;
    }

    const handle = window.setTimeout(() => {
      void (async () => {
        setIsLoadingResults(true);
        try {
          const response = await fetchCareProviderRecords({
            search: search.trim() || undefined,
            clinicId,
            isActive: true,
          });
          setOptions(response.results);
        } catch {
          setOptions(provider ? [provider] : []);
        } finally {
          setIsLoadingResults(false);
        }
      })();
    }, 250);

    return () => window.clearTimeout(handle);
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
    setOpen(false);
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

      <Select
        value={provider ? String(provider.id) : undefined}
        onValueChange={(value) => {
          const match =
            options.find((option) => String(option.id) === value) ??
            (provider && String(provider.id) === value ? provider : null);
          onProviderChange(match);
          setOpen(false);
        }}
        open={open}
        onOpenChange={setOpen}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Select a provider">
            {provider ? formatProviderLabel(provider) : null}
          </SelectValue>
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

          {isLoadingResults ? (
            <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-brand-muted">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Searching...
            </div>
          ) : options.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-brand-muted">
              No providers found.
            </div>
          ) : (
            options.map((option) => (
              <SelectItem key={option.id} value={String(option.id)}>
                {formatProviderLabel(option)}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

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

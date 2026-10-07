"use client";

import { useEffect, useMemo, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import {
  listRegistryCountries,
  searchRegistryCountries,
} from "@/features/platform-admin/constants/registry-countries";
import { createPlatformAdminPayer } from "@/features/platform-admin/services/platform-admin.service";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AddRegistryPayerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

export function AddRegistryPayerDialog({
  open,
  onOpenChange,
  onCreated,
}: AddRegistryPayerDialogProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [officialName, setOfficialName] = useState("");
  const [integrationCode, setIntegrationCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setQuery("");
    setCountryCode("");
    setCode("");
    setDisplayName("");
    setOfficialName("");
    setIntegrationCode("");
  }, [open]);

  const countries = useMemo(() => searchRegistryCountries(query), [query]);
  const selected = useMemo(
    () => listRegistryCountries().find((country) => country.code === countryCode) ?? null,
    [countryCode],
  );
  const isSearching = query.trim().length > 0;
  const canSave = Boolean(selected && code.trim() && officialName.trim());

  async function handleCreate() {
    if (!selected || !code.trim() || !officialName.trim()) {
      toast({
        variant: "error",
        title: "Payer details are incomplete",
        description: "Choose a country, then enter a code and an official name.",
      });
      return;
    }
    setIsSaving(true);
    try {
      const created = await createPlatformAdminPayer({
        country_code: selected.code,
        code: code.trim(),
        official_name: officialName.trim(),
        display_name: displayName.trim() || officialName.trim(),
        integration_code: integrationCode.trim(),
      });
      toast({
        variant: "success",
        title: "Payer added",
        description: `${created.display_name} is available in ${selected.name}.`,
      });
      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not add payer",
        description: error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add payer"
      description="Choose a country, then enter the payer clinics will link to."
      className="sm:max-w-lg"
      data-testid="add-registry-payer-dialog"
      headerExtra={
        <div className="pb-4 pt-4">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search countries"
            aria-label="Search countries"
            autoComplete="off"
          />
        </div>
      }
      footer={
        <>
          <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={!canSave || isSaving}
            onClick={() => void handleCreate()}
          >
            {isSaving ? "Adding..." : "Add payer"}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-5">
        {countries.length === 0 ? (
          <p className="text-sm text-slate-400">No countries match that search.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-slate-400">
              {selected
                ? `Country · ${selected.name}`
                : isSearching
                  ? `${countries.length} ${countries.length === 1 ? "match" : "matches"}`
                  : "Common countries"}
            </p>
            <ul className="divide-y divide-brand-border">
              {countries.map((country) => {
                const isSelected = countryCode === country.code;
                return (
                  <li key={country.code}>
                    <button
                      type="button"
                      onClick={() => setCountryCode(country.code)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-md px-2 py-3 text-left",
                        isSelected && "bg-slate-50",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-brand-navy">
                          {country.name}
                        </span>
                        <span className="mt-0.5 block text-sm text-slate-400">
                          {country.code}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-slate-400">
                        {isSelected ? "Selected" : ""}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="space-y-4 border-t border-brand-border pt-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm text-slate-400" htmlFor="registry-payer-code">
                Code
              </label>
              <Input
                id="registry-payer-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-slate-400" htmlFor="registry-payer-integration">
                Integration code
              </label>
              <Input
                id="registry-payer-integration"
                value={integrationCode}
                onChange={(event) => setIntegrationCode(event.target.value)}
                autoComplete="off"
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-slate-400" htmlFor="registry-payer-display">
              Display name
            </label>
            <Input
              id="registry-payer-display"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete="off"
              placeholder="Optional"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-slate-400" htmlFor="registry-payer-official">
              Official name
            </label>
            <Input
              id="registry-payer-official"
              value={officialName}
              onChange={(event) => setOfficialName(event.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </SectionedDialog>
  );
}

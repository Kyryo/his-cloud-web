"use client";

import { useEffect, useMemo, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { Switch } from "@/components/ui/switch";
import {
  listRegistryCountries,
  searchRegistryCountries,
} from "@/features/platform-admin/constants/registry-countries";
import {
  createPlatformAdminPayerPolicy,
  fetchPlatformAdminPayerPolicies,
} from "@/features/platform-admin/services/platform-admin.service";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type AddRegistryCountryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
};

export function AddRegistryCountryDialog({
  open,
  onOpenChange,
  onCreated,
}: AddRegistryCountryDialogProps) {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [selectedCode, setSelectedCode] = useState("");
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [existingCodes, setExistingCodes] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setQuery("");
    setSelectedCode("");
    setRequiresApproval(true);
    setExistingCodes([]);
    let active = true;
    void fetchPlatformAdminPayerPolicies({ page: 1, pageSize: 200 })
      .then((response) => {
        if (active) {
          setExistingCodes(response.results.map((policy) => policy.country_code));
        }
      })
      .catch(() => {
        if (active) {
          setExistingCodes([]);
        }
      });
    return () => {
      active = false;
    };
  }, [open]);

  const added = useMemo(
    () => new Set(existingCodes.map((code) => code.toUpperCase())),
    [existingCodes],
  );
  const countries = useMemo(() => searchRegistryCountries(query), [query]);
  const selected = useMemo(
    () => listRegistryCountries().find((country) => country.code === selectedCode) ?? null,
    [selectedCode],
  );
  const isSearching = query.trim().length > 0;

  async function handleCreate() {
    if (!selected || added.has(selected.code)) {
      return;
    }
    setIsSaving(true);
    try {
      await createPlatformAdminPayerPolicy({
        country_code: selected.code,
        requires_admin_approval: requiresApproval,
      });
      toast({
        variant: "success",
        title: "Country added",
        description: requiresApproval
          ? `${selected.name} now requires approval for new payers.`
          : `${selected.name} lets clinics add payers immediately.`,
      });
      onCreated();
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not add country",
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
      title="Add country"
      description="Choose a country for the payer registry. Search to find one that is not listed."
      className="sm:max-w-lg"
      data-testid="add-registry-country-dialog"
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
            disabled={!selected || added.has(selected.code) || isSaving}
            onClick={() => void handleCreate()}
          >
            {isSaving ? "Adding..." : selected ? `Add ${selected.name}` : "Add country"}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-5">
        <label className="flex items-center justify-between gap-4">
          <span className="min-w-0">
            <span className="block text-sm font-medium text-brand-navy">
              Require approval
            </span>
            <span className="mt-0.5 block text-sm text-slate-400">
              New payers in this country wait for a platform decision.
            </span>
          </span>
          <Switch
            checked={requiresApproval}
            onCheckedChange={setRequiresApproval}
            aria-label="Require approval for new payers"
          />
        </label>

        {countries.length === 0 ? (
          <p className="text-sm text-slate-400">No countries match that search.</p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-slate-400">
              {isSearching
                ? `${countries.length} ${countries.length === 1 ? "match" : "matches"}`
                : "Common countries"}
            </p>
            <ul className="divide-y divide-brand-border">
              {countries.map((country) => {
                const isAdded = added.has(country.code);
                const isSelected = selectedCode === country.code;
                return (
                  <li key={country.code}>
                    <button
                      type="button"
                      disabled={isAdded}
                      onClick={() => setSelectedCode(country.code)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-md px-2 py-3 text-left",
                        isSelected && "bg-slate-50",
                        isAdded && "cursor-not-allowed opacity-50",
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
                        {isAdded ? "Added" : isSelected ? "Selected" : ""}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </SectionedDialog>
  );
}

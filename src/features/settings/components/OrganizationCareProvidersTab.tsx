"use client";

import { Loader2, Pencil, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import {
  CareProviderDialog,
  type CareProviderFormValues,
} from "@/features/settings/components/CareProviderDialog";
import { OrganizationEmptyState } from "@/features/settings/components/OrganizationEmptyState";
import { OrganizationTabSection } from "@/features/settings/components/OrganizationTabSection";
import {
  createCareProvider,
  fetchCareProviderRecords,
  updateCareProvider,
} from "@/features/care-providers/services/care-providers.service";
import { fetchClinicalClinics } from "@/features/clinical/services/clinical-catalog.service";
import type { ClinicalClinic } from "@/features/clinical/types/clinical-catalog.types";
import type { CareProviderRecord } from "@/features/care-providers/types/care-provider.types";

type OrganizationCareProvidersTabProps = {
  isActive: boolean;
};

const columns = [
  { key: "name", label: "Provider" },
  { key: "account", label: "Login" },
  { key: "status", label: "Status" },
  { key: "actions", label: "" },
] as const;

export function OrganizationCareProvidersTab({
  isActive,
}: OrganizationCareProvidersTabProps) {
  const [providers, setProviders] = useState<CareProviderRecord[]>([]);
  const [clinics, setClinics] = useState<ClinicalClinic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<CareProviderRecord | null>(
    null,
  );

  const loadProviders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [response, clinicList] = await Promise.all([
        fetchCareProviderRecords({ isActive: undefined }),
        fetchClinicalClinics(),
      ]);
      setProviders(response.results ?? []);
      setClinics(clinicList);
    } catch (loadError) {
      setProviders([]);
      setClinics([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load care providers.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let active = true;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [response, clinicList] = await Promise.all([
          fetchCareProviderRecords({ isActive: undefined }),
          fetchClinicalClinics(),
        ]);
        if (!active) {
          return;
        }
        setProviders(response.results ?? []);
        setClinics(clinicList);
      } catch (loadError) {
        if (!active) {
          return;
        }
        setProviders([]);
        setClinics([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load care providers.",
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [isActive]);

  function openCreateDialog() {
    setEditingProvider(null);
    setDialogOpen(true);
  }

  function openEditDialog(provider: CareProviderRecord) {
    setEditingProvider(provider);
    setDialogOpen(true);
  }

  async function handleSubmit(values: CareProviderFormValues) {
    if (editingProvider) {
      return updateCareProvider(editingProvider.uuid, {
        display_name: values.displayName,
        is_active: values.isActive,
        clinic_ids: values.clinicIds,
      });
    }

    return createCareProvider({
      display_name: values.displayName,
      user_id: values.linkExistingUser ? values.linkedUser?.id ?? null : undefined,
      clinic_ids: values.clinicIds,
      create_user_account: values.createUserAccount,
      invite_email: values.createUserAccount ? values.inviteEmail : undefined,
      user_role: values.userRole,
    });
  }

  function handleSaved(provider: CareProviderRecord) {
    setProviders((current) => {
      const index = current.findIndex((item) => item.id === provider.id);
      if (index === -1) {
        return [provider, ...current];
      }
      const next = [...current];
      next[index] = provider;
      return next;
    });
  }

  if (!isActive) {
    return null;
  }

  return (
    <>
      <OrganizationTabSection
        title="Care providers"
        description="Maintain the tenant provider directory used on billing and clinical workflows."
        actions={
          <PrimaryButton type="button" onClick={openCreateDialog}>
            <Plus className="size-4" aria-hidden="true" />
            Add provider
          </PrimaryButton>
        }
      >
        {isLoading ? (
          <div className="flex items-center gap-2 py-10 text-sm text-brand-muted">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading providers...
          </div>
        ) : error ? (
          <div className="space-y-4 py-6">
            <p className="text-sm text-destructive">{error}</p>
            <SecondaryButton type="button" onClick={() => void loadProviders()}>
              Retry
            </SecondaryButton>
          </div>
        ) : providers.length === 0 ? (
          <OrganizationEmptyState
            message="No care providers have been registered yet."
            actionLabel="Add provider"
            onAction={openCreateDialog}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  {columns.map((column) => (
                    <th key={column.key} className="px-3 py-2 font-medium">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {providers.map((provider) => (
                  <tr key={provider.id} className="border-b border-brand-border/70">
                    <td className="px-3 py-3 font-medium text-brand-foreground">
                      {provider.display_name}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant="secondary">
                        {provider.user_email?.endsWith("@placeholder.local")
                          ? "No login (inactive placeholder)"
                          : (provider.user_email ?? "Linked user")}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={provider.is_active ? "default" : "outline"}>
                        {provider.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <SecondaryButton
                        type="button"
                        size="sm"
                        onClick={() => openEditDialog(provider)}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                        Edit
                      </SecondaryButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </OrganizationTabSection>

      <CareProviderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        provider={editingProvider}
        clinics={clinics}
        onSaved={handleSaved}
        onSubmit={handleSubmit}
      />
    </>
  );
}

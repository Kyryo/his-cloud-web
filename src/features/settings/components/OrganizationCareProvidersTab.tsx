"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  CareProviderDialog,
  type CareProviderFormValues,
} from "@/features/settings/components/CareProviderDialog";
import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import {
  OrganizationEntityRow,
  OrganizationTabPanel,
} from "@/features/settings/components/OrganizationTabContent";
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

function providerLogin(provider: CareProviderRecord) {
  if (provider.user_email?.endsWith("@placeholder.local")) {
    return "No login";
  }

  return provider.user_email ?? "Linked user";
}

export function OrganizationCareProvidersTab({
  isActive,
}: OrganizationCareProvidersTabProps) {
  const [providers, setProviders] = useState<CareProviderRecord[]>([]);
  const [clinics, setClinics] = useState<ClinicalClinic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] =
    useState<CareProviderRecord | null>(null);

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
      <OrganizationTabPanel
        description="People who appear on billing and clinical records."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openCreateDialog}
          >
            Add provider
          </Button>
        }
      >
        {isLoading ? (
          <SettingsContentSkeleton variant="staff" showHeader={false} />
        ) : error ? (
          <div className="space-y-3">
            <p className="text-sm text-red-600">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadProviders()}
            >
              Retry
            </Button>
          </div>
        ) : providers.length === 0 ? (
          <p className="text-sm text-slate-400">
            No care providers yet. Add a provider for billing and clinical work.
          </p>
        ) : (
          <ul className="divide-y divide-brand-border">
            {providers.map((provider) => (
              <OrganizationEntityRow
                key={provider.id}
                title={provider.display_name}
                meta={providerLogin(provider)}
                status={provider.is_active ? "Active" : "Inactive"}
                actions={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-brand-muted hover:text-brand-navy"
                    onClick={() => openEditDialog(provider)}
                  >
                    Edit
                  </Button>
                }
              />
            ))}
          </ul>
        )}
      </OrganizationTabPanel>

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

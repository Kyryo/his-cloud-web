"use client";

import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { OrganizationTabSection } from "@/features/settings/components/OrganizationTabSection";
import {
  fetchTenantConfiguration,
  updateTenantConfiguration,
} from "@/features/inventory/services/inventory-settings.service";
import type { InventoryTenantConfiguration } from "@/features/inventory/types/inventory.types";
import { useToast } from "@/providers/toast-provider";

type InventoryApprovalPolicyTabProps = {
  isActive: boolean;
};

export function InventoryApprovalPolicyTab({
  isActive,
}: InventoryApprovalPolicyTabProps) {
  const { toast } = useToast();
  const [config, setConfig] = useState<InventoryTenantConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchTenantConfiguration();
        if (!cancelled) {
          setConfig(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load approval policy.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isActive]);

  async function handleToggle(checked: boolean) {
    setIsSaving(true);
    try {
      const updated = await updateTenantConfiguration(checked);
      setConfig(updated);
      toast({
        description: "Approval policy saved.",
        variant: "success",
      });
    } catch (err) {
      toast({
        description:
          err instanceof Error ? err.message : "Unable to save approval policy.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (!isActive) {
    return null;
  }

  if (isLoading) {
    return <PageLoader message="Loading approval policy..." />;
  }

  if (error) {
    return (
      <OrganizationTabSection
        title="Approval policy"
        description="Control whether submitters can approve their own inventory documents."
      >
        <p className="text-sm text-red-600">{error}</p>
      </OrganizationTabSection>
    );
  }

  return (
    <OrganizationTabSection
      title="Approval policy"
      description="Tenant-wide rules for purchase orders, internal orders, and stock adjustments."
    >
      <div className="flex items-start justify-between gap-4 rounded-xl border border-brand-border p-4">
        <div>
          <p className="text-sm font-medium text-brand-navy">
            Allow submitters to approve their own documents
          </p>
          <p className="mt-1 text-xs text-brand-muted">
            When enabled, the person who creates and submits a purchase order,
            internal order, or stock adjustment can also approve or confirm it.
            Rejecting your own documents stays blocked.
          </p>
        </div>
        <input
          type="checkbox"
          className="mt-1 size-4 rounded border-brand-border text-brand-primary"
          checked={config?.allow_self_approval ?? false}
          disabled={isSaving}
          onChange={(event) => void handleToggle(event.target.checked)}
          aria-label="Allow submitters to approve their own documents"
        />
      </div>
    </OrganizationTabSection>
  );
}

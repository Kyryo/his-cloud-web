"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { OrganizationTabSection } from "@/features/settings/components/OrganizationTabSection";
import { InventoryEmptyState } from "@/features/inventory/components/InventoryEmptyState";
import { fetchOrganizationClinics } from "@/features/settings/services/settings.service";
import type { OrganizationClinic } from "@/features/settings/types/settings.types";
import {
  createClinicConfiguration,
  fetchClinicConfigurations,
  updateClinicConfiguration,
} from "@/features/inventory/services/inventory-settings.service";
import type { InventoryClinicConfiguration } from "@/features/inventory/types/inventory.types";
import { ROUTES } from "@/constants/routes";
import { useToast } from "@/providers/toast-provider";

type ClinicConfigRow = {
  clinic: OrganizationClinic;
  config: InventoryClinicConfiguration | null;
};

type InventoryClinicConfigurationTabProps = {
  isActive: boolean;
};

export function InventoryClinicConfigurationTab({
  isActive,
}: InventoryClinicConfigurationTabProps) {
  const { toast } = useToast();
  const [rows, setRows] = useState<ClinicConfigRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingClinicId, setSavingClinicId] = useState<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [clinicsResponse, configsResponse] = await Promise.all([
          fetchOrganizationClinics(),
          fetchClinicConfigurations({ pageSize: 200 }),
        ]);

        if (cancelled) {
          return;
        }

        const configByClinic = new Map(
          configsResponse.results.map((config) => [config.clinic, config]),
        );

        setRows(
          clinicsResponse.results.map((clinic) => ({
            clinic,
            config: configByClinic.get(clinic.id) ?? null,
          })),
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load clinic configuration.",
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

  async function handleToggle(
    row: ClinicConfigRow,
    field: keyof Pick<
      InventoryClinicConfiguration,
      | "batch_tracking_enabled"
      | "purchase_workflow_enabled"
      | "internal_order_workflow_enabled"
      | "stock_adjustment_workflow_enabled"
      | "allow_negative_stock"
    >,
    checked: boolean,
  ) {
    setSavingClinicId(row.clinic.id);

    try {
      let config = row.config;

      if (!config) {
        config = await createClinicConfiguration({
          clinic: row.clinic.id,
          [field]: checked,
        });
      } else {
        config = await updateClinicConfiguration(config.uuid, {
          [field]: checked,
        });
      }

      setRows((current) =>
        current.map((item) =>
          item.clinic.id === row.clinic.id ? { ...item, config } : item,
        ),
      );
      toast({
        description: "Configuration saved.",
        variant: "success",
      });
    } catch (err) {
      toast({
        description:
          err instanceof Error ? err.message : "Unable to save configuration.",
        variant: "error",
      });
    } finally {
      setSavingClinicId(null);
    }
  }

  if (!isActive) {
    return null;
  }

  if (isLoading) {
    return <PageLoader message="Loading clinic configuration..." />;
  }

  if (error) {
    return (
      <OrganizationTabSection
        title="Clinic configuration"
        description="Per-clinic inventory behaviour and workflow toggles."
      >
        <div className="space-y-4">
          <p className="text-sm text-red-600">{error}</p>
          <Button asChild variant="outline">
            <Link href={ROUTES.settingsOrganization}>Manage clinics</Link>
          </Button>
        </div>
      </OrganizationTabSection>
    );
  }

  if (rows.length === 0) {
    return (
      <InventoryEmptyState
        title="No clinics yet"
        description="Add clinics under Organization settings before configuring inventory."
        action={
          <Button asChild>
            <Link href={ROUTES.settingsOrganization}>Go to Organization</Link>
          </Button>
        }
      />
    );
  }

  const toggles: Array<{
    field: keyof Pick<
      InventoryClinicConfiguration,
      | "batch_tracking_enabled"
      | "purchase_workflow_enabled"
      | "internal_order_workflow_enabled"
      | "stock_adjustment_workflow_enabled"
      | "allow_negative_stock"
    >;
    label: string;
    description: string;
  }> = [
    {
      field: "batch_tracking_enabled",
      label: "Batch tracking",
      description: "Track lot numbers and expiry dates on stock movements.",
    },
    {
      field: "purchase_workflow_enabled",
      label: "Purchase workflow",
      description: "Require approval before purchase orders post stock.",
    },
    {
      field: "internal_order_workflow_enabled",
      label: "Internal order workflow",
      description: "Require approval before transfers between locations.",
    },
    {
      field: "stock_adjustment_workflow_enabled",
      label: "Stock adjustment workflow",
      description: "Require approval before quantity or cost adjustments apply.",
    },
    {
      field: "allow_negative_stock",
      label: "Allow negative stock",
      description: "Permit dispensing when on-hand quantity would go below zero.",
    },
  ];

  return (
    <OrganizationTabSection
      title="Clinic configuration"
      description="Configure inventory behaviour for each clinic in your organization."
    >
      <div className="space-y-4">
        {rows.map((row) => (
          <div
            key={row.clinic.id}
            className="rounded-xl border border-brand-border p-4"
          >
            <div className="mb-4">
              <h3 className="font-semibold text-brand-navy">{row.clinic.name}</h3>
              <p className="text-sm text-brand-muted">{row.clinic.code}</p>
            </div>
            <div className="space-y-4">
              {toggles.map((toggle) => (
                <div
                  key={toggle.field}
                  className="flex items-start justify-between gap-4 border-t border-brand-border pt-4 first:border-t-0 first:pt-0"
                >
                  <div>
                    <p className="text-sm font-medium text-brand-navy">
                      {toggle.label}
                    </p>
                    <p className="text-xs text-brand-muted">{toggle.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    className="mt-1 size-4 rounded border-brand-border text-brand-primary"
                    checked={row.config?.[toggle.field] ?? false}
                    disabled={savingClinicId === row.clinic.id}
                    onChange={(event) =>
                      void handleToggle(row, toggle.field, event.target.checked)
                    }
                    aria-label={`${toggle.label} for ${row.clinic.name}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </OrganizationTabSection>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ROUTES } from "@/constants/routes";
import {
  fetchDispensationConfigurationForClinic,
  updateDispensationConfiguration,
} from "@/features/dispensation/services/dispensation.service";
import type { DispensationConfiguration } from "@/features/dispensation/types/dispensation.types";
import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";
import { fetchOrganizationClinics } from "@/features/settings/services/settings.service";
import type { OrganizationClinic } from "@/features/settings/types/settings.types";
import { useToast } from "@/providers/toast-provider";
import { useUser } from "@/providers/user-provider";

const START_STATE_OPTIONS = [
  { value: "draft", label: "Draft (Quotation)" },
  { value: "sale", label: "Confirmed" },
  { value: "done", label: "Locked" },
] as const;

type ClinicDraft = {
  dispensation_start_state: string;
  require_sales_order_confirmation: boolean;
  invoice_after_dispensation: boolean;
};

type ClinicConfigRow = {
  clinic: OrganizationClinic;
  config: DispensationConfiguration | null;
  draft: ClinicDraft | null;
  dirty: boolean;
};

export function PharmacyModuleSettingsPage() {
  const { userData, isLoading: isUserLoading } = useUser();
  const { toast } = useToast();
  const isTenantAdmin = Boolean(userData?.is_admin);
  const [rows, setRows] = useState<ClinicConfigRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingClinicId, setSavingClinicId] = useState<number | null>(null);

  const loadRows = useCallback(async () => {
    setIsLoading(true);
    try {
      const clinicsResponse = await fetchOrganizationClinics();
      const clinics = clinicsResponse.results ?? [];
      const configs = await Promise.all(
        clinics.map(async (clinic) => {
          try {
            const config = await fetchDispensationConfigurationForClinic(
              clinic.id,
            );
            return {
              clinic,
              config,
              draft: {
                dispensation_start_state: config.dispensation_start_state,
                require_sales_order_confirmation:
                  config.require_sales_order_confirmation,
                invoice_after_dispensation: config.invoice_after_dispensation,
              },
              dirty: false,
            };
          } catch {
            return { clinic, config: null, draft: null, dirty: false };
          }
        }),
      );
      setRows(configs);
    } catch (error) {
      toast({
        title: "Could not load pharmacy settings",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "error",
      });
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!isTenantAdmin) {
      return;
    }

    let cancelled = false;

    async function run() {
      await Promise.resolve();
      if (cancelled) return;
      await loadRows();
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [isTenantAdmin, loadRows]);

  function updateDraft(
    clinicId: number,
    patch: Partial<ClinicDraft>,
  ) {
    setRows((current) =>
      current.map((row) => {
        if (row.clinic.id !== clinicId || !row.draft || !row.config) return row;
        const next = { ...row.draft, ...patch };
        const dirty =
          next.dispensation_start_state !==
            row.config.dispensation_start_state ||
          next.require_sales_order_confirmation !==
            row.config.require_sales_order_confirmation ||
          next.invoice_after_dispensation !==
            row.config.invoice_after_dispensation;
        return { ...row, draft: next, dirty };
      }),
    );
  }

  async function saveRow(row: ClinicConfigRow) {
    if (!row.config || !row.draft) return;
    setSavingClinicId(row.clinic.id);
    try {
      const updated = await updateDispensationConfiguration(row.config.uuid, {
        dispensation_start_state: row.draft.dispensation_start_state,
        require_sales_order_confirmation:
          row.draft.require_sales_order_confirmation,
        invoice_after_dispensation: row.draft.invoice_after_dispensation,
      });
      setRows((current) =>
        current.map((item) =>
          item.clinic.id === row.clinic.id
            ? {
                ...item,
                config: updated,
                draft: {
                  dispensation_start_state: updated.dispensation_start_state,
                  require_sales_order_confirmation:
                    updated.require_sales_order_confirmation,
                  invoice_after_dispensation:
                    updated.invoice_after_dispensation,
                },
                dirty: false,
              }
            : item,
        ),
      );
      toast({
        title: "Pharmacy settings saved",
        description: `${row.clinic.name} configuration updated.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "error",
      });
    } finally {
      setSavingClinicId(null);
    }
  }

  if (isUserLoading) {
    return <PageLoader />;
  }

  if (!isTenantAdmin) {
    return (
      <SettingsPageLayout
        title="Pharmacy"
        description="Pharmacy module settings are available to tenant administrators."
      >
        <SettingsSection title="Access restricted">
          <div className="space-y-4">
            <p className="text-sm text-brand-muted">
              You need tenant administrator access to configure pharmacy
              settings.
            </p>
            <Button asChild variant="outline">
              <Link href={ROUTES.settingsAccount}>
                Back to account settings
              </Link>
            </Button>
          </div>
        </SettingsSection>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title="Pharmacy"
      description="Configure when sales orders enter the pharmacy queue and invoice timing."
    >
      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="space-y-6">
          {rows.map((row) => (
            <SettingsSection key={row.clinic.id} title={row.clinic.name}>
              {!row.config || !row.draft ? (
                <p className="text-sm text-brand-muted">
                  Configuration unavailable for this clinic.
                </p>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor={`start-state-${row.clinic.id}`}>
                      Queue start state
                    </Label>
                    <Select
                      value={row.draft.dispensation_start_state}
                      onValueChange={(value) =>
                        updateDraft(row.clinic.id, {
                          dispensation_start_state: value,
                        })
                      }
                      disabled={savingClinicId === row.clinic.id}
                    >
                      <SelectTrigger
                        id={`start-state-${row.clinic.id}`}
                        className="w-full max-w-xs"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {START_STATE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-brand-muted">
                      Orders at this state or later enter the pharmacy queue.
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-brand-border px-4 py-3">
                    <div>
                      <Label
                        htmlFor={`require-confirm-${row.clinic.id}`}
                        className="text-sm font-medium text-brand-navy"
                      >
                        Require sales order confirmation
                      </Label>
                      <p className="text-xs text-brand-muted">
                        Require confirmation before invoicing or dispensing.
                      </p>
                    </div>
                    <Switch
                      id={`require-confirm-${row.clinic.id}`}
                      checked={row.draft.require_sales_order_confirmation}
                      disabled={savingClinicId === row.clinic.id}
                      onCheckedChange={(checked) =>
                        updateDraft(row.clinic.id, {
                          require_sales_order_confirmation: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-brand-border px-4 py-3">
                    <div>
                      <Label
                        htmlFor={`invoice-after-${row.clinic.id}`}
                        className="text-sm font-medium text-brand-navy"
                      >
                        Invoice only after full dispensation
                      </Label>
                      <p className="text-xs text-brand-muted">
                        Block invoicing until all storable lines are fully
                        dispensed.
                      </p>
                    </div>
                    <Switch
                      id={`invoice-after-${row.clinic.id}`}
                      checked={row.draft.invoice_after_dispensation}
                      disabled={savingClinicId === row.clinic.id}
                      onCheckedChange={(checked) =>
                        updateDraft(row.clinic.id, {
                          invoice_after_dispensation: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      size="sm"
                      disabled={
                        !row.dirty || savingClinicId === row.clinic.id
                      }
                      onClick={() => void saveRow(row)}
                    >
                      {savingClinicId === row.clinic.id
                        ? "Saving…"
                        : "Save changes"}
                    </Button>
                  </div>
                </div>
              )}
            </SettingsSection>
          ))}
        </div>
      )}
    </SettingsPageLayout>
  );
}

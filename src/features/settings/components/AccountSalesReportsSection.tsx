"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { StatusBanner } from "@/components/ui/status-banner";
import { Button } from "@/components/ui/button";
import {
  useSalesReportSubscription,
  useUpdateSalesReportSubscription,
} from "@/features/notifications/hooks/use-sales-report-subscription";
import { SettingsPanelSection } from "@/features/settings/components/SettingsPageLayout";
import { useTenantEmailConfiguration } from "@/features/settings/hooks/use-tenant-email-configuration";
import { useToast } from "@/providers/toast-provider";

type PreferenceToggleProps = {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

function PreferenceToggle({
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: PreferenceToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-brand-navy">{label}</p>
        <p className="text-xs text-brand-muted">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

export function AccountSalesReportsSection() {
  const { toast } = useToast();
  const subscriptionQuery = useSalesReportSubscription();
  const emailConfigurationQuery = useTenantEmailConfiguration();
  const updateMutation = useUpdateSalesReportSubscription();

  const server = subscriptionQuery.data;
  const [draft, setDraft] = useState<{
    dailyEnabled: boolean;
    weeklyEnabled: boolean;
    monthlyEnabled: boolean;
    isActive: boolean;
  } | null>(null);

  const dailyEnabled = draft?.dailyEnabled ?? server?.daily_enabled ?? true;
  const weeklyEnabled = draft?.weeklyEnabled ?? server?.weekly_enabled ?? false;
  const monthlyEnabled = draft?.monthlyEnabled ?? server?.monthly_enabled ?? false;
  const isActive = draft?.isActive ?? server?.is_active ?? true;

  const tenantReportsEnabled =
    emailConfigurationQuery.data?.sales_report_emails_enabled === true &&
    emailConfigurationQuery.data?.is_active === true;

  const isSaving = updateMutation.isPending;

  async function handleSave() {
    try {
      await updateMutation.mutateAsync({
        daily_enabled: dailyEnabled,
        weekly_enabled: weeklyEnabled,
        monthly_enabled: monthlyEnabled,
        is_active: isActive,
      });
      toast({
        title: "Sales report preferences saved",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Could not save preferences",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "error",
      });
    }
  }

  return (
    <SettingsPanelSection
      title="Sales report emails"
      description="Receive scheduled summaries of visits, orders, invoices, and claims."
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSaving || subscriptionQuery.isLoading}
          onClick={() => void handleSave()}
        >
          {isSaving ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            "Save preferences"
          )}
        </Button>
      }
    >
      {subscriptionQuery.isError ? (
        <StatusBanner
          variant="error"
          message="Could not load your sales report preferences. Try again later."
        />
      ) : null}

      {!emailConfigurationQuery.isLoading && !tenantReportsEnabled ? (
        <StatusBanner
          variant="info"
          message="Your organization has not enabled sales report emails yet. Ask a tenant admin to turn this on under Settings → Integrations → Email."
        />
      ) : null}

      {subscriptionQuery.isLoading ? (
        <p className="text-sm text-brand-muted">Loading preferences...</p>
      ) : (
        <div className="divide-y divide-brand-border">
          <PreferenceToggle
            label="Receive sales report emails"
            description="Turn off to stop all scheduled sales report emails."
            checked={isActive}
            onChange={(checked) =>
              setDraft({
                dailyEnabled,
                weeklyEnabled,
                monthlyEnabled,
                isActive: checked,
              })
            }
          />
          <PreferenceToggle
            label="Daily report"
            description="Summary for the previous day, sent each morning."
            checked={dailyEnabled}
            disabled={!isActive}
            onChange={(checked) =>
              setDraft({
                dailyEnabled: checked,
                weeklyEnabled,
                monthlyEnabled,
                isActive,
              })
            }
          />
          <PreferenceToggle
            label="Weekly report"
            description="Summary for the previous Monday through Sunday."
            checked={weeklyEnabled}
            disabled={!isActive}
            onChange={(checked) =>
              setDraft({
                dailyEnabled,
                weeklyEnabled: checked,
                monthlyEnabled,
                isActive,
              })
            }
          />
          <PreferenceToggle
            label="Monthly report"
            description="Summary for the previous calendar month."
            checked={monthlyEnabled}
            disabled={!isActive}
            onChange={(checked) =>
              setDraft({
                dailyEnabled,
                weeklyEnabled,
                monthlyEnabled: checked,
                isActive,
              })
            }
          />
        </div>
      )}
    </SettingsPanelSection>
  );
}

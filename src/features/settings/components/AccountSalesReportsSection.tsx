"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  useSalesReportSubscription,
  useUpdateSalesReportSubscription,
} from "@/features/notifications/hooks/use-sales-report-subscription";
import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import {
  SettingsPanelSection,
  SettingsPreferenceToggle,
} from "@/features/settings/components/SettingsPageLayout";
import { useTenantEmailConfiguration } from "@/features/settings/hooks/use-tenant-email-configuration";
import { useToast } from "@/providers/toast-provider";

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
      title="Sales"
      description="Scheduled summaries of visits, orders, invoices, and claims."
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
            "Save"
          )}
        </Button>
      }
    >
      {subscriptionQuery.isError ? (
        <p className="text-sm text-red-600">
          Could not load your sales report preferences. Try again later.
        </p>
      ) : null}

      {!emailConfigurationQuery.isLoading && !tenantReportsEnabled ? (
        <p className="text-sm text-slate-400">
          Your organization has not enabled these emails yet. Ask an admin to
          turn them on under Integrations → Email.
        </p>
      ) : null}

      {subscriptionQuery.isLoading ? (
        <SettingsContentSkeleton rows={3} showHeader={false} />
      ) : (
        <div className="divide-y divide-brand-border">
          <SettingsPreferenceToggle
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
          <SettingsPreferenceToggle
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
          <SettingsPreferenceToggle
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
          <SettingsPreferenceToggle
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

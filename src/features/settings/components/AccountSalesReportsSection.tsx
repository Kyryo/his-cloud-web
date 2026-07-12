"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { StatusBanner } from "@/components/ui/status-banner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useSalesReportSubscription,
  useUpdateSalesReportSubscription,
} from "@/features/notifications/hooks/use-sales-report-subscription";
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
    <div className="flex items-center justify-between gap-4 rounded-lg border border-brand-border bg-white px-4 py-3">
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

  const [dailyEnabled, setDailyEnabled] = useState(true);
  const [weeklyEnabled, setWeeklyEnabled] = useState(false);
  const [monthlyEnabled, setMonthlyEnabled] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!subscriptionQuery.data) {
      return;
    }
    setDailyEnabled(subscriptionQuery.data.daily_enabled);
    setWeeklyEnabled(subscriptionQuery.data.weekly_enabled);
    setMonthlyEnabled(subscriptionQuery.data.monthly_enabled);
    setIsActive(subscriptionQuery.data.is_active);
  }, [subscriptionQuery.data]);

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
    <Card className="border-brand-border shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-lg">Sales report emails</CardTitle>
          <CardDescription>
            Receive scheduled summaries of visits, orders, invoices, and claims.
          </CardDescription>
        </div>
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
      </CardHeader>
      <CardContent className="space-y-4">
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
          <>
            <PreferenceToggle
              label="Receive sales report emails"
              description="Turn off to stop all scheduled sales report emails."
              checked={isActive}
              onChange={setIsActive}
            />
            <PreferenceToggle
              label="Daily report"
              description="Summary for the previous day, sent each morning."
              checked={dailyEnabled}
              disabled={!isActive}
              onChange={setDailyEnabled}
            />
            <PreferenceToggle
              label="Weekly report"
              description="Summary for the previous Monday through Sunday."
              checked={weeklyEnabled}
              disabled={!isActive}
              onChange={setWeeklyEnabled}
            />
            <PreferenceToggle
              label="Monthly report"
              description="Summary for the previous calendar month."
              checked={monthlyEnabled}
              disabled={!isActive}
              onChange={setMonthlyEnabled}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

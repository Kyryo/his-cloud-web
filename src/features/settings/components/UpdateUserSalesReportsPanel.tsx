"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { StatusBanner } from "@/components/ui/status-banner";
import { Badge } from "@/components/ui/badge";
import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  blockUserSalesReports,
  fetchUserSalesReportSubscription,
  unblockUserSalesReports,
  updateUserSalesReportSubscription,
} from "@/features/notifications/services/sales-report-subscription.service";
import type { SalesReportSubscription } from "@/features/notifications/types/sales-report-subscription.types";
import { UpdateUserTabLoader } from "@/features/settings/components/UpdateUserTabLoader";
import { useTenantEmailConfiguration } from "@/features/settings/hooks/use-tenant-email-configuration";
import { useToast } from "@/providers/toast-provider";

type UpdateUserSalesReportsPanelProps = {
  userId: number;
  userName: string;
  isActive: boolean;
  onChanged?: () => void;
};

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

export function UpdateUserSalesReportsPanel({
  userId,
  userName,
  isActive,
  onChanged,
}: UpdateUserSalesReportsPanelProps) {
  const { toast } = useToast();
  const emailConfigurationQuery = useTenantEmailConfiguration();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SalesReportSubscription | null>(
    null,
  );

  const [dailyEnabled, setDailyEnabled] = useState(true);
  const [weeklyEnabled, setWeeklyEnabled] = useState(false);
  const [monthlyEnabled, setMonthlyEnabled] = useState(false);
  const [reportsActive, setReportsActive] = useState(true);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await fetchUserSalesReportSubscription(userId);
        if (cancelled) {
          return;
        }
        setSubscription(data);
        setDailyEnabled(data.daily_enabled);
        setWeeklyEnabled(data.weekly_enabled);
        setMonthlyEnabled(data.monthly_enabled);
        setReportsActive(data.is_active);
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Could not load sales report preferences.",
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
  }, [isActive, userId]);

  const tenantReportsEnabled =
    emailConfigurationQuery.data?.sales_report_emails_enabled === true &&
    emailConfigurationQuery.data?.is_active === true;

  async function handleSave() {
    try {
      setIsSaving(true);
      const updated = await updateUserSalesReportSubscription(userId, {
        daily_enabled: dailyEnabled,
        weekly_enabled: weeklyEnabled,
        monthly_enabled: monthlyEnabled,
        is_active: reportsActive,
      });
      setSubscription(updated);
      onChanged?.();
      toast({
        variant: "success",
        title: "Sales report preferences saved",
        description: `Updated report subscriptions for ${userName}.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not save preferences",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleBlockToggle() {
    if (!subscription) {
      return;
    }

    try {
      setIsBlocking(true);
      const updated = subscription.is_blocked
        ? await unblockUserSalesReports(userId)
        : await blockUserSalesReports(userId);
      setSubscription(updated);
      onChanged?.();
      toast({
        variant: "success",
        title: updated.is_blocked ? "Reports blocked" : "Reports unblocked",
        description: updated.is_blocked
          ? `${userName} will not receive sales report emails.`
          : `${userName} can receive sales report emails again.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update block status",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsBlocking(false);
    }
  }

  if (!isActive) {
    return null;
  }

  if (isLoading) {
    return <UpdateUserTabLoader message="Loading sales report preferences..." />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-brand-navy">Sales report emails</p>
          <p className="text-xs text-brand-muted">
            Subscribe {userName} to scheduled sales summaries on their behalf.
          </p>
        </div>
        {subscription ? (
          <Badge variant={subscription.is_blocked ? "warning" : "success"}>
            {subscription.is_blocked ? "Blocked" : "Not blocked"}
          </Badge>
        ) : null}
      </div>

      {loadError ? (
        <StatusBanner variant="error" message={loadError} />
      ) : null}

      {!emailConfigurationQuery.isLoading && !tenantReportsEnabled ? (
        <StatusBanner
          variant="info"
          message="Sales report emails are not enabled for this organization. Turn them on under Settings → Integrations → Email."
        />
      ) : null}

      {subscription ? (
        <>
          <PreferenceToggle
            label="Receive sales report emails"
            description="Subscribe this user to scheduled sales report emails."
            checked={reportsActive}
            disabled={subscription.is_blocked}
            onChange={setReportsActive}
          />
          <PreferenceToggle
            label="Daily report"
            description="Summary for the previous day, sent each morning."
            checked={dailyEnabled}
            disabled={!reportsActive || subscription.is_blocked}
            onChange={setDailyEnabled}
          />
          <PreferenceToggle
            label="Weekly report"
            description="Summary for the previous Monday through Sunday."
            checked={weeklyEnabled}
            disabled={!reportsActive || subscription.is_blocked}
            onChange={setWeeklyEnabled}
          />
          <PreferenceToggle
            label="Monthly report"
            description="Summary for the previous calendar month."
            checked={monthlyEnabled}
            disabled={!reportsActive || subscription.is_blocked}
            onChange={setMonthlyEnabled}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-border pt-4">
            <div>
              <p className="text-sm font-medium text-brand-navy">Delivery block</p>
              <p className="text-xs text-brand-muted">
                Block delivery without changing subscription preferences.
              </p>
            </div>
            <SecondaryButton
              type="button"
              disabled={isBlocking || isSaving}
              onClick={() => void handleBlockToggle()}
            >
              {isBlocking ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Updating...
                </>
              ) : subscription.is_blocked ? (
                "Unblock reports"
              ) : (
                "Block reports"
              )}
            </SecondaryButton>
          </div>

          <div className="flex justify-end">
            <PrimaryButton
              type="button"
              disabled={isSaving || isBlocking || subscription.is_blocked}
              onClick={() => void handleSave()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                "Save subscriptions"
              )}
            </PrimaryButton>
          </div>
        </>
      ) : null}
    </div>
  );
}

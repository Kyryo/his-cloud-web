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
  useAppointmentsReportSubscription,
  useUpdateAppointmentsReportSubscription,
} from "@/features/notifications/hooks/use-appointments-report-subscription";
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

export function AccountAppointmentsReportsSection() {
  const { toast } = useToast();
  const subscriptionQuery = useAppointmentsReportSubscription();
  const emailConfigurationQuery = useTenantEmailConfiguration();
  const updateMutation = useUpdateAppointmentsReportSubscription();

  const [dailyEnabled, setDailyEnabled] = useState(true);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!subscriptionQuery.data) {
      return;
    }
    setDailyEnabled(subscriptionQuery.data.daily_enabled);
    setIsActive(subscriptionQuery.data.is_active);
  }, [subscriptionQuery.data]);

  const tenantReportsEnabled =
    emailConfigurationQuery.data?.appointment_report_emails_enabled === true &&
    emailConfigurationQuery.data?.is_active === true;

  const isSaving = updateMutation.isPending;

  async function handleSave() {
    try {
      await updateMutation.mutateAsync({
        daily_enabled: dailyEnabled,
        is_active: isActive,
      });
      toast({
        title: "Appointments report preferences saved",
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
          <CardTitle className="text-lg">Appointments report emails</CardTitle>
          <CardDescription>
            Receive a morning list of today&apos;s appointments with client
            outstanding balances.
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
            message="Could not load your appointments report preferences. Try again later."
          />
        ) : null}

        {!emailConfigurationQuery.isLoading && !tenantReportsEnabled ? (
          <StatusBanner
            variant="info"
            message="Your organization has not enabled appointments report emails yet. Ask a tenant admin to turn this on under Settings → Integrations → Email."
          />
        ) : null}

        {subscriptionQuery.isLoading ? (
          <p className="text-sm text-brand-muted">Loading preferences...</p>
        ) : (
          <>
            <PreferenceToggle
              label="Receive appointments report emails"
              description="Turn off to stop daily appointments report emails."
              checked={isActive}
              onChange={setIsActive}
            />
            <PreferenceToggle
              label="Daily report"
              description="Today's appointments for clinics you can access, sent each morning."
              checked={dailyEnabled}
              disabled={!isActive}
              onChange={setDailyEnabled}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

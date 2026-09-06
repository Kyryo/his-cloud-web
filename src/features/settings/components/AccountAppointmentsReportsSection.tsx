"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  useAppointmentsReportSubscription,
  useUpdateAppointmentsReportSubscription,
} from "@/features/notifications/hooks/use-appointments-report-subscription";
import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import {
  SettingsPanelSection,
  SettingsPreferenceToggle,
} from "@/features/settings/components/SettingsPageLayout";
import { useTenantEmailConfiguration } from "@/features/settings/hooks/use-tenant-email-configuration";
import { useToast } from "@/providers/toast-provider";

export function AccountAppointmentsReportsSection() {
  const { toast } = useToast();
  const subscriptionQuery = useAppointmentsReportSubscription();
  const emailConfigurationQuery = useTenantEmailConfiguration();
  const updateMutation = useUpdateAppointmentsReportSubscription();

  const server = subscriptionQuery.data;
  const [draft, setDraft] = useState<{
    dailyEnabled: boolean;
    isActive: boolean;
  } | null>(null);

  const dailyEnabled = draft?.dailyEnabled ?? server?.daily_enabled ?? true;
  const isActive = draft?.isActive ?? server?.is_active ?? true;

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
    <SettingsPanelSection
      title="Appointments"
      description="A morning list of today's appointments with client outstanding balances."
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
          Could not load your appointments report preferences. Try again later.
        </p>
      ) : null}

      {!emailConfigurationQuery.isLoading && !tenantReportsEnabled ? (
        <p className="text-sm text-slate-400">
          Your organization has not enabled these emails yet. Ask an admin to
          turn them on under Integrations → Email.
        </p>
      ) : null}

      {subscriptionQuery.isLoading ? (
        <SettingsContentSkeleton rows={2} showHeader={false} />
      ) : (
        <div className="divide-y divide-brand-border">
          <SettingsPreferenceToggle
            label="Receive appointments report emails"
            description="Turn off to stop daily appointments report emails."
            checked={isActive}
            onChange={(checked) =>
              setDraft({ dailyEnabled, isActive: checked })
            }
          />
          <SettingsPreferenceToggle
            label="Daily report"
            description="Today's appointments for clinics you can access, sent each morning."
            checked={dailyEnabled}
            disabled={!isActive}
            onChange={(checked) =>
              setDraft({ dailyEnabled: checked, isActive })
            }
          />
        </div>
      )}
    </SettingsPanelSection>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";

import { PrimaryButton } from "@/components/ui/app-buttons";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { LabCatalogAccessDenied } from "@/features/laboratory/components/catalog/LabCatalogAccessDenied";
import {
  labSettingsDefaultValues,
  labSettingsSchema,
  type LabSettingsFormValues,
} from "@/features/laboratory/schemas/lab-settings.schema";
import {
  fetchLabSettings,
  updateLabSettings,
} from "@/features/laboratory/services/laboratory-catalog.service";
import type { LabTenantSettings } from "@/features/laboratory/types/laboratory-catalog.types";
import { isLabCatalogAccessDeniedMessage } from "@/features/laboratory/utils/catalog-form-utils";
import { toLabSettingsPayload } from "@/features/laboratory/utils/catalog-payloads";
import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { SettingsSection } from "@/features/settings/components/SettingsPageLayout";
import { BffError } from "@/lib/bff-client";
import {
  formatBffErrorMessage,
  mapBffErrorsToForm,
} from "@/lib/bff-field-errors";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

function toFormValues(settings: LabTenantSettings): LabSettingsFormValues {
  return {
    auto_accession_on_collect: settings.auto_accession_on_collect,
    require_verify_before_release: settings.require_verify_before_release,
    critical_notify_enabled: settings.critical_notify_enabled,
    default_department_uuid: settings.default_department_uuid ?? "",
    report_footer: settings.report_footer ?? "",
    report_letterhead: settings.report_letterhead ?? "",
    analyzer_ingest_enabled: settings.analyzer_ingest_enabled,
    analyzer_shared_secret_hash: "",
  };
}

type LabSettingsFormProps = {
  /** Use settings chrome (default) or legacy catalog padding. */
  variant?: "settings" | "catalog";
  onLoaded?: (settings: LabTenantSettings) => void;
};

type ToggleField = {
  name:
    | "auto_accession_on_collect"
    | "require_verify_before_release"
    | "critical_notify_enabled"
    | "analyzer_ingest_enabled";
  label: string;
  description: string;
};

function SettingsToggleRow({
  form,
  field,
  disabled,
}: {
  form: UseFormReturn<LabSettingsFormValues>;
  field: ToggleField;
  disabled: boolean;
}) {
  return (
    <FormField
      control={form.control}
      name={field.name}
      render={({ field: control }) => (
        <FormItem className="flex items-center justify-between gap-6 py-3.5 first:pt-0 last:pb-0">
          <div className="min-w-0 space-y-0.5">
            <FormLabel className="text-sm font-medium text-brand-navy">
              {field.label}
            </FormLabel>
            <FormDescription className="text-sm text-slate-400">
              {field.description}
            </FormDescription>
          </div>
          <FormControl>
            <Switch
              checked={control.value}
              onCheckedChange={control.onChange}
              disabled={disabled}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export function LabSettingsForm({
  variant = "settings",
  onLoaded,
}: LabSettingsFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [secretConfigured, setSecretConfigured] = useState(false);
  const [departmentHint, setDepartmentHint] = useState<string | null>(null);

  const form = useForm<LabSettingsFormValues>({
    resolver: zodResolver(labSettingsSchema),
    defaultValues: labSettingsDefaultValues,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      await Promise.resolve();
      if (cancelled) {
        return;
      }
      setIsLoading(true);
      setLoadError(null);
      setIsUnauthorized(false);
      try {
        const settings = await fetchLabSettings();
        if (cancelled) {
          return;
        }
        form.reset(toFormValues(settings));
        setSecretConfigured(settings.analyzer_shared_secret_configured);
        setDepartmentHint(settings.default_department_name);
        onLoaded?.(settings);
      } catch (error) {
        if (cancelled) {
          return;
        }
        const message =
          error instanceof Error ? error.message : "Failed to load settings.";
        if (isLabCatalogAccessDeniedMessage(message)) {
          setIsUnauthorized(true);
        } else {
          setLoadError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSettings();
    return () => {
      cancelled = true;
    };
  }, [form, onLoaded]);

  async function handleSubmit(values: LabSettingsFormValues) {
    try {
      const updated = await updateLabSettings(toLabSettingsPayload(values));
      form.reset(toFormValues(updated));
      setSecretConfigured(updated.analyzer_shared_secret_configured);
      setDepartmentHint(updated.default_department_name);
      toast({
        variant: "success",
        title: "Settings saved",
        description: "Laboratory tenant settings were updated.",
      });
    } catch (error) {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in labSettingsDefaultValues) {
            form.setError(field as keyof LabSettingsFormValues, { message });
          }
        }
        toast({
          variant: "error",
          title: "Could not save settings",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }
      toast({
        variant: "error",
        title: "Could not save settings",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    }
  }

  if (isUnauthorized) {
    return <LabCatalogAccessDenied data-testid="lab-settings-access-denied" />;
  }

  if (isLoading) {
    return variant === "settings" ? (
      <SettingsContentSkeleton />
    ) : (
      <p
        className="px-4 py-8 text-sm text-slate-400 sm:px-6"
        data-testid="lab-settings-loading"
      >
        Loading laboratory settings…
      </p>
    );
  }

  if (loadError) {
    return (
      <p
        className={cn(
          "py-8 text-sm text-red-600",
          variant === "catalog" && "px-4 sm:px-6",
        )}
      >
        {loadError}
      </p>
    );
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        className={cn(variant === "catalog" && "px-4 pb-8 sm:px-6")}
        data-testid="lab-settings-form"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <SettingsSection
          title="Workflow"
          description="Defaults that apply when specimens are collected and results are released."
          flush
        >
          <div className="divide-y divide-brand-border">
            <SettingsToggleRow
              form={form}
              disabled={isSubmitting}
              field={{
                name: "auto_accession_on_collect",
                label: "Auto-accession on collect",
                description:
                  "Accession specimens as soon as they are collected. Turn off to require a separate Accession step.",
              }}
            />
            <SettingsToggleRow
              form={form}
              disabled={isSubmitting}
              field={{
                name: "require_verify_before_release",
                label: "Require verify before release",
                description:
                  "Results must be verified before they are released.",
              }}
            />
            <SettingsToggleRow
              form={form}
              disabled={isSubmitting}
              field={{
                name: "critical_notify_enabled",
                label: "Critical result notifications",
                description:
                  "Notify clinicians when a critical value is recorded.",
              }}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Reports"
          description="Text printed on every laboratory report."
        >
          <div className="grid gap-5">
            <FormField
              control={form.control}
              name="report_letterhead"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Letterhead</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="report_footer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Footer</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Analyzer ingest"
          description="Allow instruments to post results for this tenant."
          flush
        >
          <div className="divide-y divide-brand-border">
            <SettingsToggleRow
              form={form}
              disabled={isSubmitting}
              field={{
                name: "analyzer_ingest_enabled",
                label: "Enable ingest",
                description:
                  "Accept result payloads from connected analyzers.",
              }}
            />
          </div>
          <FormField
            control={form.control}
            name="analyzer_shared_secret_hash"
            render={({ field }) => (
              <FormItem className="pt-5">
                <FormLabel>Shared secret</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    autoComplete="new-password"
                    placeholder="Leave blank to keep the current secret"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  {secretConfigured
                    ? "A shared secret is already configured."
                    : "No shared secret configured yet."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </SettingsSection>

        <SettingsSection
          title="Default department"
          description="Used when an order is created without a department."
        >
          <FormField
            control={form.control}
            name="default_department_uuid"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department UUID</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isSubmitting}
                    className={cn("font-mono")}
                  />
                </FormControl>
                {departmentHint ? (
                  <FormDescription>Current: {departmentHint}</FormDescription>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />
        </SettingsSection>

        <div className="flex justify-end border-t border-brand-border pt-6">
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save settings"
            )}
          </PrimaryButton>
        </div>
      </form>
    </Form>
  );
}

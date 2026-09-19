"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

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
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
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
  onLoaded?: (settings: LabTenantSettings) => void;
};

export function LabSettingsForm({ onLoaded }: LabSettingsFormProps) {
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
    void (async () => {
      setIsLoading(true);
      setLoadError(null);
      setIsUnauthorized(false);
      try {
        const settings = await fetchLabSettings();
        if (cancelled) return;
        form.reset(toFormValues(settings));
        setSecretConfigured(settings.analyzer_shared_secret_configured);
        setDepartmentHint(settings.default_department_name);
        onLoaded?.(settings);
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : "Failed to load settings.";
        if (isLabCatalogAccessDeniedMessage(message)) {
          setIsUnauthorized(true);
        } else {
          setLoadError(message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
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
    return (
      <div
        className="rounded-xl border border-brand-border bg-white p-8 text-sm text-brand-muted"
        data-testid="lab-settings-loading"
      >
        Loading laboratory settings…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-brand-border bg-white p-8 text-sm text-red-600">
        {loadError}
      </div>
    );
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        className="space-y-6 rounded-xl border border-brand-border bg-white p-6"
        data-testid="lab-settings-form"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="auto_accession_on_collect"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4 rounded-lg border border-brand-border px-3 py-2">
                <div>
                  <FormLabel>Auto-accession on collect</FormLabel>
                  <FormDescription>
                    Accession the order when specimens are collected.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="require_verify_before_release"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4 rounded-lg border border-brand-border px-3 py-2">
                <div>
                  <FormLabel>Require verify before release</FormLabel>
                  <FormDescription>
                    Results must be verified before release.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="critical_notify_enabled"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4 rounded-lg border border-brand-border px-3 py-2">
                <div>
                  <FormLabel>Critical result notifications</FormLabel>
                  <FormDescription>
                    Notify clinicians when critical values are recorded.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="analyzer_ingest_enabled"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4 rounded-lg border border-brand-border px-3 py-2">
                <div>
                  <FormLabel>Analyzer ingest</FormLabel>
                  <FormDescription>
                    Allow instrument result ingest for this tenant.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="default_department_uuid"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default department UUID</FormLabel>
              <FormControl>
                <Input {...field} disabled={isSubmitting} />
              </FormControl>
              {departmentHint ? (
                <FormDescription>Current: {departmentHint}</FormDescription>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="report_letterhead"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Report letterhead</FormLabel>
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
              <FormLabel>Report footer</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="analyzer_shared_secret_hash"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Analyzer shared secret</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  autoComplete="new-password"
                  placeholder="Leave blank to keep current secret"
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

        <div className="flex justify-end">
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

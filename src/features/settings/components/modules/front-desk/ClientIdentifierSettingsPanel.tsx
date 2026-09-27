"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { SettingsPanelSection } from "@/features/settings/components/SettingsPageLayout";
import {
  customerIdentifierSettingsSchema,
  type CustomerIdentifierSettingsFormValues,
} from "@/features/settings/schemas/customer-identifier-settings.schema";
import {
  fetchCustomerIdentifierSettings,
  updateCustomerIdentifierSettings,
} from "@/features/settings/services/settings.service";
import type { TenantCustomerIdentifierSettings } from "@/features/settings/types/settings.types";
import { formatCustomerIdentifierPreview } from "@/features/settings/utils/format-customer-identifier-preview";
import { useToast } from "@/providers/toast-provider";
import { useUser } from "@/providers/user-provider";

function toFormValues(
  settings: TenantCustomerIdentifierSettings,
): CustomerIdentifierSettingsFormValues {
  return {
    customer_identifier_prefix: settings.customer_identifier_prefix ?? "",
    customer_identifier_digits: settings.customer_identifier_digits ?? 6,
    customer_identifier_separator: settings.customer_identifier_separator ?? "-",
    customer_identifier_suffix: settings.customer_identifier_suffix ?? "",
    customer_identifier_start_number:
      settings.customer_identifier_start_number ?? 1,
  };
}

export function ClientIdentifierSettingsPanel() {
  const { toast } = useToast();
  const { userData } = useUser();
  const tenantCode = userData?.tenant?.code?.trim() || "ORG";
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savedPreview, setSavedPreview] = useState<string | null>(null);

  const form = useForm<CustomerIdentifierSettingsFormValues>({
    resolver: zodResolver(customerIdentifierSettingsSchema),
    defaultValues: {
      customer_identifier_prefix: "",
      customer_identifier_digits: 6,
      customer_identifier_separator: "-",
      customer_identifier_suffix: "",
      customer_identifier_start_number: 1,
    },
  });

  const watched = form.watch();

  const livePreview = useMemo(
    () =>
      formatCustomerIdentifierPreview({
        prefix: watched.customer_identifier_prefix ?? "",
        fallbackPrefix: tenantCode,
        separator: watched.customer_identifier_separator ?? "",
        digits: Number(watched.customer_identifier_digits) || 6,
        startNumber: Number(watched.customer_identifier_start_number) || 1,
        suffix: watched.customer_identifier_suffix ?? "",
      }),
    [tenantCode, watched],
  );

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setLoadError(null);
      try {
        const settings = await fetchCustomerIdentifierSettings();
        if (!active) {
          return;
        }
        form.reset(toFormValues(settings));
        setSavedPreview(settings.preview);
        setHasLoaded(true);
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load Client ID settings.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSaving(true);
    try {
      const settings = await updateCustomerIdentifierSettings({
        customer_identifier_prefix: values.customer_identifier_prefix,
        customer_identifier_digits: values.customer_identifier_digits,
        customer_identifier_separator: values.customer_identifier_separator,
        customer_identifier_suffix: values.customer_identifier_suffix,
        customer_identifier_start_number: values.customer_identifier_start_number,
      });
      form.reset(toFormValues(settings));
      setSavedPreview(settings.preview);
      toast({
        title: "Client ID format saved",
        description: "New clients will receive IDs using this pattern.",
      });
    } catch (error) {
      toast({
        title: "Could not save Client ID format",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  });

  if (isLoading && !hasLoaded) {
    return <SettingsContentSkeleton variant="form" />;
  }

  if (loadError && !hasLoaded) {
    return <p className="text-sm text-red-600">{loadError}</p>;
  }

  const effectivePrefix =
    (watched.customer_identifier_prefix ?? "").trim() || tenantCode;

  return (
    <SettingsPanelSection
      title="Client ID / MRN"
      description="Define how medical record numbers are generated when a client is registered. Existing IDs are not changed."
    >
      <div className="space-y-8">
        <div className="rounded-xl border border-brand-border bg-gradient-to-br from-slate-50 to-white p-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
            Preview
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-brand-navy">
            {livePreview}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <FormatChip label="Prefix" value={effectivePrefix} />
            {(watched.customer_identifier_separator ?? "") !== "" ? (
              <FormatChip
                label="Separator"
                value={watched.customer_identifier_separator || "·"}
              />
            ) : null}
            <FormatChip
              label="Number"
              value={String(
                Number(watched.customer_identifier_start_number) || 1,
              ).padStart(Number(watched.customer_identifier_digits) || 6, "0")}
            />
            {(watched.customer_identifier_suffix ?? "").trim() ? (
              <FormatChip
                label="Suffix"
                value={watched.customer_identifier_suffix}
              />
            ) : null}
          </div>
          {savedPreview && savedPreview !== livePreview ? (
            <p className="mt-3 text-xs text-slate-400">
              Last saved preview:{" "}
              <span className="font-mono text-slate-600">{savedPreview}</span>
            </p>
          ) : null}
        </div>

        <Form {...form}>
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="customer_identifier_prefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prefix</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={tenantCode}
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </FormControl>
                    <FormDescription>
                      Leave blank to use your organization code ({tenantCode}).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_identifier_separator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Separator</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="-"
                        autoComplete="off"
                        spellCheck={false}
                        maxLength={4}
                      />
                    </FormControl>
                    <FormDescription>
                      Character between prefix and number (e.g. - or /).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_identifier_digits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number length</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        max={12}
                        inputMode="numeric"
                      />
                    </FormControl>
                    <FormDescription>
                      Digits to zero-pad (1–12). Example: 6 → 000001.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_identifier_start_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        inputMode="numeric"
                      />
                    </FormControl>
                    <FormDescription>
                      Sequence begins at this value for new clients.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customer_identifier_suffix"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Suffix (optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g. MW"
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </FormControl>
                    <FormDescription>
                      Appended after the number. Letters, numbers, _ and - only.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-brand-border pt-5">
              <PrimaryButton type="submit" disabled={isSaving || !form.formState.isDirty}>
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Saving…
                  </>
                ) : (
                  "Save format"
                )}
              </PrimaryButton>
            </div>
          </form>
        </Form>
      </div>
    </SettingsPanelSection>
  );
}

function FormatChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-white px-2.5 py-1 text-xs text-slate-600">
      <span className="text-slate-400">{label}</span>
      <span className="font-mono font-medium text-brand-navy">{value}</span>
    </span>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { PrimaryButton } from "@/components/ui/app-buttons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { OrganizationTabSection } from "@/features/settings/components/OrganizationTabSection";
import {
  organizationBrandingSchema,
  type OrganizationBrandingFormValues,
} from "@/features/settings/schemas/organization-branding.schema";
import {
  fetchOrganizationBranding,
  updateOrganizationBranding,
} from "@/features/settings/services/settings.service";
import type { TenantBranding } from "@/features/settings/types/settings.types";
import { useToast } from "@/providers/toast-provider";

type OrganizationBrandingTabProps = {
  isActive: boolean;
};

function toFormValues(branding: TenantBranding): OrganizationBrandingFormValues {
  return {
    branding_logo_url: branding.branding_logo_url ?? "",
    branding_primary_color: branding.branding_primary_color ?? "",
    branding_secondary_color: branding.branding_secondary_color ?? "",
    branding_accent_color: branding.branding_accent_color ?? "",
  };
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const pickerValue = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000";

  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={pickerValue}
        onChange={(event) => onChange(event.target.value)}
        className="size-10 shrink-0 cursor-pointer rounded-lg border border-brand-border bg-white p-1"
        aria-label={`${label} color picker`}
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="#2563EB"
      />
    </div>
  );
}

export function OrganizationBrandingTab({ isActive }: OrganizationBrandingTabProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<OrganizationBrandingFormValues>({
    resolver: zodResolver(organizationBrandingSchema),
    defaultValues: {
      branding_logo_url: "",
      branding_primary_color: "",
      branding_secondary_color: "",
      branding_accent_color: "",
    },
  });

  const watchedValues = form.watch();

  useEffect(() => {
    if (!isActive || hasLoaded) {
      return;
    }

    let active = true;

    async function loadBranding() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const branding = await fetchOrganizationBranding();
        if (active) {
          form.reset(toFormValues(branding));
          setHasLoaded(true);
        }
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load branding settings.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadBranding();

    return () => {
      active = false;
    };
  }, [form, hasLoaded, isActive]);

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSaving(true);

    try {
      const branding = await updateOrganizationBranding(values);
      form.reset(toFormValues(branding));
      toast({
        variant: "success",
        title: "Branding updated",
        description: "Your organization branding has been saved.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not save branding",
        description:
          error instanceof Error ? error.message : "Try again in a moment.",
      });
    } finally {
      setIsSaving(false);
    }
  });

  if (!isActive) {
    return null;
  }

  if (isLoading && !hasLoaded) {
    return (
      <div className="flex items-center gap-2 py-10 text-sm text-brand-muted">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading branding...
      </div>
    );
  }

  if (loadError && !hasLoaded) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
        {loadError}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <OrganizationTabSection
        title="Brand appearance"
        description="Customize colors and logo used across your organization's workspace."
      >
        <Form {...form}>
          <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="branding_logo_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/logo.png"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branding_primary_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary color</FormLabel>
                      <FormControl>
                        <ColorField
                          label="Primary"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branding_secondary_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary color</FormLabel>
                      <FormControl>
                        <ColorField
                          label="Secondary"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branding_accent_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accent color</FormLabel>
                      <FormControl>
                        <ColorField
                          label="Accent"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-xl border border-brand-border bg-slate-50/70 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
                  Preview
                </p>
                <div
                  className="mt-4 overflow-hidden rounded-lg border border-brand-border bg-white"
                  style={{
                    borderTopColor:
                      watchedValues.branding_primary_color || undefined,
                    borderTopWidth: watchedValues.branding_primary_color
                      ? "3px"
                      : undefined,
                  }}
                >
                  <div
                    className="px-4 py-3 text-sm font-semibold text-white"
                    style={{
                      backgroundColor:
                        watchedValues.branding_primary_color || "#1e293b",
                    }}
                  >
                    {watchedValues.branding_logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={watchedValues.branding_logo_url}
                        alt="Organization logo preview"
                        className="h-8 max-w-full object-contain"
                      />
                    ) : (
                      "Your organization"
                    )}
                  </div>
                  <div className="space-y-2 px-4 py-3 text-sm">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        backgroundColor:
                          watchedValues.branding_secondary_color || "#e2e8f0",
                      }}
                    />
                    <div
                      className="inline-flex rounded-full px-3 py-1 text-xs font-medium text-white"
                      style={{
                        backgroundColor:
                          watchedValues.branding_accent_color || "#64748b",
                      }}
                    >
                      Accent
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <PrimaryButton type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                "Save branding"
              )}
            </PrimaryButton>
          </form>
        </Form>
      </OrganizationTabSection>
    </div>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";
import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  OrganizationFieldRow,
  OrganizationTabPanel,
} from "@/features/settings/components/OrganizationTabContent";
import {
  organizationBrandingSchema,
  type OrganizationBrandingFormValues,
} from "@/features/settings/schemas/organization-branding.schema";
import {
  fetchOrganizationBranding,
  updateOrganizationBranding,
  uploadOrganizationBrandingLogo,
} from "@/features/settings/services/settings.service";
import type {
  TenantBranding,
  UpdateTenantBrandingPayload,
} from "@/features/settings/types/settings.types";
import { compressBrandingLogo } from "@/features/settings/utils/image-compression";
import { useToast } from "@/providers/toast-provider";

type OrganizationBrandingTabProps = {
  isActive: boolean;
};

function toFormValues(
  branding: TenantBranding,
): OrganizationBrandingFormValues {
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
    <div className="flex max-w-sm items-center gap-3">
      <input
        type="color"
        value={pickerValue}
        onChange={(event) => onChange(event.target.value)}
        className="size-8 shrink-0 cursor-pointer rounded-md border border-brand-border bg-white p-0.5"
        aria-label={`${label} color picker`}
      />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="#2563EB"
        className="font-mono"
      />
    </div>
  );
}

export function OrganizationBrandingTab({
  isActive,
}: OrganizationBrandingTabProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreparingImage, setIsPreparingImage] = useState(false);
  const [selectedBrandingLogo, setSelectedBrandingLogo] = useState<File | null>(
    null,
  );
  const [selectedBrandingLogoUrl, setSelectedBrandingLogoUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<OrganizationBrandingFormValues>({
    resolver: zodResolver(organizationBrandingSchema),
    defaultValues: {
      branding_logo_url: "",
      branding_primary_color: "",
      branding_secondary_color: "",
      branding_accent_color: "",
    },
  });

  const watchedValues = useWatch({ control: form.control });
  const previewImageUrl =
    selectedBrandingLogoUrl || watchedValues.branding_logo_url;

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

  useEffect(() => {
    return () => {
      if (selectedBrandingLogoUrl) {
        URL.revokeObjectURL(selectedBrandingLogoUrl);
      }
    };
  }, [selectedBrandingLogoUrl]);

  async function handleBrandingLogoChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "error",
        title: "Invalid image",
        description: "Choose a valid image file.",
      });
      return;
    }

    setIsPreparingImage(true);

    try {
      const preparedFile = await compressBrandingLogo(file);
      if (selectedBrandingLogoUrl) {
        URL.revokeObjectURL(selectedBrandingLogoUrl);
      }
      setSelectedBrandingLogo(preparedFile);
      setSelectedBrandingLogoUrl(URL.createObjectURL(preparedFile));
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not prepare image",
        description:
          error instanceof Error ? error.message : "Choose a different image.",
      });
    } finally {
      setIsPreparingImage(false);
    }
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSaving(true);

    try {
      const payload: UpdateTenantBrandingPayload = {
        branding_primary_color: values.branding_primary_color,
        branding_secondary_color: values.branding_secondary_color,
        branding_accent_color: values.branding_accent_color,
      };

      if (selectedBrandingLogo) {
        await uploadOrganizationBrandingLogo(selectedBrandingLogo);
        setSelectedBrandingLogo(null);
      }

      const branding = await updateOrganizationBranding(payload);
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
    return <SettingsContentSkeleton variant="form" />;
  }

  if (loadError && !hasLoaded) {
    return (
      <p className="text-sm text-red-600">{loadError}</p>
    );
  }

  return (
    <OrganizationTabPanel description="Logo and colors used on documents and the workspace.">
      <Form {...form}>
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="space-y-1"
        >
          <OrganizationFieldRow label="Logo">
            <div className="flex items-center gap-3">
              {previewImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewImageUrl}
                  alt="Organization logo"
                  className="size-10 rounded-md object-contain"
                />
              ) : (
                <span className="text-slate-400">No logo</span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => void handleBrandingLogoChange(event)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSaving || isPreparingImage}
                onClick={() => fileInputRef.current?.click()}
              >
                {isPreparingImage ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Upload className="size-4" aria-hidden="true" />
                )}
                {watchedValues.branding_logo_url || selectedBrandingLogo
                  ? "Change"
                  : "Upload"}
              </Button>
            </div>
          </OrganizationFieldRow>

          <FormField
            control={form.control}
            name="branding_primary_color"
            render={({ field }) => (
              <FormItem>
                <OrganizationFieldRow label="Primary">
                  <FormControl>
                    <ColorField
                      label="Primary"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </OrganizationFieldRow>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="branding_secondary_color"
            render={({ field }) => (
              <FormItem>
                <OrganizationFieldRow label="Secondary">
                  <FormControl>
                    <ColorField
                      label="Secondary"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </OrganizationFieldRow>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="branding_accent_color"
            render={({ field }) => (
              <FormItem>
                <OrganizationFieldRow label="Accent">
                  <FormControl>
                    <ColorField
                      label="Accent"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </OrganizationFieldRow>
              </FormItem>
            )}
          />

          <div className="pt-5">
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isSaving || isPreparingImage}
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                "Save branding"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </OrganizationTabPanel>
  );
}

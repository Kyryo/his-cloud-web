"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import {
  fetchMasemPayerIntegration,
  fetchMasmPortalCredential,
  updateMasemPayerIntegration,
  updateMasmPortalCredential,
} from "@/features/claims/services/claims.service";
import type {
  MasmPayerIntegration,
  MasmPortalCredential,
} from "@/features/claims/types/claims.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { useToast } from "@/providers/toast-provider";

const masmIntegrationSchema = z.object({
  is_enabled: z.boolean(),
  is_active: z.boolean(),
  client_key: z.string().trim().min(1, "Client key is required"),
  client_secret: z.string().optional(),
  sso_url: z.string().trim().url("Enter a valid SSO URL"),
  api_base_url: z.string().trim().url("Enter a valid API base URL"),
  operator_email: z.string().trim().email("Enter a valid operator email").or(z.literal("")),
  portal_password: z.string().optional(),
  portal_is_enabled: z.boolean(),
});

type MasmIntegrationFormValues = z.infer<typeof masmIntegrationSchema>;

function toFormValues(
  integration: MasmPayerIntegration,
  credential: MasmPortalCredential | null,
): MasmIntegrationFormValues {
  return {
    is_enabled: integration.is_enabled,
    is_active: integration.is_active,
    client_key: integration.client_key ?? "",
    client_secret: "",
    sso_url: integration.sso_url ?? "",
    api_base_url: integration.api_base_url ?? "",
    operator_email: credential?.operator_email ?? "",
    portal_password: "",
    portal_is_enabled: credential?.is_enabled ?? false,
  };
}

type MasmEclaimsSettingsFormProps = {
  clinicId: number;
  integration: MasmPayerIntegration;
  credential: MasmPortalCredential | null;
  onUpdated: (payload: {
    integration: MasmPayerIntegration;
    credential: MasmPortalCredential;
  }) => void;
};

export function MasmEclaimsSettingsForm({
  clinicId,
  integration,
  credential,
  onUpdated,
}: MasmEclaimsSettingsFormProps) {
  const { toast } = useToast();
  const form = useForm<MasmIntegrationFormValues>({
    resolver: zodResolver(masmIntegrationSchema),
    defaultValues: toFormValues(integration, credential),
  });

  useEffect(() => {
    form.reset(toFormValues(integration, credential));
  }, [form, integration, credential]);

  async function handleSubmit(values: MasmIntegrationFormValues) {
    try {
      const integrationPayload = {
        is_enabled: values.is_enabled,
        is_active: values.is_active,
        client_key: values.client_key.trim(),
        sso_url: values.sso_url.trim(),
        api_base_url: values.api_base_url.trim(),
        ...(values.client_secret?.trim()
          ? { client_secret: values.client_secret.trim() }
          : {}),
      };

      const portalPayload = {
        operator_email: values.operator_email.trim(),
        is_enabled: values.portal_is_enabled,
        ...(values.portal_password?.trim()
          ? { password: values.portal_password.trim() }
          : {}),
      };

      const [updatedIntegration, updatedCredential] = await Promise.all([
        updateMasemPayerIntegration(clinicId, integrationPayload),
        updateMasmPortalCredential(clinicId, portalPayload),
      ]);

      onUpdated({
        integration: updatedIntegration,
        credential: updatedCredential,
      });
      toast({
        variant: "success",
        title: "MASM settings saved",
        description: "Clinic Integration API and portal credentials were updated.",
      });
      form.reset({
        ...toFormValues(updatedIntegration, updatedCredential),
        client_secret: "",
        portal_password: "",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not save MASM settings",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="rounded-lg border border-brand-border bg-brand-surface/40 px-4 py-3 text-sm text-brand-muted">
          Credentials are clinic-scoped. Submit uses the Integration API; closing claims
          on MASM uses portal automation (claims-engine) so staff do not close drafts
          manually.
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center justify-between gap-4 rounded-lg border border-brand-border bg-white px-4 py-3 sm:col-span-2">
            <div>
              <p className="text-sm font-medium text-brand-navy">Integration enabled</p>
              <p className="text-xs text-brand-muted">
                Allow claim submit via the MASM Integration API for this clinic.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.watch("is_enabled")}
              onChange={(event) => form.setValue("is_enabled", event.target.checked)}
              className="size-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-lg border border-brand-border bg-white px-4 py-3 sm:col-span-2">
            <div>
              <p className="text-sm font-medium text-brand-navy">Integration active</p>
              <p className="text-xs text-brand-muted">
                Inactive integrations are ignored during claim workflows.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.watch("is_active")}
              onChange={(event) => form.setValue("is_active", event.target.checked)}
              className="size-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
            />
          </label>
        </div>

        <FormField
          control={form.control}
          name="client_key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client key</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="client_secret"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client secret</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  autoComplete="new-password"
                  placeholder={
                    integration.has_client_secret
                      ? "Leave blank to keep the current secret"
                      : "Enter client secret"
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sso_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SSO URL</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="api_base_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API base URL</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t border-brand-border pt-6">
          <h3 className="text-sm font-semibold text-brand-navy">Portal automation</h3>
          <p className="mt-1 text-xs text-brand-muted">
            Operator login used by claims-engine to close submitted claims on the MASM
            portal.
          </p>
        </div>

        <label className="flex items-center justify-between gap-4 rounded-lg border border-brand-border bg-white px-4 py-3">
          <div>
            <p className="text-sm font-medium text-brand-navy">Portal automation enabled</p>
            <p className="text-xs text-brand-muted">
              Required for automatic close-after-submit.
            </p>
          </div>
          <input
            type="checkbox"
            checked={form.watch("portal_is_enabled")}
            onChange={(event) =>
              form.setValue("portal_is_enabled", event.target.checked)
            }
            className="size-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
          />
        </label>

        <FormField
          control={form.control}
          name="operator_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portal operator email</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="off" type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="portal_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portal operator password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  autoComplete="new-password"
                  placeholder={
                    credential?.has_password
                      ? "Leave blank to keep the current password"
                      : "Enter portal password"
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <PrimaryButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </PrimaryButton>
      </form>
    </Form>
  );
}

export async function loadMasemClinicSettings(clinicId: number): Promise<{
  integration: MasmPayerIntegration;
  credential: MasmPortalCredential;
}> {
  const [integration, credential] = await Promise.all([
    fetchMasemPayerIntegration(clinicId),
    fetchMasmPortalCredential(clinicId),
  ]);
  return { integration, credential };
}

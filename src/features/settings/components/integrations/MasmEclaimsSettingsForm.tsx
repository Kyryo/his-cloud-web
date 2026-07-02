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
  updateMasemPayerIntegration,
} from "@/features/claims/services/claims.service";
import type { MasmPayerIntegration } from "@/features/claims/types/claims.types";
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
});

type MasmIntegrationFormValues = z.infer<typeof masmIntegrationSchema>;

function toFormValues(integration: MasmPayerIntegration): MasmIntegrationFormValues {
  return {
    is_enabled: integration.is_enabled,
    is_active: integration.is_active,
    client_key: integration.client_key ?? "",
    client_secret: "",
    sso_url: integration.sso_url ?? "",
    api_base_url: integration.api_base_url ?? "",
  };
}

type MasmEclaimsSettingsFormProps = {
  integration: MasmPayerIntegration;
  onUpdated: (integration: MasmPayerIntegration) => void;
};

export function MasmEclaimsSettingsForm({
  integration,
  onUpdated,
}: MasmEclaimsSettingsFormProps) {
  const { toast } = useToast();
  const form = useForm<MasmIntegrationFormValues>({
    resolver: zodResolver(masmIntegrationSchema),
    defaultValues: toFormValues(integration),
  });

  useEffect(() => {
    form.reset(toFormValues(integration));
  }, [form, integration]);

  async function handleSubmit(values: MasmIntegrationFormValues) {
    try {
      const payload = {
        is_enabled: values.is_enabled,
        is_active: values.is_active,
        client_key: values.client_key.trim(),
        sso_url: values.sso_url.trim(),
        api_base_url: values.api_base_url.trim(),
        ...(values.client_secret?.trim()
          ? { client_secret: values.client_secret.trim() }
          : {}),
      };

      const updated = await updateMasemPayerIntegration(payload);
      onUpdated(updated);
      toast({
        variant: "success",
        title: "MASM settings saved",
        description: "Payer integration credentials were updated.",
      });
      form.reset({
        ...toFormValues(updated),
        client_secret: "",
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
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center justify-between gap-4 rounded-lg border border-brand-border bg-white px-4 py-3 sm:col-span-2">
            <div>
              <p className="text-sm font-medium text-brand-navy">Enabled</p>
              <p className="text-xs text-brand-muted">
                Allow claims submission using this integration.
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
              <p className="text-sm font-medium text-brand-navy">Active</p>
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

export async function loadMasemPayerIntegration(): Promise<MasmPayerIntegration> {
  return fetchMasemPayerIntegration();
}

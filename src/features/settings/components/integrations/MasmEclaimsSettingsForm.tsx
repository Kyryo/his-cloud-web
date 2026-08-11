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

const integrationSchema = z
  .object({
    is_enabled: z.boolean(),
    send_total_amount: z.boolean(),
    client_key: z.string(),
    client_secret: z.string().optional(),
    sso_url: z.string(),
    api_base_url: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!values.is_enabled) {
      return;
    }

    if (!values.client_key.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Client key is required",
        path: ["client_key"],
      });
    }

    try {
      new URL(values.sso_url.trim());
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid SSO URL",
        path: ["sso_url"],
      });
    }

    try {
      new URL(values.api_base_url.trim());
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid API base URL",
        path: ["api_base_url"],
      });
    }
  });

const portalSchema = z
  .object({
    operator_email: z.string(),
    portal_password: z.string().optional(),
    portal_is_enabled: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (!values.portal_is_enabled) {
      return;
    }

    const email = values.operator_email.trim();
    if (!email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid operator email",
        path: ["operator_email"],
      });
      return;
    }

    const emailResult = z.string().email().safeParse(email);
    if (!emailResult.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid operator email",
        path: ["operator_email"],
      });
    }
  });

type IntegrationFormValues = z.infer<typeof integrationSchema>;
type PortalFormValues = z.infer<typeof portalSchema>;

function toIntegrationValues(
  integration: MasmPayerIntegration,
): IntegrationFormValues {
  return {
    is_enabled: integration.is_enabled,
    send_total_amount: Boolean(integration.send_total_amount),
    client_key: integration.client_key ?? "",
    client_secret: "",
    sso_url: integration.sso_url ?? "",
    api_base_url: integration.api_base_url ?? "",
  };
}

function toPortalValues(
  credential: MasmPortalCredential | null,
): PortalFormValues {
  return {
    operator_email: credential?.operator_email ?? "",
    portal_password: "",
    portal_is_enabled: credential?.is_enabled ?? false,
  };
}

type MasmIntegrationSettingsFormProps = {
  clinicId: number;
  integration: MasmPayerIntegration;
  onUpdated: (integration: MasmPayerIntegration) => void;
};

export function MasmIntegrationSettingsForm({
  clinicId,
  integration,
  onUpdated,
}: MasmIntegrationSettingsFormProps) {
  const { toast } = useToast();
  const form = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationSchema),
    defaultValues: toIntegrationValues(integration),
  });

  useEffect(() => {
    form.reset(toIntegrationValues(integration));
  }, [form, integration]);

  async function handleSubmit(values: IntegrationFormValues) {
    try {
      const updatedIntegration = await updateMasemPayerIntegration(
        clinicId,
        values.is_enabled
          ? {
              is_enabled: true,
              // Keep the row usable for claim workflows when the feature is turned on.
              is_active: true,
              send_total_amount: values.send_total_amount,
              client_key: values.client_key.trim(),
              sso_url: values.sso_url.trim(),
              api_base_url: values.api_base_url.trim(),
              ...(values.client_secret?.trim()
                ? { client_secret: values.client_secret.trim() }
                : {}),
            }
          : {
              is_enabled: false,
              is_active: true,
              send_total_amount: values.send_total_amount,
            },
      );

      onUpdated(updatedIntegration);
      toast({
        variant: "success",
        title: "Integration settings saved",
        description: "Clinic Integration API credentials were updated.",
      });
      form.reset({
        ...toIntegrationValues(updatedIntegration),
        client_secret: "",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not save integration settings",
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
  const isEnabled = form.watch("is_enabled");

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="rounded-lg border border-brand-border bg-brand-surface/40 px-4 py-3 text-sm text-brand-muted">
          Credentials are clinic-scoped. Claim submit uses the MASM Integration
          API for this clinic.
        </div>

        <div className="grid gap-4">
          <label className="flex items-center justify-between gap-4 rounded-lg border border-brand-border bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-brand-navy">
                Integration enabled
              </p>
              <p className="text-xs text-brand-muted">
                Allow claim submit via the MASM Integration API for this clinic.
              </p>
            </div>
            <input
              type="checkbox"
              checked={isEnabled}
              disabled={isSubmitting}
              onChange={(event) =>
                form.setValue("is_enabled", event.target.checked, {
                  shouldValidate: true,
                })
              }
              className="size-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-lg border border-brand-border bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-brand-navy">
                Send total amount to MASM
              </p>
              <p className="text-xs text-brand-muted">
                When off, only the payer due is submitted. When on, payer +
                client due (line total) is sent.
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.watch("send_total_amount")}
              disabled={!isEnabled || isSubmitting}
              onChange={(event) =>
                form.setValue("send_total_amount", event.target.checked)
              }
              className="size-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
              data-testid="masm-send-total-amount-switch"
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
                <Input
                  {...field}
                  autoComplete="off"
                  disabled={!isEnabled || isSubmitting}
                />
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
                  disabled={!isEnabled || isSubmitting}
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
                <Input
                  {...field}
                  autoComplete="off"
                  disabled={!isEnabled || isSubmitting}
                />
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
                <Input
                  {...field}
                  autoComplete="off"
                  disabled={!isEnabled || isSubmitting}
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

type MasmPortalAutomationFormProps = {
  clinicId: number;
  credential: MasmPortalCredential | null;
  onUpdated: (credential: MasmPortalCredential) => void;
};

export function MasmPortalAutomationForm({
  clinicId,
  credential,
  onUpdated,
}: MasmPortalAutomationFormProps) {
  const { toast } = useToast();
  const form = useForm<PortalFormValues>({
    resolver: zodResolver(portalSchema),
    defaultValues: toPortalValues(credential),
  });

  useEffect(() => {
    form.reset(toPortalValues(credential));
  }, [form, credential]);

  async function handleSubmit(values: PortalFormValues) {
    try {
      const updatedCredential = await updateMasmPortalCredential(
        clinicId,
        values.portal_is_enabled
          ? {
              operator_email: values.operator_email.trim(),
              is_enabled: true,
              ...(values.portal_password?.trim()
                ? { password: values.portal_password.trim() }
                : {}),
            }
          : {
              is_enabled: false,
            },
      );

      onUpdated(updatedCredential);
      toast({
        variant: "success",
        title: "Portal automation saved",
        description: "Portal operator credentials were updated.",
      });
      form.reset({
        ...toPortalValues(updatedCredential),
        portal_password: "",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not save portal automation",
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
  const isPortalEnabled = form.watch("portal_is_enabled");

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="rounded-lg border border-brand-border bg-brand-surface/40 px-4 py-3 text-sm text-brand-muted">
          Operator login used by claims-engine to close submitted claims on the
          MASM portal so staff do not close drafts manually.
        </div>

        <label className="flex items-center justify-between gap-4 rounded-lg border border-brand-border bg-white px-4 py-3">
          <div>
            <p className="text-sm font-medium text-brand-navy">
              Portal automation enabled
            </p>
            <p className="text-xs text-brand-muted">
              Required for automatic close-after-submit.
            </p>
          </div>
          <input
            type="checkbox"
            checked={isPortalEnabled}
            disabled={isSubmitting}
            onChange={(event) =>
              form.setValue("portal_is_enabled", event.target.checked, {
                shouldValidate: true,
              })
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
                <Input
                  {...field}
                  autoComplete="off"
                  type="email"
                  disabled={!isPortalEnabled || isSubmitting}
                />
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
                  disabled={!isPortalEnabled || isSubmitting}
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

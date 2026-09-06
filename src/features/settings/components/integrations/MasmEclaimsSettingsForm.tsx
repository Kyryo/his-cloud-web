"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

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
  SettingsFieldRow,
  SettingsPreferenceToggle,
} from "@/features/settings/components/SettingsPageLayout";
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

  async function handleSubmit(values: IntegrationFormValues) {
    try {
      const updatedIntegration = await updateMasemPayerIntegration(
        clinicId,
        values.is_enabled
          ? {
              is_enabled: true,
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
  const isEnabled = useWatch({ control: form.control, name: "is_enabled" });
  const sendTotalAmount = useWatch({
    control: form.control,
    name: "send_total_amount",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <p className="text-sm text-slate-400">
          Credentials are clinic-scoped. Claim submit uses the MASM Integration
          API for this clinic.
        </p>

        <div className="mt-5 divide-y divide-brand-border">
          <SettingsPreferenceToggle
            label="Integration enabled"
            description="Allow claim submit via the MASM Integration API for this clinic."
            checked={isEnabled}
            disabled={isSubmitting}
            onChange={(checked) =>
              form.setValue("is_enabled", checked, { shouldValidate: true })
            }
          />
          <SettingsPreferenceToggle
            label="Send total amount to MASM"
            description="When off, only the payer due is submitted. When on, payer and client due are sent."
            checked={sendTotalAmount}
            disabled={!isEnabled || isSubmitting}
            onChange={(checked) => form.setValue("send_total_amount", checked)}
            testId="masm-send-total-amount-switch"
          />
        </div>

        <div className="mt-2">
          <FormField
            control={form.control}
            name="client_key"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <SettingsFieldRow label="Client key">
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      disabled={!isEnabled || isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </SettingsFieldRow>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="client_secret"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <SettingsFieldRow label="Client secret">
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
                </SettingsFieldRow>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sso_url"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <SettingsFieldRow label="SSO URL">
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      disabled={!isEnabled || isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </SettingsFieldRow>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="api_base_url"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <SettingsFieldRow label="API base URL">
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      disabled={!isEnabled || isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </SettingsFieldRow>
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="mt-5"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            "Save integration"
          )}
        </Button>
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
  const isPortalEnabled = useWatch({
    control: form.control,
    name: "portal_is_enabled",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <p className="text-sm text-slate-400">
          Operator login used to close submitted claims on the MASM portal so
          staff do not close drafts manually.
        </p>

        <div className="mt-5 divide-y divide-brand-border">
          <SettingsPreferenceToggle
            label="Portal automation enabled"
            description="Required for automatic close-after-submit."
            checked={isPortalEnabled}
            disabled={isSubmitting}
            onChange={(checked) =>
              form.setValue("portal_is_enabled", checked, {
                shouldValidate: true,
              })
            }
          />
        </div>

        <div className="mt-2">
          <FormField
            control={form.control}
            name="operator_email"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <SettingsFieldRow label="Operator email">
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      type="email"
                      disabled={!isPortalEnabled || isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </SettingsFieldRow>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="portal_password"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <SettingsFieldRow label="Password">
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
                </SettingsFieldRow>
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          variant="outline"
          size="sm"
          className="mt-5"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Saving...
            </>
          ) : (
            "Save portal"
          )}
        </Button>
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

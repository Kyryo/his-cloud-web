"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
} from "@/features/app-shell/components/page-layout";
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
  tenantEmailConfigurationQueryKey,
  useTenantEmailConfiguration,
} from "@/features/settings/hooks/use-tenant-email-configuration";
import {
  createEmailConfigurationDefaultValues,
  emailConfigurationSchema,
  validateEmailConfigurationPassword,
  type EmailConfigurationFormValues,
} from "@/features/settings/schemas/email-configuration.schema";
import {
  createTenantEmailConfiguration,
  updateTenantEmailConfiguration,
} from "@/features/settings/services/settings.service";
import type { TenantEmailConfiguration } from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage, mapBffErrorsToForm } from "@/lib/bff-field-errors";
import { useToast } from "@/providers/toast-provider";

function toFormValues(
  configuration: TenantEmailConfiguration,
): EmailConfigurationFormValues {
  return {
    is_active: configuration.is_active,
    appointment_emails_enabled: configuration.appointment_emails_enabled,
    sales_report_emails_enabled: configuration.sales_report_emails_enabled,
    smtp_host: configuration.smtp_host,
    smtp_port: configuration.smtp_port,
    smtp_username: configuration.smtp_username,
    smtp_password: "",
    use_tls: configuration.use_tls,
    use_ssl: configuration.use_ssl,
    timeout: configuration.timeout,
    sender_name: configuration.sender_name,
    from_email: configuration.from_email,
    reply_to: configuration.reply_to ?? "",
  };
}

function toPayload(values: EmailConfigurationFormValues, includePassword: boolean) {
  return {
    is_active: values.is_active,
    appointment_emails_enabled: values.appointment_emails_enabled,
    sales_report_emails_enabled: values.sales_report_emails_enabled,
    smtp_host: values.smtp_host.trim(),
    smtp_port: values.smtp_port,
    smtp_username: values.smtp_username.trim(),
    ...(includePassword ? { smtp_password: values.smtp_password } : {}),
    use_tls: values.use_tls,
    use_ssl: values.use_ssl,
    timeout: values.timeout,
    sender_name: values.sender_name.trim(),
    from_email: values.from_email.trim(),
    reply_to: values.reply_to.trim() || undefined,
  };
}

function CheckboxField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-brand-border bg-white px-4 py-3">
      <div>
        <p className="text-sm font-medium text-brand-navy">{label}</p>
        <p className="text-xs text-brand-muted">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary"
      />
    </div>
  );
}

type EmailSettingsTab = "smtp" | "delivery";

const EMAIL_SETTINGS_TABS: Array<{ id: EmailSettingsTab; label: string }> = [
  { id: "smtp", label: "SMTP server" },
  { id: "delivery", label: "Delivery" },
];

type EmailSettingsFormContentProps = {
  configuration: TenantEmailConfiguration | null;
};

function EmailSettingsFormContent({ configuration }: EmailSettingsFormContentProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<EmailSettingsTab>("smtp");

  const form = useForm<EmailConfigurationFormValues>({
    resolver: zodResolver(emailConfigurationSchema),
    defaultValues: configuration
      ? toFormValues(configuration)
      : createEmailConfigurationDefaultValues(),
  });

  const saveMutation = useMutation({
    mutationFn: async (values: EmailConfigurationFormValues) => {
      const includePassword =
        !configuration?.has_smtp_password || values.smtp_password.trim().length > 0;

      if (configuration) {
        return updateTenantEmailConfiguration(
          configuration.id,
          toPayload(values, includePassword),
        );
      }

      return createTenantEmailConfiguration(
        toPayload(values, true) as Parameters<typeof createTenantEmailConfiguration>[0],
      );
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(tenantEmailConfigurationQueryKey, saved);
      form.reset(toFormValues(saved));
      toast({
        variant: "success",
        title: configuration ? "Email settings updated" : "Email settings saved",
        description: configuration
          ? "SMTP configuration has been updated."
          : "Your organization can now send email through the configured SMTP server.",
      });
    },
    onError: (error) => {
      if (error instanceof BffError) {
        const fieldErrors = mapBffErrorsToForm(error.errors);
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in createEmailConfigurationDefaultValues()) {
            form.setError(field as keyof EmailConfigurationFormValues, { message });
          }
        }

        toast({
          variant: "error",
          title: "Could not save email settings",
          description: formatBffErrorMessage(error.message, error.errors),
        });
        return;
      }

      toast({
        variant: "error",
        title: "Could not save email settings",
        description: error instanceof Error ? error.message : "Try again.",
      });
    },
  });

  const handleSubmit = form.handleSubmit(
    (values) => {
      const passwordErrors = validateEmailConfigurationPassword(
        values,
        Boolean(configuration?.has_smtp_password),
      );

      for (const [field, message] of Object.entries(passwordErrors)) {
        form.setError(field as keyof EmailConfigurationFormValues, { message });
      }

      if (Object.keys(passwordErrors).length > 0) {
        setActiveTab("smtp");
        return;
      }

      saveMutation.mutate(values);
    },
    (errors) => {
      const deliveryFields = new Set([
        "is_active",
        "appointment_emails_enabled",
        "sales_report_emails_enabled",
      ]);
      const hasDeliveryErrors = Object.keys(errors).some((field) =>
        deliveryFields.has(field),
      );
      const hasSmtpErrors = Object.keys(errors).some(
        (field) => !deliveryFields.has(field),
      );

      if (hasSmtpErrors) {
        setActiveTab("smtp");
      } else if (hasDeliveryErrors) {
        setActiveTab("delivery");
      }
    },
  );

  const hasExistingPassword = Boolean(configuration?.has_smtp_password);
  const isSaving = saveMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={(event) => void handleSubmit(event)}>
        <DetailPageTabsNavSection aria-label="Email settings sections">
          {EMAIL_SETTINGS_TABS.map((tab) => (
            <DetailPageTabNavItem
              key={tab.id}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </DetailPageTabNavItem>
          ))}
        </DetailPageTabsNavSection>

        <div className="space-y-6 px-6 py-6">
          {activeTab === "delivery" ? (
            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-brand-navy">Delivery</h3>
                <p className="mt-1 text-sm text-brand-muted">
                  Control whether outbound email is enabled for your organization.
                </p>
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CheckboxField
                        label="Email delivery active"
                        description="Disable to stop sending email without removing SMTP settings."
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appointment_emails_enabled"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CheckboxField
                        label="Appointment emails"
                        description="Send confirmation, reschedule, and cancellation emails for appointments."
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sales_report_emails_enabled"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <CheckboxField
                        label="Sales report emails"
                        description="Send scheduled daily, weekly, and monthly sales summaries to users."
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </section>
          ) : (
            <>
              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-brand-navy">SMTP server</h3>
                  <p className="mt-1 text-sm text-brand-muted">
                    Connection details for your mail provider.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="smtp_host"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>SMTP host</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="smtp.example.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="smtp_port"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP port</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min={1} max={65535} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timeout (seconds)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min={1} max={300} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="smtp_username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP username</FormLabel>
                        <FormControl>
                          <Input {...field} autoComplete="off" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="smtp_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            autoComplete="new-password"
                            placeholder={
                              hasExistingPassword
                                ? "Leave blank to keep current password"
                                : "Enter SMTP password"
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="use_tls"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CheckboxField
                            label="Use STARTTLS"
                            description="Recommended for port 587."
                            checked={field.value}
                            onChange={(checked) => {
                              field.onChange(checked);
                              if (checked) {
                                form.setValue("use_ssl", false);
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="use_ssl"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <CheckboxField
                            label="Use SSL/TLS"
                            description="Typically used with port 465."
                            checked={field.value}
                            onChange={(checked) => {
                              field.onChange(checked);
                              if (checked) {
                                form.setValue("use_tls", false);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>

              <section className="space-y-4 border-t border-brand-border pt-6">
                <div>
                  <h3 className="text-sm font-semibold text-brand-navy">Sender details</h3>
                  <p className="mt-1 text-sm text-brand-muted">
                    How recipients see messages from your organization.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="sender_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sender name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Acme Health Clinic" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="from_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="no-reply@example.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reply_to"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Reply-to email (optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="support@example.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </section>
            </>
          )}

          <div className="flex justify-end border-t border-brand-border pt-5">
            <PrimaryButton type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : configuration ? (
                "Save changes"
              ) : (
                "Save email settings"
              )}
            </PrimaryButton>
          </div>
        </div>
      </form>
    </Form>
  );
}

export function EmailSettingsForm() {
  const configurationQuery = useTenantEmailConfiguration();

  if (configurationQuery.isLoading) {
    return (
      <div className="flex items-center gap-2 px-6 py-10 text-sm text-brand-muted">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading email settings...
      </div>
    );
  }

  if (configurationQuery.isError) {
    return (
      <p
        className="px-6 py-6 text-sm text-red-600"
        data-testid="email-settings-load-error"
      >
        {configurationQuery.error instanceof Error
          ? configurationQuery.error.message
          : "Unable to load email settings."}
      </p>
    );
  }

  return (
    <EmailSettingsFormContent
      key={configurationQuery.data?.id ?? "new"}
      configuration={configurationQuery.data ?? null}
    />
  );
}

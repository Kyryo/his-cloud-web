import { z } from "zod";

const optionalReplyToSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.string().email().safeParse(value).success,
    "Enter a valid reply-to email address.",
  );

function addTlsSslValidation<T extends { use_tls?: boolean; use_ssl?: boolean }>(
  values: T,
  context: z.RefinementCtx,
) {
  if (values.use_tls && values.use_ssl) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enable either TLS or SSL, not both.",
      path: ["use_ssl"],
    });
  }
}

const emailConfigurationFieldsSchema = z.object({
  is_active: z.boolean(),
  appointment_emails_enabled: z.boolean(),
  sales_report_emails_enabled: z.boolean(),
  smtp_host: z.string().trim().min(1, "SMTP host is required."),
  smtp_port: z.coerce
    .number({ invalid_type_error: "SMTP port is required." })
    .int("SMTP port must be a whole number.")
    .min(1, "SMTP port is required.")
    .max(65535, "Enter a valid port number."),
  smtp_username: z.string().trim().min(1, "SMTP username is required."),
  smtp_password: z.string(),
  use_tls: z.boolean(),
  use_ssl: z.boolean(),
  timeout: z.coerce
    .number({ invalid_type_error: "Timeout is required." })
    .int("Timeout must be a whole number.")
    .min(1, "Timeout must be at least 1 second.")
    .max(300, "Timeout cannot exceed 300 seconds."),
  sender_name: z.string().trim().min(1, "Sender name is required."),
  from_email: z
    .string()
    .trim()
    .min(1, "From email is required.")
    .email("Enter a valid from email address."),
  reply_to: optionalReplyToSchema,
});

export const emailConfigurationSchema = emailConfigurationFieldsSchema.superRefine(
  addTlsSslValidation,
);

export type EmailConfigurationFormValues = z.infer<typeof emailConfigurationSchema>;

export const createTenantEmailConfigurationBodySchema = z
  .object({
    is_active: z.boolean().optional().default(true),
    appointment_emails_enabled: z.boolean().optional().default(false),
    sales_report_emails_enabled: z.boolean().optional().default(false),
    smtp_host: z.string().trim().min(1, "SMTP host is required."),
    smtp_port: z.coerce
      .number({ invalid_type_error: "SMTP port is required." })
      .int("SMTP port must be a whole number.")
      .min(1, "SMTP port is required.")
      .max(65535, "Enter a valid port number."),
    smtp_username: z.string().trim().min(1, "SMTP username is required."),
    smtp_password: z.string().min(1, "SMTP password is required."),
    use_tls: z.boolean().optional().default(true),
    use_ssl: z.boolean().optional().default(false),
    timeout: z.coerce
      .number({ invalid_type_error: "Timeout is required." })
      .int("Timeout must be a whole number.")
      .min(1, "Timeout must be at least 1 second.")
      .max(300, "Timeout cannot exceed 300 seconds.")
      .optional()
      .default(10),
    sender_name: z.string().trim().min(1, "Sender name is required."),
    from_email: z
      .string()
      .trim()
      .min(1, "From email is required.")
      .email("Enter a valid from email address."),
    reply_to: optionalReplyToSchema.optional(),
  })
  .superRefine(addTlsSslValidation);

export const updateTenantEmailConfigurationBodySchema = z
  .object({
    is_active: z.boolean().optional(),
    appointment_emails_enabled: z.boolean().optional(),
    sales_report_emails_enabled: z.boolean().optional(),
    smtp_host: z.string().trim().min(1, "SMTP host is required.").optional(),
    smtp_port: z.coerce
      .number({ invalid_type_error: "SMTP port is required." })
      .int("SMTP port must be a whole number.")
      .min(1, "SMTP port is required.")
      .max(65535, "Enter a valid port number.")
      .optional(),
    smtp_username: z.string().trim().min(1, "SMTP username is required.").optional(),
    smtp_password: z.string().optional(),
    use_tls: z.boolean().optional(),
    use_ssl: z.boolean().optional(),
    timeout: z.coerce
      .number({ invalid_type_error: "Timeout is required." })
      .int("Timeout must be a whole number.")
      .min(1, "Timeout must be at least 1 second.")
      .max(300, "Timeout cannot exceed 300 seconds.")
      .optional(),
    sender_name: z.string().trim().min(1, "Sender name is required.").optional(),
    from_email: z
      .string()
      .trim()
      .min(1, "From email is required.")
      .email("Enter a valid from email address.")
      .optional(),
    reply_to: optionalReplyToSchema.optional(),
  })
  .superRefine((values, context) => {
    addTlsSslValidation(values, context);

    if (Object.keys(values).length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one field is required.",
      });
    }
  });

export type CreateTenantEmailConfigurationBody = z.infer<
  typeof createTenantEmailConfigurationBodySchema
>;

export type UpdateTenantEmailConfigurationBody = z.infer<
  typeof updateTenantEmailConfigurationBodySchema
>;

export function createEmailConfigurationDefaultValues(): EmailConfigurationFormValues {
  return {
    is_active: true,
    appointment_emails_enabled: false,
    sales_report_emails_enabled: false,
    smtp_host: "",
    smtp_port: 587,
    smtp_username: "",
    smtp_password: "",
    use_tls: true,
    use_ssl: false,
    timeout: 10,
    sender_name: "",
    from_email: "",
    reply_to: "",
  };
}

export function validateEmailConfigurationPassword(
  values: EmailConfigurationFormValues,
  hasExistingPassword: boolean,
): Partial<Record<keyof EmailConfigurationFormValues, string>> {
  if (hasExistingPassword && !values.smtp_password.trim()) {
    return {};
  }

  if (!values.smtp_password.trim()) {
    return { smtp_password: "SMTP password is required." };
  }

  return {};
}

import { describe, expect, it } from "vitest";

import {
  createEmailConfigurationDefaultValues,
  emailConfigurationSchema,
  validateEmailConfigurationPassword,
} from "@/features/settings/schemas/email-configuration.schema";

describe("emailConfigurationSchema", () => {
  it("accepts valid SMTP settings", () => {
    const result = emailConfigurationSchema.safeParse({
      ...createEmailConfigurationDefaultValues(),
      smtp_host: "smtp.example.com",
      smtp_username: "smtp-user",
      smtp_password: "secret",
      sender_name: "Acme Clinic",
      from_email: "no-reply@example.com",
    });

    expect(result.success).toBe(true);
  });

  it("rejects enabling TLS and SSL together", () => {
    const result = emailConfigurationSchema.safeParse({
      ...createEmailConfigurationDefaultValues(),
      smtp_host: "smtp.example.com",
      smtp_username: "smtp-user",
      smtp_password: "secret",
      sender_name: "Acme Clinic",
      from_email: "no-reply@example.com",
      use_tls: true,
      use_ssl: true,
    });

    expect(result.success).toBe(false);
  });

  it("requires password on first setup", () => {
    const errors = validateEmailConfigurationPassword(
      {
        ...createEmailConfigurationDefaultValues(),
        smtp_password: "",
      },
      false,
    );

    expect(errors.smtp_password).toBe("SMTP password is required.");
  });

  it("allows blank password when one is already stored", () => {
    const errors = validateEmailConfigurationPassword(
      {
        ...createEmailConfigurationDefaultValues(),
        smtp_password: "",
      },
      true,
    );

    expect(errors).toEqual({});
  });
});

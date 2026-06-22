import { z } from "zod";

export const platformAdminTenantSchema = z.object({
  name: z.string().trim().min(1, "Tenant name is required."),
  code: z
    .string()
    .trim()
    .min(1, "Tenant code is required.")
    .regex(/^[A-Z0-9_-]+$/, "Use uppercase letters, numbers, _ or -."),
  description: z.string().trim(),
  email: z.string().trim().email("Use a valid email.").or(z.literal("")),
  phone: z.string().trim(),
  address: z.string().trim(),
  city: z.string().trim(),
  state_province: z.string().trim(),
  country: z.string().trim(),
  postal_code: z.string().trim(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]),
  is_active: z.boolean(),
  currency_code: z.string().trim().min(1, "Currency is required."),
});

export type PlatformAdminTenantFormValues = z.infer<
  typeof platformAdminTenantSchema
>;

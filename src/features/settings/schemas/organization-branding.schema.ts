import { z } from "zod";

const colorField = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value),
    "Enter a valid hex color",
  );

export const organizationBrandingSchema = z.object({
  branding_logo_url: z.string().trim(),
  branding_primary_color: colorField,
  branding_secondary_color: colorField,
  branding_accent_color: colorField,
});

export type OrganizationBrandingFormValues = z.infer<
  typeof organizationBrandingSchema
>;

import { z } from "zod";

export const updateOrganizationClinicSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export type UpdateOrganizationClinicFormValues = z.infer<
  typeof updateOrganizationClinicSchema
>;

export const createOrganizationClinicSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .regex(
      /^[A-Z0-9_-]+$/i,
      "Code must contain only letters, numbers, underscores, and hyphens",
    ),
});

export type CreateOrganizationClinicFormValues = z.infer<
  typeof createOrganizationClinicSchema
>;

export const createOrganizationClinicDefaultValues: CreateOrganizationClinicFormValues =
  {
    name: "",
    code: "",
  };

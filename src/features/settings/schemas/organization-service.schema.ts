import { z } from "zod";

export const createOrganizationServiceSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().trim().optional(),
  description: z.string().trim().optional(),
  is_consultation_visit: z.boolean().optional(),
  is_dentist_visit: z.boolean().optional(),
  is_walk_in_visit: z.boolean().optional(),
});

export type CreateOrganizationServiceFormValues = z.infer<
  typeof createOrganizationServiceSchema
>;

export const createOrganizationServiceDefaultValues: CreateOrganizationServiceFormValues =
  {
    name: "",
    code: "",
    description: "",
    is_consultation_visit: false,
    is_dentist_visit: false,
    is_walk_in_visit: false,
  };

export function toCreateOrganizationServicePayload(
  values: CreateOrganizationServiceFormValues,
) {
  return {
    name: values.name.trim(),
    code: values.code?.trim() || "",
    description: values.description?.trim() || "",
    is_consultation_visit: values.is_consultation_visit ?? false,
    is_dentist_visit: values.is_dentist_visit ?? false,
    is_walk_in_visit: values.is_walk_in_visit ?? false,
  };
}

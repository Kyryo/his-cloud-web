import { z } from "zod";

export const createOrganizationLocationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().trim().min(1, "Code is required"),
  clinic: z.string().min(1, "Clinic is required"),
  description: z.string().trim().optional(),
});

export type CreateOrganizationLocationFormValues = z.infer<
  typeof createOrganizationLocationSchema
>;

export const createOrganizationLocationDefaultValues: CreateOrganizationLocationFormValues =
  {
    name: "",
    code: "",
    clinic: "",
    description: "",
  };

export function toCreateOrganizationLocationPayload(
  values: CreateOrganizationLocationFormValues,
) {
  return {
    name: values.name.trim(),
    code: values.code.trim(),
    clinic: Number(values.clinic),
    description: values.description?.trim() || "",
  };
}

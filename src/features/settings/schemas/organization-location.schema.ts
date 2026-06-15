import { z } from "zod";

export const createOrganizationLocationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().trim().min(1, "Code is required"),
  clinic: z.string().min(1, "Clinic is required"),
  department: z.string().min(1, "Department is required"),
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
    department: "",
    description: "",
  };

export function toCreateOrganizationLocationPayload(
  values: CreateOrganizationLocationFormValues,
) {
  return {
    name: values.name.trim(),
    code: values.code.trim(),
    clinic: Number(values.clinic),
    department: Number(values.department),
    description: values.description?.trim() || "",
  };
}

export const updateOrganizationLocationSchema = createOrganizationLocationSchema;

export type UpdateOrganizationLocationFormValues = CreateOrganizationLocationFormValues;

export function toUpdateOrganizationLocationFormValues(
  location: {
    name: string;
    code: string;
    clinic: number;
    department: number;
    description?: string | null;
  },
): UpdateOrganizationLocationFormValues {
  return {
    name: location.name,
    code: location.code,
    clinic: String(location.clinic),
    department: String(location.department),
    description: location.description ?? "",
  };
}

export function toUpdateOrganizationLocationPayload(
  values: UpdateOrganizationLocationFormValues,
) {
  return toCreateOrganizationLocationPayload(values);
}

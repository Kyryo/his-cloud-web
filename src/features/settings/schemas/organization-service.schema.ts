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

export const updateOrganizationServiceSchema = createOrganizationServiceSchema;

export type UpdateOrganizationServiceFormValues = CreateOrganizationServiceFormValues;

export function toUpdateOrganizationServiceFormValues(
  service: OrganizationServiceLike,
): UpdateOrganizationServiceFormValues {
  return {
    name: service.name,
    code: service.code ?? "",
    description: service.description ?? "",
    is_consultation_visit: service.is_consultation_visit,
    is_dentist_visit: service.is_dentist_visit,
    is_walk_in_visit: service.is_walk_in_visit,
  };
}

export function toUpdateOrganizationServicePayload(
  values: UpdateOrganizationServiceFormValues,
) {
  return toCreateOrganizationServicePayload(values);
}

type OrganizationServiceLike = {
  name: string;
  code: string;
  description: string;
  is_consultation_visit: boolean;
  is_dentist_visit: boolean;
  is_walk_in_visit: boolean;
};

import { z } from "zod";

export const createOrganizationServiceSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().trim().optional(),
  description: z.string().trim().optional(),
  is_chargable: z.boolean(),
});

export type CreateOrganizationServiceFormValues = z.infer<
  typeof createOrganizationServiceSchema
>;

export const createOrganizationServiceDefaultValues: CreateOrganizationServiceFormValues =
  {
    name: "",
    code: "",
    description: "",
    is_chargable: true,
  };

export function toCreateOrganizationServicePayload(
  values: CreateOrganizationServiceFormValues,
) {
  return {
    name: values.name.trim(),
    code: values.code?.trim() || "",
    description: values.description?.trim() || "",
    is_chargable: values.is_chargable,
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
    is_chargable: service.is_chargable,
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
  is_chargable: boolean;
};

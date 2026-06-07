import { z } from "zod";

export const createOrganizationPayerSchemeSchema = z.object({
  insurance_company: z.string().min(1, "Payer is required"),
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().trim().min(1, "Code is required"),
  description: z.string().trim().optional(),
});

export type CreateOrganizationPayerSchemeFormValues = z.infer<
  typeof createOrganizationPayerSchemeSchema
>;

export const createOrganizationPayerSchemeDefaultValues: CreateOrganizationPayerSchemeFormValues =
  {
    insurance_company: "",
    name: "",
    code: "",
    description: "",
  };

export function toCreateOrganizationPayerSchemePayload(
  values: CreateOrganizationPayerSchemeFormValues,
) {
  return {
    insurance_company: Number(values.insurance_company),
    name: values.name.trim(),
    code: values.code.trim(),
    description: values.description?.trim() || "",
  };
}

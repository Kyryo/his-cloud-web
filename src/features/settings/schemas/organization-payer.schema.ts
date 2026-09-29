import { z } from "zod";

export const createOrganizationPayerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().trim().min(1, "Code is required"),
  description: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      "Enter a valid email address",
    ),
  phone_number: z.string().trim().optional(),
  address: z.string().trim().optional(),
  registry_payer: z.number().int().positive().nullable().optional(),
});

export type CreateOrganizationPayerFormValues = z.infer<
  typeof createOrganizationPayerSchema
>;

export const createOrganizationPayerDefaultValues: CreateOrganizationPayerFormValues =
  {
    name: "",
    code: "",
    description: "",
    email: "",
    phone_number: "",
    address: "",
    registry_payer: null,
  };

export function toCreateOrganizationPayerPayload(
  values: CreateOrganizationPayerFormValues,
) {
  return {
    name: values.name.trim(),
    code: values.code.trim(),
    description: values.description?.trim() || "",
    email: values.email?.trim() || "",
    phone_number: values.phone_number?.trim() || "",
    address: values.address?.trim() || "",
    registry_payer: values.registry_payer ?? null,
  };
}

export const proposeCountryPayerSchema = z.object({
  code: z.string().trim().min(1, "Code is required"),
  official_name: z.string().trim().min(1, "Official name is required"),
  display_name: z.string().trim().optional(),
});

export type ProposeCountryPayerFormValues = z.infer<
  typeof proposeCountryPayerSchema
>;

export const proposeCountryPayerDefaultValues: ProposeCountryPayerFormValues = {
  code: "",
  official_name: "",
  display_name: "",
};

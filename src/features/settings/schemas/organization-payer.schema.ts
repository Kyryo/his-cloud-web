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
  };
}

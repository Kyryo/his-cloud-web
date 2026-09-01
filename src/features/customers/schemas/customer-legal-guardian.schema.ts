import { z } from "zod";

import type {
  CustomerLegalGuardian,
  CustomerLegalGuardianRelationship,
} from "@/features/customers/types/customer-legal-guardian.types";

const relationshipSchema = z.enum([
  "PARENT",
  "SPOUSE",
  "SIBLING",
  "GRANDPARENT",
  "OTHER",
]) satisfies z.ZodType<CustomerLegalGuardianRelationship>;

export const createCustomerLegalGuardianSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required."),
  relationship: relationshipSchema,
  phone_number: z.string().trim(),
  email: z
    .string()
    .trim()
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Enter a valid email address.",
    }),
  national_id: z.string().trim(),
  is_primary: z.boolean(),
  notes: z.string().trim(),
  is_active: z.boolean(),
});

export type CreateCustomerLegalGuardianFormValues = z.infer<
  typeof createCustomerLegalGuardianSchema
>;

export const createCustomerLegalGuardianDefaultValues: CreateCustomerLegalGuardianFormValues =
  {
    full_name: "",
    relationship: "PARENT",
    phone_number: "",
    email: "",
    national_id: "",
    is_primary: false,
    notes: "",
    is_active: true,
  };

export function toCustomerLegalGuardianPayload(
  customerId: number,
  values: CreateCustomerLegalGuardianFormValues,
) {
  return {
    customer: customerId,
    full_name: values.full_name.trim(),
    relationship: values.relationship,
    phone_number: values.phone_number.trim(),
    email: values.email.trim(),
    national_id: values.national_id.trim(),
    is_primary: values.is_primary,
    notes: values.notes.trim(),
    is_active: values.is_active,
  };
}

export function toUpdateCustomerLegalGuardianFormValues(
  guardian: CustomerLegalGuardian,
): CreateCustomerLegalGuardianFormValues {
  return {
    full_name: guardian.full_name,
    relationship: guardian.relationship,
    phone_number: guardian.phone_number ?? "",
    email: guardian.email ?? "",
    national_id: guardian.national_id ?? "",
    is_primary: guardian.is_primary,
    notes: guardian.notes ?? "",
    is_active: guardian.is_active,
  };
}

export function toUpdateCustomerLegalGuardianPayload(
  values: CreateCustomerLegalGuardianFormValues,
) {
  const { customer: _customer, ...payload } = toCustomerLegalGuardianPayload(
    0,
    values,
  );
  return payload;
}

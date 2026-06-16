import { z } from "zod";

import type { CustomerInsurance } from "@/features/customers/types/customer-insurance.types";
import { PRINCIPAL_MEMBER_RELATIONSHIPS } from "@/features/customers/types/customer-insurance.types";

export const createCustomerInsuranceSchema = z
  .object({
    insurance_scheme: z
      .number({ invalid_type_error: "Select an insurance scheme." })
      .int()
      .positive("Select an insurance scheme."),
    membership_number: z
      .string()
      .trim()
      .min(1, "Membership number is required."),
    suffix: z.string().trim().optional().or(z.literal("")),
    is_principal_member: z.boolean(),
    principal_member_name: z.string().trim(),
    relationship_to_principal_member: z
      .string()
      .trim()
      .refine(
        (value) =>
          value === "" ||
          PRINCIPAL_MEMBER_RELATIONSHIPS.includes(
            value as (typeof PRINCIPAL_MEMBER_RELATIONSHIPS)[number],
          ),
        "Select a valid relationship.",
      ),
    date_joined: z.string().optional().or(z.literal("")),
    date_joined_not_available: z.boolean(),
    is_primary: z.boolean(),
    is_active: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (!values.is_principal_member && !values.principal_member_name.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["principal_member_name"],
        message: "Principal member name is required.",
      });
    }

    if (
      !values.is_principal_member &&
      !values.relationship_to_principal_member
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["relationship_to_principal_member"],
        message: "Relationship to principal member is required.",
      });
    }

    if (
      !values.is_principal_member &&
      values.relationship_to_principal_member === "Self"
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["relationship_to_principal_member"],
        message: "A dependent's relationship cannot be Self.",
      });
    }

    if (!values.date_joined_not_available && values.date_joined) {
      const parsed = new Date(`${values.date_joined}T00:00:00`);
      if (Number.isNaN(parsed.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["date_joined"],
          message: "Enter a valid date joined.",
        });
        return;
      }

      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (parsed > today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["date_joined"],
          message: "Date joined cannot be in the future.",
        });
      }
    }
  });

export type CreateCustomerInsuranceFormValues = z.infer<
  typeof createCustomerInsuranceSchema
>;

function getCurrentDate() {
  return new Date().toISOString().split("T")[0];
}

export const createCustomerInsuranceDefaultValues: CreateCustomerInsuranceFormValues =
  {
    insurance_scheme: 0,
    membership_number: "",
    suffix: "",
    is_principal_member: false,
    principal_member_name: "",
    relationship_to_principal_member: "",
    date_joined: getCurrentDate(),
    date_joined_not_available: false,
    is_primary: false,
    is_active: true,
  };

export function toCustomerInsurancePayload(
  values: CreateCustomerInsuranceFormValues,
) {
  const payload: {
    insurance_scheme: number;
    membership_number: string;
    suffix: string;
    is_principal_member: boolean;
    principal_member_name?: string;
    relationship_to_principal_member?: string;
    is_primary: boolean;
    is_active: boolean;
    date_joined?: string;
  } = {
    insurance_scheme: values.insurance_scheme,
    membership_number: values.membership_number.trim(),
    suffix: values.suffix.trim(),
    is_principal_member: values.is_principal_member,
    principal_member_name: values.principal_member_name.trim(),
    relationship_to_principal_member:
      values.relationship_to_principal_member.trim(),
    is_primary: values.is_primary,
    is_active: values.is_active,
  };

  if (!values.date_joined_not_available && values.date_joined?.trim()) {
    payload.date_joined = values.date_joined.trim();
  }

  return payload;
}

export function toUpdateCustomerInsuranceFormValues(
  insurance: CustomerInsurance,
): CreateCustomerInsuranceFormValues {
  return {
    insurance_scheme: insurance.insurance_scheme,
    membership_number: insurance.membership_number,
    suffix: insurance.suffix,
    is_principal_member: insurance.is_principal_member,
    principal_member_name: insurance.principal_member_name ?? "",
    relationship_to_principal_member:
      insurance.relationship_to_principal_member ?? "",
    date_joined: insurance.date_joined ?? "",
    date_joined_not_available: !insurance.date_joined,
    is_primary: insurance.is_primary,
    is_active: insurance.is_active,
  };
}

export function applyPrincipalMemberDefaults(
  values: CreateCustomerInsuranceFormValues,
  customerFullName: string,
  checked: boolean,
): CreateCustomerInsuranceFormValues {
  if (checked) {
    return {
      ...values,
      is_principal_member: true,
      principal_member_name: customerFullName,
      relationship_to_principal_member: "Self",
    };
  }

  return {
    ...values,
    is_principal_member: false,
    principal_member_name: "",
    relationship_to_principal_member: "",
  };
}

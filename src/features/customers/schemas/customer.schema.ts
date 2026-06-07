import { z } from "zod";

import type { Customer } from "@/features/customers/types/customer.types";

const namePattern = /^[a-zA-Z\s\-']+$/;
const lastNamePattern = /^[a-zA-Z\-']+$/;

export const customerGenderSchema = z.enum(["Male", "Female", "Other"]);

export const createCustomerSchema = z
  .object({
    first_name: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters.")
      .max(50, "First name cannot exceed 50 characters.")
      .regex(namePattern, "First name contains invalid characters."),
    middle_name: z
      .string()
      .trim()
      .max(50, "Middle name cannot exceed 50 characters.")
      .refine(
        (value) => value === "" || namePattern.test(value),
        "Middle name contains invalid characters.",
      ),
    last_name: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters.")
      .max(50, "Last name cannot exceed 50 characters.")
      .regex(lastNamePattern, "Last name contains invalid characters.")
      .refine((value) => !value.includes(" "), "Last name cannot contain spaces."),
    gender: customerGenderSchema,
    dob: z.string().optional().or(z.literal("")),
    dob_is_estimated: z.boolean(),
    phone_number: z.string().trim().max(32).optional().or(z.literal("")),
    email: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || z.string().email().safeParse(value).success,
        "Enter a valid email address.",
      ),
  })
  .superRefine((values, ctx) => {
    if (values.dob) {
      const parsed = new Date(`${values.dob}T00:00:00`);
      if (Number.isNaN(parsed.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dob"],
          message: "Enter a valid date of birth.",
        });
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsed > today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dob"],
          message: "Date of birth cannot be in the future.",
        });
      }
    }

    if (
      values.first_name &&
      values.last_name &&
      values.first_name.toLowerCase() === values.last_name.toLowerCase()
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["last_name"],
        message: "First name and last name cannot be identical.",
      });
    }
  });

export type CreateCustomerFormValues = z.infer<typeof createCustomerSchema>;

export function toCustomerWritePayload(values: CreateCustomerFormValues) {
  return {
    first_name: values.first_name.trim(),
    middle_name: values.middle_name?.trim() || "",
    last_name: values.last_name.trim(),
    gender: values.gender,
    dob: values.dob?.trim() || undefined,
    dob_is_estimated: values.dob_is_estimated,
    phone_number: values.phone_number?.trim() || "",
    email: values.email?.trim() || "",
  };
}

/** @deprecated Use {@link toCustomerWritePayload} */
export const toCreateCustomerPayload = toCustomerWritePayload;

export function toUpdateCustomerFormValues(
  customer: Pick<
    Customer,
    | "first_name"
    | "middle_name"
    | "last_name"
    | "gender"
    | "dob"
    | "dob_is_estimated"
    | "phone_number"
    | "email"
  >,
): CreateCustomerFormValues {
  return {
    first_name: customer.first_name ?? "",
    middle_name: customer.middle_name ?? "",
    last_name: customer.last_name ?? "",
    gender:
      customer.gender === "Male" ||
      customer.gender === "Female" ||
      customer.gender === "Other"
        ? customer.gender
        : "Male",
    dob: customer.dob ?? "",
    dob_is_estimated: customer.dob_is_estimated ?? false,
    phone_number: customer.phone_number ?? "",
    email: customer.email ?? "",
  };
}

export const createCustomerDefaultValues: CreateCustomerFormValues = {
  first_name: "",
  middle_name: "",
  last_name: "",
  gender: "Male",
  dob: "",
  dob_is_estimated: false,
  phone_number: "",
  email: "",
};

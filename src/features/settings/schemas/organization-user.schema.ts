import { z } from "zod";

import type { OrganizationUserRole } from "@/features/settings/types/settings.types";

export const ORGANIZATION_USER_ROLE_OPTIONS: Array<{
  value: OrganizationUserRole;
  label: string;
}> = [
  { value: "", label: "Unassigned" },
  { value: "nurse", label: "Nurse" },
  { value: "physician", label: "Physician" },
  { value: "pharmacist", label: "Pharmacist" },
  { value: "billing", label: "Billing" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "admin", label: "Admin" },
  { value: "other", label: "Other" },
];

export const ASSOCIATION_ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "staff", label: "Staff" },
  { value: "viewer", label: "Viewer" },
] as const;

export const createOrganizationUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const updateOrganizationUserGeneralSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || value.length >= 8,
      "Password must be at least 8 characters",
    ),
  is_admin: z.boolean(),
});

export const updateOrganizationUserRoleSchema = z.object({
  user_role: z.enum([
    "",
    "nurse",
    "physician",
    "pharmacist",
    "billing",
    "housekeeping",
    "admin",
    "other",
  ]),
});

export const updateOrganizationUserSchema = updateOrganizationUserGeneralSchema;

export type CreateOrganizationUserFormValues = z.infer<
  typeof createOrganizationUserSchema
>;

export type UpdateOrganizationUserFormValues = z.infer<
  typeof updateOrganizationUserSchema
>;

export type UpdateOrganizationUserGeneralFormValues = z.infer<
  typeof updateOrganizationUserGeneralSchema
>;

export type UpdateOrganizationUserRoleFormValues = z.infer<
  typeof updateOrganizationUserRoleSchema
>;

export const createOrganizationUserDefaultValues: CreateOrganizationUserFormValues =
  {
    name: "",
    email: "",
    password: "",
  };

export function toCreateOrganizationUserPayload(
  values: CreateOrganizationUserFormValues,
) {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    password: values.password,
  };
}

export function toUpdateOrganizationUserPayload(
  values: UpdateOrganizationUserFormValues,
) {
  const payload: {
    name: string;
    email: string;
    password?: string;
    is_admin?: boolean;
  } = {
    name: values.name.trim(),
    email: values.email.trim(),
    is_admin: values.is_admin,
  };

  if (values.password.trim()) {
    payload.password = values.password.trim();
  }

  return payload;
}

export function toUpdateOrganizationUserRolePayload(
  values: UpdateOrganizationUserRoleFormValues,
) {
  return {
    user_role: values.user_role,
  };
}

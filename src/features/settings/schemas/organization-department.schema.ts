import { z } from "zod";

const departmentCodePattern = /^[A-Z0-9_-]+$/;

export const createOrganizationDepartmentSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .transform((value) => value.toUpperCase())
    .refine((value) => departmentCodePattern.test(value), {
      message: "Use uppercase letters, numbers, underscores, or hyphens",
    }),
  clinic: z.string().min(1, "Clinic is required"),
  department_type: z.string().min(1, "Department type is required"),
  description: z.string().trim().optional(),
  requires_appointment: z.boolean(),
  walk_in_allowed: z.boolean(),
  default_appointment_duration_minutes: z.coerce
    .number()
    .int()
    .min(5, "Duration must be at least 5 minutes")
    .max(480, "Duration must be 8 hours or less"),
});

export type CreateOrganizationDepartmentFormValues = z.infer<
  typeof createOrganizationDepartmentSchema
>;

export const createOrganizationDepartmentDefaultValues: CreateOrganizationDepartmentFormValues =
  {
    name: "",
    code: "",
    clinic: "",
    department_type: "opd",
    description: "",
    requires_appointment: false,
    walk_in_allowed: true,
    default_appointment_duration_minutes: 30,
  };

export function toCreateOrganizationDepartmentPayload(
  values: CreateOrganizationDepartmentFormValues,
) {
  return {
    name: values.name.trim(),
    code: values.code.trim().toUpperCase(),
    clinic: Number(values.clinic),
    department_type: values.department_type,
    description: values.description?.trim() || "",
    status: "ACTIVE",
    is_active: true,
    requires_appointment: values.requires_appointment,
    walk_in_allowed: values.walk_in_allowed,
    default_appointment_duration_minutes: values.default_appointment_duration_minutes,
  };
}

export const updateOrganizationDepartmentSchema = createOrganizationDepartmentSchema;

export type UpdateOrganizationDepartmentFormValues =
  CreateOrganizationDepartmentFormValues;

export function toUpdateOrganizationDepartmentFormValues(
  department: {
    name: string;
    code: string;
    clinic: number;
    department_type: string;
    description?: string | null;
    requires_appointment: boolean;
    walk_in_allowed: boolean;
    default_appointment_duration_minutes: number;
  },
): UpdateOrganizationDepartmentFormValues {
  return {
    name: department.name,
    code: department.code,
    clinic: String(department.clinic),
    department_type: department.department_type,
    description: department.description ?? "",
    requires_appointment: department.requires_appointment,
    walk_in_allowed: department.walk_in_allowed,
    default_appointment_duration_minutes:
      department.default_appointment_duration_minutes,
  };
}

export function toUpdateOrganizationDepartmentPayload(
  values: UpdateOrganizationDepartmentFormValues,
) {
  return toCreateOrganizationDepartmentPayload(values);
}
